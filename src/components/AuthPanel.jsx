"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function AuthPanel({ initialMode = 'login' }) {
    const { login } = useAuth();
    const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
    const [showPassword, setShowPassword] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState('beginner');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
        remember: true
    });

    const [signupData, setSignupData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        level: 'beginner'
    });

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!validateEmail(loginData.email)) {
            setErrorMsg('Please provide a valid email address (e.g. camper@gmail.com)');
            return;
        }
        if (!loginData.password || loginData.password.length < 8) {
            setErrorMsg('Password must be at least 8 characters in length.');
            return;
        }

        setLoading(true);
        const userName = loginData.email.split('@')[0] || 'Camper';
        const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
        const userObj = {
            name: formattedName,
            email: loginData.email,
            role: 'camper',
            loggedIn: true
        };
        login(userObj, loginData.remember);

        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        }, 600);
    };

    const handleSignupSubmit = (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!signupData.name || signupData.name.trim().length < 2) {
            setErrorMsg('Please enter your full name.');
            return;
        }
        if (!validateEmail(signupData.email)) {
            setErrorMsg('Please provide a valid email address.');
            return;
        }
        if (!signupData.phone || signupData.phone.replace(/\D/g, '').length < 10) {
            setErrorMsg('Please enter a valid 10-digit mobile or WhatsApp number.');
            return;
        }
        if (!signupData.password || signupData.password.length < 8) {
            setErrorMsg('Password must be at least 8 characters.');
            return;
        }

        setLoading(true);
        login({
            name: signupData.name.trim(),
            email: signupData.email.trim(),
            phone: signupData.phone.trim(),
            level: selectedLevel,
            role: 'camper',
            loggedIn: true
        }, true);
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        }, 600);
    };

    return (
        <div style={{
            minHeight: '100dvh',
            backgroundColor: '#F8F9F5',
            color: '#121613',
            fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px 16px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Ambient Background Glows */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '-5%',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(213, 237, 85, 0.15) 0%, transparent 70%)',
                filter: 'blur(60px)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                right: '-5%',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(14, 26, 17, 0.08) 0%, transparent 70%)',
                filter: 'blur(80px)',
                pointerEvents: 'none'
            }} />

            {/* Top Navigation Bar */}
            <header style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                padding: 'clamp(14px, 3vw, 24px) clamp(16px, 4vw, 36px)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 20
            }}>
                <Link href="/" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#121613',
                    textDecoration: 'none',
                    fontSize: '13.5px',
                    fontWeight: '700',
                    background: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: '999px',
                    border: '1px solid rgba(18, 22, 19, 0.1)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease'
                }}>
                    <ArrowLeft size={11} /> <span>Back</span>
                </Link>

                <Link href="/" className="text-hover-marker" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: 'clamp(18px, 3.5vw, 22px)',
                    fontWeight: '800',
                    fontFamily: 'var(--font-heading)',
                    color: '#121613',
                    textDecoration: 'none',
                    letterSpacing: '-0.03em'
                }}>
                    <img
                        src="/logo.png"
                        alt="Aanandham.go"
                        style={{
                            height: '28px',
                            width: 'auto',
                            objectFit: 'contain'
                        }}
                     loading="lazy" decoding="async"/>
                    <span className="marker-text">Aanandham<span style={{ color: '#E5A93B' }}>.go</span></span>
                </Link>
            </header>

            {/* Main Interactive Swapping Container */}
            <motion.div 
                layout
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    width: '100%',
                    maxWidth: '1080px',
                    minHeight: '600px',
                    background: '#FFFFFF',
                    borderRadius: 'clamp(24px, 4vw, 36px)',
                    border: '1px solid rgba(18, 22, 19, 0.08)',
                    boxShadow: '0 24px 70px rgba(0, 0, 0, 0.06)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                    overflow: 'hidden',
                    position: 'relative',
                    zIndex: 10,
                    margin: '65px 0 20px'
                }}
            >
                {/* FORM PANEL */}
                <div style={{
                    padding: 'clamp(28px, 4vw, 48px) clamp(20px, 4vw, 40px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    order: mode === 'login' ? 1 : 2
                }}>
                    {/* Mode Switcher Tabs */}
                    <div style={{
                        display: 'inline-flex',
                        background: '#F1F3EC',
                        padding: '5px',
                        borderRadius: '999px',
                        marginBottom: '24px',
                        alignSelf: 'flex-start'
                    }}>
                        <button
                            type="button"
                            onClick={() => { setMode('login'); setErrorMsg(''); }}
                            style={{
                                padding: '8px 22px',
                                borderRadius: '999px',
                                border: 'none',
                                background: mode === 'login' ? '#121613' : 'transparent',
                                color: mode === 'login' ? '#FFFFFF' : '#59655D',
                                fontWeight: '700',
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease'
                            }}
                        >
                            Log In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode('signup'); setErrorMsg(''); }}
                            style={{
                                padding: '8px 22px',
                                borderRadius: '999px',
                                border: 'none',
                                background: mode === 'signup' ? '#121613' : 'transparent',
                                color: mode === 'signup' ? '#FFFFFF' : '#59655D',
                                fontWeight: '700',
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease'
                            }}
                        >
                            Sign Up
                        </button>
                    </div>

                    {errorMsg && (
                        <div style={{
                            padding: '10px 14px',
                            background: 'rgba(255, 90, 95, 0.1)',
                            border: '1px solid #FF5A5F',
                            borderRadius: '12px',
                            color: '#FF5A5F',
                            fontSize: '12.5px',
                            fontWeight: '700',
                            marginBottom: '16px'
                        }}>
                            {errorMsg}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {mode === 'login' ? (
                            <motion.div
                                key="login-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div style={{ marginBottom: '24px' }}>
                                    <h1 style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: 'clamp(24px, 4vw, 32px)',
                                        fontWeight: '800',
                                        color: '#121613',
                                        margin: '0 0 6px'
                                    }}>
                                        Welcome Back, Explorer
                                    </h1>
                                    <p style={{ fontSize: '14px', color: '#59655D', margin: 0 }}>
                                        Access your campsite booking confirmations, itinerary passes, and gear checklists.
                                    </p>
                                </div>

                                <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#121613', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '6px' }}>
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="camper@example.com"
                                            value={loginData.email}
                                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                borderRadius: '14px',
                                                border: '1.5px solid rgba(18, 22, 19, 0.12)',
                                                background: '#F8F9F5',
                                                fontSize: '14px',
                                                color: '#121613',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <label style={{ fontSize: '12px', fontWeight: '800', color: '#121613', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                                                Password
                                            </label>
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                placeholder="Min. 8 characters"
                                                value={loginData.password}
                                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 42px 12px 16px',
                                                    borderRadius: '14px',
                                                    border: '1.5px solid rgba(18, 22, 19, 0.12)',
                                                    background: '#F8F9F5',
                                                    fontSize: '14px',
                                                    color: '#121613',
                                                    outline: 'none'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                style={{
                                                    position: 'absolute',
                                                    right: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#8E9B92',
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Remember Me Checkbox */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '-4px 0 4px' }}>
                                        <input
                                            type="checkbox"
                                            id="remember-me-cb"
                                            checked={loginData.remember}
                                            onChange={(e) => setLoginData({ ...loginData, remember: e.target.checked })}
                                            style={{ cursor: 'pointer', accentColor: '#121613' }}
                                        />
                                        <label htmlFor="remember-me-cb" style={{ fontSize: '12.5px', color: '#59655D', cursor: 'pointer', userSelect: 'none' }}>
                                            Remember my login on this device
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || submitted}
                                        className="btn-lime"
                                        style={{
                                            padding: '14px',
                                            fontSize: '14.5px',
                                            fontWeight: '800',
                                            marginTop: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        {loading ? 'Authenticating...' : submitted ? 'Success! Redirecting...' : 'Log In to Basecamp →'}
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="signup-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div style={{ marginBottom: '20px' }}>
                                    <h1 style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: 'clamp(24px, 4vw, 32px)',
                                        fontWeight: '800',
                                        color: '#121613',
                                        margin: '0 0 6px'
                                    }}>
                                        Join Aanandham Camps
                                    </h1>
                                    <p style={{ fontSize: '13.5px', color: '#59655D', margin: 0 }}>
                                        Create your member profile to unlock secret sunrise batches, priority safari seats, and member pricing.
                                    </p>
                                </div>

                                <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#121613', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Rahul Sharma"
                                            value={signupData.name}
                                            onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '11px 14px',
                                                borderRadius: '12px',
                                                border: '1.5px solid rgba(18, 22, 19, 0.1)',
                                                background: '#F8F9F5',
                                                fontSize: '13.5px',
                                                color: '#121613',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#121613', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="rahul@gmail.com"
                                                value={signupData.email}
                                                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '11px 14px',
                                                    borderRadius: '12px',
                                                    border: '1.5px solid rgba(18, 22, 19, 0.1)',
                                                    background: '#F8F9F5',
                                                    fontSize: '13.5px',
                                                    color: '#121613',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#121613', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                WhatsApp Phone
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                placeholder="+91 98765 43210"
                                                value={signupData.phone}
                                                onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '11px 14px',
                                                    borderRadius: '12px',
                                                    border: '1.5px solid rgba(18, 22, 19, 0.1)',
                                                    background: '#F8F9F5',
                                                    fontSize: '13.5px',
                                                    color: '#121613',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Trek Level Selection Chips */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#121613', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>
                                            Your Trekking Experience Level
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                            {[
                                                { id: 'newbie', label: 'Total Newbie' },
                                                { id: 'beginner', label: 'Weekend Camper' },
                                                { id: 'intermediate', label: 'Confident Hiker' },
                                                { id: 'advanced', label: 'Peak Trekker' }
                                            ].map((lvl) => {
                                                const isSel = selectedLevel === lvl.id;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={lvl.id}
                                                        onClick={() => {
                                                            setSelectedLevel(lvl.id);
                                                            setSignupData(prev => ({ ...prev, level: lvl.id }));
                                                        }}
                                                        style={{
                                                            padding: '8px 10px',
                                                            borderRadius: '10px',
                                                            border: isSel ? '1.5px solid #121613' : '1px solid rgba(18,22,19,0.1)',
                                                            background: isSel ? '#E5A93B' : '#F8F9F5',
                                                            color: '#121613',
                                                            fontSize: '12px',
                                                            fontWeight: isSel ? '800' : '600',
                                                            cursor: 'pointer',
                                                            textAlign: 'center',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        {lvl.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#121613', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                            Create Password
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                placeholder="Min. 8 characters"
                                                value={signupData.password}
                                                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '11px 40px 11px 14px',
                                                    borderRadius: '12px',
                                                    border: '1.5px solid rgba(18, 22, 19, 0.1)',
                                                    background: '#F8F9F5',
                                                    fontSize: '13.5px',
                                                    color: '#121613',
                                                    outline: 'none'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                style={{
                                                    position: 'absolute',
                                                    right: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#8E9B92',
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || submitted}
                                        className="btn-lime"
                                        style={{
                                            padding: '14px',
                                            fontSize: '14.5px',
                                            fontWeight: '800',
                                            marginTop: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        {loading ? 'Creating Explorer Pass...' : submitted ? 'Pass Created! Redirecting...' : 'Create Free Member Account →'}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* VISUAL MEDIA PANEL */}
                <motion.div 
                    layout
                    style={{
                        position: 'relative',
                        minHeight: '440px',
                        overflow: 'hidden',
                        order: mode === 'login' ? 2 : 1,
                        background: '#0E1A11'
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={mode}
                            src={mode === 'login' 
                                ? 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80'
                                : 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80'
                            }
                            alt="Wilderness basecamp"
                            initial={{ opacity: 0, scale: 1.08 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    </AnimatePresence>

                    {/* Dark Nature Overlay Gradient */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(14, 26, 17, 0.92) 0%, rgba(14, 26, 17, 0.25) 50%, rgba(14, 26, 17, 0.5) 100%)'
                    }} />

                    {/* Top Floating Badge */}
                    <div style={{
                        position: 'absolute',
                        top: '28px',
                        left: '28px',
                        right: '28px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        zIndex: 2
                    }}>
                        <span style={{
                            background: 'rgba(0, 0, 0, 0.65)',
                            color: '#E5A93B',
                            fontSize: '11.5px',
                            fontWeight: '800',
                            padding: '6px 14px',
                            borderRadius: '999px',
                            backdropFilter: 'blur(8px)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <span>★</span> {mode === 'login' ? 'MEMBERS BASECAMP' : 'NEW REGISTRATION'}
                        </span>
                        <span style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            color: '#FFFFFF',
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '6px 12px',
                            borderRadius: '999px',
                            backdropFilter: 'blur(6px)'
                        }}>
                            Munnar & Wayanad
                        </span>
                    </div>

                    {/* Bottom Caption Card */}
                    <div style={{
                        position: 'absolute',
                        bottom: '32px',
                        left: '32px',
                        right: '32px',
                        zIndex: 2
                    }}>
                        <div style={{
                            background: 'rgba(14, 24, 17, 0.75)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '24px',
                            padding: '24px',
                            backdropFilter: 'blur(12px)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <img
                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                                    alt="Camp Lead"
                                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E5A93B' }}
                                 loading="lazy" decoding="async"/>
                                <div>
                                    <div style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '800' }}>
                                        {mode === 'login' ? 'Daniel Kim' : 'Pooja Menon'}
                                    </div>
                                    <div style={{ color: '#A2B6A6', fontSize: '11.5px' }}>
                                        {mode === 'login' ? 'Camper ‘25 · Kolukkumalai Ridge' : 'High-Altitude Yoga & Camp Lead'}
                                    </div>
                                </div>
                            </div>
                            <p style={{
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontSize: '13px',
                                lineHeight: 1.55,
                                margin: 0,
                                fontStyle: 'italic'
                            }}>
                                {mode === 'login'
                                    ? '“Best reset of my year. Went from barely walking trails to riding the sunrise above the clouds.”'
                                    : '“Whether you hike every week or have never pitched a tent, our crew takes care of every single step.”'
                                }
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Bottom Subtext */}
            <div style={{
                fontSize: '12px',
                color: '#8E9B92',
                textAlign: 'center',
                marginTop: '12px'
            }}>
                Aanandham.go Wilderness Member Access · Direct WhatsApp & Email Verification · © 2026
            </div>
        </div>
    );
}
