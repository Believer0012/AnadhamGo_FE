"use client";
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import { TriangleAlert } from 'lucide-react';

export default function GlobalErrorBoundary({ error, reset }) {
    const { user: currentUser, logout: handleLogout } = useAuth();

    useEffect(() => {
        // Log client-side error to console and observability pipeline
        console.error('Captured by Aanandham React Error Boundary:', error);
    }, [error]);

    return (
        <div style={{ backgroundColor: '#F8F9F5', color: '#121613', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'clip' }}>
            <SiteHeader 
                activePage="error" 
                currentUser={currentUser} 
                onLogout={handleLogout} 
                transparentOnTop={false}
            />

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '140px 20px 80px', textAlign: 'center' }}>
                <div style={{ maxWidth: '640px', width: '100%', margin: '0 auto' }}>
                    
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '20px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#EF4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            margin: '0 auto 24px'
                        }}
                    >
                        <TriangleAlert size={32} strokeWidth={2} />
                    </motion.div>

                    <div className="star-badge" style={{ margin: '0 auto 12px' }}>
                        <span className="star-icon">★</span> EXPEDITION RECOVERY DESK
                    </div>

                    <h1 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 'clamp(28px, 4vw, 42px)',
                        fontWeight: '800',
                        color: '#121613',
                        letterSpacing: '-0.03em',
                        margin: '0 0 16px',
                        lineHeight: 1.2
                    }}>
                        A Sudden Fog on the Mountain Trail
                    </h1>

                    <p style={{
                        fontSize: '15px',
                        color: '#59655D',
                        lineHeight: 1.65,
                        margin: '0 auto 32px',
                        maxWidth: '480px'
                    }}>
                        An unexpected runtime signal occurred while loading this view. Our basecamp telemetry has caught the event. You can reload this section safely.
                    </p>

                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => reset()}
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
                                cursor: 'pointer',
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
                            <span>Retry Mountain Trail</span>
                            <div className="btn-arrow-circle" style={{ width: '30px', height: '30px', fontSize: '13px', background: '#FFFFFF' }}>↻</div>
                        </button>

                        <Link
                            href="/"
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
                            <span>Return to Basecamp</span>
                            <span className="btn-arrow-circle" style={{ width: '30px', height: '30px', fontSize: '13px', background: '#FFFFFF', border: '1px solid rgba(18, 22, 19, 0.1)' }}>→</span>
                        </Link>
                    </div>

                    {error?.digest && (
                        <p style={{ marginTop: '28px', fontSize: '11px', color: '#8E9B92', fontFamily: 'monospace' }}>
                            Digest Trace: {error.digest}
                        </p>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
