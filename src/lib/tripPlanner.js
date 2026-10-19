// ── TRIP PLANNER ENGINE ──
// Deterministic, rule-based itinerary builder for the Parvati Valley (no AI, no backend).
// Day blocks describe real places and routes; they're suggestions, not bookings.
// Prices come from the stay + experience models, so they automatically switch from
// sample to real numbers as real listings are added — and the result says which is which.
import { getDiscoverStays } from './stays';
import { getExperiences } from './experiences';

export const TRIP_LENGTHS = [
  { value: 2, label: '2 days' },
  { value: 3, label: '3 days' },
  { value: 5, label: '5 days' },
  { value: 7, label: '7+ days' },
];

export const TRAVEL_GROUPS = [
  { value: 'solo', label: 'Solo', people: 1 },
  { value: 'couple', label: 'Couple', people: 2 },
  { value: 'friends', label: 'Friends', people: 4 },
  { value: 'family', label: 'Family', people: 4 },
];

export const INTERESTS = [
  { value: 'adventure', label: 'Adventure' },
  { value: 'nature', label: 'Nature' },
  { value: 'food', label: 'Food' },
  { value: 'relaxation', label: 'Relaxation' },
  { value: 'photography', label: 'Photography' },
  { value: 'trekking', label: 'Trekking' },
  { value: 'culture', label: 'Culture' },
  { value: 'wellness', label: 'Wellness' },
];

// Route order = the order you travel up the valley (and back down on the last day).
const BLOCKS = {
  'kasol-arrive': {
    place: 'kasol', title: 'Arrive in Kasol', night: 'kasol', base: 1,
    tags: ['nature', 'food', 'relaxation'],
    items: ['Arrive via Bhuntar and settle in by the river', 'Walk the Parvati to Chalal through the pines', 'Lunch at a riverside café', 'Sunset by the water'],
    experiences: ['sample-kasol-river-walk'],
  },
  'kasol-food': {
    place: 'kasol', title: 'Food & cafés in Kasol', night: 'kasol', route: 1, base: 0.6,
    tags: ['food', 'culture', 'relaxation'],
    items: ['Slow breakfast at a bakery', 'Cook siddu and rajma-chawal with a local family', 'Café-hop along the main street', 'Evening in Chalal village'],
    experiences: ['sample-kasol-himachali-cooking'],
  },
  malana: {
    place: 'malana', title: 'Day hike to Malana', night: 'kasol', route: 2, base: 0.4,
    tags: ['culture', 'trekking', 'adventure'],
    items: ['Drive towards the Malana dam and hike up to the village', 'Walk the village with a local guide — keep to the paths and don’t touch walls, temples or people', 'Back to Kasol for the night'],
    experiences: [],
  },
  pulga: {
    place: 'pulga', title: 'Up to Pulga', night: 'pulga', route: 3, base: 1.5,
    tags: ['nature', 'photography', 'relaxation'],
    items: ['Drive to Barshaini at the end of the road', 'Short walk up to Pulga’s wooden houses', 'Afternoon in the Fairy Forest deodar grove', 'Quiet evening in the village'],
    experiences: ['sample-pulga-fairy-forest-walk', 'sample-pulga-photography-walk'],
  },
  kalga: {
    place: 'kalga', title: 'Kalga orchards & stars', night: 'kalga', route: 4, base: 1.1,
    tags: ['photography', 'nature', 'adventure', 'relaxation'],
    items: ['Sunrise hike above the orchards', 'Forest trail across to Kalga', 'Meadow afternoon', 'Stargazing on a dark night sky'],
    experiences: ['sample-kalga-sunrise-expedition', 'sample-kalga-stargazing'],
  },
  tosh: {
    place: 'tosh', title: 'Tosh & the snow peaks', night: 'tosh', route: 5, base: 1,
    tags: ['culture', 'photography', 'nature'],
    items: ['Short drive or walk to Tosh', 'Village walk through terraced fields and the temple', 'Snow-peak views up the Tosh valley', 'Bonfire night'],
    experiences: ['sample-tosh-village-walk', 'sample-tosh-bonfire-night'],
  },
  'kheerganga-up': {
    place: 'kheerganga', title: 'Trek to Kheerganga', night: 'kheerganga', route: 6, base: 1.2, pairWith: 'kheerganga-down',
    tags: ['trekking', 'adventure', 'wellness'],
    items: ['Start early from near Barshaini', '~12 km through forest and past Rudra Nag falls', 'Soak in the hot spring at the top', 'Night under the stars on the meadow'],
    experiences: ['sample-kheerganga-sunrise-trek'],
  },
  'kheerganga-down': {
    place: 'kheerganga', title: 'Sunrise & trek down', night: 'pulga', route: 7, pairOnly: true,
    tags: ['trekking', 'photography'],
    items: ['Sunrise over the meadow', 'Trek back down to Barshaini', 'Rest your legs in Pulga'],
    experiences: [],
  },
  slow: {
    place: null, title: 'A slow day', night: null, route: 8, base: 0.3,
    tags: ['relaxation', 'wellness'],
    items: ['No alarms', 'Read by the river or in the orchard', 'Long lunch, short walk, early night'],
    experiences: [],
  },
  'manikaran-depart': {
    place: 'manikaran', title: 'Manikaran & home', night: null, base: 1, optionalExperience: true,
    tags: ['culture', 'wellness', 'food'],
    items: ['Head down the valley to Manikaran', 'Hot springs, the gurudwara and langar', 'On to Bhuntar and home'],
    experiences: ['sample-kasol-mountain-cycling'],
  },
};

