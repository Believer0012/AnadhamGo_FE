// Multi-Stage Risk Evaluation Engine
// Combines static, behavioral, and contextual signals into a unified risk score

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getClientIp, getClientMetadata } from './authConfig.js';
import { analyzeBotSignals, hashFingerprint, recordSecurityEvent } from './securityTracker.js';
import { isIpBlocked } from './redis.js';

const DATA_DIR = path.join(process.cwd(), '.data');
const DEVICE_STORE_FILE = path.join(DATA_DIR, 'device_reputation.json');
const ACCOUNT_STORE_FILE = path.join(DATA_DIR, 'account_creation_tracking.json');
const SESSION_STORE_FILE = path.join(DATA_DIR, 'session_binding.json');

const MAX_DEVICES = 10000;
const MAX_ACCOUNT_TRACKING = 5000;
const MAX_SESSION_BINDINGS = 20000;

let deviceReputation = new Map();
let accountCreationTracking = new Map();
let sessionBindings = new Map();
let isInitialized = false;

function ensureStorageDirs() {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch { /* read-only serverless */ }
}

function initStores() {
    if (isInitialized) return;
    ensureStorageDirs();
    try {
        if (fs.existsSync(DEVICE_STORE_FILE)) {
            const parsed = JSON.parse(fs.readFileSync(DEVICE_STORE_FILE, 'utf-8'));
            if (Array.isArray(parsed)) {
                deviceReputation = new Map(parsed);
            }
        }
    } catch { deviceReputation = new Map(); }
    try {
        if (fs.existsSync(ACCOUNT_STORE_FILE)) {
            const parsed = JSON.parse(fs.readFileSync(ACCOUNT_STORE_FILE, 'utf-8'));
            if (Array.isArray(parsed)) {
                accountCreationTracking = new Map(parsed);
            }
        }
    } catch { accountCreationTracking = new Map(); }
    try {
        if (fs.existsSync(SESSION_STORE_FILE)) {
            const parsed = JSON.parse(fs.readFileSync(SESSION_STORE_FILE, 'utf-8'));
            if (Array.isArray(parsed)) {
                sessionBindings = new Map(parsed);
            }
        }
    } catch { sessionBindings = new Map(); }
    isInitialized = true;
}

function persistDevices() {
    try {
        ensureStorageDirs();
        fs.writeFileSync(DEVICE_STORE_FILE, JSON.stringify(Array.from(deviceReputation.entries()).slice(0, MAX_DEVICES), null, 2), 'utf-8');
    } catch { /* ignore */ }
}

function persistAccounts() {
    try {
        ensureStorageDirs();
        fs.writeFileSync(ACCOUNT_STORE_FILE, JSON.stringify(Array.from(accountCreationTracking.entries()).slice(0, MAX_ACCOUNT_TRACKING), null, 2), 'utf-8');
    } catch { /* ignore */ }
}

function persistSessions() {
    try {
        ensureStorageDirs();
        fs.writeFileSync(SESSION_STORE_FILE, JSON.stringify(Array.from(sessionBindings.entries()).slice(0, MAX_SESSION_BINDINGS), null, 2), 'utf-8');
    } catch { /* ignore */ }
}

// ─────────────────────────────────────────────────────────────────
// DEVICE REPUTATION TRACKING
// ─────────────────────────────────────────────────────────────────

