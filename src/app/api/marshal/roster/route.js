import { NextResponse } from 'next/server';
import { getStoredBookings } from '@/lib/serverBookingStore';
import { getClientIp, getMarshalPayload } from '@/lib/authConfig';
import { checkRateLimit } from '@/lib/redis';

export async function GET(request) {
    const ip = getClientIp(request);

    // Require an authenticated host / coordinator session
    const session = getMarshalPayload(request);
    if (!session) {
        return NextResponse.json({ success: false, message: 'Unauthorized. Please unlock the scanner console first.' }, { status: 401 });
    }

    // Rate limit roster requests
    const rateLimit = await checkRateLimit(`ratelimit:marshal_roster:${ip}`, 60, 60);
    if (!rateLimit.allowed) {
        return NextResponse.json({ success: false, message: 'Rate limit exceeded' }, { status: 429 });
    }

    try {
        const bookings = await getStoredBookings();

        // Calculate aggregate headcount and operational metrics
        let totalExpectedCampers = 0;
        let totalCheckedInCampers = 0;
        let totalShortCampers = 0;
        let totalPendingCampers = 0;
        let vegMealsCount = 0;
        let nonVegMealsCount = 0;
        let totalBalanceDue = 0;
        let totalBalanceCollected = 0;

        const rosterList = bookings.map(b => {
            const totalGuests = Number(b.guests || (Array.isArray(b.attendanceRoster) ? b.attendanceRoster.length : 0)) || 2;
            const isFullyCheckedIn = b.status === 'Checked In';
            const isPartiallyCheckedIn = b.status === 'Partial Check-In' && Number(b.checkedInCount) > 0;
            const isCheckedIn = isFullyCheckedIn || isPartiallyCheckedIn;

            const checkedIn = isFullyCheckedIn ? totalGuests : (isPartiallyCheckedIn ? Number(b.checkedInCount || 0) : 0);
            const short = isPartiallyCheckedIn ? Number(b.shortCount || Math.max(0, totalGuests - checkedIn)) : 0;
            
            const veg = Number(b.vegCount ?? Math.ceil(totalGuests / 2));
            const nonVeg = Number(b.nonVegCount ?? Math.max(0, totalGuests - veg));

            const total = Number(b.total) || (totalGuests * 2499);
            const advance = Number(b.advancePaid || Math.round(total * 0.3));
            const isBalancePaid = Boolean(b.isBalancePaid || b.balanceDue === 0 || isFullyCheckedIn);
            const balanceDue = isBalancePaid ? 0 : Number(b.balanceDue !== undefined ? b.balanceDue : (total - advance));
            const preassignedRoom = b.assignedTent || b.roomType || b.package || 'Ridge Glamping Tent';

            if (b.status !== 'Cancelled' && b.status !== 'Expired') {
                totalExpectedCampers += totalGuests;
                if (isCheckedIn) {
                    totalCheckedInCampers += checkedIn;
                    totalShortCampers += short;
                } else {
                    totalPendingCampers += totalGuests;
                }

                vegMealsCount += veg;
                nonVegMealsCount += nonVeg;

                if (isBalancePaid) {
                    totalBalanceCollected += (total - advance);
                } else {
                    totalBalanceDue += balanceDue;
                }
            }

            return {
                id: b.id,
                name: b.name,
                phone: b.phone || '',
                email: b.email || 'camper@aanandham.in',
                campsite: b.package || 'Kolukkumalai Ridge Glamp',
                campsiteId: b.campsiteId || '',
                region: b.region || 'Munnar',
                dates: b.dates || 'Upcoming Batch',
                roomType: b.roomType || preassignedRoom,
                assignedTent: preassignedRoom,
                wristbandRange: b.wristbandRange || `#101 - #${100 + totalGuests}`,
                totalGuests,
                checkedInCount: checkedIn,
                shortCount: short,
                vegCount: veg,
                nonVegCount: nonVeg,
                totalPrice: total,
                advancePaid: advance,
                balanceDue,
                isBalancePaid,
                status: b.status || 'Confirmed',
                checkInAt: b.checkInAt || null,
                notes: b.marshalNotes || b.notes || '',
                convoyTime: b.convoyTime || '02:30 PM Batch',
                roster: (Array.isArray(b.attendanceRoster) && b.attendanceRoster.length > 0)
                    ? b.attendanceRoster.map((c, idx) => ({
                        id: c.id || idx + 1,
                        name: c.name || (idx === 0 ? `${b.name} (Lead)` : `Squad Camper #${idx + 1}`),
                        status: c.status || (c.present !== false ? 'present' : 'absent'),
                        present: c.present !== false,
                        mealType: c.mealType || (idx < veg ? 'Veg' : 'Non-Veg')
                    }))
                    : Array.from({ length: totalGuests }, (_, idx) => ({
                        id: idx + 1,
                        name: idx === 0 ? `${b.name} (Lead)` : `Squad Camper #${idx + 1}`,
                        status: isCheckedIn ? (idx < checkedIn ? 'present' : 'absent') : 'present',
                        present: isCheckedIn ? (idx < checkedIn) : true,
                        mealType: idx < veg ? 'Veg' : 'Non-Veg'
                    }))
            };
        });

        return NextResponse.json({
            success: true,
            stats: {
                totalExpectedCampers,
                totalCheckedInCampers,
                totalPendingCampers,
                totalShortCampers,
                vegMealsCount,
                nonVegMealsCount,
                totalBalanceDue,
                totalBalanceCollected,
                totalBookings: rosterList.length
            },
            roster: rosterList
        });

    } catch (err) {
        console.error('Error fetching marshal roster:', err);
        return NextResponse.json({ success: false, message: 'Server error retrieving guest roster' }, { status: 500 });
    }
}
