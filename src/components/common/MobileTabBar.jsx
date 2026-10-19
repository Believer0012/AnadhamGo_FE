'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Route, Heart, User } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuth } from '../../hooks/useAuth';

const TABS = [
  { label: 'Home', href: '/', icon: Home, match: (p) => p === '/' },
  { label: 'Explore', href: '/destinations', icon: Compass, match: (p) => /^\/(destinations|stays|experiences|events|workation|camps)/.test(p) },
  { label: 'Trips', href: '/plan', icon: Route, match: (p) => p.startsWith('/plan') },
  { label: 'Wishlist', href: '/wishlist', icon: Heart, match: (p) => p.startsWith('/wishlist') },
  { label: 'Profile', href: '/login', icon: User, match: (p) => /^\/(login|signup)/.test(p) },
];

/**
 * Mobile bottom navigation (≤768px). Uses the existing `mobile-sticky-action-bar` class so the
 * global rules still apply: shown only on mobile, hidden while the booking modal is open.
 */
export default function MobileTabBar() {
  const pathname = usePathname() || '/';
  const { count } = useWishlist();
  const { user } = useAuth();

  return (
    <nav className="mobile-sticky-action-bar ah-tabbar" aria-label="Main">
      {TABS.map(({ label, href, icon: Icon, match }) => {
        const active = match(pathname);
        const isProfile = label === 'Profile';
        const text = isProfile && user?.loggedIn ? (user.name || 'Profile').split(' ')[0].slice(0, 10) : label;
        return (
          <Link key={label} href={href} className="ah-tabbar__item" aria-current={active ? 'page' : undefined}>
            <span className="ah-tabbar__icon">
              <Icon size={21} strokeWidth={active ? 2.4 : 1.9} aria-hidden="true" />
              {label === 'Wishlist' && count > 0 ? <span className="ah-tabbar__badge" aria-hidden="true">{count > 9 ? '9+' : count}</span> : null}
            </span>
            <span className="ah-tabbar__label">{text}</span>
            {label === 'Wishlist' && count > 0 ? <span className="sr-only">, {count} saved</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
