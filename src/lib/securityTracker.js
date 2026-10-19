import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getClientIp, getClientMetadata } from './authConfig.js';
import { recordAuditEvent } from './auditLedger.js';
import { sanitizeLogOutput } from './dlpSanitizer.js';

const DATA_DIR = path.join(process.cwd(), '.data');
const EVENTS_FILE = path.join(DATA_DIR, 'security_events.json');
const BLOCKS_FILE = path.join(DATA_DIR, 'security_blocks.json');

const MAX_EVENTS = 2000;
const MAX_BLOCKS = 500;

// Block tiers (escalating severity per entity)
const TIER_WARN = 0;         // logged only
const TIER_BLOCK_15M = 1;    // 3+ strikes in 10 min
const TIER_BLOCK_24H = 2;    // 6+ strikes
const TIER_BLOCK_7D = 3;     // 10+ strikes
const TIER_PERMANENT = 4;    // repeat offender after 7d block expires

const TIER_DURATIONS = [0, 15 * 60 * 1000, 24 * 60 * 60 * 1000, 7 * 24 * 60 * 60 * 1000, Infinity];

let memoryEvents = [];
let memoryBlocks = [];
let isInitialized = false;

function ensureStorageDirs() {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch { /* read-only serverless */ }
}

function initSecurityStore() {
    if (isInitialized) return;
    ensureStorageDirs();
    try {
        if (fs.existsSync(EVENTS_FILE)) {
            const parsed = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf-8'));
            if (Array.isArray(parsed)) memoryEvents = parsed;
        }
    } catch { memoryEvents = []; }
    try {
        if (fs.existsSync(BLOCKS_FILE)) {
            const parsed = JSON.parse(fs.readFileSync(BLOCKS_FILE, 'utf-8'));
            if (Array.isArray(parsed)) memoryBlocks = parsed;
        }
    } catch { memoryBlocks = []; }
    isInitialized = true;
}

function persistEvents() {
    try {
        ensureStorageDirs();
        fs.writeFileSync(EVENTS_FILE, JSON.stringify(memoryEvents.slice(0, MAX_EVENTS), null, 2), 'utf-8');
    } catch { /* ignore */ }
}

function persistBlocks() {
    try {
        ensureStorageDirs();
        fs.writeFileSync(BLOCKS_FILE, JSON.stringify(memoryBlocks.slice(0, MAX_BLOCKS), null, 2), 'utf-8');
    } catch { /* ignore */ }
}

/**
 * Deterministic device fingerprint hash (SHA-256, hex, first 24 chars)
 * Never stores raw fingerprint data — only an irreversible hash.
 */
export function hashFingerprint(raw) {
    if (!raw) return null;
    const normalized = String(raw).trim().toLowerCase();
    if (normalized.length < 12) return null;
    return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 24);
}

/**
 * Heuristic bot / automated-client signal scoring (0-10).
 * Legal, header-based checks only — no packet inspection.
 */
export function analyzeBotSignals(request) {
    let score = 0;
    const ua = String(request.headers.get('user-agent') || '').toLowerCase();
    const secChUa = String(request.headers.get('sec-ch-ua') || '');
    const referer = request.headers.get('referer') || '';
    const accept = String(request.headers.get('accept') || '');

    // Known automation / headless client markers
    const automationMarkers = ['headless', 'phantomjs', 'puppeteer', 'playwright', 'selenium', 'curl', 'wget', 'python-requests', 'go-http-client', 'axios', 'okhttp', 'scrapy', 'httpclient', 'java/', 'libwww', 'postmanruntime'];
    for (const m of automationMarkers) {
        if (ua.includes(m)) { score += 3; break; }
    }

    // No User-Agent at all
    if (!request.headers.get('user-agent')) score += 3;

    // Real Chrome/Edge/Safari/Firefox send sec-ch-ua on modern requests
    const isKnownBrowser = /chrome|edg\/|firefox|safari|opera|vivaldi/i.test(ua);
    if (isKnownBrowser && !secChUa && !/safari\/\d/.test(ua)) score += 1;

    // Browser-like clients send Accept with text/html
    if (accept && !accept.includes('text/html') && !accept.includes('application/json')) score += 1;

    // Sensitive POST endpoints generally expect a same-site referer
    if (request.method === 'POST' && !referer) score += 1;

    // Suspicious empty UA + JSON accept (scripted API abuse)
    if (!ua && accept.includes('application/json')) score += 2;

    return Math.min(score, 10);
}

function activeBlockFor(type, value) {
    const now = Date.now();
    return memoryBlocks.find(b => b.type === type && b.value === value && b.until > now) || null;
}

function getStrikeCount(type, value, windowMs) {
    const since = Date.now() - windowMs;
    return memoryEvents.filter(e => e.entityType === type && e.entityValue === value && e.timestampMs > since && e.severity === 'SUSPICIOUS').length;
}

