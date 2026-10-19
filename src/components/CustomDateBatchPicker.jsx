"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar as CalendarIcon, 
    ChevronDown, 
    Sparkles, 
    Clock, 
    Check, 
    Compass, 
    Flame, 
    Moon, 
    Tent, 
    ChevronRight, 
    MapPin, 
    ShieldCheck, 
    ThermometerSun,
    CalendarDays,
    Flag,
    ArrowLeft
} from 'lucide-react';
import { generateUpcomingWeekendBatches } from '../lib/utils';
import CustomThemeCalendar from './CustomThemeCalendar';

const BATCH_DETAILS_META = {
    0: {
        themeTag: 'Full Moon Ridge Glamp',
        icon: Moon,
        inclusions: ['4x4 Kolukkumalai Sunrise Jeep', 'Acoustic Campfire & BBQ Dinner', 'Starlit Ridge Tent Pod'],
        weather: '14°C Alpine Night · Clear Skies',
        totalSlots: 15,
        bookedSlots: 9,
    },
    1: {
        themeTag: 'Meteor Campfire Night',
        icon: Sparkles,
        inclusions: ['Stargazing Telescope Guide', 'Live Acoustic BBQ Night', 'Phantom Head Morning Trek'],
        weather: '13°C Misty Breeze · 7,130 FT',
        totalSlots: 15,
        bookedSlots: 11,
    },
    2: {
        themeTag: 'Live Wilderness Acoustic',
        icon: Flame,
        inclusions: ['Campfire Jam & Dinner', 'Cloud Bed Sunrise Safari', 'Hot Kerala Breakfast'],
        weather: '15°C Foggy Valley Night',
        totalSlots: 15,
        bookedSlots: 7,
    },
    3: {
        themeTag: 'Summit Cloud Bed Batch',
        icon: Tent,
        inclusions: ['Sunrise Valley View Trek', 'Tea Plantation Nature Walk', 'All Meals & Camp Stay'],
        weather: '14°C Crisp Sunrise Ridge',
        totalSlots: 15,
        bookedSlots: 12,
    },
    4: {
        themeTag: 'High-Altitude Forest Trail',
        icon: Compass,
        inclusions: ['Guided Off-Road 4x4 Safari', 'Bonfire & Marshmallows', 'Alpine Dome Pod'],
        weather: '16°C Fresh Mountain Air',
        totalSlots: 15,
        bookedSlots: 6,
    },
    5: {
        themeTag: 'Weekend Expedition Special',
        icon: Flame,
        inclusions: ['4x4 Kolukkumalai Peak Safari', 'Campfire & Dinner Feast', 'Panoramic Sunrise Pod'],
        weather: '14°C Starlit Ridge Night',
        totalSlots: 15,
        bookedSlots: 10,
    }
};

