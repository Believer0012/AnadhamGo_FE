/**
 * Western Ghats Wildlife Safety Protocols & Emergency Rescue Directory
 * Covers Munnar, Suryanelli, Kolukkumalai, and Meesapulimala high-range reserves.
 */

export const WILDLIFE_SAFETY_PROTOCOLS = {
    elephantCorridor: {
        zoneName: 'Anamalai / Munnar Forest Buffer Zone',
        rules: [
            'No food items or open snacks inside sleeping tents (store strictly in sealed containers / vehicle boot).',
            'No loud music or high-decibel speakers past 9:30 PM (disturbs nocturnal wildlife).',
            'Never approach or shine high-beam torches at wild elephants or bison.',
            'Campfire must be extinguished completely with water by 10:30 PM.'
        ]
    }
};

/**
 * High-Range Medical & Forest Ranger Emergency Directory
 */
export const EMERGENCY_DIRECTORY = {
    nearestHospitalWithAntivenom: {
        name: 'Tata General Hospital / Munnar Government Hospital',
        location: 'Munnar Town (approx. 22 km from Suryanelli)',
        emergencyHelpline: '+91 4865 230223',
        capabilities: '24/7 Trauma Unit, Anti-Venom Bank, Oxygen Supply'
    },
    forestRangeOffice: {
        name: 'Devikulam Forest Range Office',
        helpline: '+91 4865 264233',
        suryanelliCheckpost: '+91 94479 79088'
    },
    basecampRescueConvoy: {
        name: 'Aanandham 4x4 High-Altitude Rescue Fleet',
        helpline: '+91 90748 58014',
        standbyJeeps: 'Suryanelli Hub 24/7'
    }
};

/**
 * Get emergency summary and wildlife advisory for a campsite
 * @param {string} campsiteId 
 * @returns {object}
 */
export function getWildernessSafetyBriefing(campsiteId = '') {
    return {
        protocols: WILDLIFE_SAFETY_PROTOCOLS.elephantCorridor.rules,
        emergencyContacts: EMERGENCY_DIRECTORY,
        nightCurfewTime: '10:00 PM IST',
        generatorOperatingHours: '08:00 AM - 08:00 PM IST'
    };
}
