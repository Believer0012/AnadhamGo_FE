'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Images } from 'lucide-react';

/**
 * Mobile swipe gallery (native scroll-snap, no JS drag handling). Tapping a photo calls
 * onOpen(index) — used to open the property's existing full-screen lightbox.
 */
export default function SwipeGallery({ images = [], title = '', onOpen }) {
  const ref = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  if (images.length === 0) return null;

  return (
    <div className="ah-swipe">
      <div ref={ref} className="ah-swipe__track" role="region" aria-roledescription="carousel" aria-label={`${title} photos`}>
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            className="ah-swipe__slide"
            onClick={() => onOpen?.(i)}
            aria-label={`Open photo ${i + 1} of ${images.length}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
          </button>
        ))}
      </div>
      <span className="ah-swipe__count" aria-live="polite">
        <Images size={13} aria-hidden="true" /> {Math.min(index + 1, images.length)} / {images.length}
      </span>
      {images.length > 1 ? (
        <div className="ah-swipe__dots" aria-hidden="true">
          {images.slice(0, 8).map((_, i) => <span key={i} data-active={i === Math.min(index, 7) ? 'true' : 'false'} />)}
        </div>
      ) : null}
    </div>
  );
}
