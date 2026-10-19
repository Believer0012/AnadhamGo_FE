"use client";
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Phone, Calendar, X, ChevronRight } from 'lucide-react';
import { waLink, DEFAULT_WA_PHONE, logWhatsAppInquiry } from '@/lib/whatsapp';
import { WhatsAppIcon } from './BrandIcons';
import MobileTabBar from './MobileTabBar';

const BookingEngineModal = dynamic(() => import('../BookingEngineModal'), { ssr: false });

const DOCK_SPRING = {
    type: 'spring',
    stiffness: 280,
    damping: 26,
    mass: 0.85
};

export default function GlobalActionHub() {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeCampContext, setActiveCampContext] = useState(null);
    const [isGlobalBookingModalOpen, setIsGlobalBookingModalOpen] = useState(false);
    const dockRef = useRef(null);

    // Hide on marshal scanner or dedicated admin pages
    const isScanner = pathname?.startsWith('/marshal') || pathname?.startsWith('/admin');

    // On the homepage the hero has its own search + CTAs; keep the dock out of the way until it's scrolled past
    const [isOverHero, setIsOverHero] = useState(pathname === '/');
    useEffect(() => {
        if (pathname !== '/') {
            setIsOverHero(false);
            return;
        }
        const onScroll = () => setIsOverHero(window.scrollY < window.innerHeight * 0.7);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [pathname]);

    // Synchronize active stay context from current page
    useEffect(() => {
        if (typeof window !== 'undefined' && window.__AANANDHAM_ACTIVE_CAMP_CONTEXT__) {
            setActiveCampContext(window.__AANANDHAM_ACTIVE_CAMP_CONTEXT__);
        }

        const handleContextChange = (e) => {
            setActiveCampContext(e.detail || null);
        };

        window.addEventListener('aanandham_camp_context_change', handleContextChange);
        return () => window.removeEventListener('aanandham_camp_context_change', handleContextChange);
    }, []);

    // Clear camp context if user navigates away from campsite detail pages
    useEffect(() => {
        if (!pathname?.startsWith('/camps/')) {
            setActiveCampContext(null);
        }
    }, [pathname]);

    // Close on click outside (Desktop Dock)
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dockRef.current && !dockRef.current.contains(e.target)) {
                setIsExpanded(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (isScanner) return null;

    const isCampPage = Boolean(activeCampContext?.camp && pathname?.startsWith('/camps/'));
    // Stay pages keep the sticky booking bar (price + Book); all other pages get the tab bar
    const showBookingBar = Boolean(pathname?.startsWith('/camps'));
    const camp = activeCampContext?.camp;
    const currentRoom = activeCampContext?.currentRoom;
    const roomPrice = activeCampContext?.roomPrice || camp?.price || 2499;
    const selectedDate = activeCampContext?.selectedDate || 'Upcoming Weekend Batch';
    const guestsCount = activeCampContext?.guestsCount || 2;
    const roomName = currentRoom?.name || activeCampContext?.selectedRoom?.name || 'Standard Tent';

    const adminPhone = DEFAULT_WA_PHONE || '919074858014';
    const formattedPhone = `+91 ${adminPhone.slice(-10, -5)} ${adminPhone.slice(-5)}`;

    const whatsAppCampMessage = `Hi Aanandham! I want to check availability & book ${camp?.title || 'Wilderness Camp'} on ${selectedDate} for ${guestsCount} campers in ${roomName}.`;
    const whatsAppDefaultMessage = 'Hi Aanandham.go! I would like to book a wilderness camp / inquire about sunrise jeep trekking.';
    const activeWaMessage = isCampPage ? whatsAppCampMessage : whatsAppDefaultMessage;
    const whatsAppUrl = waLink(activeWaMessage, adminPhone);

    const handleBookNowClick = (e) => {
        if (e) e.preventDefault();
        const event = new CustomEvent('aanandham_open_booking', {
            cancelable: true,
            detail: isCampPage ? activeCampContext : null
        });
        window.dispatchEvent(event);
        if (!event.defaultPrevented) {
            // No page intercepted; open fallback global modal
            setIsGlobalBookingModalOpen(true);
        }
    };

    return (
        <>
            {/* ═════════════════════════════════════════════════════════════
                1. DESKTOP FLUID EXPANDING / COLLAPSING ACTION DOCK (> 768px)
            ═════════════════════════════════════════════════════════════ */}
            <LayoutGroup id="global-action-dock">
                <motion.aside
                    ref={dockRef}
                    layout
                    transition={DOCK_SPRING}
                    className={`desktop-global-action-dock ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}
                    data-hero-hidden={isOverHero ? 'true' : 'false'}
                    aria-label="Quick Booking & Concierge Actions"
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        zIndex: 999,
                        display: 'flex',
                        alignItems: 'center',
                        background: '#0B150E',
                        border: '1.5px solid rgba(255, 255, 255, 0.16)',
                        borderRadius: '999px',
                        padding: '7px 10px 7px 14px',
                        boxShadow: isExpanded 
                            ? '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.04)' 
                            : '0 12px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.04)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        cursor: isExpanded ? 'default' : 'pointer',
                        transform: 'translateZ(0)',
                        WebkitTransform: 'translateZ(0)',
                        willChange: 'transform'
                    }}
                    onClick={!isExpanded ? () => setIsExpanded(true) : undefined}
                >
                    {/* ── Persistent Base: Live Indicator + Desk Live Label ── */}
                    <motion.div 
                        layout="position" 
                        transition={DOCK_SPRING}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, userSelect: 'none' }}
                    >
                        <span style={{ position: 'relative', display: 'flex', width: '9px', height: '9px' }}>
                            <span style={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: '50%',
                                background: '#25D366',
                                opacity: 0.8,
                                animation: 'ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite'
                            }} />
                            <span style={{
                                position: 'relative',
                                width: '9px',
                                height: '9px',
                                borderRadius: '50%',
                                background: '#25D366',
                                boxShadow: '0 0 10px #25D366'
                            }} />
                        </span>

                        <span style={{
                            fontSize: '12px',
                            fontWeight: '800',
                            color: '#FFFFFF',
                            letterSpacing: '0.6px',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap'
                        }}>
                            {isExpanded 
                                ? 'Live Desk' 
                                : (isCampPage && camp?.shortTitle 
                                    ? `${camp.shortTitle.slice(0, 16)} Desk` 
                                    : 'Desk Live')}
                        </span>
                    </motion.div>

                    {/* ── Sliding Action Items (Call & WhatsApp) on Expansion ── */}
                    <AnimatePresence mode="popLayout">
                        {isExpanded && (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.88, x: -8 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.88, x: -8 }}
                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    marginLeft: '12px',
                                    flexShrink: 0
                                }}
                            >
                                {/* Direct Phone Call Button */}
                                <a
                                    href={`tel:+${adminPhone}`}
                                    className="action-dock-btn"
                                    title={`Call Desk: ${formattedPhone}`}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '7px 12px',
                                        borderRadius: '999px',
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        color: '#FFFFFF',
                                        textDecoration: 'none',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <Phone size={13} color="#F1B893" />
                                    <span>Call</span>
                                </a>

                                {/* Direct WhatsApp Concierge Button */}
                                <a
                                    href={whatsAppUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => logWhatsAppInquiry({
                                        text: activeWaMessage,
                                        source: 'Desktop Global Action Dock',
                                        campsiteId: camp?.id,
                                        guests: isCampPage ? guestsCount : undefined,
                                        travelDates: isCampPage ? selectedDate : undefined
                                    })}
                                    className="action-dock-btn"
                                    title="Chat on WhatsApp"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '7px 13px',
                                        borderRadius: '999px',
                                        background: 'rgba(37, 211, 102, 0.15)',
                                        border: '1px solid rgba(37, 211, 102, 0.35)',
                                        color: '#25D366',
                                        textDecoration: 'none',
                                        fontSize: '12px',
                                        fontWeight: '800',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <WhatsAppIcon size={14} color="#25D366" />
                                    <span>WhatsApp</span>
                                </a>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Persistent Primary Action Button (Multi-Use: Leads to specific camp booking when viewing camp) ── */}
                    <motion.div 
                        layout="position" 
                        transition={DOCK_SPRING}
                        style={{ marginLeft: '10px', flexShrink: 0 }}
                    >
                        <button
                            type="button"
                            onClick={handleBookNowClick}
                            className="action-dock-book-btn"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '7px 14px',
                                borderRadius: '999px',
                                background: '#e5a93b',
                                color: '#FFFFFF',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: '900',
                                letterSpacing: '-0.01em',
                                boxShadow: '0 4px 14px rgba(169, 84, 43, 0.4)',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Calendar size={13} strokeWidth={2.5} color="#FFFFFF" />
                            <span>{isCampPage ? `Book Stay · ₹${roomPrice.toLocaleString('en-IN')}` : 'Book Now'}</span>
                            {!isExpanded && <ChevronRight size={12} strokeWidth={3} color="#FFFFFF" />}
                        </button>
                    </motion.div>

                    {/* ── Close Button on Expanded State ── */}
                    <AnimatePresence mode="popLayout">
                        {isExpanded && (
                            <motion.button
                                layout
                                initial={{ opacity: 0, scale: 0.6, rotate: -45 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.6, rotate: -45 }}
                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(false);
                                }}
                                aria-label="Collapse Menu"
                                title="Collapse Menu"
                                style={{
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '50%',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: '#A2B6A6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    padding: 0,
                                    marginLeft: '8px',
                                    flexShrink: 0,
                                    transition: 'background 0.2s ease, color 0.2s ease'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)'; e.currentTarget.style.color = '#FFFFFF'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#A2B6A6'; }}
                            >
                                <X size={13} strokeWidth={2.5} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </motion.aside>
            </LayoutGroup>

            {/* ═════════════════════════════════════════════════════════════
                2. MOBILE CLEAN LUXURY THEME ACTION BAR (Screens <= 768px)
            ═════════════════════════════════════════════════════════════ */}
            {showBookingBar ? (
            <nav 
                className="mobile-sticky-action-bar"
                data-hero-hidden={isOverHero ? 'true' : 'false'}
                aria-label="Mobile Instant Booking Navigation"
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 9999,
                    background: 'rgba(11, 21, 14, 0.97)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '8px 12px calc(8px + env(safe-area-inset-bottom, 0px)) 12px',
                    display: 'none', // Controlled via CSS media query
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 -8px 28px rgba(0, 0, 0, 0.55)'
                }}
            >
                {/* 1. Phone Call Button (Direct Phone Call, Unchanged) */}
                <a
                    href={`tel:+${adminPhone}`}
                    aria-label="Call Aanandham Desk"
                    style={{
                        flex: '0 0 52px',
                        height: '44px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        borderRadius: '10px',
                        color: '#FFFFFF',
                        textDecoration: 'none',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'background 0.2s ease'
                    }}
                >
                    <Phone size={15} color="#F1B893" />
                    <span style={{ fontSize: '9.5px', fontWeight: '800', color: '#F1B893', letterSpacing: '0.3px' }}>Call</span>
                </a>

                {/* 2. WhatsApp Concierge Button (Dynamic with campsite, dates, guests & stay) */}
                <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => logWhatsAppInquiry({
                        text: activeWaMessage,
                        source: isCampPage ? `Mobile Sticky Action Bar (${camp?.title || 'Camp'})` : 'Mobile Sticky Action Bar',
                        campsiteId: camp?.id,
                        guests: isCampPage ? guestsCount : undefined,
                        travelDates: isCampPage ? selectedDate : undefined
                    })}
                    aria-label="Chat with Mountain Concierge on WhatsApp"
                    style={{
                        flex: '0 0 68px',
                        height: '44px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px',
                        background: 'rgba(37, 211, 102, 0.12)',
                        borderRadius: '10px',
                        border: '1px solid rgba(37, 211, 102, 0.3)',
                        color: '#25D366',
                        textDecoration: 'none',
                        transition: 'background 0.2s ease'
                    }}
                >
                    <WhatsAppIcon size={16} color="#25D366" />
                    <span style={{ fontSize: '9.5px', fontWeight: '800', color: '#25D366', letterSpacing: '0.3px' }}>WhatsApp</span>
                </a>

                {/* 3. Primary Multi-Use Action Button (Directly opens booking modal with selected stay & details) */}
                {isCampPage ? (
                    <button
                        type="button"
                        onClick={handleBookNowClick}
                        aria-label={`Book ${camp?.title || 'Stay'}`}
                        style={{
                            flex: 1,
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0 10px 0 12px',
                            background: '#e5a93b',
                            borderRadius: '10px',
                            color: '#FFFFFF',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            boxShadow: '0 4px 16px rgba(169, 84, 43, 0.4)',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ textAlign: 'left', minWidth: 0, lineHeight: 1.15 }}>
                            <div style={{ fontSize: '13px', fontWeight: '900', whiteSpace: 'nowrap' }}>
                                ₹{roomPrice.toLocaleString('en-IN')}{' '}
                                <span style={{ fontSize: '9.5px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.82)' }}>/ camper</span>
                            </div>
                            <div style={{ fontSize: '9.5px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.82)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                                {roomName}
                            </div>
                        </div>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            background: 'rgba(0, 0, 0, 0.22)',
                            color: '#FFFFFF',
                            padding: '5px 8px',
                            borderRadius: '7px',
                            fontSize: '11px',
                            fontWeight: '900',
                            letterSpacing: '0.3px',
                            flexShrink: 0
                        }}>
                            <span>BOOK</span>
                            <ChevronRight size={12} strokeWidth={3} />
                        </div>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleBookNowClick}
                        aria-label="Book Now"
                        style={{
                            flex: 1,
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            background: '#e5a93b',
                            borderRadius: '10px',
                            color: '#FFFFFF',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            fontWeight: '900',
                            fontSize: '13.5px',
                            letterSpacing: '-0.01em',
                            boxShadow: '0 4px 16px rgba(169, 84, 43, 0.4)',
                            cursor: 'pointer'
                        }}
                    >
                        <Calendar size={14} strokeWidth={2.5} color="#FFFFFF" />
                        <span>BOOK NOW</span>
                        <ChevronRight size={14} strokeWidth={3} color="#FFFFFF" />
                    </button>
                )}
            </nav>
            ) : (
                <MobileTabBar />
            )}

            {/* Keeps page content clear of the fixed mobile bar */}
            <div className="ah-mobile-spacer" aria-hidden="true" />

            {/* ═════════════════════════════════════════════════════════════
                3. FALLBACK GLOBAL BOOKING ENGINE MODAL (Multi-Use Everywhere)
            ═════════════════════════════════════════════════════════════ */}
            {isGlobalBookingModalOpen && (
                <BookingEngineModal
                    isOpen={isGlobalBookingModalOpen}
                    onClose={() => setIsGlobalBookingModalOpen(false)}
                    initialPackage={camp || null}
                    initialRoom={currentRoom || null}
                    initialRoomId={activeCampContext?.selectedRoomId || null}
                    initialDate={activeCampContext?.selectedDate || null}
                    initialGuests={activeCampContext?.guestsCount || 2}
                    initialAdults={activeCampContext?.guestsCount || 2}
                    initialCustomUnits={activeCampContext?.customUnits || null}
                />
            )}
        </>
    );
}
