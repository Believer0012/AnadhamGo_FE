/**
 * Granular Role-Based Access Control (RBAC) & Field Caretaker Sanitizer
 *
 * Roles:
 * 1. OWNER: Full financial, payout, revenue, and master database control.
 * 2. MARSHAL: Convoy logistics, 4x4 allocation, gate PIN verification.
 * 3. CARETAKER / CLEANING CREW: Pitch turn-down checklists, zero revenue visibility.
 */

export const USER_ROLES = {
    OWNER: 'owner',
    MARSHAL: 'marshal',
    CARETAKER: 'caretaker'
};

/**
 * Filter and sanitize booking lists for field caretakers (strips all revenue data)
 * @param {Array<object>} bookings 
 * @param {string} role - 'owner' | 'caretaker' | 'marshal'
 * @returns {Array<object>}
 */
export function sanitizeBookingsForRole(bookings = [], role = USER_ROLES.OWNER) {
    if (role === USER_ROLES.OWNER) {
        return bookings; // Full financial visibility
    }

    // Caretaker & Marshal View: Zero financial data, only guest names, units, meal counts, and dates
    return bookings.map(b => ({
        id: b.id,
        name: b.name,
        phone: b.phone,
        package: b.package,
        dates: b.dates,
        guests: b.guests,
        adults: b.adults,
        children: b.children,
        roomType: b.roomType,
        mealSummary: b.mealSummary || `${b.vegCount || 0} Veg + ${b.nonVegCount || 0} Non-Veg`,
        notes: b.notes,
        status: b.status,
        cleaningStatus: b.cleaningStatus || 'READY_FOR_INSPECTION'
    }));
}
