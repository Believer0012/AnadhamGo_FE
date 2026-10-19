"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, CheckCircle2, AlertCircle, Clock, Users, Phone, MessageCircle, 
    DollarSign, Utensils, Tent, MapPin, ArrowLeft, Ticket, CheckSquare, 
    Square, UserPlus, Tag, Layers, Check, CreditCard, Wallet, Flame, Compass, IndianRupee,
    ChevronDown, Edit2, ShieldAlert, Smartphone, Crown, Drumstick, Leaf, Sunrise, Mountain, Trees, ChefHat
} from 'lucide-react';
import { ROW_GAP_8, ROW_GAP_10, ROW_GAP_6, ROW_SPACE, getCleanWhatsAppPhone } from './ScannerShared';

function CustomDropdown({ label, value, options = [], onChange }) {
    return (
        <div style={{ marginTop: '8px' }}>
            {label && (
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#8E9B92', display: 'block', marginBottom: '6px' }}>
                    {label}
                </label>
            )}
            <select
                value={value}
                onChange={e => onChange?.(e.target.value)}
                style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: '#08120A',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    outline: 'none',
                    cursor: 'pointer'
                }}
            >
                {options.map((opt, i) => {
                    const optVal = typeof opt === 'string' ? opt : opt.value || opt.label;
                    const optLabel = typeof opt === 'string' ? opt : opt.label || opt.value;
                    return (
                        <option key={i} value={optVal} style={{ background: '#101E13', color: '#FFFFFF' }}>
                            {optLabel}
                        </option>
                    );
                })}
            </select>
        </div>
    );
}

