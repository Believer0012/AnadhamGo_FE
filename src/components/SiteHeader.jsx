"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ArrowRight, ArrowUpRight, X, Menu, Heart } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { waLink } from '../lib/whatsapp';
import { WhatsAppIcon } from './common/BrandIcons';
import { getDestinationsByGroup } from '../lib/destinationsData';

// Search is only needed once the overlay opens — keep it out of the initial header bundle.
const DiscoverySearch = dynamic(() => import('./search/DiscoverySearch'), { ssr: false });

// Single source of truth for primary navigation. `match` is the `activePage` value
// each item highlights for. Update hrefs here as new sections/pages ship.
export const PRIMARY_NAV = [
    { label: 'Destinations', href: '/destinations', match: 'destinations', menu: true },
    { label: 'Stays', href: '/stays', match: 'camps' },
    { label: 'Experiences', href: '/experiences', match: 'experiences' },
    { label: 'Events', href: '/events', match: 'events' },
    { label: 'Guides', href: '/blog', match: 'blog' },
];

const SECONDARY_NAV = [
    { label: 'Trip planner', href: '/plan' },
    { label: 'Workation', href: '/workation' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contact' },
];

const menuThumb = (src) => (src.includes('images.unsplash.com') ? src.replace(/([?&])w=\d+/, '$1w=120') : src);

export default function SiteHeader({
    transparentOnTop = true,
    activePage = 'home',
    // eslint-disable-next-line no-unused-vars
    currentUser = null,
    // eslint-disable-next-line no-unused-vars
    onLogout = null
}) {
    const [scrolled, setScrolled] = useState(!transparentOnTop);
    const scrolledRef = useRef(!transparentOnTop);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isDestMenuOpen, setIsDestMenuOpen] = useState(false);
    const destMenuRef = useRef(null);
    const searchTriggerRef = useRef(null);
    const { count: wishlistCount } = useWishlist();

    const himalaya = getDestinationsByGroup('himalaya').slice(0, 6);
    const kerala = getDestinationsByGroup('kerala').filter((d) => d.status === 'live');

    // RAF-throttled scroll listener toggles transparent/solid states
    useEffect(() => {
        let rafId = null;
        const onScroll = () => {
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                const isPast = window.scrollY > 30;
                if (isPast !== scrolledRef.current) {
                    scrolledRef.current = isPast;
                    setScrolled(isPast);
                }
                rafId = null;
            });
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []);

    // Scroll lock while the drawer or search overlay is open
    const isLocked = isMobileMenuOpen || isSearchOpen;
    useEffect(() => {
        if (!isLocked) return;
        window.__lenis?.stop();
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.__lenis?.start();
            document.body.style.overflow = originalOverflow || '';
        };
    }, [isLocked]);

    const closeSearch = useCallback(() => {
        setIsSearchOpen(false);
        searchTriggerRef.current?.focus();
    }, []);

    // Escape closes whichever layer is open
    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== 'Escape') return;
            if (isSearchOpen) closeSearch();
            else if (isMobileMenuOpen) setIsMobileMenuOpen(false);
            else if (isDestMenuOpen) setIsDestMenuOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isSearchOpen, isMobileMenuOpen, isDestMenuOpen, closeSearch]);

    // Close the destinations menu when focus/click leaves it
    useEffect(() => {
        if (!isDestMenuOpen) return;
        const onDown = (e) => {
            if (destMenuRef.current && !destMenuRef.current.contains(e.target)) setIsDestMenuOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [isDestMenuOpen]);

    const isSolid = !transparentOnTop || scrolled || isMobileMenuOpen;

    // Skip link for every page: jumps to #main-content, or the page's <main> if it has no such id
    const skipToContent = (e) => {
        const target = document.getElementById('main-content') || document.querySelector('main');
        if (!target) return;
        e.preventDefault();
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: false });
        target.scrollIntoView({ block: 'start' });
    };

    return (
        <>
            <a href="#main-content" className="skip-to-content" onClick={skipToContent}>
                Skip to main content
            </a>
            <header className="ah-header" data-solid={isSolid ? 'true' : 'false'}>
                <div className="ah-container ah-header__inner">
                    <Link href="/" className="ah-brand" aria-label="Aanandham.go home">
                        <img src="/logo.png" alt="" width="40" height="40" loading="eager" decoding="async" />
                        <span>Aanandham<em>.go</em></span>
                    </Link>

                    <nav className="ah-nav" aria-label="Primary">
                        {PRIMARY_NAV.map((item) =>
                            item.menu ? (
                                <div
                                    key={item.label}
                                    ref={destMenuRef}
                                    className="ah-nav__item"
                                    onMouseEnter={() => setIsDestMenuOpen(true)}
                                    onMouseLeave={() => setIsDestMenuOpen(false)}
                                    onBlur={(e) => {
                                        if (!e.currentTarget.contains(e.relatedTarget)) setIsDestMenuOpen(false);
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="ah-nav__trigger"
                                        aria-expanded={isDestMenuOpen}
                                        aria-controls="ah-dest-menu"
                                        aria-current={activePage === item.match ? 'page' : undefined}
                                        onClick={(e) => {
                                            // Mouse users already opened it on hover; keyboard (detail 0) and touch toggle.
                                            const isHoverClick = e.detail > 0 && window.matchMedia('(hover: hover)').matches;
                                            setIsDestMenuOpen((v) => (isHoverClick ? true : !v));
                                        }}
                                    >
                                        {item.label}
                                        <ChevronDown size={15} aria-hidden="true" style={{ transition: 'transform .2s', transform: isDestMenuOpen ? 'rotate(180deg)' : 'none' }} />
                                    </button>
                                    {isDestMenuOpen ? (
                                        <div id="ah-dest-menu" className="ah-nav__menu">
                                            <span className="ah-nav__menu-label">Parvati Valley · Himachal</span>
                                            {himalaya.map((d) => (
                                                <Link key={d.slug} href={`/destinations/${d.slug}`} onClick={() => setIsDestMenuOpen(false)}>
                                                    <img src={menuThumb(d.heroImage)} alt="" width="44" height="44" loading="lazy" />
                                                    <span>
                                                        <strong>{d.name}</strong>
                                                        <small>{d.tagline}</small>
                                                    </span>
                                                </Link>
                                            ))}
                                            {kerala.length > 0 ? <span className="ah-nav__menu-label" style={{ marginTop: 8 }}>Western Ghats · Kerala</span> : null}
                                            {kerala.map((d) => (
                                                <Link key={d.slug} href={`/destinations/${d.slug}`} onClick={() => setIsDestMenuOpen(false)}>
                                                    <img src={menuThumb(d.heroImage)} alt="" width="44" height="44" loading="lazy" />
                                                    <span>
                                                        <strong>{d.name}</strong>
                                                        <small>Stays open now</small>
                                                    </span>
                                                </Link>
                                            ))}
                                            <Link href="/destinations" className="ah-nav__menu-all" onClick={() => setIsDestMenuOpen(false)}>
                                                All destinations <ArrowRight size={15} aria-hidden="true" />
                                            </Link>
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="ah-nav__link"
                                    aria-current={activePage === item.match ? 'page' : undefined}
                                >
                                    {item.label}
                                </Link>
                            )
                        )}
                    </nav>

                    <div className="ah-header__actions">
                        <button
                            ref={searchTriggerRef}
                            type="button"
                            className="ah-header__icon"
                            aria-label="Search destinations, stays and guides"
                            aria-haspopup="dialog"
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                setIsSearchOpen(true);
                            }}
                        >
                            <Search size={18} aria-hidden="true" />
                        </button>
                        <Link
                            href="/wishlist"
                            className="ah-header__icon ah-header__wishlist"
                            aria-label={wishlistCount ? `Wishlist, ${wishlistCount} saved` : 'Wishlist'}
                            aria-current={activePage === 'wishlist' ? 'page' : undefined}
                        >
                            <Heart size={18} aria-hidden="true" />
                            {wishlistCount > 0 ? <span className="ah-header__count" aria-hidden="true">{wishlistCount > 99 ? '99+' : wishlistCount}</span> : null}
                        </Link>
                        <Link href="/camps" className="ah-btn ah-btn--primary ah-btn--sm ah-header__book">
                            Book Now
                        </Link>
                        <button
                            type="button"
                            className="ah-header__icon ah-burger"
                            onClick={() => setIsMobileMenuOpen((v) => !v)}
                            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={isMobileMenuOpen}
                            aria-controls="ah-mobile-drawer"
                        >
                            {isMobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Mobile drawer ── */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        id="ah-mobile-drawer"
                        key="ah-mobile-drawer"
                        className="ah-drawer"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Menu"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <nav className="ah-drawer__primary" aria-label="Primary">
                            {PRIMARY_NAV.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    aria-current={activePage === item.match ? 'page' : undefined}
                                >
                                    {item.label}
                                    <ArrowUpRight size={22} aria-hidden="true" />
                                </Link>
                            ))}
                        </nav>
                        <nav className="ah-drawer__secondary" aria-label="Company">
                            {SECONDARY_NAV.map((item) => (
                                <Link key={item.label} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                        <div className="ah-drawer__cta">
                            <Link href="/camps" className="ah-btn ah-btn--primary" onClick={() => setIsMobileMenuOpen(false)}>
                                Book Now
                            </Link>
                            <a href={waLink('Hi Aanandham Team!')} target="_blank" rel="noopener noreferrer" className="ah-btn ah-btn--ghost-light">
                                <WhatsAppIcon size={17} /> Chat on WhatsApp
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Search overlay ── */}
            {isSearchOpen ? (
                <div
                    className="ah-search-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Search"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeSearch();
                    }}
                >
                    <button type="button" className="ah-header__icon ah-search-overlay__close" aria-label="Close search" onClick={closeSearch}>
                        <X size={20} aria-hidden="true" />
                    </button>
                    <div className="ah-search-overlay__inner">
                        <p className="ah-eyebrow" style={{ color: '#F1B893', marginBottom: 16 }}>Search Aanandham</p>
                        <DiscoverySearch autoFocus onNavigate={() => setIsSearchOpen(false)} />
                    </div>
                </div>
            ) : null}
        </>
    );
}
