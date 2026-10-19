// ─────────────────────────────────────────────────────────────
// PAYMENT & GATEWAY SETTINGS MANAGEMENT
// Controls "Coming Soon" vs "Live Razorpay" payment mode.
// Secure, non-hardcoded, and toggleable via environment variables or admin settings.
// ─────────────────────────────────────────────────────────────

export const DEFAULT_PAYMENT_SETTINGS = {
    mode: process.env.NEXT_PUBLIC_PAYMENT_MODE || 'coming_soon', // 'coming_soon' | 'razorpay'
    payeeName: 'Aanandham Wilderness Stays',
    allowPayOnArrival: true,
    razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
    phone: process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '919074858014',
    comingSoonTitle: 'Online Payment Gateway · Launching Soon',
    comingSoonMessage: 'Our automated instant payment checkout is launching soon. Reserve your campsite with zero upfront advance payment via our 24/7 Mountain Concierge Desk on WhatsApp.'
};

export function getPaymentSettings() {
    if (typeof window === 'undefined') return DEFAULT_PAYMENT_SETTINGS;
    try {
        const envOverride = process.env.NEXT_PUBLIC_PAYMENT_MODE;
        const saved = localStorage.getItem('aanandham_payment_settings');
        
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                ...DEFAULT_PAYMENT_SETTINGS,
                ...parsed,
                mode: envOverride || parsed.mode || DEFAULT_PAYMENT_SETTINGS.mode
            };
        }

        if (envOverride) {
            return { ...DEFAULT_PAYMENT_SETTINGS, mode: envOverride };
        }
    } catch (e) {
        console.error('Failed to load payment settings', e);
    }
    return DEFAULT_PAYMENT_SETTINGS;
}

export function savePaymentSettings(settings) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('aanandham_payment_settings', JSON.stringify(settings));
        if (typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(new Event('aanandham_payment_settings_updated'));
        }
    } catch (e) {
        console.error('Failed to save payment settings', e);
    }
}
