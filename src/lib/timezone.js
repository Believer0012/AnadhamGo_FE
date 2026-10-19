/**
 * Indian Standard Time (IST / Asia/Kolkata) Normalization Utilities
 * Prevents client browser timezone offsets (e.g. campers booking from US/Europe/Gulf)
 * from shifting check-in and check-out dates by +/- 1 day.
 */

export const CAMPSITE_TIMEZONE = 'Asia/Kolkata'; // UTC+05:30

/**
 * Format a Date or ISO timestamp into IST date string (YYYY-MM-DD)
 * @param {Date|string|number} dateInput 
 * @returns {string} e.g. "2026-09-12"
 */
export function formatToIstDate(dateInput) {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    
    // Format using Intl.DateTimeFormat pinned to Asia/Kolkata
    const formatter = new Intl.DateTimeFormat('en-CA', { // en-CA outputs YYYY-MM-DD
        timeZone: CAMPSITE_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    return formatter.format(d);
}

/**
 * Format a Date or timestamp into human-readable IST string
 * @param {Date|string|number} dateInput 
 * @returns {string} e.g. "12 Sep 2026, 02:00 PM IST"
 */
export function formatToIstDateTime(dateInput) {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    
    return new Intl.DateTimeFormat('en-IN', {
        timeZone: CAMPSITE_TIMEZONE,
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(d) + ' IST';
}

/**
 * Check-in and check-out time constants for Kerala mountain campsites
 */
export const CAMP_SCHEDULE = {
    checkInTime: '14:00',  // 02:00 PM IST
    checkOutTime: '11:00', // 11:00 AM IST
    turnaroundHours: 3     // 11:00 AM to 02:00 PM cleaning/turnaround window
};
