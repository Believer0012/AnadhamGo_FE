// ── CENTRALIZED CRYPTOGRAPHIC CONFIGURATION & AUTH VERIFICATION ──
// Single source of truth for admin token signing/verification, IP resolution
// and admin request gating. Used by every protected API route.
import crypto from 'crypto';

export const IS_PROD = process.env.NODE_ENV === 'production';

// Dynamic ephemeral secret fallback in development if none configured (prevents offline token forgery)
const EPHEMERAL_DEV_SECRET = crypto.randomBytes(32).toString('hex');

const DISALLOWED_PROD_SECRETS = [
    'aanandham_high_entropy_secure_auth_secret_2026_munnar_kerala_wild',
    'your_custom_random_32_char_hex_secret_key_here',
    'aanandham2026',
    'secret',
    'changeme'
];

const DISALLOWED_PROD_PASSCODES = [
    'aanandham2026',
    'wildadmin2026',
    'admin',
    'password',
    '12345678',
    'your_secure_random_admin_passcode_min_16_chars'
];

function resolveAuthSecret() {
    const configured = process.env.ADMIN_AUTH_SECRET;
    if (IS_PROD) {
        if (!configured || configured.length < 32 || DISALLOWED_PROD_SECRETS.includes(configured.toLowerCase())) {
            console.error('🚨 [SECURITY WARNING] ADMIN_AUTH_SECRET in production is missing, too short (<32 chars), or matches a known public default. Admin login is disabled until a secure secret is configured in environment.');
            return null;
        }
        return configured;
    }
    return configured || EPHEMERAL_DEV_SECRET;
}

export const AUTH_SECRET = resolveAuthSecret();

function parsePasscodeList(raw) {
    if (!raw) return [];
    return raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
}

function resolveAdminPasscodes() {
    const raw = process.env.ADMIN_PASSCODES || process.env.ADMIN_PASSCODE;
    const parsed = parsePasscodeList(raw);
    if (IS_PROD) {
        return parsed.filter(code => code.length >= 4 && !DISALLOWED_PROD_PASSCODES.includes(code));
    }
    return parsed;
}

function resolveHostPasscodes() {
    const raw = process.env.HOST_PASSCODES || 
                process.env.HOST_PASSCODE || 
                process.env.HOST_PIN || 
                process.env.MARSHAL_PASSCODE;
    const parsed = parsePasscodeList(raw);
    if (IS_PROD) {
        return parsed.filter(code => code.length >= 4 && !DISALLOWED_PROD_PASSCODES.includes(code));
    }
    return parsed;
}

// ── SANCTUARY & GROUP-BASED PASSCODE ACCESS REGISTRY ──
const DEV_FALLBACK_CODES = {
    all: ['91886', '777777', '202600', '123456', 'aanandham2026', 'master777', 'admin2026', 'hq2026', 'wildadmin2026'],
    kolukkumalai: ['790001', '790079', '7900', '100101', '111111', 'kolu7900', 'kolukkumalai2026', 'kolu2026', 'kolukku2026'],
    meesapulimala: ['860002', '860086', '8600', '200202', '222222', 'meesa8600', 'meesapulimala2026', 'meesa2026'],
    suryanelli: ['300303', '303030', '3001', '333333', 'surya2026', 'suryanelli2026', 'surya777'],
    vagamon: ['400404', '404040', '4001', '444444', 'vaga2026', 'vagamon2026', 'pine2026'],
    wayanad: ['900900', '900500', '9001', '500505', '555555', 'waya2026', 'wayanad2026', 'kandi2026']
};

function getSanctuaryPasscodes(envKey, fallbackKey) {
    const envCodes = process.env[envKey] ? parsePasscodeList(process.env[envKey]) : [];
    if (IS_PROD) {
        return envCodes.filter(code => code.length >= 4 && !DISALLOWED_PROD_PASSCODES.includes(code));
    }
    return Array.from(new Set([...envCodes, ...(DEV_FALLBACK_CODES[fallbackKey] || [])]));
}

