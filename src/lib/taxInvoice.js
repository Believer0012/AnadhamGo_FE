/**
 * GST Tax Invoicing (SAC 9963) & INR Currency Standardization
 * Pinned strictly to Indian Rupees (INR / ₹) for all Razorpay & UPI transactions.
 */

export const SAC_CODE = '9963'; // Accommodation, food & beverage services in camps/holiday homes
export const GST_RATE_PERCENT = 5.0; // 5% GST for mountain camping
export const DEFAULT_CURRENCY = 'INR';
export const CURRENCY_SYMBOL = '₹';

/**
 * Format any numeric amount to clean Indian Rupees string (e.g. ₹3,998)
 * @param {number} amount 
 * @returns {string} e.g. "₹3,998"
 */
export function formatINR(amount) {
    const num = Number(amount) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
}

/**
 * Generate a GST-compliant invoice breakdown for a booking
 * @param {object} booking
 * @returns {object}
 */
export function generateGstInvoiceBreakdown(booking) {
    const totalAmount = Number(booking.total) || 0;
    
    // Reverse calculate base and GST (tax inclusive)
    const baseFare = Math.round((totalAmount * 100) / (100 + GST_RATE_PERCENT));
    const gstTotal = totalAmount - baseFare;
    const cgst = Math.round(gstTotal / 2);
    const sgst = gstTotal - cgst;

    return {
        invoiceNumber: `INV-AN-${booking.id?.replace(/[^A-Z0-9]/g, '')}`,
        sacCode: SAC_CODE,
        sacDescription: 'Camping & Outdoor Accommodation Services',
        baseFare,
        gstRate: `${GST_RATE_PERCENT}%`,
        cgstAmount: cgst,
        sgstAmount: sgst,
        gstTotal,
        grandTotal: totalAmount,
        currency: 'INR',
        currencySymbol: '₹',
        supplierDetails: {
            legalName: 'Aanandham Wilderness Stays Pvt Ltd',
            state: 'Kerala',
            stateCode: '32'
        }
    };
}

