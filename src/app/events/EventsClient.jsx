'use client';

import React, { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import EventRow, { useUpcoming } from '../../components/events/EventRow';
import { EVENT_CATEGORIES, getEvents } from '../../lib/events';
import { waLink } from '../../lib/whatsapp';

const REGIONS = [
  { value: 'all', label: 'Everywhere' },
  { value: 'himalaya', label: 'Parvati Valley' },
  { value: 'kerala', label: 'Kerala' },
];

export default function EventsClient() {
  const all = useMemo(() => getEvents(), []);
  const upcoming = useUpcoming(all);
  const [region, setRegion] = useState('all');
  const [category, setCategory] = useState('all');

  const categories = EVENT_CATEGORIES.filter((c) => upcoming.some((e) => e.category === c.value));
  const list = upcoming.filter(
    (e) => (region === 'all' || e.group === region) && (category === 'all' || e.category === category)
  );

  // Group by month for an easy-to-scan calendar feel
  const months = [];
  for (const e of list) {
    const key = e.start.slice(0, 7);
    let m = months.find((x) => x.key === key);
    if (!m) {
      m = { key, label: new Date(`${e.start}T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }), items: [] };
      months.push(m);
    }
    m.items.push(e);
  }

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 28 }}>
        <div className="ah-segment" role="group" aria-label="Region">
          {REGIONS.map((r) => (
            <button key={r.value} type="button" aria-pressed={region === r.value} onClick={() => setRegion(r.value)}>{r.label}</button>
          ))}
        </div>
        <div className="ah-chips ah-chips--scroll" role="group" aria-label="Event type" style={{ flex: '1 1 320px', margin: 0, padding: 0 }}>
          <button type="button" className="ah-chip" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>All events</button>
          {categories.map((c) => (
            <button key={c.value} type="button" className="ah-chip" aria-pressed={category === c.value} onClick={() => setCategory(c.value)}>{c.label}</button>
          ))}
        </div>
      </div>

      {months.length > 0 ? (
        <div style={{ display: 'grid', gap: 48 }}>
          {months.map((m) => (
            <section key={m.key} aria-labelledby={`m-${m.key}`}>
              <h2 id={`m-${m.key}`} className="ah-h3" style={{ fontSize: 24, marginBottom: 16 }}>{m.label}</h2>
              <div className="ah-events__list">
                {m.items.map((e) => <EventRow key={e.id} event={e} detailed />)}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="ah-empty" style={{ maxWidth: 560 }}>
          <p style={{ color: 'var(--ah-ink)', fontWeight: 700 }}>No upcoming events here yet.</p>
          <p>New dates are added through the season. Tell us what you’d like to join and we’ll let you know.</p>
          <a href={waLink('Hi Aanandham! Please let me know about upcoming events.')} target="_blank" rel="noopener noreferrer" className="ah-btn ah-btn--forest ah-btn--sm">
            Get notified on WhatsApp
          </a>
        </div>
      )}

      {list.some((e) => e.isSample) ? (
        <p className="ah-sample-note" style={{ marginTop: 28 }}>
          <Info size={14} aria-hidden="true" /> Events marked “Sample” are placeholder previews and can’t be booked yet.
        </p>
      ) : null}
    </>
  );
}