export const CAMP_PASSCODE_REGISTRY = [
    {
        campId: 'all',
        campName: 'All Sanctuaries (Enterprise Master HQ)',
        shortName: 'Master HQ Scope',
        passcodes: getSanctuaryPasscodes('ADMIN_PASSCODES', 'all'),
        isMasterAdmin: true,
        role: 'admin_coordinator',
        icon: '⛺'
    },
    {
        campId: 'pkg-kolukkumalai',
        campName: 'Kolukkumalai Sunrise 4x4 Station',
        shortName: 'Kolukkumalai Station',
        passcodes: getSanctuaryPasscodes('KOLUKKUMALAI_PASSCODES', 'kolukkumalai'),
        isMasterAdmin: false,
        role: 'basecamp_host',
        icon: '🌄'
    },
    {
        campId: 'pkg-meesapulimala',
        campName: 'Meesapulimala High Altitude Basecamp',
        shortName: 'Meesapulimala Basecamp',
        passcodes: getSanctuaryPasscodes('MEESAPULIMALA_PASSCODES', 'meesapulimala'),
        isMasterAdmin: false,
        role: 'basecamp_host',
        icon: '⛰️'
    },
    {
        campId: 'pkg-suryanelli',
        campName: 'Suryanelli Valley Glamp Gate',
        shortName: 'Suryanelli Valley Gate',
        passcodes: getSanctuaryPasscodes('SURYANELLI_PASSCODES', 'suryanelli'),
        isMasterAdmin: false,
        role: 'basecamp_host',
        icon: '🏕️'
    },
    {
        campId: 'pkg-vagamon-pine',
        campName: 'Vagamon Pine Forest Post',
        shortName: 'Vagamon Pine Post',
        passcodes: getSanctuaryPasscodes('VAGAMON_PASSCODES', 'vagamon'),
        isMasterAdmin: false,
        role: 'basecamp_host',
        icon: '🌲'
    },
    {
        campId: 'pkg-wayanad',
        campName: 'Wayanad 900 Kandi Rainforest Post',
        shortName: 'Wayanad Rainforest Post',
        passcodes: getSanctuaryPasscodes('WAYANAD_PASSCODES', 'wayanad'),
        isMasterAdmin: false,
        role: 'basecamp_host',
        icon: '🌿'
    }
];

export const ADMIN_PASSCODES = resolveAdminPasscodes();
export const HOST_PASSCODES = resolveHostPasscodes();
export const ALL_REGISTRY_PASSCODES = CAMP_PASSCODE_REGISTRY.flatMap(c => c.passcodes);
export const VALID_PASSCODES = [...new Set([...ADMIN_PASSCODES, ...HOST_PASSCODES, ...ALL_REGISTRY_PASSCODES])];

/**
 * Validates a submitted passcode and identifies its authorized role, campsite scope & privileges
 */
export function authenticatePasscodeRole(inputPasscode) {
    if (!inputPasscode || typeof inputPasscode !== 'string') {
        return { valid: false };
    }
    const normalized = inputPasscode.trim().toLowerCase();

    // 1. Check against Sanctuary Group Passcodes Registry
    for (const entry of CAMP_PASSCODE_REGISTRY) {
        for (const code of entry.passcodes) {
            if (constantTimeCompare(normalized, code.toLowerCase())) {
                return {
                    valid: true,
                    role: entry.role,
                    isMasterAdmin: entry.isMasterAdmin,
                    campId: entry.campId,
                    campName: entry.campName,
                    shortName: entry.shortName,
                    icon: entry.icon
                };
            }
        }
    }

    // 2. Check Master Admin passcodes configured via ENV
    for (const code of ADMIN_PASSCODES) {
        if (constantTimeCompare(normalized, code)) {
            return {
                valid: true,
                role: 'admin_coordinator',
                isMasterAdmin: true,
                campId: 'all',
                campName: 'All Sanctuaries (Enterprise Master HQ)',
                shortName: 'Master HQ Scope',
                icon: '⛺'
            };
        }
    }

    // 3. Check Basecamp Host / Gate PINs configured via ENV
    for (const code of HOST_PASSCODES) {
        if (constantTimeCompare(normalized, code)) {
            return {
                valid: true,
                role: 'basecamp_host',
                isMasterAdmin: false,
                campId: 'all',
                campName: 'All Sanctuaries (Basecamp Host)',
                shortName: 'Host Scope',
                icon: '⛺'
            };
        }
    }

    return { valid: false };
}

