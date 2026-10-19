// ── UNIFIED DISCOVERY SEARCH ──
// Client-side search across the data that actually exists today:
// destinations, stays (campsData + samples), experiences, events (campsData) and guides (blogPosts).
// Loaded lazily via dynamic import() so none of this ships in the initial bundle.
import { getVisibleDestinations, getDestinationArea, getStaysCountForDestination } from './destinationsData';
import { getAllCamps } from './campsData';
import { getEvents, formatEventDate } from './events';
import { getDiscoverStays } from './stays';
import { getExperiences } from './experiences';
import { BLOG_POSTS } from './blogPosts';

export const SEARCH_GROUPS = [
  { type: 'destination', label: 'Destinations' },
  { type: 'stay', label: 'Stays' },
  { type: 'experience', label: 'Experiences' },
  { type: 'event', label: 'Events' },
  { type: 'guide', label: 'Guides' },
];

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');

function buildIndex(camps) {
  const destinations = getVisibleDestinations();
  const items = [];

  for (const d of destinations) {
    items.push({
      type: 'destination',
      id: d.slug,
      title: d.name,
      subtitle: getDestinationArea(d),
      href: `/destinations/${d.slug}`,
      image: d.heroImage,
      destination: d,
      haystack: normalize([d.name, d.area, d.tagline, d.shortDesc, ...(d.region || [])].join(' ')),
      titleKey: normalize(d.name),
    });
  }

  // Real camps + (when enabled) sample stays, via the shared stay model
  for (const s of getDiscoverStays(camps)) {
    const dest = destinations.find((d) => d.slug === s.destination);
    items.push({
      type: 'stay',
      id: s.id,
      title: s.title,
      subtitle: [s.isSample ? 'Sample' : null, s.typeLabel, s.locationLabel].filter(Boolean).join(' · '),
      href: s.href,
      image: s.image,
      haystack: normalize([s.title, s.typeLabel, s.locationLabel, dest?.name, dest?.area, ...(s.categories || [])].join(' ')),
      titleKey: normalize(s.title),
    });
  }

  for (const x of getExperiences()) {
    items.push({
      type: 'experience',
      id: x.id,
      title: x.title,
      subtitle: [x.isSample ? 'Sample' : null, x.duration, x.locationLabel].filter(Boolean).join(' · '),
      href: x.href,
      image: x.image,
      haystack: normalize([x.title, x.summary, x.activity, x.locationLabel, x.difficulty, ...(x.categories || [])].join(' ')),
      titleKey: normalize(x.title),
    });
  }

  for (const e of getEvents()) {
    items.push({
      type: 'event',
      id: e.id,
      title: e.title,
      subtitle: [e.isSample ? 'Sample' : null, formatEventDate(e).range, e.placeName].filter(Boolean).join(' · '),
      href: e.href,
      image: e.image,
      haystack: normalize([e.title, e.summary, e.category, e.placeName, e.locationLabel].join(' ')),
      titleKey: normalize(e.title),
    });
  }

  for (const p of BLOG_POSTS) {
    items.push({
      type: 'guide',
      id: p.slug,
      title: p.title,
      subtitle: [p.category, p.readMinutes ? `${p.readMinutes} min read` : null].filter(Boolean).join(' · '),
      href: `/blog/${p.slug}`,
      image: p.image,
      haystack: normalize([p.title, p.category, p.excerpt, ...(p.keywords || [])].join(' ')),
      titleKey: normalize(p.title),
    });
  }

  return items;
}

let cache = null;

/**
 * @param {string} query
 * @param {{ camps?: object[], perGroup?: number }} [opts]
 * @returns {{ query: string, total: number, groups: { type, label, count, items }[], topDestination: object|null, topDestinationStays: number }}
 */
export function searchAll(query, opts = {}) {
  const camps = opts.camps || getAllCamps();
  if (!cache || cache.camps !== camps) cache = { camps, items: buildIndex(camps) };

  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return { query, total: 0, groups: [], topDestination: null };

  const scored = [];
  for (const item of cache.items) {
    if (!tokens.every((t) => item.haystack.includes(t))) continue;
    const startsWith = tokens.every((t) => item.titleKey.split(/\s+/).some((w) => w.startsWith(t)));
    scored.push({ item, score: (startsWith ? 2 : 0) + (item.titleKey === tokens.join(' ') ? 3 : 0) });
  }
  scored.sort((a, b) => b.score - a.score);

  const perGroup = opts.perGroup ?? 3;
  const groups = SEARCH_GROUPS.map(({ type, label }) => {
    const matches = scored.filter((s) => s.item.type === type).map((s) => s.item);
    return { type, label, count: matches.length, items: matches.slice(0, perGroup) };
  }).filter((g) => g.count > 0);

  const topDestination = groups.find((g) => g.type === 'destination')?.items[0]?.destination || null;
  const topDestinationStays = topDestination ? getStaysCountForDestination(topDestination, camps) : 0;

  return { query, total: scored.length, groups, topDestination, topDestinationStays };
}
