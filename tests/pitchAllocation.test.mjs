import test from 'node:test';
import assert from 'node:assert/strict';
import { allocateContiguousPitches } from '../src/lib/pitchAllocation.js';

test('allocateContiguousPitches assigns initial pitches', () => {
    const pitches = allocateContiguousPitches({
        campsiteId: 'pkg-kolukkumalai',
        roomType: 'Dome Pod',
        unitsCount: 2,
        occupiedPitches: []
    });

    assert.equal(pitches.length, 2);
    assert.equal(pitches[0], 'DOM-101');
    assert.equal(pitches[1], 'DOM-102');
});

test('allocateContiguousPitches avoids collisions with occupied pitches', () => {
    const occupied = ['DOM-101', 'DOM-102'];
    const pitches = allocateContiguousPitches({
        campsiteId: 'pkg-kolukkumalai',
        roomType: 'Dome Pod',
        unitsCount: 2,
        occupiedPitches: occupied
    });

    assert.equal(pitches.length, 2);
    assert.equal(pitches[0], 'DOM-103');
    assert.equal(pitches[1], 'DOM-104');
});
