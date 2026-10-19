import { NextResponse } from 'next/server';
import { getClientIp } from '@/lib/authConfig';
import { checkRateLimit, isIpBlocked } from '@/lib/redis';
import { checkSecurityGate, recordSecurityEvent } from '@/lib/securityTracker';
import { sanitizeLogOutput } from '@/lib/dlpSanitizer';

// Client-side security report endpoint (fingerprint + violation reporting).
// Never trusts the client — events are scored server-side and escalate blocks.
export async function POST(request) {
    const ip = getClientIp(request);

    if (await isIpBlocked(ip)) {
        return NextResponse.json({ success: false, message: 'Access restricted.' }, { status: 403 });
    }

    const rateLimit = await checkRateLimit(`ratelimit:security:${ip}`, 10, 60);
    if (!rateLimit.allowed) {
        return NextResponse.json({ success: false, message: 'Too many reports.' }, { status: 429 });
    }

    try {
        const body = await request.json();
        const eventType = String(body.eventType || 'SECURITY_EVENT').slice(0, 40);
        const action = String(body.action || 'CLIENT_REPORT').slice(0, 60);
        const details = String(body.details || '').slice(0, 500);
        const fingerprint = String(body.fingerprint || '').slice(0, 400);

        const gate = checkSecurityGate(request, fingerprint);
        if (!gate.allowed) {
            return NextResponse.json({ success: false, message: gate.reason, block: gate.block }, { status: gate.status });
        }

        const result = recordSecurityEvent({
            eventType,
            action,
            request,
            fingerprint,
            details: sanitizeLogOutput(details)
        });

        const blockedNow = result.triggeredBlocks.length > 0;
        return NextResponse.json({
            success: true,
            botScore: result.botScore,
            blockedNow,
            message: blockedNow ? 'Abuse pattern detected — access temporarily restricted.' : 'Report received.'
        });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
    }
}