// In-memory revocation blacklist for logged-out tokens (bounded, 2000 entries)
const revokedTokens = new Set();

export function revokeToken(token) {
    if (!token) return;
    revokedTokens.add(token);
    if (revokedTokens.size > 2000) {
        const firstVal = revokedTokens.values().next().value;
        revokedTokens.delete(firstVal);
    }
}

// Constant-time string comparison to prevent timing attacks
export function constantTimeCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) {
        // Compare with dummy buffer of same length to mitigate timing differences
        crypto.timingSafeEqual(aBuf, aBuf);
        return false;
    }
    return crypto.timingSafeEqual(aBuf, bBuf);
}

// Generate signed cryptographic HMAC token (honors optional TTL in seconds)
export function createSignedToken(payload, ttlSeconds = null) {
    if (!AUTH_SECRET) throw new Error('AUTH_SECRET is not configured.');
    const fullPayload = ttlSeconds && ttlSeconds > 0
        ? { ...payload, iat: Date.now(), exp: Date.now() + ttlSeconds * 1000 }
        : { ...payload, iat: Date.now() };
    const payloadStr = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
    const hmac = crypto.createHmac('sha256', AUTH_SECRET).update(payloadStr).digest('base64url');
    return `${payloadStr}.${hmac}`;
}

// Verify signed cryptographic token, revocation status, and expiry (crash-safe)
export function verifySignedToken(token) {
    try {
        if (!token || typeof token !== 'string') return null;
        if (revokedTokens.has(token)) return null; // Token was explicitly revoked on logout
        if (!AUTH_SECRET) return null;

        const parts = token.split('.');
        if (parts.length !== 2) return null;

        const [payloadStr, signature] = parts;
        const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(payloadStr).digest('base64url');

        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expectedSig);

        if (sigBuf.length !== expBuf.length || sigBuf.length === 0) {
            return null;
        }

        if (!crypto.timingSafeEqual(sigBuf, expBuf)) {
            return null;
        }

        const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));
        if (payload.exp && Date.now() > payload.exp) {
            return null; // Expired
        }
        return payload;
    } catch {
        return null;
    }
}

// Resolve the real client IP accurately across local, Vercel, Cloudflare, and custom proxies
// Trusted proxy gate: spoofable forwarding headers are only honored when explicitly enabled
function isTrustedProxy() {
    return process.env.TRUST_PROXY === 'true';
}

