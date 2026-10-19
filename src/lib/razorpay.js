import crypto from 'crypto';
import { getPmsBaseUrl } from './pmsClient';

// ─────────────────────────────────────────────────────────────────────────────
// RAZORPAY CREDENTIALS — fetched from OpenPMS (single source of truth)
//
// The PMS stores credentials encrypted in PostgreSQL (AES-256-GCM).
// The website fetches them once at runtime via a private server-to-server call
// authenticated by a shared PMS_INTERNAL_TOKEN. Local env vars are fallback only.
// ─────────────────────────────────────────────────────────────────────────────

// Module-level cache: populated on first createRazorpayOrder / verifyWebhook call
let _cachedCreds = null;
let _credsFetchedAt = 0;
const CREDS_TTL_MS = 5 * 60 * 1000; // re-fetch from PMS every 5 minutes

async function getRazorpayCreds() {
    const now = Date.now();
    if (_cachedCreds && (now - _credsFetchedAt) < CREDS_TTL_MS) {
        return _cachedCreds;
    }

    const pmsUrl = getPmsBaseUrl();
    const internalToken = process.env.PMS_INTERNAL_TOKEN;

    // Attempt to fetch from PMS
    if (internalToken) {
        try {
            const res = await fetch(`${pmsUrl}/api/payments/config`, {
                headers: { Authorization: `Bearer ${internalToken}` },
                signal: AbortSignal.timeout(3000),
                cache: 'no-store'
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.keyId && data.keySecret) {
                    _cachedCreds = {
                        keyId: data.keyId,
                        keySecret: data.keySecret,
                        webhookSecret: data.webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || null,
                        source: data.source
                    };
                    _credsFetchedAt = now;
                    return _cachedCreds;
                }
            }
        } catch (err) {
            console.warn('[Razorpay] PMS credential fetch failed, using local env fallback:', err.message);
        }
    }

    // Fallback: use local env vars (for dev or if PMS is unreachable)
    const keyId = process.env.RAZORPAY_KEY_ID || null;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || null;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || null;

    if (keyId && keySecret) {
        _cachedCreds = { keyId, keySecret, webhookSecret, source: 'env' };
        _credsFetchedAt = now;
        return _cachedCreds;
    }

    return null; // No credentials configured anywhere
}

/**
 * Create a Razorpay Order
 * @param {object} params
 * @param {number} params.amountInRupees - Amount in INR (will be converted to paise)
 * @param {string} params.receiptId - Booking ID / Receipt identifier
 * @param {object} params.notes - Metadata dictionary
 */
