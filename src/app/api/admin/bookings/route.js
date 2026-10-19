import { NextResponse } from 'next/server';
import { getAdminPayload, getMarshalPayload, getClientIp } from '@/lib/authConfig';
import { checkRateLimit, isIpBlocked } from '@/lib/redis';
import { validateBookingPayload, sanitizePhone } from '@/lib/validation';
import { getStoredBookings, saveStoredBookings, addServerBooking, updateServerBooking, deleteServerBooking } from '@/lib/serverBookingStore';
import { recordWalMutation, recordAuditEvent, logCrash } from '@/lib/auditLedger';
import { sanitizeBookingsForRole } from '@/lib/rbac';
import { sanitizeLogOutput } from '@/lib/dlpSanitizer';

// Unique, collision-free human readable booking ID generator
export function generateBookingId() {
    const timestampPart = Date.now().toString(36).toUpperCase();
    const entropyPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK-${timestampPart}-${entropyPart}`;
}

// Status values allowed to be written by the admin panel & field marshals
const ALLOWED_STATUSES = ['Pending', 'Confirmed', 'Checked In', 'Cancelled', 'Refunded', 'Payment Pending', 'Expired'];

// Fields an admin/marshal may update via PATCH (strict whitelist)
const PATCHABLE_FIELDS = [
    'status',
    'notes',
    'roomType',
    'dates',
    'guests',
    'allocatedUnit',
    'checkedInCount',
    'shortCount',
    'checkInAt',
    'marshalName',
    'marshalNotes',
    'convoyTime'
];

// Helper to check if a booking matches an assigned campsite scope
export function isBookingInCampScope(booking, campId) {
    if (!campId || campId === 'all') return true;
    const target = campId.toLowerCase().trim();
    const bCampId = (booking.campsiteId || booking.packageId || '').toLowerCase().trim();
    const bPkg = (booking.package || '').toLowerCase().trim();

    if (bCampId && bCampId === target) return true;
    if (bPkg && bPkg.includes(target)) return true;

    // Cross-match friendly package names
    if (target.includes('kolukkumalai') && bPkg.includes('kolukkumalai')) return true;
    if (target.includes('suryanelli') && bPkg.includes('suryanelli')) return true;
    if (target.includes('meesapulimala') && bPkg.includes('meesapulimala')) return true;
    if (target.includes('phantom') && (bPkg.includes('phantom') || bPkg.includes('ridge'))) return true;
    if (target.includes('vagamon') && bPkg.includes('vagamon')) return true;
    if (target.includes('wayanad') && bPkg.includes('wayanad')) return true;

    return false;
}

// Validate and safely normalize a single booking record without dropping valid records
function normalizeRecord(body) {
    if (!body || typeof body !== 'object') return null;

    const name = String(body.name || 'Camper').trim();
    const rawPhone = String(body.phone || '').trim();
    const guests = Math.max(1, Number(body.guests) || 1);
    const total = Math.max(0, Number(body.total) || 0);
    const status = String(body.status || 'Confirmed').trim();

    return {
        id: body.id || generateBookingId(),
        name: name || 'Camper',
        phone: rawPhone || 'N/A',
        email: String(body.email || 'N/A').slice(0, 120),
        campsiteId: String(body.campsiteId || body.packageId || '').slice(0, 100),
        package: String(body.package || 'Wilderness Glamping').slice(0, 200),
        region: String(body.region || 'Munnar').slice(0, 100),
        dates: String(body.dates || 'Flexible / Upcoming Weekend').slice(0, 100),
        guests,
        groupType: String(body.groupType || 'Family').slice(0, 50),
        allocatedUnit: String(body.allocatedUnit || 'Tent #01').slice(0, 50),
        roomType: String(body.roomType || 'Standard Glamping').slice(0, 100),
        addons: Array.isArray(body.addons) ? body.addons.filter(a => typeof a === 'string').slice(0, 20) : [],
        total,
        paidAmount: body.paidAmount != null ? Number(body.paidAmount) : null,
        balanceDue: body.balanceDue != null ? Number(body.balanceDue) : null,
        utrNumber: body.utrNumber ? String(body.utrNumber).slice(0, 100) : null,
        paymentMode: body.paymentMode ? String(body.paymentMode).slice(0, 50) : null,
        mealSummary: body.mealSummary ? String(body.mealSummary).slice(0, 150) : null,
        status: status || 'Confirmed',
        source: String(body.source || 'Website Booking Engine').slice(0, 50),
        notes: String(body.notes || '').slice(0, 500),
        checkedInCount: body.checkedInCount != null ? Number(body.checkedInCount) : null,
        shortCount: body.shortCount != null ? Number(body.shortCount) : null,
        checkInAt: body.checkInAt ? String(body.checkInAt).slice(0, 50) : null,
        marshalName: body.marshalName ? String(body.marshalName).slice(0, 100) : null,
        marshalNotes: body.marshalNotes ? String(body.marshalNotes).slice(0, 500) : null,
        convoyTime: body.convoyTime ? String(body.convoyTime).slice(0, 50) : null,
        createdAt: String(body.createdAt || new Date().toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })).slice(0, 60)
    };
}

// ── GET: Read all bookings with optional pagination (auth required with strict multi-camp scoping) ──
export async function GET(request) {
    const ip = getClientIp(request);

    // 1. Rate Limit
    const rateLimit = await checkRateLimit(`ratelimit:admin_bookings_get:${ip}`, 120, 60);
    if (!rateLimit.allowed) {
        return NextResponse.json({ success: false, message: 'Too many requests. Please wait.' }, { status: 429 });
    }

    // 2. Auth Check (Allows Master Coordinator as well as Sanctuary Hosts / Marshals)
    const authPayload = getMarshalPayload(request) || getAdminPayload(request);
    if (!authPayload) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get('limit');
        const offsetParam = searchParams.get('offset');
        const limit = limitParam ? Math.min(500, Math.max(1, parseInt(limitParam, 10))) : undefined;
        const offset = offsetParam ? Math.max(0, parseInt(offsetParam, 10)) : undefined;

        let bookings = await getStoredBookings({ limit, offset });

        // Enforce Multi-Property Backend Isolation: Filter by campId if not Master HQ
        if (!authPayload.isMasterAdmin && authPayload.campId && authPayload.campId !== 'all') {
            bookings = bookings.filter(b => isBookingInCampScope(b, authPayload.campId));
        }

        const role = authPayload?.role || 'owner';
        const roleSanitized = sanitizeBookingsForRole(bookings, role);
        return NextResponse.json({ success: true, bookings: roleSanitized });
    } catch (err) {
        console.error(sanitizeLogOutput(`[ADMIN BOOKINGS GET ERROR] ${err.message}`));
        logCrash({ source: 'ADMIN_BOOKINGS', route: 'GET /api/admin/bookings', error: err, request });
        return NextResponse.json({ success: false, message: 'Failed to retrieve bookings' }, { status: 500 });
    }
}

// ── POST: Create one booking or bulk-sync an array (admin only) ──
export async function POST(request) {
    const ip = getClientIp(request);

    if (await isIpBlocked(ip)) {
        return NextResponse.json({ success: false, message: 'Access temporarily restricted.' }, { status: 403 });
    }

    const rateLimit = await checkRateLimit(`ratelimit:admin_bookings_write:${ip}`, 20, 60);
    if (!rateLimit.allowed) {
        return NextResponse.json({ success: false, message: 'Too many requests. Please wait.' }, { status: 429 });
    }

    if (!getAdminPayload(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Bulk sync mode (admin dashboard sends the full array)
        if (Array.isArray(body)) {
            if (body.length > 1000) {
                return NextResponse.json({ success: false, message: 'Batch too large.' }, { status: 400 });
            }
            const normalized = body.map(normalizeRecord).filter(Boolean);
            await saveStoredBookings(normalized);
            return NextResponse.json({ success: true, bookings: normalized, totalCount: normalized.length });
        }

        // Single record mode
        const rec = normalizeRecord(body);
        if (!rec) {
            return NextResponse.json({ success: false, message: 'Invalid booking details.' }, { status: 400 });
        }
        const created = await addServerBooking(rec);
        
        recordWalMutation({
            entityType: 'BOOKING',
            entityId: created.id,
            action: 'CREATE',
            previousState: null,
            newState: created,
            actor: adminPayload?.campName || 'Admin Coordinator (Master HQ)',
            details: `Created new reservation ${created.id} for ${created.name} (${created.package})`,
            request
        });

        return NextResponse.json({ success: true, booking: created });
    } catch (err) {
        console.error('Error creating booking:', err);
        logCrash({ source: 'ADMIN_BOOKINGS', route: 'POST /api/admin/bookings', error: err, request });
        return NextResponse.json({ success: false, message: 'Internal server error while recording booking' }, { status: 500 });
    }
}

// ── PATCH: Update whitelisted fields of a booking (admin & authorized marshals) ──
export async function PATCH(request) {
    const ip = getClientIp(request);

    const rateLimit = await checkRateLimit(`ratelimit:admin_bookings_write:${ip}`, 30, 60);
    if (!rateLimit.allowed) {
        return NextResponse.json({ success: false, message: 'Too many requests. Please wait.' }, { status: 429 });
    }

    const authPayload = getMarshalPayload(request) || getAdminPayload(request);
    if (!authPayload) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ success: false, message: 'Missing booking ID' }, { status: 400 });
        }

        // Fetch previous state for WAL and scope check
        const currentBookings = await getStoredBookings();
        const prevRecord = currentBookings.find(b => b.id.toUpperCase() === String(id).toUpperCase()) || null;

        // Scope verification: Marshals can only edit bookings for their assigned campsite
        if (!authPayload.isMasterAdmin && authPayload.campId && authPayload.campId !== 'all') {
            if (!prevRecord || !isBookingInCampScope(prevRecord, authPayload.campId)) {
                return NextResponse.json({ success: false, message: 'Forbidden: Booking is outside your assigned campsite scope.' }, { status: 403 });
            }
        }

        // Strict whitelist — no arbitrary field injection
        const cleanUpdates = {};
        for (const key of Object.keys(updates)) {
            if (!PATCHABLE_FIELDS.includes(key)) continue;
            if (key === 'status' && !ALLOWED_STATUSES.includes(String(updates[key]))) continue;
            if (key === 'guests' || key === 'checkedInCount' || key === 'shortCount') {
                const g = Number(updates[key]);
                if (!isNaN(g) && g >= 0 && g <= 100) {
                    cleanUpdates[key] = g;
                }
                continue;
            }
            if (key === 'notes' || key === 'marshalNotes') {
                cleanUpdates[key] = String(updates[key]).slice(0, 500);
                continue;
            }
            cleanUpdates[key] = String(updates[key]).slice(0, 100);
        }

        if (Object.keys(cleanUpdates).length === 0) {
            return NextResponse.json({ success: false, message: 'No valid fields to update.' }, { status: 400 });
        }

        const updated = await updateServerBooking(id, cleanUpdates);

        recordWalMutation({
            entityType: 'BOOKING',
            entityId: id,
            action: cleanUpdates.status ? 'STATUS_CHANGE' : 'UPDATE',
            previousState: prevRecord,
            newState: updated,
            actor: authPayload?.campName || authPayload?.name || 'Sanctuary Marshal / Coordinator',
            details: `Updated reservation ${id}: ${Object.keys(cleanUpdates).join(', ')}`,
            request
        });

        return NextResponse.json({ success: true, booking: updated });
    } catch (err) {
        console.error('Error updating booking:', err);
        logCrash({ source: 'ADMIN_BOOKINGS', route: 'PATCH /api/admin/bookings', error: err, request });
        return NextResponse.json({ success: false, message: 'Internal server error while updating booking' }, { status: 500 });
    }
}

// ── DELETE: Remove a booking (admin only) ──
export async function DELETE(request) {
    const ip = getClientIp(request);

    const rateLimit = await checkRateLimit(`ratelimit:admin_bookings_write:${ip}`, 20, 60);
    if (!rateLimit.allowed) {
        return NextResponse.json({ success: false, message: 'Too many requests. Please wait.' }, { status: 429 });
    }

    const adminPayload = getAdminPayload(request);
    if (!adminPayload) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id || id.length > 64) {
            return NextResponse.json({ success: false, message: 'Missing booking ID' }, { status: 400 });
        }

        // Fetch previous state for WAL before deletion
        const currentBookings = await getStoredBookings();
        const prevRecord = currentBookings.find(b => b.id === id) || null;

        const result = await deleteServerBooking(id);

        recordWalMutation({
            entityType: 'BOOKING',
            entityId: id,
            action: 'DELETE',
            previousState: prevRecord,
            newState: null,
            actor: adminPayload?.campName || 'Admin Coordinator (Master HQ)',
            details: `Deleted reservation ${id} (${prevRecord?.name || 'Camper'})`,
            request
        });

        return NextResponse.json({ success: true, ...result });
    } catch (err) {
        console.error('Error deleting booking:', err);
        logCrash({ source: 'ADMIN_BOOKINGS', route: 'DELETE /api/admin/bookings', error: err, request });
        return NextResponse.json({ success: false, message: 'Internal server error while deleting booking' }, { status: 500 });
    }
}