'use client';

import React from 'react';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { useTripIntent } from '../../hooks/useTripIntent';
import { nextDayISO } from '../../lib/tripIntent';

const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const fmt = (iso) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : null);

// Chrome/Edge desktop only open the calendar from the icon; open it from anywhere in the cell
const openPicker = (e) => {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    // not allowed here (e.g. cross-origin iframe) — the native input still works
  }
};

/**
 * Check-in → check-out pill shown on every trip page (destination, stays, property).
 * Edits here update the shared trip intent, so the booking card and later pages follow along.
 * `tone`: 'dark' on photo/dark heroes, 'light' on page backgrounds.
 */
export default function TripDatesBar({ tone = 'dark', className = '' }) {
  const [trip, setTrip] = useTripIntent({ syncUrl: true });
  const checkin = trip?.checkin || '';
  const checkout = trip?.checkout || '';

  const onCheckin = (value) => {
    // Keep the range valid: move check-out to the next day when it would no longer be after check-in
    if (value && (!checkout || checkout <= value)) setTrip({ checkin: value, checkout: nextDayISO(value) });
    else setTrip({ checkin: value || undefined });
  };

  return (
    <div className={`ah-tripbar ah-tripbar--${tone} ${className}`.trim()} role="group" aria-label="Trip dates">
      <CalendarDays size={20} aria-hidden="true" className="ah-tripbar__icon" />
      <label className="ah-tripbar__cell">
        <span className="ah-tripbar__label">Check-in</span>
        <span className="ah-tripbar__value" aria-hidden="true">{fmt(checkin) || 'Add date'}</span>
        <input
          type="date"
          className="ah-tripbar__native"
          min={todayISO()}
          value={checkin}
          onClick={openPicker}
          onChange={(e) => onCheckin(e.target.value)}
        />
      </label>
      <ArrowRight size={18} aria-hidden="true" className="ah-tripbar__arrow" />
      <label className="ah-tripbar__cell">
        <span className="ah-tripbar__label">Check-out</span>
        <span className="ah-tripbar__value" aria-hidden="true">{fmt(checkout) || 'Add date'}</span>
        <input
          type="date"
          className="ah-tripbar__native"
          min={checkin ? nextDayISO(checkin) : todayISO()}
          value={checkout}
          onClick={openPicker}
          onChange={(e) => setTrip({ checkout: e.target.value || undefined })}
        />
      </label>
    </div>
  );
}
