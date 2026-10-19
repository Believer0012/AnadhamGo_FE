'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, Gauge, MapPin, Star } from 'lucide-react';
import SaveButton from './SaveButton';
import { wishlistId } from '../../hooks/useWishlist';

/** Experience card for the experience model (src/lib/experiences.js) — real or sample. */
export default function ExperienceCard({
  experience: e,
  sizes = '(max-width: 560px) 82vw, (max-width: 860px) 44vw, (max-width: 1180px) 33vw, 25vw',
}) {
  if (!e) return null;

  return (
    <article className="ah-card ah-exp">
      <div className="ah-card__media">
        {e.image ? <Image src={e.image} alt="" fill sizes={sizes} /> : null}
        <div className="ah-card__media-top">
          <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {e.isSample ? <span className="ah-badge ah-badge--sample">Sample</span> : null}
            {e.badge ? <span className="ah-badge">{e.badge}</span> : null}
          </span>
          <SaveButton id={wishlistId.experience(e.id)} label={e.title} />
        </div>
      </div>

      <div className="ah-card__body">
        <span className="ah-meta">
          <MapPin size={14} aria-hidden="true" /> {e.locationLabel}
        </span>
        <h3 className="ah-h3 ah-stay__title">{e.title}</h3>
        <div className="ah-exp__facts">
          <span><Clock size={14} aria-hidden="true" /> {e.duration}</span>
          <span><Gauge size={14} aria-hidden="true" /> {e.difficulty}</span>
          {e.rating ? (
            <span className="ah-exp__rating">
              <Star size={13} fill="currentColor" aria-hidden="true" />
              <strong>{Number(e.rating.toFixed(2)).toString()}</strong>
              {e.reviewsCount ? <span>({e.reviewsCount})</span> : null}
            </span>
          ) : null}
        </div>
        {e.summary ? <p className="ah-stay__amenities">{e.summary}</p> : null}

        <div className="ah-card__foot">
          <span className="ah-stay__price">
            <strong>₹{Number(e.price || 0).toLocaleString('en-IN')}</strong> <span>/ {e.priceUnit || 'person'}</span>
          </span>
          <Link href={e.href} className="ah-link-arrow ah-card__stretch" aria-label={`Explore ${e.title}`}>
            Explore <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
