/**
 * Mountain Terrain, Vehicle Clearance & Accessibility Matrix
 * Protects campers from taking low-clearance vehicles onto high-altitude 4x4 offroad trails.
 */

export const CAMPSITE_TERRAIN_RULES = {
    'pkg-kolukkumalai': {
        vehicleRequirement: '4X4_ONLY',
        vehicleLabel: '4x4 Off-Road Vehicle Mandatory',
        vehicleDetails: 'Standard sedans and hatchbacks cannot traverse the rocky 14km tea estate trail. 4x4 Mahindra Jeep convoy pickup is provided from Suryanelli hub.',
        pitchAccessType: '4X4_CONVOY',
        trailheadDistanceMeters: 50,
        familyFriendly: true,
        wheelchairAccessible: false
    },
    'pkg-meesapulimala': {
        vehicleRequirement: '4X4_OR_TREK',
        vehicleLabel: '4x4 High-Clearance or Forest Trek',
        vehicleDetails: 'Accessed via Forest Department checkpoint. 4x4 required to Rhodo Valley basecamp, followed by guided alpine trek.',
        pitchAccessType: 'HIKE_IN',
        trailheadDistanceMeters: 400,
        familyFriendly: false,
        wheelchairAccessible: false
    },
    'pkg-suryanelli': {
        vehicleRequirement: '2WD_ACCESSIBLE',
        vehicleLabel: 'All Vehicles Accessible to Basecamp',
        vehicleDetails: 'Paved tar road directly to Aanandham Basecamp parking yard. Sedans, hatchbacks, and tempo travelers can easily reach reception.',
        pitchAccessType: 'DRIVE_IN',
        trailheadDistanceMeters: 20,
        familyFriendly: true,
        wheelchairAccessible: true
    },
    'pkg-mini-mexico': {
        vehicleRequirement: '2WD_ACCESSIBLE',
        vehicleLabel: 'All Standard Vehicles Accessible',
        vehicleDetails: 'Paved scenic mountain road leading directly to Mini Mexico Vattavada with dedicated private parking. Off-road 4x4 trails available on request.',
        pitchAccessType: 'DRIVE_IN',
        trailheadDistanceMeters: 10,
        familyFriendly: true,
        wheelchairAccessible: false,
        petFriendly: true
    },
    'pkg-wildlink': {
        vehicleRequirement: '2WD_ACCESSIBLE',
        vehicleLabel: 'Manageable for All Standard Vehicles',
        vehicleDetails: 'Main tar road from Munnar through Top Station and Vattavada checkpost. The final 8 km stretch past Koviloor to Pazhathottam (opposite Orion Farmers Resort) is a semi-off-road route manageable for bikes, sedans, hatchbacks, and SUVs.',
        pitchAccessType: 'DRIVE_IN',
        trailheadDistanceMeters: 10,
        familyFriendly: true,
        wheelchairAccessible: false,
        petFriendly: true
    },
    'default': {
        vehicleRequirement: '2WD_ACCESSIBLE',
        vehicleLabel: 'Standard Road Access',
        vehicleDetails: 'Paved road access with complimentary on-site parking.',
        pitchAccessType: 'DRIVE_IN',
        trailheadDistanceMeters: 50,
        familyFriendly: true,
        wheelchairAccessible: false
    }
};

/**
 * Validate vehicle compatibility for a chosen campsite
 * @param {string} campsiteId
 * @param {string} userVehicleType - 'sedan' | 'hatchback' | 'suv_2wd' | '4x4_offroad' | 'bike'
 * @returns {object}
 */
export function checkVehicleCompatibility(campsiteId = '', userVehicleType = 'sedan') {
    const rules = CAMPSITE_TERRAIN_RULES[campsiteId] || CAMPSITE_TERRAIN_RULES.default;

    if (rules.vehicleRequirement === '4X4_ONLY' && !['4x4_offroad'].includes(userVehicleType)) {
        return {
            compatible: true, // Still allowed because Aanandham includes 4x4 convoy pickup!
            requiresConvoyPickup: true,
            warning: `Private ${userVehicleType.toUpperCase()} must be parked at the Suryanelli Town Hub. Your booked package includes the 4x4 mountain ascent convoy.`
        };
    }

    return {
        compatible: true,
        requiresConvoyPickup: false,
        warning: null
    };
}
