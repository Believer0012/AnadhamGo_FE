'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { getDestinationsByGroup, getDestinationArea } from '../../lib/destinationsData';
import { saveTripIntent, readTripIntent } from '../../lib/tripIntent';

const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

// Remote Unsplash images can be requested at thumbnail size; local images are served as-is.
const thumb = (src) => (src.includes('images.unsplash.com') ? src.replace(/([?&])w=\d+/, '$1w=120') : src);

const GUEST_OPTIONS =Array.from({ length: 10 }, (_, i) => i + 1);

// Picking one of these fills "Where to?" and waits for dates; Explore then navigates.
// Guides, events and experiences don't need dates, so they open straight away.
const SELECTABLE_TYPES = new Set(['destination', 'stay']);

/**
 * Discovery search: destinations, stays, events and guides from real data.
 * Behaviour is identical in the hero and the header overlay.
 * Dates/guests are carried in the URL (?checkin=&checkout=&guests=) for the booking flow to pick up.
 */
export default function DiscoverySearch({ autoFocus = false, onNavigate, className = '' }) {
  const router = useRouter();
  const uid = useId();
  const listId = `${uid}-results`;
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const checkinRef = useRef(null);
  const searchModRef = useRef(null);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [guests, setGuests] = useState(2);
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState(null);

  // Start from the dates/guests already chosen this visit
  useEffect(() => {
    const trip = readTripIntent();
    if (!trip) return;
    if (trip.checkin) setCheckin(trip.checkin);
    if (trip.checkout) setCheckout(trip.checkout);
    if (trip.guests) setGuests(Math.min(10, trip.guests));
  }, []);

  const loadIndex = useCallback(() => {
    if (searchModRef.current) return;
    import('../../lib/searchIndex').then((mod) => {
      searchModRef.current = mod;
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
      loadIndex();
    }
  }, [autoFocus, loadIndex]);

  // Close the results when clicking outside
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const featured = useMemo(() => getDestinationsByGroup('himalaya').slice(0, 4), []);

  const results = useMemo(() => {
    if (!ready || !query.trim()) return null;
    return searchModRef.current.searchAll(query, { perGroup: 3 });
  }, [query, ready]);

  // Flattened option list used for keyboard navigation
  const options = useMemo(() => {
    if (!query.trim()) {
      return featured.map((d) => ({
        key: `destination-${d.slug}`,
        type: 'destination',
        title: d.name,
        subtitle: getDestinationArea(d),
        href: `/destinations/${d.slug}`,
        image: d.heroImage,
      }));
    }
    if (!results) return [];
    return results.groups.flatMap((g) =>
      g.items.map((item) => ({ ...item, key: `${item.type}-${item.id}` }))
    );
  }, [query, results, featured]);

  useEffect(() => setActiveIdx(-1), [query]);

  const withTripParams = (href) => {
    if (!href.startsWith('/destinations/') && !href.startsWith('/camps/') && href !== '/stays') return href;
    const params = new URLSearchParams();
    if (checkin) params.set('checkin', checkin);
    if (checkout) params.set('checkout', checkout);
    if (guests) params.set('guests', String(guests));
    const qs = params.toString();
    return qs ? `${href}?${qs}` : href;
  };

  const go = (href) => {
    // Remember dates/guests for the rest of the visit so property booking cards pre-fill them
    saveTripIntent({ checkin, checkout, guests });
    setOpen(false);
    onNavigate?.();
    router.push(withTripParams(href));
  };

  // Destinations/stays are picked, not opened: fill the field and move on to the dates
  const choose = (opt) => {
    if (!SELECTABLE_TYPES.has(opt.type)) return go(opt.href);
    setSelected(opt);
    setQuery(opt.title);
    setMessage('');
    setOpen(false);
    if (!checkin) {
      const el = checkinRef.current;
      el?.focus();
      try {
        el?.showPicker?.();
      } catch {
        // picker needs a user gesture in some browsers — focus alone is fine
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    if (checkin && checkout && checkout <= checkin) {
      setMessage('Check-out needs to be after check-in.');
      return;
    }
    // Enter on a highlighted suggestion picks it; the next Enter / Explore navigates
    if (open && activeIdx >= 0 && options[activeIdx]) return choose(options[activeIdx]);
    if (selected) return go(selected.href);
    if (!query.trim()) return go('/destinations');
    if (!results) return; // index still loading
    if (results.topDestination) return go(`/destinations/${results.topDestination.slug}`);
    const firstGroup = results.groups[0];
    if (firstGroup?.type === 'stay') return go('/stays');
    if (firstGroup) return go(firstGroup.items[0].href);
    setMessage(`Nothing matches “${query.trim()}” yet. Try Pulga, Kasol or Parvati Valley.`);
    setOpen(true);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIdx((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const optionId = (i) => `${uid}-opt-${i}`;
  let flatIdx = -1;

  const renderOption = (opt) => {
    flatIdx += 1;
    const i = flatIdx;
    return (
      <li
        key={opt.key || `${opt.type || 'opt'}-${opt.id ?? i}`}
        id={optionId(i)}
        role="option"
        aria-selected={i === activeIdx}
        className="ah-search__option"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => choose(opt)}
        onMouseEnter={() => setActiveIdx(i)}
      >
        {opt.image ? <img src={thumb(opt.image)} alt="" width="40" height="40" loading="lazy" /> : null}
        <span style={{ minWidth: 0 }}>
          <strong>{opt.title}</strong>
          <small>{opt.subtitle}</small>
        </span>
      </li>
    );
  };

  const showPanel = open && (options.length > 0 || message || (query.trim() && ready));

  return (
    <div ref={wrapRef} className={className} style={{ position: 'relative' }}>
      <form className="ah-search" role="search" aria-label="Search destinations, stays and experiences" onSubmit={handleSubmit}>
        <label className="ah-search__field ah-search__field--where">
          <span className="ah-search__label">Where to?</span>
          <input
            ref={inputRef}
            className="ah-search__input"
            type="text"
            placeholder="Pulga, Kasol, a stay or a trek…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
              setMessage('');
              setOpen(true);
            }}
            onFocus={() => {
              loadIndex();
              setOpen(true);
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={Boolean(showPanel)}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeIdx >= 0 ? optionId(activeIdx) : undefined}
            autoComplete="off"
            enterKeyHint="search"
          />
        </label>

        <label className="ah-search__field ah-search__field--checkin">
          <span className="ah-search__label">Check-in</span>
          <input
            ref={checkinRef}
            className="ah-search__input"
            type="date"
            min={todayISO()}
            value={checkin}
            onChange={(e) => {
              setCheckin(e.target.value);
              if (checkout && e.target.value && checkout <= e.target.value) setCheckout('');
            }}
          />
        </label>

        <label className="ah-search__field ah-search__field--checkout">
          <span className="ah-search__label">Check-out</span>
          <input
            className="ah-search__input"
            type="date"
            min={checkin || todayISO()}
            value={checkout}
            onChange={(e) => setCheckout(e.target.value)}
          />
        </label>

        <label className="ah-search__field ah-search__field--guests">
          <span className="ah-search__label">Guests</span>
          <select className="ah-search__input" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
            {GUEST_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n === 10 ? '10+ guests' : `${n} ${n === 1 ? 'guest' : 'guests'}`}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className="ah-btn ah-btn--primary ah-search__submit">
          <Search size={18} strokeWidth={2.4} aria-hidden="true" />
          Explore
        </button>
      </form>

      {showPanel ? (
        <div className="ah-search__results">
          {message ? (
            <p className="ah-search__empty" role="status">{message}</p>
          ) : null}

          {!query.trim() ? (
            <div className="ah-search__group">
              <div className="ah-search__group-head">
                <span>Popular in the Parvati Valley</span>
              </div>
              <ul role="listbox" id={listId} aria-label="Popular destinations" style={{ listStyle: 'none' }}>
                {options.map(renderOption)}
              </ul>
            </div>
          ) : results && results.groups.length > 0 ? (
            <ul role="listbox" id={listId} aria-label="Search results" style={{ listStyle: 'none' }}>
              {results.groups.map((g) => (
                <li key={g.type} role="presentation" className="ah-search__group">
                  <div className="ah-search__group-head" aria-hidden="true">
                    <span>{g.label}</span>
                    <span>{g.count}</span>
                  </div>
                  <ul role="group" aria-label={`${g.label} (${g.count})`} style={{ listStyle: 'none' }}>
                    {g.items.map(renderOption)}
                  </ul>
                </li>
              ))}
              {results.topDestination && results.topDestinationStays === 0 ? (
                <li role="presentation" className="ah-search__empty" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <MapPin size={14} aria-hidden="true" />
                  Verified stays in {results.topDestination.name} are opening soon.
                </li>
              ) : null}
            </ul>
          ) : query.trim() && ready && !message ? (
            <p className="ah-search__empty" id={listId}>
              No matches yet — try Pulga, Kasol, Kheerganga or Munnar.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
