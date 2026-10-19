'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Horizontal, scroll-snapping card rail. Native scrolling (touch, trackpad, keyboard)
 * does the work; the arrow buttons are a convenience for mouse users.
 * Render <RailControls rail={ref} /> anywhere to drive a rail by ref.
 */
export function useRail() {
  const ref = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  const scroll = (dir) => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: reduce ? 'auto' : 'smooth' });
  };

  return { ref, edges, scroll };
}

export function RailControls({ rail, label = 'items' }) {
  return (
    <div className="ah-rail-controls">
      <button type="button" className="ah-icon-btn" onClick={() => rail.scroll(-1)} disabled={rail.edges.start} aria-label={`Previous ${label}`}>
        <ChevronLeft size={20} aria-hidden="true" />
      </button>
      <button type="button" className="ah-icon-btn" onClick={() => rail.scroll(1)} disabled={rail.edges.end} aria-label={`Next ${label}`}>
        <ChevronRight size={20} aria-hidden="true" />
      </button>
    </div>
  );
}

export default function Rail({ rail, className = 'ah-rail--4', label, children }) {
  return (
    <div ref={rail.ref} className={`ah-rail ${className}`} role="list" aria-label={label} tabIndex={0}>
      {React.Children.map(children, (child) => (child ? <div role="listitem" style={{ display: 'flex' }}>{child}</div> : null))}
    </div>
  );
}