export async function createRazorpayOrder({ amountInRupees, receiptId, notes = {} }) {
    const creds = await getRazorpayCreds();

    if (!creds) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Payment gateway service is temporarily unavailable. Please try again shortly or connect with our 24/7 WhatsApp Concierge.');
        }
        // Fallback for development / demo mode when no credentials are configured
        console.warn('[Razorpay] No credentials found — returning mock dev order.');
        return {
            id: `order_dev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            amount: Math.round(amountInRupees * 100),
            currency: 'INR',
            receipt: receiptId,
            status: 'created',
            mock: true
        };
    }

    try {
        const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString('base64');
        const res = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: Math.round(amountInRupees * 100), // Razorpay expects amount in paise
                currency: 'INR',
                receipt: receiptId,
                notes
            })
        });

        if (!res.ok) {
            const errData = await res.text();
            throw new Error(`Razorpay Order creation failed: ${errData}`);
        }

        const orderJson = await res.json();
        return {
            ...orderJson,
            key_id: creds.keyId
        };
    } catch (err) {
        console.error('Error creating Razorpay Order:', err);
        throw err;
    }
}

/**
 * Verify Razorpay Webhook Signature (HMAC-SHA256)
 * @param {string} rawBody - Raw unparsed webhook request body string
 * @param {string} signature - Header 'x-razorpay-signature'
 */
export async function verifyWebhookSignature(rawBody, signature) {
    const creds = await getRazorpayCreds();
    const webhookSecret = creds?.webhookSecret || null;

    if (!webhookSecret) {
        console.warn('[Razorpay] RAZORPAY_WEBHOOK_SECRET not set, signature verification skipped in dev.');
        return process.env.NODE_ENV !== 'production';
    }

    if (!signature || !rawBody) return false;

    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
}

/**
 * Trigger Instant Automated Refund for an expired / race-collision payment
 * @param {string} paymentId - Razorpay Payment ID (e.g. `pay_29QQoUBcxNqk0q`)
 * @param {number} amountInRupees - Amount to refund
 * @param {string} reason - Refund reason notes
 */
export async function triggerAutoRefund(paymentId, amountInRupees, reason = 'Slot expired before payment capture') {
    const creds = await getRazorpayCreds();

    if (!creds) {
        console.log(`[Dev Mock Refund] Initiated refund for payment ${paymentId} of ₹${amountInRupees}. Reason: ${reason}`);
        return { id: `rfnd_dev_${Date.now()}`, status: 'processed', mock: true };
    }

    try {
        const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString('base64');
        const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: Math.round(amountInRupees * 100),
                notes: { reason, autoRefund: true }
            })
        });

        if (!res.ok) {
            const errData = await res.text();
            throw new Error(`Razorpay Refund failed: ${errData}`);
        }

        return await res.json();
    } catch (err) {
        console.error('Error issuing Razorpay auto-refund:', err);
        throw err;
    }
}

/**
 * Validate incoming IP address against official Razorpay Webhook egress CIDRs
 * @param {string} ip - Client IP address
 */
export function isRazorpayIp(ip) {
    if (!ip || typeof ip !== 'string') return false;

    // Allow in non-production, loopback, or if explicitly bypassed in env
    if (
        process.env.NODE_ENV !== 'production' ||
        process.env.RAZORPAY_BYPASS_IP_CHECK === 'true' ||
        ip === '127.0.0.1' ||
        ip === '::1' ||
        ip === 'localhost' ||
        ip === 'unknown'
    ) {
        return true;
    }

    const cleanIp = ip.trim().replace(/^::ffff:/, ''); // normalize IPv4-mapped IPv6

    // Configurable via environment variables (comma-separated IP list or CIDRs)
    if (process.env.RAZORPAY_WEBHOOK_IPS) {
        const envIps = process.env.RAZORPAY_WEBHOOK_IPS.split(',').map(s => s.trim()).filter(Boolean);
        if (envIps.includes(cleanIp)) return true;
        for (const envPrefix of envIps) {
            if (cleanIp.startsWith(envPrefix)) return true;
        }
    }

    // Official Razorpay Webhook IP ranges (AWS Mumbai regions & Razorpay edge)
    const RAZORPAY_IPS = [
        '52.66.195.100', '52.66.195.101', '52.66.195.102', '52.66.195.103',
        '52.66.195.104', '52.66.195.105', '52.66.195.106', '52.66.195.107',
        '52.66.195.108', '52.66.195.109', '52.66.195.110', '52.66.195.111',
        '52.66.195.112', '52.66.195.113', '52.66.195.114', '52.66.195.115',
        '52.66.195.116', '52.66.195.117', '52.66.195.118', '52.66.195.119',
        '52.66.195.120', '52.66.195.121', '52.66.195.122', '52.66.195.123',
        '52.66.195.124', '52.66.195.125'
    ];

    if (RAZORPAY_IPS.includes(cleanIp)) return true;

    // CIDR prefix matchers
    if (cleanIp.startsWith('52.66.195.')) return true;
    if (cleanIp.startsWith('13.235.')) return true;
    if (cleanIp.startsWith('3.109.')) return true;
    if (cleanIp.startsWith('15.207.')) return true;

    return false;
}
