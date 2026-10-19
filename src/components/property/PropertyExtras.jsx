'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Navigation, ExternalLink, ArrowRight } from 'lucide-react';
import ValleyMap from '../map/ValleyMap';
import { getVisibleDestinations } from '../../lib/destinationsData';

const km = (a, b) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/**
 * Reviews, location and nearby places for a property page. Everything shown comes from the
 * listing's own data (reviews, coordinates) or the destinations data — nothing is invented.
 */
export default function PropertyExtras({ camp, camps = [] }) {
  const destinations = useMemo(() => getVisibleDestinations(), []);
  const dest = useMemo(() => {
    const r = String(camp?.region || '').toLowerCase();
    return destinations
      .filter((d) => d.region?.some((x) => x.toLowerCase() === r))
      .sort((a, b) => a.region.length - b.region.length)[0] || null;
  }, [camp, destinations]);

  if (!camp) return null;
  const reviews = (camp.reviews || []).filter((r) => r && r.comment);
  const coords = camp.locationCoordinates || {};
  const lat = Number(coords.lat) || dest?.lat;
  const lng = Number(coords.lng) || dest?.lng;
  const mapsUrl = coords.mapsUrl || (lat && lng ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : null);
  const isHimalaya = dest?.group === 'himalaya';

  const nearby = dest && lat && lng
    ? destinations
        .filter((d) => d.slug !== dest.slug && d.slug !== 'parvati-valley' && d.lat && d.lng)
        .map((d) => ({ d, dist: km({ lat, lng }, d) }))
        .filter((x) => x.dist <= 40)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 4)
    : [];

  return (
    <div className="ah-prop">
      {reviews.length > 0 ? (
        <section className="ah-prop__block" aria-labelledby="prop-reviews">
          <div className="ah-section-head" style={{ marginBottom: 20 }}>
            <div>
              <span className="ah-eyebrow">Guest reviews</span>
              <h2 id="prop-reviews" className="ah-h2" style={{ marginTop: 12, fontSize: 'clamp(24px, 2.8vw, 34px)' }}>What campers say</h2>
            </div>
            {camp.rating && camp.reviewsCount ? (
              <p className="ah-prop__score"><Star size={18} fill="currentColor" aria-hidden="true" /> <strong>{camp.rating}</strong> · {camp.reviewsCount} reviews</p>
            ) : null}
          </div>
          <div className="ah-prop__reviews">
            {reviews.slice(0, 6).map((r) => (
              <figure key={r.id || r.name} className="ah-card ah-quote">
                <span className="ah-quote__stars" role="img" aria-label={`${r.rating || 5} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} fill={i < (r.rating || 5) ? 'currentColor' : 'none'} aria-hidden="true" />)}
                </span>
                <blockquote className="ah-quote__text" style={{ fontSize: 15 }}>“{r.comment}”</blockquote>
                <figcaption className="ah-quote__who">
                  <span className="ah-quote__initials" aria-hidden="true">{String(r.name || '?').slice(0, 1)}</span>
                  <span><strong>{r.name}</strong><small>{[r.location, r.date].filter(Boolean).join(' · ')}</small></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <section className="ah-prop__block" aria-labelledby="prop-location">
        <span className="ah-eyebrow">Location</span>
        <h2 id="prop-location" className="ah-h2" style={{ marginTop: 12, marginBottom: 20, fontSize: 'clamp(24px, 2.8vw, 34px)' }}>
          Where you’ll be
        </h2>
        <div className="ah-prop__loc">
          <div className="ah-facts">
            <dl style={{ display: 'grid' }}>
              <div><dt><MapPin size={16} aria-hidden="true" /> Address</dt><dd>{camp.location || dest?.area || camp.region}</dd></div>
              {coords.nearestTown ? <div><dt><Navigation size={16} aria-hidden="true" /> Nearest town</dt><dd>{coords.nearestTown}</dd></div> : null}
              {!coords.nearestTown && dest?.nearestTransport ? <div><dt><Navigation size={16} aria-hidden="true" /> Getting there</dt><dd>{dest.nearestTransport}</dd></div> : null}
            </dl>
            {mapsUrl ? (
              <div>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="ah-link-arrow">
                  Open in Google Maps <ExternalLink size={14} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            ) : null}
          </div>
          {isHimalaya ? <ValleyMap current={dest.slug} camps={camps} compact /> : null}
        </div>
      </section>

      {nearby.length > 0 ? (
        <section className="ah-prop__block" aria-labelledby="prop-nearby">
          <span className="ah-eyebrow">Nearby</span>
          <h2 id="prop-nearby" className="ah-h2" style={{ marginTop: 12, marginBottom: 20, fontSize: 'clamp(24px, 2.8vw, 34px)' }}>
            Places to explore nearby
          </h2>
          <ul className="ah-prop__nearby">
            {nearby.map(({ d, dist }) => (
              <li key={d.slug}>
                <Link href={`/destinations/${d.slug}`} className="ah-guide-row">
                  <span className="ah-guide-row__img"><Image src={d.heroImage} alt="" fill sizes="140px" /></span>
                  <span style={{ minWidth: 0 }}>
                    <span className="ah-guide__meta">~{Math.max(1, Math.round(dist))} km away (straight line)</span>
                    <strong>{d.name}</strong>
                    <small style={{ display: 'block', color: 'var(--ah-muted)', marginTop: 2 }}>{d.tagline}</small>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {dest ? (
            <Link href={`/destinations/${dest.slug}`} className="ah-link-arrow" style={{ marginTop: 16 }}>
              More about {dest.name} <ArrowRight size={15} aria-hidden="true" />
            </Link>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
