'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getDestinationsByGroup, getStaysCountForDestination } from '../lib/destinationsData';
import { getExperiencesForDestination } from '../lib/experiences';
import DestinationCard from './common/DestinationCard';
import Rail, { RailControls, useRail } from './common/Rail';

/**
 * Homepage destination discovery: the Parvati Valley rail first (primary focus),
 * then a compact band for destinations with stays open to book today.
 * `camps` lets the page pass admin-synced camp data so stay counts stay honest.
 */
export default function DestinationsShowcase({ camps }) {
  const rail = useRail();
  const himalaya = getDestinationsByGroup('himalaya');
  const bookableNow = getDestinationsByGroup('kerala').filter((d) => getStaysCountForDestination(d, camps) > 0);

  return (
    <section id="destinations" className="ah-section" aria-labelledby="destinations-title">
      <div className="ah-container">
        <div className="ah-section-head">
          <div>
            <span className="ah-eyebrow">Explore destinations</span>
            <h2 id="destinations-title" className="ah-h2" style={{ marginTop: 14 }}>
              Where the valley takes you
            </h2>
            <p className="ah-lead" style={{ marginTop: 14 }}>
              From riverside Kasol to the wooden lanes of Pulga and the meadow at Kheerganga — every village in the
              Parvati Valley has its own pace.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link href="/destinations" className="ah-link-arrow">
              All destinations <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <RailControls rail={rail} label="destinations" />
          </div>
        </div>

        <Rail rail={rail} label="Parvati Valley destinations">
          {himalaya.map((d) => (
            <DestinationCard key={d.slug} destination={d} staysCount={getStaysCountForDestination(d, camps)} experiencesCount={getExperiencesForDestination(d).length} />
          ))}
        </Rail>

        {bookableNow.map((d) => (
          <Link key={d.slug} href={`/destinations/${d.slug}`} className="ah-book-now-band">
            <span className="ah-book-now-band__img">
              <Image src={d.heroImage} alt="" fill sizes="96px" />
            </span>
            <span style={{ minWidth: 0 }}>
              <small>Book today</small>
              <strong>
                {d.name}, {d.area?.split(',').pop()?.trim()} — {getStaysCountForDestination(d, camps)} stays open now
              </strong>
            </span>
            <ArrowRight size={18} aria-hidden="true" style={{ marginLeft: 'auto', flexShrink: 0 }} />
          </Link>
        ))}
      </div>
    </section>
  );
}