export function getDeviceReputation(deviceHash) {
    initStores();
    if (!deviceHash) return { known: false, trustScore: 50, flags: [] };
    const entry = deviceReputation.get(deviceHash);
    if (!entry) return { known: false, trustScore: 50, flags: ['new_device'] };
    
    const now = Date.now();
    const ageDays = (now - entry.firstSeen) / (1000 * 60 * 60 * 24);
    const flags = [];
    
    if (entry.spoofingAttempts > 0) flags.push('spoofing_attempts');
    if (entry.anomalyCount > 3) flags.push('frequent_anomalies');
    if (entry.accountCreations > 3) flags.push('multi_account_creation');
    if (entry.sessionHijackAttempts > 0) flags.push('session_hijack_attempts');
    if (ageDays < 1) flags.push('brand_new_device');
    if (entry.blockedCount > 0) flags.push('previously_blocked');
    if (entry.geoAnomalies > 2) flags.push('geo_velocity_anomaly');
    
    // Trust score calculation (0-100)
    let trustScore = 50;
    trustScore += Math.min(ageDays * 0.5, 20); // Up to +20 for age
    trustScore += entry.successfulLogins * 0.5; // +0.5 per successful login
    trustScore += entry.successfulBookings * 1; // +1 per successful booking
    trustScore -= entry.failedLogins * 2; // -2 per failed login
    trustScore -= entry.spoofingAttempts * 15; // -15 per spoofing attempt
    trustScore -= entry.anomalyCount * 3; // -3 per anomaly
    trustScore -= entry.blockedCount * 10; // -10 per block
    trustScore -= entry.geoAnomalies * 5; // -5 per geo anomaly
    trustScore = Math.max(0, Math.min(100, trustScore));
    
    return {
        known: true,
        firstSeen: entry.firstSeen,
        lastSeen: entry.lastSeen,
        trustScore: Math.round(trustScore),
        flags,
        stats: {
            successfulLogins: entry.successfulLogins,
            failedLogins: entry.failedLogins,
            successfulBookings: entry.successfulBookings,
            spoofingAttempts: entry.spoofingAttempts,
            anomalyCount: entry.anomalyCount,
            geoAnomalies: entry.geoAnomalies,
            accountCreations: entry.accountCreations,
            sessionHijackAttempts: entry.sessionHijackAttempts,
            blockedCount: entry.blockedCount
        }
    };
}

export function updateDeviceReputation(deviceHash, eventType, metadata = {}) {
    initStores();
    if (!deviceHash) return;
    
    const now = Date.now();
    let entry = deviceReputation.get(deviceHash);
    
    if (!entry) {
        entry = {
            deviceHash,
            firstSeen: now,
            lastSeen: now,
            successfulLogins: 0,
            failedLogins: 0,
            successfulBookings: 0,
            spoofingAttempts: 0,
            anomalyCount: 0,
            geoAnomalies: 0,
            accountCreations: 0,
            sessionHijackAttempts: 0,
            blockedCount: 0,
            knownIps: new Set(),
            knownLocations: new Set(),
            userAgents: new Set()
        };
    }
    
    entry.lastSeen = now;
    
    switch (eventType) {
        case 'LOGIN_SUCCESS':
            entry.successfulLogins++;
            if (metadata.ip) entry.knownIps.add(metadata.ip);
            if (metadata.location) entry.knownLocations.add(JSON.stringify(metadata.location));
            if (metadata.userAgent) entry.userAgents.add(metadata.userAgent);
            break;
        case 'LOGIN_FAILED':
            entry.failedLogins++;
            break;
        case 'BOOKING_SUCCESS':
            entry.successfulBookings++;
            break;
        case 'SPOOFING_DETECTED':
            entry.spoofingAttempts++;
            break;
        case 'ANOMALY_DETECTED':
            entry.anomalyCount++;
            break;
        case 'GEO_ANOMALY':
            entry.geoAnomalies++;
            break;
        case 'ACCOUNT_CREATED':
            entry.accountCreations++;
            break;
        case 'SESSION_HIJACK_ATTEMPT':
            entry.sessionHijackAttempts++;
            break;
        case 'BLOCKED':
            entry.blockedCount++;
            break;
        case 'IP_SEEN':
            if (metadata.ip) entry.knownIps.add(metadata.ip);
            break;
        case 'LOCATION_SEEN':
            if (metadata.location) entry.knownLocations.add(JSON.stringify(metadata.location));
            break
    }
    
    // Convert Sets to Arrays for JSON serialization
    const serializable = {
        ...entry,
        knownIps: Array.from(entry.knownIps),
        knownLocations: Array.from(entry.knownLocations),
        userAgents: Array.from(entry.userAgents)
    };
    
    deviceReputation.set(deviceHash, serializable);
    persistDevices();
}

