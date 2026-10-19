"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
    ChefHat, Utensils, Drumstick, Users, Phone, MessageCircle, 
    DollarSign, Flame, Clock, Tent, MapPin, Truck, Smartphone, Check, AlertCircle,
    Leaf, Copy, TrendingUp, FileText, Hourglass
} from 'lucide-react';
import { ROW_GAP_8, ROW_GAP_10, ROW_GAP_6, ROW_SPACE, StationGlyph, AANANDHAM_CAMPS, getCleanWhatsAppPhone } from './ScannerShared';

export default function ScannerKitchenView({ state = {} }) {
    const {
        authStation = {},
        selectedCampground,
        handleSelectCampground = () => {},
        campIsolatedRoster = [],
        activeStats = {},
        sendKitchenWhatsApp = () => {},
        isGuestMatchingCamp = () => true,
        handleCopyKitchenHeadcount = state?.handleCopyKitchenHeadcount || (() => {}),
        getKitchenDispatchText = state?.getKitchenDispatchText || (() => ''),
        selectGuestFromRoster = state?.selectGuestFromRoster || (() => {})
    } = state || {};

    return (
        <main style={{
            flex: 1,
            padding: '16px clamp(14px, 4vw, 24px) 100px',
            maxWidth: '860px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        }}>
                                {/* 1. 🏕️ STATION & SCOPE HEADER */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(16, 30, 19, 0.98) 0%, rgba(10, 22, 13, 0.95) 100%)',
                        border: '1px solid rgba(213, 237, 85, 0.25)',
                        borderRadius: '20px',
                        padding: '16px 18px',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={ROW_GAP_10}>
                                <div style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '12px',
                                    background: 'rgba(213, 237, 85, 0.12)',
                                    border: '1px solid rgba(213, 237, 85, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '18px'
                                }}>
                                    <StationGlyph icon={authStation?.icon} size={24} />
                                </div>
                                <div>
                                    <div style={ROW_GAP_8}>
                                        <span style={{ fontSize: '15px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '0.3px' }}>
                                            {authStation?.isMasterAdmin ? 'Master Enterprise Kitchen' : (authStation?.campName || 'Field Kitchen')}
                                        </span>
                                        {!authStation?.isMasterAdmin && (
                                            <span style={{
                                                fontSize: '9.5px',
                                                color: '#60A5FA',
                                                background: 'rgba(96, 165, 250, 0.15)',
                                                border: '1px solid rgba(96, 165, 250, 0.3)',
                                                padding: '2px 7px',
                                                borderRadius: '6px',
                                                fontWeight: '800'
                                            }}>
                                                STATION LOCKED
                                            </span>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#A2B6A6', marginTop: '2px', display: 'block' }}>
                                        Catering & BBQ Dinner Headcount Sync • {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                padding: '6px 12px',
                                borderRadius: '10px',
                                fontSize: '11.5px',
                                color: '#D5ED55',
                                fontWeight: '800'
                            }}>
                                <Users size={13} />
                                <span>{activeStats.totalExpectedCampers} Campers in Scope</span>
                            </div>
                        </div>

                        {/* If Master Admin, allow switching sanctuaries */}
                        {authStation.isMasterAdmin && (
                            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', paddingTop: '4px' }}>
                                {AANANDHAM_CAMPS.map(camp => {
                                    const isSelected = selectedCampground === camp.id;
                                    return (
                                        <button
                                            key={camp.id}
                                            type="button"
                                            onClick={() => handleSelectCampground(camp.id)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '10px',
                                                background: isSelected ? '#D5ED55' : 'rgba(255, 255, 255, 0.05)',
                                                color: isSelected ? '#0B150E' : '#C8D8CB',
                                                border: `1px solid ${isSelected ? '#D5ED55' : 'rgba(255, 255, 255, 0.08)'}`,
                                                fontSize: '11px',
                                                fontWeight: '800',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                whiteSpace: 'nowrap',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            <span style={{ display: 'inline-flex' }}><camp.icon size={14} strokeWidth={2.2} /></span>
                                            <span>{camp.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 2. 🔥 HERO CHEF CATERING COMMAND CARD */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(20, 38, 24, 0.95) 0%, rgba(12, 24, 15, 0.98) 100%)',
                        border: '1.5px solid rgba(213, 237, 85, 0.3)',
                        borderRadius: '22px',
                        padding: '20px',
                        boxShadow: '0 10px 35px rgba(0,0,0,0.4)'
                    }}>
                        {/* Top Totals Banner */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '12px',
                            paddingBottom: '16px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D5ED55', marginBottom: '3px' }}>
                                    <Flame size={16} />
                                    <span style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                        Tonight's Dinner Service
                                    </span>
                                </div>
                                <span style={{ fontSize: '11.5px', color: '#8E9B92' }}>
                                    Campfire BBQ & Buffet Schedule: <strong>07:30 PM — 09:30 PM</strong>
                                </span>
                            </div>

                            <div style={{
                                background: 'rgba(213, 237, 85, 0.12)',
                                border: '1px solid rgba(213, 237, 85, 0.35)',
                                padding: '8px 16px',
                                borderRadius: '14px',
                                textAlign: 'right'
                            }}>
                                <span style={{ fontSize: '10px', fontWeight: '800', color: '#A2B6A6', textTransform: 'uppercase', display: 'block' }}>
                                    Total Meals to Prep
                                </span>
                                <span style={{ fontSize: '26px', fontWeight: '900', color: '#D5ED55' }}>
                                    {Number(activeStats.vegMealsCount || 0) + Number(activeStats.nonVegMealsCount || 0)} <span style={{ fontSize: '13px', color: '#C8D8CB' }}>Plates</span>
                                </span>
                            </div>
                        </div>

                        {/* Veg vs Chicken BBQ Split Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginTop: '16px' }}>
                            {/* 🥗 VEGETARIAN BBQ CARD */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.05) 100%)',
                                border: '1.5px solid rgba(34, 197, 94, 0.4)',
                                borderRadius: '18px',
                                padding: '18px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                gap: '12px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                            <Leaf size={18} color='#4ADE80' />
                                            <span style={{ fontSize: '13px', fontWeight: '900', color: '#4ADE80', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                                                Veg BBQ Meals
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#A2B6A6' }}>
                                            Paneer Tikka, Grilled Veggies & Dal
                                        </span>
                                    </div>
                                    <span style={{
                                        fontSize: '10px',
                                        fontWeight: '800',
                                        color: '#4ADE80',
                                        background: 'rgba(34, 197, 94, 0.15)',
                                        padding: '3px 8px',
                                        borderRadius: '6px'
                                    }}>
                                        {(Number(activeStats.vegMealsCount || 0) + Number(activeStats.nonVegMealsCount || 0)) > 0 
                                            ? `${Math.round((activeStats.vegMealsCount / (activeStats.vegMealsCount + activeStats.nonVegMealsCount)) * 100)}% Load`
                                            : '0%'}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                    <span style={{ fontSize: '38px', fontWeight: '900', color: '#4ADE80', lineHeight: 1 }}>
                                        {activeStats.vegMealsCount}
                                    </span>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#8E9B92' }}>
                                        Portions to Cook
                                    </span>
                                </div>
                            </div>

                            {/* 🍗 CHICKEN BBQ CARD */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(249, 115, 22, 0.05) 100%)',
                                border: '1.5px solid rgba(249, 115, 22, 0.4)',
                                borderRadius: '18px',
                                padding: '18px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                gap: '12px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                            <Drumstick size={18} color='#FB923C' />
                                            <span style={{ fontSize: '13px', fontWeight: '900', color: '#FB923C', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                                                Chicken BBQ Meals
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#A2B6A6' }}>
                                            Charcoal Marinated Chicken Tikka
                                        </span>
                                    </div>
                                    <span style={{
                                        fontSize: '10px',
                                        fontWeight: '800',
                                        color: '#FB923C',
                                        background: 'rgba(249, 115, 22, 0.15)',
                                        padding: '3px 8px',
                                        borderRadius: '6px'
                                    }}>
                                        {(Number(activeStats.vegMealsCount || 0) + Number(activeStats.nonVegMealsCount || 0)) > 0 
                                            ? `${Math.round((activeStats.nonVegMealsCount / (activeStats.vegMealsCount + activeStats.nonVegMealsCount)) * 100)}% Load`
                                            : '0%'}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                    <span style={{ fontSize: '38px', fontWeight: '900', color: '#FB923C', lineHeight: 1 }}>
                                        {activeStats.nonVegMealsCount}
                                    </span>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#8E9B92' }}>
                                        Portions to Cook
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. 💬 WHATSAPP DISPATCH TO KITCHEN CHEF */}
                    <div style={{
                        background: '#0B160E',
                        border: '1.5px solid rgba(37, 211, 102, 0.3)',
                        borderRadius: '20px',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={ROW_GAP_8}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '10px',
                                    background: 'rgba(37, 211, 102, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#25D366'
                                }}>
                                    <MessageCircle size={16} />
                                </div>
                                <div>
                                    <span style={{ fontSize: '13.5px', fontWeight: '900', color: '#FFFFFF', display: 'block' }}>
                                        WhatsApp Food Count Dispatch
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#A2B6A6' }}>
                                        Formatted clearly for kitchen helpers and chef
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={handleCopyKitchenHeadcount}
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: '10px',
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        color: '#FFFFFF',
                                        fontSize: '12px',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Copy size={13} />
                                    <span>Copy Text</span>
                                </button>
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(getKitchenDispatchText())}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '10px',
                                        background: '#25D366',
                                        color: '#0B150E',
                                        fontSize: '12.5px',
                                        fontWeight: '900',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)'
                                    }}
                                >
                                    <MessageCircle size={14} />
                                    <span>Send to Chef →</span>
                                </a>
                            </div>
                        </div>

                        {/* WhatsApp Message Preview Bubble */}
                        <div style={{
                            background: '#071009',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '14px',
                            padding: '12px 14px',
                            fontSize: '11.5px',
                            lineHeight: '1.6',
                            color: '#C8D8CB',
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '180px',
                            overflowY: 'auto'
                        }}>
                            {getKitchenDispatchText()}
                        </div>
                    </div>

                    {/* 4. 👥 LIVE OCCUPANCY & JEEP ARRIVAL STATUS */}
                    <div style={{
                        background: '#101E13',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '20px',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px'
                    }}>
                        <div style={ROW_SPACE}>
                            <div style={ROW_GAP_8}>
                                <TrendingUp size={17} color="#D5ED55" />
                                <span style={{ fontSize: '13.5px', fontWeight: '900', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Ridge Seating & Arrival Flow
                                </span>
                            </div>
                            <span style={{ fontSize: '11px', color: '#8E9B92', fontWeight: '700' }}>
                                {activeStats.totalExpectedCampers} Total Bookings
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                            <div style={{ background: 'rgba(74, 222, 128, 0.08)', border: '1px solid rgba(74, 222, 128, 0.25)', padding: '12px 14px', borderRadius: '14px' }}>
                                <span style={{ fontSize: '11px', color: '#4ADE80', fontWeight: '700', display: 'block' }}>In Camp & Seated</span>
                                <span style={{ fontSize: '24px', fontWeight: '900', color: '#4ADE80', display: 'block', marginTop: '2px' }}>
                                    {activeStats.totalCheckedInCampers}
                                </span>
                                <span style={{ fontSize: '10px', color: '#8E9B92' }}>Ready for hot dinner</span>
                            </div>

                            <div style={{ background: 'rgba(250, 204, 21, 0.08)', border: '1px solid rgba(250, 204, 21, 0.25)', padding: '12px 14px', borderRadius: '14px' }}>
                                <span style={{ fontSize: '11px', color: '#FACC15', fontWeight: '700', display: 'block' }}>⏳ En Route (In Jeeps)</span>
                                <span style={{ fontSize: '24px', fontWeight: '900', color: '#FACC15', display: 'block', marginTop: '2px' }}>
                                    {activeStats.totalPendingCampers}
                                </span>
                                <span style={{ fontSize: '10px', color: '#8E9B92' }}>Keep food warming</span>
                            </div>

                            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '12px 14px', borderRadius: '14px' }}>
                                <span style={{ fontSize: '11px', color: '#F87171', fontWeight: '700', display: 'block' }}>Short / Absent</span>
                                <span style={{ fontSize: '24px', fontWeight: '900', color: '#F87171', display: 'block', marginTop: '2px' }}>
                                    {activeStats.totalShortCampers}
                                </span>
                                <span style={{ fontSize: '10px', color: '#8E9B92' }}>Zero food waste</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
                            <div style={{
                                width: `${activeStats.totalExpectedCampers > 0 ? (activeStats.totalCheckedInCampers / activeStats.totalExpectedCampers) * 100 : 0}%`,
                                height: '100%',
                                background: '#4ADE80',
                                transition: 'width 0.3s ease'
                            }} />
                            <div style={{
                                width: `${activeStats.totalExpectedCampers > 0 ? (activeStats.totalPendingCampers / activeStats.totalExpectedCampers) * 100 : 0}%`,
                                height: '100%',
                                background: '#FACC15',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                    </div>

                    {/* 5. 📋 GROUP-BY-GROUP DINNER ROSTER */}
                    <div style={{
                        background: '#101E13',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '20px',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <div style={ROW_SPACE}>
                            <div style={ROW_GAP_8}>
                                <FileText size={17} color="#D5ED55" />
                                <span style={{ fontSize: '13.5px', fontWeight: '900', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Group Dinner Orders ({campIsolatedRoster.length})
                                </span>
                            </div>
                            <span style={{ fontSize: '11px', color: '#8E9B92' }}>
                                Meals per squad / tent
                            </span>
                        </div>

                        {campIsolatedRoster.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#8E9B92', fontSize: '12.5px' }}>
                                No bookings scheduled for this station today.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {campIsolatedRoster.map((booking) => {
                                    const isCheckedIn = booking.status === 'Checked In';
                                    const totalGuests = Number(booking.totalGuests || booking.guests || 2);
                                    const vegCount = Number(booking.vegCount || 0);
                                    const nonVegCount = Number(booking.nonVegCount || 0);
                                    const tentName = booking.roomType || booking.assignedTent || 'Dome Pod';

                                    return (
                                        <div
                                            key={booking.id}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                                borderRadius: '14px',
                                                padding: '12px 14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                flexWrap: 'wrap',
                                                gap: '8px'
                                            }}
                                        >
                                            <div style={ROW_GAP_10}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '10px',
                                                    background: isCheckedIn ? 'rgba(74, 222, 128, 0.15)' : 'rgba(250, 204, 21, 0.15)',
                                                    border: `1px solid ${isCheckedIn ? 'rgba(74, 222, 128, 0.3)' : 'rgba(250, 204, 21, 0.3)'}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '14px'
                                                }}>
                                                    {isCheckedIn ? '✓' : <Hourglass size={13} />}
                                                </div>
                                                <div>
                                                    <div style={ROW_GAP_6}>
                                                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF' }}>
                                                            {booking.name}
                                                        </span>
                                                        <span style={{ fontSize: '11px', color: '#8E9B92' }}>
                                                            ({totalGuests} Campers)
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '11px', color: '#A2B6A6' }}>
                                                        <span>{tentName}</span>
                                                        <span>•</span>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Truck size={13} /> {booking.convoyTime || '02:30 PM Batch'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={ROW_GAP_8}>
                                                <div style={{ display: 'flex', gap: '6px', fontSize: '11.5px', fontWeight: '800' }}>
                                                    <span style={{ color: '#4ADE80', background: 'rgba(34, 197, 94, 0.12)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
                                                        {vegCount}V
                                                    </span>
                                                    <span style={{ color: '#FB923C', background: 'rgba(249, 115, 22, 0.12)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(249, 115, 22, 0.25)' }}>
                                                        {nonVegCount}NV
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => selectGuestFromRoster(booking)}
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
                                                    View Pass →
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 6. 💰 FRONT DESK SETTLEMENT */}
                    <div style={{
                        background: '#101E13',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '20px',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <div style={ROW_GAP_8}>
                            <DollarSign size={17} color="#D5ED55" />
                            <span style={{ fontSize: '13.5px', fontWeight: '900', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Front Desk Settlement
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '14px', borderRadius: '14px' }}>
                                <span style={{ fontSize: '11px', color: '#F87171', display: 'block', fontWeight: '700' }}>Balance To Collect</span>
                                <span style={{ fontSize: '24px', fontWeight: '900', color: '#EF4444', display: 'block', marginTop: '2px' }}>
                                    ₹{Number(activeStats?.totalBalanceDue || 0).toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div style={{ background: 'rgba(74, 222, 128, 0.08)', border: '1px solid rgba(74, 222, 128, 0.2)', padding: '14px', borderRadius: '14px' }}>
                                <span style={{ fontSize: '11px', color: '#4ADE80', display: 'block', fontWeight: '700' }}>Balance Settled at Gate</span>
                                <span style={{ fontSize: '24px', fontWeight: '900', color: '#4ADE80', display: 'block', marginTop: '2px' }}>
                                    ₹{Number(activeStats?.totalBalanceCollected || 0).toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>
                    </div>
        </main>
    );
}
