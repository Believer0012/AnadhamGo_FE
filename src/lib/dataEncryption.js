import crypto from 'crypto';

/**
 * ── PILLAR 6: Database & Data-At-Rest Encryption ──
 * 
 * Provides:
 * 1. AES-256-GCM authenticated envelope encryption for sensitive guest PII (Aadhaar, Passport, Phone, Emergency Contacts).
 * 2. Blind Indexing (HMAC-SHA256 with secret pepper) for instant searchability without exposing plaintext to SQL queries.
 * 3. Key rotation support with versioned ciphertext payloads (`enc:v1:iv:tag:ciphertext`).
 */

const MASTER_ENCRYPTION_KEY = process.env.PII_ENCRYPTION_KEY || process.env.ADMIN_AUTH_SECRET || 'aanandham_master_aes256_encryption_key_2026';
const BLIND_INDEX_PEPPER = process.env.BLIND_INDEX_PEPPER || 'aanandham_blind_index_pepper_2026';

// Derive 32-byte key using PBKDF2
const DERIVED_KEY = crypto.pbkdf2Sync(MASTER_ENCRYPTION_KEY, 'aanandham_pii_salt', 100000, 32, 'sha256');

/**
 * Encrypt sensitive plain text using AES-256-GCM
 * @param {string} plaintext
 * @returns {string} Versioned ciphertext string e.g. "enc:v1:<iv_hex>:<tag_hex>:<data_hex>"
 */
export function encryptPII(plaintext) {
    if (!plaintext || typeof plaintext !== 'string') return plaintext;

    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', DERIVED_KEY, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `enc:v1:${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt AES-256-GCM versioned ciphertext
 * @param {string} ciphertext
 * @returns {string} Original plaintext
 */
export function decryptPII(ciphertext) {
    if (!ciphertext || typeof ciphertext !== 'string' || !ciphertext.startsWith('enc:v1:')) {
        return ciphertext; // Return as-is if not encrypted
    }

    try {
        const parts = ciphertext.split(':');
        if (parts.length !== 5) return ciphertext;

        const [, , ivHex, tagHex, dataHex] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(tagHex, 'hex');

        const decipher = crypto.createDecipheriv('aes-256-gcm', DERIVED_KEY, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(dataHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (err) {
        console.error('[ENCRYPTION] Decryption failed for payload:', err.message);
        return '[PROTECTED PII]';
    }
}

/**
 * Generate a deterministic Blind Index hash for searching PII without plaintext exposure
 * @param {string} value - e.g. "+91 94009 87654" or "user@domain.com"
 * @returns {string} 32-character hexadecimal blind index hash
 */
export function generateBlindIndex(value) {
    if (!value) return '';
    // Normalize value (lowercase, remove spaces/dashes)
    const normalized = String(value).toLowerCase().replace(/[\s\-\(\)\+]/g, '');
    return crypto.createHmac('sha256', BLIND_INDEX_PEPPER).update(normalized).digest('hex').substring(0, 32);
}