const PLACE_NAMES = { kasol: 'Kasol', pulga: 'Pulga', kalga: 'Kalga', tosh: 'Tosh', kheerganga: 'Kheerganga', manikaran: 'Manikaran', malana: 'Malana' };

function scoreBlock(key, interests, group) {
  const b = BLOCKS[key];
  let score = b.base || 0;
  score += b.tags.filter((t) => interests.includes(t)).length * 2;
  if (key === 'kheerganga-up') {
    if (group === 'family' && !interests.includes('trekking')) score -= 2.5;
    if (group === 'friends') score += 0.8;
  }
  if (key === 'kalga' && group === 'couple') score += 0.8;
  if (key === 'tosh' && group === 'friends') score += 0.6;
  if (key === 'kasol-food' && group === 'family') score += 0.5;
  if (key === 'slow' && !interests.includes('relaxation') && !interests.includes('wellness')) score -= 1;
  return score;
}

function pickMiddleDays(slots, interests, group) {
  const candidates = ['kasol-food', 'malana', 'pulga', 'kalga', 'tosh', 'kheerganga-up', 'slow']
    .map((key) => ({ key, score: scoreBlock(key, interests, group), cost: BLOCKS[key].pairWith ? 2 : 1 }))
    .sort((a, b) => b.score - a.score);

  const chosen = [];
  let left = slots;
  for (const c of candidates) {
    if (c.cost <= left) {
      chosen.push(c.key);
      if (BLOCKS[c.key].pairWith) chosen.push(BLOCKS[c.key].pairWith);
      left -= c.cost;
    }
    if (left === 0) break;
  }
  // Fill any remaining days with slow days (only happens on long trips)
  while (left-- > 0) chosen.push('slow');
  return chosen.sort((a, b) => (BLOCKS[a].route || 0) - (BLOCKS[b].route || 0));
}

function nightlyPrice(stay, people) {
  const rooms = Math.max(1, Math.ceil(people / 2));
  if (stay.priceUnit === 'night') return stay.price * rooms;
  return stay.price * people; // per person / camper / bed
}

/**
 * Build an itinerary.
 * @param {{ days: number, group: string, guests?: number, interests: string[] }} input
 * @param {object[]} camps admin-synced camp list (for real stay prices)
 */
