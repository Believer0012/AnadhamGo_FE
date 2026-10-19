'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Info, Users } from 'lucide-react';
import EventRow, { EventCta, useUpcoming } from '../events/EventRow';
import { availability, formatEventDate, getEvents } from '../../lib/events';
import { waLink } from '../../lib/whatsapp';

// The group services from the old "custom arrangements" board, kept as quick enquiries
const GROUP_TRIPS = [
  { label: 'College & youth trips', msg: 'Hi Aanandham! I would like to plan a college / youth group trip.' },
  { label: 'Corporate offsites', msg: 'Hi Aanandham! I would like to plan a corporate offsite.' },
  { label: 'Strangers meet-ups', msg: 'Hi Aanandham! Tell me about your strangers camp meet-ups.' },
  { label: 'Private celebrations', msg: 'Hi Aanandham! I would like to plan a private celebration in the mountains.' },
];

/** "Upcoming in the mountains" — featured next event + date-led list. */
export default function EventsSection() {
  const all = useMemo(() => getEvents().filter((e) => e.group === 'himalaya'), []);
  const upcoming = useUpcoming(all);
  const [next, ...rest] = upcoming;

  return (
    <section id="events" className="ah-section" aria-labelledby="events-title">
      <div className="ah-container">
        <div className="ah-section-head">
          <div>
            <span className="ah-eyebrow">Events</span>
            <h2 id="events-title" className="ah-h2" style={{ marginTop: 14 }}>
              Upcoming in the mountains
            </h2>
          </div>
          <Link href="/events" className="ah-link-arrow">
            All events <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        {next ? (
          <div className="ah-events">
            <article className="ah-event-feature">
              <div className="ah-event-feature__media">
                {next.image ? <Image src={next.image} alt="" fill sizes="(max-width: 900px) 100vw, 45vw" /> : null}
                <span className="ah-event-feature__date">
                  <strong>{formatEventDate(next).day}</strong>
                  <span>{formatEventDate(next).month}</span>
                </span>
              </div>
              <div className="ah-event-feature__body">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className="ah-eyebrow" style={{ fontSize: 11 }}>Next up</span>
                  {next.isSample ? <span className="ah-badge ah-badge--sample">Sample</span> : null}
                </div>
                <h3 className="ah-event-feature__title">{next.title}</h3>
                <p className="ah-event__meta"><span>{next.locationLabel}</span><span>{formatEventDate(next).range}</span></p>
                {next.summary ? <p className="ah-event__summary">{next.summary}</p> : null}
                <div className="ah-card__foot">
                  <span className="ah-stay__price">
                    <strong>₹{Number(next.price).toLocaleString('en-IN')}</strong> <span>/ person · {availability(next).label}</span>
                  </span>
                  <EventCta event={next} compact />
                </div>
              </div>
            </article>

            <div className="ah-events__list">
              {rest.slice(0, 4).map((e) => <EventRow key={e.id} event={e} />)}
            </div>
          </div>
        ) : (
          <div className="ah-empty">
            <p>New dates for the Parvati Valley are being planned. Follow us or ask about the next one.</p>
            <a href={waLink('Hi Aanandham! When is your next event in the Parvati Valley?')} target="_blank" rel="noopener noreferrer" className="ah-btn ah-btn--forest ah-btn--sm">
              Ask on WhatsApp
            </a>
          </div>
        )}

        {upcoming.some((e) => e.isSample) ? (
          <p className="ah-sample-note">
            <Info size={14} aria-hidden="true" /> Events marked “Sample” are placeholder previews and can’t be booked yet.
          </p>
        ) : null}

        <div className="ah-group-strip">
          <span className="ah-group-strip__label"><Users size={16} aria-hidden="true" /> Plan something bigger</span>
          <div className="ah-chips">
            {GROUP_TRIPS.map((g) => (
              <a key={g.label} href={waLink(g.msg)} target="_blank" rel="noopener noreferrer" className="ah-chip">
                {g.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
