'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import SaveButton from '../common/SaveButton';
import { WhatsAppIcon } from '../common/BrandIcons';
import { wishlistId } from '../../hooks/useWishlist';
import { availability, formatEventDate, isPast } from '../../lib/events';
import { waLink } from '../../lib/whatsapp';

/**
 * Events filtered to upcoming ones *after* mount, so the static HTML and the first client render
 * match (no hydration mismatch) and nothing expired ever lingers on screen.
 */
export function useUpcoming(events) {
  const [list, setList] = useState(events);
  useEffect(() => {
    setList(events.filter((e) => !isPast(e)));
  }, [events]);
  return list;
}

export function EventCta({ event, compact = false }) {
  const avail = availability(event);
  if (event.isSample) {
    return compact ? (
      <Link href={event.href} className="ah-link-arrow">View event <ArrowRight size={15} aria-hidden="true" /></Link>
    ) : (
      <span className="ah-event__nobook">Sample · not bookable</span>
    );
  }
  if (avail.tone === 'out') return <span className="ah-event__nobook">Sold out</span>;
  return (
    <a
      href={waLink(`Hi Aanandham! I'd like to reserve a spot for "${event.title}" (${formatEventDate(event).range}).`)}
      target="_blank"
      rel="noopener noreferrer"
      className={compact ? 'ah-link-arrow' : 'ah-btn ah-btn--primary ah-btn--sm'}
    >
      {compact ? null : <WhatsAppIcon size={15} />} Reserve a spot {compact ? <ArrowRight size={15} aria-hidden="true" /> : null}
    </a>
  );
}

/** One event as a date-led row. `detailed` shows the summary and full CTA (used on /events). */
export default function EventRow({ event: e, detailed = false }) {
  const d = formatEventDate(e);
  const avail = availability(e);

  return (
    <article id={e.id} className={`ah-event ${detailed ? 'ah-event--detailed' : ''}`}>
      <div className="ah-event__date" aria-hidden="true">
        <span>{d.month}</span>
        <strong>{d.day}</strong>
        <span>{d.weekday}</span>
      </div>
      <div className="ah-event__img">
        {e.image ? <Image src={e.image} alt="" fill sizes="160px" /> : null}
      </div>
      <div className="ah-event__body">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {e.isSample ? <span className="ah-badge ah-badge--sample">Sample</span> : null}
          <span className={`ah-event__avail ah-event__avail--${avail.tone}`}>{avail.label}</span>
        </div>
        <h3 className="ah-h3 ah-event__title">{e.title}</h3>
        <p className="ah-event__meta">
          <span><MapPin size={14} aria-hidden="true" /> {e.locationLabel}</span>
          <span><Clock size={14} aria-hidden="true" /> {d.range}{e.time && !e.time.includes('–') && !/\d{4}/.test(e.time) ? ` · ${e.time}` : ''}</span>
        </p>
        {detailed && e.summary ? <p className="ah-event__summary">{e.summary}</p> : null}
      </div>
      <div className="ah-event__side">
        <span className="ah-stay__price"><strong>₹{Number(e.price).toLocaleString('en-IN')}</strong> <span>/ person</span></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SaveButton id={wishlistId.event(e.id)} label={e.title} className="ah-save-btn ah-save-btn--line" />
          <EventCta event={e} compact={!detailed} />
        </div>
      </div>
    </article>
  );
}