export function buildTrip({ days = 3, group = 'couple', guests, interests = [] }, camps = []) {
  const groupDef = TRAVEL_GROUPS.find((g) => g.value === group) || TRAVEL_GROUPS[1];
  const people = Math.max(1, Number(guests) || groupDef.people);
  const n = Math.max(2, Math.min(7, Number(days) || 3));

  const keys = ['kasol-arrive', ...pickMiddleDays(n - 2, interests, group), 'manikaran-depart'];

  // Resolve "wherever you were last night" for slow days
  let lastNight = 'kasol';
  const dayPlans = keys.map((key, i) => {
    const b = BLOCKS[key];
    const night = b.night === null && key === 'slow' ? lastNight : b.night;
    if (night) lastNight = night;
    const place = b.place || lastNight;
    return {
      day: i + 1, key, title: b.title, place, placeName: PLACE_NAMES[place] || '', items: b.items, night,
      experienceIds: b.experiences, optionalExperience: Boolean(b.optionalExperience),
    };
  });

  // ── Pricing ──
  const stays = getDiscoverStays(camps).filter((s) => s.group === 'himalaya');
  const experiences = getExperiences();
  let staysTotal = 0;
  let unpricedNights = 0;
  let usedSample = false;

  const nights = dayPlans.filter((d) => d.night);
  for (const d of nights) {
    const options = stays.filter((s) => s.destination === d.night);
    if (options.length === 0) { unpricedNights += 1; d.stay = null; continue; }
    // Prefer real stays; otherwise the most affordable option
    const pick = [...options].sort((a, b) => Number(a.isSample) - Number(b.isSample) || nightlyPrice(a, people) - nightlyPrice(b, people))[0];
    d.stay = pick;
    staysTotal += nightlyPrice(pick, people);
    if (pick.isSample) usedSample = true;
  }

  let experiencesTotal = 0;
  for (const d of dayPlans) {
    const matches = (e) => (e.categories || []).filter((c) => interests.includes(c)).length;
    const available = d.experienceIds
      .map((id) => experiences.find((e) => e.id === id))
      .filter(Boolean)
      // Travel days only get an activity when it matches what the traveller asked for
      .filter((e) => !d.optionalExperience || matches(e) > 0);
    // One paid experience per day, the one that best matches the chosen interests
    const best = available.sort((a, b) => matches(b) - matches(a))[0];
    d.experience = best || null;
    if (best) {
      experiencesTotal += best.price * people;
      if (best.isSample) usedSample = true;
    }
  }

  const route = [...new Set(dayPlans.map((d) => d.placeName).filter(Boolean))];
  // Name the trip after where you actually sleep (day trips like Malana don't count)
  const bases = [...new Set(nights.map((d) => PLACE_NAMES[d.night]).filter(Boolean))].slice(0, 3);
  const headline = bases.length <= 1 ? bases[0] || 'Kasol' : `${bases.slice(0, -1).join(', ')} & ${bases[bases.length - 1]}`;

  return {
    days: n,
    daysLabel: n >= 7 ? '7-day' : `${n}-day`,
    people,
    group: groupDef,
    title: `Your ${n >= 7 ? '7-day' : `${n}-day`} ${headline} escape`,
    route,
    dayPlans,
    nightsCount: nights.length,
    estimate: {
      stays: staysTotal,
      experiences: experiencesTotal,
      total: staysTotal + experiencesTotal,
      unpricedNights,
      usedSample,
      hasPrices: staysTotal + experiencesTotal > 0,
    },
  };
}

/** Plain-text version for WhatsApp / sharing. */
export function tripToText(trip, interests = []) {
  const lines = [
    `Hi Aanandham! I'd like to book this trip:`,
    ``,
    `${trip.title} — ${trip.people} ${trip.people === 1 ? 'person' : 'people'} (${trip.group.label})`,
    interests.length ? `Interests: ${interests.join(', ')}` : null,
    ``,
    ...trip.dayPlans.map((d) => `Day ${d.day} · ${d.title}${d.stay ? ` — stay: ${d.stay.title}${d.stay.isSample ? ' (sample)' : ''}` : ''}${d.experience ? ` — ${d.experience.title}${d.experience.isSample ? ' (sample)' : ''}` : ''}`),
    ``,
    trip.estimate.hasPrices ? `Estimate shown: ₹${trip.estimate.total.toLocaleString('en-IN')}` : null,
    `Please help me with dates and availability.`,
  ];
  return lines.filter((l) => l !== null).join('\n');
}

/** URL <-> planner state */
export function plannerStateToParams({ days, group, guests, interests }) {
  const p = new URLSearchParams();
  p.set('days', String(days));
  p.set('with', group);
  if (guests) p.set('guests', String(guests));
  if (interests.length) p.set('i', interests.join(','));
  return p;
}

export function plannerStateFromParams(search) {
  const p = new URLSearchParams(search);
  const days = Number(p.get('days'));
  const group = p.get('with');
  const guests = Number(p.get('guests'));
  const interests = (p.get('i') || '').split(',').filter((i) => INTERESTS.some((x) => x.value === i));
  return {
    ...(TRIP_LENGTHS.some((t) => t.value === days) ? { days } : {}),
    ...(TRAVEL_GROUPS.some((g) => g.value === group) ? { group } : {}),
    ...(guests >= 1 && guests <= 20 ? { guests } : {}),
    ...(interests.length ? { interests } : {}),
  };
}
