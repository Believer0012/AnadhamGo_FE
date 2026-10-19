import { getStoredBookings } from '@/lib/serverBookingStore';
import { getAllCamps } from '@/lib/campsData';
import { CAMPSITE_TIMEZONE } from '@/lib/timezone';
import { checkRateLimit } from '@/lib/redis';
import { getClientIp } from '@/lib/authConfig';
import crypto from 'crypto';

// Helper to sanitize any text against CRLF injection and iCal special chars
function sanitizeIcalText(str) {
    if (!str) return '';
    return String(str)
        .replace(/[\r\n]/g, ' ')
        .replace(/[,;\\]/g, ' ')
        .trim();
}

// Opaque per-booking UID — no real booking IDs exposed to external calendars
function bookingUid(bookingId) {
    return crypto.createHash('sha256').update(String(bookingId)).digest('hex').slice(0, 16);
}

// ── GET: RFC 5545 iCalendar (.ics) Sync Feed for External Channels ──
// Allows campsite hosts to paste this URL into Airbnb, Booking.com, Hipcamp, or Google Calendar.
// URL: /api/camps/[id]/ical
export async function GET(request, { params }) {
    const ip = getClientIp(request);

    // Rate limit: max 60 requests per minute per IP
    const rateLimit = await checkRateLimit(`ratelimit:camps_ical:${ip}`, 60, 60);
    if (!rateLimit.allowed) {
        return new Response('Too many requests. Rate limit active.', { status: 429 });
    }

    const { id } = await params;
    const camps = getAllCamps();
    const camp = camps.find(c => c.id === id);

    if (!camp) {
        return new Response('Campsite not found', { status: 404 });
    }

    const allBookings = await getStoredBookings();
    // Filter active bookings for this campsite
    const campBookings = allBookings.filter(b => 
        ['Confirmed', 'Payment Pending'].includes(b.status) &&
        (b.slotKey?.includes(id) || b.package?.toLowerCase().includes(camp.title.toLowerCase().substring(0, 10)))
    );

    const nowTimestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const events = campBookings.map(booking => {
        const safeRoom = sanitizeIcalText(booking.roomType || 'Alpine Glamping Tent');
        const safeLocation = sanitizeIcalText(camp.location || 'Suryanelli, Munnar, Kerala');
        
        return [
            'BEGIN:VEVENT',
            `UID:booking-${bookingUid(booking.id)}@aanandham.in`,
            `DTSTAMP:${nowTimestamp}`,
            `SUMMARY:Reserved: ${safeRoom}`,
            `DESCRIPTION:Aanandham Wilderness Reservation`,
            `LOCATION:${safeLocation}`,
            `STATUS:${booking.status === 'Confirmed' ? 'CONFIRMED' : 'TENTATIVE'}`,
            'END:VEVENT'
        ].join('\r\n');
    }).join('\r\n');

    const safeTitle = sanitizeIcalText(camp.title);
    const icalData = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Aanandham Wilderness Platform//Campsite Calendar Sync//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:Aanandham - ${safeTitle}`,
        `X-WR-TIMEZONE:${CAMPSITE_TIMEZONE}`,
        events,
        'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');

    return new Response(icalData, {
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': `attachment; filename="${id}-availability.ics"`,
            'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
        }
    });
}
