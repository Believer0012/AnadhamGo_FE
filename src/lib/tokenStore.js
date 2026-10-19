// Refresh Token Store & Session Management
// Handles access token (short-lived) + refresh token (long-lived, rotating) with device/IP binding

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getClientIp } from './authConfig.js';
import { evaluateRequestRisk, validateSessionBinding, createSessionBinding, destroySessionBinding } from './riskEngine.js';

const DATA_DIR = path.join(process.cwd(), '.data');
const REFRESH_TOKEN_FILE = path.join(DATA_DIR, 'refresh_tokens.json');
const ACCESS_TOKEN_FILE = path.join(DATA_DIR, 'access_tokens.json');
const CSRF_TOKEN_FILE = path.join(DATA_DIR, 'csrf_tokens.json');

const MAX_REFRESH_TOKENS = 5000;
const MAX_ACCESS_TOKENS = 20000;
const MAX_CSRF_TOKENS = 10000;

let refreshTokens = new Map();
let accessTokens = new Map();
let csrfTokens = new Map();
let isInitialized = false;

function ensureStorageDirs() {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch { /* read-only serverless */ }
}

function initTokenStores() {
    if (isInitialized) return;
    ensureStorageDirs();
    try {
        if (fs.existsSync(REFRESH_TOKEN_FILE)) {
            const parsed = JSON.parse(fs.readFileSync(REFRESH_TOKEN_FILE, 'utf-8'));
            if (Array.isArray(parsed)) {
                refreshTokens = new Map(parsed.map(([k, v]) => [k, { ...v, expiresAt: new Date(v.expiresAt).getTime() }]));
            }
        }
    } catch { refreshTokens = new Map(); }
    try {
        if (fs.existsSync(ACCESS_TOKEN_FILE)) {
            const parsed = JSON.parse(fs.readFileSync(ACCESS_TOKEN_FILE, 'utf-8'));
            if (Array.isArray(parsed)) {
                accessTokens = new Map(parsed.map(([k, v]) => [k, { ...v, expiresAt: new Date(v.expiresAt).getTime() }]));
            }
        }
    } catch { accessTokens = new Map(); }
    try {
        if (fs.existsSync(CSRF_TOKEN_FILE)) {
            const parsed = JSON.parse(fs.readFileSync(CSRF_TOKEN_FILE, 'utf-8'));
            if (Array.isArray(parsed)) {
                csrfTokens = new Map(parsed.map(([k, v]) => [k, { ...v, expiresAt: new Date(v.expiresAt).getTime() }]));
            }
        }
    } catch { csrfTokens = new Map(); }
    isInitialized = true;
}

function persistRefreshTokens() {
    try {
        ensureStorageDirs();
        fs.writeFileSync(REFRESH_TOKEN_FILE, JSON.stringify(Array.from(refreshTokens.entries()).slice(0, MAX_REFRESH_TOKENS), null, 2), 'utf-8');
    } catch { /* ignore */ }
}

function persistAccessTokens() {
    try {
        ensureStorageDirs();
        fs.writeFileSync(ACCESS_TOKEN_FILE, JSON.stringify(Array.from(accessTokens.entries()).slice(0, MAX_ACCESS_TOKENS), null, 2), 'utf-8');
    } catch { /* ignore */ }
}

function persistCsrfTokens() {
    try {
        ensureStorageDirs();
        fs.writeFileSync(CSRF_TOKEN_FILE, JSON.stringify(Array.from(csrfTokens.entries()).slice(0, MAX_CSRF_TOKENS), null, 2), 'utf-8');
    } catch { /* ignore */ }
}

// ─────────────────────────────────────────────────────────────────
// TOKEN GENERATION & VALIDATION
// ─────────────────────────────────────────────────────────────────

const ACCESS_TOKEN_TTL = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const REFRESH_TOKEN_ROTATION_GRACE = 60 * 1000; // 1 minute grace for concurrent refresh

