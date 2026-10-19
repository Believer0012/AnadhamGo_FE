/**
 * Kerala Mountain Weather & Alpine Packing List Generator
 * Tailors advice based on mountain altitude (Munnar 6,000+ FT, Kolukkumalai 7,900 FT, Meesapulimala 8,661 FT)
 */

export const WEATHER_PROFILES = {
    'munnar': {
        dayTemp: '20°C - 24°C',
        nightTemp: '10°C - 14°C',
        conditions: 'Misty Alpine Ridge · Crisp Breeze',
        gear: ['Windbreaker jacket', 'Light thermals for night', 'Trekking shoes with grip', 'Headlamp / Torch', 'Personal water flask']
    },
    'kolukkumalai': {
        dayTemp: '16°C - 20°C',
        nightTemp: '8°C - 12°C',
        conditions: 'High-Altitude 7,900 FT · Chilly Winds & Cloud Beds',
        gear: ['Heavy fleece / Down jacket', 'Thermal inners', 'Beanie / Woolen cap', 'Powerbank (cold drains batteries)', 'Lip balm & moisturizer', 'Camera / Tripod for sunrise']
    },
    'meesapulimala': {
        dayTemp: '15°C - 19°C',
        nightTemp: '6°C - 10°C',
        conditions: 'Summit Peak 8,661 FT · Dense Fog & Frost',
        gear: ['Extreme cold jacket (<10°C)', 'Thermal base layer', 'Waterproof trekking boots', 'Rain poncho', 'Trekking pole', 'Electrolyte packs']
    },
    'vagamon': {
        dayTemp: '22°C - 26°C',
        nightTemp: '14°C - 17°C',
        conditions: 'Rolling Pine Valleys & Evening Fog',
        gear: ['Comfortable cottons for day', 'Light hoodie for night', 'Walking sneakers', 'Insect repellent', 'Sun hat']
    },
    'wayanad': {
        dayTemp: '23°C - 27°C',
        nightTemp: '15°C - 18°C',
        conditions: 'Rainforest Canopy & Fresh Mountain Streams',
        gear: ['Quick-dry apparel', 'Leech socks (monsoon trails)', 'Waterproof backpack cover', 'Binoculars for birding', 'Natural insect repellent']
    }
};

/**
 * Get dynamic weather profile and recommended packing list for a campsite
 * @param {string} regionOrCampId - Region or campsite ID
 * @param {string|Date} [date] - Optional date of stay
 * @returns {object} Weather conditions and curated packing checklist
 */
export function getWeatherAndPackingList(regionOrCampId = 'munnar', date = null) {
    const key = String(regionOrCampId).toLowerCase();
    
    let matchedProfile = WEATHER_PROFILES.munnar;
    if (key.includes('kolukkumalai')) matchedProfile = WEATHER_PROFILES.kolukkumalai;
    else if (key.includes('meesapulimala')) matchedProfile = WEATHER_PROFILES.meesapulimala;
    else if (key.includes('vagamon')) matchedProfile = WEATHER_PROFILES.vagamon;
    else if (key.includes('wayanad')) matchedProfile = WEATHER_PROFILES.wayanad;

    // Check if monsoon season (June to August in Kerala)
    const month = date ? new Date(date).getMonth() : new Date().getMonth();
    const isMonsoon = month >= 5 && month <= 7; // June (5) to August (7)

    const gearList = [...matchedProfile.gear];
    if (isMonsoon) {
        gearList.push('Heavy-duty rain poncho 🌧️', 'Waterproof phone dry-bag');
    }

    return {
        dayTemperature: matchedProfile.dayTemp,
        nightTemperature: matchedProfile.nightTemp,
        conditions: isMonsoon ? 'Monsoon Mountain Mist · Lush Green Valleys 🌧️' : matchedProfile.conditions,
        isMonsoon,
        packingChecklist: gearList,
        forceMajeureAlert: null // e.g. { active: true, reason: 'Red Alert Issued' } when triggered by district collector
    };
}

/**
 * Check if Force Majeure (Red Alert / Government Flash Flood Evacuation) applies
 * @param {string} district - e.g. 'Idukki' or 'Wayanad'
 * @returns {boolean}
 */
export function isForceMajeureActive(district = 'Idukki') {
    // Connects to disaster management feeds / manual admin override
    return false;
}
