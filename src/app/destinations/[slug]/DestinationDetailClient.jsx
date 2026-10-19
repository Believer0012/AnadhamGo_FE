'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mountain, CalendarDays, Navigation, Info, ChevronRight } from 'lucide-react';
import SiteHeader from '../../../components/SiteHeader';
import Footer from '../../../components/Footer';
import StayCard from '../../../components/common/StayCard';
import SaveButton from '../../../components/common/SaveButton';
import { wishlistId } from '../../../hooks/useWishlist';
import TripDatesBar from '../../../components/common/TripDatesBar';
import { useLiveCamps } from '../../../hooks/useLiveCamps';
import { getDestinationArea } from '../../../lib/destinationsData';
import { getDiscoverStays } from '../../../lib/stays';
import { getExperiencesForDestination } from '../../../lib/experiences';
import ExperienceCard from '../../../components/common/ExperienceCard';
import { waLink } from '../../../lib/whatsapp';
import EventRow, { useUpcoming } from '../../../components/events/EventRow';
import ValleyMap from '../../../components/map/ValleyMap';
import { getEvents } from '../../../lib/events';
import { HIMALAYA_BLOG_POSTS } from '../../../lib/blogPostsHimalaya';

const GRID = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 270px), 1fr))', gap: 20 };

// Parvati Valley overview page lists every stay in the valley; other pages list their own
const staysFor = (destination, stays) =>
  destination.slug === 'parvati-valley'
    ? stays.filter((s) => s.group === 'himalaya')
    : stays.filter((s) => s.destination === destination.slug);