export function generateTokenPair(payload, request) {
    initTokenStores();
    
    const deviceHash = hashFingerprint(request.headers?.get?.('x-device-fingerprint') || '');
    const ip = getClientIp(request);
    const userAgent = request.headers?.get?.('user-agent') || '';
    const deviceProfile = request.headers?.get?.('x-device-profile') || null;
    
    // Evaluate risk for this token issuance
    const risk = evaluateRequestRisk(request, { deviceHash, endpoint: '/auth/token', metadata: { tokenIssuance: true } });
    if (risk.tier === 'CRITICAL') {
        throw new Error('Token issuance blocked: critical risk detected');
    }
    
    const now = Date.now();
    const accessTokenId = `at_${crypto.randomBytes(16).toString('hex')}`;
    const refreshTokenId = `rt_${crypto.randomBytes(24).toString('hex')}`;
    const sessionId = `sess_${crypto.randomBytes(16).toString('hex')}`;
    
    const accessToken = createSignedAccessToken({
        ...payload,
        accessTokenId,
        sessionId,
        deviceHash,
        ip,
        iat: now,
        exp: now + ACCESS_TOKEN_TTL
    });
    
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    // Store refresh token with binding
    const refreshEntry = {
        refreshTokenId,
        refreshTokenHash,
        userId: payload.userId || payload.id,
        role: payload.role,
        campId: payload.campId,
        isMasterAdmin: payload.isMasterAdmin,
        deviceHash,
        ip,
        userAgent,
        deviceProfile: deviceProfile ? JSON.parse(deviceProfile) : null,
        sessionId,
        createdAt: now,
        expiresAt: now + REFRESH_TOKEN_TTL,
        lastUsedAt: now,
        rotatedFrom: null,
        rotationCount: 0,
        revoked: false,
        revokedAt: null,
        revokedReason: null
    };
    
    refreshTokens.set(refreshTokenHash, refreshEntry);
    persistRefreshTokens();
    
    // Create session binding
    createSessionBinding(`sess_${refreshTokenId}`, deviceHash, ip, {
        userAgent,
        ...JSON.parse(deviceProfile || '{}')
    });
    
    return {
        accessToken,
        refreshToken,
        accessTokenId,
        refreshTokenId,
        sessionId,
        accessTokenExpiresAt: now + ACCESS_TOKEN_TTL,
        refreshTokenExpiresAt: now + REFRESH_TOKEN_TTL
    };
}

export function verifyAccessToken(token, request) {
    if (!token) return { valid: false, reason: 'NO_TOKEN' };
    
    const payload = verifySignedToken(token);
    if (!payload) return { valid: false, reason: 'INVALID_SIGNATURE' };
    
    const now = Date.now();
    if (payload.exp && now > payload.exp) {
        return { valid: false, reason: 'EXPIRED', expired: true };
    }
    
    // Check if access token is revoked (check access token store)
    const accessTokenId = payload.accessTokenId;
    const accessEntry = accessTokens.get(accessTokenId);
    if (accessEntry && accessEntry.revoked) {
        return { valid: false, reason: 'REVOKED' };
    }
    
    // Verify device/IP binding
    const deviceHash = hashFingerprint(request.headers?.get?.('x-device-fingerprint') || '');
    const ip = getClientIp(request);
    
    if (payload.deviceHash && deviceHash && payload.deviceHash !== deviceHash) {
        return { valid: false, reason: 'DEVICE_MISMATCH', sessionHijack: true };
    }
    
    if (payload.ip && ip) {
        if (!cidrMatch(payload.ip, ip.split(',')[0]?.trim(), 24)) {
            return { valid: false, reason: 'IP_MISMATCH', sessionHijack: true };
        }
    }
    
    // Validate session binding
    const sessionId = payload.sessionId;
    if (sessionId) {
        const sessionValidation = validateSessionBinding(sessionId, deviceHash, getClientIp({ headers: new Headers({ 'user-agent': request.headers?.get?.('user-agent') || '' }) }));
        if (!sessionValidation.valid && sessionValidation.risk === 'HIGH') {
            return { valid: false, reason: 'SESSION_BINDING_INVALID', sessionHijack: true };
        }
    }
    
    // Evaluate risk for this request
    const risk = evaluateRequestRisk(request, { 
        deviceHash, 
        endpoint: request.url, 
        authState: { role: payload.role, isMasterAdmin: payload.isMasterAdmin }
    });
    
    if (risk.tier === 'CRITICAL') {
        return { valid: false, reason: 'RISK_CRITICAL', risk };
    }
    
    return { 
        valid: true, 
        payload,
        risk: risk.tier,
        riskScore: risk.score
    };
}

