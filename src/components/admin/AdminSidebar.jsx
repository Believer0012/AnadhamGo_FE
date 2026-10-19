"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
    LayoutDashboard, ClipboardList, Tent, Calendar, Users, IndianRupee, 
    QrCode, BadgePercent, MessageSquareQuote, Settings, ScrollText, ChevronLeft, 
    ChevronRight, X, ArrowUpRight, Smartphone, ShieldCheck, RefreshCw, Sparkles, ExternalLink,
    Compass, BookOpen, FileText, Briefcase, PhoneCall, CreditCard
} from 'lucide-react';
import { 
    drawerWaveVariants, drawerStaggerVariants, drawerItemVariants 
} from './AdminSharedStyles';

export default function AdminSidebar({
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    isMobile,
    bookingsCount = 0,
    handleLogout,
    setScannerOverlayOpen,
    fetchBookings
}) {
    const isCollapsed = isSidebarCollapsed && !isMobile;

    const navSections = [
        {
            category: 'Website Content & SEO',
            items: [
                { id: 'properties', name: 'Campsites & Pods', icon: Tent, desc: '6 Verified Camps' },
                { id: 'destinations', name: 'Destination SEO', icon: Compass, desc: 'Munnar, Vagamon, Wayanad' },
                { id: 'blog', name: 'Blog & Travel Guides', icon: BookOpen, desc: 'Published Articles' }
            ]
        },
        {
            category: 'Brand Pages & Copy',
            items: [
                { id: 'about', name: 'Brand Story & Charter', icon: FileText, desc: '/about Page' },
                { id: 'services', name: 'Services & Packages', icon: Briefcase, desc: '/services Page' },
                { id: 'contact', name: 'Hotline & Concierge', icon: PhoneCall, desc: '/contact Hotlines' },
                { id: 'testimonials', name: 'Guest Reviews', icon: MessageSquareQuote, desc: 'Camper Testimonials' }
            ]
        },
        {
            category: 'Gateway & System Controls',
            items: [
                { id: 'payments', name: 'Payment Gateway', icon: CreditCard, desc: 'Razorpay / Safe Mode Toggle' }
            ]
        }
    ];

    const renderSidebarContent = (inMobile = false) => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
            {/* Header / Logo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', padding: isCollapsed ? '8px 0' : '4px 2px 8px' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#D5ED55', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(213, 237, 85, 0.4)' }}>
                        <img src="/logo.png" alt="Aanandham" style={{ width: '22px', height: '22px', objectFit: 'contain' }} loading="lazy" decoding="async" />
                    </div>
                    {!isCollapsed && (
                        <div>
                            <div style={{ fontSize: '15px', fontWeight: '900', color: '#121613', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
                                Aanandham<span style={{ color: '#E5A93B' }}>.go</span>
                            </div>
                            <div style={{ fontSize: '9.5px', fontWeight: '800', color: '#166534', letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: '2px' }}>
                                Master Console
                            </div>
                        </div>
                    )}
                </Link>

                {!isMobile && !inMobile && (
                    <button
                        onClick={() => setIsSidebarCollapsed(prev => !prev)}
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '8px',
                            background: '#F1F3EC',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#59655D'
                        }}
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                )}

                {inMobile && (
                    <button
                        onClick={() => setIsMobileSidebarOpen(false)}
                        aria-label="Close menu"
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#F1F3EC',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Sync & QR Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: isCollapsed ? '1fr' : '1fr 1fr', gap: '8px' }}>
                <button
                    onClick={fetchBookings}
                    title="Sync Database with Live Cloud"
                    style={{
                        padding: isCollapsed ? '9px 0' : '9px 10px',
                        borderRadius: '10px',
                        fontSize: isCollapsed ? '13px' : '11.5px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        background: '#121613',
                        color: '#D5ED55',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <RefreshCw size={13} strokeWidth={2.5} />
                    {!isCollapsed && <span>Sync Cloud</span>}
                </button>

                <button
                    onClick={() => { setScannerOverlayOpen(true); if (inMobile) setIsMobileSidebarOpen(false); }}
                    title="Open Live QR Pass Scanner"
                    style={{
                        padding: isCollapsed ? '9px 0' : '9px 10px',
                        borderRadius: '10px',
                        fontSize: isCollapsed ? '13px' : '11.5px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        background: '#F1F3EC',
                        border: '1px solid rgba(18, 22, 19, 0.08)',
                        color: '#121613',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <QrCode size={13} strokeWidth={2.5} />
                    {!isCollapsed && <span>Scanner</span>}
                </button>
            </div>

            {/* Navigation Sections */}
            <nav className="no-scrollbar admin-sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: isCollapsed ? '12px' : '16px', flex: 1, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {navSections.map((sec, sIdx) => (
                    <div key={sIdx}>
                        {!isCollapsed && (
                            <div style={{ fontSize: '10px', fontWeight: '800', color: '#8A958E', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px', paddingLeft: '8px' }}>
                                {sec.category}
                            </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {sec.items.map(item => {
                                const isActive = activeTab === item.id;
                                const ItemIcon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveTab(item.id);
                                            if (inMobile) setIsMobileSidebarOpen(false);
                                        }}
                                        title={isCollapsed ? item.name : undefined}
                                        style={{
                                            width: '100%',
                                            padding: isCollapsed ? '10px 0' : '9px 12px',
                                            borderRadius: '11px',
                                            background: isActive ? '#D5ED55' : 'transparent',
                                            color: isActive ? '#0B150E' : '#333D36',
                                            border: isActive ? '1px solid rgba(180, 210, 60, 0.8)' : '1px solid transparent',
                                            fontSize: '13px',
                                            fontWeight: isActive ? '900' : '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: isCollapsed ? 'center' : 'space-between',
                                            textAlign: 'left',
                                            boxShadow: isActive ? '0 3px 10px rgba(213, 237, 85, 0.3)' : 'none',
                                            transition: 'all 0.18s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: isCollapsed ? '0' : '10px' }}>
                                            <ItemIcon size={16} strokeWidth={isActive ? 2.5 : 2} color={isActive ? '#0B150E' : '#59655D'} />
                                            {!isCollapsed && <span>{item.name}</span>}
                                        </div>
                                        {!isCollapsed && item.count !== undefined && (
                                            <span style={{
                                                background: isActive ? '#0B150E' : '#E8EBE3',
                                                color: isActive ? '#D5ED55' : '#121613',
                                                fontSize: '11px',
                                                fontWeight: '800',
                                                padding: '2px 8px',
                                                borderRadius: '999px',
                                                minWidth: '18px',
                                                textAlign: 'center'
                                            }}>
                                                {item.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Bottom Profile & Sign Out */}
            <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid rgba(18, 22, 19, 0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: isCollapsed ? '6px 0' : '8px 10px', justifyContent: isCollapsed ? 'center' : 'flex-start', background: '#F8F9F5', borderRadius: '12px', border: '1px solid rgba(18, 22, 19, 0.08)' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#D5ED55', color: '#0B150E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '900', flexShrink: 0, boxShadow: '0 2px 6px rgba(213, 237, 85, 0.4)', overflow: 'hidden' }}>
                        <img src="/logo.png" alt="Aanandham" style={{ width: '20px', height: '20px', objectFit: 'contain' }} loading="lazy" decoding="async" />
                    </div>
                    {!isCollapsed && (
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#121613', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                Aanandham Admin
                            </div>
                            <div style={{ fontSize: '9.5px', color: '#7D8880', fontWeight: '600' }}>
                                All Kerala Camps
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: isCollapsed ? 'column' : 'row', gap: '6px' }}>
                    {!isCollapsed && (
                        <>
                            <Link
                                href="/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    flex: 1,
                                    padding: '7px 8px',
                                    borderRadius: '8px',
                                    background: '#FFFFFF',
                                    border: '1px solid rgba(18, 22, 19, 0.12)',
                                    color: '#121613',
                                    textDecoration: 'none',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                }}
                            >
                                <span>Website <ArrowUpRight size={12} strokeWidth={2.5} /></span>
                            </Link>
                            <a
                                href="http://localhost:3001/admin"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    flex: 1,
                                    padding: '7px 8px',
                                    borderRadius: '8px',
                                    background: '#101E13',
                                    border: '1px solid rgba(213, 237, 85, 0.25)',
                                    color: '#D5ED55',
                                    textDecoration: 'none',
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                }}
                            >
                                <ShieldCheck size={12} /> <span>OpenPMS</span>
                            </a>
                        </>
                    )}
                    <button
                        onClick={handleLogout}
                        title="Sign Out from Master HQ"
                        style={{
                            flex: isCollapsed ? undefined : 1,
                            padding: '7px 8px',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#DC2626',
                            fontSize: '11px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                        }}
                    >
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Fixed Sidebar */}
            {!isMobile && (
                <aside style={{
                    width: isSidebarCollapsed ? '80px' : '315px',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    background: '#FFFFFF',
                    borderRight: '1px solid rgba(18, 22, 19, 0.08)',
                    padding: isSidebarCollapsed ? '16px 8px' : '18px 16px',
                    zIndex: 50,
                    boxSizing: 'border-box',
                    transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                    {renderSidebarContent(false)}
                </aside>
            )}

            {/* Mobile Fullscreen Wave Menu */}
            <AnimatePresence>
                {isMobile && isMobileSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 100020,
                            background: '#FFFFFF',
                            padding: '20px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            boxSizing: 'border-box'
                        }}
                    >
                        {renderSidebarContent(true)}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
