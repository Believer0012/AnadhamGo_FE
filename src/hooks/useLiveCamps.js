'use client';

import { useEffect, useState } from 'react';
import { INITIAL_ALL_CAMPS, getAllCamps, saveAllCamps } from '../lib/campsData';

/**
 * Camp list kept in sync with the admin-managed source (/api/admin/camps),
 * same strategy as the homepage: seed data on first render (SSR-safe), then the
 * localStorage cache, then the server list once it arrives.
 */
export function useLiveCamps() {
  const [camps, setCamps] = useState(INITIAL_ALL_CAMPS);

  useEffect(() => {
    const sync = () => setCamps(getAllCamps());
    sync();
    window.addEventListener('storage', sync);

    let cancelled = false;
    fetch('/api/admin/camps')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          saveAllCamps(data);
          setCamps(data);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      window.removeEventListener('storage', sync);
    };
  }, []);

  return camps;
}
