'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';

/** ♡ Save toggle for any wishlist item. `id` comes from wishlistId.*() */
export default function SaveButton({ id, label, className = 'ah-save-btn' }) {
  const { has, toggle } = useWishlist();
  const saved = has(id);

  return (
    <button
      type="button"
      className={className}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${label} from wishlist` : `Save ${label} to wishlist`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
    >
      <Heart size={18} strokeWidth={2.2} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
    </button>
  );
}
