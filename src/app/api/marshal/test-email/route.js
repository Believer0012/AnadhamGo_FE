import { NextResponse } from 'next/server';
import { sendBookingConfirmationEmail } from '@/lib/email.js';
import { addServerBooking, getStoredBookings } from '@/lib/serverBookingStore.js';
import { getClientIp, getAdminPayload } from '@/lib/authConfig.js';
import { checkRateLimit } from '@/lib/redis.js';

export async function POST(request) {
    const ip = getClientIp(request);

    // Dev/test tool: master admin only
    const session = getAdminPayload(request);
    if (!session) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit test emails (Max 10 / min)
    const rateLimit = await checkRateLimit(`ratelimit:test_email:${ip}`, 10, 60);
    if (!rateLimit.allowed) {
        return NextResponse.json({ success: false, message: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
    }

    try {
        const body = await request.json();
        const { 
            email = 'aman.tshekar@gmail.com', 
            name = 'Explorer Lead', 
            phone = '+91 98471 23456',
            guests = 4,
            package: packageName = 'Kolukkumalai Sunrise Ridge Glamp (7,900 FT)',
            roomType = 'Ridge Glamping Tent'
        } = body;

        if (!email || !email.includes('@')) {
            return NextResponse.json({ success: false, message: 'Invalid email address provided' }, { status: 400 });
        }

        const numGuests = Number(guests) || 4;
        const vegCount = Math.ceil(numGuests / 2);
        const nonVegCount = numGuests - vegCount;
        const total = numGuests * 2499;
        const advance = Math.round(total * 0.3);
        const balanceDue = total - advance;

        const bookingId = `BK-DEMO-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

        const testBooking = {
            id: bookingId,
            name: (name || 'Lead Explorer').trim(),
            email: email.trim(),
            phone: phone || '+91 98471 23456',
            package: packageName,
            campsiteId: 'pkg-kolukkumalai',
            region: 'Munnar',
            dates: 'Upcoming Weekend (2D / 1N)',
            roomType: roomType,
            guests: numGuests,
            adults: numGuests > 1 ? numGuests - 1 : 1,
            children: numGuests > 1 ? 1 : 0,
            vegCount,
            nonVegCount,
            total,
            advancePaid: advance,
            balanceDue,
            isBalancePaid: false,
            status: 'Confirmed',
            source: 'Check-In Simulation Engine',
            convoyTime: '02:30 PM Suryanelli 4x4 Convoy',
            notes: 'High-elevation panoramic setup with campfire dinner requested.',
            attendanceRoster: Array.from({ length: numGuests }, (_, idx) => ({
                id: idx + 1,
                name: idx === 0 ? `${name} (Lead)` : `Squad Camper #${idx + 1}`,
                present: true
            })),
            createdAt: new Date().toISOString()
        };

        // 1. Persist to booking store
        await addServerBooking(testBooking);

        // 2. Dispatch email via Resend
        const emailResult = await sendBookingConfirmationEmail(testBooking);

        return NextResponse.json({
            success: true,
            message: `Test reservation #${bookingId} created and pass sent to ${email}`,
            booking: testBooking,
            emailStatus: emailResult.success ? 'Delivered via Resend' : (emailResult.reason || 'Queued')
        });

    } catch (err) {
        console.error('Error generating test reservation:', err);
        return NextResponse.json({ success: false, message: 'Server error generating test pass' }, { status: 500 });
    }
}
