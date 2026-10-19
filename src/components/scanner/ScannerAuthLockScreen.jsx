"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Lock, LogIn, Check } from 'lucide-react';
import Link from 'next/link';

export default function ScannerAuthLockScreen({ state, onBackToAdmin }) {
    const authPasscode = state.authPasscode !== undefined ? state.authPasscode : (state.hostPasscode || '');
    const setAuthPasscode = state.setAuthPasscode || state.setHostPasscode;
    const authError = state.authError || state.passcodeError;
    const authRememberMe = state.authRememberMe !== undefined ? state.authRememberMe : (state.rememberMe ?? true);
    const setAuthRememberMe = state.setAuthRememberMe || state.setRememberMe;
    const isLoggingIn = state.isLoggingIn || false;
    const handlePasscodeSubmit = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (state.handlePasscodeSubmit) {
            state.handlePasscodeSubmit(e);
        } else if (state.handleHostLogin) {
            state.handleHostLogin();
        }
    };
    const renderToast = state.renderToast;

    return (
        <div style={{
            minHeight: '100dvh',
            background: 'radial-gradient(circle at 50% 10%, #17321F 0%, #08120B 100%)',
            color: '#FFFFFF',
            fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
            position: 'relative'
        }}>
            {/* Centered Floating Toast on Lock Screen */}
            {renderToast && renderToast()}

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                    width: '100%',
                    maxWidth: '390px',
                    background: 'rgba(13, 27, 18, 0.9)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(229, 169, 59, 0.4)',
                    borderRadius: '24px',
                    padding: '28px 22px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(229, 169, 59, 0.12)',
                    textAlign: 'center'
                }}
            >
                {/* Glowing Padlock Emblem */}
                <div style={{
                    width: '60px',
                    height: '60px',
                    margin: '0 auto 16px',
                    borderRadius: '18px',
                    background: 'linear-gradient(135deg, rgba(229, 169, 59, 0.25) 0%, rgba(213, 237, 85, 0.15) 100%)',
                    border: '1px solid rgba(229, 169, 59, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 24px rgba(229, 169, 59, 0.3)'
                }}>
                    <Lock size={28} color="#E5A93B" />
                </div>

                <div style={{ fontSize: '11px', fontWeight: '900', color: '#D5ED55', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Lock size={12} /> Security Restricted</span>
                </div>

                <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#FFFFFF', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                    Aanandham<span style={{ color: '#E5A93B' }}>.go</span>
                </h1>
                <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#E5A93B', marginBottom: '12px' }}>
                    BASECAMP HOST CONSOLE
                </div>

                <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 18px' }}>
                    Enter your authorized Host or Coordinator passcode to unlock live scanner, camper roster, and gate controls.
                </p>

                {authError && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#FCA5A5',
                        marginBottom: '16px'
                    }}>
                        {authError}
                    </div>
                )}

                <form onSubmit={handlePasscodeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <input
                        type="password"
                        placeholder="ENTER PASSCODE"
                        value={authPasscode || ''}
                        onChange={(e) => setAuthPasscode && setAuthPasscode(e.target.value)}
                        autoComplete="current-password"
                        aria-label="Basecamp Host Passcode"
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '14px',
                            background: '#071009',
                            border: '1px solid rgba(229, 169, 59, 0.5)',
                            color: '#FFFFFF',
                            fontSize: '18px',
                            fontWeight: '800',
                            textAlign: 'center',
                            letterSpacing: '3px',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />

                    {/* Numeric Keypad for fast single-hand mobile input */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'CLR', 0, '⌫'].map((key) => (
                            <button
                                key={String(key)}
                                type="button"
                                onClick={() => {
                                    if (key === 'CLR') {
                                        if (setAuthPasscode) setAuthPasscode('');
                                    } else if (key === '⌫') {
                                        if (setAuthPasscode) setAuthPasscode(prev => (prev ? prev.slice(0, -1) : ''));
                                    } else {
                                        if (setAuthPasscode) setAuthPasscode(prev => (prev || '') + String(key));
                                    }
                                }}
                                style={{
                                    padding: '12px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    color: '#FFFFFF',
                                    fontSize: '16px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                }}
                            >
                                {key}
                            </button>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={!authPasscode?.trim()}
                        style={{
                            width: '100%',
                            background: !authPasscode?.trim()
                                ? 'rgba(229, 169, 59, 0.3)'
                                : 'linear-gradient(135deg, #E5A93B 0%, #D5ED55 100%)',
                            border: 'none',
                            color: '#0B150E',
                            padding: '14px',
                            borderRadius: '14px',
                            fontSize: '14px',
                            fontWeight: '900',
                            letterSpacing: '0.3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: !authPasscode?.trim() ? 'not-allowed' : 'pointer',
                            boxShadow: '0 8px 24px rgba(229, 169, 59, 0.25)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <LogIn size={17} />
                        <span>Unlock Station Console</span>
                    </button>

                    {/* Remember Me toggle */}
                    <button
                        type="button"
                        onClick={() => setAuthRememberMe && setAuthRememberMe(prev => !prev)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            background: 'transparent',
                            border: 'none',
                            color: authRememberMe ? '#D5ED55' : '#8E9B92',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            padding: '4px 0'
                        }}
                    >
                        <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '5px',
                            border: `2px solid ${authRememberMe ? '#D5ED55' : 'rgba(255,255,255,0.2)'}`,
                            background: authRememberMe ? 'rgba(213,237,85,0.2)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            {authRememberMe && <Check size={11} color="#D5ED55" strokeWidth={3} />}
                        </div>
                        Remember station session for 24 hours
                    </button>
                </form>

                <div style={{ marginTop: '18px' }}>
                    {onBackToAdmin ? (
                        <button
                            type="button"
                            onClick={onBackToAdmin}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#8E9B92',
                                fontSize: '11.5px',
                                fontWeight: '700',
                                cursor: 'pointer'
                            }}
                        >
                            ← Back to Admin Console
                        </button>
                    ) : (
                        <Link
                            href="/"
                            style={{
                                color: '#8E9B92',
                                fontSize: '11.5px',
                                textDecoration: 'none',
                                fontWeight: '700'
                            }}
                        >
                            ← Return to Aanandham Homepage
                        </Link>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
