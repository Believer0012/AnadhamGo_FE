"use client";
import React from 'react';
import Link from 'next/link';
import { 
    Camera, Users, Utensils, ArrowLeft, Home, 
    Lock, Crown, Flame 
} from 'lucide-react';
import { StationGlyph } from './ScannerShared';

export default function ScannerTopBar({ state = {}, onBackToAdmin = null, embedded = false }) {
    const {
        activeTab, setActiveTab,
        authStation = {},
        soundEnabled, setSoundEnabled,
        handleLockConsole,
        handleHostLogout,
        scannedBooking,
        setScannedBooking,
        clearedGatePermit,
        resetScanner,
        handleResetScanner,
        stopCamera,
        setIsCameraEnabled,
        rosterList = []
    } = state;
    const onReset = resetScanner || handleResetScanner || (() => {});
    const onLock = handleHostLogout || handleLockConsole || (() => {});

    return (
        <div>
            {/* ── TOP APP BAR ── */}
            <header style={{
                background: 'rgba(9, 18, 11, 0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 40,
                gap: '8px'
            }}>
                {/* Left: Back / Home & Brand Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    {!embedded && (
                        <>
                            {onBackToAdmin ? (
                                <button
                                    type="button"
                                    onClick={onBackToAdmin}
                                    title="Return to Coordinator Dashboard"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: '#FFFFFF',
                                        borderRadius: '10px',
                                        width: '34px',
                                        height: '34px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        flexShrink: 0
                                    }}
                                >
                                    <ArrowLeft size={16} />
                                </button>
                            ) : (scannedBooking || clearedGatePermit) ? (
                                <button
                                    type="button"
                                    onClick={onReset}
                                    title="Close Ticket & Return to Scanner"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: '#FFFFFF',
                                        borderRadius: '10px',
                                        width: '34px',
                                        height: '34px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        flexShrink: 0
                                    }}
                                >
                                    <ArrowLeft size={16} />
                                </button>
                            ) : (
                                <Link
                                    href="/"
                                    title="Return to Aanandham Homepage"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: '#FFFFFF',
                                        borderRadius: '10px',
                                        width: '34px',
                                        height: '34px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textDecoration: 'none',
                                        flexShrink: 0
                                    }}
                                >
                                    <Home size={15} />
                                </Link>
                            )}
                        </>
                    )}

                    {/* Sleek Golden Host Brand Badge & Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <div 
                            style={{ 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '10px', 
                                background: 'linear-gradient(135deg, rgba(229, 169, 59, 0.22) 0%, rgba(213, 237, 85, 0.15) 100%)',
                                border: '1px solid rgba(229, 169, 59, 0.45)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 0 16px rgba(229, 169, 59, 0.25)',
                                flexShrink: 0
                            }}
                        >
                            <Flame size={17} color="#E5A93B" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                                <span style={{ fontSize: '15px', fontWeight: '900', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                                    Aanandham<span style={{ color: '#E5A93B' }}>.go</span>
                                </span>
                                {!embedded && (
                                    <>
                                    {authStation.isMasterAdmin ? (
                                    <Link
                                        href="/admin"
                                        title="Open Master HQ Admin Dashboard"
                                        style={{ 
                                            fontSize: '9.5px', 
                                            background: 'rgba(213, 237, 85, 0.15)', 
                                            border: '1px solid rgba(213, 237, 85, 0.35)', 
                                            color: '#D5ED55', 
                                            padding: '2px 7px', 
                                            borderRadius: '6px', 
                                            fontWeight: '900', 
                                            letterSpacing: '0.3px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            textDecoration: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E', display: 'inline-block', boxShadow: '0 0 6px #22C55E' }} />
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Crown size={12} /> HQ MASTER ↗</span>
                                    </Link>
                                ) : (
                                    <span style={{ 
                                        fontSize: '9.5px', 
                                        background: 'rgba(96, 165, 250, 0.15)', 
                                        border: '1px solid rgba(96, 165, 250, 0.35)', 
                                        color: '#60A5FA', 
                                        padding: '2px 7px', 
                                        borderRadius: '6px', 
                                        fontWeight: '900', 
                                        letterSpacing: '0.3px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#60A5FA', display: 'inline-block', boxShadow: '0 0 6px #60A5FA' }} />
                                        {<StationGlyph icon={authStation.icon} size={15} />} {authStation.shortName || 'STATION'}
                                    </span>
                                )}
                                </>
                                )}
                            </div>
                            {!embedded && (
                            <span style={{ fontSize: '10px', color: '#8E9B92', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {authStation.isMasterAdmin ? 'Enterprise Multi-Sanctuary Access' : `${authStation.campName || 'Basecamp'} · Station Locked`}
                            </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Actions (Lock Console) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <button
                        onClick={onLock}
                        style={{
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#FCA5A5',
                            padding: '6px 12px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '800',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                        }}
                        title="Lock Basecamp Console"
                    >
                        <Lock size={12} />
                        <span>Lock</span>
                    </button>
                </div>
            </header>

            {/* ── 3-TAB SEGMENTED CONTROLLER (Hidden during full-screen permit view) ── */}
            {!clearedGatePermit && (
                <div style={{
                    background: 'rgba(11, 21, 14, 0.9)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '8px 16px',
                    display: 'flex',
                    gap: '8px',
                    position: 'sticky',
                    top: '64px',
                    zIndex: 35
                }}>
                    <button
                        onClick={() => { 
                            if (setActiveTab) setActiveTab('scanner'); 
                            if (setScannedBooking) setScannedBooking(null); 
                        }}
                        style={{
                            flex: 1,
                            padding: '10px 8px',
                            borderRadius: '12px',
                            background: activeTab === 'scanner' ? '#D5ED55' : 'rgba(255, 255, 255, 0.05)',
                            color: activeTab === 'scanner' ? '#0B150E' : '#A2B6A6',
                            border: 'none',
                            fontSize: '12.5px',
                            fontWeight: '800',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Camera size={15} />
                        <span>QR Scanner</span>
                    </button>

                    <button
                        onClick={() => { 
                            if (setActiveTab) setActiveTab('roster'); 
                            if (setScannedBooking) setScannedBooking(null); 
                            if (stopCamera) stopCamera(); 
                            if (setIsCameraEnabled) setIsCameraEnabled(false); 
                        }}
                        style={{
                            flex: 1,
                            padding: '10px 8px',
                            borderRadius: '12px',
                            background: activeTab === 'roster' ? '#D5ED55' : 'rgba(255, 255, 255, 0.05)',
                            color: activeTab === 'roster' ? '#0B150E' : '#A2B6A6',
                            border: 'none',
                            fontSize: '12.5px',
                            fontWeight: '800',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Users size={15} />
                        <span>Guest Roster ({rosterList.length})</span>
                    </button>

                    <button
                        onClick={() => { 
                            if (setActiveTab) setActiveTab('kitchen'); 
                            if (setScannedBooking) setScannedBooking(null); 
                            if (stopCamera) stopCamera(); 
                            if (setIsCameraEnabled) setIsCameraEnabled(false); 
                        }}
                        style={{
                            flex: 1,
                            padding: '10px 8px',
                            borderRadius: '12px',
                            background: activeTab === 'kitchen' ? '#D5ED55' : 'rgba(255, 255, 255, 0.05)',
                            color: activeTab === 'kitchen' ? '#0B150E' : '#A2B6A6',
                            border: 'none',
                            fontSize: '12.5px',
                            fontWeight: '800',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Utensils size={15} />
                        <span>Kitchen & Tally</span>
                    </button>
                </div>
            )}

        </div>
    );
}
