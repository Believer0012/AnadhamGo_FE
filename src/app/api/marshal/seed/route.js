import { NextResponse } from 'next/server';
import { addServerBooking, getStoredBookings, saveStoredBookings } from '@/lib/serverBookingStore.js';
import { getAdminPayload } from '@/lib/authConfig.js';

export async function POST(request) {
    // Dev/test tool: master admin only
    const session = getAdminPayload(request);
    if (!session) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    try {
        const sampleCampers = [
            {
                name: 'Aarav Sharma',
                email: 'aman.tshekar@gmail.com',
                phone: '+91 94471 55667',
                package: 'Kolukkumalai Sunrise 4x4 & High-Altitude Ridge Glamp',
                campsiteId: 'pkg-kolukkumalai',
                region: 'Munnar',
                dates: 'This Weekend (2D / 1N)',
                roomType: 'Ridge Glamping Tent',
                guests: 4,
                checkedInCount: 0,
                shortCount: 0,
                vegCount: 2,
                nonVegCount: 2,
                total: 9996,
                advancePaid: 2998,
                balanceDue: 6998,
                isBalancePaid: false,
                status: 'Confirmed',
                convoyTime: '02:30 PM Suryanelli 4x4 Convoy',
                notes: 'Requested sunrise viewing deck and warm fleece blankets.',
                attendanceRoster: [
                    { id: 1, name: 'Aarav Sharma (Lead)', present: true, status: 'present', mealType: 'Veg' },
                    { id: 2, name: 'Pooja Sharma', present: true, status: 'present', mealType: 'Veg' },
                    { id: 3, name: 'Kavya Sharma', present: true, status: 'present', mealType: 'Non-Veg' },
                    { id: 4, name: 'Aryan Sharma', present: true, status: 'present', mealType: 'Non-Veg' }
                ]
            },
            {
                name: 'Rohan Mehta & Squad',
                email: 'linoharidas@gmail.com',
                phone: '+91 98471 23456',
                package: 'Meesapulimala 8,661 FT Summit Cloud Bed Trek',
                campsiteId: 'pkg-meesapulimala',
                region: 'Silent Valley',
                dates: 'This Weekend (2D / 1N)',
                roomType: 'Weatherproof Alpine Quad Tents',
                guests: 6,
                checkedInCount: 0,
                shortCount: 0,
                vegCount: 2,
                nonVegCount: 4,
                total: 11994,
                advancePaid: 3598,
                balanceDue: 8396,
                isBalancePaid: false,
                status: 'Confirmed',
                convoyTime: '03:15 PM Trek Base Departure',
                notes: '6 members squad with acoustic guitars and warm clothing.',
                attendanceRoster: [
                    { id: 1, name: 'Rohan Mehta (Lead)', present: true, status: 'present', mealType: 'Veg' },
                    { id: 2, name: 'Rahul Joshi', present: true, status: 'present', mealType: 'Veg' },
                    { id: 3, name: 'Varun Nair', present: true, status: 'present', mealType: 'Non-Veg' },
                    { id: 4, name: 'Siddharth Roy', present: true, status: 'present', mealType: 'Non-Veg' },
                    { id: 5, name: 'Nikhil Menon', present: true, status: 'present', mealType: 'Non-Veg' },
                    { id: 6, name: 'Aditya Pillai', present: true, status: 'present', mealType: 'Non-Veg' }
                ]
            },
            {
                name: 'Ananya Iyer & Partner',
                email: 'vismayaanilkumar1101@gmail.com',
                phone: '+91 94470 88990',
                package: 'Suryanelli Valley Ridge Geodesic Glamping',
                campsiteId: 'pkg-suryanelli',
                region: 'Munnar',
                dates: 'This Weekend (2D / 1N)',
                roomType: 'Cliffside Wooden Cottage Pod',
                guests: 2,
                checkedInCount: 0,
                shortCount: 0,
                vegCount: 2,
                nonVegCount: 0,
                total: 6998,
                advancePaid: 2099,
                balanceDue: 4899,
                isBalancePaid: false,
                status: 'Confirmed',
                convoyTime: '01:30 PM Early Batch',
                notes: 'Couple stay, pure vegetarian BBQ requested. Pod #2 pre-assigned.',
                attendanceRoster: [
                    { id: 1, name: 'Ananya Iyer (Lead)', present: true, status: 'present', mealType: 'Veg' },
                    { id: 2, name: 'Gautam Ram', present: true, status: 'present', mealType: 'Veg' }
                ]
            },
            {
                name: 'Vikram Sundaram & Friends',
                email: 'aman.tshekar@gmail.com',
                phone: '+91 97455 11223',
                package: 'Vagamon Pine Forest Eco Retreat',
                campsiteId: 'pkg-vagamon-pine',
                region: 'Vagamon',
                dates: 'This Weekend (2D / 1N)',
                roomType: 'Pine Canopy Safari Tent',
                guests: 3,
                checkedInCount: 0,
                shortCount: 0,
                vegCount: 1,
                nonVegCount: 2,
                total: 5997,
                advancePaid: 1799,
                balanceDue: 4198,
                isBalancePaid: false,
                status: 'Confirmed',
                convoyTime: '02:00 PM Vagamon Base Entry',
                notes: 'Need campfire acoustic guitar setup.',
                attendanceRoster: [
                    { id: 1, name: 'Vikram Sundaram (Lead)', present: true, status: 'present', mealType: 'Veg' },
                    { id: 2, name: 'Sanjay Kumar', present: true, status: 'present', mealType: 'Non-Veg' },
                    { id: 3, name: 'Deepak Varma', present: true, status: 'present', mealType: 'Non-Veg' }
                ]
            },
            {
                name: 'Dr. Arjun Nair & Family',
                email: 'arjun.nair@aanandham.in',
                phone: '+91 98950 44332',
                package: 'Wayanad 900 Kandi Rainforest Glass Bridge Glamp',
                campsiteId: 'pkg-wayanad',
                region: 'Wayanad',
                dates: 'This Weekend (2D / 1N)',
                roomType: 'Treehouse Canopy Villa',
                guests: 4,
                checkedInCount: 0,
                shortCount: 0,
                vegCount: 2,
                nonVegCount: 2,
                total: 10996,
                advancePaid: 3298,
                balanceDue: 7698,
                isBalancePaid: false,
                status: 'Confirmed',
                convoyTime: '01:00 PM Rainforest Shuttle',
                notes: 'Family with kids. Requested ground-floor canopy villa.',
                attendanceRoster: [
                    { id: 1, name: 'Dr. Arjun Nair (Lead)', present: true, status: 'present', mealType: 'Veg' },
                    { id: 2, name: 'Divya Nair', present: true, status: 'present', mealType: 'Veg' },
                    { id: 3, name: 'Meera Nair', present: true, status: 'present', mealType: 'Non-Veg' },
                    { id: 4, name: 'Karthik Nair', present: true, status: 'present', mealType: 'Non-Veg' }
                ]
            }
        ];

        const existingBookings = await getStoredBookings();
        const created = [];

        for (const sample of sampleCampers) {
            const bookingId = `BK-SIM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
            const fullRecord = {
                id: bookingId,
                ...sample,
                source: 'Simulation Generator',
                createdAt: new Date().toISOString()
            };
            await addServerBooking(fullRecord);
            created.push(fullRecord);
        }

        return NextResponse.json({
            success: true,
            message: `Generated ${created.length} realistic simulation reservations!`,
            count: created.length
        });
    } catch (e) {
        console.error('Error seeding demo campers:', e);
        return NextResponse.json({ success: false, message: 'Failed to seed sample campers' }, { status: 500 });
    }
}
