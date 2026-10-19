'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import DiscoverySearch from '../search/DiscoverySearch';
import { getDestinationBySlug } from '../../lib/destinationsData';

// Parvati river below snow peaks, deodar forest on the left (Unsplash, free licence)
const HERO_IMAGE = 'https://images.unsplash.com/photo-1546180801-a9b3dd6ad440?auto=format&fit=crop&w=2400&q=80';

// The valley in the order you travel it, rising from the river town to the high meadow
const ROUTE = ['kasol', 'manikaran', 'pulga', 'kalga', 'tosh', 'kheerganga'];

export default function HomeHero() {
  const stops = ROUTE.map(getDestinationBySlug).filter(Boolean);

  return (
    <>
      <section className="ah-hero" aria-labelledby="home-hero-title">
        <div className="ah-hero__media">
          <Image
            src={HERO_IMAGE}
            alt="The Parvati river flowing through deodar forest beneath snow-capped Himalayan peaks"
            fill
            priority
            sizes="100vw"
          />
        </div>

        <div className="ah-container ah-hero__content">
          <span className="ah-eyebrow ah-hero__eyebrow">Your mountain escape</span>
          <h1 id="home-hero-title" className="ah-h1 ah-hero__title">
            Discover the mountains. <span>Stay closer to nature.</span>
          </h1>
          <p className="ah-hero__lead">
            Hidden villages, mountain stays, unforgettable experiences and journeys worth remembering — across Pulga,
            Kasol and the Parvati Valley.
          </p>

          <div className="ah-hero__ctas">
            <Link href="/destinations" className="ah-btn ah-btn--primary">
              Explore Destinations <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href="/plan" className="ah-btn ah-btn--ghost-light">
              Plan My Trip
            </Link>
          </div>

          <DiscoverySearch className="ah-hero__search" />
        </div>
      </section>

      <div className="ah-route">
        <div className="ah-container ah-route__inner">
          <span className="ah-route__label">Up the Parvati Valley</span>
          <ol className="ah-route__stops">
            {stops.map((d) => (
              <li key={d.slug} className="ah-route__stop">
                <Link href={`/destinations/${d.slug}`}>
                  <strong>{d.name}</strong>
                  <small>{d.altitude}</small>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
