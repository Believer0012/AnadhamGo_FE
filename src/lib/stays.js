// ── STAY DISCOVERY MODEL ──
// One normalized "stay" shape for cards, filters, search and the wishlist, built from:
//   • real camps (campsData / admin API) — bookable, link to /camps/[id]
//   • sample stays (src/lib/sample) — only when isSampleDataEnabled(), never bookable
import { getVisibleDestinations } from './destinationsData';
import { isSampleDataEnabled, unsplash } from './sample/sampleConfig';
import { SAMPLE_STAYS } from './sample/sampleStays';

export const STAY_TYPES = [
  { value: 'cabins', label: 'Cabins' },
  { value: 'glamping', label: 'Glamping' },
  { value: 'camps', label: 'Camps' },
  { value: 'homestays', label: 'Homestays' },
  { value: 'hostels', label: 'Hostels' },
];

// Trip categories: used for the category section and the ?category= filter on /stays.
// `icon` is a lucide-react icon name resolved in the component.
export const TRIP_CATEGORIES = [
  { value: 'adventure', label: 'Adventure', icon: 'Mountain', image: unsplash('1546180801-a9b3dd6ad440', 600) },
  { value: 'nature', label: 'Nature', icon: 'Trees', image: unsplash('1581791534721-e599df4417f7', 600) },
  { value: 'camping', label: 'Camping', icon: 'Tent', image: unsplash('1618772446265-3f9f8e6f8487', 600) },
  { value: 'trekking', label: 'Trekking', icon: 'Footprints', image: unsplash('1642474606747-76312351789d', 600) },
  { value: 'stargazing', label: 'Stargazing', icon: 'Telescope', image: unsplash('1597326506895-74190916d433', 600) },
  { value: 'wellness', label: 'Wellness', icon: 'Leaf', image: unsplash('1675515642414-d99b23e2d95f', 600) },
  { value: 'couples', label: 'Couples', icon: 'Heart', image: unsplash('1786126224759-542c5fab3174', 600) },
  { value: 'family', label: 'Family', icon: 'Users', image: unsplash('1624304549170-587094a07a1e', 600) },
  { value: 'friends', label: 'Friends', icon: 'Flame', image: unsplash('1784223042072-69cd9e864860', 600) },
  { value: 'workation', label: 'Workation', icon: 'Laptop', image: unsplash('1769882199542-2de5bf54c486', 600) },
  { value: 'photography', label: 'Photography', icon: 'Camera', image: unsplash('1655921779882-f166fbe5ce48', 600) },
  { value: 'local-culture', label: 'Local Culture', icon: 'Landmark', image: unsplash('1572972875738-b1642a656d96', 600) },
];

const BADGES = ['Bestseller', 'New', 'Couples Choice', 'Pet Friendly', 'Great View'];

function typeFromCategory(category = '') {
  const c = category.toLowerCase();
  if (c.includes('dome') || c.includes('glamp')) return { type: 'glamping', typeLabel: category };
  if (c.includes('cabin') || c.includes('cottage') || c.includes('wood')) return { type: 'cabins', typeLabel: category };
  if (c.includes('homestay')) return { type: 'homestays', typeLabel: category };
  if (c.includes('hostel')) return { type: 'hostels', typeLabel: category };
  return { type: 'camps', typeLabel: category || 'Camp' };
}

function categoriesFromCamp(camp) {
  const text = `${camp.title} ${camp.category} ${camp.description || ''}`.toLowerCase();
  const out = new Set(['nature']);
  if (/camp|tent/.test(text)) out.add('camping');
  if (/trek|hike|summit/.test(text)) out.add('trekking');
  if (/4x4|jeep|offroad|adventure/.test(text)) out.add('adventure');
  if (/star|milky/.test(text)) out.add('stargazing');
  if (/couple|honeymoon|dome|glamp/.test(text)) out.add('couples');
  if (/family|kids/.test(text)) out.add('family');
  if (/group|friends|campfire/.test(text)) out.add('friends');
  if (/sunrise|view|photo/.test(text)) out.add('photography');
  return [...out];
}

function badgeFromTag(tag) {
  if (!tag) return null;
  const clean = String(tag).replace(/[^\w\s]/g, '').trim();
  return BADGES.find((b) => clean.toLowerCase().startsWith(b.toLowerCase())) || null;
}

function findDestinationForRegion(region, destinations) {
  const r = String(region || '').trim().toLowerCase();
  // Prefer the most specific destination (fewest regions) — e.g. Kalga over Parvati Valley
  return destinations
    .filter((d) => d.region?.some((x) => x.toLowerCase() === r))
    .sort((a, b) => a.region.length - b.region.length)[0];
}

/** Real camp (campsData / admin API) → normalized stay */
export function normalizeCamp(camp, destinations = getVisibleDestinations()) {
  const dest = findDestinationForRegion(camp.region, destinations);
  const amenities = (camp.amenities || [])
    .filter((a) => a && a.enabled !== false && a.name)
    .map((a) => a.name.split(/ & | \(|,/)[0].trim())
    .slice(0, 3);
  return {
    id: camp.id,
    title: camp.shortTitle || camp.title,
    destination: dest?.slug || null,
    locationLabel: camp.location || dest?.name || camp.region,
    ...typeFromCategory(camp.category),
    image: camp.image,
    rating: typeof camp.rating === 'number' ? camp.rating : null,
    reviewsCount: camp.reviewsCount || 0,
    price: camp.price,
    priceUnit: 'camper',
    badge: badgeFromTag(camp.tag),
    amenities,
    categories: categoriesFromCamp(camp),
    href: `/camps/${camp.id}`,
    isSample: false,
    isBookable: camp.isAvailable !== false,
    group: dest?.group || null,
  };
}

function withDestinationMeta(stay, destinations) {
  const dest = destinations.find((d) => d.slug === stay.destination);
  return {
    ...stay,
    locationLabel: stay.locationLabel || (dest ? `${dest.name}, ${dest.group === 'himalaya' ? 'Parvati Valley' : dest.area}` : ''),
    href: stay.href || `/destinations/${stay.destination}#stays`,
    group: dest?.group || null,
  };
}

// "Recommended" order: Parvati Valley first (primary focus), then Kerala; within each, real before sample.
const GROUP_RANK = { himalaya: 0, kerala: 1 };
export function sortRecommended(stays) {
  return stays
    .map((s, i) => ({ s, i }))
    .sort((a, b) =>
      (GROUP_RANK[a.s.group] ?? 2) - (GROUP_RANK[b.s.group] ?? 2) ||
      Number(a.s.isSample) - Number(b.s.isSample) ||
      a.i - b.i
    )
    .map(({ s }) => s);
}

/**
 * All discoverable stays. Real stays always come first (bookable inventory wins).
 * @param {object[]} camps — admin-synced camp list (pass useLiveCamps() output on the client)
 */
export function getDiscoverStays(camps = [], { includeSamples = isSampleDataEnabled() } = {}) {
  const destinations = getVisibleDestinations();
  const real = camps.filter((c) => c && c.id).map((c) => normalizeCamp(c, destinations));
  const samples = includeSamples ? SAMPLE_STAYS.map((s) => withDestinationMeta(s, destinations)) : [];
  return [...real, ...samples];
}

export function formatPrice(stay) {
  const units = { night: 'night', camper: 'camper', person: 'person', bed: 'bed' };
  return { amount: `₹${Number(stay.price || 0).toLocaleString('en-IN')}`, unit: units[stay.priceUnit] || 'night' };
}
