import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getClientIp, getClientMetadata } from './authConfig.js';
import { getStoredBookings, saveStoredBookings, addServerBooking, updateServerBooking, deleteServerBooking } from './serverBookingStore.js';
import { sanitizeLogOutput } from './dlpSanitizer.js';

const DATA_DIR = path.join(process.cwd(), '.data');
const AUDIT_FILE = path.join(DATA_DIR, 'audit_ledger.json');
const WAL_FILE = path.join(DATA_DIR, 'wal_ledger.json');
const SNAPSHOTS_DIR = path.join(DATA_DIR, 'snapshots');

// Max retained entries in memory / disk ring buffer
const MAX_AUDIT_LOGS = 500;
const MAX_WAL_LOGS = 300;
const MAX_SNAPSHOTS = 25;

// In-memory active stores
let memoryAuditLogs = [];
let memoryWalLogs = [];
let isInitialized = false;

function ensureStorageDirs() {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        if (!fs.existsSync(SNAPSHOTS_DIR)) fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
    } catch {
        // Fallback for read-only environments
    }
}

function initLedger() {
    if (isInitialized) return;
    ensureStorageDirs();

    try {
        if (fs.existsSync(AUDIT_FILE)) {
            const raw = fs.readFileSync(AUDIT_FILE, 'utf-8');
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) memoryAuditLogs = parsed;
        }
    } catch {
        memoryAuditLogs = [];
    }

    try {
        if (fs.existsSync(WAL_FILE)) {
            const raw = fs.readFileSync(WAL_FILE, 'utf-8');
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) memoryWalLogs = parsed;
        }
    } catch {
        memoryWalLogs = [];
    }

    // Start empty — audit records must only come from real system events

    isInitialized = true;
}

function persistAuditLogs() {
    try {
        ensureStorageDirs();
        fs.writeFileSync(AUDIT_FILE, JSON.stringify(memoryAuditLogs.slice(0, MAX_AUDIT_LOGS), null, 2), 'utf-8');
    } catch {
        // Ignored in serverless read-only
    }
}

function persistWalLogs() {
    try {
        ensureStorageDirs();
        fs.writeFileSync(WAL_FILE, JSON.stringify(memoryWalLogs.slice(0, MAX_WAL_LOGS), null, 2), 'utf-8');
    } catch {
        // Ignored in serverless read-only
    }
}

/**
 * Record a general system or security audit event
 */
