// ── DESTINATIONS DATA ──
// A "destination" wraps one or more existing camp `region` values (live places),
// or stands alone with no bookable inventory yet (coming-soon places).
//
// Himalayan destinations are real places described factually. They carry NO
// stays, prices, ratings or reviews until real Aanandham listings exist there —
// stay counts are always computed from campsData.js, never asserted here.
import { DEFAULT_DESTINATION_CONTENT } from './cmsDestinationDefaults';

const unsplash = (id, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

// Camp `region` values (as entered in the admin panel) that belong to the Parvati Valley.
// A destination becomes bookable automatically as soon as a real stay with a matching region exists.
const PARVATI_REGIONS = ['Kasol', 'Pulga', 'Kalga', 'Tosh', 'Manikaran', 'Kheerganga', 'Malana', 'Barshaini', 'Parvati Valley'];

export const DESTINATION_GROUPS = {
  himalaya: { label: 'Parvati Valley', state: 'Himachal Pradesh' },
  kerala: { label: 'Western Ghats', state: 'Kerala' },
};

export const ALL_DESTINATIONS = [
  // ── Himalaya: Parvati Valley (primary focus) ──
  {
    slug: 'pulga',
    name: 'Pulga',
    group: 'himalaya',
    area: 'Parvati Valley, Himachal Pradesh',
    region: ['Pulga'],
    status: 'coming-soon',
    tagline: 'Wooden houses and the fairy forest',
    shortDesc: 'A car-free village of wooden houses beside an old deodar forest, a short walk up from the road head at Barshaini.',
    longDesc:
      'Pulga sits above the Parvati river on the far side of Barshaini, reachable only on foot. Its lanes run between slate-roofed wooden houses, apple trees and guesthouses, and just above the village is the old deodar grove locals call the Fairy Forest. It is a place for slow mornings, short forest walks and long evenings by the fire.',
    heroImage: unsplash('1655921779882-f166fbe5ce48'),
    gallery: [unsplash('1655921779882-f166fbe5ce48'), unsplash('1643527311836-1b882311dbdb')],
    altitude: '~2,200 m',
    bestSeason: ['March', 'April', 'May', 'June', 'September', 'October', 'November'],
    nearestTransport: 'Bhuntar Airport (Kullu), ~60 km to Barshaini, then a short walk',
    lat: 32.0005,
    lng: 77.4447,
  },
  {
    slug: 'kasol',
    name: 'Kasol',
    group: 'himalaya',
    area: 'Parvati Valley, Himachal Pradesh',
    region: ['Kasol'],
    status: 'coming-soon',
    tagline: 'The river town at the heart of the valley',
    shortDesc: 'Riverside cafés, pine-shaded campsites and trails in every direction — the easiest base for exploring the Parvati Valley.',
    longDesc:
      'Kasol lines the banks of the Parvati river under tall pines, and is where most journeys into the valley begin. Cafés and bakeries fill the main street, Manikaran is a few kilometres downstream, and villages like Chalal and Rasol are an easy walk away. It is lively, well connected and a natural first stop.',
    heroImage: unsplash('1612638039814-1a67ea727114'),
    gallery: [unsplash('1612638039814-1a67ea727114'), unsplash('1655921779894-6416de7aaf03')],
    altitude: '~1,580 m',
    bestSeason: ['March', 'April', 'May', 'June', 'September', 'October', 'November'],
    nearestTransport: 'Bhuntar Airport (Kullu), ~31 km · Overnight Volvo from Delhi to Bhuntar/Kasol',
    lat: 32.0099,
    lng: 77.315,
  },
  {
    slug: 'kalga',
    name: 'Kalga',
    group: 'himalaya',
    area: 'Parvati Valley, Himachal Pradesh',
    region: ['Kalga'],
    status: 'coming-soon',
    tagline: 'Orchards, meadows and snow-peak views',
    shortDesc: 'A quiet hamlet of apple orchards and meadows above Barshaini, with long views of the snow peaks.',
    longDesc:
      'Kalga is a cluster of farmhouses and orchards on a ridge above Barshaini, a steady uphill walk from the road. Days here are unhurried: meadow afternoons, forest trails towards Pulga and Tosh, and clear nights when the sky is dark enough to see the Milky Way.',
    heroImage: unsplash('1491974162517-a7541284efe7'),
    gallery: [unsplash('1491974162517-a7541284efe7')],
    altitude: '~2,250 m',
    bestSeason: ['March', 'April', 'May', 'June', 'September', 'October', 'November'],
    nearestTransport: 'Bhuntar Airport (Kullu), ~60 km to Barshaini, then a ~30 min uphill walk',
    lat: 32.0063,
    lng: 77.438,
  },
  {
    slug: 'tosh',
    name: 'Tosh',
    group: 'himalaya',
    area: 'Parvati Valley, Himachal Pradesh',
    region: ['Tosh'],
    status: 'coming-soon',
    tagline: 'The village at the end of the valley',
    shortDesc: 'Terraced houses at the head of the Tosh valley, facing a wall of snow peaks and glacier-fed streams.',
    longDesc:
      'Tosh climbs a hillside above the confluence of the Tosh and Parvati rivers, a short drive or walk beyond Barshaini. The village looks straight up the valley towards snowfields and glaciers, and trails lead on towards Kutla and the high meadows beyond.',
    heroImage: unsplash('1699020152050-7ac7197a97ac'),
    gallery: [unsplash('1699020152050-7ac7197a97ac')],
    altitude: '~2,400 m',
    bestSeason: ['April', 'May', 'June', 'September', 'October'],
    nearestTransport: 'Bhuntar Airport (Kullu), ~62 km via Barshaini',
    lat: 32.0151,
    lng: 77.4553,
  },
  {
    slug: 'parvati-valley',
    name: 'Parvati Valley',
    group: 'himalaya',
    area: 'Kullu district, Himachal Pradesh',
    region: PARVATI_REGIONS,
    status: 'coming-soon',
    tagline: 'Follow the river into the mountains',
    shortDesc: 'Pine forests, river villages, hot springs and some of the Himalayas’ most loved trails, from Bhuntar to the glaciers.',
    longDesc:
      'The Parvati river runs from the glaciers above Mantalai down to Bhuntar, and the valley it carves holds Kasol, Manikaran, Pulga, Kalga, Tosh and the Kheerganga trail. Travel here is about moving slowly between villages — a few nights by the river, a few up in the forest, and a trek if you have the legs for it.',
    heroImage: unsplash('1652501834567-937de29c4533'),
    gallery: [unsplash('1652501834567-937de29c4533'), unsplash('1581791534721-e599df4417f7'), unsplash('1546180801-a9b3dd6ad440')],
    altitude: '1,500 – 4,000+ m',
    bestSeason: ['March', 'April', 'May', 'June', 'September', 'October', 'November'],
    nearestTransport: 'Bhuntar Airport (Kullu) at the mouth of the valley',
    lat: 32.02,
    lng: 77.38,
  },
  {
    slug: 'kheerganga',
    name: 'Kheerganga',
    group: 'himalaya',
    area: 'Parvati Valley, Himachal Pradesh',
    region: ['Kheerganga'],
    status: 'coming-soon',
    tagline: 'A meadow and hot spring at the end of the trail',
    shortDesc: 'A high meadow reached by a full day’s trek through forest and waterfalls, with a natural hot spring at the top.',
    longDesc:
      'The trail to Kheerganga starts near Barshaini and climbs roughly 12 km through villages, forest and waterfalls to an open meadow with a natural hot-spring pool. Most people walk up in a day, spend the night under the stars and come down the next morning.',
    heroImage: unsplash('1642474606747-76312351789d'),
    gallery: [unsplash('1642474606747-76312351789d')],
    altitude: '~2,950 m',
    bestSeason: ['May', 'June', 'September', 'October'],
    nearestTransport: 'Trailhead near Barshaini, ~60 km from Bhuntar Airport',
    lat: 31.9953,
    lng: 77.5116,
  },
  {
    slug: 'manikaran',
    name: 'Manikaran',
    group: 'himalaya',
    area: 'Parvati Valley, Himachal Pradesh',
    region: ['Manikaran'],
    status: 'coming-soon',
    tagline: 'Hot springs, gurudwara and temples',
    shortDesc: 'A pilgrim town where hot springs steam into the Parvati, home to a gurudwara and temples that welcome every traveller.',
    longDesc:
      'Manikaran, a few kilometres from Kasol, is known for its geothermal springs, its gurudwara with a free community kitchen (langar), and its Shiva and Ram temples. The river runs fast and cold right beside pools of steaming water.',
    heroImage: unsplash('1675515642414-d99b23e2d95f'),
    gallery: [unsplash('1675515642414-d99b23e2d95f')],
    altitude: '~1,760 m',
    bestSeason: ['March', 'April', 'May', 'June', 'September', 'October', 'November'],
    nearestTransport: 'Bhuntar Airport (Kullu), ~35 km',
    lat: 32.0271,
    lng: 77.3485,
  },
  {
    slug: 'malana',
    name: 'Malana',
    group: 'himalaya',
    area: 'Malana valley, Himachal Pradesh',
    region: ['Malana'],
    status: 'coming-soon',
    tagline: 'An ancient village with its own customs',
    shortDesc: 'One of the oldest villages in the Himalayas, with its own council and customs. Visitors keep to the paths and don’t touch walls, temples or people.',
    longDesc:
      'Malana sits in a side valley above the Parvati, reached by road to the dam and then an uphill walk. The village governs itself through its own council and has strict customs for outsiders: stay on marked paths, and do not touch houses, temples or residents. Visit respectfully, with a local guide if possible.',
    heroImage: unsplash('1652379379235-652d2a6d65e8'),
    gallery: [unsplash('1652379379235-652d2a6d65e8')],
    altitude: '~2,650 m',
    bestSeason: ['April', 'May', 'June', 'September', 'October'],
    nearestTransport: 'Bhuntar Airport (Kullu), ~45 km via Jari',
    lat: 32.0629,
    lng: 77.2616,
  },

  // ── Kerala: Western Ghats (live inventory) ──
  {
    slug: 'munnar',
    name: 'Munnar',
    group: 'kerala',
    area: 'Idukki, Kerala',
    region: ['Munnar', 'Suryanelli'],
    status: 'live',
    tagline: DEFAULT_DESTINATION_CONTENT.munnar?.badge || '★ TOP VERIFIED CAMPS',
    shortDesc:
      'High-altitude ridge glamping above rolling cloud beds, 4x4 sunrise summit convoys and starlit campfire nights across Suryanelli & Kolukkumalai.',
    longDesc: DEFAULT_DESTINATION_CONTENT.munnar?.subtitle || '',
    heroImage: '/images/munnar-mist-valley-wide.jpg',
    gallery: ['/images/munnar-mist-valley-wide.jpg', '/images/high-altitude-ridge-tent.jpg', '/images/kolukkumalai-sunrise-peak-glow.jpg'],
    altitude: '5,400 – 7,900 FT',
    bestSeason: ['September', 'October', 'November', 'December', 'January', 'February'],
    nearestTransport: 'Cochin International Airport, ~130 km · Aluva Rail, ~110 km',
    lat: 10.0889,
    lng: 77.0595,
  },
  {
    slug: 'vagamon',
    name: 'Vagamon',
    group: 'kerala',
    area: 'Idukki, Kerala',
    region: ['Vagamon'],
    status: 'coming-soon',
    tagline: DEFAULT_DESTINATION_CONTENT.vagamon?.badge || '★ SECLUDED PINE VALLEY',
    shortDesc: 'Whispering pine groves, misty valley walks and cozy alpine campfire nights — opening soon.',
    longDesc: DEFAULT_DESTINATION_CONTENT.vagamon?.subtitle || '',
    heroImage: '/images/high-altitude-ridge-tent.jpg',
    gallery: ['/images/high-altitude-ridge-tent.jpg'],
    altitude: '3,800 FT',
    bestSeason: ['October', 'November', 'December', 'January'],
    nearestTransport: 'Kottayam Rail, ~65 km',
    lat: 9.6858,
    lng: 76.9081,
  },
  {
    slug: 'wayanad',
    name: 'Wayanad',
    group: 'kerala',
    area: 'Wayanad, Kerala',
    region: ['Wayanad'],
    status: 'coming-soon',
    tagline: DEFAULT_DESTINATION_CONTENT.wayanad?.badge || '★ 900 KANDI & CHEMBRA PEAK',
    shortDesc: 'Mist-covered rainforest canopies, glass bridge trails and mountain stream pools — opening soon.',
    longDesc: DEFAULT_DESTINATION_CONTENT.wayanad?.subtitle || '',
    heroImage: '/images/chinnakanal-waterfalls.jpg',
    gallery: ['/images/chinnakanal-waterfalls.jpg'],
    altitude: '2,100 FT',
    bestSeason: ['October', 'November', 'December', 'January', 'February'],
    nearestTransport: 'Kozhikode Airport, ~95 km',
    lat: 11.6854,
    lng: 76.132,
  },
];

// Single gate controlling visibility of any destination marked status: 'demo'.
// Never check the env var anywhere else.
function isDemoContentEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_DEMO_DESTINATIONS === 'true';
}

