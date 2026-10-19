import crypto from 'crypto';

/**
 * Flexible Check-in, Access Gate PINs & Offline Landmark Guides
 */

const PIN_SALT = process.env.GATE_PIN_SALT || process.env.ADMIN_AUTH_SECRET || 'aanandham_high_entropy_salt_v2_2026';

/**
 * Generate a deterministic, secure 4-digit Access PIN for smart locks / barrier gates
 * @param {string} bookingId - e.g. BK-M98X4K-A1
 * @param {string} dateStr - e.g. 2026-09-12
 * @returns {string} 4-digit PIN e.g. "8492"
 */
export function generateGatePin(bookingId, dateStr = '') {
    if (!bookingId) return '1234';
    const hash = crypto.createHash('sha256').update(`${bookingId}_${dateStr}_${PIN_SALT}`).digest('hex');
    const num = parseInt(hash.substring(0, 6), 16) % 9000 + 1000;
    return String(num);
}

/**
 * Generate a cryptographically signed HMAC token for the digital pass URL
 * @param {string} bookingId
 * @returns {string} Short 16-character hexadecimal HMAC signature
 */
export function generatePassToken(bookingId) {
    if (!bookingId) return '';
    return crypto.createHmac('sha256', PIN_SALT).update(bookingId.toUpperCase()).digest('hex').substring(0, 16);
}

/**
 * Verify a pass token against a booking ID and booking status
 * @param {string} bookingId
 * @param {string} token
 * @param {string} status - Optional booking status e.g. "Cancelled", "Refunded"
 * @returns {boolean}
 */
export function verifyPassToken(bookingId, token, status = 'Confirmed') {
    if (!bookingId || !token) return false;

    // Immediately reject revoked, refunded, or cancelled booking passes
    if (['Cancelled', 'Refunded', 'Expired', 'Failed'].includes(status)) {
        return false;
    }

    const expected = generatePassToken(bookingId);
    try {
        const tokenBuf = Buffer.from(token);
        const expectedBuf = Buffer.from(expected);
        if (tokenBuf.length !== expectedBuf.length) {
            crypto.timingSafeEqual(tokenBuf, tokenBuf);
            return false;
        }
        return crypto.timingSafeEqual(tokenBuf, expectedBuf);
    } catch (e) {
        return false;
    }
}

/**
 * Get offline landmark navigation and self check-in guide for a campsite
 * Supports camp-specific landmarks and custom booking-level admin overrides
 * @param {string} campsiteId - Camp slug, package name, or ID
 * @param {object} bookingOverrides - Optional custom overrides from the booking
 * @returns {object} Landmark directions & marshal contact
 */
export function getCheckInLandmarkGuide(campsiteId = '', bookingOverrides = {}) {
    const key = String(campsiteId || '').toLowerCase();
    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '919074858014';
    const formattedPhone = adminPhone.length === 12 && adminPhone.startsWith('91')
        ? `+91 ${adminPhone.slice(2, 7)} ${adminPhone.slice(7)}`
        : `+${adminPhone}`;

    let guide = {
        hubName: 'Suryanelli Town Basecamp Hub',
        gpsCoordinates: '10.0889° N, 77.0595° E',
        parkingArea: 'Designated 4x4 Private Parking Yard (Behind Suryanelli Tea Factory)',
        steps: [
            'Arrive at Basecamp Hub by 1:30 PM before 4x4 convoy departs.',
            'Park your vehicle in the reserved fenced parking zone.',
            'Show your digital pass or QR to the camp staff.',
            'Board your allocated 4x4 Jeep for the mountain ridge ascent.',
            'Check-in and tent handover with welcome tea on arrival.'
        ],
        emergencyMarshalPhone: formattedPhone,
        offlineNote: 'Mobile data drops past town limits. Please save your offline pass voucher before starting your ascent.'
    };

    if (key.includes('meesapulimala') || key.includes('silent-valley')) {
        guide.hubName = 'KFDC Silent Valley Base Checkpost, Munnar';
        guide.parkingArea = 'KFDC Base Station Reserved Camper Parking';
        guide.offlineNote = 'Strict forest checkpost. Keep Forest ID proof and digital permit pass ready.';
    } else if (key.includes('vattavada') || key.includes('top-station') || key.includes('wildlink') || key.includes('mexico')) {
        guide.hubName = 'Camp Wildlink / Pazhathottam Viewpoint, Vattavada';
        guide.parkingArea = 'Opposite Orion Farmers (Tea Fed) Resort (Designated Parking Yard)';
        guide.steps = [
            'Munnar to Top Station: Start from Munnar town and head toward Vattavada along the main tar road (approx. 42 km).',
            'Vattavada Forest Checkpost: Cross Top Station to reach the checkpost. Register your name, contact & vehicle details.',
            'Turn Towards Pazhathottam: Continue toward Koviloor. Just before reaching Koviloor town, take the concrete hairpin / U-turn road on the left side that heads downhill.',
            'Pazhathottam Viewpoint (8 km): Ask locals for Pazhathottam S Valavu or Pazhathottam Viewpoint.',
            'Final Mud Road Approach: Locate Orion Farmers (Tea Fed) Resort (wooden fencing). Take the mud road directly opposite Orion to arrive at Camp Wildlink.'
        ];
        guide.offlineNote = 'CRUCIAL NAVIGATION WARNING: Do not follow Google Maps deviations before Top Station that lead to rugged off-road tracks. Stick strictly to the main tarred road until you pass Top Station. The final 8 km is semi-off-road but manageable for bikes, sedans, hatchbacks, and SUVs.';
    } else if (key.includes('anaerangal') || key.includes('cardamom') || key.includes('anaharan')) {
        guide.hubName = 'Anaerangal Lake Viewpoint Basecamp Hub';
        guide.parkingArea = 'Estate Private Shaded Camper Parking';
        guide.offlineNote = 'Low network zone near the lake. Save pass & offline map beforehand.';
    } else if (key.includes('vagamon')) {
        guide.hubName = 'Vagamon Pine Valley Basecamp Hub';
        guide.parkingArea = 'Aanandham Pine Valley Secured Lot';
        guide.offlineNote = 'Mountain fog drops visibility in evenings. Drive with fog lamps.';
    } else if (key.includes('wayanad')) {
        guide.hubName = 'Meppadi 900 Kandi Foothill Hub, Wayanad';
        guide.parkingArea = 'Designated 4x4 Offroad Parking Base';
        guide.offlineNote = 'Rugged glass bridge offroad trail. 4x4 jeeps allocate on arrival.';
    } else if (key.includes('kolukkumalai') || key.includes('suryanelli')) {
        guide.hubName = 'Suryanelli Town Basecamp Hub';
        guide.parkingArea = 'Designated 4x4 Private Parking Yard (Behind Suryanelli Tea Factory)';
        guide.offlineNote = 'Mobile data drops past Suryanelli factory. Please save your pass voucher before leaving Munnar town.';
    }

    // ── Custom Admin / Booking-level overrides ──
    if (bookingOverrides.pickupLocation || bookingOverrides.meetingHub) {
        guide.hubName = bookingOverrides.pickupLocation || bookingOverrides.meetingHub;
    }
    if (bookingOverrides.parkingArea) {
        guide.parkingArea = bookingOverrides.parkingArea;
    }
    if (bookingOverrides.emergencyPhone || bookingOverrides.marshalPhone) {
        guide.emergencyMarshalPhone = bookingOverrides.emergencyPhone || bookingOverrides.marshalPhone;
    }
    if (bookingOverrides.offlineNote) {
        guide.offlineNote = bookingOverrides.offlineNote;
    }

    return guide;
}
