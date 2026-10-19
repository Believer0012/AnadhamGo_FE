import { NextResponse, after } from 'next/server';
import { getClientIp } from '@/lib/authConfig';
import { checkRateLimit, isIpBlocked } from '@/lib/redis';
import { addStoredInquiry } from '@/lib/inquiryStore';
import { sendContactInquiryEmail } from '@/lib/email';
import { sanitizeLogOutput } from '@/lib/dlpSanitizer';
import { checkSecurityGate } from '@/lib/securityTracker';

export async function POST(request) {
    const ip = getClientIp(request);

    // 1. IP Blocklist Check
    if (await isIpBlocked(ip)) {
        return NextResponse.json({ success: false, message: 'Access restricted.' }, { status: 403 });
    }

    // 1.5 Security Gate (device fingerprint + bot heuristics + tiered blocks)
    const gate = checkSecurityGate(request, String(request.headers.get('x-device-fingerprint') || '').slice(0, 400));
    if (!gate.allowed) {
        return NextResponse.json({ success: false, message: gate.reason || 'Access restricted.' }, { status: gate.status || 403 });
    }

    // 2. Rate Limit (Max 5 contact requests per 2 minutes per IP)
    const rateLimit = await checkRateLimit(`ratelimit:contact:${ip}`, 5, 120);
    if (!rateLimit.allowed) {
        return NextResponse.json({ success: false, message: 'Too many requests. Please wait a minute.' }, { status: 429 });
    }

    try {
        const body = await request.json();

        // 3. Honeypot check
        if (body.honeypot && String(body.honeypot).trim().length > 0) {
            return NextResponse.json({ success: true, message: 'Inquiry received' });
        }

        const name = String(body.name || '').trim();
        const email = String(body.email || '').trim();
        const phone = String(body.phone || 'N/A').trim();
        const inquiryType = String(body.inquiryType || 'general').trim();
        const guests = Number(body.guests) || 2;
        const travelDates = String(body.travelDates || 'Flexible').trim();
        const message = String(body.message || '').trim();

        if (!name || !email) {
            return NextResponse.json({ success: false, message: 'Name and email are required.' }, { status: 400 });
        }

        const timestampPart = Date.now().toString(36).toUpperCase();
        const inquiryId = `INQ-${timestampPart}`;

        const newRecord = {
            id: inquiryId,
            name,
            email,
            phone,
            inquiryType,
            guests,
            travelDates,
            message,
            source: 'Contact Form (Email Mode)',
            createdAt: new Date().toISOString()
        };

        // Store as a standalone inquiry (never a Booking row — inquiries must not
        // hold camp capacity or appear in the bookings pipeline)
        await addStoredInquiry(newRecord);

        // Dispatch Resend Email in background
        after(async () => {
            try {
                await sendContactInquiryEmail({
                    id: inquiryId,
                    name,
                    email,
                    phone,
                    inquiryType,
                    guests,
                    travelDates,
                    message
                });
            } catch (err) {
                console.error(sanitizeLogOutput(`[CONTACT DISPATCH ERROR] ${err.message}`));
            }
        });

        return NextResponse.json({
            success: true,
            inquiryId,
            message: 'Inquiry received. Confirmation dispatched via email.'
        });
    } catch (err) {
        console.error('[CONTACT API ERROR]', err);
        return NextResponse.json({ success: false, message: 'Server error processing inquiry.' }, { status: 500 });
    }
}