export function rotateRefreshToken(refreshToken, request) {
    initTokenStores();
    
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const entry = refreshTokens.get(refreshTokenHash);
    
    if (!entry) {
        return { valid: false, reason: 'REFRESH_TOKEN_NOT_FOUND' };
    }
    
    if (entry.revoked) {
        return { valid: false, reason: 'REFRESH_TOKEN_REVOKED' };
    }
    
    const now = Date.now();
    if (now > entry.expiresAt) {
        return { valid: false, reason: 'REFRESH_TOKEN_EXPIRED' };
    }
    
    // Check for concurrent use (rotation grace period)
    if (entry.lastUsedAt && now - entry.lastUsedAt < REFRESH_TOKEN_ROTATION_GRACE && entry.rotationCount > 0) {
        // Possible concurrent legitimate use - allow but flag
        console.warn(`⚠️ [Token Rotation] Concurrent refresh detected for ${entry.refreshTokenId}, allowing with warning`);
    }
    
    // Check for reuse (token replay attack)
    if (entry.lastUsedAt && now - entry.lastUsedAt > REFRESH_TOKEN_ROTATION_GRACE && entry.lastUsedAt !== entry.rotatedFrom) {
        // Token reused after rotation - potential theft
        revokeRefreshToken(entry.refreshTokenHash, 'REPLAY_DETECTED');
        return { valid: false, reason: 'REFRESH_TOKEN_REPLAY_DETECTED', securityAlert: true };
    }
    
    // Verify device/IP binding
    const deviceHash = hashFingerprint(request.headers?.get?.('x-device-fingerprint') || '');
    const ip = getClientIp(request);
    
    if (entry.deviceHash !== deviceHash) {
        // Device changed - require re-authentication
        revokeRefreshToken(entry.refreshTokenHash, 'DEVICE_CHANGED');
        return { valid: false, reason: 'DEVICE_CHANGED_REAUTH_REQUIRED', securityAlert: true };
    }
    
    if (!cidrMatch(entry.ip, ip.split(',')[0]?.trim(), 24)) {
        // IP changed significantly - require re-authentication
        revokeRefreshToken(entry.refreshTokenHash, 'IP_CHANGED_SIGNIFICANTLY');
        return { valid: false, reason: 'IP_CHANGED_REAUTH_REQUIRED', securityAlert: true };
    }
    
    // Validate session binding
    const sessionValidation = validateSessionBinding(entry.sessionId, deviceHash, getClientIp(request));
    if (!sessionValidation.valid && sessionValidation.risk === 'HIGH') {
        revokeRefreshToken(entry.refreshTokenHash, 'SESSION_BINDING_INVALID');
        return { valid: false, reason: 'SESSION_BINDING_INVALID', securityAlert: true };
    }
    
    // Evaluate risk
    const risk = evaluateRequestRisk(request, { 
        deviceHash: entry.deviceHash, 
        endpoint: '/auth/refresh', 
        authState: { role: entry.role, isMasterAdmin: entry.isMasterAdmin }
    });
    
    if (risk.tier === 'CRITICAL') {
        revokeRefreshToken(entry.refreshTokenHash, 'RISK_CRITICAL_ON_REFRESH');
        return { valid: false, reason: 'RISK_CRITICAL', securityAlert: true };
    }
    
    // ROTATE: Create new refresh token, revoke old
    const newRefreshToken = crypto.randomBytes(32).toString('hex');
    const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const newRefreshTokenId = `rt_${crypto.randomBytes(24).toString('hex')}`;
    const newSessionId = `sess_${crypto.randomBytes(16).toString('hex')}`;
    
    const newEntry = {
        refreshTokenId: newRefreshTokenId,
        refreshTokenHash: newRefreshTokenHash,
        userId: entry.userId,
        role: entry.role,
        campId: entry.campId,
        isMasterAdmin: entry.isMasterAdmin,
        deviceHash: entry.deviceHash,
        ip: entry.ip,
        userAgent: entry.userAgent,
        deviceProfile: entry.deviceProfile,
        sessionId: newSessionId,
        createdAt: Date.now(),
        expiresAt: Date.now() + REFRESH_TOKEN_TTL,
        lastUsedAt: Date.now(),
        rotatedFrom: entry.refreshTokenHash,
        rotationCount: entry.rotationCount + 1,
        revoked: false,
        revokedAt: null,
        revokedReason: null
    };
    
    // Revoke old token
    entry.revoked = true;
    entry.revokedAt = Date.now();
    entry.revokedReason = 'ROTATED';
    
    // Store new token
    refreshTokens.set(newRefreshTokenHash, newEntry);
    persistRefreshTokens();
    
    // Create new session binding
    createSessionBinding(`sess_${newRefreshTokenId}`, entry.deviceHash, entry.ip, {
        userAgent: entry.userAgent,
        ...entry.deviceProfile
    });
    
    // Generate new access token
    const accessToken = createSignedAccessToken({
        userId: entry.userId,
        role: entry.role,
        campId: entry.campId,
        isMasterAdmin: entry.isMasterAdmin,
        accessTokenId: `at_${crypto.randomBytes(16).toString('hex')}`,
        sessionId: newSessionId,
        deviceHash: entry.deviceHash,
        ip: entry.ip,
        iat: Date.now(),
        exp: Date.now() + ACCESS_TOKEN_TTL
    });
    
    return {
        valid: true,
        accessToken,
        refreshToken: newRefreshToken,
        sessionId: newSessionId,
        accessTokenExpiresAt: Date.now() + ACCESS_TOKEN_TTL,
        refreshTokenExpiresAt: Date.now() + REFRESH_TOKEN_TTL
    };
}

