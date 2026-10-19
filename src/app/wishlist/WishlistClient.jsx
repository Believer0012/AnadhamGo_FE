'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import StayCard from '../../components/common/StayCard';
import DestinationCard from '../../components/common/DestinationCard';
import { useWishlist, wishlistId } from '../../hooks/useWishlist';
import { useLiveCamps } from '../../hooks/useLiveCamps';
import { getDiscoverStays } from '../../lib/stays';
import { getExperiences } from '../../lib/experiences';
import ExperienceCard from '../../components/common/ExperienceCard';
import EventRow from '../../components/events/EventRow';
import { getEvents } from '../../lib/events';
import { getVisibleDestinations, getStaysCountForDestination } from '../../lib/destinationsData';
import { getExperiencesForDestination } from '../../lib/experiences';

const GRID = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 270px), 1fr))', gap: 20 };

export default function WishlistClient() {
  const { ids } = useWishlist();
  const camps = useLiveCamps();

  const stays = useMemo(() => getDiscoverStays(camps).filter((s) => ids.includes(wishlistId.stay(s.id))), [camps, ids]);
  const destinations = useMemo(
    () => getVisibleDestinations().filter((d) => ids.includes(wishlistId.destination(d.slug))),
    [ids]
  );
  const experiences = useMemo(() => getExperiences().filter((e) => ids.includes(wishlistId.experience(e.id))), [ids]);
  const events = useMemo(() => getEvents().filter((e) => ids.includes(wishlistId.event(e.id))), [ids]);
  const isEmpty = stays.length === 0 && destinations.length === 0 && experiences.length === 0 && events.length === 0;

  if (isEmpty) {
    return (
      <div className="ah-empty" style={{ maxWidth: 560 }}>
        <Heart size={28} color="var(--ah-ember)" aria-hidden="true" />
        <p style={{ fontSize: 17, color: 'var(--ah-ink)', fontWeight: 700 }}>Nothing saved yet</p>
        <p>Tap the ♡ on any stay, experience or destination to keep it here while you plan.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/stays" className="ah-btn ah-btn--forest ah-btn--sm">Browse stays</Link>
          <Link href="/destinations" className="ah-btn ah-btn--ghost ah-btn--sm">Explore destinations</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 56 }}>
      {stays.length > 0 ? (
        <section aria-labelledby="saved-stays">
          <h2 id="saved-stays" className="ah-h3" style={{ fontSize: 24, marginBottom: 20 }}>
            Stays <span style={{ color: 'var(--ah-muted)', fontWeight: 500 }}>({stays.length})</span>
          </h2>
          <div style={GRID}>
            {stays.map((s) => <StayCard key={s.id} stay={s} />)}
          </div>
        </section>
      ) : null}
      {experiences.length > 0 ? (
        <section aria-labelledby="saved-experiences">
          <h2 id="saved-experiences" className="ah-h3" style={{ fontSize: 24, marginBottom: 20 }}>
            Experiences <span style={{ color: 'var(--ah-muted)', fontWeight: 500 }}>({experiences.length})</span>
          </h2>
          <div style={GRID}>
            {experiences.map((e) => <ExperienceCard key={e.id} experience={e} />)}
          </div>
        </section>
      ) : null}
      {events.length > 0 ? (
        <section aria-labelledby="saved-events">
          <h2 id="saved-events" className="ah-h3" style={{ fontSize: 24, marginBottom: 20 }}>
            Events <span style={{ color: 'var(--ah-muted)', fontWeight: 500 }}>({events.length})</span>
          </h2>
          <div className="ah-events__list">
            {events.map((e) => <EventRow key={e.id} event={e} />)}
          </div>
        </section>
      ) : null}
      {destinations.length > 0 ? (
        <section aria-labelledby="saved-destinations">
          <h2 id="saved-destinations" className="ah-h3" style={{ fontSize: 24, marginBottom: 20 }}>
            Destinations <span style={{ color: 'var(--ah-muted)', fontWeight: 500 }}>({destinations.length})</span>
          </h2>
          <div style={GRID}>
            {destinations.map((d) => (
              <DestinationCard key={d.slug} destination={d} staysCount={getStaysCountForDestination(d, camps)} experiencesCount={getExperiencesForDestination(d).length} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
