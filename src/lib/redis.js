import crypto from 'crypto';

// Upstash Redis REST Config
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const HAS_UPSTASH = Boolean(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN);

// ── CIRCUIT BREAKER ──────────────────────────────────────────────────
// Prevents wasting 3s per request on a dead Redis. After consecutive
// failures, stops trying for a cooldown period, then sends a single
// probe to check recovery. Each serverless instance runs its own
// independent breaker — that's fine, since each discovers the outage
// within 3 failed calls.
const circuitBreaker = {
    failures: 0,
    lastFailureAt: 0,
    state: 'CLOSED',       // CLOSED | OPEN | HALF_OPEN
    openedAt: 0,
    halfOpenInFlight: false, // gate: only one probe at a time

    FAILURE_THRESHOLD: 3,
    COOLDOWN_MS: 30_000,
    TIMEOUT_MS: 3_000,

    onSuccess() {
        if (this.state !== 'CLOSED') {
            console.log('✅ [Redis Circuit Breaker] Upstash recovered. Circuit CLOSED.');
        }
        this.failures = 0;
        this.state = 'CLOSED';
        this.halfOpenInFlight = false;
    },

    onFailure() {
        this.failures++;
        this.lastFailureAt = Date.now();
        this.halfOpenInFlight = false;
        if (this.failures >= this.FAILURE_THRESHOLD && this.state !== 'OPEN') {
            this.state = 'OPEN';
            this.openedAt = Date.now();
            console.warn(`🚨 [Redis Circuit Breaker] Upstash failed ${this.failures}× consecutively. Circuit OPEN — in-memory fallback active for ${this.COOLDOWN_MS / 1000}s.`);
        }
    },

    shouldAttempt() {
        if (!HAS_UPSTASH) return false;
        switch (this.state) {
            case 'CLOSED':
                return true;
            case 'OPEN':
                if (Date.now() - this.openedAt >= this.COOLDOWN_MS) {
                    this.state = 'HALF_OPEN';
                    this.halfOpenInFlight = true;
                    console.log('🔄 [Redis Circuit Breaker] Cooldown elapsed — probing Upstash...');
                    return true;
                }
                return false;
            case 'HALF_OPEN':
                // Only allow one probe in flight — all other calls skip Redis
                if (!this.halfOpenInFlight) {
                    this.halfOpenInFlight = true;
                    return true;
                }
                return false;
            default:
                return true;
        }
    },

    isDegraded() {
        return this.state === 'OPEN' || this.state === 'HALF_OPEN';
    }
};


// ── UPSTASH REST TRANSPORT ───────────────────────────────────────────
/**
 * Execute a raw command against Upstash Redis via its REST API.
 * Enforces a hard timeout and feeds results into the circuit breaker.
 */
