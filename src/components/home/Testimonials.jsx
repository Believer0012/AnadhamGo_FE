'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Star, Info } from 'lucide-react';
import Rail, { RailControls, useRail } from '../common/Rail';
import { isSampleDataEnabled } from '../../lib/sample/sampleConfig';
import { SAMPLE_TESTIMONIALS } from '../../lib/sample/sampleTestimonials';
import { loadTestimonialsFromStorage } from '../../lib/testimonialsCore';

const initials = (name = '') =>
  name.replace(/&.*/, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

// Admin testimonials (/api/testimonials) → display shape. They carry no rating or
// destination, so those fields are simply not shown for them.
const fromAdmin = (t) => ({
  id: t.id,
  author: t.author,
  quote: t.quote,
  avatar: t.avatar || null,
  meta: t.batchDate || t.campBadge || '',
  isSample: false,
});

/** "Travellers who came for the mountains" — real (admin-managed) reviews first, then samples. */
export default function Testimonials() {
  const rail = useRail();
  const [admin, setAdmin] = useState([]);

  useEffect(() => {
    const saved = loadTestimonialsFromStorage();
    if (Array.isArray(saved)) setAdmin(saved.filter((t) => t.active !== false));
    fetch('/api/testimonials', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.testimonials)) setAdmin(data.testimonials.filter((t) => t.active !== false));
      })
      .catch(() => {});
  }, []);

  const items = useMemo(() => {
    const samples = isSampleDataEnabled()
      ? SAMPLE_TESTIMONIALS.map((t) => ({ ...t, meta: [t.destination, t.tripType].filter(Boolean).join(' · ') }))
      : [];
    return [...admin.map(fromAdmin), ...samples];
  }, [admin]);

  if (items.length === 0) return null;

  return (
    <section className="ah-section" aria-labelledby="testimonials-title">
      <div className="ah-container">
        <div className="ah-section-head">
          <div>
            <span className="ah-eyebrow">Traveller stories</span>
            <h2 id="testimonials-title" className="ah-h2" style={{ marginTop: 14 }}>
              Travellers who came for the mountains
            </h2>
          </div>
          <RailControls rail={rail} label="reviews" />
        </div>

        <Rail rail={rail} className="ah-rail--3" label="Traveller reviews">
          {items.map((t) => (
            <figure key={t.id} className="ah-card ah-quote">
              <div className="ah-quote__top">
                {t.rating ? (
                  <span className="ah-quote__stars" role="img" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={15} fill={i < t.rating ? 'currentColor' : 'none'} aria-hidden="true" />
                    ))}
                  </span>
                ) : <span />}
                {t.isSample ? <span className="ah-badge ah-badge--sample">Sample</span> : null}
              </div>
              <blockquote className="ah-quote__text">“{t.quote}”</blockquote>
              <figcaption className="ah-quote__who">
                {t.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.avatar} alt="" width="44" height="44" loading="lazy" />
                ) : (
                  <span className="ah-quote__initials" aria-hidden="true">{initials(t.author)}</span>
                )}
                <span>
                  <strong>{t.author}</strong>
                  <small>{[t.from, t.meta].filter(Boolean).join(' · ')}</small>
                </span>
              </figcaption>
            </figure>
          ))}
        </Rail>

        {items.some((t) => t.isSample) ? (
          <p className="ah-sample-note">
            <Info size={14} aria-hidden="true" /> Reviews marked “Sample” are placeholders for preview — not real guest reviews.
          </p>
        ) : null}
      </div>
    </section>
  );
}
