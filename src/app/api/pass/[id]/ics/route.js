import { getStoredBookings } from '@/lib/serverBookingStore';
import { buildICalFileString } from '@/lib/calendarLink';
import { verifyPassToken, getCheckInLandmarkGuide } from '@/lib/accessControl';

function sanitizeIcalText(str) {
    if (!str) return '';
    return String(str).replace(/[\r\n]/g, ' ').replace(/[,;\\]/g, ' ').trim();
}

export async function GET(request, { params }) {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    const allBookings = await getStoredBookings();
    const booking = allBookings.find(b => b.id?.toUpperCase() === id?.toUpperCase());

    // 1. Strict 404: No fake demo fallback
    if (!booking) {
        return new Response('Wilderness permit not found', { status: 404 });
    }

    // 2. Cryptographic Token Verification
    const isTokenVerified = token ? verifyPassToken(booking.id, token, booking.status) : false;
    if (!isTokenVerified) {
        return new Response('Access forbidden: Valid cryptographic pass token required', { status: 403 });
    }

    const data = booking;
    const landmarkGuide = getCheckInLandmarkGuide(data.campsiteId || data.package, data);

    const safeId = sanitizeIcalText(data.id);
    const safeName = sanitizeIcalText(data.name || 'Explorer');
    const safeRoom = sanitizeIcalText(data.roomType || 'Alpine Glamping Tent');
    const safePackage = sanitizeIcalText(data.package || 'Aanandham Mountain Expedition');
    const safeLocation = sanitizeIcalText(landmarkGuide.hubName || data.location || 'Suryanelli Basecamp, Munnar, Kerala');

    const description = `Aanandham Wilderness Stay\\n` +
        `Booking Reference: ${safeId}\\n` +
        `Lead Explorer: ${safeName}\\n` +
        `Stay Units: ${safeRoom}\\n` +
        `Meeting Hub: ${sanitizeIcalText(landmarkGuide.hubName)} (${landmarkGuide.emergencyMarshalPhone})\\n` +
        `Please arrive by 1:30 PM for 4x4 convoy pickup. Present digital pass QR on arrival.`;

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 14, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15, 11, 0, 0);
    const startIso = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endIso = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = buildICalFileString({
        title: safePackage,
        location: safeLocation,
        description,
        bookingId: safeId,
        startIso,
        endIso
    });

    return new Response(icsContent, {
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': `attachment; filename="aanandham-pass-${safeId}.ics"`,
            'Cache-Control': 'private, no-cache, no-store'
        }
    });
}
