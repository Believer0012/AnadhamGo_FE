'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Mountain } from 'lucide-react';
import { getDestinationArea } from '../../lib/destinationsData';
import SaveButton from './SaveButton';
import { wishlistId } from '../../hooks/useWishlist';

/**
 * Destination discovery card.
 * `staysCount` must be computed from real camp data (getStaysCountForDestination) — never pass a
 * marketing number. A destination with at least one real stay is shown as bookable.
 */
export default function DestinationCard({
  destination,
  staysCount = 0,
  experiencesCount = 0,
  sizes = '(max-width: 560px) 82vw, (max-width: 860px) 44vw, (max-width: 1180px) 33vw, 25vw',
}) {
  if (!destination) return null;

  // Bookable is derived from real inventory, not from the static `status` field
  const isLive = staysCount > 0;
  const isDemo = destination.status === 'demo';
  const href = `/destinations/${destination.slug}`;

  return (
    <article className="ah-card ah-dest">
      <div className="ah-card__media">
        <Image src={destination.heroImage} alt="" fill sizes={sizes} />
        <div className="ah-card__media-top">
          <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className={`ah-badge ${isLive ? 'ah-badge--ember' : 'ah-badge--dark'}`}>
              {isDemo ? 'Example data' : isLive ? 'Stays open' : 'Opening soon'}
            </span>
            {destination.altitude ? (
              <span className="ah-badge">
                <Mountain size={12} aria-hidden="true" /> {destination.altitude}
              </span>
            ) : null}
          </span>
          <SaveButton id={wishlistId.destination(destination.slug)} label={destination.name} />
        </div>
        <div className="ah-dest__overlay">
          <h3 className="ah-dest__name">{destination.name}</h3>
          <span className="ah-dest__area">{getDestinationArea(destination)}</span>
        </div>
      </div>

      <div className="ah-card__body">
        <p className="ah-dest__desc">{destination.shortDesc}</p>
        <div className="ah-card__foot">
          <span className={isLive ? 'ah-dest__stat' : 'ah-dest__stat ah-dest__stat--soon'}>
            {isLive ? `${staysCount} ${staysCount === 1 ? 'stay' : 'stays'}` : 'Stays opening soon'}
            {experiencesCount > 0 ? <span className="ah-dest__stat-sub">{experiencesCount} {experiencesCount === 1 ? 'experience' : 'experiences'}</span> : null}
          </span>
          <Link href={href} className="ah-link-arrow ah-card__stretch" aria-label={`Explore ${destination.name}`}>
            Explore <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