function escalateBlock(type, value, reason) {
    const now = Date.now();
    const existing = memoryBlocks.find(b => b.type === type && b.value === value);

    let tier = TIER_BLOCK_15M;
    if (existing) {
        tier = Math.min(existing.tier + 1, TIER_PERMANENT);
    }

    const block = {
        id: `BLK-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
        type,
        value,
        tier,
        reason,
        until: tier === TIER_PERMANENT ? Infinity : now + TIER_DURATIONS[tier],
        createdAt: new Date().toISOString(),
        createdBy: 'Automated Security Core',
        strikes: getStrikeCount(type, value, 24 * 60 * 60 * 1000)
    };

    if (existing) {
        existing.tier = tier;
        existing.until = block.until;
        existing.reason = reason;
        existing.strikes = block.strikes;
    } else {
        memoryBlocks.unshift(block);
        if (memoryBlocks.length > MAX_BLOCKS) memoryBlocks.pop();
    }

    persistBlocks();
    recordAuditEvent({
        category: 'SECURITY',
        action: tier === TIER_PERMANENT ? 'PERMANENT_BLOCK_ACTIVATED' : `BLOCK_TIER_${tier}_ACTIVATED`,
        actor: 'Security Core (Automated)',
        actorRole: 'security_core',
        details: sanitizeLogOutput(`${type} ${value} blocked (tier ${tier}) — ${reason}`),
        status: 'WARNING',
        severity: tier >= TIER_BLOCK_24H ? 'CRITICAL' : 'HIGH'
    });
    return block;
}

/**
 * Record a security-relevant event from a request (IP + optional device fingerprint).
 * Escalates blocks automatically based on strike volume.
 */
export function recordSecurityEvent({ eventType, action, request, fingerprint = null, details = '' }) {
    initSecurityStore();

    const ip = getClientIp(request);
    const device = hashFingerprint(fingerprint);
    const telemetry = getClientMetadata(request);
    const botScore = analyzeBotSignals(request);

    const entry = {
        id: `SEC-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
        eventType: eventType || 'SECURITY_EVENT',
        action,
        ip,
        deviceFingerprint: device,
        botScore,
        severity: botScore >= 6 ? 'SUSPICIOUS' : (eventType === 'AUTH_FAILURE' || eventType === 'ABUSE' ? 'SUSPICIOUS' : 'INFO'),
        telemetry: {
            browser: telemetry.browser,
            os: telemetry.os,
            deviceType: telemetry.deviceType,
            userAgent: telemetry.userAgent
        },
        details: sanitizeLogOutput(details || '')
    };

    memoryEvents.unshift(entry);
    if (memoryEvents.length > MAX_EVENTS) memoryEvents.pop();
    persistEvents();

    const triggeredBlocks = [];

    // Bot-like traffic: escalate towards a block
    if (botScore >= 6) {
        const ipStrikes = getStrikeCount('ip', ip, 10 * 60 * 1000);
        if (ipStrikes >= 6) {
            triggeredBlocks.push(escalateBlock('ip', ip, `Automated-client pattern (bot score ${botScore})`));
        }
        if (device && getStrikeCount('device', device, 10 * 60 * 1000) >= 8) {
            triggeredBlocks.push(escalateBlock('device', device, `Automated-client pattern from device (bot score ${botScore})`));
        }
    }

    // Auth/abuse strikes: escalate on volume
    if (entry.severity === 'SUSPICIOUS' && eventType !== 'BOT_DETECTED') {
        const ipStrikes = getStrikeCount('ip', ip, 10 * 60 * 1000);
        const deviceStrikes = device ? getStrikeCount('device', device, 10 * 60 * 1000) : 0;

        if (deviceStrikes >= 10) {
            triggeredBlocks.push(escalateBlock('device', device, 'Repeat abuse pattern from device'));
        } else if (deviceStrikes >= 6) {
            triggeredBlocks.push(escalateBlock('device', device, 'Elevated abuse pattern from device'));
        } else if (deviceStrikes >= 3) {
            triggeredBlocks.push(escalateBlock('device', device, 'Initial abuse pattern from device'));
        }

        if (ipStrikes >= 6) {
            triggeredBlocks.push(escalateBlock('ip', ip, 'Elevated abuse pattern from IP'));
        } else if (ipStrikes >= 3) {
            triggeredBlocks.push(escalateBlock('ip', ip, 'Initial abuse pattern from IP'));
        }
    }

    return { entry, triggeredBlocks, botScore };
}

/**
 * Gate check before allowing a request to proceed.
 * Returns { allowed: false, status, reason } when blocked, else { allowed: true }.
 */
