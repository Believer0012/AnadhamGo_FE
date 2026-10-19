'use client';

import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

/**
 * Mobile bottom sheet dialog: focus-trapped, closes on Escape / backdrop tap,
 * locks page scroll while open, and respects the iOS safe area.
 */
export default function BottomSheet({ open, onClose, title, children, footer }) {
  const ref = useRef(null);
  const titleId = useId();
  useFocusTrap(open, ref);
  // Latest onClose without re-running the open/close effect on every parent render
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current();
    document.addEventListener('keydown', onKey);
    window.__lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      window.__lenis?.start();
      document.body.style.overflow = prev || '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="ah-sheet" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className="ah-sheet__panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="ah-sheet__grip" aria-hidden="true" />
        <div className="ah-sheet__head">
          <h2 id={titleId} className="ah-h3">{title}</h2>
          <button type="button" className="ah-icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="ah-sheet__body">{children}</div>
        {footer ? <div className="ah-sheet__foot">{footer}</div> : null}
      </div>
    </div>
  );
}