export function getVisibleDestinations() {
  const demoEnabled = isDemoContentEnabled();
  return ALL_DESTINATIONS.filter((d) => d.status !== 'demo' || demoEnabled);
}

export function getAllDestinationSlugs() {
  return getVisibleDestinations().map((d) => d.slug);
}

export function getDestinationBySlug(slug) {
  return ALL_DESTINATIONS.find((d) => d.slug === slug) || null;
}

export function getDestinationsByGroup(group) {
  return getVisibleDestinations().filter((d) => d.group === group);
}

export function getDestinationArea(destination) {
  return destination?.area || DESTINATION_GROUPS[destination?.group]?.state || '';
}

// Real stays in a destination, matched on the camp's admin-entered `region` (case-insensitive).
// Callers pass the camp list (server: getAllCamps(); client: useLiveCamps()) — this module
// deliberately doesn't import campsData, so the site header stays light.
export function getCampsForDestination(destination, camps = []) {
  if (!destination || !destination.region || destination.region.length === 0) return [];
  const regions = destination.region.map((r) => r.toLowerCase());
  const list = camps || [];
  return list.filter((c) => c && regions.includes(String(c.region || '').trim().toLowerCase()));
}

// Honest, computed stay counts instead of an asserted marketing number.
export function getStaysCountForDestination(destination, camps) {
  return getCampsForDestination(destination, camps).length;
}