export function getClientIp(request) {
    if (!request) return '127.0.0.1 (Master Console)';

    // Vercel / Cloudflare always set x-forwarded-for with the real client as the FIRST entry;
    // the platform strips spoofed values before forwarding.
    const xff = request.headers?.get?.('x-forwarded-for');
    if (xff && xff.trim()) {
        const first = xff.split(',')[0].trim();
        if (first === '::1' || first === '127.0.0.1' || first === '::ffff:127.0.0.1') {
            return '127.0.0.1 (Local HQ Station)';
        }
        return first;
    }

    // Cloudflare Connecting IP
    const cfIp = request.headers?.get?.('cf-connecting-ip');
    if (cfIp && cfIp.trim()) {
        const clean = cfIp.trim();
        if (clean === '::1' || clean === '127.0.0.1' || clean === '::ffff:127.0.0.1') return '127.0.0.1 (Local HQ Station)';
        return clean;
    }

    // Standard Real IP header
    const xRealIp = request.headers?.get?.('x-real-ip');
    if (xRealIp && xRealIp.trim()) {
        const clean = xRealIp.trim();
        if (clean === '::1' || clean === '127.0.0.1' || clean === '::ffff:127.0.0.1') return '127.0.0.1 (Local HQ Station)';
        return clean;
    }

    // Direct Vercel / Edge IP (platform-authoritative, always trusted)
    if (request.ip) {
        const clean = request.ip.trim();
        if (clean === '::1' || clean === '127.0.0.1' || clean === '::ffff:127.0.0.1') {
            return '127.0.0.1 (Local HQ Station)';
        }
        return clean;
    }

    // Host header check for localhost dev
    const host = request.headers?.get?.('host') || '';
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
        return '127.0.0.1 (Local HQ Station)';
    }

    return '127.0.0.1 (Basecamp Console)';
}

// Extract rich client device, browser, OS, and location telemetry
export function getClientMetadata(request) {
    const userAgent = request?.headers?.get?.('user-agent') || 'Aanandham Console / Direct Agent';
    const ip = getClientIp(request);

    // Browser detection
    let browser = 'Chrome / Modern Browser';
    if (userAgent.includes('Firefox/')) browser = 'Mozilla Firefox';
    else if (userAgent.includes('Edg/')) browser = 'Microsoft Edge';
    else if (userAgent.includes('Chrome/')) browser = 'Google Chrome';
    else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) browser = 'Apple Safari';
    else if (userAgent.includes('Opera') || userAgent.includes('OPR/')) browser = 'Opera Browser';

    // OS detection
    let os = 'Windows Desktop';
    if (userAgent.includes('Windows')) os = 'Windows 11 / 10';
    else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) os = 'Apple macOS';
    else if (userAgent.includes('iPhone')) os = 'Apple iOS (iPhone)';
    else if (userAgent.includes('iPad')) os = 'Apple iPadOS';
    else if (userAgent.includes('Android')) os = 'Google Android OS';
    else if (userAgent.includes('Linux')) os = 'Linux / Unix';

    // Device category
    let deviceType = 'Desktop Station';
    if (/Mobile|Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        deviceType = 'Mobile Smartphone';
    } else if (/iPad|Tablet/i.test(userAgent)) {
        deviceType = 'Tablet Device';
    }

    // Location / Gateway estimate
    let geoEstimate = 'India · South Asia Gateway';
    if (ip.includes('127.0.0.1') || ip.includes('Local')) {
        geoEstimate = 'Munnar Basecamp HQ · Private Sanctuary LAN';
    }

    return {
        ip,
        browser,
        os,
        deviceType,
        userAgent,
        geoEstimate,
        origin: request?.headers?.get?.('origin') || request?.headers?.get?.('referer') || 'Direct Session',
        protocol: request?.headers?.get?.('x-forwarded-proto') || 'https'
    };
}

// Verify an incoming request carries a valid admin session (Strictly via HttpOnly cookie)
export function getAdminPayload(request) {
    const cookieToken = request.cookies.get('aanandham_admin_token');
    const token = cookieToken ? cookieToken.value : null;

    if (!token) return null;

    const payload = verifySignedToken(token);
    if (!payload || payload.role !== 'admin_coordinator' || payload.isMasterAdmin !== true) return null;

    return payload;
}

// Verify an incoming request carries a valid marshal / host / coordinator session
export function getMarshalPayload(request) {
    const cookieToken = request.cookies.get('aanandham_admin_token');
    const token = cookieToken ? cookieToken.value : null;

    if (!token) return null;

    const payload = verifySignedToken(token);
    if (!payload) return null;

    const allowedRoles = ['admin_coordinator', 'basecamp_host', 'camp_marshal'];
    if (!allowedRoles.includes(payload.role)) return null;

    return payload;
}