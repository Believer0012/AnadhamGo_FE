// ─────────────────────────────────────────────────────────────
// CLIENT-SAFE EMAIL VALIDATOR & HEURISTICS (Zero Node dependencies)
// ─────────────────────────────────────────────────────────────

export const DISPOSABLE_EMAIL_DOMAINS = new Set([
    'mailinator.com', 'tempmail.com', 'temp-mail.org', 'guerrillamail.com',
    'sharklasers.com', 'grr.la', 'guerrillamail.biz', 'guerrillamail.de',
    'guerrillamail.net', 'guerrillamail.org', 'yopmail.com', 'yopmail.fr',
    'yopmail.net', '10minutemail.com', '10minutemail.net', 'dispostable.com',
    'trashmail.com', 'trashmail.net', 'trashmail.org', 'fakeinbox.com',
    'throwawaymail.com', 'getairmail.com', 'mohmal.com', 'generator.email',
    'crazymailing.com', 'dropmail.me', 'maildrop.cc', 'nada.ltd',
    'getnada.com', 'inboxkitten.com', 'tempail.com', 'emailondeck.com',
    'burnerdns.com', 'mytemp.email', 'fakemailgenerator.com', 'armyspy.com',
    'cuvox.de', 'dayrep.com', 'fleckens.hu', 'gustr.com', 'jourrapide.com',
    'rhyta.com', 'superrito.com', 'teleworm.us', 'einrot.com'
]);

export const DUMMY_EMAIL_PREFIXES = new Set([
    'test', 'testing', 'fake', 'fakeemail', 'asdf', 'qwerty', 'abc',
    'admin', 'none', 'noemail', 'null', 'temp', 'dummy', 'sample', 'user', 'guest'
]);

export const DUMMY_EXACT_EMAILS = new Set([
    'test@test.com', 'test@test.in', 'test@gmail.com', 'fake@fake.com',
    'asdf@asdf.com', 'abc@xyz.com', 'user@example.com', 'admin@admin.com',
    'none@none.com', 'no@no.com', 'a@a.com', 'test@example.com',
    'dummy@dummy.com', 'qwerty@qwerty.com', 'random@random.com'
]);

export const DOMAIN_TYPO_MAP = {
    'gamil.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gmaik.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gmeil.com': 'gmail.com',
    'yaho.com': 'yahoo.com',
    'yahooo.com': 'yahoo.com',
    'yaho.co.in': 'yahoo.co.in',
    'hotmial.com': 'hotmail.com',
    'hotmaill.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outloo.com': 'outlook.com',
    'iclud.com': 'icloud.com',
    'redifmail.com': 'rediffmail.com',
    'rediff.com': 'rediffmail.com'
};

export function validateEmailClient(email) {
    if (!email || typeof email !== 'string') {
        return { isValid: false, message: 'Email address is required.' };
    }

    const trimmed = email.trim().toLowerCase();

    if (trimmed.length < 6 || trimmed.length > 254) {
        return { isValid: false, message: 'Email must be between 6 and 254 characters.' };
    }

    if (/\s/.test(trimmed)) {
        return { isValid: false, message: 'Email address cannot contain spaces.' };
    }

    if (trimmed.includes('..')) {
        return { isValid: false, message: 'Email cannot contain consecutive dots (..).' };
    }

    // Strict RFC format check
    const formatRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;
    if (!formatRegex.test(trimmed)) {
        return { isValid: false, message: 'Please enter a complete email address (e.g. name@gmail.com).' };
    }

    if (DUMMY_EXACT_EMAILS.has(trimmed)) {
        return { isValid: false, message: 'Please provide your real personal email for expedition pass issuance.' };
    }

    const [userPart, domain] = trimmed.split('@');

    if (DUMMY_EMAIL_PREFIXES.has(userPart) && domain.includes('test')) {
        return { isValid: false, message: 'Placeholder and test email addresses are not accepted.' };
    }

    if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
        return { isValid: false, message: 'Temporary / disposable emails are not accepted. Please use your genuine email.' };
    }

    if (DOMAIN_TYPO_MAP[domain]) {
        return {
            isValid: false,
            suggestion: DOMAIN_TYPO_MAP[domain],
            message: `Did you mean @${DOMAIN_TYPO_MAP[domain]}?`
        };
    }

    return { isValid: true, sanitized: trimmed, domain };
}