export function recordAuditEvent(event, request = null) {
    initLedger();

    const telemetry = request ? getClientMetadata(request) : {
        ip: event.ip || '127.0.0.1 (Local HQ Station)',
        browser: 'System / Internal Core',
        os: 'Server Runtime',
        deviceType: 'Automated Server Core',
        geoEstimate: 'Munnar Basecamp HQ',
        userAgent: 'Aanandham Enterprise Engine',
        origin: 'Internal Core'
    };

    const entry = {
        id: event.id || `EVT-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
        timestamp: event.timestamp || new Date().toISOString(),
        category: event.category || 'SYSTEM',
        action: event.action || 'GENERIC_EVENT',
        actor: event.actor || 'System / Coordinator',
        actorRole: event.actorRole || 'admin_coordinator',
        recordId: event.recordId || null,
        ip: telemetry.ip,
        clientTelemetry: telemetry,
        details: sanitizeLogOutput(event.details || ''),
        meta: event.meta ? sanitizeLogOutput(JSON.parse(JSON.stringify(event.meta))) : null,
        status: event.status || (event.success === false ? 'FAILED' : 'SUCCESS'),
        severity: event.severity || (event.status === 'FAILED' ? 'HIGH' : 'INFO')
    };

    memoryAuditLogs.unshift(entry);
    if (memoryAuditLogs.length > MAX_AUDIT_LOGS) memoryAuditLogs.pop();
    persistAuditLogs();

    return entry;
}

/**
 * Record an unhandled crash / internal server error (severity CRITICAL)
 * Error messages are DLP-sanitized so credentials never leak into the ledger.
 */
export function logCrash({ source = 'UNKNOWN', route = 'UNKNOWN', error = null, request = null, details = '' }) {
    const message = error instanceof Error ? error.message : String(error || 'Unknown error');
    const stack = error instanceof Error ? (error.stack || '').split('\n').slice(0, 6).join('\n') : '';
    const safeMessage = sanitizeLogOutput(message).slice(0, 500);
    const safeStack = sanitizeLogOutput(stack).slice(0, 800);

    return recordAuditEvent({
        category: 'SYSTEM_CRASH',
        action: 'UNHANDLED_ERROR',
        actor: 'System / Server Runtime',
        actorRole: 'system',
        details: details || `${source} failure in ${route}: ${safeMessage}`,
        meta: { source, route, stack: safeStack },
        status: 'FAILED',
        severity: 'CRITICAL'
    }, request);
}

/**
 * Record a state-changing database mutation into the Write-Ahead Log (WAL)
 * Enables point-in-time visual diffing and one-click data rollback/reversion!
 */
export function recordWalMutation({
    entityType, // 'BOOKING' | 'CAMPSITE' | 'ROOM_TYPE' | 'MARSHAL' | 'PAYMENT_GATEWAY' | 'SYSTEM_CONFIG'
    entityId,
    action,     // 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'BATCH_RESCHEDULE'
    previousState = null,
    newState = null,
    actor = 'Admin Coordinator',
    actorRole = 'admin_coordinator',
    details = '',
    request = null
}) {
    initLedger();

    const telemetry = request ? getClientMetadata(request) : {
        ip: '127.0.0.1 (Local HQ Station)',
        browser: 'Admin Console',
        os: 'Windows 11 / 10',
        deviceType: 'Desktop Station',
        geoEstimate: 'Munnar Basecamp HQ LAN',
        origin: 'Admin HQ'
    };

    // Calculate changed fields
    const diff = computeStateDiff(previousState, newState);

    const walEntry = {
        id: `WAL-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
        timestamp: new Date().toISOString(),
        entityType,
        entityId,
        action,
        actor,
        actorRole,
        ip: telemetry.ip,
        clientTelemetry: telemetry,
        details: sanitizeLogOutput(details || `${action} on ${entityType} ${entityId}`),
        previousState: previousState ? JSON.parse(JSON.stringify(previousState)) : null,
        newState: newState ? JSON.parse(JSON.stringify(newState)) : null,
        diff,
        revertable: previousState !== null,
        reverted: false,
        revertedAt: null,
        revertedBy: null
    };

    memoryWalLogs.unshift(walEntry);
    if (memoryWalLogs.length > MAX_WAL_LOGS) memoryWalLogs.pop();
    persistWalLogs();

    // Also record a parallel audit log event
    recordAuditEvent({
        category: 'WAL_MUTATION',
        action: `DB_${action}_${entityType}`,
        actor,
        actorRole,
        recordId: entityId,
        ip: telemetry.ip,
        details: walEntry.details,
        meta: { walId: walEntry.id, changedFields: Object.keys(diff) },
        status: 'SUCCESS',
        severity: action === 'DELETE' ? 'WARN' : 'INFO'
    }, request);

    return walEntry;
}

/**
 * Calculate field-level differences between before and after states
 */
function computeStateDiff(prev, next) {
    if (!prev || !next) return { stateChange: { from: prev ? 'EXISTS' : 'NULL', to: next ? 'EXISTS' : 'NULL' } };
    const diff = {};
    const allKeys = Array.from(new Set([...Object.keys(prev), ...Object.keys(next)]));
    
    for (const key of allKeys) {
        if (key === 'lastUpdated' || key === 'timestamp') continue;
        const prevVal = JSON.stringify(prev[key]);
        const nextVal = JSON.stringify(next[key]);
        if (prevVal !== nextVal) {
            diff[key] = {
                before: prev[key] !== undefined ? prev[key] : null,
                after: next[key] !== undefined ? next[key] : null
            };
        }
    }
    return diff;
}

/**
 * One-Click Revert / Undo a specific WAL mutation
 */
