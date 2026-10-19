// Universal Security Middleware
// Applies risk evaluation, security gates, CSRF, and rate limiting to all API routes

import { checkSecurityGate } from './securityTracker.js';
import { checkRateLimit, isIpBlocked } from './redis.js';
import { evaluateRequestRisk, validateSessionBinding, createSessionBinding } from './riskEngine.js';
import { verifyAccessToken, getSessionIdFromCookies, getCSRFTokenFromCookies, verifyCSRFToken } from './tokenStore.js';
import { getClientIp, getClientMetadata } from './authConfig.js';
import { hashFingerprint } from './securityTracker.js';
import { recordSecurityEvent } from './securityTracker.js';

export const SECURITY_TIER = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
};

export const ENDPOINT_SENSITIVITY = {
    PUBLIC: 'public',
    AUTH: 'auth',
    ADMIN: 'admin',
    PAYMENT: 'payment',
    MARSHAL: 'marshal'
};

const ENDPOINT_CLASSIFICATION = {
    '/api/bookings': ENDPOINT_SENSITIVITY.PAYMENT,
    '/api/payments': ENDPOINT_SENSITIVITY.PAYMENT,
    '/api/admin': ENDPOINT_SENSITIVITY.ADMIN,
    '/api/marshal': ENDPOINT_SENSITIVITY.MARSHAL,
    '/api/auth': ENDPOINT_SENSITIVITY.AUTH,
    '/api/contact': ENDPOINT_SENSITIVITY.PUBLIC,
    '/api/inquiries': ENDPOINT_SENSITIVITY.PUBLIC,
    '/api/discounts': ENDPOINT_SENSITIVITY.AUTH,
    '/api/testimonials': ENDPOINT_SENSITIVITY.PUBLIC,
    '/api/camps': ENDPOINT_SENSITIVITY.PUBLIC,
    '/api/webhooks': ENDPOINT_SENSITIVITY.AUTH,
    '/api/marshal/checkin': ENDPOINT_SENSITIVITY.MARSHAL,
    '/api/marshal/roster': ENDPOINT_SENSITIVITY.MARSHAL,
    '/api/marshal/verify': ENDPOINT_SENSITIVITY.MARSHAL,
    '/api/admin/bookings': ENDPOINT_SENSITIVITY.ADMIN,
    '/api/admin/camps': ENDPOINT_SENSITIVITY.ADMIN,
    '/api/admin/discounts': ENDPOINT_SENSITIVITY.ADMIN,
    '/api/admin/media': ENDPOINT_SENSITIVITY.ADMIN,
    '/api/admin/auth': ENDPOINT_SENSITIVITY.AUTH,
    '/api/admin/audit': ENDPOINT_SENSITIVITY.ADMIN,
    '/api/admin/security': ENDPOINT_SENSITIVITY.ADMIN,
    '/api/marshal/seed': ENDPOINT_SENSITIVITY.ADMIN,
    '/api/marshal/test-email': ENDPOINT_SENSITIVITY.ADMIN,
    '/api/security/report': ENDPOINT_SENSITIVITY.ADMIN,
    '/api/presence': ENDPOINT_SENSITIVITY.AUTH
};

function classifyEndpoint(pathname) {
    for (const [prefix, sensitivity] of Object.entries(ENDPOINT_CLASSIFICATION)) {
        if (pathname.startsWith(prefix)) return sensitivity;
    }
    return ENDPOINT_SENSITIVITY.PUBLIC;
}

function getRateLimitConfig(sensitivity, method) {
    const configs = {
        [ENDPOINT_SENSITIVITY.PUBLIC]: { max: 60, window: 60 },
        [ENDPOINT_SENSITIVITY.AUTH]: { max: 20, window: 60 },
        [ENDPOINT_SENSITIVITY.ADMIN]: { max: 30, window: 60 },
        [ENDPOINT_SENSITIVITY.PAYMENT]: { max: 10, window: 60 },
        [ENDPOINT_SENSITIVITY.MARSHAL]: { max: 30, window: 60 }
    };
    
    const base = configs[sensitivity] || configs[ENDPOINT_SENSITIVITY.PUBLIC];
    
    // Stricter for mutating methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        return { max: Math.max(1, Math.floor(base.max / 2)), window: base.window };
    }
    
    return base;
}

