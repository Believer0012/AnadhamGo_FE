import { validateEmailClient } from './emailValidatorCore.js';

// Phone number sanitization: strip non-digit characters except leading +
export function sanitizePhone(raw) {
    if (!raw || typeof raw !== 'string') return '';
    return raw.replace(/[^\d+]/g, '').trim();
}

// Strict production email validator (requires valid user, @, valid domain, and >= 2 char TLD like .com, .in)
export function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const trimmed = email.trim().toLowerCase();
    if (trimmed.length < 6 || trimmed.length > 254) return false;
    if (/\s/.test(trimmed)) return false;
    if (trimmed.includes('..')) return false;
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;
    return regex.test(trimmed);
}

// Validate Booking Intent Payload
export function validateBookingPayload(body) {
    const errors = [];

    // 1. Honeypot check (Bot Trap)
    if (body.honeypot && String(body.honeypot).trim().length > 0) {
        return { isBot: true, errors: ['Bot honeypot triggered'] };
    }

    // 2. Guest Name validation
    const name = (body.name || '').trim();
    if (!name || name.length < 2 || name.length > 80) {
        errors.push('Guest name must be between 2 and 80 characters.');
    }

    // 3. Phone validation
    const rawPhone = (body.phone || '').trim();
    const phone = sanitizePhone(rawPhone);
    if (!phone || phone.replace(/\D/g, '').length < 10) {
        errors.push('Valid 10-digit mobile or WhatsApp number is required.');
    }

    // 3.5 Email validation — OPTIONAL. Validate the format only when one is supplied
    // (the WhatsApp-enquiry flow allows a booking with no email; a digital pass is
    // emailed only when an address is provided).
    const email = (body.email || '').trim().toLowerCase();
    if (email) {
        const emailCheck = validateEmailClient(email);
        if (!emailCheck.isValid) {
            errors.push(emailCheck.message || 'Please enter a valid email address, or leave it blank.');
        }
    }

    // 4. Guests count validation
    const guests = Number(body.guests);
    if (isNaN(guests) || guests < 1 || guests > 50) {
        errors.push('Number of guests must be between 1 and 50.');
    }

    // 5. Total amount (Optional & default to 0 for enquiries)
    const total = isNaN(Number(body.total)) ? 0 : Number(body.total);

    // 6. Dates check
    const dates = (body.dates || '').trim();
    if (!dates || dates.length < 3) {
        errors.push('Valid stay dates or batch must be selected.');
    }

    return {
        isBot: false,
        isValid: errors.length === 0,
        errors,
        sanitized: {
            name,
            phone,
            rawPhone,
            email,
            campsiteId: (body.campsiteId || body.packageId || '').trim(),
            package: (body.package || 'Wilderness Glamping').trim(),
            region: (body.region || 'Munnar').trim(),
            dates,
            guests,
            roomType: (body.roomType || 'Standard Glamping').trim().slice(0, 100),
            addons: Array.isArray(body.addons) ? body.addons.filter(a => typeof a === 'string').slice(0, 10).map(s => s.slice(0, 80)) : [],
            total,
            paidAmount: Number(body.paidAmount) || 0,
            balanceDue: Number(body.balanceDue) || 0,
            paymentMode: (body.paymentMode || '').trim().slice(0, 80),
            utrNumber: (body.utrNumber || '').trim().slice(0, 80),
            dietaryChoice: (body.dietaryChoice || 'Standard Campfire BBQ').trim().slice(0, 80),
            vegCount: Number(body.vegCount) || 0,
            nonVegCount: Number(body.nonVegCount) || 0,
            mealSummary: (body.mealSummary || '').trim().slice(0, 150),
            notes: (body.notes || '').slice(0, 500).trim(),
            source: (body.source || 'Website Engine').trim().slice(0, 80),
            waiverAccepted: Boolean(body.waiverAccepted),
            waiverTimestamp: body.waiverAccepted ? new Date().toISOString() : null
        }
    };
}

// Validate Admin Auth Payload
export function validateAuthPayload(body) {
    if (!body || typeof body !== 'object') {
        return { isValid: false, message: 'Invalid request body.' };
    }
    const passcode = (body.passcode || '').trim();
    if (!passcode || passcode.length < 4) {
        return { isValid: false, message: 'Passcode must be at least 4 characters.' };
    }
    return { isValid: true, passcode };
}
