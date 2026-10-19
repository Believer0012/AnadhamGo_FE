"use client";
import React from 'react';
import { RefreshCw, QrCode, Sparkles, X } from 'lucide-react';

export default function AdminHeader({
    activeTab,
    bookingsCount = 0,
    isMobile,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    setScannerOverlayOpen,
    fetchBookings,
    isOnlineMode
}) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '24px',
            gap: '12px'
        }}>
            {/* Left: Breadcrumbs & Section Title */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '10px', color: '#59655D', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                        Aanandham Enterprise HQ
                    </span>
                    <span style={{ color: '#CBD5E1', fontSize: '10px' }}>/</span>
                    <span style={{ fontSize: '10px', color: '#E5A93B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                        {activeTab.toUpperCase()}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: '800', margin: 0, color: '#121613', letterSpacing: '-0.02em' }}>
                        {activeTab === 'destinations' ? 'Destination SEO & Regional Landing Pages' :
                         activeTab === 'blog' ? 'Blog Newsroom & Wilderness Travel Guides' :
                         activeTab === 'about' ? 'Brand Story & Founding Mountain Philosophy' :
                         activeTab === 'services' ? 'Expedition Services & Technology Packages' :
                         activeTab === 'contact' ? '24/7 Hotline & WhatsApp Concierge Desk' :
                         activeTab === 'properties' ? 'Campsites & Pod Showcase (Live OpenPMS Sync)' :
                         activeTab === 'testimonials' ? 'Camper Testimonials & Social Proof' :
                         'Marketing & Destination CMS Studio'}
                    </h1>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#DCFCE7', color: '#166534', border: '1px solid rgba(22, 101, 52, 0.2)', padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '800' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E', display: 'inline-block', boxShadow: '0 0 6px #22C55E' }} />
                        {isOnlineMode ? 'Live DB' : 'Local WAL'} · {bookingsCount} Bookings
                    </span>
                </div>
            </div>

            {/* Right: Quick actions for mobile/desktop */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                    onClick={fetchBookings}
                    title="Refresh data from server"
                    style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        background: '#FFFFFF',
                        border: '1px solid rgba(18,22,19,0.1)',
                        color: '#121613',
                        fontSize: '12px',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                    }}
                >
                    <RefreshCw size={13} />
                    <span>Sync</span>
                </button>

                <button
                    onClick={() => setScannerOverlayOpen(true)}
                    title="Open QR Scanner"
                    className="btn-lime"
                    style={{
                        padding: '8px 14px',
                        fontSize: '12px',
                        fontWeight: '800',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                    }}
                >
                    <QrCode size={14} />
                    <span>Scanner</span>
                </button>
            </div>
        </div>
    );
}
