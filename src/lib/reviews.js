import { getStoredBookings } from './serverBookingStore';

/**
 * Verified Stay Review Validation & Double-Blind Review Engine
 * Prevents fake reviews and review-bombing by verifying against actual database records.
 */

export async function verifyGuestForReview({ bookingId, email, phone }) {
    if (!bookingId) {
        return {
            eligible: false,
            message: 'A valid Booking ID is required to submit a verified camper review.'
        };
    }

    const allBookings = await getStoredBookings();
    const booking = allBookings.find(b => b.id?.toUpperCase() === bookingId.toUpperCase());

    if (!booking) {
        return {
            eligible: false,
            message: 'Booking reference not found in our basecamp roster.'
        };
    }

    // Verify contact match
    const cleanBookingPhone = String(booking.phone || '').replace(/\D/g, '');
    const cleanInputPhone = String(phone || '').replace(/\D/g, '');
    const isPhoneMatch = cleanInputPhone && cleanBookingPhone.endsWith(cleanInputPhone.slice(-10));
    const isEmailMatch = email && booking.email && email.toLowerCase() === booking.email.toLowerCase();

    if (phone && !isPhoneMatch && !isEmailMatch) {
        return {
            eligible: false,
            message: 'Guest contact details do not match this booking record.'
        };
    }

    if (!['Confirmed', 'Completed'].includes(booking.status)) {
        return {
            eligible: false,
            message: `Reviews can only be submitted for completed wilderness stays (current status: ${booking.status}).`
        };
    }

    return {
        eligible: true,
        booking: {
            id: booking.id,
            package: booking.package,
            name: booking.name,
            dates: booking.dates,
            stayType: booking.roomType
        }
    };
}
