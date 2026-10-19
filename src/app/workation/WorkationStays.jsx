'use client';

import React, { useMemo } from 'react';
import { Info } from 'lucide-react';
import StayCard from '../../components/common/StayCard';
import { useLiveCamps } from '../../hooks/useLiveCamps';
import { getDiscoverStays, sortRecommended } from '../../lib/stays';
import { waLink } from '../../lib/whatsapp';

const GRID = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 270px), 1fr))', gap: 20 };

/** Stays tagged for workation (real or sample). */
export default function WorkationStays() {
  const camps = useLiveCamps();
  const stays = useMemo(
    () => sortRecommended(getDiscoverStays(camps).filter((s) => s.categories?.includes('workation'))),
    [camps]
  );

  if (stays.length === 0) {
    return (
      <div className="ah-empty" style={{ maxWidth: 560 }}>
        <p style={{ color: 'var(--ah-ink)', fontWeight: 700 }}>Workation-ready stays are being added.</p>
        <p>Tell us your dates and how you work — we’ll suggest places with the connectivity you need.</p>
        <a href={waLink('Hi Aanandham! I am looking for a workation stay in the Parvati Valley.')} target="_blank" rel="noopener noreferrer" className="ah-btn ah-btn--forest ah-btn--sm">
          Ask on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <>
      <div style={GRID}>
        {stays.map((s) => <StayCard key={s.id} stay={s} sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw" />)}
      </div>
      {stays.some((s) => s.isSample) ? (
        <p className="ah-sample-note" style={{ marginTop: 20 }}>
          <Info size={14} aria-hidden="true" /> Listings marked “Sample” are placeholder previews and can’t be booked yet.
        </p>
      ) : null}
    </>
  );
}