async function upstashCommand(command, ...args) {
    if (!circuitBreaker.shouldAttempt()) return null;

    try {
        const url = `${UPSTASH_REDIS_REST_URL.replace(/\/$/, '')}/${command}/${args.map(a => encodeURIComponent(String(a))).join('/')}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), circuitBreaker.TIMEOUT_MS);

        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
            cache: 'no-store',
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (!res.ok) {
            const body = await res.text().catch(() => '(unreadable)');
            console.error(`Upstash [${command}] HTTP ${res.status}: ${body}`);
            circuitBreaker.onFailure();
            return null;
        }
        const data = await res.json();
        circuitBreaker.onSuccess();
        return data.result;
    } catch (err) {
        if (err.name === 'AbortError') {
            console.error(`Upstash [${command}] timed out after ${circuitBreaker.TIMEOUT_MS}ms`);
        } else {
            console.error(`Upstash [${command}] error:`, err.message || err);
        }
        circuitBreaker.onFailure();
        return null;
    }
}


// ── BOUNDED IN-MEMORY STORES ─────────────────────────────────────────
// On Vercel serverless, each cold-start gets empty Maps. These provide
// single-instance protection during Redis outages. All Maps are hard-
// capped to prevent memory exhaustion on long-lived dev servers.

const MAX_MAP_SIZE = 5000;

/** Insert into a Map, evicting the oldest entry if at capacity. */
function boundedSet(map, key, value) {
    if (map.size >= MAX_MAP_SIZE && !map.has(key)) {
        const oldest = map.keys().next().value;
        map.delete(oldest);
    }
    map.set(key, value);
}

/** Sweep entries whose expiry timestamp has passed. */
function sweepMap(map) {
    const now = Date.now();
    for (const [key, val] of map.entries()) {
        const exp = typeof val === 'number' ? val : (val?.expiresAt ?? val?.exp);
        if (typeof exp === 'number' && now > exp) {
            map.delete(key);
        }
    }
}

const memoryRateLimits = new Map();       // key → number[] (timestamps)
const memoryBlockedIps = new Map();       // ip → expiresAt
const memoryRevokedTokens = new Map();    // hash → expiresAt
const memorySlotLocks = new Map();        // key → { lockId, expiresAt }
const memoryProcessedWebhooks = new Map();// key → expiresAt
const memoryIdempotencyCache = new Map(); // key → { data, expiresAt }
const memoryAuditLogs = [];              // capped at 100
const memoryWaitlists = new Map();       // key → entry[]

// Periodic GC — runs every 60s on long-lived processes (dev server),
// no-ops on short-lived serverless invocations.
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        // Rate-limit windows: drop entries older than 2 min
        for (const [key, ts] of memoryRateLimits.entries()) {
            const valid = ts.filter(t => now - t < 120_000);
            if (valid.length === 0) memoryRateLimits.delete(key);
            else memoryRateLimits.set(key, valid);
        }
        sweepMap(memoryBlockedIps);
        sweepMap(memoryRevokedTokens);
        sweepMap(memorySlotLocks);
        sweepMap(memoryProcessedWebhooks);
        sweepMap(memoryIdempotencyCache);
    }, 60_000);
}


// ══════════════════════════════════════════════════════════════════════
//  1. DISTRIBUTED SLIDING-WINDOW RATE LIMITER
// ══════════════════════════════════════════════════════════════════════
/**
 * @param {string}  key           - e.g. `ratelimit:bookings:203.0.113.42`
 * @param {number}  maxRequests   - allowed requests in the window
 * @param {number}  windowSeconds - sliding window length
 * @returns {Promise<{ allowed: boolean, remaining: number, resetSeconds: number, degraded: boolean }>}
 *
 * EDGE CASE — multi-instance dilution:
 *   On serverless with N concurrent instances, each instance only sees
 *   ~1/N of the traffic through its local Map. During a Redis outage
 *   an attacker hitting different instances could theoretically get
 *   N × maxRequests total.
 *
 *   Mitigation: when the circuit breaker is degraded, we divide
 *   maxRequests by 3 (configurable). Combined with the auth route's
 *   independent per-route global counter, brute-force windows stay
 *   narrow even during outages.
 */
export async function checkRateLimit(key, maxRequests = 10, windowSeconds = 60) {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    let redisResult = null;

    if (circuitBreaker.shouldAttempt()) {
        try {
            const member = `${now}:${crypto.randomBytes(4).toString('hex')}`;
            const clearBefore = now - windowMs;

            await upstashCommand('zremrangebyscore', key, 0, clearBefore);
            await upstashCommand('zadd', key, now, member);
            const count = await upstashCommand('zcard', key);
            await upstashCommand('expire', key, windowSeconds);

            if (count !== null) {
                redisResult = Number(count) || 1;
            }
        } catch (err) {
            console.error('Rate limiter Redis error:', err.message);
        }
    }

    // ── Memory fallback (always maintained for dual-read) ──
    const timestamps = memoryRateLimits.get(key) || [];
    const validTimestamps = timestamps.filter(t => now - t < windowMs);
    validTimestamps.push(now);
    if (validTimestamps.length > MAX_MAP_SIZE) {
        validTimestamps.splice(0, validTimestamps.length - MAX_MAP_SIZE);
    }
    boundedSet(memoryRateLimits, key, validTimestamps);
    const memoryCount = validTimestamps.length;

    // ── Decision ──
    const degraded = circuitBreaker.isDegraded();
    // When degraded, divide by 3 to compensate for multi-instance dilution
    const effectiveMax = degraded
        ? Math.max(1, Math.ceil(maxRequests / 3))
        : maxRequests;

    // Use the HIGHER of the two counts (most restrictive)
    const effectiveCount = redisResult !== null
        ? Math.max(redisResult, memoryCount)
        : memoryCount;

    const allowed = effectiveCount <= effectiveMax;
    return {
        allowed,
        remaining: Math.max(0, effectiveMax - effectiveCount),
        resetSeconds: windowSeconds,
        degraded
    };
}


// ══════════════════════════════════════════════════════════════════════
//  2. DISTRIBUTED IP BLOCKLIST
// ══════════════════════════════════════════════════════════════════════
/**
 * EDGE CASE — split-brain reads:
 *   Instance A blocks an IP via Redis. Redis goes down. Instance B
 *   only has its local Map (empty) → attacker bypasses the block.
 *
 *   Mitigation: dual-write (blockIp writes to BOTH Redis AND memory)
 *   and OR-logic reads (blocked if EITHER store says blocked). This
 *   guarantees the blocking instance always enforces its own block,
 *   and other instances enforce it as long as Redis is up.
 */
export async function isIpBlocked(ip) {
    if (!ip || ip === 'unknown' || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return false;
    const key = `blocked_ip:${ip}`;

    let redisBlocked = false;
    if (circuitBreaker.shouldAttempt()) {
        const val = await upstashCommand('get', key);
        if (val !== null) redisBlocked = true;
    }

    // OR-logic: blocked if EITHER source says blocked
    const memExp = memoryBlockedIps.get(ip);
    let memBlocked = false;
    if (memExp) {
        if (Date.now() > memExp) {
            memoryBlockedIps.delete(ip);
        } else {
            memBlocked = true;
        }
    }

    return redisBlocked || memBlocked;
}

/** Dual-write: always writes to BOTH Redis and local memory. */
export async function blockIp(ip, reason = 'Automated DoS / Brute-force trigger', durationSeconds = 86400) {
    if (!ip || ip === 'unknown' || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return;
    const key = `blocked_ip:${ip}`;

    // Redis write (best-effort)
    if (circuitBreaker.shouldAttempt()) {
        await upstashCommand('setex', key, durationSeconds, JSON.stringify({ reason, timestamp: Date.now() }));
    }

    // Always write to local memory — guarantees at least this instance blocks
    boundedSet(memoryBlockedIps, ip, Date.now() + durationSeconds * 1000);
}


// ══════════════════════════════════════════════════════════════════════
//  3. TOKEN REVOCATION & BLACKLIST
// ══════════════════════════════════════════════════════════════════════
/**
 * EDGE CASE — revoked token not seen across instances:
 *   Same pattern as IP blocklist. Dual-write + OR-logic reads.
 */
export async function revokeToken(token, ttlSeconds = 86400) {
    if (!token) return;
    const key = `revoked_token:${crypto.createHash('sha256').update(token).digest('hex')}`;

    if (circuitBreaker.shouldAttempt()) {
        await upstashCommand('setex', key, ttlSeconds, '1');
    }

    // Always write locally
    boundedSet(memoryRevokedTokens, key, Date.now() + ttlSeconds * 1000);
}

export async function isTokenRevoked(token) {
    if (!token) return false;
    const key = `revoked_token:${crypto.createHash('sha256').update(token).digest('hex')}`;

    let redisRevoked = false;
    if (circuitBreaker.shouldAttempt()) {
        const res = await upstashCommand('get', key);
        if (res !== null) redisRevoked = true;
    }

    // OR-logic: revoked if EITHER source says revoked
    const memExp = memoryRevokedTokens.get(key);
    let memRevoked = false;
    if (memExp) {
        if (Date.now() > memExp) {
            memoryRevokedTokens.delete(key);
        } else {
            memRevoked = true;
        }
    }

    return redisRevoked || memRevoked;
}


// ══════════════════════════════════════════════════════════════════════
//  4. CENTRALIZED AUDIT LOGS
// ══════════════════════════════════════════════════════════════════════
/** Dual-write: always to Redis (if up) AND local memory. */
export async function pushAuditLog(event) {
    const entry = {
        timestamp: new Date().toISOString(),
        ...(circuitBreaker.isDegraded() ? { _degraded: true } : {}),
        ...event
    };

    if (circuitBreaker.shouldAttempt()) {
        try {
            await upstashCommand('lpush', 'admin:audit_logs', JSON.stringify(entry));
            await upstashCommand('ltrim', 'admin:audit_logs', 0, 99);
        } catch (err) {
            console.error('Audit log Redis error:', err.message);
        }
    }

    // Always local
    memoryAuditLogs.unshift(entry);
    if (memoryAuditLogs.length > 100) memoryAuditLogs.pop();
}

export async function getRecentAuditLogs() {
    if (circuitBreaker.shouldAttempt()) {
        try {
            const rawLogs = await upstashCommand('lrange', 'admin:audit_logs', 0, 50);
            if (Array.isArray(rawLogs) && rawLogs.length > 0) {
                return rawLogs.map(r => {
                    try { return JSON.parse(r); } catch { return r; }
                });
            }
        } catch (err) {
            console.error('Audit log fetch error:', err.message);
        }
    }
    return [...memoryAuditLogs];
}


// ══════════════════════════════════════════════════════════════════════
//  5. FIFO WAITLIST QUEUE
// ══════════════════════════════════════════════════════════════════════
const MAX_WAITLIST_PER_SLOT = 50;
const WAITLIST_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * EDGE CASE — waitlist position drift during outage:
 *   Without Redis, each instance has its own waitlist. Positions may
 *   differ across instances. This is acceptable because waitlist
 *   positions are advisory (the coordinator confirms manually) and
 *   the waitlist is bounded to prevent memory exhaustion.
 */
export async function addToWaitlist(slotKey, bookingId, guestInfo) {
    const key = `waitlist:${slotKey}`;
    const score = Date.now();
    const payload = JSON.stringify({ bookingId, guestInfo, queuedAt: score });

    if (circuitBreaker.shouldAttempt()) {
        const addResult = await upstashCommand('zadd', key, score, payload);
        if (addResult !== null) {
            await upstashCommand('zremrangebyscore', key, 0, score - WAITLIST_TTL_MS);
            await upstashCommand('zremrangebyrank', key, MAX_WAITLIST_PER_SLOT, -1);
            const rank = await upstashCommand('zrank', key, payload);
            if (rank !== null) return (Number(rank) || 0) + 1;
        }
    }

    // Memory fallback with bounded size
    let list = (memoryWaitlists.get(key) || []).filter(item => score - item.queuedAt < WAITLIST_TTL_MS);
    if (list.length >= MAX_WAITLIST_PER_SLOT) {
        list.shift();
    }
    list.push({ bookingId, guestInfo, queuedAt: score });
    memoryWaitlists.set(key, list);
    return list.length;
}

export async function getWaitlistPosition(slotKey, bookingId) {
    const key = `waitlist:${slotKey}`;

    if (circuitBreaker.shouldAttempt()) {
        const items = await upstashCommand('zrange', key, 0, -1);
        if (Array.isArray(items)) {
            for (let i = 0; i < items.length; i++) {
                try {
                    const parsed = JSON.parse(items[i]);
                    if (parsed.bookingId === bookingId) return i + 1;
                } catch {}
            }
            return null;
        }
    }

    const list = memoryWaitlists.get(key) || [];
    const idx = list.findIndex(item => item.bookingId === bookingId);
    return idx === -1 ? null : idx + 1;
}


// ══════════════════════════════════════════════════════════════════════
//  6. DISTRIBUTED WEBHOOK IDEMPOTENCY
// ══════════════════════════════════════════════════════════════════════
/**
 * EDGE CASE — double webhook processing:
 *   If Redis is down and Razorpay retries, two different serverless
 *   instances may both see the same eventId as "not processed" (each
 *   has a fresh Map). Both would attempt to confirm the booking.
 *
 *   Mitigation:
 *   1. Dual-write: markWebhookProcessed writes to both stores.
 *   2. The downstream booking confirmation is DB-level: the second
 *      instance will find status already 'Confirmed' and no-op.
 *   3. When degraded, we log a warning so the operator knows
 *      idempotency is weakened.
 */
export async function isWebhookProcessed(eventId) {
    if (!eventId) return false;
    const key = `webhook:processed:${eventId}`;

    let redisProcessed = false;
    if (circuitBreaker.shouldAttempt()) {
        try {
            const res = await upstashCommand('get', key);
            if (res !== null && res !== undefined) redisProcessed = true;
        } catch (e) {
            console.error('Webhook dedupe Redis error:', e.message);
        }
    }

    // OR-logic: processed if EITHER store says so
    const now = Date.now();
    const memExp = memoryProcessedWebhooks.get(key);
    let memProcessed = false;
    if (memExp) {
        if (now < memExp) {
            memProcessed = true;
        } else {
            memoryProcessedWebhooks.delete(key);
        }
    }

    if (!redisProcessed && !memProcessed && circuitBreaker.isDegraded()) {
        console.warn(`⚠️ [Webhook Idempotency Degraded] eventId=${eventId} — Redis is down, cross-instance dedupe unavailable. Relying on DB-level guard.`);
    }

    return redisProcessed || memProcessed;
}

/** Dual-write: always to both Redis and local memory. */
export async function markWebhookProcessed(eventId, ttlSeconds = 604800) {
    if (!eventId) return false;
    const key = `webhook:processed:${eventId}`;
    const value = String(Date.now());

    if (circuitBreaker.shouldAttempt()) {
        try {
            await upstashCommand('setex', key, ttlSeconds, value);
        } catch (e) {
            console.error('Webhook mark-processed Redis error:', e.message);
        }
    }

    // Always local
    boundedSet(memoryProcessedWebhooks, key, Date.now() + ttlSeconds * 1000);
    return true;
}


// ══════════════════════════════════════════════════════════════════════
//  7. CLIENT IDEMPOTENCY KEY ENGINE
// ══════════════════════════════════════════════════════════════════════
/**
 * EDGE CASE — stale idempotency on instance recycle:
 *   If a user retries a booking and hits a fresh instance (with an
 *   empty Map) while Redis is down, the duplicate won't be caught
 *   by idempotency. The downstream slot-lock and DB-level unique
 *   booking ID checks serve as secondary guards.
 */
export async function getIdempotentResponse(idempotencyKey) {
    if (!idempotencyKey) return null;
    const key = `idempotency:${idempotencyKey}`;

    let redisHit = null;
    if (circuitBreaker.shouldAttempt()) {
        try {
            const raw = await upstashCommand('get', key);
            if (raw) {
                redisHit = typeof raw === 'string' ? JSON.parse(raw) : raw;
            }
        } catch (e) {
            console.error('Idempotency key Redis error:', e.message);
        }
    }

    // If Redis had a hit, return it (and cache locally for this instance)
    if (redisHit) {
        boundedSet(memoryIdempotencyCache, key, { data: redisHit, expiresAt: Date.now() + 86400_000 });
        return redisHit;
    }

    // Memory fallback
    const cached = memoryIdempotencyCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
    }
    if (cached) memoryIdempotencyCache.delete(key);
    return null;
}

/** Dual-write: always to both Redis and local memory. */
export async function setIdempotentResponse(idempotencyKey, responseData, ttlSeconds = 86400) {
    if (!idempotencyKey || !responseData) return;
    const key = `idempotency:${idempotencyKey}`;
    const payload = JSON.stringify(responseData);

    if (circuitBreaker.shouldAttempt()) {
        try {
            await upstashCommand('setex', key, ttlSeconds, payload);
        } catch (e) {
            console.error('Idempotency set Redis error:', e.message);
        }
    }

    // Always local
    boundedSet(memoryIdempotencyCache, key, { data: responseData, expiresAt: Date.now() + ttlSeconds * 1000 });
}


// ══════════════════════════════════════════════════════════════════════
//  8. ATOMIC SLOT LOCK
// ══════════════════════════════════════════════════════════════════════
/**
 * EDGE CASE — phantom double-booking:
 *   With Redis down, two instances can both "acquire" the same lock
 *   because their Maps are isolated. Both proceed to create bookings
 *   for the same slot.
 *
 *   Mitigations:
 *   1. Random jitter delay (0-200ms) when degraded — statistically
 *      separates near-simultaneous requests so one likely finishes
 *      and persists to DB first.
 *   2. Shorter lock TTL when degraded (15s vs 30s) — limits the
 *      blast radius of orphaned locks.
 *   3. The downstream booking write includes a DB-level capacity
 *      check (isSlotOccupying) which is the ultimate single-writer
 *      guard.
 */
export async function acquireSlotLock(slotKey, lockId, ttlSeconds = 30) {
    const key = `slot:lock:${slotKey}`;

    if (circuitBreaker.shouldAttempt()) {
        try {
            const result = await upstashCommand('set', key, lockId, 'NX', 'EX', ttlSeconds);
            if (result === 'OK') {
                // Also write locally so this instance knows it holds the lock
                boundedSet(memorySlotLocks, key, { lockId, expiresAt: Date.now() + ttlSeconds * 1000 });
                return true;
            }
            if (result === null && !circuitBreaker.isDegraded()) {
                return false; // Redis authoritatively says lock is held
            }
        } catch (err) {
            console.error('acquireSlotLock Redis error:', err.message);
        }
    }

    // ── Degraded / memory-only path ──
    const degraded = circuitBreaker.isDegraded();

    // Jitter: sleep 0-200ms to stagger competing instances
    if (degraded) {
        const jitter = Math.floor(Math.random() * 200);
        await new Promise(r => setTimeout(r, jitter));
        console.warn(`⚠️ [Slot Lock Degraded] key=${slotKey} — Redis down, per-instance lock only. Jitter: ${jitter}ms.`);
    }

    // Shorten TTL when degraded to limit orphan lock duration
    const effectiveTtl = degraded ? Math.min(ttlSeconds, 15) : ttlSeconds;

    const existing = memorySlotLocks.get(key);
    if (existing && existing.expiresAt > Date.now()) {
        return false; // Lock held on this instance
    }
    boundedSet(memorySlotLocks, key, { lockId, expiresAt: Date.now() + effectiveTtl * 1000 });
    return true;
}

/**
 * Release a slot lock. Checks ownership via lockId to prevent
 * one request accidentally releasing another's lock.
 */
export async function releaseSlotLock(slotKey, lockId) {
    const key = `slot:lock:${slotKey}`;

    if (circuitBreaker.shouldAttempt()) {
        try {
            const current = await upstashCommand('get', key);
            if (current === lockId) {
                await upstashCommand('del', key);
            }
        } catch (err) {
            console.error('releaseSlotLock Redis error:', err.message);
        }
    }

    // Always clean local memory
    const existing = memorySlotLocks.get(key);
    if (existing && existing.lockId === lockId) {
        memorySlotLocks.delete(key);
    }
}


// ══════════════════════════════════════════════════════════════════════
//  9. HEALTH CHECK & DIAGNOSTICS
// ══════════════════════════════════════════════════════════════════════
/**
 * Returns current Redis connectivity state. Useful for admin
 * dashboard health indicators or `/api/health` endpoints.
 */
export function getRedisHealth() {
    return {
        configured: HAS_UPSTASH,
        circuitState: circuitBreaker.state,
        consecutiveFailures: circuitBreaker.failures,
        isDegraded: circuitBreaker.isDegraded(),
        lastFailureAt: circuitBreaker.lastFailureAt
            ? new Date(circuitBreaker.lastFailureAt).toISOString()
            : null,
        cooldownRemainingMs: circuitBreaker.state === 'OPEN'
            ? Math.max(0, circuitBreaker.COOLDOWN_MS - (Date.now() - circuitBreaker.openedAt))
            : 0,
        memoryMapSizes: {
            rateLimits: memoryRateLimits.size,
            blockedIps: memoryBlockedIps.size,
            revokedTokens: memoryRevokedTokens.size,
            slotLocks: memorySlotLocks.size,
            processedWebhooks: memoryProcessedWebhooks.size,
            idempotencyCache: memoryIdempotencyCache.size,
            auditLogs: memoryAuditLogs.length,
            waitlists: memoryWaitlists.size
        }
    };
}