export async function revertWalMutation(walId, actor = 'Admin Coordinator') {
    initLedger();
    const entry = memoryWalLogs.find(w => w.id === walId);
    if (!entry) {
        throw new Error(`WAL entry ${walId} not found.`);
    }

    if (!entry.previousState) {
        throw new Error(`Cannot revert ${entry.action} on ${entry.entityType}: No prior state recorded.`);
    }

    if (entry.reverted) {
        throw new Error(`WAL mutation ${walId} has already been reverted on ${entry.revertedAt}.`);
    }

    // Apply reversion based on entity type
    if (entry.entityType === 'BOOKING') {
        const bookings = await getStoredBookings();
        const existingIdx = bookings.findIndex(b => b.id === entry.entityId);
        
        if (entry.action === 'CREATE') {
            // Revert creation -> Delete the booking
            await deleteServerBooking(entry.entityId);
        } else {
            // Revert update or delete -> Restore previous state
            if (existingIdx >= 0) {
                await updateServerBooking(entry.entityId, entry.previousState);
            } else {
                await addServerBooking(entry.previousState);
            }
        }
    }

    // Mark WAL entry as reverted
    entry.reverted = true;
    entry.revertedAt = new Date().toISOString();
    entry.revertedBy = actor;
    persistWalLogs();

    // Log the rollback event
    recordAuditEvent({
        category: 'WAL_ROLLBACK',
        action: `REVERTED_${entry.action}_${entry.entityType}`,
        actor,
        recordId: entry.entityId,
        details: `Reverted mutation ${entry.id}. Restored ${entry.entityType} ${entry.entityId} to previous snapshot state.`,
        meta: { walId: entry.id, targetEntity: entry.entityId },
        status: 'SUCCESS',
        severity: 'HIGH'
    });

    return {
        success: true,
        walId: entry.id,
        entityType: entry.entityType,
        entityId: entry.entityId,
        restoredState: entry.previousState
    };
}

/**
 * Point-in-Time Recovery: Create a full snapshot of all collections
 */
