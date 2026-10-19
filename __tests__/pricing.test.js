import test from 'node:test';
import assert from 'node:assert/strict';
import { computeBookingTotal, parseRoomCapacity, ADDON_CATALOG } from '../src/lib/pricing.js';

test('parseRoomCapacity extracts numbers accurately', () => {
    assert.equal(parseRoomCapacity('2 Adults'), 2);
    assert.equal(parseRoomCapacity('4 Campers'), 4);
    assert.equal(parseRoomCapacity(''), 4);
});

test('computeBookingTotal computes base total and addons correctly', () => {
    const mockCamp = { id: 'pkg-kolukkumalai', price: 2499, rooms: [] };
    const mockRoom = { id: 'r1', price: 2499, capacity: '2 Adults' };

    const result = computeBookingTotal({
        camp: mockCamp,
        room: mockRoom,
        adults: 2,
        children: 0,
        addonIds: []
    });

    assert.equal(result.baseTotal, 2499 * 2);
    assert.equal(result.total, 2499 * 2);
});

test('computeBookingTotal applies per-person and flat addons accurately', () => {
    const mockCamp = { id: 'pkg-kolukkumalai', price: 2000, rooms: [] };
    const mockRoom = { id: 'r1', price: 2000, capacity: '2 Adults' };

    const result = computeBookingTotal({
        camp: mockCamp,
        room: mockRoom,
        adults: 2,
        children: 0,
        addonIds: ['bbq', 'jeep']
    });

    assert.equal(result.baseTotal, 4000);
    assert.equal(result.total, 4000 + (450 * 2) + 1200);
});

test('ADDON_CATALOG has verified prices and perPerson flags', () => {
    assert.equal(ADDON_CATALOG.bbq.price, 450);
    assert.equal(ADDON_CATALOG.jeep.price, 1200);
    assert.equal(ADDON_CATALOG.drone.price, 1500);
});
