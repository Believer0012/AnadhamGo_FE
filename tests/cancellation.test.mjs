import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRefundAmount, CANCELLATION_TIERS } from '../src/lib/cancellation.js';

test('calculateRefundAmount returns 100% for future check-in dates > 7 days away', () => {
    const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    const policy = calculateRefundAmount(futureDate, 10000);

    assert.equal(policy.refundPercentage, 100);
    assert.equal(policy.refundAmount, 10000);
    assert.equal(policy.tier, 'tier_full');
});

test('calculateRefundAmount returns 50% for 3 days before check-in', () => {
    const threeDaysAway = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const policy = calculateRefundAmount(threeDaysAway, 10000);

    assert.equal(policy.refundPercentage, 50);
    assert.equal(policy.refundAmount, 5000);
    assert.equal(policy.tier, 'tier_half');
});

test('calculateRefundAmount returns 0% for < 48 hours notice', () => {
    const oneDayAway = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const policy = calculateRefundAmount(oneDayAway, 10000);

    assert.equal(policy.refundPercentage, 0);
    assert.equal(policy.refundAmount, 0);
    assert.equal(policy.tier, 'tier_none');
});
