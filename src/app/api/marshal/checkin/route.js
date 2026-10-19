import { NextResponse } from 'next/server';
import { getStoredBookings, saveStoredBookings, updateServerBooking } from '@/lib/serverBookingStore';
import { getClientIp, getMarshalPayload } from '@/lib/authConfig';
import { checkRateLimit } from '@/lib/redis';
import { recordWalMutation, logCrash } from '@/lib/auditLedger';

export async function POST(request) {
    const ip = getClientIp(request);

    // Require an authenticated host / coordinator session
    const session = getMarshalPayload(request);
    if (!session) {
        return NextResponse.json({ success: false, message: 'Unauthorized. Please unlock the scanner console first.' }, { status: 401 });
    }

    // Rate limit checkin actions
    const rateLimit = await checkRateLimit(`ratelimit:marshal_checkin:${ip}`, 60, 60);
    if (!rateLimit.allowed) {
        return NextResponse.json({ success: false, message: 'Too many check-in attempts' }, { status: 429 });
    }

    try {
        const body = await request.json();
        const { 
            bookingId, 
            checkedInCount, 
            shortCount, 
            roster, 
            isBalancePaid, 
            paymentMode = '',
            settlementMethod = '',
            balanceCollected = 0,
            assignedTent = '',
            wristbandRange = '',
            marshalNotes,
            marshalName = 'Basecamp Host' 
        } = body;

        if (!bookingId) {
            return NextResponse.json({ success: false, message: 'Missing booking ID' }, { status: 400 });
        }

        const bookings = await getStoredBookings();
        const bookingIndex = bookings.findIndex(b => b.id.toUpperCase() === bookingId.toUpperCase());

        const numPresent = Number(checkedInCount) || 0;
        const numShort = Number(shortCount) || 0;
        const updatedRoster = Array.isArray(roster) ? roster : [];

        // Check-in is only allowed for bookings that already exist in the reservation database.
        if (bookingIndex === -1) {
            return NextResponse.json({ success: false, message: `Booking #${bookingId} not found in reservation database` }, { status: 404 });
        }

        const existing = bookings[bookingIndex];

        const updatedTotalGuests = Math.max(numPresent + numShort, updatedRoster.length, Number(existing.guests) || 1);
        const newStatus = numShort > 0 ? 'Partial Check-In' : 'Checked In';

        const updatedRecord = {
            ...existing,
            status: newStatus,
            guests: updatedTotalGuests,
            checkedInCount: numPresent,
            shortCount: numShort,
            attendanceRoster: updatedRoster,
            isBalancePaid: Boolean(isBalancePaid),
            balanceDue: isBalancePaid ? 0 : (existing.balanceDue || 0),
            paymentMode: isBalancePaid ? (paymentMode || existing.paymentMode || 'Cash / UPI at Gate') : existing.paymentMode,
            settlementMethod: isBalancePaid ? settlementMethod : (existing.settlementMethod || null),
            balanceCollected: isBalancePaid ? (Number(balanceCollected) || existing.balanceDue || 0) : 0,
            assignedTent: String(assignedTent || existing.assignedTent || existing.roomType || existing.package || '').slice(0, 100),
            wristbandRange: String(wristbandRange || existing.wristbandRange || '').slice(0, 100),
            checkInAt: existing.checkInAt || new Date().toISOString(),
            marshalName: String(marshalName).slice(0, 80),
            marshalNotes: String(marshalNotes || '').slice(0, 500),
            lastUpdated: new Date().toISOString()
        };

        if (bookingIndex !== -1) {
            bookings[bookingIndex] = updatedRecord;
        }

        await saveStoredBookings(bookings);

        // Also update Prisma / local store via unified updateServerBooking
        try {
            await updateServerBooking(bookingId, {
                ...updatedRecord,
                status: newStatus,
                guests: updatedTotalGuests,
                paymentMode: updatedRecord.paymentMode,
                notes: `[Checked-In by ${marshalName} on ${new Date().toLocaleTimeString('en-IN')}: ${numPresent} Present, ${numShort} Short. Balance Paid: ${isBalancePaid ? `YES (${paymentMode || 'Settled'})` : 'NO'}] ${marshalNotes || ''}`
            });
        } catch (e) {
            console.warn('DB update sync notice:', e.message);
        }

        recordWalMutation({
            entityType: 'BOOKING',
            entityId: bookingId,
            action: newStatus === 'Checked In' ? 'STATUS_CHANGE' : 'BATCH_RESCHEDULE',
            previousState: existing,
            newState: updatedRecord,
            actor: marshalName || 'Basecamp Host',
            actorRole: 'camp_marshal',
            details: `Field gate ${newStatus === 'Checked In' ? 'full check-in' : 'partial check-in'} for ${bookingId} (${numPresent} present, ${numShort} short)`,
            request
        });

        return NextResponse.json({
            success: true,
            message: numShort > 0 
                ? `Partial check-in recorded for #${bookingId} (${numPresent} Present, ${numShort} Short)`
                : `Full check-in completed for #${bookingId} (${numPresent}/${numPresent} Present)`,
            booking: updatedRecord
        });

    } catch (err) {
        console.error('Error in marshal check-in API:', err);
        logCrash({ source: 'MARSHAL_CHECKIN', route: 'POST /api/marshal/checkin', error: err, request });
        return NextResponse.json({ success: false, message: 'Server error processing check-in' }, { status: 500 });
    }
}