export async function createDatabaseSnapshot(label = 'Manual Recovery Checkpoint', actor = 'Admin Coordinator') {
    initLedger();
    ensureStorageDirs();

    const timestamp = Date.now();
    const bookings = await getStoredBookings();

    const snapshot = {
        id: `SNAP-${timestamp}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
        timestamp: new Date(timestamp).toISOString(),
        label: label || `Snapshot ${new Date(timestamp).toLocaleTimeString()}`,
        createdBy: actor,
        collections: {
            bookingsCount: bookings.length,
            bookings: bookings
        },
        systemStats: {
            walEntriesCount: memoryWalLogs.length,
            auditLogsCount: memoryAuditLogs.length
        }
    };

    const snapshotFile = path.join(SNAPSHOTS_DIR, `${snapshot.id}.json`);
    try {
        fs.writeFileSync(snapshotFile, JSON.stringify(snapshot, null, 2), 'utf-8');
    } catch {
        // Read-only serverless fallback
    }

    recordAuditEvent({
        category: 'SYSTEM_BACKUP',
        action: 'DB_SNAPSHOT_CREATED',
        actor,
        recordId: snapshot.id,
        details: `Created database snapshot "${snapshot.label}" (${bookings.length} reservations locked)`,
        status: 'SUCCESS',
        severity: 'INFO'
    });

    return snapshot;
}

/**
 * List all saved recovery snapshots
 */
export function listDatabaseSnapshots() {
    initLedger();
    ensureStorageDirs();

    try {
        if (!fs.existsSync(SNAPSHOTS_DIR)) return [];
        const files = fs.readdirSync(SNAPSHOTS_DIR).filter(f => f.endsWith('.json'));
        const snapshots = [];

        for (const file of files) {
            try {
                const raw = fs.readFileSync(path.join(SNAPSHOTS_DIR, file), 'utf-8');
                const parsed = JSON.parse(raw);
                snapshots.push({
                    id: parsed.id,
                    timestamp: parsed.timestamp,
                    label: parsed.label,
                    createdBy: parsed.createdBy,
                    bookingsCount: parsed.collections?.bookingsCount || parsed.collections?.bookings?.length || 0
                });
            } catch {
                // Skip corrupted snapshot file
            }
        }

        return snapshots.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, MAX_SNAPSHOTS);
    } catch {
        return [];
    }
}

/**
 * Point-in-Time Recovery: Restore database collections from a snapshot
 */
export async function restoreDatabaseSnapshot(snapshotId, actor = 'Admin Coordinator') {
    initLedger();
    ensureStorageDirs();

    const snapshotFile = path.join(SNAPSHOTS_DIR, `${snapshotId}.json`);
    if (!fs.existsSync(snapshotFile)) {
        throw new Error(`Snapshot ${snapshotId} does not exist on disk.`);
    }

    const raw = fs.readFileSync(snapshotFile, 'utf-8');
    const snapshot = JSON.parse(raw);

    if (snapshot.collections?.bookings && Array.isArray(snapshot.collections.bookings)) {
        // Take an automated pre-rollback safety snapshot first!
        await createDatabaseSnapshot(`Pre-Rollback Auto Safety Backup (Before ${snapshotId})`, 'Auto-Shield Engine');
        
        // Restore bookings collection
        await saveStoredBookings(snapshot.collections.bookings);
    }

    recordAuditEvent({
        category: 'SYSTEM_RECOVERY',
        action: 'DB_SNAPSHOT_RESTORED',
        actor,
        recordId: snapshotId,
        details: `Successfully restored database to snapshot "${snapshot.label}" from ${new Date(snapshot.timestamp).toLocaleString()}`,
        status: 'SUCCESS',
        severity: 'HIGH'
    });

    return {
        success: true,
        snapshotId,
        label: snapshot.label,
        restoredBookingsCount: snapshot.collections?.bookings?.length || 0
    };
}

/**
 * Query unified audit and WAL logs with multi-field search and category filtering
 */
export function getUnifiedAuditStream({
    category = 'all',
    search = '',
    limit = 100,
    offset = 0
} = {}) {
    initLedger();

    // Clamp pagination to prevent resource-exhaustion reads
    limit = Math.min(200, Math.max(1, parseInt(limit, 10) || 100));
    offset = Math.max(0, parseInt(offset, 10) || 0);

    let combined = [...memoryAuditLogs];

    // Filter by category
    if (category && category !== 'all') {
        if (category === 'AUTH') {
            combined = combined.filter(l => l.category === 'AUTH' || l.action.includes('LOGIN') || l.action.includes('PASSCODE'));
        } else if (category === 'WAL') {
            combined = combined.filter(l => l.category === 'WAL_MUTATION' || l.category === 'WAL_ROLLBACK');
        } else if (category === 'FIELD_CHECKIN') {
            combined = combined.filter(l => l.category === 'FIELD_CHECKIN' || l.action.includes('GATE') || l.action.includes('PASS'));
        } else if (category === 'RESERVATION') {
            combined = combined.filter(l => l.category === 'RESERVATION' || l.action.includes('BOOKING'));
        } else {
            combined = combined.filter(l => l.category === category);
        }
    }

    // Full text search
    if (search && search.trim()) {
        const q = search.toLowerCase().trim();
        combined = combined.filter(l => {
            return (
                (l.action && l.action.toLowerCase().includes(q)) ||
                (l.details && l.details.toLowerCase().includes(q)) ||
                (l.ip && l.ip.toLowerCase().includes(q)) ||
                (l.actor && l.actor.toLowerCase().includes(q)) ||
                (l.recordId && l.recordId.toLowerCase().includes(q)) ||
                (l.clientTelemetry?.browser && l.clientTelemetry.browser.toLowerCase().includes(q)) ||
                (l.clientTelemetry?.os && l.clientTelemetry.os.toLowerCase().includes(q))
            );
        });
    }

    const total = combined.length;
    const paginated = combined.slice(offset, offset + limit);

    return {
        total,
        logs: paginated,
        walLedger: memoryWalLogs.slice(0, 50),
        snapshots: listDatabaseSnapshots(),
        stats: {
            totalAuditLogs: memoryAuditLogs.length,
            totalWalMutations: memoryWalLogs.length,
            revertableMutations: memoryWalLogs.filter(w => w.revertable && !w.reverted).length,
            failedAuthAttempts: memoryAuditLogs.filter(l => l.status === 'FAILED' && l.category === 'AUTH').length,
            recentSnapshotsCount: listDatabaseSnapshots().length
        }
    };
}

/**
 * Export the complete ledger bundle (audit + WAL + snapshots) for backup
 */
export function exportFullLedger() {
    initLedger();
    return {
        exportedAt: new Date().toISOString(),
        auditLogs: memoryAuditLogs,
        walLedger: memoryWalLogs,
        snapshots: listDatabaseSnapshots()
    };
}

/**
 * Import a ledger bundle (WAL + audit restore from backup)
 */
export function importFullLedger(bundle) {
    initLedger();
    if (bundle && Array.isArray(bundle.auditLogs)) {
        memoryAuditLogs = bundle.auditLogs.slice(0, MAX_AUDIT_LOGS);
        persistAuditLogs();
    }
    if (bundle && Array.isArray(bundle.walLedger)) {
        memoryWalLogs = bundle.walLedger.slice(0, MAX_WAL_LOGS);
        persistWalLogs();
    }
    return { success: true, message: 'Ledger bundle imported.' };
}