export async function securityMiddleware(request, options = {}) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;
    const sensitivity = classifyEndpoint(pathname);
    const rateLimitConfig = getRateLimitConfig(sensitivity, method);
    
    const ip = getClientIp(request);
    const deviceFp = request.headers.get('x-device-fingerprint');
    const deviceHash = deviceFp ? hashFingerprint(deviceFp) : null;
    const sessionId = options.sessionId;
    const deviceProfile = options.deviceProfile ? JSON.parse(options.deviceProfile) : null;
    
    const results = {
        allowed: true,
        riskTier: 'LOW',
        riskScore: 0,
        actions: [],
        headers: {},
        securityContext: null
    };
    
    // 1. IP Blocklist Check (fast path)
    const ipBlocked = await isIpBlocked(ip);
    if (ipBlocked) {
        results.allowed = false;
        results.riskTier = 'CRITICAL';
        results.actions.push('IP_BLOCKED');
        results.headers['Retry-After'] = '86400';
        return results;
    }
    
    // 2. Rate Limiting
    const rateKey = deviceHash 
        ? `ratelimit:${sensitivity}:${deviceHash.slice(0, 16)}`
        : `ratelimit:${sensitivity}:ip:${ip}`;
    
    const rateLimit = await checkRateLimit(rateKey, rateLimitConfig.max, rateLimitConfig.window);
    if (!rateLimit.allowed) {
        results.allowed = false;
        results.riskTier = 'HIGH';
        results.actions.push('RATE_LIMITED');
        results.headers['Retry-After'] = String(rateLimit.resetSeconds);
        results.headers['X-RateLimit-Limit'] = String(rateLimitConfig.max);
        results.headers['X-RateLimit-Remaining'] = '0';
        results.headers['X-RateLimit-Reset'] = String(Math.floor(Date.now() / 1000) + rateLimit.resetSeconds);
        return results;
    }
    
    results.headers['X-RateLimit-Limit'] = String(rateLimitConfig.max);
    results.headers['X-RateLimit-Remaining'] = String(rateLimit.remaining);
    results.headers['X-RateLimit-Reset'] = String(Math.floor(Date.now() / 1000) + rateLimit.resetSeconds);
    
    // 3. Security Gate (Bot Detection, Active Blocks)
    const gate = checkSecurityGate({ 
        headers: request.headers,
        method: request.method
    }, deviceFp);
    
    if (!gate.allowed) {
        results.allowed = false;
        results.riskTier = gate.botScore ? 'HIGH' : 'CRITICAL';
        results.actions.push('SECURITY_GATE_BLOCK');
        if (gate.block) {
            results.headers['Retry-After'] = String(Math.ceil((gate.block.until - Date.now()) / 1000));
        }
        return results;
    }
    
    // 4. Risk Evaluation
    const authState = options.authState || null;
    const endpoint = new URL(request.url).pathname;
    
    const risk = evaluateRequestRisk({
        headers: request.headers,
        method: request.method,
        url: request.url
    }, {
        deviceHash,
        endpoint,
        authState,
        sessionId: options.sessionId,
        ip: getClientIp({ headers: request.headers }),
        metadata: { sensitivity, method }
    });
    
    results.riskTier = risk.tier;
    results.riskScore = risk.score;
    results.securityContext = risk;
    
    // Apply tier-based actions
    switch (risk.tier) {
        case 'CRITICAL':
            results.allowed = false;
            results.actions.push('RISK_CRITICAL_BLOCK');
            break;
        case 'HIGH':
            if (sensitivity === ENDPOINT_SENSITIVITY.PUBLIC) {
                results.allowed = false;
                results.actions.push('RISK_HIGH_BLOCK_PUBLIC');
            } else {
                results.actions.push('RISK_HIGH_STRICT_CHALLENGE');
                results.headers['X-Require-Challenge'] = 'strict';
            }
            break;
        case 'MEDIUM':
            results.actions.push('RISK_MEDIUM_CHALLENGE');
            results.headers['X-Require-Challenge'] = 'turnstile';
            break;
        case 'LOW':
        default:
            results.headers['X-Require-Challenge'] = 'none';
            break;
    }
    
    // 5. Session Validation (if session exists)
    if (options.sessionId && deviceHash) {
        const sessionValidation = validateSessionBinding(options.sessionId, deviceHash, getClientIp({ headers: request.headers }), {
            userAgent: request.headers.get('user-agent'),
            ...(deviceProfile || {})
        });
        
        if (!sessionValidation.valid) {
            results.allowed = false;
            results.riskTier = 'CRITICAL';
            results.actions.push('SESSION_HIJACK_DETECTED');
            return results;
        }
        
        if (sessionValidation.risk === 'HIGH') {
            results.actions.push('SESSION_ANOMALY_DETECTED');
        }
    }
    
    // 5. Access Token Validation (for authenticated endpoints)
    if (sensitivity !== ENDPOINT_SENSITIVITY.PUBLIC && options.accessToken) {
        const tokenValidation = verifyAccessToken(options.accessToken, {
            headers: request.headers,
            method,
            url: request.url
        });
        
        if (!tokenValidation.valid) {
            results.allowed = false;
            results.riskTier = tokenValidation.sessionHijack ? 'CRITICAL' : 'HIGH';
            results.actions.push(`TOKEN_INVALID: ${tokenValidation.reason}`);
            if (tokenValidation.sessionHijack) {
                results.actions.push('SESSION_HIJACK_DETECTED');
            }
            return results;
        }
        
        results.authPayload = tokenValidation.payload;
        if (tokenValidation.risk === 'CRITICAL') {
            results.allowed = false;
            results.actions.push('TOKEN_RISK_CRITICAL');
            return results;
        }
    }
    
    // 6. CSRF Protection for Mutating Methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && sensitivity !== ENDPOINT_SENSITIVITY.PUBLIC) {
        const csrfToken = options.csrfToken || request.headers.get('x-csrf-token');
        const sessionId = options.sessionId;
        
        if (!csrfToken || !sessionId || !verifyCSRFToken(csrfToken, sessionId)) {
            results.allowed = false;
            results.riskTier = 'HIGH';
            results.actions.push('CSRF_VALIDATION_FAILED');
            return results;
        }
    }
    
    // 7. Body Size Limit
    const contentLength = Number(request.headers.get('content-length') || 0);
    const maxBodySize = sensitivity === ENDPOINT_SENSITIVITY.PAYMENT ? 65536 : 1048576; // 64KB for payments, 1MB otherwise
    if (contentLength > maxBodySize) {
        results.allowed = false;
        results.riskTier = 'HIGH';
        results.actions.push('BODY_SIZE_EXCEEDED');
        return results;
    }
    
    // 8. Security Headers
    results.headers['X-Content-Type-Options'] = 'nosniff';
    results.headers['X-Frame-Options'] = 'DENY';
    results.headers['X-XSS-Protection'] = '1; mode=block';
    results.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    results.headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()';
    results.headers['X-Risk-Tier'] = risk.tier;
    results.headers['X-Risk-Score'] = String(risk.score);
    
    // CSP for API responses
    results.headers['Content-Security-Policy'] = "default-src 'none'; frame-ancestors 'none';";
    
    return results;
}

