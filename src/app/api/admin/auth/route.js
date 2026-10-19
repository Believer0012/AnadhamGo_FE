import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { AUTH_SECRET, VALID_PASSCODES, IS_PROD, createSignedToken, verifySignedToken, constantTimeCompare, getClientIp, getClientMetadata, revokeToken, authenticatePasscodeRole } from '@/lib/authConfig';
import { recordAuditEvent, getUnifiedAuditStream, logCrash } from '@/lib/auditLedger';
import { recordSecurityEvent } from '@/lib/securityTracker';

function logAuthEvent(event, request = null) {
    return recordAuditEvent({
        category: 'AUTH',
        ...event
    }, request);
}

// ── BOUNDED RATE LIMITING (Per-IP and Global Distributed Brute-Force Shield) ──
const MAX_RATE_LIMIT_ENTRIES = 5000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS_PER_IP = 5;
const MAX_GLOBAL_FAILED_ATTEMPTS = 15;
const loginAttempts = new Map();

let globalFailedAttempts = 0;
let globalLockoutUntil = 0;
let globalWindowStart = Date.now();

// Periodic sweep to evict stale rate-limit records and prevent memory growth
function sweepStaleRateLimits() {
    const now = Date.now();
    for (const [ip, record] of loginAttempts.entries()) {
        if (now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
            loginAttempts.delete(ip);
        }
    }
    if (now - globalWindowStart > RATE_LIMIT_WINDOW_MS) {
        globalFailedAttempts = 0;
        globalWindowStart = now;
    }
}

function isRateLimited(ip) {
    sweepStaleRateLimits();
    const now = Date.now();

    // Check global lockout (stops botnets using rotating IPs)
    if (now < globalLockoutUntil) {
        return true;
    }

    const record = loginAttempts.get(ip);
    if (!record) return false;

    if (now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
        loginAttempts.delete(ip);
        return false;
    }

    return record.count >= MAX_FAILED_ATTEMPTS_PER_IP;
}

function recordFailedAttempt(ip) {
    if (loginAttempts.size >= MAX_RATE_LIMIT_ENTRIES) {
        sweepStaleRateLimits();
    }
    const now = Date.now();
    const record = loginAttempts.get(ip) || { count: 0, firstAttempt: now };
    record.count += 1;
    loginAttempts.set(ip, record);

    globalFailedAttempts += 1;
    if (globalFailedAttempts >= MAX_GLOBAL_FAILED_ATTEMPTS) {
        globalLockoutUntil = now + (5 * 60 * 1000); // 5-minute global cooldown
        console.warn(`🚨 [AUTH ALERT] Global admin brute-force threshold reached (${globalFailedAttempts} failures). Global lockout active for 5 mins.`);
    }
}

function clearAttempts(ip) {
    loginAttempts.delete(ip);
}

