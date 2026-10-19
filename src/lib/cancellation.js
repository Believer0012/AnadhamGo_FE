/**
 * Aanandham Tiered Cancellation & Automated Refund Policy Engine
 *
 * Tier 1: > 7 Days before check-in (168+ hours)  → 100% Full Refund (minus payment gateway MDR if applicable)
 * Tier 2: 48h to 7 Days before check-in (48-168h) → 50% Partial Refund
 * Tier 3: < 48 Hours before check-in (<48h)       → 0% Non-Refundable (campsite reserved & food allocated)
 */

export const CANCELLATION_TIERS = [
    {
        id: 'tier_full',
        minHoursBeforeCheckin: 168, // 7 days
        refundPercentage: 100,
        title: 'Full 100% Refund',
        description: 'Cancel at least 7 days before check-in for a full refund.'
    },
    {
        id: 'tier_half',
        minHoursBeforeCheckin: 48,  // 2 days
        refundPercentage: 50,
        title: '50% Partial Refund',
        description: 'Cancel between 48 hours and 7 days before check-in for a 50% refund.'
    },
    {
        id: 'tier_none',
        minHoursBeforeCheckin: 0,
        refundPercentage: 0,
        title: 'Non-Refundable',
        description: 'Cancellations within 48 hours of check-in are non-refundable as provisions are already allocated.'
    }
];

/**
 * Calculate refund eligibility for a booking given check-in date
 * @param {string|Date} checkInDate - Date of check-in
 * @param {number} totalAmount - Total booking fare in INR
 * @returns {{ refundPercentage: number, refundAmount: number, tier: string, hoursRemaining: number, reason: string }}
 */
export function calculateRefundAmount(checkInDate, totalAmount = 0) {
    let checkInTime = new Date(checkInDate).getTime();
    const now = Date.now();
    
    // If checkInDate is a formatted string or label like "Upcoming Weekend (2D / 1N)"
    if (isNaN(checkInTime) && typeof checkInDate === 'string') {
        const match = checkInDate.match(/\d{4}-\d{2}-\d{2}/);
        if (match) {
            checkInTime = new Date(match[0]).getTime();
        }
    }

    if (isNaN(checkInTime)) {
        return {
            refundPercentage: 100,
            refundAmount: totalAmount,
            tier: 'tier_full',
            hoursRemaining: 168,
            reason: '100% full refund eligible when cancelled at least 7 days prior to check-in.'
        };
    }

    const diffMs = checkInTime - now;
    const hoursRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

    for (const tier of CANCELLATION_TIERS) {
        if (hoursRemaining >= tier.minHoursBeforeCheckin) {
            const refundAmount = Math.round((totalAmount * tier.refundPercentage) / 100);
            return {
                refundPercentage: tier.refundPercentage,
                refundAmount,
                tier: tier.id,
                hoursRemaining,
                reason: tier.description
            };
        }
    }

    return {
        refundPercentage: 0,
        refundAmount: 0,
        tier: 'tier_none',
        hoursRemaining,
        reason: 'Within 48 hours of arrival (provisions locked)'
    };
}
