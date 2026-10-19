'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Info, SlidersHorizontal } from 'lucide-react';
import ExperienceCard from '../../components/common/ExperienceCard';
import BottomSheet from '../../components/common/BottomSheet';
import { DIFFICULTIES, DURATION_FILTERS, THINGS_TO_DO, getExperiences } from '../../lib/experiences';
import { getVisibleDestinations } from '../../lib/destinationsData';
import { waLink } from '../../lib/whatsapp';

const SORTS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'rating', label: 'Top rated' },
  { value: 'duration', label: 'Shortest first' },
];

const GRID = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 270px), 1fr))', gap: 20 };

export default function ExperiencesDiscoveryClient() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  const where = params.get('where') || 'all';
  const activity = params.get('activity') || 'all';
  const difficulty = params.get('difficulty') || 'all';
  const duration = params.get('duration') || 'all';
  const sort = params.get('sort') || 'recommended';

  const setParam = (key, value) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === 'all' || (key === 'sort' && value === 'recommended')) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const clearAll = () => router.replace(pathname, { scroll: false });

  const all = useMemo(() => getExperiences(), []);
  const destinations = useMemo(() => getVisibleDestinations().filter((d) => all.some((e) => e.destination === d.slug)), [all]);
  const activities = THINGS_TO_DO.filter((t) => all.some((e) => e.activity === t.key));

  const list = useMemo(() => {
    const durationTest = DURATION_FILTERS.find((d) => d.value === duration)?.test;
    let out = all.filter((e) =>
      (where === 'all' || e.destination === where) &&
      (activity === 'all' || e.activity === activity) &&
      (difficulty === 'all' || e.difficulty === difficulty) &&
      (!durationTest || durationTest(e.durationHours))
    );
    if (sort === 'price-asc') out = [...out].sort((a, b) => a.price - b.price);
    if (sort === 'rating') out = [...out].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === 'duration') out = [...out].sort((a, b) => a.durationHours - b.durationHours);
    return out;
  }, [all, where, activity, difficulty, duration, sort]);

  const filtersActive = where !== 'all' || activity !== 'all' || difficulty !== 'all' || duration !== 'all';

  if (all.length === 0) {
    return (
      <div className="ah-empty" style={{ maxWidth: 600 }}>
        <p style={{ color: 'var(--ah-ink)', fontWeight: 700 }}>Guided experiences in the Parvati Valley are launching soon.</p>
        <p>Treks, village walks, stargazing and food experiences are on the way. Want something now? We can help you plan it.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href={waLink('Hi Aanandham! I would like to plan a trek / activity in the Parvati Valley.')} target="_blank" rel="noopener noreferrer" className="ah-btn ah-btn--forest ah-btn--sm">
            Plan on WhatsApp
          </a>
          <Link href="/destinations" className="ah-btn ah-btn--ghost ah-btn--sm">Explore destinations</Link>
        </div>
      </div>
    );
  }

  const controls = (
    <>
        <div className="ah-stays-toolbar">
          <label className="ah-select">
            <span>Where</span>
            <select value={where} onChange={(e) => setParam('where', e.target.value)}>
              <option value="all">Anywhere in the valley</option>
              {destinations.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
            </select>
          </label>
          <label className="ah-select">
            <span>Difficulty</span>
            <select value={difficulty} onChange={(e) => setParam('difficulty', e.target.value)}>
              <option value="all">Any level</option>
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <label className="ah-select">
            <span>Duration</span>
            <select value={duration} onChange={(e) => setParam('duration', e.target.value)}>
              <option value="all">Any length</option>
              {DURATION_FILTERS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </label>
          <label className="ah-select">
            <span>Sort</span>
            <select value={sort} onChange={(e) => setParam('sort', e.target.value)}>
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
        </div>
  
        <div className="ah-chips ah-chips--scroll" role="group" aria-label="Activity" style={{ marginBottom: 28 }}>
          <button type="button" className="ah-chip" aria-pressed={activity === 'all'} onClick={() => setParam('activity', 'all')}>All activities</button>
          {activities.map((t) => (
            <button key={t.key} type="button" className="ah-chip" aria-pressed={activity === t.key} onClick={() => setParam('activity', t.key)}>
              {t.label}
            </button>
          ))}
        </div>
    </>
  );
  const activeCount = [where, activity, difficulty, duration].filter((v) => v !== 'all').length;

  return (
    <>
      <div className="ah-filters-desktop">{controls}</div>
      <div className="ah-filters-mobile">
        <button type="button" className="ah-btn ah-btn--forest ah-btn--sm" onClick={() => setSheetOpen(true)} aria-haspopup="dialog">
          <SlidersHorizontal size={16} aria-hidden="true" /> Filters & sort{activeCount ? ` · ${activeCount}` : ''}
        </button>
        {filtersActive ? <button type="button" className="ah-btn ah-btn--ghost ah-btn--sm" onClick={clearAll}>Clear</button> : null}
      </div>
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters & sort"
        footer={
          <>
            <button type="button" className="ah-btn ah-btn--ghost" onClick={clearAll}>Clear all</button>
            <button type="button" className="ah-btn ah-btn--primary" onClick={() => setSheetOpen(false)}>
              Show {list.length} {list.length === 1 ? 'experience' : 'experiences'}
            </button>
          </>
        }
      >
        {controls}
      </BottomSheet>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <p role="status" style={{ fontWeight: 700 }}>
          <SlidersHorizontal size={15} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 6 }} />
          {list.length} {list.length === 1 ? 'experience' : 'experiences'}
        </p>
        {filtersActive ? <button type="button" className="ah-btn ah-btn--ghost ah-btn--sm" onClick={clearAll}>Clear filters</button> : null}
      </div>

      <h2 className="sr-only">Experiences</h2>
      {list.length > 0 ? (
        <div style={GRID}>
          {list.map((e) => (
            <ExperienceCard key={e.id} experience={e} sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw" />
          ))}
        </div>
      ) : (
        <div className="ah-empty">
          <p>No experiences match these filters yet.</p>
          <button type="button" className="ah-btn ah-btn--forest ah-btn--sm" onClick={clearAll}>Show all experiences</button>
        </div>
      )}

      {list.some((e) => e.isSample) ? (
        <p className="ah-sample-note" style={{ marginTop: 24 }}>
          <Info size={14} aria-hidden="true" /> Experiences marked “Sample” are placeholder previews and can’t be booked yet.
        </p>
      ) : null}
    </>
  );
}
