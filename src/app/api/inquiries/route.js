import { NextResponse } from 'next/server';
import { getClientIp, getAdminPayload } from '@/lib/authConfig';
import { checkRateLimit, isIpBlocked } from '@/lib/redis';
import { getStoredInquiries, addStoredInquiry } from '@/lib/inquiryStore';
import { sanitizeLogOutput } from '@/lib/dlpSanitizer';
import { checkSecurityGate } from '@/lib/securityTracker';
import { getPmsBaseUrl } from '@/lib/pmsClient';

export async function GET(request) {
    const admin = await getAdminPayload(request);
    if (!admin || !admin.isAdmin) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit')) || 100;
    const offset = Number(url.searchParams.get('offset')) || 0;

    const inquiries = await getStoredInquiries({ limit, offset });
    return NextResponse.json({ success: true, inquiries });
}

export async function POST(request) {
    const ip = getClientIp(request);

    if (await isIpBlocked(ip)) {
        return NextResponse.json({ success: false, message: 'Access restricted.' }, { status: 403 });
    }

    const gate = checkSecurityGate(request, String(request.headers.get('x-device-fingerprint') || '').slice(0, 400));
    if (!gate.allowed) {
        return NextResponse.json({ success: false, message: gate.reason || 'Access restricted.' }, { status: gate.status || 403 });
    }

    const rateLimit = await checkRateLimit(`ratelimit:inquiry:${ip}`, 5, 120);
    if (!rateLimit.allowed) {
        return NextResponse.json({ success: false, message: 'Too many requests. Please wait a minute.' }, { status: 429 });
    }

    try {
        const body = await request.json();

        if (body.honeypot && String(body.honeypot).trim().length > 0) {
            return NextResponse.json({ success: true, message: 'Inquiry received' });
        }

        const name = String(body.name || '').trim().slice(0, 120);
        const phone = String(body.phone || 'N/A').trim().slice(0, 24);
        const inquiryType = String(body.inquiryType || 'general').trim().slice(0, 40);
        const guests = Number(body.guests) || 2;
        const travelDates = String(body.travelDates || 'Flexible').trim().slice(0, 60);
        const message = String(body.message || '').trim().slice(0, 2000);
        const source = String(body.source || 'Contact Form').trim().slice(0, 80);

        if (!name) {
            return NextResponse.json({ success: false, message: 'Name is required.' }, { status: 400 });
        }

        const inquiryId = `INQ-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 4).toUpperCase()}`;

        const newRecord = {
            id: inquiryId,
            name,
            phone,
            email: String(body.email || '').trim().slice(0, 200),
            inquiryType,
            guests,
            travelDates,
            message,
            source,
            createdAt: new Date().toISOString()
        };

        await addStoredInquiry(newRecord);

        // Forward to OpenPMS CRM Inbound Pipeline
        const pmsUrl = getPmsBaseUrl();
        try {
            fetch(`${pmsUrl}/api/inquiries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    phone,
                    email: body.email || '',
                    inquiryType,
                    guests,
                    travelDates,
                    message,
                    source: source || 'Aanandham.go Website',
                    tenantId: 't-aanandham-hq',
                    campsiteId: body.campsiteId || null,
                    status: 'NEW_LEAD'
                }),
                signal: AbortSignal.timeout(3000)
            }).catch(() => {});
        } catch (pmsSyncErr) {}

        // Fire booking_start analytics ping so the funnel captures this conversion
        try {
            fetch(pmsUrl + '/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId: 't-aanandham-hq',
                    campId: body.campsiteId || 'general',
                    eventType: 'booking_start',
                    sessionId: body.sessionId || null,
                    channel: body.channel || 'direct',
                    path: '/enquire',
                }),
                signal: AbortSignal.timeout(2000)
            }).catch(() => {});
        } catch {}

        return NextResponse.json({ success: true, inquiryId, message: 'Inquiry received.' });
    } catch (err) {
        console.error(sanitizeLogOutput(`[INQUIRY API ERROR] ${err.message}`));
        return NextResponse.json({ success: false, message: 'Server error processing inquiry.' }, { status: 500 });
    }
}

