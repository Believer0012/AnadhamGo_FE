'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import SaveButton from './SaveButton';
import { wishlistId } from '../../hooks/useWishlist';
import { formatPrice } from '../../lib/stays';

/** Stay card for the normalized stay model (src/lib/stays.js) — real or sample. */
export default function StayCard({
  stay,
  sizes = '(max-width: 560px) 82vw, (max-width: 860px) 44vw, (max-width: 1180px) 33vw, 25vw',
}) {
  if (!stay) return null;
  const { amount, unit } = formatPrice(stay);

  return (
    <article className="ah-card ah-stay">
      <div className="ah-card__media">
        {stay.image ? <Image src={stay.image} alt="" fill sizes={sizes} /> : null}
        <div className="ah-card__media-top">
          <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {stay.isSample ? <span className="ah-badge ah-badge--sample">Sample</span> : null}
            {stay.badge ? <span className="ah-badge">{stay.badge}</span> : null}
          </span>
          <SaveButton id={wishlistId.stay(stay.id)} label={stay.title} />
        </div>
      </div>

      <div className="ah-card__body">
        <span className="ah-meta">
          <MapPin size={14} aria-hidden="true" /> {stay.locationLabel}
        </span>
        <h3 className="ah-h3 ah-stay__title">{stay.title}</h3>

        <div className="ah-stay__rating">
          {stay.rating ? (
            <>
              <Star size={14} fill="currentColor" aria-hidden="true" />
              {/* Up to 2 decimals, trimmed: 4.98 stays 4.98 (not rounded up to 5.0), 4.8 stays 4.8 */}
              <strong>{Number(stay.rating.toFixed(2)).toString()}</strong>
              {stay.reviewsCount ? <span>({stay.reviewsCount.toLocaleString('en-IN')})</span> : null}
              <span aria-hidden="true">·</span>
            </>
          ) : null}
          <span>{stay.typeLabel}</span>
        </div>

        {stay.amenities?.length ? <p className="ah-stay__amenities">{stay.amenities.join(' · ')}</p> : null}

        <div className="ah-card__foot">
          <span className="ah-stay__price">
            <strong>{amount}</strong> <span>/ {unit}</span>
          </span>
          <Link href={stay.href} className="ah-link-arrow ah-card__stretch" aria-label={`View ${stay.title}`}>
            View stay <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function StayCardSkeleton() {
  return (
    <div className="ah-card ah-skeleton" aria-hidden="true">
      <div className="ah-card__media" />
      <div className="ah-card__body">
        <span className="ah-skeleton__line" style={{ width: '45%' }} />
        <span className="ah-skeleton__line" style={{ width: '80%', height: 18 }} />
        <span className="ah-skeleton__line" style={{ width: '60%' }} />
        <span className="ah-skeleton__line" style={{ width: '35%', marginTop: 12 }} />
      </div>
    </div>
  );
}
