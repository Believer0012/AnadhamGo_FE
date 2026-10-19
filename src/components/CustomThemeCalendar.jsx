"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays } from 'lucide-react';

// Dynamic Wilderness Event Batches & Calendar Annotations
export function getSpecialBatchesForMonth(year, month) {
    const batches = {};
    const daysCount = new Date(year, month + 1, 0).getDate();
    let saturdayIndex = 0;

    for (let d = 1; d <= daysCount; d++) {
        const dateObj = new Date(year, month, d);
        if (dateObj.getDay() === 6) { // Saturday
            saturdayIndex++;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            if (saturdayIndex === 1) {
                batches[dateStr] = { label: 'Full Moon Ridge Glamp', type: 'moon', badge: 'Full Moon' };
            } else if (saturdayIndex === 2) {
                batches[dateStr] = { label: 'Meteor Stargaze Camp', type: 'meteor', badge: 'Meteor Camp' };
            } else if (saturdayIndex === 3) {
                batches[dateStr] = { label: 'Acoustic Campfire & BBQ', type: 'music', badge: 'Live BBQ' };
            } else if (saturdayIndex === 4) {
                batches[dateStr] = { label: 'Summit Cloud Bed Batch', type: 'weekend', badge: 'Filling Fast' };
            } else {
                batches[dateStr] = { label: 'Canopy Rainforest Trek', type: 'trek', badge: 'Summit Trek' };
            }
        }
    }
    return batches;
}