// ─────────────────────────────────────────────────────────────────
// ACCOUNT CREATION TRACKING (Prevent same device multi-account)
// ─────────────────────────────────────────────────────────────────

export function trackAccountCreation(deviceHash, ip, accountId, metadata = {}) {
    initStores();
    const key = `device:${deviceHash}:ip:${ip}`;
    const now = Date.now();
    
    let entry = accountCreationTracking.get(key);
    if (!entry) {
        entry = {
            key,
            deviceHash,
            ip,
            accounts: [],
            firstCreation: now,
            lastCreation: now,
            totalCreations: 0
        };
    }
    
    entry.accounts.push({
        accountId,
        createdAt: now,
        metadata: {
            userAgent: metadata.userAgent,
            browser: metadata.browser,
            os: metadata.os,
            deviceType: metadata.deviceType,
            referrer: metadata.referrer
        }
    });
    entry.lastCreation = now;
    entry.totalCreations++;
    
    accountCreationTracking.set(key, entry);
    persistAccounts();
    
    // Also update device reputation
    updateDeviceReputation(deviceHash, 'ACCOUNT_CREATED', { ip, ...metadata });
    
    return {
        totalCreations: entry.totalCreations,
        recentCreations: entry.accounts.filter(a => now - a.createdAt < 24 * 60 * 60 * 1000).length,
        flagged: entry.totalCreations > 3 || entry.accounts.filter(a => now - a.createdAt < 3600000).length > 2
    };
}

export function getAccountCreationRisk(deviceHash, ip) {
    initStores();
    const key = `device:${deviceHash}:ip:${ip}`;
    const entry = accountCreationTracking.get(key);
    if (!entry) return { risk: 'LOW', creations: 0, flagged: false };
    
    const now = Date.now();
    const recent1h = entry.accounts.filter(a => now - a.createdAt < 3600000).length;
    const recent24h = entry.accounts.filter(a => now - a.createdAt < 86400000).length;
    
    if (entry.totalCreations > 5 || recent1h > 2 || recent24h > 5) {
        return { risk: 'HIGH', creations: entry.totalCreations, recent1h, recent24h, flagged: true };
    }
    if (entry.totalCreations > 3 || recent1h > 1 || recent24h > 3) {
        return { risk: 'MEDIUM', creations: entry.totalCreations, recent1h, recent24h, flagged: true };
    }
    return { risk: 'LOW', creations: entry.totalCreations, recent1h, recent24h, flagged: false };
}

// ─────────────────────────────────────────────────────────────────
// SESSION BINDING & HIJACK DETECTION
// ─────────────────────────────────────────────────────────────────

export function bindSessionToDevice(sessionId, deviceHash, ip, metadata = {}) {
    initStores();
    const binding = {
        sessionId,
        deviceHash,
        ip: ip.split(',')[0]?.trim(),
        createdAt: Date.now(),
        lastActivity: Date.now(),
        metadata: {
            userAgent: metadata.userAgent,
            browser: metadata.browser,
            browserVersion: metadata.browserVersion,
            os: metadata.os,
            osVersion: metadata.osVersion,
            deviceType: metadata.deviceType,
            location: metadata.location
        },
        anomalies: 0,
        hijackAttempts: 0
    };
    
    sessionBindings.set(sessionId, binding);
    persistSessions();
    return binding;
}

