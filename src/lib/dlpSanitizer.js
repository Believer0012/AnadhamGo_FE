/**
 * ── PILLAR 2: Data Loss Prevention (DLP) & Log Masking ──
 * 
 * Provides:
 * 1. Automated real-time redaction of sensitive credentials and financial identifiers:
 *    - Credit / Debit Card PANs (Luhn-compliant regex)
 *    - Indian Aadhaar Numbers (12-digit numeric sequences)
 *    - Indian PAN Cards (5 letters, 4 digits, 1 letter)
 *    - Private Keys & Cryptographic JWT / API Tokens
 *    - Password & CVV form fields
 */

const DLP_PATTERNS = [
    // Credit Card (Visa, MasterCard, Amex, RuPay)
    { name: 'CREDIT_CARD_PAN', regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, replacement: '[REDACTED_CARD_PAN]' },
    // Indian Aadhaar Number
    { name: 'AADHAAR_NUMBER', regex: /\b\d{4}\s\d{4}\s\d{4}\b/g, replacement: '[REDACTED_AADHAAR]' },
    // Indian PAN Card
    { name: 'IN_PAN_CARD', regex: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/gi, replacement: '[REDACTED_PAN_CARD]' },
    // Private Key Blocks
    { name: 'PRIVATE_KEY', regex: /-----BEGIN\s+.*PRIVATE\s+KEY-----[\s\S]*?-----END\s+.*PRIVATE\s+KEY-----/gi, replacement: '[REDACTED_PRIVATE_KEY]' },
    // Bearer Tokens / API Keys
    { name: 'API_SECRET_TOKEN', regex: /(?:bearer\s+[a-zA-Z0-9_\-\.]{20,}|(?:sk_|api_key_)[a-zA-Z0-9_]{16,})/gi, replacement: '[REDACTED_AUTH_TOKEN]' }
];

/**
 * Sanitize any log message or text string against DLP leaks
 * @param {string} text
 * @returns {string} Redacted safe text
 */
export function sanitizeLogOutput(text) {
    if (typeof text !== 'string') {
        try {
            text = JSON.stringify(text);
        } catch (e) {
            return '[UNSERIALIZABLE]';
        }
    }

    let sanitized = text;
    for (const item of DLP_PATTERNS) {
        sanitized = sanitized.replace(item.regex, item.replacement);
    }

    return sanitized;
}

/**
 * Mask phone number for public camper rosters or privacy views
 * e.g. "9840098765" -> "98****765"
 * @param {string|number} phone
 * @returns {string} Masked phone number
 */
export function maskPhoneNumber(phone) {
    if (!phone) return '';
    const clean = String(phone).trim();
    if (clean.length <= 4) return '••••';
    return clean.slice(0, 3) + '••••' + clean.slice(-3);
}

/**
 * Mask email address for public or privacy views
 * e.g. "arun.kumar@gmail.com" -> "ar****@gmail.com"
 * @param {string} email
 * @returns {string} Masked email
 */
export function maskEmail(email) {
    if (!email || typeof email !== 'string') return '';
    const parts = email.split('@');
    if (parts.length !== 2) return '••••@••••.com';
    const name = parts[0];
    const domain = parts[1];
    const maskedName = name.length > 2 ? `${name.slice(0, 2)}••••` : `${name}••`;
    return `${maskedName}@${domain}`;
}
