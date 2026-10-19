/**
 * Atomic Coupon & Promo Code Validation Engine
 */

export const PROMO_CODES = [
    {
        code: 'SUMMIT10',
        discountPercent: 10,
        maxDiscountAmount: 1500,
        minBookingAmount: 3000,
        minNights: 1,
        description: '10% off on mountain expedition bookings',
        validUntil: '2027-12-31'
    },
    {
        code: 'WEEKDAYESCAPE',
        discountPercent: 15,
        maxDiscountAmount: 2000,
        minBookingAmount: 2500,
        minNights: 2,
        description: '15% off for 2+ night weekday stays',
        validUntil: '2027-12-31'
    },
    {
        code: 'SQUADTREK',
        discountFlat: 1000,
        minBookingAmount: 8000,
        minGuests: 4,
        description: 'Flat ₹1,000 off for squads of 4+ campers',
        validUntil: '2027-12-31'
    }
];

/**
 * Validate and calculate coupon discount
 * @param {string} code - Promo code entered by user
 * @param {object} bookingDetails - { total, guests, nights }
 * @returns {object} Validation result and discount amount
 */
export function validateCoupon(code = '', bookingDetails = {}) {
    const cleanCode = String(code).trim().toUpperCase();
    if (!cleanCode) return { valid: false, message: 'Please enter a coupon code.' };

    const promo = PROMO_CODES.find(p => p.code === cleanCode);
    if (!promo) {
        return { valid: false, message: 'Invalid or expired promo code.' };
    }

    const { total = 0, guests = 1, nights = 1 } = bookingDetails;

    if (promo.minBookingAmount && total < promo.minBookingAmount) {
        return {
            valid: false,
            message: `Coupon ${promo.code} requires a minimum booking value of ₹${promo.minBookingAmount}.`
        };
    }

    if (promo.minGuests && guests < promo.minGuests) {
        return {
            valid: false,
            message: `Coupon ${promo.code} is valid only for group bookings of ${promo.minGuests}+ campers.`
        };
    }

    let discount = 0;
    if (promo.discountPercent) {
        discount = Math.round((total * promo.discountPercent) / 100);
        if (promo.maxDiscountAmount) {
            discount = Math.min(discount, promo.maxDiscountAmount);
        }
    } else if (promo.discountFlat) {
        discount = promo.discountFlat;
    }

    return {
        valid: true,
        code: promo.code,
        discountAmount: discount,
        finalTotal: Math.max(0, total - discount),
        description: promo.description
    };
}
