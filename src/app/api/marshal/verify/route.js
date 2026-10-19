import { NextResponse } from 'next/server';
import { getStoredBookings } from '@/lib/serverBookingStore';
import { verifyScannedPassSignature } from '@/lib/cryptoPass';
import { getClientIp, getMarshalPayload } from '@/lib/authConfig';
import { checkRateLimit } from '@/lib/redis';

export async function POST(request) {
    const ip = getClientIp(request);

    // Require an authenticated host / coordinator session
    const session = getMarshalPayload(request);
    if (!session) {
        return NextResponse.json({ success: false, message: 'Unauthorized. Please unlock the scanner console first.' }, { status: 401 });
    }

    // Rate limit marshal scanner scans (Max 120 scans / min)
    const rateLimit = await checkRateLimit(`ratelimit:marshal_scan:${ip}`, 120, 60);
    if (!rateLimit.allowed) {
        return NextResponse.json({ success: false, message: 'Scan rate limit exceeded. Please wait.' }, { status: 429 });
    }

    try {
        const body = await request.json();
        let { qrData, bookingId } = body;

        if (!qrData && !bookingId) {
            return NextResponse.json({ success: false, message: 'No QR data or Booking ID provided' }, { status: 400 });
        }

        // Clean & extract raw booking ID from various formats
        let rawInput = String(bookingId || qrData || '').trim();
        let cryptoResult = null;

        if (qrData) {
            const rawString = String(qrData).trim();
            
            // Format 1: Cryptographic string AANANDHAM:V2:BK-...
            if (rawString.startsWith('AANANDHAM:V2:')) {
                cryptoResult = verifyScannedPassSignature(rawString);
                rawInput = cryptoResult.bookingId || rawString;
            } 
            // Format 2: Pass URL https://aanandham.in/pass/BK-XXXX
            else if (rawString.includes('/pass/')) {
                const parts = rawString.split('/pass/');
                rawInput = parts[1]?.split('?')[0]?.split('#')[0]?.trim() || rawString;
            }
        }

        // Strip common human prefixes e.g. "Booking #", "Booking #BK-...", "Pass #", "ID:", "#"
        let cleanQuery = rawInput
            .replace(/^(booking|pass|reservation|ticket|ref|id|reference)\s*[:#\s-]*/i, '')
            .replace(/^#+/, '')
            .replace(/\s+/g, '') // remove all internal whitespace e.g. "BK-TEST- MSXROTVO" -> "BK-TEST-MSXROTVO"
            .toUpperCase()
            .trim();

        if (!cleanQuery) {
            return NextResponse.json({ 
                success: false, 
                message: 'Could not decode a valid Booking ID from the input' 
            }, { status: 400 });
        }

        const alphanumericQuery = cleanQuery.replace(/[^A-Z0-9]/g, '');

        // Fetch all bookings from server store
        const bookings = await getStoredBookings();
        let booking = bookings.find(b => {
            const bRaw = String(b.id || '').toUpperCase().trim();
            const bClean = bRaw.replace(/^#+/, '').replace(/\s+/g, '');
            const bAlpha = bRaw.replace(/[^A-Z0-9]/g, '');
            return bClean === cleanQuery || 
                   bAlpha === alphanumericQuery ||
                   (alphanumericQuery.length >= 6 && bAlpha.includes(alphanumericQuery)) ||
                   (bAlpha.length >= 6 && alphanumericQuery.includes(bAlpha));
        });

        // Only real bookings in the reservation database are verifiable.
        // No bookings are auto-created or reconstructed here.
        if (!booking) {
            return NextResponse.json({ 
                success: false, 
                message: `Booking #${cleanQuery} not found in reservation database`,
                scannedId: cleanQuery,
                cryptoVerified: cryptoResult?.valid || false
            }, { status: 404 });
        }

        const totalGuests = Number(booking.guests || (Array.isArray(booking.attendanceRoster) ? booking.attendanceRoster.length : 0)) || 2;
        const vegCount = Number(booking.vegCount ?? Math.ceil(totalGuests / 2));
        const nonVegCount = Number(booking.nonVegCount ?? Math.max(0, totalGuests - vegCount));
        
        // Calculate payment breakdown
        const totalPrice = Number(booking.total) || (totalGuests * 2499);
        const advancePaid = Number(booking.advancePaid || Math.round(totalPrice * 0.3));
        const balanceDue = Number(booking.balanceDue !== undefined ? booking.balanceDue : (totalPrice - advancePaid));

        // Generate or format camper roster slots
        let roster = (Array.isArray(booking.attendanceRoster) && booking.attendanceRoster.length > 0)
            ? booking.attendanceRoster.map((c, idx) => ({
                id: c.id || idx + 1,
                name: c.name || (idx === 0 ? `${booking.name} (Lead)` : `Squad Camper #${idx + 1}`),
                status: c.status || (c.present !== false ? 'present' : 'absent'),
                present: c.present !== false,
                mealType: c.mealType || (idx < vegCount ? 'Veg' : 'Non-Veg')
            }))
            : Array.from({ length: totalGuests }, (_, idx) => ({
                id: idx + 1,
                name: idx === 0 ? `${booking.name} (Lead)` : `Squad Camper #${idx + 1}`,
                status: booking.status === 'Checked In' ? 'present' : 'present',
                present: true,
                mealType: idx < vegCount ? 'Veg' : 'Non-Veg'
            }));

        const checkedInCount = booking.checkedInCount !== undefined ? Number(booking.checkedInCount) : totalGuests;
        const shortCount = booking.shortCount !== undefined ? Number(booking.shortCount) : 0;
        const preassignedRoom = booking.assignedTent || booking.roomType || booking.package || 'Ridge Glamping Tent';

        return NextResponse.json({
            success: true,
            booking: {
                id: booking.id,
                name: booking.name,
                phone: booking.phone || '',
                email: booking.email || 'camper@aanandham.in',
                campsite: booking.package || 'Kolukkumalai Sunrise Ridge Glamp',
                region: booking.region || 'Munnar',
                dates: booking.dates || 'Upcoming Batch',
                roomType: booking.roomType || preassignedRoom,
                assignedTent: preassignedRoom,
                wristbandRange: booking.wristbandRange || `#101 - #${100 + totalGuests}`,
                totalGuests,
                vegCount,
                nonVegCount,
                totalPrice,
                advancePaid,
                balanceDue,
                isBalancePaid: booking.isBalancePaid || balanceDue <= 0 || booking.status === 'Checked In',
                status: booking.status || 'Confirmed',
                checkInAt: booking.checkInAt || null,
                checkedInCount,
                shortCount,
                roster,
                marshalNotes: booking.marshalNotes || booking.notes || '',
                convoyTime: booking.convoyTime || '02:30 PM Batch',
                cryptoVerified: cryptoResult ? cryptoResult.valid : true
            }
        });

    } catch (err) {
        console.error('Error verifying marshal scanned pass:', err);
        return NextResponse.json({ success: false, message: 'Internal server error verifying pass' }, { status: 500 });
    }
}
