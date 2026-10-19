import { NextResponse, after } from 'next/server';
import { verifyWebhookSignature, triggerAutoRefund, isRazorpayIp } from '@/lib/razorpay';
import { getStoredBookings, updateServerBooking } from '@/lib/serverBookingStore';
import { isWebhookProcessed, markWebhookProcessed } from '@/lib/redis';
import { getClientIp } from '@/lib/authConfig';
import { prisma, isPrismaConfigured } from '@/lib/prisma';
import { sendBookingConfirmationEmail } from '@/lib/email';
import { getPmsBaseUrl } from '@/lib/pmsClient';

export async function POST(request) {
    try {
        const ip = getClientIp(request);

        // 1. IP Allowlist Verification (Razorpay official egress IPs)
        if (!isRazorpayIp(ip)) {
            console.error(`⚠️ Rejected webhook from untrusted IP: ${ip}`);
            return NextResponse.json({ success: false, message: 'Forbidden: IP origin not authorized' }, { status: 403 });
        }

        const rawBody = await request.text();
        const signature = request.headers.get('x-razorpay-signature');

        // 2. Cryptographic HMAC Signature Verification
        const isSignatureValid = verifyWebhookSignature(rawBody, signature);
        if (!isSignatureValid) {
            console.error('⚠️ Invalid Razorpay webhook signature received');
            return NextResponse.json({ success: false, message: 'Invalid webhook signature' }, { status: 400 });
        }

        const payload = JSON.parse(rawBody);
        const eventId = payload.event_id || `${payload.event}_${payload.created_at}`;

        // 3. Distributed Idempotency Verification (Redis + DB + Memory)
        const alreadyProcessedInRedis = await isWebhookProcessed(eventId);
        if (alreadyProcessedInRedis) {
            console.log(`ℹ️ Skipping duplicate webhook event ${eventId} (Redis dedupe hit)`);
            return NextResponse.json({ success: true, message: 'Event already processed' });
        }

        if (isPrismaConfigured && prisma) {
            try {
                const existingDbEvent = await prisma.webhookEvent.findUnique({
                    where: { id: eventId }
                });
                if (existingDbEvent) {
                    console.log(`ℹ️ Skipping duplicate webhook event ${eventId} (DB dedupe hit)`);
                    await markWebhookProcessed(eventId);
                    return NextResponse.json({ success: true, message: 'Event already processed' });
                }
            } catch (e) {
                console.error('Error checking DB webhook dedupe:', e);
            }
        }

        const event = payload.event;
        const paymentEntity = payload.payload?.payment?.entity;
        const refundEntity = payload.payload?.refund?.entity;
        const orderId = paymentEntity?.order_id || payload.payload?.order?.entity?.id || refundEntity?.notes?.order_id;
        const paymentId = paymentEntity?.id || refundEntity?.payment_id;

        // ── A. Handle Refund Webhook Events ──
        if (event === 'payment.refunded' || event === 'refund.processed' || event === 'refund.created') {
            const bookings = await getStoredBookings();
            const booking = bookings.find(b => 
                (paymentId && b.paymentId === paymentId) ||
                (orderId && b.razorpayOrderId === orderId) ||
                (paymentEntity?.notes?.receipt && b.id === paymentEntity.notes.receipt) ||
                (refundEntity?.notes?.receipt && b.id === refundEntity.notes.receipt)
            );

            if (booking) {
                await updateServerBooking(booking.id, {
                    status: 'Refunded',
                    refundReason: refundEntity?.notes?.reason || 'Refund processed via Razorpay gateway',
                    refundedAt: new Date().toISOString()
                });
                console.log(`↩️ Booking ${booking.id} updated to Refunded via webhook (${event}).`);
            }

            await markWebhookProcessed(eventId);
            if (isPrismaConfigured && prisma) {
                try {
                    await prisma.webhookEvent.create({
                        data: { id: eventId, event: event || 'refund', payload }
                    });
                } catch (e) {}
            }

            return NextResponse.json({ success: true, message: 'Refund event processed' });
        }

        // ── B. Handle Payment Failed Events ──
        if (event === 'payment.failed') {
            const bookings = await getStoredBookings();
            const booking = bookings.find(b => 
                (paymentId && b.paymentId === paymentId) ||
                (orderId && b.razorpayOrderId === orderId) ||
                (paymentEntity?.notes?.receipt && b.id === paymentEntity.notes.receipt)
            );

            if (booking && booking.status !== 'Confirmed') {
                await updateServerBooking(booking.id, {
                    status: 'Failed',
                    notes: `Payment failed: ${paymentEntity?.error_description || 'Customer payment declined or cancelled'}`
                });
                console.log(`❌ Booking ${booking.id} updated to Failed via webhook.`);
            }

            await markWebhookProcessed(eventId);
            return NextResponse.json({ success: true, message: 'Payment failed event processed' });
        }

        // ── C. Handle Payment Capture / Order Paid Events ──
        if (event === 'payment.captured' || event === 'order.paid') {
            const bookings = await getStoredBookings();
            const booking = bookings.find(b => b.razorpayOrderId === orderId || b.id === paymentEntity?.notes?.receipt);

            if (!booking) {
                console.warn(`Webhook received for unknown booking (order: ${orderId}). Auto-refunding.`);
                if (paymentEntity?.id) {
                    await triggerAutoRefund(paymentEntity.id, (paymentEntity.amount || 0) / 100, 'Unmatched booking order');
                }
                await markWebhookProcessed(eventId);
                return NextResponse.json({ success: true, message: 'Unmatched booking refunded' });
            }

            // If already confirmed by a previous concurrent event, mark and return cleanly
            if (booking.status === 'Confirmed') {
                await markWebhookProcessed(eventId);
                return NextResponse.json({ success: true, message: 'Booking already confirmed' });
            }

            const now = Date.now();
            const isHoldExpired = booking.holdExpiresAt && now > booking.holdExpiresAt;

            // 4. Amount & currency verification (bank-grade): the captured amount MUST
            //    exactly equal the server-validated booking total, in INR.
            const paidPaise = Number(paymentEntity?.amount);
            const expectedPaise = Math.round(Number(booking.total) * 100);
            const paidCurrency = String(paymentEntity?.currency || '').toUpperCase();
            const amountMismatch = !paidPaise || paidPaise !== expectedPaise || paidCurrency !== 'INR';

            if (amountMismatch) {
                console.warn(`⚠️ Payment amount mismatch for booking ${booking.id}: paid ₹${paidPaise / 100} ${paidCurrency} vs expected ₹${expectedPaise / 100} INR.`);
                if (paymentEntity?.id) {
                    await triggerAutoRefund(paymentEntity.id, (paidPaise || 0) / 100, 'Payment amount/currency mismatch');
                }
                await updateServerBooking(booking.id, {
                    status: 'Refunded',
                    refundReason: 'Payment amount/currency mismatch',
                    paymentId: paymentEntity?.id || null
                });
                await markWebhookProcessed(eventId);
                return NextResponse.json({ success: true, message: 'Mismatched payment refunded' });
            }

            // 5. First-Paid-Wins Verification: If slot expired before payment arrived
            if (isHoldExpired && booking.status !== 'Confirmed') {
                console.warn(`Booking ${booking.id} TTL expired before payment capture. Triggering instant refund.`);
                if (paymentEntity?.id) {
                    await triggerAutoRefund(paymentEntity.id, (paymentEntity.amount || 0) / 100, '10-minute hold expired');
                }
                await updateServerBooking(booking.id, {
                    status: 'Refunded',
                    refundReason: 'Payment captured after 10-minute hold expired',
                    paymentId: paymentEntity?.id || null
                });
                await markWebhookProcessed(eventId);
                return NextResponse.json({ success: true, message: 'Expired booking refunded' });
            }

            // 6. Confirm Booking (State write happens BEFORE mark-processed)
            await updateServerBooking(booking.id, {
                status: 'Confirmed',
                paymentId: paymentEntity?.id || `pay_${Date.now()}`,
                paidAt: new Date().toISOString()
            });

            // Mark processed ONLY after state write succeeds
            await markWebhookProcessed(eventId);
            if (isPrismaConfigured && prisma) {
                try {
                    await prisma.webhookEvent.create({
                        data: { id: eventId, event: event || 'payment.captured', payload }
                    });
                } catch (e) {}
            }

            console.log(`✅ Booking ${booking.id} successfully confirmed via Razorpay webhook.`);
            
            // Dispatch verified confirmation email safely post-response
            after(async () => {
                try {
                    await sendBookingConfirmationEmail({
                        ...booking,
                        status: 'Confirmed',
                        paymentId: paymentEntity?.id
                    });
                } catch (e) {
                    console.error('Error sending confirmation email on webhook capture:', e);
                }

                // Real-time broadcast of confirmed booking & payment into OpenPMS
                const pmsUrl = getPmsBaseUrl();
                try {
                    await fetch(`${pmsUrl}/api/bookings`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...booking,
                            status: 'Confirmed',
                            paymentId: paymentEntity?.id,
                            paidAmount: Number(paymentEntity?.amount || 0) / 100,
                            paidAt: new Date().toISOString()
                        }),
                        signal: AbortSignal.timeout(3000)
                    });
                } catch (pmsErr) {
                    console.error('[OpenPMS Webhook Sync Error]', pmsErr.message);
                }
            });

            return NextResponse.json({ success: true, message: 'Booking confirmed' });
        }

        // Mark unhandled non-critical events as processed
        await markWebhookProcessed(eventId);
        return NextResponse.json({ success: true, message: 'Event processed' });
    } catch (err) {
        console.error('Error handling Razorpay webhook:', err);
        return NextResponse.json({ success: false, message: 'Internal webhook handling error' }, { status: 500 });
    }
}
