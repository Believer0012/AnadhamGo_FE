"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
    Camera, Flashlight, RefreshCw, Upload, Search, CheckCircle2, AlertCircle, 
    Sparkles, ArrowLeft, ArrowRight, X, QrCode, Power, Check, Tent, Users, Compass, Utensils, IndianRupee, ShieldCheck, Award
} from 'lucide-react';
import { ROW_GAP_8, ROW_GAP_6, ROW_SPACE } from './ScannerShared';

export default function ScannerCameraView({ state = {} }) {
    const {
        activeTab = 'scanner',
        setActiveTab = () => {},
        videoRef,
        isCameraEnabled,
        hasTorchSupport,
        torchOn,
        startCamera,
        stopCamera,
        toggleCameraPower = () => {},
        toggleTorch = () => {},
        setFacingMode = () => {},
        handleImageUpload = () => {},
        isValidating,
        clearedGatePermit, setClearedGatePermit,
        scannedBooking,
        setIsManualModalOpen = () => {},
        setIsTestEmailModalOpen = () => {},
        handleTriggerSeedData = () => {},
        isTestSeeding,
        resetScanner = () => {}
    } = state || {};

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            background: '#040A06',
            minHeight: 'calc(100vh - 120px)'
        }}>
            {/* ══════════════════════════════════════════════════════════
                NEW SCREEN: CINEMATIC GATE ENTRY PERMIT CLEARED
            ══════════════════════════════════════════════════════════ */}
            {clearedGatePermit && (
                <main style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '30px 20px 80px',
                    maxWidth: '560px',
                    margin: '0 auto',
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    <motion.div
                        initial={{ scale: 0.88, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 260 }}
                        style={{
                            width: '100%',
                            background: '#0D1C11',
                            border: '2px solid #D5ED55',
                            borderRadius: '28px',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 0 60px rgba(213, 237, 85, 0.25), 0 30px 60px rgba(0,0,0,0.8)'
                        }}
                    >
                        {/* Glowing Approved Banner */}
                        <div style={{
                            background: 'linear-gradient(135deg, #15301B 0%, #0F2314 100%)',
                            padding: '28px 24px 22px',
                            textAlign: 'center',
                            borderBottom: '2px dashed rgba(213, 237, 85, 0.3)',
                            position: 'relative'
                        }}>
                            {/* Perforated cutout circles */}
                            <div style={{ position: 'absolute', left: '-14px', bottom: '-14px', width: '28px', height: '28px', borderRadius: '50%', background: '#071009', zIndex: 10 }} />
                            <div style={{ position: 'absolute', right: '-14px', bottom: '-14px', width: '28px', height: '28px', borderRadius: '50%', background: '#071009', zIndex: 10 }} />

                            <div style={{
                                width: '68px',
                                height: '68px',
                                borderRadius: '50%',
                                background: '#D5ED55',
                                color: '#0B150E',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 14px',
                                boxShadow: '0 0 30px rgba(213, 237, 85, 0.6)'
                            }}>
                                <Award size={36} />
                            </div>

                            <span style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '2px', color: '#D5ED55', textTransform: 'uppercase' }}>
                                OFFICIAL GATE CLEARANCE
                            </span>
                            <h1 style={{ margin: '6px 0 2px', fontSize: '24px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                                CAMP ENTRY APPROVED
                            </h1>
                            <span style={{ fontSize: '13px', color: '#A2B6A6' }}>
                                Permit #{clearedGatePermit.permitId} • Issued at {clearedGatePermit.timestamp}
                            </span>
                        </div>

                        {/* Permit Summary Card Body */}
                        <div style={{ padding: '24px' }}>
                            {/* Explorer Details */}
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', marginBottom: '14px' }}>
                                <span style={{ fontSize: '11px', color: '#8E9B92', fontWeight: '700', textTransform: 'uppercase' }}>Lead Explorer:</span>
                                <div style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
                                    {clearedGatePermit.name}
                                </div>
                                <span style={{ fontSize: '12px', color: '#D5ED55' }}>
                                    Pass #{clearedGatePermit.bookingId} • {clearedGatePermit.campsite}
                                </span>
                            </div>

                            {/* Tent & Wristband Allocation Badges */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: '14px' }}>
                                <div style={{ background: 'rgba(213, 237, 85, 0.08)', border: '1px solid rgba(213, 237, 85, 0.3)', padding: '12px 14px', borderRadius: '14px' }}>
                                    <span style={{ fontSize: '10.5px', color: '#D5ED55', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Assigned Tent / Pod</span>
                                    <strong style={{ fontSize: '13.5px', color: '#FFFFFF', marginTop: '2px', display: 'block' }}>{clearedGatePermit.assignedTent}</strong>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px 14px', borderRadius: '14px' }}>
                                    <span style={{ fontSize: '10.5px', color: '#8E9B92', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Wristbands Issued</span>
                                    <strong style={{ fontSize: '13.5px', color: '#FFFFFF', marginTop: '2px', display: 'block' }}>{clearedGatePermit.wristbandRange || 'All Issued'}</strong>
                                </div>
                            </div>

                            {/* Headcount & Catering Chits */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '18px', textAlign: 'center' }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 6px', borderRadius: '12px' }}>
                                    <span style={{ fontSize: '10px', color: '#8E9B92', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Campers</span>
                                    <strong style={{ fontSize: '16px', color: '#4ADE80' }}>{clearedGatePermit.presentCount}/{clearedGatePermit.totalCount}</strong>
                                </div>
                                <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '10px 6px', borderRadius: '12px' }}>
                                    <span style={{ fontSize: '10px', color: '#4ADE80', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Veg BBQ</span>
                                    <strong style={{ fontSize: '16px', color: '#4ADE80' }}>{clearedGatePermit.vegCount}</strong>
                                </div>
                                <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '10px 6px', borderRadius: '12px' }}>
                                    <span style={{ fontSize: '10px', color: '#FB923C', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Chicken BBQ</span>
                                    <strong style={{ fontSize: '16px', color: '#FB923C' }}>{clearedGatePermit.nonVegCount}</strong>
                                </div>
                            </div>

                            {/* Settlement Summary */}
                            <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '12px 16px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                                <div style={ROW_GAP_8}>
                                    <CheckCircle2 size={18} color="#4ADE80" />
                                    <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#FFFFFF' }}>
                                        Gate Balance Settlement:
                                    </span>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: '900', color: '#4ADE80' }}>
                                    ✓ ALL SETTLED
                                </span>
                            </div>

                            {/* Big Action Buttons */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button
                                    onClick={resetScanner}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        background: '#D5ED55',
                                        color: '#0B150E',
                                        fontSize: '15px',
                                        fontWeight: '900',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    <Camera size={18} />
                                    <span>Scan Next Camper Pass →</span>
                                </button>

                                <button
                                    onClick={() => { resetScanner(); setActiveTab('roster'); }}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '14px',
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                        color: '#FFFFFF',
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Users size={16} />
                                    <span>View in Guest Roster</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </main>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB 1: LIVE QR CAMERA SCANNER
            ══════════════════════════════════════════════════════════ */}
            {activeTab === 'scanner' && !clearedGatePermit && (
                <main style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px 20px 80px',
                    maxWidth: '520px',
                    margin: '0 auto',
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    {/* Camera Control Bar */}
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                        background: 'rgba(16, 30, 19, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '10px 16px',
                        borderRadius: '16px'
                    }}>
                        <div style={ROW_GAP_8}>
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: isCameraEnabled ? '#22C55E' : '#EF4444',
                                boxShadow: isCameraEnabled ? '0 0 8px #22C55E' : 'none'
                            }} />
                            <span style={{ fontSize: '12px', fontWeight: '700', color: isCameraEnabled ? '#4ADE80' : '#FCA5A5' }}>
                                {isCameraEnabled ? 'Camera Live' : 'Camera Paused'}
                            </span>
                        </div>

                        <button
                            onClick={toggleCameraPower}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '999px',
                                background: isCameraEnabled ? 'rgba(239, 68, 68, 0.15)' : '#D5ED55',
                                border: isCameraEnabled ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
                                color: isCameraEnabled ? '#EF4444' : '#0B150E',
                                fontSize: '11.5px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Power size={13} />
                            <span>{isCameraEnabled ? 'Turn Off' : 'Turn On Camera'}</span>
                        </button>
                    </div>

                    {/* Viewfinder Frame */}
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '1 / 1',
                        borderRadius: '28px',
                        overflow: 'hidden',
                        boxShadow: '0 0 50px rgba(0, 0, 0, 0.8), 0 0 0 2px rgba(213, 237, 85, 0.2)',
                        background: '#000000',
                        marginBottom: '16px'
                    }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />

                        {isCameraEnabled && (
                            <div style={{
                                position: 'absolute',
                                inset: '14%',
                                border: '2px solid rgba(213, 237, 85, 0.5)',
                                borderRadius: '20px',
                                pointerEvents: 'none',
                                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '2px',
                                    background: 'linear-gradient(90deg, rgba(213,237,85,0) 0%, #D5ED55 50%, rgba(213,237,85,0) 100%)',
                                    boxShadow: '0 0 12px #D5ED55',
                                    animation: 'scanline 2s infinite ease-in-out'
                                }} />
                                <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: '4px solid #D5ED55', borderLeft: '4px solid #D5ED55', borderTopLeftRadius: '12px' }} />
                                <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderTop: '4px solid #D5ED55', borderRight: '4px solid #D5ED55', borderTopRightRadius: '12px' }} />
                                <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #D5ED55', borderLeft: '4px solid #D5ED55', borderBottomLeftRadius: '12px' }} />
                                <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #D5ED55', borderRight: '4px solid #D5ED55', borderBottomRightRadius: '12px' }} />
                            </div>
                        )}

                        {!isCameraEnabled && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: '#0D180F',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '24px',
                                textAlign: 'center',
                                zIndex: 10
                            }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    background: 'rgba(213, 237, 85, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '14px',
                                    border: '1px solid rgba(213, 237, 85, 0.3)'
                                }}>
                                    <Camera size={30} color="#D5ED55" />
                                </div>
                                <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>
                                    Live Camera Paused
                                </h3>
                                <p style={{ margin: '0 0 18px', fontSize: '12px', color: '#8E9B92', maxWidth: '260px', lineHeight: 1.45 }}>
                                    Tap to activate live scanner or pick a guest from the roster.
                                </p>
                                <button
                                    onClick={startCamera}
                                    style={{
                                        padding: '12px 22px',
                                        borderRadius: '12px',
                                        background: '#D5ED55',
                                        color: '#0B150E',
                                        fontSize: '13px',
                                        fontWeight: '800',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Power size={15} />
                                    <span>Turn On Camera</span>
                                </button>
                            </div>
                        )}

                        {isValidating && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(11, 21, 14, 0.9)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                zIndex: 30
                            }}>
                                <div className="spinner-border" style={{ width: '40px', height: '40px', border: '3px solid rgba(213,237,85,0.2)', borderTopColor: '#D5ED55', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#D5ED55' }}>
                                    Verifying Pass...
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Quick Tools (hidden while a scanned pass is open) */}
                    {!scannedBooking && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
                        {isCameraEnabled && (
                            <>
                                <button
                                    onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '14px',
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                        color: '#FFFFFF',
                                        fontSize: '12.5px',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <RefreshCw size={15} />
                                    <span>Flip Camera</span>
                                </button>

                                {hasTorchSupport && (
                                    <button
                                        onClick={toggleTorch}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '14px',
                                            background: torchOn ? '#D5ED55' : 'rgba(255, 255, 255, 0.06)',
                                            border: '1px solid rgba(255, 255, 255, 0.12)',
                                            color: torchOn ? '#0B150E' : '#FFFFFF',
                                            fontSize: '12.5px',
                                            fontWeight: '700',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Flashlight size={15} />
                                        <span>{torchOn ? 'Torch ON' : 'Torch OFF'}</span>
                                    </button>
                                )}
                            </>
                        )}

                        <label style={{
                            padding: '12px',
                            borderRadius: '14px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#FFFFFF',
                            fontSize: '12.5px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                        }}>
                            <Upload size={15} />
                            <span>Upload Pass</span>
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                        </label>

                        <button
                            onClick={() => setIsManualModalOpen(true)}
                            style={{
                                padding: '12px',
                                borderRadius: '14px',
                                background: 'rgba(213, 237, 85, 0.12)',
                                border: '1px solid rgba(213, 237, 85, 0.3)',
                                color: '#D5ED55',
                                fontSize: '12.5px',
                                fontWeight: '800',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            <Search size={15} />
                            <span>Enter Booking ID</span>
                        </button>
                    </div>
                    )}
                </main>
            )}
        </div>
    );
}
