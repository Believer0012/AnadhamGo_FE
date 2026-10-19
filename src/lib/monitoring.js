import { pushAuditLog } from './redis';

/**
 * High-Scale Operational Telemetry & Alerting
 * Logs lock contention, payment anomalies, and webhook errors to the audit stream.
 */

export async function logLockContention(slotKey, ip) {
    const event = {
        type: 'LOCK_CONTENTION_ALERT',
        slotKey,
        ip,
        message: `High concurrency contention on slot: ${slotKey}`,
        timestamp: new Date().toISOString()
    };

    console.warn(`[TELEMETRY] ⚠️ Lock contention detected on ${slotKey} from ${ip}`);
    await pushAuditLog(event);
}

export async function logPaymentAnomaly(bookingId, reason, meta = {}) {
    const event = {
        type: 'PAYMENT_ANOMALY_ALERT',
        bookingId,
        reason,
        meta,
        timestamp: new Date().toISOString()
    };

    console.error(`[TELEMETRY] 🚨 Payment Anomaly for ${bookingId}: ${reason}`, meta);
    await pushAuditLog(event);
}

export async function logWebhookFailure(eventId, error) {
    const event = {
        type: 'WEBHOOK_FAILURE_ALERT',
        eventId,
        error: error?.message || String(error),
        timestamp: new Date().toISOString()
    };

    console.error(`[TELEMETRY] 🚨 Webhook Failure on ${eventId}:`, error);
    await pushAuditLog(event);
}