export default function DestinationDetailClient({ destination, camps: seedCamps = [] }) {
  const liveCamps = useLiveCamps();
  const stays = useMemo(() => {
    if (!destination) return [];
    // Admin-synced camps once loaded; the server-rendered seed list covers first paint
    const all = getDiscoverStays(liveCamps.length ? liveCamps : seedCamps);
    const list = staysFor(destination, all);
    return [...list.filter((s) => !s.isSample), ...list.filter((s) => s.isSample)];
  }, [destination, liveCamps, seedCamps]);

  const experiences = useMemo(() => getExperiencesForDestination(destination), [destination]);
  const destEvents = useMemo(
    () => (destination ? getEvents().filter((e) => (destination.slug === 'parvati-valley' ? e.group === 'himalaya' : e.destination === destination.slug)) : []),
    [destination]
  );
  const events = useUpcoming(destEvents);
  // Guides that talk about this place (title, excerpt or keywords)
  const guides = useMemo(() => {
    if (!destination) return [];
    const name = destination.name.toLowerCase();
    return HIMALAYA_BLOG_POSTS.filter((g) =>
      destination.slug === 'parvati-valley' || [g.title, g.excerpt, ...(g.keywords || [])].join(' ').toLowerCase().includes(name)
    );
  }, [destination]);

  if (!destination) return null;

  const realCount = stays.filter((s) => !s.isSample).length;
  const facts = [
    destination.altitude && { icon: Mountain, label: 'Altitude', value: destination.altitude },
    destination.bestSeason?.length && {
      icon: CalendarDays,
      label: 'Best time',
      value: `${destination.bestSeason[0]} – ${destination.bestSeason[destination.bestSeason.length - 1]}`,
    },
    destination.nearestTransport && { icon: Navigation, label: 'Getting there', value: destination.nearestTransport },
  ].filter(Boolean);

  return (
    <>
      <SiteHeader activePage="destinations" />
      <main id="main-content">
        <section className="ah-dest-hero" aria-labelledby="dest-title">
          <Image src={destination.heroImage} alt="" fill priority sizes="100vw" />
          <div className="ah-container ah-dest-hero__content">
            <nav aria-label="Breadcrumb" className="ah-crumbs">
              <Link href="/">Home</Link>
              <ChevronRight size={14} aria-hidden="true" />
              <Link href="/destinations">Destinations</Link>
              <ChevronRight size={14} aria-hidden="true" />
              <span aria-current="page">{destination.name}</span>
            </nav>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <h1 id="dest-title" className="ah-h1" style={{ fontSize: 'clamp(44px, 8vw, 104px)' }}>{destination.name}</h1>
                <p style={{ marginTop: 10, fontSize: 17, color: 'var(--ah-on-dark-muted)' }}>{getDestinationArea(destination)}</p>
                {/* Dates chosen in the search; changing them here carries through to the booking card */}
                <TripDatesBar tone="dark" className="ah-dest-hero__dates" />
              </div>
              <SaveButton id={wishlistId.destination(destination.slug)} label={destination.name} />
            </div>
          </div>
        </section>

        <section className="ah-section" style={{ paddingBottom: 48 }}>
          <div className="ah-container ah-dest-intro">
            <div>
              <span className="ah-eyebrow">About {destination.name}</span>
              {destination.tagline && !destination.tagline.startsWith('★') ? (
                <h2 className="ah-h2" style={{ marginTop: 14, fontSize: 'clamp(26px, 3.2vw, 40px)' }}>{destination.tagline}</h2>
              ) : null}
              <p className="ah-lead" style={{ marginTop: 16, maxWidth: 640, color: 'var(--ah-ink)' }}>
                {destination.longDesc || destination.shortDesc}
              </p>
            </div>
            <dl className="ah-facts">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt><f.icon size={16} aria-hidden="true" /> {f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="stays" className="ah-section ah-section--alt" aria-labelledby="dest-stays-title">
          <div className="ah-container">
            <div className="ah-section-head">
              <div>
                <span className="ah-eyebrow">Where to stay</span>
                <h2 id="dest-stays-title" className="ah-h2" style={{ marginTop: 14, fontSize: 'clamp(26px, 3.2vw, 40px)' }}>
                  Stays in {destination.name}
                </h2>
              </div>
              {realCount > 0 ? (
                <Link href={`/stays?region=${destination.slug === 'parvati-valley' ? 'himalaya' : destination.slug}`} className="ah-link-arrow">
                  Filter all stays <ChevronRight size={15} aria-hidden="true" />
                </Link>
              ) : null}
            </div>

            {stays.length > 0 ? (
              <div style={GRID}>
                {stays.map((s) => (
                  <StayCard key={s.id} stay={s} sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw" />
                ))}
              </div>
            ) : (
              <div className="ah-empty" style={{ maxWidth: 560 }}>
                <p style={{ color: 'var(--ah-ink)', fontWeight: 700 }}>Verified stays in {destination.name} are opening soon.</p>
                <p>Tell us your dates and we’ll help you plan the trip in the meantime.</p>
                <a
                  href={waLink(`Hi Aanandham! I'm planning a trip to ${destination.name}. Can you help?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ah-btn ah-btn--forest ah-btn--sm"
                >
                  Plan with us on WhatsApp
                </a>
              </div>
            )}

            {stays.some((s) => s.isSample) ? (
              <p className="ah-sample-note" style={{ marginTop: 20 }}>
                <Info size={14} aria-hidden="true" /> Listings marked “Sample” are placeholder previews and can’t be booked yet.
              </p>
            ) : null}
          </div>
        </section>

        {experiences.length > 0 ? (
          <section id="experiences" className="ah-section" aria-labelledby="dest-exp-title">
            <div className="ah-container">
              <div className="ah-section-head">
                <div>
                  <span className="ah-eyebrow">Things to do</span>
                  <h2 id="dest-exp-title" className="ah-h2" style={{ marginTop: 14, fontSize: 'clamp(26px, 3.2vw, 40px)' }}>
                    Experiences in {destination.name}
                  </h2>
                </div>
                <Link href={`/experiences${destination.slug === 'parvati-valley' ? '' : `?where=${destination.slug}`}`} className="ah-link-arrow">
                  All experiences <ChevronRight size={15} aria-hidden="true" />
                </Link>
              </div>
              <div style={GRID}>
                {experiences.map((e) => (
                  <ExperienceCard key={e.id} experience={e} sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw" />
                ))}
              </div>
              {experiences.some((e) => e.isSample) ? (
                <p className="ah-sample-note" style={{ marginTop: 20 }}>
                  <Info size={14} aria-hidden="true" /> Experiences marked “Sample” are placeholder previews and can’t be booked yet.
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        {events.length > 0 ? (
          <section id="events" className="ah-section ah-section--alt" aria-labelledby="dest-events-title">
            <div className="ah-container">
              <div className="ah-section-head">
                <div>
                  <span className="ah-eyebrow">Events</span>
                  <h2 id="dest-events-title" className="ah-h2" style={{ marginTop: 14, fontSize: 'clamp(26px, 3.2vw, 40px)' }}>
                    Coming up in {destination.name}
                  </h2>
                </div>
                <Link href="/events" className="ah-link-arrow">All events <ChevronRight size={15} aria-hidden="true" /></Link>
              </div>
              <div className="ah-events__list">
                {events.slice(0, 4).map((e) => <EventRow key={e.id} event={e} />)}
              </div>
            </div>
          </section>
        ) : null}

        {destination.group === 'himalaya' ? (
          <section className="ah-section" aria-labelledby="dest-map-title">
            <div className="ah-container">
              <span className="ah-eyebrow">Map</span>
              <h2 id="dest-map-title" className="ah-h2" style={{ marginTop: 14, marginBottom: 24, fontSize: 'clamp(26px, 3.2vw, 40px)' }}>
                {destination.slug === 'parvati-valley' ? 'The valley at a glance' : `Where ${destination.name} sits in the valley`}
              </h2>
              <ValleyMap current={destination.slug === 'parvati-valley' ? null : destination.slug} camps={liveCamps} />
            </div>
          </section>
        ) : null}

        {guides.length > 0 ? (
          <section className="ah-section ah-section--alt" aria-labelledby="dest-guides-title">
            <div className="ah-container">
              <span className="ah-eyebrow">Travel guides</span>
              <h2 id="dest-guides-title" className="ah-h2" style={{ marginTop: 14, marginBottom: 24, fontSize: 'clamp(26px, 3.2vw, 40px)' }}>
                Read before you go
              </h2>
              <ul className="ah-prop__nearby">
                {guides.map((g) => (
                  <li key={g.slug}>
                    <Link href={`/blog/${g.slug}`} className="ah-guide-row">
                      <span className="ah-guide-row__img"><Image src={g.image} alt="" fill sizes="140px" /></span>
                      <span style={{ minWidth: 0 }}>
                        <span className="ah-guide__meta">{g.category} · {g.readMinutes} min read</span>
                        <strong>{g.title}</strong>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <section className="ah-section" aria-label="Plan your trip">
          <div className="ah-container">
            <div className="ah-guide-row ah-guide-row--cta" style={{ padding: 'clamp(22px, 3vw, 36px)', borderRadius: 'var(--ah-radius-lg)' }}>
              <span>
                <span className="ah-guide__meta">Recommended itinerary</span>
                <strong style={{ fontSize: 'clamp(20px, 2.4vw, 28px)', fontFamily: 'var(--ah-font-display)' }}>
                  Build a day-by-day trip{destination.group === 'himalaya' ? ' up the Parvati Valley' : ''} — stays, experiences and costs in one plan.
                </strong>
              </span>
              <Link href="/plan" className="ah-btn ah-btn--primary">Plan my trip <ChevronRight size={16} aria-hidden="true" /></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
