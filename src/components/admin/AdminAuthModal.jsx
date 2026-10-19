"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { COL_GAP_14 } from './AdminSharedStyles';

export default function AdminAuthModal({
    passcode,
    setPasscode,
    passcodeError,
    rememberMe,
    setRememberMe,
    handleLogin
}) {
    return (
            <div style={{ minHeight: '100dvh', background: '#F8F9F5', color: '#121613', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.96, y: 14 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    style={{ 
                        background: '#FFFFFF', 
                        border: '1px solid rgba(18, 22, 19, 0.1)', 
                        borderRadius: '24px', 
                        padding: '44px 36px', 
                        maxWidth: '440px', 
                        width: '100%', 
                        textAlign: 'center', 
                        boxShadow: '0 12px 40px rgba(0,0,0,0.06)' 
                    }}
                >
                    <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img
                            src="/logo.png"
                            alt="Aanandham.go Official Logo"
                            style={{ height: '62px', width: 'auto', objectFit: 'contain', marginBottom: '14px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' }}
                         loading="lazy" decoding="async"/>
                        <div className="star-badge">
<span className="star-icon">★</span> BASECAMP COMMAND
                        </div>
                    </div>

                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: '800', margin: '0 0 8px', color: '#121613', letterSpacing: '-0.02em' }}>
                        Coordinator Portal
                    </h2>
                    <p style={{ fontSize: '14px', color: '#59655D', lineHeight: 1.55, marginBottom: '28px' }}>
                        Enter coordinator passcode to manage inventory, photo galleries, event batches, and live bookings.
                    </p>

                    <form onSubmit={handleLogin} style={COL_GAP_14}>
                        <input
                            type="password"
                            autoComplete="current-password"
                            placeholder="Enter Passcode (e.g. 2026)"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            autoFocus
                            aria-label="Coordinator Passcode"
                            style={{ 
                                width: '100%', 
                                padding: '14px 18px', 
                                borderRadius: '14px', 
                                background: '#F8F9F5', 
                                border: passcodeError ? '2px solid #DC2626' : '1px solid rgba(18, 22, 19, 0.14)', 
                                color: '#121613', 
                                fontSize: '16px', 
                                textAlign: 'center', 
                                letterSpacing: '4px', 
                                fontWeight: '700',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                        {passcodeError && (
                            <div style={{ fontSize: '12.5px', color: '#DC2626', fontWeight: '700', lineHeight: 1.4 }}>
                                {typeof passcodeError === 'string' ? passcodeError : 'Invalid Passcode. Please enter your Master Admin code.'}
                            </div>
                        )}
                        <button 
                            type="submit" 
                            className="btn-lime" 
                            style={{ 
                                padding: '15px', 
                                fontSize: '14.5px', 
                                fontWeight: '800', 
                                width: '100%', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <span>Unlock Dashboard</span>
                            <span><ChevronRight size={14} /></span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRememberMe(prev => !prev)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                background: 'transparent',
                                border: 'none',
                                color: rememberMe ? '#121613' : '#8A938B',
                                fontSize: '12.5px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                padding: '4px 0',
                                marginTop: '-2px'
                            }}
                        >
                            <div style={{
                                width: '17px',
                                height: '17px',
                                borderRadius: '5px',
                                border: `2px solid ${rememberMe ? '#0B150E' : 'rgba(18,22,19,0.25)'}`,
                                background: rememberMe ? '#D5ED55' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {rememberMe && <span style={{ fontSize: '10px', fontWeight: '900', color: '#0B150E' }}>✓</span>}
                            </div>
                            Keep me signed in (Remember for 30 days)
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(18,22,19,0.08)' }}>
                        <Link href="/" style={{ color: '#59655D', textDecoration: 'none', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            ← Return to Website
                        </Link>
                    </div>
                </motion.div>
            </div>
    );
}