export function revokeRefreshToken(refreshTokenHash, reason = 'MANUAL') {
    initTokenStores();
    const entry = refreshTokens.get(refreshTokenHash);
    if (entry) {
        entry.revoked = true;
        entry.revokedAt = Date.now();
        entry.revokedReason = reason;
        persistRefreshTokens();
    }
    // Also revoke associated session
    if (entry?.sessionId) {
        destroySessionBinding(entry.sessionId);
    }
}

export function revokeAllUserTokens(userId, reason = 'USER_REVOKED') {
    initTokenStores();
    let count = 0;
    for (const [hash, entry] of refreshTokens.entries()) {
        if (entry.userId === userId && !entry.revoked) {
            entry.revoked = true;
            entry.revokedAt = Date.now();
            entry.revokedReason = reason;
            count++;
            if (entry.sessionId) destroySessionBinding(entry.sessionId);
        }
    }
    if (count > 0) persistRefreshTokens();
    return count;
}

// ─────────────────────────────────────────────────────────────────
// CSRF TOKEN MANAGEMENT
// ─────────────────────────────────────────────────────────────────

const CSRF_TOKEN_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function generateCSRFToken(sessionId) {
    initTokenStores();
    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const now = Date.now();
    
    csrfTokens.set(hash, {
        tokenHash: hash,
        sessionId,
        createdAt: now,
        expiresAt: now + CSRF_TOKEN_TTL
    });
    persistCsrfTokens();
    
    return token;
}

export function verifyCSRFToken(token, sessionId) {
    initTokenStores();
    if (!token || !sessionId) return false;
    
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const entry = csrfTokens.get(hash);
    
    if (!entry) return false;
    if (entry.sessionId !== sessionId) return false;
    if (Date.now() > entry.expiresAt) {
        csrfTokens.delete(hash);
        persistCsrfTokens();
        return false;
    }
    
    return true;
}

export function revokeCSRFToken(token) {
    if (!token) return;
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    csrfTokens.delete(hash);
    persistCsrfTokens();
}

// ─────────────────────────────────────────────────────────────────
// COOKIE HELPERS
// ─────────────────────────────────────────────────────────────────

