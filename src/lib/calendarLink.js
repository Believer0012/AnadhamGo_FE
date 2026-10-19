/**
 * 1-Click "Add to Calendar" Link Generators
 * Supports Google Calendar, Apple Calendar, Microsoft Outlook, and standard iCal (.ics)
 */

export function buildGoogleCalendarUrl({ title, dates, location, description, bookingId }) {
    // Parse dates (e.g. "12 Sep - 13 Sep 2026" or ISO)
    const baseUri = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    
    // Default 2-day batch calculation
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 14, 0, 0); // 2:00 PM check-in
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15, 11, 0, 0);   // 11:00 AM check-out

    const startIso = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endIso = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const params = new URLSearchParams({
        text: `🏕️ ${title || 'Aanandham Mountain Expedition'} (Ref: ${bookingId})`,
        dates: `${startIso}/${endIso}`,
        details: description || `Official Aanandham Wilderness Booking (Ref: ${bookingId}). Please arrive at Suryanelli Hub by 1:30 PM for 4x4 convoy pickup.`,
        location: location || 'Suryanelli Basecamp, Munnar, Kerala',
        sf: 'true',
        output: 'xml'
    });

    return `${baseUri}&${params.toString()}`;
}

export function buildICalFileString({ title, location, description, bookingId, startIso, endIso }) {
    const nowTimestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const uid = `booking-${bookingId}@aanandham.in`;

    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Aanandham Wilderness//Expedition Pass//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${nowTimestamp}`,
        `DTSTART:${startIso || nowTimestamp}`,
        `DTEND:${endIso || nowTimestamp}`,
        `SUMMARY:🏕️ Aanandham: ${title || 'Wilderness Glamping'} (Ref: ${bookingId})`,
        `DESCRIPTION:${(description || '').replace(/\n/g, '\\n')}`,
        `LOCATION:${location || 'Suryanelli, Munnar, Kerala'}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');
}
