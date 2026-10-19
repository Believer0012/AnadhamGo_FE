'use client';

import React, { useEffect, useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { BedDouble, Sparkles, Minus, Plus, Link2, Check, Info, User, Heart, Users, Home, MapPin, ArrowDown } from 'lucide-react';
import { WhatsAppIcon } from '../common/BrandIcons';
import { useLiveCamps } from '../../hooks/useLiveCamps';
import { waLink } from '../../lib/whatsapp';
import {
  INTERESTS,
  TRAVEL_GROUPS,
  TRIP_LENGTHS,
  buildTrip,
  plannerStateFromParams,
  plannerStateToParams,
  tripToText,
} from '../../lib/tripPlanner';

const GROUP_ICONS = { solo: User, couple: Heart, friends: Users, family: Home };
const DEFAULTS = { days: 3, group: 'couple', guests: null, interests: ['nature', 'photography'] };
const inr = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/**
 * "Build your mountain escape" planner. Updates live as options change.
 * `syncUrl` keeps the choices in the address bar (used on /plan so plans can be shared).
 */
export default function TripPlanner({ syncUrl = false, headingLevel = 'h2' }) {
  const camps = useLiveCamps();
  const [state, setState] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);
  const Heading = headingLevel;
  // Day titles sit one level below the plan title, keeping the outline in order
  const DayHeading = headingLevel === 'h2' ? 'h3' : 'h4';
  const resultId = `trip-plan-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  // Restore from the URL (shared links) — read once on mount, no Suspense needed
  useEffect(() => {
    if (!syncUrl) return;
    const fromUrl = plannerStateFromParams(window.location.search);
    if (Object.keys(fromUrl).length) setState((s) => ({ ...s, ...fromUrl }));
  }, [syncUrl]);

  useEffect(() => {
    if (!syncUrl) return;
    const qs = plannerStateToParams(state).toString();
    window.history.replaceState(null, '', `${window.location.pathname}?${qs}`);
  }, [state, syncUrl]);

  const needsGuests = state.group === 'friends' || state.group === 'family';
  const guests = needsGuests ? state.guests || TRAVEL_GROUPS.find((g) => g.value === state.group).people : null;
  const trip = useMemo(
    () => buildTrip({ days: state.days, group: state.group, guests, interests: state.interests }, camps),
    [state.days, state.group, guests, state.interests, camps]
  );

  const set = (patch) => setState((s) => ({ ...s, ...patch }));
  const toggleInterest = (v) =>
    set({ interests: state.interests.includes(v) ? state.interests.filter((i) => i !== v) : [...state.interests, v] });

  const shareUrl = () => {
    const qs = plannerStateToParams({ ...state, guests }).toString();
    return `${window.location.origin}/plan?${qs}`;
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link to your plan:', shareUrl());
    }
  };

  const interestLabels = state.interests.map((v) => INTERESTS.find((i) => i.value === v)?.label).filter(Boolean);
  const est = trip.estimate;

  return (
    <div className="ah-planner">
      {/* ── Options ── */}
      <div className="ah-planner__form">
        <fieldset className="ah-planner__field">
          <legend>How many days?</legend>
          <div className="ah-segment ah-segment--wide" role="group" aria-label="Trip length">
            {TRIP_LENGTHS.map((t) => (
              <button key={t.value} type="button" aria-pressed={state.days === t.value} onClick={() => set({ days: t.value })}>
                {t.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="ah-planner__field">
          <legend>Travelling with</legend>
          <div className="ah-planner__groups">
            {TRAVEL_GROUPS.map((g) => {
              const Icon = GROUP_ICONS[g.value];
              return (
                <button
                  key={g.value}
                  type="button"
                  className="ah-planner__group"
                  aria-pressed={state.group === g.value}
                  onClick={() => set({ group: g.value, guests: null })}
                >
                  <Icon size={20} aria-hidden="true" />
                  {g.label}
                </button>
              );
            })}
          </div>
          {needsGuests ? (
            <div className="ah-stepper" role="group" aria-label="Number of travellers">
              <span>How many of you?</span>
              <button type="button" aria-label="Fewer travellers" disabled={guests <= 2} onClick={() => set({ guests: guests - 1 })}>
                <Minus size={16} aria-hidden="true" />
              </button>
              <output aria-live="polite">{guests}</output>
              <button type="button" aria-label="More travellers" disabled={guests >= 12} onClick={() => set({ guests: guests + 1 })}>
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </fieldset>

        <fieldset className="ah-planner__field">
          <legend>Interested in</legend>
          <div className="ah-chips">
            {INTERESTS.map((i) => (
              <button key={i.value} type="button" className="ah-chip" aria-pressed={state.interests.includes(i.value)} onClick={() => toggleInterest(i.value)}>
                {i.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Small screens: the plan renders below the form, so offer a jump to it */}
        <a href={`#${resultId}`} className="ah-btn ah-btn--forest ah-planner__jump">
          See your {trip.daysLabel} plan <ArrowDown size={16} aria-hidden="true" />
        </a>
      </div>

      {/* ── Result ── */}
      <div id={resultId} className="ah-planner__result" aria-live="polite" aria-atomic="false" style={{ scrollMarginTop: 'calc(var(--ah-header-h) + 12px)' }}>
        <span className="ah-eyebrow" style={{ color: '#F1B893' }}>Your plan</span>
        <Heading className="ah-planner__title">{trip.title}</Heading>
        <p className="ah-planner__route">
          <MapPin size={15} aria-hidden="true" /> {trip.route.join(' → ')}
        </p>

        <ol className="ah-timeline">
          {trip.dayPlans.map((d) => (
            <li key={d.day} className="ah-timeline__day">
              <span className="ah-timeline__num" aria-hidden="true">{d.day}</span>
              <div>
                <p className="ah-timeline__label">Day {d.day}{d.placeName ? ` · ${d.placeName}` : ''}</p>
                <DayHeading className="ah-timeline__title">{d.title}</DayHeading>
                <ul className="ah-timeline__items">
                  {d.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
                {d.experience || d.stay ? (
                  <div className="ah-timeline__picks">
                    {d.experience ? (
                      <Link href={d.experience.href} className="ah-timeline__pick">
                        <Sparkles size={14} aria-hidden="true" />
                        <span>{d.experience.title}</span>
                        {d.experience.isSample ? <em>Sample</em> : null}
                      </Link>
                    ) : null}
                    {d.stay ? (
                      <Link href={d.stay.href} className="ah-timeline__pick">
                        <BedDouble size={14} aria-hidden="true" />
                        <span>{d.stay.title}</span>
                        {d.stay.isSample ? <em>Sample</em> : null}
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        <div className="ah-estimate">
          {est.hasPrices ? (
            <>
              <dl>
                <div>
                  <dt>Stays <small>({trip.nightsCount - est.unpricedNights} of {trip.nightsCount} nights priced)</small></dt>
                  <dd>{inr(est.stays)}</dd>
                </div>
                <div>
                  <dt>Experiences</dt>
                  <dd>{inr(est.experiences)}</dd>
                </div>
                <div className="ah-estimate__total">
                  {/* With unpriced nights the sum is partial — say so instead of implying a full trip price */}
                  <dt>{est.unpricedNights > 0 ? 'Priced so far' : 'Estimated total'} <small>for {trip.people} {trip.people === 1 ? 'person' : 'people'}</small></dt>
                  <dd>{inr(est.total)}</dd>
                </div>
              </dl>
              {est.usedSample ? (
                <p className="ah-estimate__note"><Info size={13} aria-hidden="true" /> Based on sample prices — a preview, not a quote.</p>
              ) : null}
              {est.unpricedNights > 0 ? (
                <p className="ah-estimate__note"><Info size={13} aria-hidden="true" /> {est.unpricedNights} {est.unpricedNights === 1 ? 'night isn’t' : 'nights aren’t'} priced yet — we’ll quote them.</p>
              ) : null}
            </>
          ) : (
            <p className="ah-estimate__note" style={{ margin: 0 }}>
              <Info size={13} aria-hidden="true" /> Stays and experiences here are opening soon — send us the plan and we’ll quote it.
            </p>
          )}
        </div>

        <div className="ah-planner__ctas">
          <a
            href={waLink(tripToText(trip, interestLabels))}
            target="_blank"
            rel="noopener noreferrer"
            className="ah-btn ah-btn--primary"
          >
            <WhatsAppIcon size={17} /> Book this trip
          </a>
          <button type="button" className="ah-btn ah-btn--ghost-light" onClick={copyLink}>
            {copied ? <Check size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
            {copied ? 'Link copied' : 'Copy plan link'}
          </button>
        </div>
        <p className="ah-planner__fine">Booking is confirmed by our team on WhatsApp — we check dates and availability for every stop.</p>
      </div>
    </div>
  );
}