export function validateSessionBinding(sessionId, deviceHash, ip, metadata = {}) {
    initStores();
    const binding = sessionBindings.get(sessionId);
    
    if (!binding) {
        return { valid: false, reason: 'SESSION_NOT_FOUND', risk: 'HIGH' };
    }
    
    const now = Date.now();
    binding.lastActivity = now;
    
    const anomalies = [];
    let riskIncrease = 0;
    
    // Device fingerprint mismatch
    if (binding.deviceHash !== deviceHash) {
        anomalies.push('DEVICE_FINGERPRINT_MISMATCH');
        riskIncrease += 40;
        binding.hijackAttempts++;
        updateDeviceReputation(binding.deviceHash, 'SESSION_HIJACK_ATTEMPT', { ip, sessionId });
    }
    
    // IP mismatch (allow /24 CIDR drift for mobile)
    const boundIp = binding.ip;
    const currentIp = ip.split(',')[0]?.trim();
    if (!cidrMatch(boundIp, currentIp, 24)) {
        anomalies.push('IP_MISMATCH');
        riskIncrease += 25;
    }
    
    // User agent mismatch
    if (metadata.userAgent && binding.metadata.userAgent !== metadata.userAgent) {
        anomalies.push('USER_AGENT_MISMATCH');
        riskIncrease += 15;
    }
    
    // Browser/OS version mismatch
    if (metadata.browser && binding.metadata.browser !== metadata.browser) {
        anomalies.push('BROWSER_MISMATCH');
        riskIncrease += 10;
    }
    if (metadata.os && binding.metadata.os !== metadata.os) {
        anomalies.push('OS_MISMATCH');
        riskIncrease += 10;
    }
    
    // Geo-location anomaly (if location available)
    if (metadata.location && binding.metadata.location) {
        const distance = calculateDistance(binding.metadata.location, metadata.location);
        if (distance > 500) { // 500km in short time = impossible travel
            anomalies.push('IMPOSSIBLE_TRAVEL');
            riskIncrease += 50;
            updateDeviceReputation(binding.deviceHash, 'GEO_ANOMALY', { ip });
        }
    }
    
    binding.anomalies += anomalies.length;
    
    const risk = riskIncrease >= 50 ? 'HIGH' : riskIncrease >= 20 ? 'MEDIUM' : 'LOW';
    
    return {
        valid: risk !== 'HIGH',
        risk,
        anomalies,
        riskScore: Math.min(riskIncrease, 100),
        binding: {
            sessionId: binding.sessionId,
            deviceHash: binding.deviceHash,
            createdAt: binding.createdAt,
            anomalyCount: binding.anomalies
        }
    };
}

export function unbindSession(sessionId) {
    initStores();
    sessionBindings.delete(sessionId);
    persistSessions();
}

// ─────────────────────────────────────────────────────────────────
// SPOOFING DETECTION
// ─────────────────────────────────────────────────────────────────

