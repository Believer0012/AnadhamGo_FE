/**
 * Mobile Carrier Signal Matrix, Solar Power Restrictions & Elevation Logistics
 */

export const CAMPSITE_TECHNICAL_SPECS = {
    'pkg-kolukkumalai': {
        elevationMeters: 2408,
        elevationFeet: '7,900 FT',
        carrierSignals: {
            airtel: '2G/4G Intermittent (Ridge spots only)',
            jio: 'No Signal at Ridge Camp (Signal available at Suryanelli Hub)',
            bsnl: '2G/3G Moderate Voice Signal',
            vi: 'Weak / No Signal'
        },
        powerGridType: '100% OFF_GRID_SOLAR_BATTERY',
        powerAdvisory: 'Solar battery microgrid powers LED lights, mobile charging ports, and hot water. High-draw heating appliances (hair dryers, electric kettles, induction) are strictly forbidden.',
        decibelRating: 'SILENT_SANCTUARY',
        quietHoursRule: 'Strict silence (<45 dB) after 09:30 PM. No Bluetooth speakers allowed on summit ridge.',
        acclimatizationTips: [
            'Night temperatures drop to 8°C - 12°C. Wear layered thermal clothing.',
            'Stay well-hydrated; mountain breeze causes rapid dehydration.',
            'Avoid heavy alcohol consumption before sunrise summit ascent.'
        ]
    },
    'pkg-meesapulimala': {
        elevationMeters: 2640,
        elevationFeet: '8,661 FT',
        carrierSignals: {
            airtel: 'Weak / Forest Edge only',
            jio: 'No Reception on Summit Trail',
            bsnl: 'Emergency Voice Only',
            vi: 'No Signal'
        },
        powerGridType: 'OFF_GRID_SOLAR',
        powerAdvisory: 'Basecamp solar setup for essential night lanterns. Carry charged power banks.',
        decibelRating: 'WILDLIFE_SANCTUARY_ZERO_NOISE',
        quietHoursRule: 'Complete silence after 09:00 PM (Elephant & Nilgiri Tahr habitat).',
        acclimatizationTips: [
            'Second highest peak in South India. Rapid weather changes with thick fog.',
            'Steep ascent requires good physical endurance and sturdy trekking shoes.',
            'Carry basic electrolyte salts and windproof jacket.'
        ]
    },
    'pkg-suryanelli': {
        elevationMeters: 1850,
        elevationFeet: '6,070 FT',
        carrierSignals: {
            airtel: '4G / 5G Strong (Full Coverage)',
            jio: '4G / 5G Strong (Full Coverage)',
            bsnl: 'Strong Voice & Data',
            vi: '4G Good'
        },
        powerGridType: 'HYBRID_SOLAR_AND_GRID',
        powerAdvisory: '24/7 Grid Power with Solar Inverter backup. Standard charging points available at all tents.',
        decibelRating: 'COMMUNITY_CAMPFIRE',
        quietHoursRule: 'Acoustic campfire music allowed until 10:00 PM. Quiet hours 10:00 PM - 07:00 AM.',
        acclimatizationTips: [
            'Pleasant day temperatures (20°C - 24°C), cool evening mist (14°C).',
            'Light fleece or sweater is sufficient for evenings.'
        ]
    },
    'pkg-mini-mexico': {
        elevationMeters: 1890,
        elevationFeet: '6,200 FT',
        carrierSignals: {
            airtel: '4G Good (Voice & Data)',
            jio: '4G Good (Voice & Data)',
            bsnl: '3G / Voice Strong',
            vi: '3G / 4G Moderate'
        },
        powerGridType: 'GRID_POWER_WITH_INVERTER',
        powerAdvisory: '24/7 Grid Power with Inverter backup. Mobile and laptop charging available in all cabins and wood houses.',
        decibelRating: 'PET_FRIENDLY_SANCTUARY',
        quietHoursRule: 'Campfire music allowed until 10:00 PM. Quiet hours 10:00 PM - 07:00 AM.',
        acclimatizationTips: [
            'Crisp mountain temperatures (12°C - 22°C). Light woolens or jackets recommended for evening & morning.',
            'Pet friendly property: please keep pets supervised during farm walks.',
            'Pre-booking required for special meals, transport, and extra campfire.'
        ]
    },
    'pkg-wildlink': {
        elevationMeters: 2134,
        elevationFeet: '7,000 FT',
        carrierSignals: {
            airtel: '4G Moderate (Voice & Data)',
            jio: '4G Moderate (Voice & Data)',
            bsnl: '4G / Voice Strong',
            vi: '3G / Voice Moderate'
        },
        powerGridType: 'SOLAR_AND_INVERTER',
        powerAdvisory: 'Eco-friendly solar setup with Inverter power backup. Charging points available at common hub and cabins.',
        decibelRating: 'ECO_FARM_SANCTUARY',
        quietHoursRule: 'Zero-noise Shola border policy. Quiet hours 10:00 PM - 06:30 AM.',
        acclimatizationTips: [
            'Chilly mountain climate at 7,000 ft (9°C - 19°C). Warm thermals, rain protection, and trekking shoes essential.',
            'Pampadum Shola border zone: strictly zero-waste, leave-no-trace policy.',
            'All non-veg meals & BBQ must be reserved with prior confirmation.'
        ]
    }
};

/**
 * Get full technical specifications and mobile network matrix for a camp
 * @param {string} campsiteId 
 * @returns {object}
 */
export function getCampsiteSpecs(campsiteId = 'pkg-suryanelli') {
    return CAMPSITE_TECHNICAL_SPECS[campsiteId] || CAMPSITE_TECHNICAL_SPECS['pkg-suryanelli'];
}
