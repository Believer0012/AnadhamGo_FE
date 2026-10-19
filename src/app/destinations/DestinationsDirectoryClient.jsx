'use client';

import React, { useMemo, useState } from 'react';
import SiteHeader from '../../components/SiteHeader';
import Footer from '../../components/Footer';
import DestinationCard from '../../components/common/DestinationCard';
import { DESTINATION_GROUPS, getStaysCountForDestination } from '../../lib/destinationsData';
import { getExperiencesForDestination } from '../../lib/experiences';
import { useLiveCamps } from '../../hooks/useLiveCamps';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'himalaya', label: 'Parvati Valley' },
  { value: 'kerala', label: 'Western Ghats' },
  { value: 'live', label: 'Stays open now' },
];

const GRID = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 270px), 1fr))',
  gap: 20,
};

export default function DestinationsDirectoryClient({ destinations = [] }) {
  const [filter, setFilter] = useState('all');
  const camps = useLiveCamps();

  const groups = useMemo(() => {
    const visible = destinations.filter((d) => {
      if (filter === 'all') return true;
      if (filter === 'live') return getStaysCountForDestination(d, camps) > 0;
      return d.group === filter;
    });
    return Object.entries(DESTINATION_GROUPS)
      .map(([key, meta]) => ({ key, ...meta, items: visible.filter((d) => d.group === key) }))
      .filter((g) => g.items.length > 0);
  }, [destinations, filter, camps]);

  return (
    <>
      <SiteHeader activePage="destinations" />
      <main id="main-content">
        <section className="ah-section--dark" style={{ padding: 'calc(var(--ah-header-h) + 56px) 0 48px' }}>
          <div className="ah-container">
            <span className="ah-eyebrow" style={{ color: '#F1B893' }}>Destinations</span>
            <h1 className="ah-h1" style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', margin: '16px 0 16px', maxWidth: '16ch' }}>
              Pick a valley. Find your pace.
            </h1>
            <p style={{ color: 'var(--ah-on-dark-muted)', fontSize: 17, lineHeight: 1.6, maxWidth: 560 }}>
              Villages, trails and river towns across the Parvati Valley — plus the Western Ghats camps you can book
              today.
            </p>
            <div role="group" aria-label="Filter destinations" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 28 }}>
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  aria-pressed={filter === f.value}
                  className={`ah-btn ah-btn--sm ${filter === f.value ? 'ah-btn--primary' : 'ah-btn--ghost-light'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="ah-section" style={{ paddingTop: 56 }}>
          <div className="ah-container" style={{ display: 'grid', gap: 64 }}>
            {groups.length === 0 ? (
              <p style={{ color: 'var(--ah-muted)' }}>No destinations match this filter yet.</p>
            ) : (
              groups.map((g) => (
                <section key={g.key} aria-labelledby={`group-${g.key}`}>
                  <h2 id={`group-${g.key}`} className="ah-h3" style={{ fontSize: 26, marginBottom: 6 }}>
                    {g.label}
                  </h2>
                  <p style={{ color: 'var(--ah-muted)', marginBottom: 24 }}>{g.state}</p>
                  <div style={GRID}>
                    {g.items.map((d) => (
                      <DestinationCard
                        key={d.slug}
                        destination={d}
                        staysCount={getStaysCountForDestination(d, camps)} experiencesCount={getExperiencesForDestination(d).length}
                        sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
