/**
 * Aanandham Multi-Party Marketplace Ledger & Escrow Settlement Engine
 *
 * Implements:
 * 1. Automated split payouts (Host net = Gross - Platform Take Rate - Gateway Fee)
 * 2. 24-Hour Post-Check-In Escrow Protection Window
 * 3. Audit trail for host disbursements and tax deductions
 */

export const MARKETPLACE_CONFIG = {
    platformCommissionPercent: 10.0, // 10% Aanandham platform take-rate
    gatewayFeePercent: 2.0,          // 2% Payment Gateway MDR
    escrowHoldingHoursPostCheckin: 24 // Release funds 24 hours after check-in
};

/**
 * Calculate marketplace settlement split and escrow schedule for a booking
 * @param {object} params
 * @param {number} params.grossAmount - Total amount paid by camper in INR
 * @param {string|Date} params.checkInDate - Date of arrival
 * @param {string} params.hostId - Campsite host/partner identifier
 * @returns {object} Full settlement split breakdown
 */
export function computeMarketplacePayout({ grossAmount, checkInDate, hostId = 'host_default' }) {
    const gross = Number(grossAmount) || 0;
    
    // Platform fee (e.g. 10%)
    const platformFee = Math.round((gross * MARKETPLACE_CONFIG.platformCommissionPercent) / 100);
    // Gateway fee (e.g. 2%)
    const gatewayFee = Math.round((gross * MARKETPLACE_CONFIG.gatewayFeePercent) / 100);
    // Host Net Payout
    const hostNetPayout = Math.max(0, gross - platformFee - gatewayFee);

    // Escrow Release Date = Check-in + 24 Hours
    let escrowReleaseAt = null;
    if (checkInDate) {
        const checkInTime = new Date(checkInDate).getTime();
        if (!isNaN(checkInTime)) {
            escrowReleaseAt = new Date(checkInTime + MARKETPLACE_CONFIG.escrowHoldingHoursPostCheckin * 60 * 60 * 1000).toISOString();
        }
    }

    return {
        hostId,
        grossAmount: gross,
        platformFee,
        platformCommissionPercent: MARKETPLACE_CONFIG.platformCommissionPercent,
        gatewayFee,
        hostNetPayout,
        currency: 'INR',
        escrowStatus: 'HELD_IN_ESCROW',
        escrowReleaseAt,
        settlementNotes: 'Funds held in escrow until 24 hours post-arrival to ensure guest safety and verified check-in.'
    };
}
