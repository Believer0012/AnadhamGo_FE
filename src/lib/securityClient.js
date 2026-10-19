// Client-side enhanced device fingerprinting with browser/OS version detection
// Produces detailed device profile for risk evaluation + irreversible hash for tracking

let cachedFingerprint = null;
let fingerprintPromise = null;
let cachedDetailedProfile = null;

function stableStringify(value) {
    try { return JSON.stringify(value); } catch (e) { return String(value); }
}

async function hashString(input) {
    try {
        if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
            const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
            return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 64);
        }
    } catch (e) { /* fall through */ }
    // Non-crypto fallback: FNV-1a 64-bit
    let h1 = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
        h1 ^= input.charCodeAt(i);
        h1 = Math.imul(h1, 0x01000193) >>> 0;
    }
    return h1.toString(16).padStart(16, '0');
}

function parseUserAgent(ua) {
    const result = {
        browser: 'Unknown',
        browserVersion: 'Unknown',
        os: 'Unknown',
        osVersion: 'Unknown',
        deviceType: 'Desktop',
        engine: 'Unknown',
        isBot: false,
        isHeadless: false
    };
    
    if (!ua) return result;
    
    const ual = ua.toLowerCase();
    
    // Bot detection
    const botMarkers = ['bot', 'crawler', 'spider', 'scraper', 'headless', 'phantomjs', 'puppeteer', 'playwright', 'selenium', 'curl', 'wget', 'python-requests', 'go-http-client', 'axios', 'okhttp', 'scrapy', 'httpclient', 'java/', 'libwww', 'postmanruntime'];
    result.isBot = botMarkers.some(m => ual.includes(m));
    result.isHeadless = ual.includes('headless') || ual.includes('phantomjs') || ual.includes('puppeteer') || ual.includes('playwright');
    
    // Browser detection with version
    const browserPatterns = [
        { name: 'Edge', regex: /edg\/(\d+\.\d+)/i },
        { name: 'Chrome', regex: /chrome\/(\d+\.\d+)/i },
        { name: 'Firefox', regex: /firefox\/(\d+\.\d+)/i },
        { name: 'Safari', regex: /version\/(\d+\.\d+).*safari/i },
        { name: 'Opera', regex: /opr\/(\d+\.\d+)/i },
        { name: 'Vivaldi', regex: /vivaldi\/(\d+\.\d+)/i },
        { name: 'Brave', regex: /brave\/(\d+\.\d+)/i },
        { name: 'Samsung Internet', regex: /samsungbrowser\/(\d+\.\d+)/i },
    ];
    
    for (const b of browserPatterns) {
        const match = ua.match(b.regex);
        if (match) {
            result.browser = b.name;
            result.browserVersion = match[1];
            break;
        }
    }
    
    // OS detection with version
    const osPatterns = [
        { name: 'Windows', regex: /windows nt (\d+\.\d+)/i, versionMap: { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7', '6.0': 'Vista', '5.1': 'XP' } },
        { name: 'macOS', regex: /mac os x (\d+[._]\d+)/i, versionMap: {} },
        { name: 'iOS', regex: /os (\d+[._]\d+)[._]\d+ like mac os x/i, versionMap: {} },
        { name: 'Android', regex: /android (\d+\.\d+)/i, versionMap: {} },
        { name: 'Linux', regex: /linux/i, versionMap: {} },
        { name: 'Chrome OS', regex: /cros/i, versionMap: {} },
    ];
    
    for (const o of osPatterns) {
        const match = ua.match(o.regex);
        if (match) {
            result.os = o.name;
            const rawVer = match[1]?.replace('_', '.') || 'Unknown';
            result.osVersion = o.versionMap[rawVer] || rawVer;
            break;
        }
    }
    
    // Device type
    if (/mobile|android|iphone|ipod/i.test(ual)) result.deviceType = 'Mobile';
    else if (/ipad|tablet/i.test(ual)) result.deviceType = 'Tablet';
    else if (/tv/i.test(ual)) result.deviceType = 'TV';
    
    // Engine
    if (ual.includes('applewebkit')) result.engine = 'WebKit';
    else if (ual.includes('gecko')) result.engine = 'Gecko';
    else if (ual.includes('trident') || ual.includes('edgehtml')) result.engine = 'Trident/EdgeHTML';
    
    return result;
}

function collectFingerprintSignals() {
    const signals = {};
    
    try {
        const nav = window.navigator || {};
        signals.userAgent = nav.userAgent || '';
        signals.platform = nav.platform || '';
        signals.language = nav.language || '';
        signals.languages = Array.isArray(nav.languages) ? nav.languages.join(',') : '';
        signals.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        signals.tzOffset = new Date().getTimezoneOffset();
        signals.screen = `${screen.width}x${screen.height}x${screen.colorDepth || 24}`;
        signals.deviceMemory = nav.deviceMemory || 0;
        signals.cores = nav.hardwareConcurrency || 0;
        signals.touch = Boolean(navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
        signals.maxTouchPoints = navigator.maxTouchPoints || 0;
        signals.pdf = Boolean(nav.pdfViewerEnabled);
        signals.cookieEnabled = nav.cookieEnabled;
        signals.doNotTrack = nav.doNotTrack || '';
        signals.hardwareConcurrency = nav.hardwareConcurrency || 0;
        
        // Connection info
        if (nav.connection) {
            signals.connectionType = nav.connection.effectiveType || '';
            signals.downlink = nav.connection.downlink || 0;
            signals.rtt = nav.connection.rtt || 0;
            signals.saveData = nav.connection.saveData || false;
        }
        
        // Permissions (limited)
        signals.permissions = {};
        ['geolocation', 'notifications', 'camera', 'microphone'].forEach(p => {
            try {
                nav.permissions?.query({ name: p }).then(r => { signals.permissions[p] = r.state; }).catch(() => {});
            } catch {}
        });
    } catch (e) { /* ignore */ }
    
    // Parse UA for browser/OS versions
    const uaParsed = parseUserAgent(signals.userAgent);
    signals.browser = uaParsed.browser;
    signals.browserVersion = uaParsed.browserVersion;
    signals.os = uaParsed.os;
    signals.osVersion = uaParsed.osVersion;
    signals.deviceType = uaParsed.deviceType;
    signals.engine = uaParsed.engine;
    signals.isBot = uaParsed.isBot;
    signals.isHeadless = uaParsed.isHeadless;
    
    // Canvas fingerprint (stable render hash)
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 60;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(20, 20, 60, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('aanandham.go', 4, 24);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('wilderness', 90, 36);
            // Add entropy from canvas fingerprinting
            const gradient = ctx.createLinearGradient(0, 0, 240, 60);
            gradient.addColorStop(0, 'rgba(255, 0, 0, 0.1)');
            gradient.addColorStop(1, 'rgba(0, 255, 0, 0.1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(100, 10, 80, 30);
            signals.canvas = canvas.toDataURL().slice(-200);
        }
    } catch (e) { /* ignore */ }
    
    // WebGL renderer fingerprint
    try {
        const gl = document.createElement('canvas').getContext('webgl');
        if (gl) {
            const ext = gl.getExtension('WEBGL_debug_renderer_info');
            signals.webglRenderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '') : String(gl.getParameter(gl.RENDERER) || '');
            signals.webglVendor = ext ? String(gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || '') : String(gl.getParameter(gl.VENDOR) || '');
            signals.webglVersion = String(gl.getParameter(gl.VERSION) || '');
            signals.webglShadingLanguage = String(gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || '');
        }
    } catch (e) { /* ignore */ }
    
    // Font fingerprint
    try {
        const testFonts = ['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana', 'Trebuchet MS', 'Helvetica', 'Calibri'];
        const base = document.createElement('span');
        base.style.font = '72px Arial';
        base.textContent = 'mmmmmmmmmmlli';
        base.style.position = 'absolute';
        base.style.left = '-9999px';
        document.body.appendChild(base);
        const baseWidth = base.offsetWidth;
        signals.fonts = {};
        testFonts.forEach(font => {
            const probe = document.createElement('span');
            probe.style.font = `72px ${font}`;
            probe.textContent = 'mmmmmmmmmmlli';
            probe.style.position = 'absolute';
            probe.style.left = '-9999px';
            document.body.appendChild(probe);
            signals.fonts[font] = probe.offsetWidth !== baseWidth;
            document.body.removeChild(probe);
        });
        document.body.removeChild(base);
    } catch (e) { /* ignore */ }
    
    // Audio fingerprint (subtle)
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const analyser = audioCtx.createAnalyser();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'triangle';
        oscillator.frequency.value = 10000;
        gainNode.gain.value = 0;
        oscillator.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start(0);
        const buffer = new Float32Array(128);
        analyser.getFloatTimeDomainData(buffer);
        oscillator.stop(0);
        audioCtx.close();
        signals.audio = Array.from(buffer).slice(0, 32).map(x => Math.round(x * 1000)).join(',');
    } catch (e) { /* ignore */ }
    
    // Battery API (if available)
    try {
        if (navigator.getBattery) {
            navigator.getBattery().then(battery => {
                signals.battery = {
                    level: battery.level,
                    charging: battery.charging,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime
                };
            }).catch(() => {});
        }
    } catch (e) { /* ignore */ }
    
    // Media devices count
    try {
        navigator.mediaDevices?.enumerateDevices().then(devices => {
            signals.mediaDevices = {
                audioInput: devices.filter(d => d.kind === 'audioinput').length,
                videoInput: devices.filter(d => d.kind === 'videoinput').length,
                audioOutput: devices.filter(d => d.kind === 'audiooutput').length
            };
        }).catch(() => {});
    } catch (e) { /* ignore */ }
    
    return signals;
}

export async function getDeviceFingerprint() {
    if (cachedFingerprint) return cachedFingerprint;
    if (fingerprintPromise) return fingerprintPromise;
    
    fingerprintPromise = (async () => {
        try {
            if (typeof window === 'undefined') return '';
            const stored = localStorage.getItem('aanandham_device_fp');
            if (stored && stored.length >= 32) {
                cachedFingerprint = stored;
                return stored;
            }
            const raw = stableStringify(collectFingerprintSignals());
            const hash = await hashString(raw);
            if (hash && hash.length >= 32) {
                try { localStorage.setItem('aanandham_device_fp', hash); } catch (e) { /* ignore */ }
                cachedFingerprint = hash;
                return hash;
            }
            return '';
        } catch (e) {
            return '';
        }
    })();
    
    return fingerprintPromise;
}

export async function getDetailedDeviceProfile() {
    if (cachedDetailedProfile) return cachedDetailedProfile;
    try {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem('aanandham_device_profile');
        if (stored) {
            cachedDetailedProfile = JSON.parse(stored);
            return cachedDetailedProfile;
        }
        const profile = collectFingerprintSignals();
        try { localStorage.setItem('aanandham_device_profile', JSON.stringify(profile)); } catch (e) { /* ignore */ }
        cachedDetailedProfile = profile;
        return profile;
    } catch (e) {
        return null;
    }
}

export async function getSecurityHeaders(extra = {}) {
    const fp = await getDeviceFingerprint();
    const headers = { ...extra };
    if (fp) headers['x-device-fingerprint'] = fp;
    return headers;
}

export function clearDeviceIdentity() {
    cachedFingerprint = null;
    fingerprintPromise = null;
    cachedDetailedProfile = null;
    try {
        localStorage.removeItem('aanandham_device_fp');
        localStorage.removeItem('aanandham_device_profile');
    } catch (e) { /* ignore */ }
}