export function setAuthCookies(res, { accessToken, refreshToken, sessionId, csrfToken }) {
    const isProd = process.env.NODE_ENV === 'production';
    
    // Access token - short lived, strict
    res.headers.append('Set-Cookie', 
        `aanandham_at=${accessToken}; ` +
        `HttpOnly; Secure; SameSite=Strict; ` +
        `Path=/; Max-Age=${Math.floor(ACCESS_TOKEN_TTL / 1000)}; ` +
        `__Host-`
    );
    
    // Refresh token - longer lived, strict
    res.headers.append('Set-Cookie', 
        `aanandham_rt=${refreshToken}; ` +
        `HttpOnly; Secure; SameSite=Strict; ` +
        `Path=/; Max-Age=${Math.floor(REFRESH_TOKEN_TTL / 1000)}; ` +
        `__Host-`
    );
    
    // Session ID - for CSRF binding
    res.headers.append('Set-Cookie', 
        `aanandham_sid=${sessionId}; ` +
        `HttpOnly; Secure; SameSite=Strict; ` +
        `Path=/; Max-Age=${Math.floor(7 * 24 * 60 * 60)}; ` +
        `__Host-`
    );
    
    // CSRF token - readable by JS for double-submit
    if (csrfToken) {
        res.headers.append('Set-Cookie', 
            `aanandham_csrf=${csrfToken}; ` +
            `HttpOnly=false; Secure; SameSite=Strict; ` +
            `Path=/; Max-Age=${Math.floor(24 * 60 * 60)}; ` +
            `__Host-`
        );
    }
}

export function clearAuthCookies(res) {
    res.headers.append('Set-Cookie', 
        `aanandham_at=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0; __Host-`
    );
    res.headers.append('Set-Cookie', 
        `aanandham_rt=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0; __Host-`
    );
    res.headers.append('Set-Cookie', 
        `aanandham_sid=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0; __Host-`
    );
    res.headers.append('Set-Cookie', 
        `aanandham_csrf=; HttpOnly=false; Secure; SameSite=Strict; Path=/; Max-Age=0; __Host-`
    );
}

export function getSessionIdFromCookies(request) {
    const cookieHeader = request.headers?.get?.('cookie') || '';
    const match = cookieHeader.match(/aanandham_sid=([^;]+)/);
    return match ? match[1] : null;
}

export function getCSRFTokenFromCookies(request) {
    const cookieHeader = request.headers?.get?.('cookie') || '';
    const match = cookieHeader.match(/aanandham_csrf=([^;]+)/);
    return match ? match[1] : null;
}

// ─────────────────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────────────────

function cidrMatch(ip1, ip2, prefixLength) {
    if (!ip1 || !ip2) return false;
    if (ip1 === ip2) return true;
    
    try {
        const ip1Parts = ip1.split('.').map(Number);
        const ip2Parts = ip2.split('.').map(Number);
        if (ip1Parts.length !== 4 || ip2Parts.length !== 4) return false;
        
        const mask = ~((1 << (32 - prefixLength)) - 1);
        return (ip1Parts[0] << 24 | ip1Parts[1] << 16 | ip1Parts[2] << 8 | ip1Parts[3]) & mask ===
               (ip2Parts[0] << 24 | ip2Parts[1] << 16 | ip2Parts[2] << 8 | ip2Parts[3]) & mask;
    } catch {
        return false;
    }
}

export function getActiveSessionCount() {
    initTokenStores();
    let count = 0;
    const now = Date.now();
    for (const [, entry] of refreshTokens.entries()) {
        if (!entry.revoked && entry.expiresAt > now) count++;
    }
    return count;
}

export function getTokenStats() {
    initTokenStores();
    const now = Date.now();
    let activeRefresh = 0, revokedRefresh = 0, expiredRefresh = 0;
    for (const [, entry] of refreshTokens.entries()) {
        if (entry.revoked) revokedRefresh++;
        else if (entry.expiresAt < Date.now()) expiredRefresh++;
        else activeRefresh++;
    }
    return {
        activeRefreshTokens: activeRefresh,
        revokedRefreshTokens: revokedRefresh,
        expiredRefreshTokens: expiredRefresh,
        activeAccessTokens: accessTokens.size,
        csrfTokens: csrfTokens.size
    };
}

// Import helpers from authConfig
import { getClientIp } from './authConfig.js';
import { hashFingerprint, cidrMatch } from './securityTracker.js';
import { evaluateRequestRisk, validateSessionBinding, createSessionBinding, destroySessionBinding } from './riskEngine.js';