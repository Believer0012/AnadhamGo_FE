'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BedDouble, Sparkles, CalendarDays, Mountain } from 'lucide-react';
import { getDestinationsByGroup } from '../../lib/destinationsData';
import { getDiscoverStays } from '../../lib/stays';
import { getExperiencesForDestination } from '../../lib/experiences';
import { getEvents } from '../../lib/events';

// Projection box for the Parvati Valley (schematic — positions come from real coordinates)
const BOX = { lngMin: 77.24, lngMax: 77.53, latMin: 31.985, latMax: 32.075 };
const pos = (lat, lng) => ({
  x: ((lng - BOX.lngMin) / (BOX.lngMax - BOX.lngMin)) * 100,
  y: ((BOX.latMax - lat) / (BOX.latMax - BOX.latMin)) * 100,
});

// Label placement so neighbouring pins (Pulga/Kalga) don't collide
const LABEL_SIDE = { kalga: 'left', pulga: 'below', tosh: 'right', kheerganga: 'left', malana: 'right', kasol: 'below', manikaran: 'above' };

/**
 * Interactive schematic map of the Parvati Valley. Pins are real buttons (keyboard accessible).
 * `current` highlights a destination (e.g. on its own page); `camps` = admin-synced camp list.
 */
export default function ValleyMap({ current = null, camps = [], compact = false }) {
  const places = useMemo(() => getDestinationsByGroup('himalaya').filter((d) => d.slug !== 'parvati-valley' && d.lat && d.lng), []);
  const [selected, setSelected] = useState(current || 'pulga');

  const info = useMemo(() => {
    const d = places.find((p) => p.slug === selected);
    if (!d) return null;
    const stays = getDiscoverStays(camps).filter((s) => s.destination === d.slug);
    return {
      d,
      stays: stays.length,
      realStays: stays.filter((s) => !s.isSample).length,
      experiences: getExperiencesForDestination(d).length,
      events: getEvents().filter((e) => e.destination === d.slug).length,
    };
  }, [places, selected, camps]);

  return (
    <div className={`ah-map ${compact ? 'ah-map--compact' : ''}`}>
      <div className="ah-map__canvas">
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true" className="ah-map__svg">
          {/* contour hints */}
          {[0, 1, 2, 3].map((i) => (
            <ellipse key={i} cx={78} cy={18} rx={16 + i * 9} ry={9 + i * 6} className="ah-map__contour" />
          ))}
          {/* Parvati river (schematic) */}
          <path className="ah-map__river" d="M0,58 C12,53 20,47 25.9,43.4 S34,34 37.4,31.9 S52,33 60,41 S66,47 69.4,47.6 S85,51 93.7,53.1 L100,55" />
          {/* Tosh nala */}
          <path className="ah-map__river ah-map__river--thin" d="M69.4,47.6 C71,45 72.6,42 74.2,39.9 S88,33 100,30" />
          {/* Malana side trail */}
          <path className="ah-map__trail" d="M12,53 C10,40 9,24 7.4,8.1" />
        </svg>

        {places.map((d) => {
          const p = pos(d.lat, d.lng);
          const isSel = d.slug === selected;
          return (
            <button
              key={d.slug}
              type="button"
              className={`ah-map__pin ah-map__pin--${LABEL_SIDE[d.slug] || 'right'}`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              aria-pressed={isSel}
              aria-label={`${d.name}, ${d.altitude}`}
              onClick={() => setSelected(d.slug)}
            >
              <span className="ah-map__dot" aria-hidden="true" />
              <span className="ah-map__label">{d.name}</span>
            </button>
          );
        })}
        
      </div>

      {info ? (
        <div className="ah-map__panel" aria-live="polite">
          <p className="ah-eyebrow" style={{ color: '#F1B893' }}>{info.d.area}</p>
          <h3 className="ah-map__title">{info.d.name}</h3>
          <p className="ah-map__tagline">{info.d.tagline}</p>
          <ul className="ah-map__stats">
            <li><Mountain size={15} aria-hidden="true" /> {info.d.altitude}</li>
            <li><BedDouble size={15} aria-hidden="true" /> {info.stays ? `${info.stays} ${info.stays === 1 ? 'stay' : 'stays'}` : 'Stays opening soon'}</li>
            <li><Sparkles size={15} aria-hidden="true" /> {info.experiences ? `${info.experiences} ${info.experiences === 1 ? 'experience' : 'experiences'}` : 'Experiences coming soon'}</li>
            <li><CalendarDays size={15} aria-hidden="true" /> {info.events ? `${info.events} upcoming ${info.events === 1 ? 'event' : 'events'}` : 'No events listed yet'}</li>
          </ul>
          <Link href={`/destinations/${info.d.slug}`} className="ah-btn ah-btn--primary ah-btn--sm">
            Explore {info.d.name} <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
