import dns from 'dns/promises';
import { validateEmailClient } from './emailValidatorCore.js';

export { validateEmailClient };

const mxCache = new Map();
const MX_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function verifyEmailServer(email) {
    const clientResult = validateEmailClient(email);
    if (!clientResult.isValid) {
        return clientResult;
    }

    const domain = clientResult.domain;
    const now = Date.now();

    if (mxCache.has(domain)) {
        const cached = mxCache.get(domain);
        if (now - cached.timestamp < MX_CACHE_TTL_MS) {
            return cached.result;
        }
        mxCache.delete(domain);
    }

    try {
        const mxLookupPromise = dns.resolveMx(domain);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('DNS_TIMEOUT')), 2500)
        );

        const records = await Promise.race([mxLookupPromise, timeoutPromise]);

        if (!records || records.length === 0) {
            const result = {
                isValid: false,
                message: `The domain @${domain} does not have active mail servers to receive your booking pass.`
            };
            mxCache.set(domain, { result, timestamp: now });
            return result;
        }

        const result = { isValid: true, sanitized: clientResult.sanitized, domain };
        mxCache.set(domain, { result, timestamp: now });
        return result;

    } catch (err) {
        if (err.code === 'ENOTFOUND' || err.code === 'ENODATA' || err.code === 'ESERVFAIL') {
            const result = {
                isValid: false,
                message: `The domain @${domain} does not exist or has no active mail server.`
            };
            mxCache.set(domain, { result, timestamp: now });
            return result;
        }

        return { isValid: true, sanitized: clientResult.sanitized, domain, note: 'DNS fallback' };
    }
}
