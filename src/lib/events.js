// ── EVENTS MODEL ──
// Real events: INITIAL_EVENTS from campsData (Munnar batches). Sample Parvati Valley events are
// added only when isSampleDataEnabled(). Everything is normalized to one shape with ISO dates.
import { INITIAL_EVENTS } from './campsData';
import { getVisibleDestinations } from './destinationsData';
import { isSampleDataEnabled } from './sample/sampleConfig';
import { SAMPLE_EVENTS } from './sample/sampleEvents';

export const EVENT_CATEGORIES = [
  { value: 'music', label: 'Music' },
  { value: 'stargazing', label: 'Stargazing' },
  { value: 'camp', label: 'Camps' },
  { value: 'trek', label: 'Treks' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'community', label: 'Community' },
  { value: 'culture', label: 'Culture' },
];

const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

// "24 Oct - 25 Oct 2026" → { start: '2026-10-24', end: '2026-10-25' }
function parseRange(text = '') {
  const year = Number((text.match(/(20\d\d)/) || [])[1]);
  const parts = [...text.matchAll(/(\d{1,2})\s+([A-Za-z]{3})/g)].map((m) => ({ d: Number(m[1]), m: MONTHS[m[2].toLowerCase()] }));
  if (!year || parts.length === 0 || parts.some((p) => p.m === undefined)) return {};
  return { start: iso(year, parts[0].m, parts[0].d), end: parts[1] ? iso(year, parts[1].m, parts[1].d) : undefined };
}

function fromCampsData(e) {
  const { start, end } = parseRange(e.dates);
  const capacity = Number(e.capacity) || null;
  return {
    id: e.id,
    title: e.title,
    destination: 'munnar',
    category: /trek|summit/i.test(e.title) ? 'trek' : 'camp',
    start,
    end,
    time: e.dates,
    price: e.price,
    capacity,
    spotsLeft: capacity != null && e.booked != null ? Math.max(0, capacity - Number(e.booked)) : null,
    image: e.image,
    summary: e.campsite ? `At ${e.campsite}.` : '',
    isSample: false,
    isBookable: true,
  };
}

export function isPast(event, today = new Date()) {
  const last = event.end || event.start;
  if (!last) return false;
  const todayIso = iso(today.getFullYear(), today.getMonth(), today.getDate());
  return last < todayIso;
}

/** All events (real + samples when enabled), soonest first, with destination labels attached. */
export function getEvents({ includeSamples = isSampleDataEnabled() } = {}) {
  const destinations = getVisibleDestinations();
  const list = [...INITIAL_EVENTS.map(fromCampsData), ...(includeSamples ? SAMPLE_EVENTS : [])].filter((e) => e.start);
  return list
    .map((e) => {
      const dest = destinations.find((d) => d.slug === e.destination);
      return {
        ...e,
        placeName: dest?.name || '',
        group: dest?.group || null,
        locationLabel: dest ? `${dest.name}, ${dest.group === 'himalaya' ? 'Parvati Valley' : 'Kerala'}` : '',
        href: `/events#${e.id}`,
      };
    })
    .sort((a, b) => a.start.localeCompare(b.start));
}

export function formatEventDate(e) {
  const fmt = (s, opts) => new Date(`${s}T00:00:00`).toLocaleDateString('en-IN', opts);
  const day = fmt(e.start, { day: 'numeric' });
  const month = fmt(e.start, { month: 'short' });
  const weekday = fmt(e.start, { weekday: 'short' });
  const range = e.end && e.end !== e.start ? `${fmt(e.start, { day: 'numeric', month: 'short' })} – ${fmt(e.end, { day: 'numeric', month: 'short' })}` : fmt(e.start, { weekday: 'short', day: 'numeric', month: 'short' });
  return { day, month, weekday, range };
}

export function availability(e) {
  if (e.spotsLeft == null) return { label: 'Open', tone: 'open' };
  if (e.spotsLeft === 0) return { label: 'Sold out', tone: 'out' };
  if (e.capacity && e.spotsLeft / e.capacity <= 0.25) return { label: `Only ${e.spotsLeft} spots left`, tone: 'low' };
  return { label: `${e.spotsLeft} spots left`, tone: 'open' };
}
