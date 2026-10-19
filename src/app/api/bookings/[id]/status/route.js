import { NextResponse } from 'next/server';
import { getStoredBookings } from '@/lib/serverBookingStore';
import { checkRateLimit } from '@/lib/redis';
import { getClientIp, getAdminPayload } from '@/lib/authConfig';

export async function GET(request, { params }) {
    const admin = getAdminPayload(request);
    if (!admin) {
        return NextResponse.json({ success: false, message: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const ip = getClientIp(request);
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ success: false, message: 'Missing booking ID' }, { status: 400 });
    }

    // Rate limit polling (Max 30 polls / min per IP)
    const rateLimit = await checkRateLimit(`ratelimit:booking_status:${ip}`, 30, 60);
    if (!rateLimit.allowed) {
        return NextResponse.json({ success: false, message: 'Polling rate limit exceeded' }, { status: 429 });
    }

    try {
        const bookings = await getStoredBookings();
        const booking = bookings.find(b => b.id === id);

        if (!booking) {
            return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
        }

        const now = Date.now();
        let currentStatus = booking.status || 'Pending';
        let remainingHoldSeconds = 0;

        if (booking.holdExpiresAt) {
            const diffMs = booking.holdExpiresAt - now;
            remainingHoldSeconds = Math.max(0, Math.floor(diffMs / 1000));
            if (remainingHoldSeconds === 0 && currentStatus === 'Payment Pending') {
                currentStatus = 'Expired';
            }
        }

        return NextResponse.json({
            success: true,
            booking: {
                id: booking.id,
                status: currentStatus,
                remainingHoldSeconds,
                total: booking.total
            }
        });
    } catch (err) {
        console.error('Error fetching booking status:', err);
        return NextResponse.json({ success: false, message: 'Server error retrieving status' }, { status: 500 });
    }
}