// ── POST: Authenticate coordinator passcode, issue token & set HttpOnly cookie ──
export async function POST(request) {
    const ip = getClientIp(request);

    if (isRateLimited(ip)) {
        logAuthEvent({ ip, action: 'LOGIN_BLOCKED_RATE_LIMIT', details: 'Brute-force shield triggered rate limit', success: false, status: 'FAILED', severity: 'HIGH' }, request);
        return NextResponse.json(
            { success: false, message: 'Too many failed login attempts. Rate limit active. Please wait.' },
            { status: 429 }
        );
    }

    if (IS_PROD && (!AUTH_SECRET || VALID_PASSCODES.length === 0)) {
        return NextResponse.json(
            { success: false, message: 'Server configuration error: ADMIN_PASSCODES / ADMIN_AUTH_SECRET environment variables must be configured in production.' },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();
        const { passcode, rememberMe = true } = body;

        if (!passcode) {
            return NextResponse.json({ success: false, message: 'Passcode is required.' }, { status: 400 });
        }

        const authResult = authenticatePasscodeRole(passcode);

        if (!authResult.valid) {
            recordFailedAttempt(ip);
            logAuthEvent({
                ip,
                action: 'LOGIN_FAILED_INVALID_PASSCODE',
                actor: 'Unknown Caller',
                actorRole: 'unknown',
                details: `Failed passcode authentication attempt (prefix: ${String(passcode).slice(0, 2)}***)`,
                success: false,
                status: 'FAILED',
                severity: 'HIGH'
            }, request);
            recordSecurityEvent({
                eventType: 'AUTH_FAILURE',
                action: 'LOGIN_FAILED_PASSCODE',
                request,
                fingerprint: String(request.headers.get('x-device-fingerprint') || '').slice(0, 400),
                details: 'Invalid admin passcode attempt'
            });
            // Artificial delay to mitigate high-speed automated brute-forcing
            await new Promise(r => setTimeout(r, 450 + Math.random() * 150));
            return NextResponse.json({ success: false, message: 'Invalid administrative passcode.' }, { status: 401 });
        }

        // Authentication successful: clear attempt counter for this IP
        clearAttempts(ip);

        // Generate signed, tamper-proof session token (30 days when remembered; 24 hours otherwise)
        const sessionTtlSeconds = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
        const token = createSignedToken({
            role: authResult.role,
            isMasterAdmin: authResult.isMasterAdmin,
            campId: authResult.campId || 'all',
            campName: authResult.campName || 'All Sanctuaries (Enterprise Master HQ)',
            shortName: authResult.shortName || 'Master HQ Scope',
            icon: authResult.icon || '⛺',
            issuedAt: Date.now()
        }, sessionTtlSeconds);

        logAuthEvent({
            ip,
            action: 'LOGIN_SUCCESS',
            actor: authResult.campName || 'Admin Coordinator (Master HQ)',
            actorRole: authResult.role,
            recordId: authResult.campId,
            details: `Coordinator session initialized for scope: ${authResult.campName} (RememberMe: ${rememberMe})`,
            success: true,
            status: 'SUCCESS',
            severity: 'INFO'
        }, request);

        // Set HttpOnly, Secure, SameSite=Strict cookie (NEVER exposed to client JavaScript)
        const response = NextResponse.json({
            success: true,
            role: authResult.role,
            isMasterAdmin: authResult.isMasterAdmin,
            campId: authResult.campId || 'all',
            campName: authResult.campName || 'All Sanctuaries (Enterprise Master HQ)',
            shortName: authResult.shortName || 'Master HQ Scope',
            icon: authResult.icon || '⛺',
            message: `Authenticated as ${authResult.campName || 'Authorized Host'}.`
        });

        response.cookies.set({
            name: 'aanandham_admin_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: sessionTtlSeconds
        });

        return response;
    } catch (err) {
        logCrash({ source: 'ADMIN_AUTH', route: 'POST /api/admin/auth', error: err, request });
        return NextResponse.json({ success: false, message: 'Authentication processing error.' }, { status: 500 });
    }
}

// ── GET: Check session validity and retrieve active coordinator scope ──
export async function GET(request) {
    try {
        const cookieToken = request.cookies.get('aanandham_admin_token');
        const token = cookieToken ? cookieToken.value : null;

        if (!token) {
            return NextResponse.json({ authenticated: false, message: 'No authorization cookie provided.' }, { status: 401 });
        }

        const payload = verifySignedToken(token);

        if (payload && (payload.role === 'admin_coordinator' || payload.role === 'basecamp_host' || payload.role === 'camp_marshal')) {
            const url = new URL(request.url);
            const isMaster = Boolean(payload.isMasterAdmin === true && payload.role === 'admin_coordinator');

            if (url.searchParams.get('audit') === 'true') {
                const stream = getUnifiedAuditStream({ limit: 100 });
                return NextResponse.json({
                    authenticated: true,
                    role: payload.role,
                    isMasterAdmin: isMaster,
                    campId: payload.campId || 'all',
                    campName: payload.campName || 'All Sanctuaries',
                    shortName: payload.shortName || 'Master HQ Scope',
                    icon: payload.icon || '⛺',
                    user: { role: payload.role, exp: payload.exp, campId: payload.campId, campName: payload.campName },
                    auditLogs: stream.logs,
                    walLedger: stream.walLedger,
                    snapshots: stream.snapshots,
                    stats: stream.stats
                });
            }

            return NextResponse.json({
                authenticated: true,
                role: payload.role,
                isMasterAdmin: isMaster,
                campId: payload.campId || 'all',
                campName: payload.campName || 'All Sanctuaries',
                shortName: payload.shortName || 'Master HQ Scope',
                icon: payload.icon || '⛺',
                user: { role: payload.role, exp: payload.exp, campId: payload.campId, campName: payload.campName }
            });
        } else {
            return NextResponse.json({ authenticated: false, message: 'Invalid or expired session token.' }, { status: 401 });
        }
    } catch (err) {
        logCrash({ source: 'ADMIN_AUTH', route: 'GET /api/admin/auth', error: err, request });
        return NextResponse.json({ authenticated: false, message: 'Error validating session token.' }, { status: 401 });
    }
}

// ── DELETE: Revoke session token and clear HttpOnly cookie ──
export async function DELETE(request) {
    try {
        const cookieToken = request.cookies.get('aanandham_admin_token');
        const token = cookieToken ? cookieToken.value : null;

        if (token) {
            revokeToken(token);
        }

        const ip = getClientIp(request);
        logAuthEvent({
            ip,
            action: 'LOGOUT',
            actor: 'Admin Coordinator',
            details: 'Session explicitly terminated by coordinator',
            success: true,
            status: 'SUCCESS',
            severity: 'INFO'
        }, request);

        const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
        response.cookies.set({
            name: 'aanandham_admin_token',
            value: '',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 0 // Expire immediately
        });

        return response;
    } catch (err) {
        logCrash({ source: 'ADMIN_AUTH', route: 'DELETE /api/admin/auth', error: err, request });
        return NextResponse.json({ success: false, message: 'Error processing logout.' }, { status: 500 });
    }
}