'use client';

import { useCallback, useEffect, useState } from 'react';

// Same key the /camps directory already uses, so saved camps carry over.
// Real camps are stored by bare id (backwards compatible); other kinds are prefixed:
//   destination → "dest:<slug>", experience → "exp:<id>", event → "event:<id>".
// Sample stays have ids starting with "sample-".
export const WISHLIST_KEY = 'aanandham_user_wishlist';
const CHANGE_EVENT = 'aanandham_wishlist_change';

export const wishlistId = {
  stay: (id) => id,
  destination: (slug) => `dest:${slug}`,
  experience: (id) => `exp:${id}`,
  event: (id) => `event:${id}`,
};

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(ids) {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  } catch {
    // Storage unavailable (private mode / blocked) — the in-memory state still updates this tab
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: ids }));
}

/** Shared wishlist state, kept in sync across components and browser tabs. */
export function useWishlist() {
  const [ids, setIds] = useState([]);

  useEffect(() => {
    setIds(read());
    const onChange = (e) => setIds(Array.isArray(e.detail) ? e.detail : read());
    const onStorage = (e) => {
      if (e.key === null || e.key === WISHLIST_KEY) setIds(read());
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const has = useCallback((id) => ids.includes(id), [ids]);

  const toggle = useCallback((id) => {
    const current = read();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    write(next);
    setIds(next);
    return next.includes(id);
  }, []);

  const remove = useCallback((id) => {
    const next = read().filter((x) => x !== id);
    write(next);
    setIds(next);
  }, []);

  return { ids, count: ids.length, has, toggle, remove };
}
