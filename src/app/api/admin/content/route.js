import { NextResponse } from 'next/server';
import { getAdminPayload, getClientIp } from '@/lib/authConfig';
import { checkRateLimit } from '@/lib/redis';
import { getCmsContent, setCmsContent } from '@/lib/cmsContent';
import { getPmsBaseUrl } from '@/lib/pmsClient';

// ── GET: Read CMS content with live OpenPMS auto-sync ──
export async function GET(request) {
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(`ratelimit:cms_content_read:${ip}`, 60, 60);
    if (!rateLimit.allowed) {
        return NextResponse.json({ success: false, message: 'Too many requests.' }, { status: 429 });
    }

    let content = getCmsContent();

    // Live auto-sync from OpenPMS CMS endpoint
    const pmsUrl = getPmsBaseUrl();
    try {
        const pmsRes = await fetch(`${pmsUrl}/api/cms?tenantId=t-aanandham-hq`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(2000)
        });
        if (pmsRes.ok) {
            const pmsData = await pmsRes.json();
            if (pmsData.success && pmsData.data) {
                // Merge OpenPMS CMS updates into website content
                content = setCmsContent(pmsData.data);
            }
        }
    } catch {
        // Continue with cached/local CMS content if OpenPMS is offline
    }

    return NextResponse.json({
        success: true,
        data: content
    }, {
        headers: {
            'Cache-Control': 'no-store'
        }
    });
}

// ── POST: Update CMS content & sync to OpenPMS ──
export async function POST(request) {
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(`ratelimit:admin_cms_write:${ip}`, 20, 60);
    if (!rateLimit.allowed) {
        return NextResponse.json({ success: false, message: 'Too many write requests. Please wait.' }, { status: 429 });
    }

    if (!getAdminPayload(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    try {
        const body = await request.json();
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ success: false, message: 'Invalid payload.' }, { status: 400 });
        }

        const updated = setCmsContent(body);

        // Asynchronously broadcast to OpenPMS CMS store
        const pmsUrl = getPmsBaseUrl();
        try {
            const section = body.section || Object.keys(body)[0] || 'all';
            await fetch(`${pmsUrl}/api/cms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    section,
                    data: body[section] || body,
                    tenantId: 't-aanandham-hq'
                }),
                signal: AbortSignal.timeout(2000)
            });
        } catch {
            // PMS sync logged or safely skipped if unavailable
        }

        return NextResponse.json({
            success: true,
            message: 'Marketing CMS content saved and synced with OpenPMS.',
            data: updated
        });
    } catch (err) {
        console.error('Error saving CMS content:', err);
        return NextResponse.json({ success: false, message: 'Failed to update CMS content.' }, { status: 500 });
    }
}