export default function ScannerCheckInModal({ state = {}, embedded = false }) {
    const [mounted, setMounted] = useState(false);
    const isEmbedded = state?.embedded ?? embedded;

    useEffect(() => {
        setMounted(true);
        const prevBodyOverflow = document.body.style.overflow;
        const prevHtmlOverflow = document.documentElement.style.overflow;
        const prevBodyTouchAction = document.body.style.touchAction;

        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
        document.body.classList.add('scanner-modal-open');
        document.documentElement.classList.add('scanner-modal-open');

        return () => {
            document.body.style.overflow = prevBodyOverflow;
            document.documentElement.style.overflow = prevHtmlOverflow;
            document.body.style.touchAction = prevBodyTouchAction;
            document.body.classList.remove('scanner-modal-open');
            document.documentElement.classList.remove('scanner-modal-open');
        };
    }, []);

    const {
        scannedBooking, setScannedBooking,
        authStation = {},
        attendeeChecklist,
        customAllocatedUnit, setCustomAllocatedUnit,
        isReassigningAccom, setIsReassigningAccom,
        customWristbandStart, setCustomWristbandStart,
        customWristbandEnd, setCustomWristbandEnd,
        handleAutoGenerateWristbands = () => {},
        gatePaymentMethod, setGatePaymentMethod,
        gateCashCollected, setGateCashCollected,
        gateNotes, setGateNotes,
        isSubmittingCheckIn,
        handleConfirmCheckIn,
        availableAccommodations,
        handleAddWalkInCamper,
        allCampAttendanceOptions,
        dynamicBalanceDue = 0,
        isBalancePaid = false,
        setIsBalancePaid = () => {},
        settlementMethod = 'cash',
        setSettlementMethod = () => {},
        handleConfirmCheckin = () => {},
        isSubmittingCheckin = false,
        shortCount = 0,
        presentCount = 0,
        totalCount = 0,
        resetScanner = () => {},
        isGuestMatchingCamp = () => true,
        toggleCamperCheckin,
        toggleAllCampers,
        toggleCamperMeal,
        addWalkinGuest,
        selectedUnit,
        setSelectedUnit,
        reassignAccommodation,
        wristbandStart,
        setWristbandStart,
        wristbandEnd,
        setWristbandEnd,
        autoAssignWristbands,
        setAmountCollected,
        amountCollected,
        toggleBalancePaid,
        checkInAllRemaining = () => {},
        handleAddExtraCamper = () => {},
        handleRemoveExtraCamper = () => {},
        extraGuestsCount = 0,
        extraBalance = 0,
        isChangingTent = false,
        setIsChangingTent = () => {},
        assignedTent = '',
        setAssignedTent = () => {},
        tentOptions = [],
        wristbandRange = '',
        setWristbandRange = () => {},
        playSuccessChime = () => {},
        showToast = () => {},
        rosterChecklist = [],
        setRosterChecklist = () => {}
    } = state || {};

    if (!scannedBooking) return null;

    const modalContent = (
        <div 
            className="scanner-modal-scroll"
            onWheel={e => e.stopPropagation()}
            onTouchMove={e => e.stopPropagation()}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100dvh',
                background: 'rgba(3, 8, 4, 0.96)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                zIndex: 999999,
                overflowY: 'scroll',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
                overscrollBehavior: 'contain',
                pointerEvents: 'auto',
                padding: '24px 16px 140px',
                boxSizing: 'border-box'
            }}
        >
            <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', position: 'relative' }}>
                {/* Floating Top Close Bar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
                    <button
                        type="button"
                        onClick={resetScanner}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '999px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <X size={14} />
                        <span>Close Pass (Esc)</span>
                    </button>
                </div>
                                    {/* ── RESPONSIVE GRID LAYOUT ── */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '20px',
                        alignItems: 'start'
                    }}>

                        {/* ── LEFT COLUMN: PVR CINEMA BOARDING TICKET STUB ── */}
                        <div style={{
                            background: '#0F1E13',
                            border: '1px solid rgba(213, 237, 85, 0.25)',
                            borderRadius: '24px',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
                        }}>
                            {/* Top Golden Header */}
                            <div style={{
                                background: 'linear-gradient(135deg, #142819 0%, #0D1C11 100%)',
                                padding: '20px 22px',
                                borderBottom: '2px dashed rgba(255, 255, 255, 0.15)',
                                position: 'relative'
                            }}>
                                {/* Circular ticket side cutouts */}
                                <div style={{ position: 'absolute', left: '-12px', bottom: '-12px', width: '24px', height: '24px', borderRadius: '50%', background: '#071009', zIndex: 5 }} />
                                <div style={{ position: 'absolute', right: '-12px', bottom: '-12px', width: '24px', height: '24px', borderRadius: '50%', background: '#071009', zIndex: 5 }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                                    <div>
                                        <span style={{ fontSize: '10.5px', fontWeight: '900', color: '#D5ED55', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                            EXPEDITION BOARDING PASS
                                        </span>
                                        <h2 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '900', color: '#FFFFFF' }}>
                                            {scannedBooking.name}
                                        </h2>
                                        <span style={{ fontSize: '12px', color: '#A2B6A6' }}>
                                            Pass #{scannedBooking.id}
                                        </span>
                                    </div>

                                    {/* Status Pill */}
                                    {(() => {
                                        const isCheckedIn = scannedBooking.status === 'Checked In';
                                        const isPartialIn = scannedBooking.status === 'Partial Check-In' && Number(scannedBooking.shortCount) > 0 && Number(scannedBooking.checkedInCount) > 0;
                                        return (
                                            <span style={{
                                                padding: '5px 12px',
                                                borderRadius: '999px',
                                                background: isCheckedIn 
                                                    ? 'rgba(34, 197, 94, 0.25)' 
                                                    : isPartialIn 
                                                        ? 'rgba(234, 179, 8, 0.25)' 
                                                        : 'rgba(213, 237, 85, 0.2)',
                                                color: isCheckedIn ? '#4ADE80' : isPartialIn ? '#FACC15' : '#D5ED55',
                                                border: `1px solid ${isCheckedIn ? 'rgba(34, 197, 94, 0.4)' : isPartialIn ? 'rgba(234, 179, 8, 0.4)' : 'rgba(213, 237, 85, 0.3)'}`,
                                                fontSize: '11px',
                                                fontWeight: '900',
                                                letterSpacing: '0.5px',
                                                textTransform: 'uppercase'
                                            }}>
                                                {isCheckedIn 
                                                    ? '✓ Checked In' 
                                                    : isPartialIn 
                                                        ? `${scannedBooking.checkedInCount || 1}/${scannedBooking.totalGuests || scannedBooking.guests || 2} Present` 
                                                        : '⏳ Expected · Confirmed'}
                                            </span>
                                        );
                                    })()}
                                </div>

                                {/* Prominent Lead WhatsApp & Call Buttons directly on Top Pass Header */}
                                {(() => {
                                    const leadPhone = scannedBooking.phone || '';
                                    if (!leadPhone) {
                                        return (
                                            <div style={{ marginTop: '12px', fontSize: '11.5px', color: '#8E9B92', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Smartphone size={13} /> No customer phone number attached to this reservation.</span>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                                            <a
                                                href={`https://wa.me/${getCleanWhatsAppPhone(leadPhone)}?text=Hi%20${encodeURIComponent(scannedBooking.name)}%2C%20welcome%20to%20Aanandham!%20Your%20campsite%20is%20ready.`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    flex: 1,
                                                    padding: '10px 14px',
                                                    borderRadius: '12px',
                                                    background: 'rgba(37, 211, 102, 0.2)',
                                                    border: '1px solid rgba(37, 211, 102, 0.4)',
                                                    color: '#25D366',
                                                    fontSize: '12.5px',
                                                    fontWeight: '800',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                <MessageCircle size={15} />
                                                <span>WhatsApp ({leadPhone})</span>
                                            </a>
                                            <a
                                                href={`tel:${leadPhone.replace(/[^\d+]/g, '')}`}
                                                style={{
                                                    padding: isEmbedded ? '12px 18px' : '10px 16px',
                                                    borderRadius: '12px',
                                                    background: 'rgba(255, 255, 255, 0.08)',
                                                    border: '1px solid rgba(255, 255, 255, 0.18)',
                                                    color: '#FFFFFF',
                                                    fontSize: '12.5px',
                                                    fontWeight: '800',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                <Phone size={14} />
                                                <span>Call Lead</span>
                                            </a>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Ticket Details Body */}
                            <div style={{ padding: '22px' }}>
                                {/* Campsite & Convoy Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '16px' }}>
                                    <div>
                                        <span style={{ fontSize: '10.5px', color: '#8E9B92', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Sanctuary</span>
                                        <strong style={{ fontSize: '13.5px', color: '#D5ED55' }}>{scannedBooking.campsite}</strong>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '10.5px', color: '#8E9B92', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Convoy Batch</span>
                                        <strong style={{ fontSize: '13.5px', color: '#FFFFFF' }}>{scannedBooking.convoyTime || '02:30 PM Batch'}</strong>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '10.5px', color: '#8E9B92', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Accommodation</span>
                                        <strong style={{ fontSize: '13.5px', color: '#FFFFFF' }}>{scannedBooking.roomType}</strong>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '10.5px', color: '#8E9B92', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Stay Dates</span>
                                        <strong style={{ fontSize: '13.5px', color: '#FFFFFF' }}>{scannedBooking.dates}</strong>
                                    </div>
                                </div>

                                {/* Catering & BBQ Tokens */}
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={ROW_GAP_8}>
                                        <Utensils size={15} color="#D5ED55" />
                                        <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#FFFFFF' }}>
                                            Catering Tokens:
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                                        <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ADE80', padding: '3px 8px', borderRadius: '6px', fontWeight: '800' }}>
                                            {scannedBooking.vegCount} Veg
                                        </span>
                                        <span style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#FB923C', padding: '3px 8px', borderRadius: '6px', fontWeight: '800' }}>
                                            {scannedBooking.nonVegCount} Non-Veg
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT COLUMN: ATTENDANCE CHECKLIST & GATE SETTLEMENT ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            {/* RE-SCAN & LATE ARRIVAL NOTIFICATION BANNER */}
                            {scannedBooking.status === 'Checked In' ? (
                                <div style={{
                                    background: 'rgba(34, 197, 94, 0.12)',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                    borderRadius: '18px',
                                    padding: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '12px'
                                }}>
                                    <div style={ROW_GAP_10}>
                                        <CheckCircle2 size={24} color="#4ADE80" />
                                        <div>
                                            <span style={{ fontSize: '13px', fontWeight: '800', color: '#4ADE80', display: 'block' }}>
                                                Pass Already Verified & Checked In
                                            </span>
                                            <span style={{ fontSize: '11px', color: '#8E9B92' }}>
                                                You can modify attendance, change tents, or re-issue gate permits below.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (scannedBooking.status === 'Partial Check-In' && Number(scannedBooking.shortCount) > 0 && Number(scannedBooking.checkedInCount) > 0) ? (
                                <div style={{
                                    background: 'rgba(234, 179, 8, 0.12)',
                                    border: '1px solid rgba(234, 179, 8, 0.35)',
                                    borderRadius: '18px',
                                    padding: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '12px'
                                }}>
                                    <div style={ROW_GAP_10}>
                                        <Clock size={24} color="#FACC15" />
                                        <div>
                                            <span style={{ fontSize: '13px', fontWeight: '800', color: '#FACC15', display: 'block' }}>
                                                Late Campers Joining Active Group
                                            </span>
                                            <span style={{ fontSize: '11px', color: '#8E9B92' }}>
                                                {presentCount} of {totalCount} currently at camp. {shortCount} arriving late.
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={checkInAllRemaining}
                                        style={{
                                            padding: '8px 14px',
                                            borderRadius: '10px',
                                            background: '#FACC15',
                                            color: '#0B150E',
                                            fontSize: '11.5px',
                                            fontWeight: '900',
                                            border: 'none',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        ✓ Check In All Late
                                    </button>
                                </div>
                            ) : null}

                            {/* ── ATTENDEE PER-PERSON TICKETS WITH AVATARS, MEAL BADGES & 1-TAP PILLS ── */}
                            <div style={{
                                background: '#101E13',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '22px',
                                padding: '20px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                                    <div style={ROW_GAP_8}>
                                        <Ticket size={18} color="#D5ED55" />
                                        <span style={{ fontSize: '14.5px', fontWeight: '900', color: '#FFFFFF' }}>
                                            Camper Headcount & Attendance
                                        </span>
                                    </div>

                                    <div style={ROW_GAP_6}>
                                        <button
                                            type="button"
                                            onClick={checkInAllRemaining}
                                            style={{
                                                padding: '5px 10px',
                                                borderRadius: '8px',
                                                background: 'rgba(213, 237, 85, 0.15)',
                                                border: '1px solid rgba(213, 237, 85, 0.3)',
                                                color: '#D5ED55',
                                                fontSize: '11px',
                                                fontWeight: '800',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            ✓ All Present
                                        </button>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '999px',
                                            background: shortCount === 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                                            color: shortCount === 0 ? '#4ADE80' : '#FACC15',
                                            fontSize: '11.5px',
                                            fontWeight: '800'
                                        }}>
                                            {shortCount === 0 ? `${presentCount}/${totalCount} Full Party` : `${presentCount}/${totalCount} (${shortCount} Short)`}
                                        </span>
                                    </div>
                                </div>

                                {/* Per-Camper Visual Cards with 1-Tap Attendance Pills */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {rosterChecklist.map((camper, idx) => {
                                        const camperStatus = camper.status || (camper.present ? 'present' : 'absent');
                                        const isLead = idx === 0;
                                        const camperInitials = camper.name
                                            ? camper.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                                            : `C${idx + 1}`;
                                        
                                        const avatarGradients = [
                                            'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                            'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                                            'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                                            'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                            'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
                                            'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)'
                                        ];

                                        const camperMeal = camper.mealType || (idx < (scannedBooking?.vegCount || 0) ? 'Veg' : 'Non-Veg');

                                        return (
                                            <div
                                                key={idx}
                                                style={{
                                                    background: camperStatus === 'present' 
                                                        ? 'rgba(213, 237, 85, 0.05)' 
                                                        : camperStatus === 'late' 
                                                            ? 'rgba(234, 179, 8, 0.07)' 
                                                            : 'rgba(239, 68, 68, 0.07)',
                                                    border: `1.5px solid ${camperStatus === 'present' ? 'rgba(213, 237, 85, 0.35)' : camperStatus === 'late' ? 'rgba(234, 179, 8, 0.4)' : 'rgba(239, 68, 68, 0.35)'}`,
                                                    borderRadius: '18px',
                                                    padding: '14px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '10px',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {/* Top Row: Avatar, Name, Meal Token & Badges */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '150px', flex: '1 1 auto' }}>
                                                        {/* Avatar Circle with Initials */}
                                                        <div style={{
                                                            width: '38px',
                                                            height: '38px',
                                                            borderRadius: '12px',
                                                            background: avatarGradients[idx % avatarGradients.length],
                                                            color: '#FFFFFF',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: '900',
                                                            fontSize: '13px',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                                                            flexShrink: 0,
                                                            position: 'relative'
                                                        }}>
                                                            {camperInitials}
                                                            {isLead && (
                                                                <span style={{ position: 'absolute', top: '-6px', right: '-6px', display: 'inline-flex' }}>
                                                                    <Crown size={12} color="#E5A93B" />
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div style={{ minWidth: 0 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                                <span style={{ fontSize: '14.5px', fontWeight: '800', color: '#FFFFFF' }}>
                                                                    {camper.name}
                                                                </span>
                                                                {isLead && (
                                                                    <span style={{ fontSize: '9px', fontWeight: '900', background: 'rgba(229, 169, 59, 0.2)', border: '1px solid rgba(229, 169, 59, 0.4)', color: '#E5A93B', padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                                                        Lead Explorer
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                                                                <span style={{ fontSize: '11px', color: '#8E9B92' }}>
                                                                    Ticket #{idx + 1}
                                                                </span>
                                                                <span style={{ fontSize: '10.5px', color: '#60A5FA', fontWeight: '700', background: 'rgba(96, 165, 250, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                                                                    Adult
                                                                </span>
                                                                <span style={{
                                                                    fontSize: '10.5px',
                                                                    fontWeight: '800',
                                                                    padding: '1px 6px',
                                                                    borderRadius: '4px',
                                                                    background: camperMeal === 'Veg' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(249, 115, 22, 0.15)',
                                                                    color: camperMeal === 'Veg' ? '#4ADE80' : '#FB923C'
                                                                }}>
                                                                    {camperMeal === 'Veg' ? 'Veg BBQ' : 'Chicken BBQ'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bottom Row: 3-Pill Instant Attendance Mode Toggle */}
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                                    gap: '6px',
                                                    background: '#07120A',
                                                    padding: '4px',
                                                    borderRadius: '12px',
                                                    border: '1px solid rgba(255,255,255,0.06)'
                                                }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setRosterChecklist(prev => {
                                                                const updated = [...prev];
                                                                updated[idx] = { ...updated[idx], status: 'present', present: true };
                                                                return updated;
                                                            });
                                                        }}
                                                        style={{
                                                            padding: '8px 4px',
                                                            minHeight: '36px',
                                                            borderRadius: '9px',
                                                            border: 'none',
                                                            background: camperStatus === 'present' ? '#D5ED55' : 'transparent',
                                                            color: camperStatus === 'present' ? '#0B150E' : '#8E9B92',
                                                            fontSize: '11.5px',
                                                            fontWeight: '900',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '4px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.15s ease'
                                                        }}
                                                    >
                                                        <span style={{ display: 'inline-flex' }}><CheckCircle2 size={13} color="#22C55E" /></span>
                                                        <span>Present</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setRosterChecklist(prev => {
                                                                const updated = [...prev];
                                                                updated[idx] = { ...updated[idx], status: 'late', present: false };
                                                                return updated;
                                                            });
                                                        }}
                                                        style={{
                                                            padding: '8px 4px',
                                                            minHeight: '36px',
                                                            borderRadius: '9px',
                                                            border: 'none',
                                                            background: camperStatus === 'late' ? '#FACC15' : 'transparent',
                                                            color: camperStatus === 'late' ? '#0B150E' : '#8E9B92',
                                                            fontSize: '11.5px',
                                                            fontWeight: '900',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '4px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.15s ease'
                                                        }}
                                                    >
                                                        <span>⏳</span>
                                                        <span>Late (Jeep)</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setRosterChecklist(prev => {
                                                                const updated = [...prev];
                                                                updated[idx] = { ...updated[idx], status: 'absent', present: false };
                                                                return updated;
                                                            });
                                                        }}
                                                        style={{
                                                            padding: '8px 4px',
                                                            minHeight: '36px',
                                                            borderRadius: '9px',
                                                            border: 'none',
                                                            background: camperStatus === 'absent' ? '#EF4444' : 'transparent',
                                                            color: camperStatus === 'absent' ? '#FFFFFF' : '#8E9B92',
                                                            fontSize: '11.5px',
                                                            fontWeight: '900',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '4px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.15s ease'
                                                        }}
                                                    >
                                                        <span>✕</span>
                                                        <span>Absent</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Walk-In / Extra Guest Adder */}
                                <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', gap: '8px' }}>
                                    <span style={{ fontSize: '12px', color: '#8E9B92' }}>
                                        Walk-In / Extra Guest on Arrival?
                                    </span>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {extraGuestsCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveExtraCamper}
                                                style={{ padding: '6px 10px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: 'none', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                                            >
                                                - Remove Extra
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleAddExtraCamper}
                                            style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(213,237,85,0.15)', color: '#D5ED55', border: '1px solid rgba(213,237,85,0.3)', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer' }}
                                        >
                                            + Add Extra Camper (+₹2,499)
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* ── PRE-ASSIGNED ACCOMMODATION & WRISTBAND ALLOCATION ── */}
                            <div style={{
                                background: '#101E13',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '20px',
                                padding: '20px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                                    <div style={ROW_GAP_10}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '12px',
                                            background: 'rgba(213, 237, 85, 0.15)',
                                            border: '1px solid rgba(213, 237, 85, 0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#D5ED55',
                                            flexShrink: 0
                                        }}>
                                            <Tent size={20} />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '11px', color: '#8E9B92', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                                                Reserved Accommodation (Pre-Assigned from Booking):
                                            </span>
                                            <div style={{ fontSize: '15.5px', fontWeight: '900', color: '#FFFFFF', marginTop: '2px' }}>
                                                {assignedTent || scannedBooking.roomType || scannedBooking.campsite}
                                            </div>
                                            <span style={{ fontSize: '11px', color: '#D5ED55', display: 'block', marginTop: '2px' }}>
                                                ✓ Confirmed for Pass #{scannedBooking.id}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setIsChangingTent(!isChangingTent)}
                                        style={{
                                            padding: '7px 12px',
                                            borderRadius: '10px',
                                            background: isChangingTent ? '#D5ED55' : 'rgba(255, 255, 255, 0.06)',
                                            border: `1px solid ${isChangingTent ? '#D5ED55' : 'rgba(255, 255, 255, 0.12)'}`,
                                            color: isChangingTent ? '#0B150E' : '#C8D8CB',
                                            fontSize: '11.5px',
                                            fontWeight: '800',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <Edit2 size={12} />
                                        <span>{isChangingTent ? '✕ Keep Pre-Assigned' : 'Change / Upgrade Room'}</span>
                                    </button>
                                </div>

                                {/* Optional Reassignment Panel (Only opens when host clicks Change / Upgrade) */}
                                {isChangingTent && (
                                    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                        <label style={{ fontSize: '11px', fontWeight: '800', color: '#E5A93B', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                                            Select New Pod / Tent To Reassign:
                                        </label>
                                        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '10px' }}>
                                            {[
                                                'Pod #1 (Sunset Ridge Deck)',
                                                'Pod #2 (Panoramic Glass Dome)',
                                                'Pod #3 (Sunrise Cliff Edge)',
                                                'Pod #4 (Valley View Dome)',
                                                'Pod #5 (Cloud View Pod)',
                                                'Alpine Tent A-1 (2-Person)',
                                                'Alpine Tent A-2 (2-Person)',
                                                'Alpine Quad Q-1 (4-Person)',
                                                'Cottage #1 (Cliffside Wooden)'
                                            ].map(t => {
                                                const shortLabel = t.split('(')[0].trim();
                                                const isSelected = assignedTent === t;
                                                return (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() => { setAssignedTent(t); showToast(`✓ Reassigned to ${shortLabel}`); }}
                                                        style={{
                                                            padding: '6px 10px',
                                                            borderRadius: '999px',
                                                            background: isSelected ? '#D5ED55' : 'rgba(255, 255, 255, 0.06)',
                                                            color: isSelected ? '#0B150E' : '#C8D8CB',
                                                            border: `1px solid ${isSelected ? '#D5ED55' : 'rgba(255,255,255,0.1)'}`,
                                                            fontSize: '11px',
                                                            fontWeight: '800',
                                                            whiteSpace: 'nowrap',
                                                            cursor: 'pointer',
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        {isSelected ? '✓ ' : ''}{shortLabel}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <CustomDropdown
                                            label="Or Search All Campsite Pods & Tents:"
                                            value={assignedTent}
                                            options={tentOptions}
                                            onChange={(val) => setAssignedTent(val)}
                                        />
                                    </div>
                                )}

                                {/* Wristband Tag Range Sequencer */}
                                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#8E9B92' }}>
                                            Wristband Tag # Range:
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleAutoGenerateWristbands}
                                            style={{
                                                background: 'rgba(213, 237, 85, 0.15)',
                                                border: '1px solid rgba(213, 237, 85, 0.3)',
                                                color: '#D5ED55',
                                                fontSize: '11px',
                                                fontWeight: '800',
                                                padding: '3px 9px',
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Auto-Sequence Tags
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="e.g. #101 - #104"
                                        value={wristbandRange}
                                        onChange={e => setWristbandRange(e.target.value)}
                                        style={{
                                            width: '100%',
                                            minHeight: '42px',
                                            padding: '10px 14px',
                                            borderRadius: '12px',
                                            background: '#08120A',
                                            border: '1px solid rgba(255, 255, 255, 0.14)',
                                            color: '#FFFFFF',
                                            fontSize: '13px',
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* ── GATE SETTLEMENT & MULTI-OPTION PAYMENT CARD ── */}
                            <div style={{
                                background: '#101E13',
                                border: `1px solid ${isBalancePaid ? 'rgba(34, 197, 94, 0.35)' : 'rgba(229, 169, 59, 0.4)'}`,
                                borderRadius: '22px',
                                padding: '20px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                                    <div style={ROW_GAP_8}>
                                        <Wallet size={18} color="#D5ED55" />
                                        <span style={{ fontSize: '14.5px', fontWeight: '900', color: '#FFFFFF' }}>
                                            Gate Balance & Payment Options
                                        </span>
                                    </div>
                                    <span style={{
                                        fontSize: '11.5px',
                                        fontWeight: '900',
                                        padding: '4px 10px',
                                        borderRadius: '999px',
                                        background: isBalancePaid ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                        color: isBalancePaid ? '#4ADE80' : '#FCA5A5'
                                    }}>
                                        {isBalancePaid ? '✓ ALL SETTLED' : 'PAYMENT DUE'}
                                    </span>
                                </div>

                                {/* Financial Summary Ribbon */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '12px' }}>
                                        <span style={{ fontSize: '10px', color: '#8E9B92', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>Total</span>
                                        <span style={{ fontSize: '14px', fontWeight: '900', color: '#FFFFFF' }}>₹{(scannedBooking.totalPrice + extraBalance).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '12px' }}>
                                        <span style={{ fontSize: '10px', color: '#8E9B92', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>Advance</span>
                                        <span style={{ fontSize: '14px', fontWeight: '900', color: '#4ADE80' }}>₹{scannedBooking.advancePaid.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div style={{ background: isBalancePaid ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.15)', border: `1px solid ${isBalancePaid ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, padding: '10px 12px', borderRadius: '12px' }}>
                                        <span style={{ fontSize: '10px', color: isBalancePaid ? '#4ADE80' : '#FCA5A5', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>
                                            {isBalancePaid ? 'Collected' : 'Due on Entry'}
                                        </span>
                                        <span style={{ fontSize: '15px', fontWeight: '900', color: isBalancePaid ? '#4ADE80' : '#EF4444' }}>
                                            ₹{isBalancePaid ? '0' : dynamicBalanceDue.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>

                                {/* 2-WAY SETTLEMENT METHOD TABS */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '6px',
                                    background: 'rgba(0, 0, 0, 0.4)',
                                    padding: '4px',
                                    borderRadius: '14px',
                                    marginBottom: '16px'
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => setSettlementMethod('cash')}
                                        style={{
                                            padding: '8px 4px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            background: settlementMethod === 'cash' ? '#D5ED55' : 'transparent',
                                            color: settlementMethod === 'cash' ? '#0B150E' : '#A2B6A6',
                                            fontSize: '11.5px',
                                            fontWeight: '800',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <DollarSign size={13} />
                                        <span>Cash Gate</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setSettlementMethod('gateway')}
                                        style={{
                                            padding: '8px 4px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            background: settlementMethod === 'gateway' ? '#D5ED55' : 'transparent',
                                            color: settlementMethod === 'gateway' ? '#0B150E' : '#A2B6A6',
                                            fontSize: '11.5px',
                                            fontWeight: '800',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <CreditCard size={13} />
                                        <span>Online Link</span>
                                    </button>
                                </div>

                                {/* TAB 1: CASH AT GATE */}
                                {settlementMethod === 'cash' && (
                                    <div style={{
                                        background: 'rgba(34, 197, 94, 0.06)',
                                        border: '1px solid rgba(34, 197, 94, 0.25)',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        marginBottom: '16px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                                            Physical Cash Handover at Basecamp Gate
                                        </div>
                                        <div style={{ fontSize: '32px', fontWeight: '900', color: '#FFFFFF', margin: '6px 0' }}>
                                            ₹{dynamicBalanceDue.toLocaleString('en-IN')}
                                        </div>
                                        <p style={{ fontSize: '12px', color: '#8E9B92', margin: '0 0 10px' }}>
                                            Collect cash from <strong>{scannedBooking.name}</strong> at counter and tap "Mark Balance Settled" below.
                                        </p>
                                    </div>
                                )}

                                {/* TAB 3: ONLINE RAZORPAY LINK (TEMPLATE - ACCOUNT ON HOLD) */}
                                {settlementMethod === 'gateway' && (
                                    <div style={{
                                        background: 'rgba(96, 165, 250, 0.06)',
                                        border: '1px solid rgba(96, 165, 250, 0.25)',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        marginBottom: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px'
                                    }}>
                                        <div style={ROW_SPACE}>
                                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                                Razorpay Payment Link
                                            </div>
                                            <span style={{
                                                fontSize: '9.5px',
                                                color: '#4ADE80',
                                                background: 'rgba(34, 197, 94, 0.12)',
                                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                                padding: '2px 7px',
                                                borderRadius: '6px',
                                                fontWeight: '800'
                                            }}>
                                                ACTIVE
                                            </span>
                                        </div>

                                        <div style={{
                                            background: '#08120A',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            borderRadius: '12px',
                                            padding: '12px 14px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <span style={{ fontSize: '10.5px', color: '#8E9B92', display: 'block', textTransform: 'uppercase', fontWeight: '800' }}>
                                                    Online Due Balance:
                                                </span>
                                                <span style={{ fontSize: '22px', fontWeight: '900', color: '#FFFFFF' }}>
                                                    ₹{dynamicBalanceDue.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                            <span style={{ fontSize: '11px', color: '#93C5FD', textAlign: 'right' }}>
                                                Cards • NetBanking • UPI
                                            </span>
                                        </div>

                                        <p style={{ fontSize: '11.5px', color: '#8E9B92', margin: '0' }}>
                                            Send the digital payment checkout link directly to the guest's WhatsApp:
                                        </p>

                                        <a
                                            href={`https://wa.me/${getCleanWhatsAppPhone(scannedBooking.phone)}?text=Hi%20${encodeURIComponent(scannedBooking.name)}%2C%20here%20is%20your%20Aanandham%20Gate%20Pass%20settlement%20link%20for%20balance%20%E2%82%B9${dynamicBalanceDue}%3A%20https%3A%2F%2Faanandham.in%2Fpass%2F${scannedBooking.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                width: '100%',
                                                padding: '11px',
                                                borderRadius: '12px',
                                                background: '#25D366',
                                                color: '#0B150E',
                                                fontSize: '12.5px',
                                                fontWeight: '900',
                                                textDecoration: 'none',
                                                boxSizing: 'border-box',
                                                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)'
                                            }}
                                        >
                                            <MessageCircle size={15} />
                                            <span>Send Settlement Link to Guest on WhatsApp</span>
                                        </a>
                                    </div>
                                )}

                                {/* ONE-TAP TOGGLE TO MARK PAYMENT COLLECTED */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const nextState = !isBalancePaid;
                                        setIsBalancePaid(nextState);
                                        if (nextState) {
                                            playSuccessChime();
                                            showToast(`✓ Marked balance (₹${dynamicBalanceDue}) as collected!`);
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '13px 14px',
                                        borderRadius: '14px',
                                        background: isBalancePaid 
                                            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.15) 100%)' 
                                            : 'rgba(255, 255, 255, 0.05)',
                                        border: `1.5px solid ${isBalancePaid ? '#22C55E' : 'rgba(255, 255, 255, 0.15)'}`,
                                        color: '#FFFFFF',
                                        fontSize: '13px',
                                        fontWeight: '800',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '10px',
                                        cursor: 'pointer',
                                        boxSizing: 'border-box',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '6px',
                                            background: isBalancePaid ? '#22C55E' : 'transparent',
                                            border: `2px solid ${isBalancePaid ? '#22C55E' : 'rgba(255, 255, 255, 0.3)'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {isBalancePaid && <Check size={16} color="#0B150E" strokeWidth={3} />}
                                        </div>
                                        <span>
                                            {isBalancePaid 
                                                ? `✓ Balance Settled (₹${dynamicBalanceDue} received via ${settlementMethod === 'cash' ? 'Cash' : 'Online Gateway'})` 
                                                : `Mark ₹${dynamicBalanceDue.toLocaleString('en-IN')} balance as collected (${settlementMethod === 'cash' ? 'Cash' : 'Online Gateway'})`}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '11px', color: isBalancePaid ? '#4ADE80' : '#8E9B92', fontWeight: '700', flexShrink: 0 }}>
                                        {isBalancePaid ? 'Tap to Undo' : 'Tap to Confirm'}
                                    </span>
                                </button>
                            </div>

                            {/* ── ACTION BUTTONS ── */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={handleConfirmCheckin}
                                    disabled={isSubmittingCheckin}
                                    style={{
                                        width: '100%',
                                        minHeight: '52px',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        background: shortCount > 0 ? '#F59E0B' : '#D5ED55',
                                        color: '#0B150E',
                                        fontSize: '15px',
                                        fontWeight: '900',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <CheckCircle2 size={18} />
                                    <span>
                                        {isSubmittingCheckin 
                                            ? 'Generating Gate Clearance Permit...' 
                                            : shortCount > 0 
                                                ? `Issue Partial Gate Permit (${presentCount} Present, ${shortCount} Short)` 
                                                : `Issue Full Gate Clearance Permit (${presentCount}/${totalCount})`}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={resetScanner}
                                    style={{
                                        width: '100%',
                                        minHeight: '44px',
                                        padding: '12px',
                                        borderRadius: '14px',
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                        color: '#FFFFFF',
                                        fontSize: '13.5px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <ArrowLeft size={16} />
                                    <span>Scan Next Arrival / Back</span>
                                </button>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    );

    return mounted && typeof document !== 'undefined'
        ? createPortal(modalContent, document.body)
        : modalContent;
}
