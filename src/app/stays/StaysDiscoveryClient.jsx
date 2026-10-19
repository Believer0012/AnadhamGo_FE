'use client';

import React, { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Info, SlidersHorizontal } from 'lucide-react';
import StayCard from '../../components/common/StayCard';
import BottomSheet from '../../components/common/BottomSheet';
import TripDatesBar from '../../components/common/TripDatesBar';
import { useLiveCamps } from '../../hooks/useLiveCamps';
import { STAY_TYPES, TRIP_CATEGORIES, getDiscoverStays, sortRecommended } from '../../lib/stays';
import { getVisibleDestinations } from '../../lib/destinationsData';

const SORTS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
];

const GRID = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 270px), 1fr))', gap: 20 };

export default function StaysDiscoveryClient() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const camps = useLiveCamps();
  const [sheetOpen, setSheetOpen] = useState(false);

  const region = params.get('region') || 'all'; // 'all' | 'himalaya' | 'kerala' | <destination slug>
  const type = params.get('type') || 'all';
  const category = params.get('category') || 'all';
  const sort = params.get('sort') || 'recommended';

  const setParam = (key, value) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === 'all' || (key === 'sort' && value === 'recommended')) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const allStays = useMemo(() => getDiscoverStays(camps), [camps]);
  const destinations = useMemo(() => getVisibleDestinations(), []);
  const destinationOptions = destinations.filter((d) => allStays.some((s) => s.destination === d.slug));

  const stays = useMemo(() => {
    let list = allStays.filter((s) => {
      if (region === 'himalaya' || region === 'kerala') { if (s.group !== region) return false; }
      else if (region !== 'all' && s.destination !== region) return false;
      if (type !== 'all' && s.type !== type) return false;
      if (category !== 'all' && !s.categories?.includes(category)) return false;
      return true;
    });
    if (sort === 'recommended') list = sortRecommended(list);
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'rating') list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [allStays, region, type, category, sort]);

  const activeCategory = TRIP_CATEGORIES.find((c) => c.value === category);
  const filtersActive = region !== 'all' || type !== 'all' || category !== 'all';

  const controls = (
    <>
        <div className="ah-stays-toolbar">
          <label className="ah-select">
            <span>Where</span>
            <select value={region} onChange={(e) => setParam('region', e.target.value)}>
              <option value="all">All destinations</option>
              <optgroup label="Himachal Pradesh">
                <option value="himalaya">All of Parvati Valley</option>
                {destinationOptions.filter((d) => d.group === 'himalaya').map((d) => (
                  <option key={d.slug} value={d.slug}>{d.name}</option>
                ))}
              </optgroup>
              <optgroup label="Kerala">
                <option value="kerala">All of Kerala</option>
                {destinationOptions.filter((d) => d.group === 'kerala').map((d) => (
                  <option key={d.slug} value={d.slug}>{d.name}</option>
                ))}
              </optgroup>
            </select>
          </label>
          <label className="ah-select">
            <span>Sort</span>
            <select value={sort} onChange={(e) => setParam('sort', e.target.value)}>
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
        </div>
  
        <div className="ah-chips ah-chips--scroll" role="group" aria-label="Stay type" style={{ marginBottom: 10 }}>
          <button type="button" className="ah-chip" aria-pressed={type === 'all'} onClick={() => setParam('type', 'all')}>All stays</button>
          {STAY_TYPES.map((t) => (
            <button key={t.value} type="button" className="ah-chip" aria-pressed={type === t.value} onClick={() => setParam('type', t.value)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="ah-chips ah-chips--scroll" role="group" aria-label="Trip type" style={{ marginBottom: 28 }}>
          {TRIP_CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              className="ah-chip"
              aria-pressed={category === c.value}
              onClick={() => setParam('category', category === c.value ? 'all' : c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>
    </>
  );

  const activeCount = [region !== 'all', type !== 'all', category !== 'all'].filter(Boolean).length;

  return (
    <>
      <TripDatesBar tone="light" className="ah-stays-dates" />
      <div className="ah-filters-desktop">{controls}</div>
      <div className="ah-filters-mobile">
        <button type="button" className="ah-btn ah-btn--forest ah-btn--sm" onClick={() => setSheetOpen(true)} aria-haspopup="dialog">
          <SlidersHorizontal size={16} aria-hidden="true" /> Filters & sort{activeCount ? ` · ${activeCount}` : ''}
        </button>
        {filtersActive ? (
          <button type="button" className="ah-btn ah-btn--ghost ah-btn--sm" onClick={() => router.replace(pathname, { scroll: false })}>Clear</button>
        ) : null}
      </div>
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters & sort"
        footer={
          <>
            <button type="button" className="ah-btn ah-btn--ghost" onClick={() => router.replace(pathname, { scroll: false })}>Clear all</button>
            <button type="button" className="ah-btn ah-btn--primary" onClick={() => setSheetOpen(false)}>
              Show {stays.length} {stays.length === 1 ? 'stay' : 'stays'}
            </button>
          </>
        }
      >
        {controls}
      </BottomSheet>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <p role="status" style={{ fontWeight: 700, color: 'var(--ah-ink)' }}>
          <SlidersHorizontal size={15} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 6 }} />
          {stays.length} {stays.length === 1 ? 'stay' : 'stays'}
          {activeCategory ? ` for ${activeCategory.label.toLowerCase()}` : ''}
        </p>
        {filtersActive ? (
          <button type="button" className="ah-btn ah-btn--ghost ah-btn--sm" onClick={() => router.replace(pathname, { scroll: false })}>
            Clear filters
          </button>
        ) : null}
      </div>

      <h2 className="sr-only">Stays</h2>
      {stays.length > 0 ? (
        <div style={GRID}>
          {stays.map((s) => (
            <StayCard key={s.id} stay={s} sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw" />
          ))}
        </div>
      ) : (
        <div className="ah-empty">
          <p>No stays match these filters yet.</p>
          <button type="button" className="ah-btn ah-btn--forest ah-btn--sm" onClick={() => router.replace(pathname, { scroll: false })}>
            Show all stays
          </button>
        </div>
      )}

      {stays.some((s) => s.isSample) ? (
        <p className="ah-sample-note" style={{ marginTop: 24 }}>
          <Info size={14} aria-hidden="true" /> Listings marked “Sample” are placeholder previews and can’t be booked yet.
        </p>
      ) : null}
    </>
  );
}
