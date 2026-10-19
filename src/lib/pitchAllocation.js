/**
 * Smart Multi-Unit Pitch Allocation & Adjacency Grouping Engine
 * Assigns contiguous physical plots (e.g. Pitch #101, Pitch #102) for group bookings
 * while preventing isolated single-night calendar fragmentation.
 */

/**
 * Generate adjacent pitch identifiers for a booking
 * @param {object} params
 * @param {string} params.campsiteId - Campsite ID
 * @param {string} params.roomType - Room or tent type
 * @param {number} params.unitsCount - Number of pitches/tents requested
 * @param {Array<string>} [params.occupiedPitches] - List of already allocated pitch IDs
 * @returns {Array<string>} Allocated pitch numbers e.g. ['PITCH-101', 'PITCH-102']
 */
export function allocateContiguousPitches({ campsiteId = 'camp', roomType = 'tent', unitsCount = 1, occupiedPitches = [] }) {
    const count = Math.max(1, Number(unitsCount) || 1);
    const prefix = roomType.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'PLT';
    
    const allocated = [];
    let startNumber = 101;

    // Find the first contiguous block of N numbers not in occupiedPitches
    while (allocated.length < count) {
        let isBlockAvailable = true;
        const candidateBlock = [];

        for (let i = 0; i < count; i++) {
            const pitchId = `${prefix}-${startNumber + i}`;
            if (occupiedPitches.includes(pitchId)) {
                isBlockAvailable = false;
                startNumber = startNumber + i + 1;
                break;
            }
            candidateBlock.push(pitchId);
        }

        if (isBlockAvailable) {
            allocated.push(...candidateBlock);
            break;
        }
    }

    return allocated;
}
