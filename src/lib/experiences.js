// ── EXPERIENCES MODEL ──
// Experiences = guided activities (treks, walks, food, stargazing…).
// There is no real experiences backend yet: REAL_EXPERIENCES is the hook-in point for it
// (same shape as the samples, with isSample: false and a real `href`). Sample experiences
// appear only when isSampleDataEnabled().
import { getVisibleDestinations } from './destinationsData';
import { isSampleDataEnabled, unsplash } from './sample/sampleConfig';
import { SAMPLE_EXPERIENCES } from './sample/sampleExperiences';

export const REAL_EXPERIENCES = [];

// "Things to do" — factual, general guidance about the valley (not listings).
// `activity` keys also drive the ?activity= filter on /experiences. When no experience exists for an
// activity yet, links go to `fallbackHref` (a relevant destination or stay filter) instead of an empty list.
export const THINGS_TO_DO = [
  { key: 'trekking', fallbackHref: '/destinations/kheerganga', label: 'Trekking', icon: 'Footprints', image: unsplash('1642474606747-76312351789d', 900),
    blurb: 'Kheerganga is the classic day climb; Tosh and the high meadows beyond go further.' },
  { key: 'hiking', fallbackHref: '/destinations/pulga', label: 'Hiking', icon: 'Trees',
    blurb: 'Short forest trails link Pulga, Kalga and Tosh — most take under two hours.' },
  { key: 'camping', fallbackHref: '/stays?category=camping', label: 'Camping', icon: 'Tent',
    blurb: 'Riverside sites near Kasol, meadows above Kalga and the hot-spring meadow at Kheerganga.' },
  { key: 'stargazing', fallbackHref: '/stays?category=stargazing', label: 'Stargazing', icon: 'Telescope',
    blurb: 'Past Barshaini there is little light pollution; clear autumn nights are the best.' },
  { key: 'waterfalls', fallbackHref: '/destinations/kheerganga', label: 'Waterfalls', icon: 'Droplets',
    blurb: 'Rudra Nag on the Kheerganga trail, plus seasonal falls around Tosh and Pulga.' },
  { key: 'village-walks', fallbackHref: '/destinations/tosh', label: 'Village walks', icon: 'Home',
    blurb: 'Wooden houses, orchards and temples in Pulga, Kalga, Tosh and Chalal.' },
  { key: 'cafes', fallbackHref: '/destinations/kasol', label: 'Cafés', icon: 'Coffee',
    blurb: 'Kasol’s riverside cafés and the small bakeries up in Pulga and Tosh.' },
  { key: 'local-food', fallbackHref: '/destinations/manikaran', label: 'Local food', icon: 'UtensilsCrossed',
    blurb: 'Siddu, rajma-chawal, river trout — and the langar at the Manikaran gurudwara.' },
  { key: 'photography', fallbackHref: '/stays?category=photography', label: 'Photography', icon: 'Camera',
    blurb: 'Deodar forests, snow peaks from Tosh and the steam over Manikaran’s hot springs.' },
  { key: 'music', fallbackHref: '/stays?category=friends', label: 'Music', icon: 'Music',
    blurb: 'Acoustic evenings around the fire at campsites and cafés across the valley.' },
  { key: 'wellness', fallbackHref: '/destinations/manikaran', label: 'Wellness', icon: 'Leaf',
    blurb: 'Hot springs at Manikaran and Kheerganga, and slow mornings in the quieter villages.' },
];

export const DIFFICULTIES = ['Easy', 'Moderate', 'Challenging'];

export const DURATION_FILTERS = [
  { value: 'short', label: 'Under 3 hours', test: (h) => h < 3 },
  { value: 'half', label: '3–6 hours', test: (h) => h >= 3 && h <= 6 },
  { value: 'long', label: 'Full day +', test: (h) => h > 6 },
];

/** All experiences, real first; destination metadata attached for cards. */
export function getExperiences({ includeSamples = isSampleDataEnabled() } = {}) {
  const destinations = getVisibleDestinations();
  const list = [...REAL_EXPERIENCES, ...(includeSamples ? SAMPLE_EXPERIENCES : [])];
  return list.map((e) => {
    const dest = destinations.find((d) => d.slug === e.destination);
    return {
      ...e,
      locationLabel: e.locationLabel || (dest ? `${dest.name}, ${dest.group === 'himalaya' ? 'Parvati Valley' : dest.area}` : ''),
      href: e.href || `/destinations/${e.destination}#experiences`,
      group: dest?.group || null,
    };
  });
}

export function getExperiencesForDestination(destination, experiences = getExperiences()) {
  if (!destination) return [];
  if (destination.slug === 'parvati-valley') return experiences.filter((e) => e.group === 'himalaya');
  return experiences.filter((e) => e.destination === destination.slug);
}
