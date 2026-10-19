"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import { Mountain, Compass, Tent, PhoneCall } from 'lucide-react';

export default function NotFound() {
    const { user: currentUser, logout: handleLogout } = useAuth();

    const QUICK_TRAILS = [
        {
            title: "Handcrafted Packages",
            subtitle: "Summit treks & ridge glamping",
            icon: Mountain,
            href: "/camps",
            badge: "Top Expeditions",
            accent: "#E5A93B"
        },
        {
            title: "About Our Tribe",
            subtitle: "Philosophy, guides & camp history",
            icon: Compass,
            href: "/about",
            badge: "Our Story",
            accent: "#10B981"
        },
        {
            title: "Custom Arrangements",
            subtitle: "College treks, offsites & celebrations",
            icon: Tent,
            href: "/#arrangements",
            badge: "Group Events",
            accent: "#F97316"
        },
        {
            title: "Expedition Dispatch Desk",
            subtitle: "24/7 mountain concierge hotline",
            icon: PhoneCall,
            href: "/contact",
            badge: "Get Help",
            accent: "#3B82F6"
        }
    ];

    return (
        <div style={{ backgroundColor: '#F8F9F5', color: '#121613', minHeight: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'clip' }}>
            
            {/* ── UNIFIED SITE HEADER ── */}
            <SiteHeader 
                activePage="404" 
                currentUser={currentUser} 
                onLogout={handleLogout} 
                transparentOnTop={false}
            />

            {/* ── MAIN 404 EXPERIENCE ── */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '120px 20px 80px', position: 'relative' }}>
                
                {/* Background Ambient Topo Lines Decor */}
                <div style={{
                    position: 'absolute',
                    top: '5%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'min(900px, 95vw)',
                    height: '550px',
                    background: 'radial-gradient(circle at center, rgba(213, 237, 85, 0.12) 0%, rgba(229, 169, 59, 0.06) 45%, transparent 70%)',
                    filter: 'blur(50px)',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />

                <div style={{ maxWidth: '1080px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    
                    {/* Top Star Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        style={{ display: 'inline-flex', marginBottom: '20px' }}
                    >
                        <div className="star-badge" style={{ background: '#FFFFFF', border: '1px solid rgba(18, 22, 19, 0.1)' }}>
                            <span className="star-icon">★</span> 404 · OFF-TRAIL EXPEDITION
                        </div>
                    </motion.div>

                    {/* Central Brand Emblem with Glowing Mountain Ring */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            display: 'inline-flex',
                            position: 'relative',
                            margin: '0 auto 24px',
                            padding: '16px',
                            background: '#FFFFFF',
                            borderRadius: '50%',
                            boxShadow: '0 16px 40px rgba(0,0,0,0.06), 0 0 0 1px rgba(18, 22, 19, 0.08)'
                        }}
                    >
                        <div style={{
                            width: '110px',
                            height: '110px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #121613 0%, #1E2520 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.2)'
                        }}>
                            <img 
                                src="/logo.png" 
                                alt="Aanandham Logo" 
                                style={{
                                    width: '74px',
                                    height: '74px',
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
                                }} 
                             loading="lazy" decoding="async"/>
                        </div>

                        {/* Tactical Mini Compass Needle Badge */}
                        <div style={{
                            position: 'absolute',
                            bottom: '6px',
                            right: '6px',
                            background: '#D5ED55',
                            color: '#121613',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: '3px solid #FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '900',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.12)'
                        }}>
                            <Compass size={26} strokeWidth={2.2} />
                        </div>
                    </motion.div>

                    {/* Massive Display 404 with Vintage Stamp */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}
                    >
                        <h1 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 'clamp(72px, 14vw, 150px)',
                            fontWeight: '900',
                            lineHeight: 0.9,
                            letterSpacing: '-0.05em',
                            margin: 0,
                            background: 'linear-gradient(180deg, #121613 0%, #3B473E 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            404
                        </h1>

                        {/* Tactile Ink Stamp */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            right: '-30px',
                            transform: 'translateY(-50%) rotate(-12deg)',
                            background: '#FFF5EB',
                            border: '2px dashed #C2410C',
                            color: '#C2410C',
                            fontSize: 'clamp(10px, 1.8vw, 13px)',
                            fontWeight: '900',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            boxShadow: '0 4px 12px rgba(194, 65, 12, 0.15)',
                            pointerEvents: 'none'
                        }}>
                            LOST IN MIST
                        </div>
                    </motion.div>

                    {/* Title & Subtitle */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        style={{ maxWidth: '620px', margin: '0 auto 36px' }}
                    >
                        <h2 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 'clamp(24px, 4vw, 34px)',
                            fontWeight: '800',
                            color: '#121613',
                            letterSpacing: '-0.025em',
                            margin: '0 0 12px',
                            lineHeight: 1.25
                        }}>
                            Looks like this trail leads off the map.
                        </h2>
                        <p style={{
                            fontSize: '15.5px',
                            color: '#59655D',
                            lineHeight: 1.65,
                            margin: 0
                        }}>
                            Even our veteran mountain guides take a wrong turn in the Suryanelli fog. Let's guide you back to the marked ridge trails.
                        </p>
                    </motion.div>

                    {/* Primary CTA Action Row */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '14px',
                            marginBottom: '60px'
                        }}
                    >
                        <Link 
                            href="/" 
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                padding: '14px 14px 14px 24px',
                                borderRadius: '999px',
                                background: '#121613',
                                color: '#FFFFFF',
                                border: '1px solid rgba(229, 169, 59, 0.4)',
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                                fontSize: '14.5px',
                                fontWeight: '800',
                                textDecoration: 'none',
                                minHeight: '52px',
                                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 12px 30px rgba(229, 169, 59, 0.25)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <span>← Return to Basecamp</span>
                            <div className="btn-arrow-circle" style={{ width: '30px', height: '30px', fontSize: '13px', background: '#FFFFFF' }}>←</div>
                        </Link>

                        <Link 
                            href="/camps" 
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                padding: '14px 14px 14px 24px',
                                borderRadius: '999px',
                                background: 'linear-gradient(135deg, #D5ED55 0%, #B7DB46 100%)',
                                color: '#121613',
                                border: '1px solid rgba(213, 237, 85, 0.4)',
                                boxShadow: '0 8px 24px rgba(213, 237, 85, 0.25)',
                                fontSize: '14.5px',
                                fontWeight: '900',
                                textDecoration: 'none',
                                minHeight: '52px',
                                fontFamily: 'var(--font-heading)',
                                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 12px 30px rgba(213, 237, 85, 0.4)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(213, 237, 85, 0.25)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <span>Explore Expeditions</span>
                            <span className="btn-arrow-circle" style={{ width: '30px', height: '30px', fontSize: '13px', background: '#FFFFFF', border: '1px solid rgba(18, 22, 19, 0.1)' }}>→</span>
                        </Link>
                    </motion.div>

                    {/* Quick Marked Trails Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
                            gap: '16px',
                            textAlign: 'left'
                        }}
                    >
                        {QUICK_TRAILS.map((trail, idx) => (
                            <Link
                                key={idx}
                                href={trail.href}
                                className="hover-lift"
                                style={{
                                    background: '#FFFFFF',
                                    border: '1px solid rgba(18, 22, 19, 0.08)',
                                    borderRadius: '20px',
                                    padding: '20px',
                                    textDecoration: 'none',
                                    color: '#121613',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
                                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '12px',
                                        background: 'rgba(18, 22, 19, 0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '16px',
                                        color: trail.accent
                                    }}>
                                        <trail.icon size={16} />
                                    </div>
                                    <span style={{
                                        fontSize: '10.5px',
                                        fontWeight: '800',
                                        color: trail.accent,
                                        background: 'rgba(0,0,0,0.04)',
                                        padding: '3px 8px',
                                        borderRadius: '999px',
                                        textTransform: 'uppercase'
                                    }}>
                                        {trail.badge}
                                    </span>
                                </div>

                                <div>
                                    <h3 style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '16px',
                                        fontWeight: '800',
                                        color: '#121613',
                                        margin: '0 0 4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span>{trail.title}</span>
                                        <span style={{ fontSize: '12px', opacity: 0.6 }}>→</span>
                                    </h3>
                                    <p style={{
                                        fontSize: '12.5px',
                                        color: '#657268',
                                        margin: 0,
                                        lineHeight: 1.45
                                    }}>
                                        {trail.subtitle}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </motion.div>

                </div>
            </main>

            {/* ── SITE FOOTER ── */}
            <Footer />
        </div>
    );
}
