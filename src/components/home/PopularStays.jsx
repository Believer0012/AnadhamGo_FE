'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Info } from 'lucide-react';
import StayCard from '../common/StayCard';
import Rail, { RailControls, useRail } from '../common/Rail';
import { STAY_TYPES, getDiscoverStays } from '../../lib/stays';

const REGIONS = [
  { value: 'himalaya', label: 'Parvati Valley' },
  { value: 'kerala', label: 'Munnar, Kerala' },
];

/** "Stay somewhere worth remembering" — stays rail with region + type filters. */
export default function PopularStays({ camps }) {
  const rail = useRail();
  const allStays = useMemo(() => getDiscoverStays(camps), [camps]);
  const hasHimalaya = allStays.some((s) => s.group === 'himalaya');
  const [region, setRegion] = useState(hasHimalaya ? 'himalaya' : 'kerala');
  const [type, setType] = useState('all');
  const userPicked = useRef(false);

  // Admin-synced camps can arrive after first render; lead with the Parvati Valley once it has stays
  useEffect(() => {
    if (hasHimalaya && !userPicked.current) setRegion('himalaya');
  }, [hasHimalaya]);

  const inRegion = allStays.filter((s) => s.group === region);
  const types = STAY_TYPES.filter((t) => inRegion.some((s) => s.type === t.value));
  const stays = type === 'all' ? inRegion : inRegion.filter((s) => s.type === type);
  const showsSamples = stays.some((s) => s.isSample);

  // When the list changes (filters, or admin camps arriving and inserting a real stay first),
  // start the rail from the first card instead of letting scroll-snap hold the old position.
  const firstId = stays[0]?.id;
  useEffect(() => {
    if (rail.ref.current) rail.ref.current.scrollLeft = 0;
  }, [firstId, rail.ref]);

  const pickRegion = (value) => {
    userPicked.current = true;
    setRegion(value);
    setType('all');
  };

  return (
    <section id="stays" className="ah-section ah-section--alt" aria-labelledby="stays-title">
      <div className="ah-container">
        <div className="ah-section-head">
          <div>
            <span className="ah-eyebrow">Popular mountain stays</span>
            <h2 id="stays-title" className="ah-h2" style={{ marginTop: 14 }}>
              Stay somewhere worth remembering
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link href={`/stays?region=${region}`} className="ah-link-arrow">
              All stays <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <RailControls rail={rail} label="stays" />
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 24 }}>
          <div className="ah-segment" role="group" aria-label="Region">
            {REGIONS.map((r) => (
              <button key={r.value} type="button" aria-pressed={region === r.value} onClick={() => pickRegion(r.value)}>
                {r.label}
              </button>
            ))}
          </div>
          {types.length > 1 ? (
            <div className="ah-chips ah-chips--scroll" role="group" aria-label="Stay type" style={{ flex: '1 1 320px', margin: 0, padding: 0 }}>
              <button type="button" className="ah-chip" aria-pressed={type === 'all'} onClick={() => setType('all')}>
                All
              </button>
              {types.map((t) => (
                <button key={t.value} type="button" className="ah-chip" aria-pressed={type === t.value} onClick={() => setType(t.value)}>
                  {t.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {stays.length > 0 ? (
          <Rail rail={rail} label="Stays">
            {stays.map((s) => (
              <StayCard key={s.id} stay={s} />
            ))}
          </Rail>
        ) : (
          <p style={{ color: 'var(--ah-muted)', padding: '24px 0' }}>Verified stays here are opening soon.</p>
        )}

        {showsSamples ? (
          <p className="ah-sample-note">
            <Info size={14} aria-hidden="true" /> Listings marked “Sample” are placeholder previews and can’t be booked yet.
          </p>
        ) : null}
      </div>
    </section>
  );
}
