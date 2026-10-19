'use client';

import { useCallback, useEffect, useState } from 'react';
import { readTripIntent, updateTripIntent, writeTripIntentToUrl, TRIP_INTENT_EVENT } from '../lib/tripIntent';

/**
 * The traveller's dates/guests, kept in sync across every component on the page.
 * `syncUrl` mirrors the stored intent into this page's URL on mount (trip pages only).
 * @returns {[ { checkin?: string, checkout?: string, guests?: number } | null, (patch: object) => void ]}
 */
export function useTripIntent({ syncUrl = false } = {}) {
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    const initial = readTripIntent();
    setTrip(initial);
    if (syncUrl && initial) writeTripIntentToUrl(initial);
    const onChange = (e) => setTrip(e.detail);
    window.addEventListener(TRIP_INTENT_EVENT, onChange);
    return () => window.removeEventListener(TRIP_INTENT_EVENT, onChange);
  }, [syncUrl]);

  const update = useCallback((patch) => updateTripIntent(patch), []);
  return [trip, update];
}
