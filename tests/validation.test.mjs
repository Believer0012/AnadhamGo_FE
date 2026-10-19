import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizePhone, validateBookingPayload, isValidEmail } from '../src/lib/validation.js';

test('sanitizePhone cleans up phone numbers and preserves +', () => {
    assert.equal(sanitizePhone('+91 91886 85831'), '+919188685831');
    assert.equal(sanitizePhone('09188685831'), '09188685831');
    assert.equal(sanitizePhone('9188685831'), '9188685831');
    assert.equal(sanitizePhone(''), '');
});

test('isValidEmail accurately checks email format', () => {
    assert.equal(isValidEmail('camper@aanandham.in'), true);
    assert.equal(isValidEmail('invalid-email'), false);
    assert.equal(isValidEmail(''), false);
});

test('validateBookingPayload catches missing required fields', () => {
    const invalid = validateBookingPayload({});
    assert.equal(invalid.isValid, false);
    assert.ok(invalid.errors.length > 0);
});

test('validateBookingPayload catches honeypot bot trap', () => {
    const botPayload = {
        name: 'Bot Camper',
        phone: '+919188685831',
        package: 'Kolukkumalai',
        dates: '2026-09-01',
        guests: 2,
        total: 5000,
        honeypot: 'http://spamsite.com' // Honeypot trap filled
    };

    const res = validateBookingPayload(botPayload);
    assert.equal(res.isBot, true);
});