// ─────────────────────────────────────────────────────────────────
// HIGH-LEVEL WRAPPER FOR API ROUTES
// ─────────────────────────────────────────────────────────────────

export function withSecurity(handler, options = {}) {
    return async (request, context) => {
        // Extract security-relevant headers
        const deviceFp = request.headers.get('x-device-fingerprint');
        const deviceProfile = request.headers.get('x-device-profile');
        const accessToken = request.headers.get('authorization')?.replace('Bearer ', '') || 
                           request.headers.get('x-access-token');
        const csrfToken = request.headers.get('x-csrf-token') || 
                         request.headers.get('x-csrftoken');
        const sessionId = request.headers.get('x-session-id') || 
                         getSessionIdFromCookies(request);
        const csrfTokenHeader = request.headers.get('x-csrf-token');
        
        // Run security middleware
        const security = await securityMiddleware(request, {
            sessionId,
            deviceProfile,
            accessToken,
            csrfToken: csrfTokenHeader,
            authState: options.authState,
            sessionId
        });
        
        // Apply security headers to response
        const originalHeaders = new Headers();
        for (const [key, value] of Object.entries(security.headers)) {
            originalHeaders.set(key, value);
        }
        
        if (!security.allowed) {
            // Log security event
            const { recordSecurityEvent } = await import('./securityTracker.js');
            recordSecurityEvent({
                eventType: 'SECURITY_BLOCK',
                action: security.actions.join(','),
                request: { headers: request.headers, method: request.method, url: request.url },
                fingerprint: hashFingerprint(request.headers.get('x-device-fingerprint')),
                details: `Blocked by security middleware: ${security.actions.join(', ')}. Risk: ${security.riskTier} (${security.riskScore})`
            });
            
            // Return appropriate error response
            const statusMap = {
                'RATE_LIMITED': 429,
                'IP_BLOCKED': 403,
                'SECURITY_GATE_BLOCK': 403,
                'RISK_CRITICAL_BLOCK': 403,
                'RISK_HIGH_BLOCK_PUBLIC': 403,
                'SESSION_HIJACK_DETECTED': 401,
                'TOKEN_INVALID': 401,
                'SESSION_HIJACK_DETECTED': 401,
                'CSRF_VALIDATION_FAILED': 403,
                'BODY_SIZE_EXCEEDED': 413
            };
            
            const status = statusMap[security.actions[0]] || 403;
            
            return new Response(JSON.stringify({
                success: false,
                message: getErrorMessage(security.actions[0]),
                riskTier: security.riskTier,
                riskScore: security.riskScore,
                challenge: security.headers['X-Require-Challenge']
            }), {
                status,
                headers: originalHeaders
            });
        }
        
        // Attach security context to request for downstream use
        request.security = security;
        request.riskTier = security.riskTier;
        request.riskScore = security.riskScore;
        request.authPayload = security.authPayload;
        request.sessionId = sessionId;
        
        // Call the actual handler
        const response = await handler(request, context);
        
        // Apply security headers to successful response
        if (response instanceof Response) {
            for (const [key, value] of Object.entries(security.headers)) {
                response.headers.set(key, value);
            }
        }
        
        return response;
    };
}

function getErrorMessage(action) {
    const messages = {
        'RATE_LIMITED': 'Too many requests. Please wait before trying again.',
        'IP_BLOCKED': 'Access restricted from this IP address.',
        'SECURITY_GATE_BLOCK': 'Automated access detected. Please verify you are human.',
        'RISK_CRITICAL_BLOCK': 'Access denied due to critical security risk.',
        'RISK_HIGH_BLOCK_PUBLIC': 'Access denied. High security risk detected.',
        'SESSION_HIJACK_DETECTED': 'Session validation failed. Please log in again.',
        'TOKEN_INVALID': 'Authentication token invalid or expired.',
        'SESSION_HIJACK_DETECTED': 'Session validation failed. Please log in again.',
        'CSRF_VALIDATION_FAILED': 'Invalid security token. Please refresh and try again.',
        'BODY_SIZE_EXCEEDED': 'Request body too large.'
    };
    return messages[action] || 'Access denied due to security policy.';
}

function getSessionIdFromCookies(request) {
    const cookieHeader = request.headers?.get?.('cookie') || '';
    const match = cookieHeader.match(/aanandham_sid=([^;]+)/);
    return match ? match[1] : null;
}

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