export function detectSpoofing(request, deviceHash, deviceProfile) {
    const signals = [];
    let score = 0;
    
    if (!deviceProfile) {
        signals.push('NO_DEVICE_PROFILE');
        score += 20;
    }
    
    // Browser fingerprint consistency checks
    const ua = request.headers.get('user-agent') || '';
    const secChUa = request.headers.get('sec-ch-ua') || '';
    const secChUaPlatform = request.headers.get('sec-ch-ua-platform') || '';
    const secChUaMobile = request.headers.get('sec-ch-ua-mobile') || '';
    
    // Check sec-ch-ua consistency with User-Agent
    if (secChUa) {
        const uaBrowser = parseUserAgent(ua).browser.toLowerCase();
        const chUaBrands = secChUa.toLowerCase();
        const browserMatches = ['chrome', 'edge', 'firefox', 'safari', 'opera', 'brave', 'vivaldi'].some(b => 
            uaBrowser.includes(b) && chUaBrands.includes(b)
        );
        if (!browserMatches) {
            signals.push('SEC_CH_UA_MISMATCH');
            score += 15;
        }
    }
    
    // Platform consistency
    if (secChUaPlatform) {
        const uaOs = parseUserAgent(ua).os.toLowerCase();
        const platformOs = secChUaPlatform.replace(/"/g, '').toLowerCase();
        const osMatches = (uaOs.includes('windows') && platformOs.includes('windows')) ||
                         (uaOs.includes('mac') && platformOs.includes('mac')) ||
                         (uaOs.includes('linux') && platformOs.includes('linux')) ||
                         (uaOs.includes('android') && platformOs.includes('android'));
        if (!osMatches) {
            signals.push('PLATFORM_MISMATCH');
            score += 10;
        }
    }
    
    // Mobile flag consistency
    const uaIsMobile = /mobile|android|iphone/i.test(ua);
    const chIsMobile = secChUaMobile === '?1';
    if (uaIsMobile !== chIsMobile) {
        signals.push('MOBILE_FLAG_MISMATCH');
        score += 10;
    }
    
    // Canvas/WebGL entropy check (too perfect = synthetic)
    if (deviceProfile?.canvas && deviceProfile.canvas.length < 50) {
        signals.push('CANVAS_ENTROPY_LOW');
        score += 10;
    }
    
    // WebGL renderer consistency
    if (deviceProfile?.webglRenderer && deviceProfile.webglVendor) {
        const renderer = deviceProfile.webglRenderer.toLowerCase();
        const vendor = deviceProfile.webglVendor.toLowerCase();
        // Mismatch between vendor and renderer (e.g., NVIDIA renderer with Intel vendor)
        const suspicious = (renderer.includes('nvidia') && vendor.includes('intel')) ||
                          (renderer.includes('amd') && vendor.includes('intel')) ||
                          (renderer.includes('intel') && vendor.includes('nvidia'));
        if (suspicious) {
            signals.push('WEBGL_VENDOR_RENDERER_MISMATCH');
            score += 15;
        }
    }
    
    // Screen resolution consistency
    const screenWidth = screen?.width || 0;
    const screenHeight = screen?.height || 0;
    if (deviceProfile?.screen) {
        const [w, h] = deviceProfile.screen.split('x').map(Number);
        if (Math.abs(w - screenWidth) > 10 || Math.abs(h - screenHeight) > 10) {
            signals.push('SCREEN_RESOLUTION_MISMATCH');
            score += 5;
        }
    }
    
    // Timezone consistency
    const tzOffset = new Date().getTimezoneOffset();
    if (deviceProfile?.tzOffset !== undefined && deviceProfile.tzOffset !== tzOffset) {
        signals.push('TIMEZONE_MISMATCH');
        score += 5;
    }
    
    // Language consistency
    if (deviceProfile?.language && deviceProfile.language !== navigator.language) {
        signals.push('LANGUAGE_MISMATCH');
        score += 5;
    }
    
    // Headless browser detection
    if (deviceProfile?.isHeadless || deviceProfile?.isBot) {
        signals.push('HEADLESS_DETECTED');
        score += 30;
    }
    
    // Automation markers in UA
    const automationMarkers = ['headless', 'phantomjs', 'puppeteer', 'playwright', 'selenium', 'webdriver'];
    if (automationMarkers.some(m => ua.toLowerCase().includes(m))) {
        signals.push('AUTOMATION_MARKER_IN_UA');
        score += 25;
    }
    
    // Missing expected headers for claimed browser
    const browser = parseUserAgent(ua).browser.toLowerCase();
    if ((browser === 'chrome' || browser === 'edge') && !secChUa) {
        signals.push('MISSING_SEC_CH_UA_FOR_CHROMIUM');
        score += 10;
    }
    
    return {
        spoofed: score >= 30,
        score: Math.min(score, 100),
        signals,
        riskLevel: score >= 50 ? 'HIGH' : score >= 20 ? 'MEDIUM' : 'LOW'
    };
}

// ─────────────────────────────────────────────────────────────────
// RISK SCORING ENGINE (Main Entry Point)
// ─────────────────────────────────────────────────────────────────

export function computeRiskScore({
    request,
    deviceHash,
    deviceProfile,
    endpoint,
    authState,
    sessionId,
    ip,
    metadata = {}
}) {
    initStores();
    
    const signals = {};
    let score = 0;
    
    // ═══ STAGE 1: STATIC SIGNALS (0-30) ═══
    // IP Reputation
    const ipReputation = checkIPReputation(ip);
    signals.ipReputation = ipReputation.score;
    score += ipReputation.score;
    
    // Device Reputation
    const deviceRep = getDeviceReputation(deviceHash);
    signals.deviceReputation = deviceRep.trustScore;
    score += (100 - deviceRep.trustScore) * 0.3; // Invert: low trust = high risk
    
    // TLS Fingerprint (JA3)
    const tlsFp = analyzeTLS(request);
    signals.tlsFingerprint = tlsFp.score;
    score += tlsFp.score;
    
    // Header Consistency
    const headerConsistency = checkHeaderConsistency(request);
    signals.headerConsistency = headerConsistency.score;
    score += headerConsistency.score;
    
    // Spoofing Detection
    const spoofing = detectSpoofing(request, deviceHash, deviceProfile);
    signals.spoofing = spoofing.score;
    score += spoofing.score * 0.5;
    
    // ═══ STAGE 2: BEHAVIORAL SIGNALS (0-40) ═══
    // Request Rate
    const rateSignal = getRequestRate(ip, deviceHash);
    signals.requestRate = rateSignal.score;
    score += rateSignal.score;
    
    // Endpoint Diversity
    const diversity = getEndpointDiversity(ip, deviceHash);
    signals.endpointDiversity = diversity.score;
    score += diversity.score;
    
    // Error Rate
    const errorRate = getErrorRate(ip, deviceHash);
    signals.errorRate = errorRate.score;
    score += errorRate.score;
    
    // Session Depth
    const sessionDepth = getSessionDepth(ip, deviceHash, sessionId);
    signals.sessionDepth = sessionDepth.score;
    score += sessionDepth.score;
    
    // Navigation Pattern
    const navPattern = analyzeNavigationPattern(request, sessionId);
    signals.navigationPattern = navPattern.score;
    score += navPattern.score;
    
    // Mouse/Keyboard Entropy (from metadata)
    const entropy = metadata.entropy || 0;
    signals.entropy = Math.max(0, 20 - entropy * 20); // Low entropy = high risk
    score += signals.entropy;
    
    // ═══ STAGE 3: CONTEXTUAL SIGNALS (0-30) ═══
    // Endpoint Sensitivity
    const sensitivity = getEndpointSensitivity(endpoint);
    signals.endpointSensitivity = sensitivity;
    score += sensitivity;
    
    // Auth State Risk
    const authRisk = getAuthStateRisk(authState);
    signals.authState = authRisk;
    score += authRisk;
    
    // Geo Velocity / Impossible Travel
    const geoAnomaly = checkGeoVelocity(ip, deviceHash, metadata.location);
    signals.geoAnomaly = geoAnomaly.score;
    score += geoAnomaly.score;
    
    // Account Creation Risk
    const accountRisk = getAccountCreationRisk(deviceHash, ip);
    signals.accountCreationRisk = accountRisk.risk === 'HIGH' ? 20 : accountRisk.risk === 'MEDIUM' ? 10 : 0;
    score += signals.accountCreationRisk;
    
    // Time-based anomaly
    const timeAnomaly = checkTimeAnomaly(request);
    signals.timeAnomaly = timeAnomaly;
    score += timeAnomaly;
    
    // Threat Intel
    const threatIntel = checkThreatIntel(ip);
    signals.threatIntel = threatIntel;
    score += threatIntel;
    
    // ═══ FINAL SCORING ═══
    const finalScore = Math.min(Math.round(score), 100);
    
    let tier, action;
    if (finalScore <= 25) { tier = 'LOW'; action = 'ALLOW'; }
    else if (finalScore <= 50) { tier = 'MEDIUM'; action = 'CHALLENGE'; }
    else if (finalScore <= 75) { tier = 'HIGH'; action = 'STRICT_CHALLENGE'; }
    else { tier = 'CRITICAL'; action = 'BLOCK'; }
    
    // Record security event for tracking
    if (finalScore > 40) {
        recordSecurityEvent({
            eventType: 'RISK_EVALUATION',
            action: `RISK_${tier}`,
            request,
            fingerprint: deviceHash,
            details: `Risk score: ${finalScore}, Tier: ${tier}, Signals: ${Object.keys(signals).length}`
        });
    }
    
    return {
        score: finalScore,
        tier,
        action,
        signals,
        deviceReputation: deviceRep,
        spoofing,
        accountRisk,
        recommendations: generateRecommendations(finalScore, signals, tier)
    };
}

// ═══ HELPER FUNCTIONS ═══

function checkIPReputation(ip) {
    // In production, integrate with AbuseIPDB, Spamhaus, etc.
    // For now: basic checks
    let score = 0;
    const signals = [];
    
    // Private/local IPs
    if (!ip || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.16.')) {
        return { score: 0, signals: ['PRIVATE_IP'] };
    }
    
    // VPN/Proxy detection (placeholder - integrate with IPQualityScore, etc.)
    // if (await isVPN(ip)) { score += 15; signals.push('VPN_DETECTED'); }
    
    // Tor exit node (placeholder)
    // if (await isTorExitNode(ip)) { score += 25; signals.push('TOR_EXIT_NODE'); }
    
    // Data center IP (AWS, GCP, Azure, DigitalOcean ranges)
    // if (isDataCenterIP(ip)) { score += 10; signals.push('DATA_CENTER_IP'); }
    
    return { score: Math.min(score, 20), signals };
}

function analyzeTLS(request) {
    // JA3/JA3S fingerprinting would go here
    // For now: basic TLS version check
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const score = proto === 'https' ? 0 : 10;
    return { score, protocol: proto };
}

function checkHeaderConsistency(request) {
    let score = 0;
    const signals = [];
    const ua = request.headers.get('user-agent') || '';
    const accept = request.headers.get('accept') || '';
    const acceptLang = request.headers.get('accept-language') || '';
    const acceptEnc = request.headers.get('accept-encoding') || '';
    const referer = request.headers.get('referer') || '';
    const origin = request.headers.get('origin') || '';
    
    // Browser should send Accept with text/html
    if (accept && !accept.includes('text/html') && !accept.includes('*/*')) {
        score += 5; signals.push('ACCEPT_NO_HTML');
    }
    
    // POST requests should have referer/origin
    if (request.method === 'POST' && !referer && !origin) {
        score += 5; signals.push('NO_REFERER_ORIGIN_ON_POST');
    }
    
    // Accept-Language should be present for browsers
    if (!acceptLang) {
        score += 5; signals.push('NO_ACCEPT_LANGUAGE');
    }
    
    // Accept-Encoding should be present
    if (!acceptEnc) {
        score += 3; signals.push('NO_ACCEPT_ENCODING');
    }
    
    return { score: Math.min(score, 20), signals };
}

function getRequestRate(ip, deviceHash) {
    // In production: query Redis for sliding window counts
    // For now: return placeholder
    return { score: 0, signals: ['RATE_LIMIT_OK'] };
}

function getEndpointDiversity(ip, deviceHash) {
    // Track unique endpoints accessed in time window
    return { score: 0, signals: ['DIVERSITY_NORMAL'] };
}

function getErrorRate(ip, deviceHash) {
    // Track 4xx/5xx ratio
    return { score: 0, signals: ['ERROR_RATE_LOW'] };
}

function getSessionDepth(ip, deviceHash, sessionId) {
    // Track session duration, pages visited
    return { score: 0, signals: ['SESSION_DEPTH_OK'] };
}

function analyzeNavigationPattern(request, sessionId) {
    // Analyze referer chain, timing, mouse movements (from metadata)
    return { score: 0, signals: ['NAVIGATION_HUMAN_LIKE'] };
}

function getEndpointSensitivity(endpoint) {
    const sensitive = ['/api/bookings', '/api/payments', '/api/admin', '/api/marshal/checkin', '/api/auth'];
    const moderate = ['/api/marshal', '/api/contact', '/api/inquiries', '/api/discounts'];
    
    if (sensitive.some(e => endpoint.startsWith(e))) return 15;
    if (moderate.some(e => endpoint.startsWith(e))) return 8;
    return 2;
}

function getAuthStateRisk(authState) {
    if (!authState) return 10; // Unauthenticated
    if (authState.role === 'admin_coordinator' || authState.isMasterAdmin) return 5; // High value target
    if (authState.role === 'basecamp_host') return 8;
    if (authState.role === 'camp_marshal') return 8;
    return 10;
}

function checkGeoVelocity(ip, deviceHash, location) {
    // Check if same device/IP appears in distant locations within impossible time
    // Implementation would query recent locations from device reputation
    return { score: 0, signals: ['GEO_OK'] };
}

function checkTimeAnomaly(request) {
    // Requests at unusual hours, or too fast (sub-human timing)
    const hour = new Date().getHours();
    let score = 0;
    if (hour >= 2 && hour <= 5) score += 3; // 2-5 AM
    return score;
}

function checkThreatIntel(ip) {
    // Integrate with AbuseIPDB, Spamhaus, AlienVault OTX, etc.
    return 0;
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

function calculateDistance(loc1, loc2) {
    // Haversine formula
    if (!loc1?.lat || !loc1?.lng || !loc2?.lat || !loc2?.lng) return 0;
    const R = 6371; // km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.lat * Math.PI/180) * Math.cos(loc2.lat * Math.PI/180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function generateRecommendations(score, signals, tier) {
    const recs = [];
    if (tier === 'CRITICAL' || tier === 'HIGH') {
        recs.push('Require step-up authentication (OTP/TOTP)');
        recs.push('Log all actions for audit');
        recs.push('Alert security team');
        if (signals.spoofing > 30) recs.push('Investigate device spoofing');
        if (signals.accountCreationRisk) recs.push('Review account creation patterns');
    } else if (tier === 'MEDIUM') {
        recs.push('Require Turnstile/hCaptcha challenge');
        recs.push('Log for review');
    } else if (tier === 'STRICT_CHALLENGE') {
        recs.push('Require Turnstile/hCaptcha + rate limit');
        recs.push('Monitor session closely');
    }
    return recs;
}

// ─────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────

export function evaluateRequestRisk(request, options = {}) {
    const deviceHash = options.deviceHash || hashFingerprint(request.headers.get('x-device-fingerprint'));
    const ip = options.ip || getClientIp(request);
    const deviceProfile = options.deviceProfile;
    const endpoint = options.endpoint || request.url;
    const authState = options.authState;
    const sessionId = options.sessionId;
    const metadata = options.metadata || {};
    
    return computeRiskScore({
        request,
        deviceHash,
        deviceProfile,
        endpoint,
        authState,
        sessionId,
        ip,
        metadata
    });
}

export function getDeviceRiskProfile(deviceHash) {
    return getDeviceReputation(deviceHash);
}

export function getSessionRisk(sessionId, deviceHash, ip, metadata) {
    return validateSessionBinding(sessionId, deviceHash, ip, metadata);
}

export function createSessionBinding(sessionId, deviceHash, ip, metadata) {
    return bindSessionToDevice(sessionId, deviceHash, ip, metadata);
}

export function destroySessionBinding(sessionId) {
    return unbindSession(sessionId);
}

export function recordAccountCreation(deviceHash, ip, accountId, metadata) {
    return trackAccountCreation(deviceHash, ip, accountId, metadata);
}

export function checkAccountCreationRisk(deviceHash, ip) {
    return getAccountCreationRisk(deviceHash, ip);
}

// Path import for file operations
import fs from 'fs';
import path from 'path';