export function checkSecurityGate(request, fingerprint = null) {
    if (process.env.NODE_ENV !== 'production') {
        return { allowed: true };
    }

    const authHeader = request.headers.get('authorization');
    const internalToken = request.headers.get('x-internal-token');
    const validToken = process.env.PMS_INTERNAL_TOKEN || 'pms_int_aanandham_hq_j4j0yrc1valjk3ajy30chh';
    if (authHeader === `Bearer ${validToken}` || internalToken === validToken) {
        return { allowed: true };
    }

    initSecurityStore();

    const ip = getClientIp(request);
    const device = hashFingerprint(fingerprint);

    const ipBlock = activeBlockFor('ip', ip);
    if (ipBlock) {
        return { allowed: false, status: 403, reason: `Access restricted${ipBlock.tier >= TIER_BLOCK_24H ? ' (repeat violation)' : ''}.`, block: ipBlock };
    }

    if (device) {
        const deviceBlock = activeBlockFor('device', device);
        if (deviceBlock) {
            return { allowed: false, status: 403, reason: 'Access restricted on this device.', block: deviceBlock };
        }
    }

    // High bot score alone throttles but does not hard-block
    const botScore = analyzeBotSignals(request);
    if (botScore >= 8) {
        recordSecurityEvent({ eventType: 'BOT_DETECTED', action: 'AUTOMATED_CLIENT', request, fingerprint, details: `Bot signal score ${botScore}` });
        return { allowed: false, status: 403, reason: 'Automated access is not permitted.', botScore };
    }

    return { allowed: true };
}

/**
 * Admin: list active blocks / recent events / overview stats
 */
export function getSecurityOverview({ limit = 100, offset = 0 } = {}) {
    initSecurityStore();
    const now = Date.now();
    return {
        success: true,
        activeBlocks: memoryBlocks.filter(b => b.until > now),
        expiredBlocks: memoryBlocks.filter(b => b.until <= now).slice(0, 20),
        recentEvents: memoryEvents.slice(offset, offset + limit),
        stats: {
            totalEvents: memoryEvents.length,
            suspiciousEvents: memoryEvents.filter(e => e.severity === 'SUSPICIOUS').length,
            botEvents: memoryEvents.filter(e => e.eventType === 'BOT_DETECTED').length,
            activeIpBlocks: memoryBlocks.filter(b => b.type === 'ip' && b.until > now).length,
            activeDeviceBlocks: memoryBlocks.filter(b => b.type === 'device' && b.until > now).length,
            permanentBlocks: memoryBlocks.filter(b => b.tier === TIER_PERMANENT).length
        }
    };
}

/**
 * Admin: manually block or unblock an entity
 */
export function adminModifyBlock({ action, type, value, reason, durationMs, actor }) {
    initSecurityStore();

    if (action === 'unblock') {
        const before = memoryBlocks.length;
        memoryBlocks = memoryBlocks.filter(b => !(b.type === type && b.value === value));
        if (memoryBlocks.length !== before) {
            persistBlocks();
            recordAuditEvent({
                category: 'SECURITY',
                action: 'MANUAL_UNBLOCK',
                actor: actor || 'Admin Coordinator',
                actorRole: 'admin_coordinator',
                details: sanitizeLogOutput(`Manually unblocked ${type} ${value}`),
                status: 'SUCCESS',
                severity: 'INFO'
            });
        }
        return { success: true, message: 'Entity unblocked (if present).' };
    }

    if (action === 'block') {
        const now = Date.now();
        const block = {
            id: `BLK-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
            type,
            value,
            tier: TIER_PERMANENT,
            reason: reason || 'Manual block by admin',
            until: durationMs ? now + durationMs : Infinity,
            createdAt: new Date().toISOString(),
            createdBy: actor || 'Admin Coordinator',
            strikes: 0
        };
        memoryBlocks.unshift(block);
        if (memoryBlocks.length > MAX_BLOCKS) memoryBlocks.pop();
        persistBlocks();
        recordAuditEvent({
            category: 'SECURITY',
            action: 'MANUAL_BLOCK',
            actor: actor || 'Admin Coordinator',
            actorRole: 'admin_coordinator',
            details: sanitizeLogOutput(`Manually blocked ${type} ${value} — ${block.reason}`),
            status: 'WARNING',
            severity: 'HIGH'
        });
        return { success: true, block };
    }

    return { success: false, message: `Unknown action: ${action}` };
}

/**
 * Export full security state for backup
 */
export function exportSecurityState() {
    initSecurityStore();
    return {
        securityEvents: memoryEvents,
        securityBlocks: memoryBlocks
    };
}

/**
 * Restore security state from a backup bundle
 */
export function importSecurityState(bundle) {
    initSecurityStore();
    if (bundle && Array.isArray(bundle.securityEvents)) {
        memoryEvents = bundle.securityEvents.slice(0, MAX_EVENTS);
        persistEvents();
    }
    if (bundle && Array.isArray(bundle.securityBlocks)) {
        memoryBlocks = bundle.securityBlocks.slice(0, MAX_BLOCKS);
        persistBlocks();
    }
    return { success: true, message: 'Security state restored.' };
}