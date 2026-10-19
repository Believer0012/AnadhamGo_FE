import { NextResponse } from 'next/server';
import { getAdminPayload } from '@/lib/authConfig';
import {
    getSecurityOverview,
    adminModifyBlock,
    recordSecurityEvent,
    exportSecurityState
} from '@/lib/securityTracker';
import { recordAuditEvent, logCrash } from '@/lib/auditLedger';

function isMasterAdmin(admin) {
    return Boolean(admin && admin.isMasterAdmin === true && admin.role === 'admin_coordinator');
}

export async function GET(request) {
    const admin = getAdminPayload(request);
    if (!admin) {
        return NextResponse.json({ success: false, message: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100', 10);
        const offset = parseInt(searchParams.get('offset') || '0', 10);
        const overview = getSecurityOverview({ limit, offset });
        return NextResponse.json(overview);
    } catch (err) {
        logCrash({ source: 'ADMIN_SECURITY', route: 'GET /api/admin/security', error: err, request });
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    const admin = getAdminPayload(request);
    if (!admin) {
        return NextResponse.json({ success: false, message: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { action } = body;
        const actorName = admin.campName || 'Admin Coordinator (Master HQ)';

        // Manual block / unblock (master admin only — destructive operations)
        if (action === 'block' || action === 'unblock') {
            if (!isMasterAdmin(admin)) {
                return NextResponse.json({ success: false, message: 'Master admin scope required for block management.' }, { status: 403 });
            }
            const { type, value, reason, durationMs } = body;
            if (type !== 'ip' && type !== 'device') {
                return NextResponse.json({ success: false, message: 'type must be "ip" or "device".' }, { status: 400 });
            }
            if (!value) {
                return NextResponse.json({ success: false, message: 'value is required.' }, { status: 400 });
            }
            const result = adminModifyBlock({
                action,
                type,
                value: String(value).slice(0, 200),
                reason: reason ? String(reason).slice(0, 300) : undefined,
                durationMs: Number(durationMs) || undefined,
                actor: actorName
            });
            return NextResponse.json({ success: true, ...result });
        }

        // Export full security state bundle (master admin only)
        if (action === 'export') {
            if (!isMasterAdmin(admin)) {
                return NextResponse.json({ success: false, message: 'Master admin scope required for export.' }, { status: 403 });
            }
            recordAuditEvent({
                category: 'SECURITY',
                action: 'SECURITY_STATE_EXPORTED',
                actor: actorName,
                actorRole: 'admin_coordinator',
                details: 'Full security state bundle exported by admin',
                status: 'SUCCESS',
                severity: 'INFO'
            }, request);
            return NextResponse.json({ success: true, ...exportSecurityState() });
        }

        return NextResponse.json({ success: false, message: `Unknown action: ${action}` }, { status: 400 });
    } catch (err) {
        logCrash({ source: 'ADMIN_SECURITY', route: 'POST /api/admin/security', error: err, request });
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}