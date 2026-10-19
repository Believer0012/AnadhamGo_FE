// ── TRIP INTENT ──
// The dates and guests a traveller chose in the site search, carried through browsing to the
// booking card. The session copy is the source of truth (it holds the latest edit from any page);
// URL params (?checkin=&checkout=&guests=) seed it for shared links and mirror it on trip pages.
import { generateUpcomingWeekendBatches } from './utils';

const KEY = 'aanandham_trip_intent';
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const URL_KEYS = ['checkin', 'checkout', 'guests'];
export const TRIP_INTENT_EVENT = 'aanandham_trip_intent_change';

function clean({ checkin, checkout, guests } = {}) {
  const out = {};
  if (ISO.test(checkin || '')) out.checkin = checkin;
  if (ISO.test(checkout || '') && (!out.checkin || checkout > out.checkin)) out.checkout = checkout;
  const g = Number(guests);
  if (Number.isFinite(g) && g >= 1 && g <= 20) out.guests = Math.round(g);
  return Object.keys(out).length ? out : null;
}

function readStored() {
  try {
    return clean(JSON.parse(sessionStorage.getItem(KEY) || 'null') || {});
  } catch {
    return null;
  }
}

export function saveTripIntent(intent) {
  const value = clean(intent);
  try {
    if (value) sessionStorage.setItem(KEY, JSON.stringify(value));
    else sessionStorage.removeItem(KEY);
  } catch {
    // storage unavailable — URL params still carry the intent
  }
  return value;
}

export function readTripIntent() {
  if (typeof window === 'undefined') return null;
  const stored = readStored();
  if (stored) return stored;
  const p = new URLSearchParams(window.location.search);
  const fromUrl = clean({ checkin: p.get('checkin'), checkout: p.get('checkout'), guests: p.get('guests') });
  if (fromUrl) saveTripIntent(fromUrl);
  return fromUrl;
}

/** Mirror the intent into the current URL without a navigation, so the page stays shareable. */
export function writeTripIntentToUrl(intent) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  for (const k of URL_KEYS) {
    if (intent?.[k]) url.searchParams.set(k, String(intent[k]));
    else url.searchParams.delete(k);
  }
  if (url.href !== window.location.href) window.history.replaceState(null, '', url);
}

/** Merge a change (e.g. { checkin }) into the intent, persist it and tell every listener on the page. */
export function updateTripIntent(patch) {
  const value = saveTripIntent({ ...(readTripIntent() || {}), ...patch });
  writeTripIntentToUrl(value);
  window.dispatchEvent(new CustomEvent(TRIP_INTENT_EVENT, { detail: value }));
  return value;
}

const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const nextDayISO = (iso) => addDays(iso, 1);

/**
 * ISO dates → the booking engine's date label. A one-night stay that lands on an upcoming weekend
 * batch uses that batch's title (so the batch picker highlights it); anything else is a custom
 * range, e.g. "Oct 3, 2026 – Oct 4, 2026".
 */
export function toBookingDateLabel(checkin, checkout) {
  if (!checkin) return null;
  const end = checkout || nextDayISO(checkin);
  if (end === nextDayISO(checkin)) {
    const batch = generateUpcomingWeekendBatches(6).find((b) => b.rawDate === checkin);
    if (batch) return batch.title;
  }
  const fmt = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${fmt(checkin)} – ${fmt(end)}`;
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const toISO = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/**
 * The booking engine's date label → ISO dates. Understands both batch titles
 * ("Oct 03 – 04, 2026", "Oct 31 – Nov 01, 2026") and custom ranges ("Oct 3, 2026 – Oct 4, 2026").
 */
export function fromBookingDateLabel(label) {
  const m = String(label || '').match(
    /^\s*([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2})(?:,\s*(\d{4}))?\s*[–-]\s*(?:([A-Za-z]{3})[a-z]*\.?\s+)?(\d{1,2}),\s*(\d{4})\s*$/
  );
  if (!m) return null;
  const [, m1, d1, y1, m2, d2, y2] = m;
  const startMonth = MONTHS.indexOf(m1.toLowerCase());
  const endMonth = m2 ? MONTHS.indexOf(m2.toLowerCase()) : startMonth;
  if (startMonth < 0 || endMonth < 0) return null;
  // Custom ranges carry both years; batch titles carry the check-in year only
  const startYear = y1 ? Number(y1) : Number(y2);
  const endYear = y1 ? Number(y2) : startYear + (endMonth < startMonth ? 1 : 0);
  return clean({ checkin: toISO(startYear, startMonth, Number(d1)), checkout: toISO(endYear, endMonth, Number(d2)) });
}