export default function CustomDateBatchPicker({
    selectedDate,
    value,
    onDateChange,
    onChange,
    theme = 'light', // 'light' | 'dark'
    label = 'SELECT EXPEDITION DATES',
    durationDays = 2 // default 2 Days / 1 Night
}) {
    const effectiveSelectedDate = selectedDate || value || '';
    const handleDateChange = onDateChange || onChange || (() => {});
    const upcomingBatches = useMemo(() => generateUpcomingWeekendBatches(6), []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('batches'); // 'batches' | 'calendar'
    const [hoveredBatch, setHoveredBatch] = useState(null);
    const [selectedDuration, setSelectedDuration] = useState(durationDays);
    const containerRef = useRef(null);

    // Lock scroll when modal is open
    useEffect(() => {
        if (isModalOpen) {
            window.__lenis?.stop();
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                window.__lenis?.start();
                document.body.style.overflow = originalOverflow || '';
            };
        }
    }, [isModalOpen]);

    // Current display label
    const matchedBatch = upcomingBatches.find(b => b.title === effectiveSelectedDate || b.rawDate === effectiveSelectedDate);
    const displayTitle = matchedBatch ? matchedBatch.title : (effectiveSelectedDate || 'Select Weekend Batch or Date');
    const displaySubtitle = matchedBatch ? matchedBatch.subtitle : `${selectedDuration} Days / ${selectedDuration - 1} Night Expedition`;

    const handleSelectBatch = (batch) => {
        handleDateChange(batch.title);
        setIsModalOpen(false);
    };

    const handleCalendarSelect = (isoDate) => {
        const d = new Date(isoDate);
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        const formattedStart = d.toLocaleDateString('en-US', options);
        const dNext = new Date(d);
        dNext.setDate(d.getDate() + (selectedDuration - 1));
        const formattedEnd = dNext.toLocaleDateString('en-US', options);
        const finalRange = `${formattedStart} – ${formattedEnd}`;
        
        handleDateChange(finalRange);
        setIsModalOpen(false);
    };

    const isDark = theme === 'dark';

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
            {label && (
                <label style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    color: isDark ? '#D5ED55' : '#121613',
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '6px'
                }}>
                    {label}
                </label>
            )}

            {/* Main Interactive Trigger Button */}
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    background: isDark ? '#121613' : '#FFFFFF',
                    border: isDark ? '1.5px solid rgba(213, 237, 85, 0.3)' : '1.5px solid rgba(18, 22, 19, 0.12)',
                    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: isDark ? 'rgba(213, 237, 85, 0.12)' : '#F4F7EB',
                        border: isDark ? '1px solid rgba(213, 237, 85, 0.3)' : '1px solid rgba(22, 101, 52, 0.2)',
                        color: isDark ? '#D5ED55' : '#166534',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <CalendarIcon size={18} strokeWidth={2.4} />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '900',
                            color: isDark ? '#FFFFFF' : '#121613',
                            lineHeight: 1.25,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {displayTitle}
                        </div>
                        <div style={{
                            fontSize: '10.5px',
                            fontWeight: '800',
                            color: isDark ? '#E5A93B' : '#166534',
                            background: isDark ? 'rgba(229, 169, 59, 0.15)' : '#E9EFE6',
                            borderRadius: '6px',
                            padding: '2px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '4px',
                            whiteSpace: 'nowrap'
                        }}>
                            <Clock size={10} strokeWidth={2.4} />
                            <span>2:00 PM In ➔ 11:00 AM Out</span>
                        </div>
                    </div>
                </div>

                <div style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    background: isDark ? 'rgba(229, 169, 59, 0.15)' : '#121613',
                    color: isDark ? '#E5A93B' : '#D5ED55',
                    fontSize: '11.5px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0
                }}>
                    <span>Change</span>
                    <ChevronRight size={12} strokeWidth={2.5} />
                </div>
            </button>

            {/* ── EXPEDITION BATCH SELECTOR POPUP MODAL (PORTAL → body) ── */}
            {typeof document !== 'undefined' && createPortal(
            <AnimatePresence>
                {isModalOpen && (
                    <div className="batch-picker-overlay">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 16 }}
                            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                            data-lenis-prevent="true"
                            data-lenis-prevent-wheel="true"
                            data-lenis-prevent-touch="true"
                            className="batch-picker-modal"
                        >
                            {/* Modal Header — Left: Title & Timings, Right: Single Back Button */}
                            <div style={{
                                padding: '16px 20px 14px',
                                borderBottom: '1px solid rgba(18, 22, 19, 0.08)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F9F5 100%)',
                                gap: '12px'
                            }}>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: 'clamp(15px, 2.5vw, 17px)', fontWeight: '900', color: '#121613', fontFamily: 'var(--font-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        Select Stay Batch or Date
                                    </h3>
                                    <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#59655D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        Check-in <strong>Sat 2:00 PM</strong> · Check-out <strong>Sun 11:00 AM</strong>
                                    </p>
                                </div>

                                {/* ONLY ONE Go Back Button */}
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    aria-label="Back to booking"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: 'rgba(18, 22, 19, 0.06)',
                                        border: '1px solid rgba(18, 22, 19, 0.12)',
                                        borderRadius: '999px',
                                        padding: '7px 15px',
                                        color: '#121613',
                                        fontSize: '12.5px',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        flexShrink: 0,
                                        marginLeft: 'auto'
                                    }}
                                >
                                    <ArrowLeft size={14} strokeWidth={2.5} />
                                    <span>Back</span>
                                </button>
                            </div>                   

                            {/* View Switcher Toolbar — Left-Aligned Tabs & Duration */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                flexWrap: 'wrap',
                                gap: '12px',
                                padding: '10px 20px',
                                background: '#F6F8F2',
                                borderBottom: '1px solid rgba(18, 22, 19, 0.06)'
                            }}>
                                {/* Switcher Tabs */}
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('batches')}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: '999px',
                                            fontSize: '11.5px',
                                            fontWeight: '800',
                                            border: 'none',
                                            cursor: 'pointer',
                                            background: activeTab === 'batches' ? '#E5A93B' : 'rgba(18, 22, 19, 0.06)',
                                            color: activeTab === 'batches' ? '#070E08' : '#59655D',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <Sparkles size={12} />
                                        <span>Weekend Batches</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('calendar')}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: '999px',
                                            fontSize: '11.5px',
                                            fontWeight: '800',
                                            border: 'none',
                                            cursor: 'pointer',
                                            background: activeTab === 'calendar' ? '#E5A93B' : 'rgba(18, 22, 19, 0.06)',
                                            color: activeTab === 'calendar' ? '#070E08' : '#59655D',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <CalendarDays size={12} />
                                        <span>Full Calendar</span>
                                    </button>
                                </div>

                                {/* Subtle Divider */}
                                <div style={{ width: '1px', height: '16px', background: 'rgba(18, 22, 19, 0.12)' }} />

                                {/* Duration Badge — Left Aligned (Fixed 2D / 1N) */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '11px', color: '#59655D', fontWeight: '700' }}>Duration:</span>
                                    <span
                                        style={{
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: '800',
                                            border: '1px solid #166534',
                                            background: 'rgba(22, 101, 52, 0.08)',
                                            color: '#166534',
                                            display: 'inline-flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        2D / 1N
                                    </span>
                                </div>
                            </div>

                            {/* Modal Body Content */}
                            <div className="batch-picker-body">
                                {activeTab === 'batches' ? (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                                        gap: '12px',
                                        width: '100%',
                                        maxWidth: '720px',
                                        margin: '0 auto',
                                        justifyContent: 'center'
                                    }}>
                                        {upcomingBatches.map((batch, idx) => {
                                            const isSelected = effectiveSelectedDate === batch.title;
                                            const meta = BATCH_DETAILS_META[idx % 6];
                                            const availablePods = meta.totalSlots - meta.bookedSlots;
                                            const IconComp = meta.icon;

                                            return (
                                                <div
                                                    key={batch.id}
                                                    onClick={() => handleSelectBatch(batch)}
                                                    onMouseEnter={() => setHoveredBatch(idx)}
                                                    onMouseLeave={() => setHoveredBatch(null)}
                                                    style={{
                                                        background: isSelected 
                                                            ? 'linear-gradient(145deg, #F4F7EB 0%, #EDF2E3 100%)' 
                                                            : '#F8F9F5',
                                                        border: isSelected 
                                                            ? '1.5px solid #166534' 
                                                            : '1px solid rgba(18, 22, 19, 0.08)',
                                                        borderRadius: '18px',
                                                        padding: '16px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '10px',
                                                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                                        position: 'relative',
                                                        boxShadow: isSelected ? '0 8px 24px rgba(22, 101, 52, 0.12)' : 'none'
                                                    }}
                                                >
                                                    {/* Top Batch Header */}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                                <span style={{
                                                                    fontSize: '10.5px',
                                                                    fontWeight: '900',
                                                                    padding: '3px 8px',
                                                                    borderRadius: '999px',
                                                                    background: 'rgba(229, 169, 59, 0.18)',
                                                                    color: '#E5A93B'
                                                                }}>
                                                                    {meta.themeTag}
                                                                </span>
                                                                <span style={{ fontSize: '10.5px', fontWeight: '800', color: batch.statusColor }}>
                                                                    • {batch.status}
                                                                </span>
                                                            </div>
                                                            <div style={{ fontSize: '15px', fontWeight: '900', color: '#121613', letterSpacing: '-0.01em' }}>
                                                                {batch.title}
                                                            </div>
                                                        </div>

                                                        <div style={{
                                                            width: '24px',
                                                            height: '24px',
                                                            borderRadius: '50%',
                                                            border: isSelected ? 'none' : '1px solid rgba(18, 22, 19, 0.2)',
                                                            background: isSelected ? '#166534' : 'transparent',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#FFFFFF',
                                                            flexShrink: 0
                                                        }}>
                                                            {isSelected && <Check size={14} strokeWidth={3} />}
                                                        </div>
                                                    </div>

                                                    {/* Check-In & Check-Out Marks */}
                                                    <div style={{
                                                        background: 'rgba(18, 22, 19, 0.04)',
                                                        borderRadius: '12px',
                                                        padding: '8px 12px',
                                                        display: 'grid',
                                                        gridTemplateColumns: '1fr 1fr',
                                                        gap: '8px',
                                                        fontSize: '11px',
                                                        border: '1px solid rgba(18, 22, 19, 0.06)'
                                                    }}>
                                                        <div>
                                                            <div style={{ color: '#B8860B', fontWeight: '800', fontSize: '9.5px', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                <MapPin size={11} /> Check-In (Sat)
                                                            </div>
                                                            <div style={{ color: '#121613', fontWeight: '700' }}>
                                                                2:00 PM Basecamp
                                                            </div>
                                                        </div>
                                                        <div style={{ borderLeft: '1px solid rgba(18, 22, 19, 0.1)', paddingLeft: '8px' }}>
                                                            <div style={{ color: '#166534', fontWeight: '800', fontSize: '9.5px', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                <Flag size={11} /> Check-Out (Sun)
                                                            </div>
                                                            <div style={{ color: '#121613', fontWeight: '700' }}>
                                                                11:00 AM Departure
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Hover Details Card (Inclusions & Live Weather Snapshot) */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11.5px', color: '#59655D' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <ThermometerSun size={13} color="#E5A93B" />
                                                            <span>{meta.weather}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <ShieldCheck size={13} color="#D5ED55" />
                                                            <span>{availablePods} of {meta.totalSlots} Alpine Ridge Pods Remaining</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    /* Full Month Interactive Calendar View */
                                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                        <CustomThemeCalendar
                                            inline={true}
                                            theme="light"
                                            selectedDate={matchedBatch?.rawDate || selectedDate}
                                            defaultDuration={selectedDuration}
                                            onDateSelect={(isoDate) => handleCalendarSelect(isoDate)}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer Summary */}
                            <div 
                                className="batch-picker-footer"
                                style={{
                                    padding: '14px 20px',
                                    borderTop: '1px solid rgba(18, 22, 19, 0.08)',
                                    background: '#F8F9F5',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                            >
                                <div style={{ fontSize: '12px', color: '#59655D', minWidth: 0, flex: 1 }}>
                                    <span style={{ display: 'block', fontSize: '10.5px', color: '#7D8880', textTransform: 'uppercase', fontWeight: '800' }}>Selected Batch</span>
                                    <div style={{ color: '#121613', fontWeight: '900', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {displayTitle} <span style={{ color: '#166534', fontWeight: '700', fontSize: '11px' }}>({selectedDuration}D/{selectedDuration - 1}N)</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn-lime"
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '12px',
                                        fontSize: '13px',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        flexShrink: 0
                                    }}
                                >
                                    <span>Confirm Batch</span>
                                    <span>✓</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>,
            document.body
            )}
        </div>
    );
}
