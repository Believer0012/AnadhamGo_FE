import { NextResponse } from 'next/server';
import { getAdminPayload, getClientMetadata } from '@/lib/authConfig';
import {
    recordAuditEvent,
    recordWalMutation,
    revertWalMutation,
    createDatabaseSnapshot,
    listDatabaseSnapshots,
    restoreDatabaseSnapshot,
    getUnifiedAuditStream,
    logCrash,
    exportFullLedger,
    importFullLedger
} from '@/lib/auditLedger';

// Privileged recovery operations require master-admin scope
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
        const category = searchParams.get('category') || 'all';
        const search = searchParams.get('search') || '';
        const limit = parseInt(searchParams.get('limit') || '100', 10);
        const offset = parseInt(searchParams.get('offset') || '0', 10);

        const result = getUnifiedAuditStream({ category, search, limit, offset });
        const clientInfo = getClientMetadata(request);

        return NextResponse.json({
            success: true,
            ...result,
            activeClientInfo: clientInfo
        });
    } catch (err) {
        console.error('Audit query error:', err);
        logCrash({ source: 'ADMIN_AUDIT', route: 'GET /api/admin/audit', error: err, request });
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

        // 1. One-Click WAL Revert / Undo (master admin only — destructive)
        if (action === 'revert_wal') {
            if (!isMasterAdmin(admin)) {
                return NextResponse.json({ success: false, message: 'Master admin scope required for WAL rollback.' }, { status: 403 });
            }
            const { walId } = body;
            if (!walId) {
                return NextResponse.json({ success: false, message: 'walId is required' }, { status: 400 });
            }
            const revertResult = await revertWalMutation(walId, actorName);
            return NextResponse.json({
                success: true,
                message: `Successfully reverted ${revertResult.entityType} mutation ${walId}`,
                ...revertResult
            });
        }

        // 2. Create Instant Point-in-Time DB Snapshot (master admin only)
        if (action === 'create_snapshot') {
            if (!isMasterAdmin(admin)) {
                return NextResponse.json({ success: false, message: 'Master admin scope required for snapshots.' }, { status: 403 });
            }
            const { label } = body;
            const snapshot = await createDatabaseSnapshot(label || 'Manual Snapshot', actorName);
            return NextResponse.json({
                success: true,
                message: `Created database snapshot "${snapshot.label}"`,
                snapshot
            });
        }

        // 3. Restore Database to a Point-in-Time Snapshot (master admin only — destructive)
        if (action === 'restore_snapshot') {
            if (!isMasterAdmin(admin)) {
                return NextResponse.json({ success: false, message: 'Master admin scope required for snapshot restore.' }, { status: 403 });
            }
            const { snapshotId } = body;
            if (!snapshotId) {
                return NextResponse.json({ success: false, message: 'snapshotId is required' }, { status: 400 });
            }
            const restoreResult = await restoreDatabaseSnapshot(snapshotId, actorName);
            return NextResponse.json({
                success: true,
                message: `Successfully restored database to snapshot ${snapshotId}`,
                ...restoreResult
            });
        }

        // 4. Record a generic frontend / client audit event
        if (action === 'record_event') {
            if (!isMasterAdmin(admin)) {
                return NextResponse.json({ success: false, message: 'Master admin scope required for audit event recording.' }, { status: 403 });
            }
            const { event } = body;
            if (!event) {
                return NextResponse.json({ success: false, message: 'event is required' }, { status: 400 });
            }
            const recorded = recordAuditEvent(event, request);
            return NextResponse.json({ success: true, event: recorded });
        }

        // 5. Record a frontend-initiated WAL state mutation
        if (action === 'record_wal') {
            if (!isMasterAdmin(admin)) {
                return NextResponse.json({ success: false, message: 'Master admin scope required for WAL mutation recording.' }, { status: 403 });
            }
            const { mutation } = body;
            if (!mutation) {
                return NextResponse.json({ success: false, message: 'mutation is required' }, { status: 400 });
            }
            const walEntry = recordWalMutation({
                ...mutation,
                actor: mutation.actor || actorName,
                request
            });
            return NextResponse.json({ success: true, walEntry });
        }

        // 6. Export full WAL + audit + snapshot bundle for offline backup (master admin only)
        if (action === 'export_backup') {
            if (!isMasterAdmin(admin)) {
                return NextResponse.json({ success: false, message: 'Master admin scope required for backup export.' }, { status: 403 });
            }
            recordAuditEvent({
                category: 'SYSTEM',
                action: 'BACKUP_EXPORTED',
                actor: actorName,
                actorRole: 'admin_coordinator',
                details: 'Full WAL + audit + snapshot bundle exported by admin',
                status: 'SUCCESS',
                severity: 'INFO'
            }, request);
            return NextResponse.json({ success: true, ...exportFullLedger() });
        }

        // 7. Restore WAL + audit ledger from an uploaded backup bundle (master admin only — destructive)
        if (action === 'restore_backup') {
            if (!isMasterAdmin(admin)) {
                return NextResponse.json({ success: false, message: 'Master admin scope required for backup restore.' }, { status: 403 });
            }
            const { bundle } = body;
            if (!bundle || !Array.isArray(bundle.auditLogs)) {
                return NextResponse.json({ success: false, message: 'Valid backup bundle required (auditLogs array).' }, { status: 400 });
            }
            const restored = importFullLedger(bundle);
            recordAuditEvent({
                category: 'SYSTEM',
                action: 'BACKUP_RESTORED',
                actor: actorName,
                actorRole: 'admin_coordinator',
                details: 'Ledger bundle restored from backup',
                status: 'WARNING',
                severity: 'HIGH'
            }, request);
            return NextResponse.json({ success: true, ...restored });
        }

        return NextResponse.json({ success: false, message: `Unknown action: ${action}` }, { status: 400 });
    } catch (err) {
        console.error('Audit mutation error:', err);
        logCrash({ source: 'ADMIN_AUDIT', route: 'POST /api/admin/audit', error: err, request });
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