export function getSpecialBatchForDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('-').map(Number);
    if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) return null;
    const [y, m] = parts;
    const monthBatches = getSpecialBatchesForMonth(y, m - 1);
    return monthBatches[dateStr] || null;
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CustomThemeCalendar({
    selectedDate,
    onDateSelect,
    onSelectDate,
    theme = 'light', // 'light' | 'dark' | 'gold'
    inline = false,
    label = 'SELECT EXPEDITION DATE',
    defaultDuration = 2 // Fixed 2 Days / 1 Night
}) {
    const notifyDateSelect = onDateSelect || onSelectDate || (() => {});
    const today = useMemo(() => new Date(), []);
    const initialDate = selectedDate ? new Date(selectedDate) : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
    const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
    const [isOpen, setIsOpen] = useState(inline);
    const [stagedDate, setStagedDate] = useState(selectedDate || '');
    const durationDays = 2; // Strictly 2 Days / 1 Night (no 3D)

    // Prevent background scroll when calendar modal dialog is open (if not inline)
    useEffect(() => {
        if (isOpen && !inline) {
            window.__lenis?.stop();
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                window.__lenis?.start();
                document.body.style.overflow = originalOverflow || '';
            };
        }
    }, [isOpen, inline]);

    // Update staged date when selectedDate prop changes
    useEffect(() => {
        if (selectedDate) {
            setStagedDate(selectedDate);
            const [y, m] = selectedDate.split('-').map(Number);
            if (y && m) {
                setCurrentYear(y);
                setCurrentMonth(m - 1);
            }
        }
    }, [selectedDate]);

    // Days in current month
    const daysInMonth = useMemo(() => {
        return new Date(currentYear, currentMonth + 1, 0).getDate();
    }, [currentYear, currentMonth]);

    // First day of week for current month (0: Sunday, 1: Monday, ...)
    const firstDayIndex = useMemo(() => {
        return new Date(currentYear, currentMonth, 1).getDay();
    }, [currentYear, currentMonth]);

    // Special batches for currently viewed month
    const specialBatches = useMemo(() => {
        return getSpecialBatchesForMonth(currentYear, currentMonth);
    }, [currentYear, currentMonth]);

    // Navigation limits: Cannot go before current month, max 6 months forward
    const canGoPrev = useMemo(() => {
        return !(currentYear < today.getFullYear() || (currentYear === today.getFullYear() && currentMonth <= today.getMonth()));
    }, [currentYear, currentMonth, today]);

    const canGoNext = useMemo(() => {
        const maxDate = new Date(today.getFullYear(), today.getMonth() + 6, 1);
        return !(currentYear > maxDate.getFullYear() || (currentYear === maxDate.getFullYear() && currentMonth >= maxDate.getMonth()));
    }, [currentYear, currentMonth, today]);

    const handlePrevMonth = () => {
        if (!canGoPrev) return;
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (!canGoNext) return;
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    const formatDateString = (year, month, day) => {
        const m = String(month + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${m}-${d}`;
    };

    // Calculate dates in the trip range (Day 1, Day 2, Day 3)
    const tripRangeDates = useMemo(() => {
        if (!stagedDate) return [];
        const [y, m, d] = stagedDate.split('-').map(Number);
        const result = [];
        for (let i = 0; i < durationDays; i++) {
            const temp = new Date(y, m - 1, d + i);
            result.push(formatDateString(temp.getFullYear(), temp.getMonth(), temp.getDate()));
        }
        return result;
    }, [stagedDate, durationDays]);

    const checkoutDateString = useMemo(() => {
        if (tripRangeDates.length === 0) return '';
        return tripRangeDates[tripRangeDates.length - 1];
    }, [tripRangeDates]);

    const handleDayClick = (day) => {
        const dateStr = formatDateString(currentYear, currentMonth, day);
        setStagedDate(dateStr);
    };

    // Quick Presets
    const handleSelectPreset = (daysFromToday) => {
        const target = new Date();
        target.setDate(target.getDate() + daysFromToday);
        const y = target.getFullYear();
        const m = target.getMonth();
        const d = target.getDate();
        setCurrentYear(y);
        setCurrentMonth(m);
        const dateStr = formatDateString(y, m, d);
        setStagedDate(dateStr);
    };

    const handleConfirmWindow = () => {
        if (stagedDate) {
            notifyDateSelect(stagedDate, durationDays);
            if (!inline) {
                setIsOpen(false);
            }
        }
    };

    // Format display string
    const formattedDisplayDate = useMemo(() => {
        if (!selectedDate) return 'Choose your travel date';
        const [y, m, d] = selectedDate.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const monthName = MONTH_NAMES[dateObj.getMonth()];
        const special = getSpecialBatchForDate(selectedDate);
        return `${dayName}, ${monthName} ${d}, ${y} (${durationDays}D/${durationDays - 1}N) ${special ? `· ${special.badge}` : ''}`;
    }, [selectedDate, durationDays]);

    // Staged date details for trip summary card
    const stagedDetails = useMemo(() => {
        if (!stagedDate) return null;
        const [y, m, d] = stagedDate.split('-').map(Number);
        const startObj = new Date(y, m - 1, d);
        const endObj = new Date(y, m - 1, d + (durationDays - 1));

        return {
            startFormatted: `${startObj.toLocaleDateString('en-US', { weekday: 'short' })}, ${MONTH_NAMES[startObj.getMonth()]} ${startObj.getDate()}`,
            endFormatted: `${endObj.toLocaleDateString('en-US', { weekday: 'short' })}, ${MONTH_NAMES[endObj.getMonth()]} ${endObj.getDate()}`,
            special: getSpecialBatchForDate(stagedDate)
        };
    }, [stagedDate, durationDays]);

    const isDark = theme === 'dark';
    const accentColor = '#E5A93B'; // Sunrise Amber Gold

    // Inner Calendar UI Content (reused for both inline and modal view)
    const calendarContent = (
        <div
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            onWheel={(e) => e.stopPropagation()}
            style={{
                background: isDark ? '#0B150E' : '#FFFFFF',
                borderRadius: '24px',
                padding: 'clamp(14px, 3.5vw, 22px)',
                color: isDark ? '#FFFFFF' : '#0B150E',
                width: '100%',
                maxWidth: '440px',
                margin: '0 auto',
                border: isDark ? '1.5px solid rgba(229, 169, 59, 0.4)' : '1px solid rgba(11, 21, 14, 0.12)',
                boxShadow: isDark ? '0 25px 80px rgba(0, 0, 0, 0.7), 0 0 30px rgba(229, 169, 59, 0.12)' : '0 20px 60px rgba(0, 0, 0, 0.12)',
                boxSizing: 'border-box'
            }}
        >
            {/* Modal / Card Header — Centered & Balanced */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                paddingBottom: '10px',
                borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(18, 22, 19, 0.08)'
            }}>
                {/* Previous Month Button */}
                <button
                    type="button"
                    onClick={handlePrevMonth}
                    disabled={!canGoPrev}
                    aria-label="Previous Month"
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F3EC',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: isDark ? '#FFFFFF' : '#121613',
                        cursor: canGoPrev ? 'pointer' : 'not-allowed',
                        opacity: canGoPrev ? 1 : 0.25,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                    }}
                >
                    ◀
                </button>

                {/* Centered Month / Year Title */}
                <div style={{ textAlign: 'center', flex: 1, padding: '0 8px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '1.2px', textTransform: 'uppercase', color: accentColor }}>
                        EXPEDITION BATCH SELECTOR
                    </div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: '800', margin: '2px 0 0', color: isDark ? '#FFFFFF' : '#121613' }}>
                        {MONTH_NAMES[currentMonth]} {currentYear}
                    </div>
                </div>

                {/* Right Controls: Next Month & Close */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <button
                        type="button"
                        onClick={handleNextMonth}
                        disabled={!canGoNext}
                        aria-label="Next Month"
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F3EC',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: isDark ? '#FFFFFF' : '#121613',
                            cursor: canGoNext ? 'pointer' : 'not-allowed',
                            opacity: canGoNext ? 1 : 0.25,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        ▶
                    </button>

                    {!inline && (
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close calendar"
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F3EC',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: isDark ? '#FFFFFF' : '#121613',
                                fontSize: '14px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Trip Duration Badge (Fixed 2 Days / 1 Night) — Centered & Balanced */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F5F7EF',
                padding: '6px 12px',
                borderRadius: '14px',
                marginBottom: '12px',
                flexWrap: 'wrap'
            }}>
                <span style={{ fontSize: '10.5px', fontWeight: '800', color: isDark ? '#A2B6A6' : '#59655D', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Duration:
                </span>
                <span
                    style={{
                        padding: '4px 12px',
                        borderRadius: '8px',
                        border: `1.5px solid ${accentColor}`,
                        background: isDark ? 'rgba(229, 169, 59, 0.22)' : '#FFFFFF',
                        color: isDark ? accentColor : '#121613',
                        fontSize: '11px',
                        fontWeight: '800',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    2 Days / 1 Night
                </span>
            </div>

            {/* Days of Week Header — Centered & Equal Width */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 'clamp(2px, 1vw, 4px)',
                textAlign: 'center',
                marginBottom: '6px',
                width: '100%'
            }}>
                {DAYS_OF_WEEK.map((d, idx) => (
                    <div
                        key={idx}
                        style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            color: idx === 0 || idx === 6 ? accentColor : (isDark ? '#A2B6A6' : '#8E9B92'),
                            padding: '4px 0',
                            textAlign: 'center'
                        }}
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar Day Grid — Centered & Responsive Cells */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 'clamp(2px, 1vw, 5px)',
                width: '100%',
                justifyItems: 'center',
                alignItems: 'center'
            }}>
                {/* Empty offset slots for first day */}
                {Array.from({ length: firstDayIndex }).map((_, idx) => (
                    <div key={`empty-${idx}`} style={{ width: '100%', aspectRatio: '1', minHeight: '34px' }} />
                ))}

                {/* Month Days */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const dateStr = formatDateString(currentYear, currentMonth, day);
                    const isStart = stagedDate === dateStr;
                    const isInRange = tripRangeDates.includes(dateStr);
                    const isEnd = checkoutDateString === dateStr && durationDays > 1;
                    const special = specialBatches[dateStr];
                    const isPast = new Date(currentYear, currentMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const isWeekend = new Date(currentYear, currentMonth, day).getDay() === 0 || new Date(currentYear, currentMonth, day).getDay() === 6;

                    return (
                        <button
                            key={day}
                            type="button"
                            disabled={isPast}
                            onClick={() => handleDayClick(day)}
                            style={{
                                width: '100%',
                                aspectRatio: '1',
                                minHeight: '34px',
                                maxHeight: '44px',
                                borderRadius: isStart ? '12px 4px 4px 12px' : isEnd ? '4px 12px 12px 4px' : isInRange ? '4px' : '10px',
                                border: isStart
                                    ? `2px solid ${accentColor}`
                                    : 'none',
                                background: isStart
                                    ? accentColor
                                    : isInRange
                                        ? (isDark ? 'rgba(229, 169, 59, 0.28)' : 'rgba(229, 169, 59, 0.45)')
                                        : special
                                            ? (isDark ? 'rgba(229, 169, 59, 0.14)' : 'rgba(229, 169, 59, 0.25)')
                                            : isWeekend
                                                ? (isDark ? 'rgba(255, 255, 255, 0.05)' : '#F5F7EF')
                                                : 'transparent',
                                color: isStart
                                    ? '#121613'
                                    : isInRange
                                        ? (isDark ? '#FFFFFF' : '#121613')
                                        : isPast
                                            ? (isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(18, 22, 19, 0.25)')
                                            : special
                                                ? (isDark ? accentColor : '#2A4B1A')
                                                : (isDark ? '#FFFFFF' : '#121613'),
                                fontSize: 'clamp(12px, 2.8vw, 13.5px)',
                                fontWeight: isStart || isInRange || special ? '800' : '600',
                                cursor: isPast ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                transition: 'all 0.15s ease',
                                padding: 0
                            }}
                        >
                            <span>{day}</span>
                            {special && !isInRange && (
                                <span style={{
                                    position: 'absolute',
                                    bottom: '2px',
                                    width: '4px',
                                    height: '4px',
                                    borderRadius: '50%',
                                    background: accentColor
                                }} />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Quick Presets — Centered */}
            <div style={{
                marginTop: '12px',
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '6px'
            }}>
                <button
                    type="button"
                    onClick={() => handleSelectPreset(1)}
                    style={{
                        padding: '5px 12px',
                        borderRadius: '8px',
                        background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F3EC',
                        border: 'none',
                        color: isDark ? '#FFFFFF' : '#121613',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer'
                    }}
                >
                    Tomorrow
                </button>
                <button
                    type="button"
                    onClick={() => handleSelectPreset((6 - today.getDay() + 7) % 7 || 7)}
                    style={{
                        padding: '5px 12px',
                        borderRadius: '8px',
                        background: isDark ? 'rgba(229, 169, 59, 0.18)' : 'rgba(229, 169, 59, 0.35)',
                        border: 'none',
                        color: isDark ? accentColor : '#121613',
                        fontSize: '11px',
                        fontWeight: '800',
                        cursor: 'pointer'
                    }}
                >
                    This Saturday
                </button>
                <button
                    type="button"
                    onClick={() => handleSelectPreset(14)}
                    style={{
                        padding: '5px 12px',
                        borderRadius: '8px',
                        background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F3EC',
                        border: 'none',
                        color: isDark ? '#FFFFFF' : '#121613',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer'
                    }}
                >
                    In 2 Weeks
                </button>
            </div>

            {/* Expedition Trip Window Notification & Confirmation Card */}
            {stagedDetails && (
                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        marginTop: '14px',
                        padding: '12px 14px',
                        borderRadius: '16px',
                        background: isDark ? 'rgba(229, 169, 59, 0.08)' : '#F0F4E8',
                        border: isDark ? '1px solid rgba(229, 169, 59, 0.25)' : '1px solid rgba(18, 22, 19, 0.1)',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: isDark ? accentColor : '#2A4B1A', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                            {durationDays}D / {durationDays - 1}N EXPEDITION WINDOW
                        </span>
                        {stagedDetails.special && (
                            <span style={{ fontSize: '10.5px', fontWeight: '800', color: accentColor, background: 'rgba(229, 169, 59, 0.15)', padding: '2px 8px', borderRadius: '999px' }}>
                                {stagedDetails.special.badge}
                            </span>
                        )}
                    </div>

                    <div style={{ fontSize: '13.5px', fontWeight: '800', color: isDark ? '#FFFFFF' : '#121613', marginBottom: '3px' }}>
                        {stagedDetails.startFormatted} ➔ {stagedDetails.endFormatted}
                    </div>
                    <div style={{ fontSize: '11px', color: isDark ? '#A2B6A6' : '#59655D', marginBottom: '10px', lineHeight: 1.35 }}>
                        Check-in 2:00 PM Basecamp · 4x4 Mountain Trail · Check-out 11:00 AM
                    </div>

                    <button
                        type="button"
                        onClick={handleConfirmWindow}
                        style={{
                            width: '100%',
                            padding: '11px 18px',
                            borderRadius: '999px',
                            background: accentColor,
                            color: '#121613',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span>Confirm Selected Dates (2D / 1N) →</span>
                    </button>
                </motion.div>
            )}
        </div>
    );

    return (
        <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {label && (
                <div style={{
                    width: '100%',
                    maxWidth: '440px',
                    fontSize: '11.5px',
                    fontWeight: '800',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: isDark ? accentColor : '#59655D',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <span>{label}</span>
                    {selectedDate && getSpecialBatchForDate(selectedDate) && (
                        <span style={{
                            background: isDark ? 'rgba(229, 169, 59, 0.2)' : 'rgba(229, 169, 59, 0.35)',
                            color: isDark ? accentColor : '#121613',
                            fontSize: '10px',
                            fontWeight: '800',
                            padding: '2px 8px',
                            borderRadius: '999px'
                        }}>
                            {getSpecialBatchForDate(selectedDate).badge}
                        </span>
                    )}
                </div>
            )}

            {/* Popover Trigger Button (When not inline) */}
            {!inline && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: '100%',
                        maxWidth: '440px',
                        padding: '13px 18px',
                        borderRadius: '16px',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(18, 22, 19, 0.15)',
                        background: isDark ? '#08120A' : '#F8F9F5',
                        color: isDark ? '#FFFFFF' : '#121613',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '16px', display: 'inline-flex' }}><CalendarDays size={17} /></span>
                        <span>{formattedDisplayDate}</span>
                    </div>
                    <span style={{ fontSize: '11px', opacity: 0.6 }}>
                        ▼
                    </span>
                </button>
            )}

            {/* Inline Render Mode — Centered */}
            {inline && (
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '0 auto' }}>
                    {calendarContent}
                </div>
            )}

            {/* Fixed Backdrop Modal Dialog Mode — Centered Horizontally & Vertically */}
            {!inline && (
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                zIndex: 100000,
                                background: 'rgba(0, 0, 0, 0.78)',
                                backdropFilter: 'blur(12px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '16px',
                                boxSizing: 'border-box'
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.94, y: 15 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.94, y: 15 }}
                                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                                onClick={(e) => e.stopPropagation()}
                                style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}
                            >
                                {calendarContent}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
}
