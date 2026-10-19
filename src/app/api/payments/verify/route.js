import { NextResponse, after } from 'next/server';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/redis';
import { getStoredBookings, updateServerBooking } from '@/lib/serverBookingStore';
import { getClientIp } from '@/lib/authConfig';
import { sendBookingConfirmationEmail } from '@/lib/email';
import { getPmsBaseUrl } from '@/lib/pmsClient';

// POST: verify a Razorpay checkout payment and confirm the booking.
// Client calls this after the Razorpay checkout handler fires (payment success).
// The Razorpay webhook is the authoritative path in production; this endpoint
// verifies the standard checkout signature and confirms the booking so the
// guest sees their pass immediately.
export async function POST(request) {
    try {
        const ip = getClientIp(request);
        const rateLimit = await checkRateLimit(`ratelimit:rzp_verify:${ip}`, 30, 60);
        if (!rateLimit.allowed) {
            return NextResponse.json({ success: false, message: 'Too many payment verification attempts. Try again shortly.' }, { status: 429 });
        }

        let body;
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
        }

        const bookingId = String(body.bookingId || body.id || '').slice(0, 60);
        const orderId = String(body.orderId || body.razorpay_order_id || '').slice(0, 60);
        const paymentId = String(body.paymentId || body.razorpay_payment_id || '').slice(0, 60);
        const signature = String(body.signature || body.razorpay_signature || '').slice(0, 200);

        if (!bookingId || !orderId || !paymentId) {
            return NextResponse.json({ success: false, message: 'Missing payment verification details' }, { status: 400 });
        }

        const bookings = await getStoredBookings();
        const booking = bookings.find(b => b.id === bookingId);

        // 1. Primary: Forward payment verification directly to OpenPMS
        const pmsUrl = getPmsBaseUrl();
        try {
            const pmsRes = await fetch(`${pmsUrl}/api/payments/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.PMS_INTERNAL_TOKEN || 'pms_int_aanandham_hq_j4j0yrc1valjk3ajy30chh'}`,
                    'X-Internal-Token': process.env.PMS_INTERNAL_TOKEN || 'pms_int_aanandham_hq_j4j0yrc1valjk3ajy30chh'
                },
                body: JSON.stringify({
                    ...body,
                    bookingId,
                    orderId,
                    paymentId,
                    signature,
                    booking: booking || body.booking || null
                }),
                signal: AbortSignal.timeout(4000)
            });
            if (pmsRes.ok) {
                const pmsData = await pmsRes.json();
                if (pmsData.success) {
                    const confirmedBooking = {
                        ...(booking || {}),
                        id: bookingId,
                        status: 'Confirmed',
                        paymentId,
                        utrNumber: paymentId,
                        paidAt: new Date().toISOString()
                    };
                    await updateServerBooking(bookingId, {
                        status: 'Confirmed',
                        paymentId,
                        utrNumber: paymentId,
                        paidAt: new Date().toISOString()
                    });

                    after(async () => {
                        try {
                            await sendBookingConfirmationEmail(confirmedBooking);
                        } catch (mailErr) {
                            console.error('[EMAIL DISPATCH ERROR]', mailErr.message);
                        }
                    });

                    return NextResponse.json(pmsData);
                }
            }
        } catch (pmsErr) {
            console.warn('[OpenPMS Verify Delegation Failed, checking locally]:', pmsErr.message);
        }

        if (!booking) {
            return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
        }

        // Already confirmed (idempotent — webhook may have beaten us)
        if (booking.status === 'Confirmed' || booking.razorpayPaymentId) {
            return NextResponse.json({ success: true, bookingId: booking.id, status: 'Confirmed', alreadyConfirmed: true });
        }

        // Demo/dev orders (created without Razorpay credentials) are confirmed
        // directly — no real money moved in this mode.
        const isMockOrder = String(orderId).startsWith('order_dev_');
        if (!isMockOrder) {
            // Fetch key secret from PMS (single source of truth)
            let keySecret = null;
            const pmsUrl = getPmsBaseUrl();
            const internalToken = process.env.PMS_INTERNAL_TOKEN;
            if (internalToken) {
                try {
                    const cfgRes = await fetch(`${pmsUrl}/api/payments/config`, {
                        headers: { Authorization: `Bearer ${internalToken}` },
                        signal: AbortSignal.timeout(3000),
                        cache: 'no-store'
                    });
                    if (cfgRes.ok) {
                        const cfgData = await cfgRes.json();
                        if (cfgData.success) keySecret = cfgData.keySecret;
                    }
                } catch (_) {}
            }
            // Fallback: local env
            keySecret = keySecret || process.env.RAZORPAY_KEY_SECRET;

            if (!keySecret) {
                if (process.env.NODE_ENV === 'production') {
                    return NextResponse.json({ success: false, message: 'Payment gateway not configured' }, { status: 503 });
                }
                // Dev without keys: accept (nothing was actually charged)
            } else {
                const expected = crypto
                    .createHmac('sha256', keySecret)
                    .update(`${orderId}|${paymentId}`)
                    .digest('hex');
                const sigBuf = Buffer.from(String(signature));
                const expBuf = Buffer.from(expected);
                const valid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
                if (!valid) {
                    console.error(`⚠️ Invalid Razorpay checkout signature for booking ${bookingId}`);
                    return NextResponse.json({ success: false, message: 'Payment signature verification failed' }, { status: 400 });
                }
            }
        }

        // Money integrity: paid amount derived from server-authoritative total
        const total = Number(booking.total) || 0;
        const advanceRatio = String(booking.paymentMode || '').includes('30%') ? 0.3 : 1;
        const paidAmount = Math.round(total * advanceRatio);

        await updateServerBooking(booking.id, {
            status: 'Confirmed',
            paidAmount,
            balanceDue: Math.max(0, total - paidAmount),
            utrNumber: paymentId,
            razorpayPaymentId: paymentId,
            razorpayOrderId: orderId,
            paidAt: new Date().toISOString(),
            paymentVerifiedAt: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            bookingId: booking.id,
            status: 'Confirmed',
            paidAmount,
            balanceDue: Math.max(0, total - paidAmount)
        });
    } catch (err) {
        console.error('[PAYMENT VERIFY ERROR]', err);
        return NextResponse.json({ success: false, message: 'Server error verifying payment.' }, { status: 500 });
    }
}