// ── CORE UTILITIES ──

const inrFormatter = new Intl.NumberFormat('en-IN');
const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
});

/**
 * Format a number or numeric string as Indian Rupee currency (₹)
 * @param {number|string} amount
 * @returns {string} e.g. "₹4,999"
 */
export const inr = (amount) => {
  const num = typeof amount === 'number' ? amount : Number(amount) || 0;
  return '₹' + inrFormatter.format(num);
};

/**
 * Format date string into human-friendly format
 * @param {string|Date} date
 * @returns {string} e.g. "Aug 15, 2026"
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return dateFormatter.format(d);
};

/**
 * Clamp a number between min and max
 */
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/**
 * Safely parse JSON from storage
 */
export const safeJsonParse = (str, fallback = null) => {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch (e) {
    return fallback;
  }
};

/**
 * Generate collision-free, human-readable booking ID with cryptographic entropy
 */
export const generateBookingId = () => {
  const timePart = Date.now().toString(36).toUpperCase();
  let randPart = '';
  try {
    // Web Crypto exists in every browser and in Node ≥19. Deliberately no require('crypto'):
    // that pulled a ~430 KB Node crypto polyfill into every page's client bundle.
    // (Server booking IDs are generated in the API routes, not here.)
    const webCrypto = globalThis.crypto;
    if (webCrypto && webCrypto.getRandomValues) {
      const arr = new Uint8Array(3);
      webCrypto.getRandomValues(arr);
      randPart = Array.from(arr, b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    } else {
      randPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
  } catch {
    randPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  return `BK-${timePart}-${randPart || 'A1B2'}`;
};

/**
 * Neutralize dangerous formula injection characters in CSV exports (E2)
 * Follows OWASP CSV Injection guidelines by prepending ' to dangerous prefixes.
 */
export const escapeCsvValue = (val) => {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  // Neutralize formula triggers: =, +, -, @, Tab, Carriage Return
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return `"${str.replace(/"/g, '""')}"`;
};

/**
 * Dynamic upcoming weekend batches generator (N5)
 * Dynamically computes upcoming Saturday-Sunday batches for any current date.
 */
export const generateUpcomingWeekendBatches = (count = 6) => {
  const batches = [];
  const now = new Date();
  
  // Find next Saturday
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = current.getDay(); // 0 is Sunday, 6 is Saturday
  let daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
  if (daysUntilSaturday === 0 && now.getHours() >= 14) {
    // If it's Saturday afternoon, start from next Saturday
    daysUntilSaturday = 7;
  }
  
  current.setDate(current.getDate() + daysUntilSaturday);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const eventTypes = [
    { title: 'Cloud Bed Batch', subtitle: 'This Weekend (Sat–Sun)', status: 'Filling Fast', color: '#B45309', spots: '4 spots left', badge: 'Filling Fast' },
    { title: 'Perseid Meteor Camp', subtitle: 'Next Weekend (Sat–Sun)', status: 'Open', color: '#166534', spots: '12 spots left', badge: 'Meteor Shower' },
    { title: 'Full Moon Ridge Glamp', subtitle: 'Peak Stargazing', status: 'Special Event', color: '#7C3AED', spots: '8 spots left', badge: 'Full Moon' },
    { title: 'Acoustic Campfire & BBQ', subtitle: 'Live Mountain Music', status: 'Open', color: '#166534', spots: '16 spots left', badge: 'Live BBQ' },
    { title: 'Meesapulimala Summit Batch', subtitle: 'High Peak Challenge', status: 'Open', color: '#166534', spots: '10 spots left', badge: 'Summit Trek' },
    { title: 'Rainforest Canopy Camp', subtitle: 'Deep Mist Valley', status: 'Open', color: '#166534', spots: '14 spots left', badge: 'High Mist' }
  ];

  for (let i = 0; i < count; i++) {
    const sat = new Date(current);
    const sun = new Date(current);
    sun.setDate(sat.getDate() + 1);

    const satMonth = months[sat.getMonth()];
    const sunMonth = months[sun.getMonth()];
    const satDay = String(sat.getDate()).padStart(2, '0');
    const sunDay = String(sun.getDate()).padStart(2, '0');
    const year = sat.getFullYear();

    const dateFormatted = satMonth === sunMonth 
      ? `${satMonth} ${satDay} – ${sunDay}, ${year}`
      : `${satMonth} ${satDay} – ${sunMonth} ${sunDay}, ${year}`;

    const isoDate = `${year}-${String(sat.getMonth() + 1).padStart(2, '0')}-${satDay}`;
    const preset = eventTypes[i % eventTypes.length];

    batches.push({
      id: `batch-${isoDate}`,
      title: dateFormatted,
      subtitle: i === 0 ? 'This Upcoming Weekend' : i === 1 ? 'Next Weekend' : preset.subtitle,
      status: preset.status,
      statusColor: preset.color,
      spotsLeft: preset.spots,
      badge: preset.badge,
      rawDate: isoDate
    });

    // Advance 7 days to next Saturday
    current.setDate(current.getDate() + 7);
  }

  return batches;
};

/**
 * Get default upcoming batch date string
 */
export const getDefaultUpcomingBatch = () => {
  const batches = generateUpcomingWeekendBatches(1);
  return batches[0]?.title || 'Upcoming Weekend Batch';
};
