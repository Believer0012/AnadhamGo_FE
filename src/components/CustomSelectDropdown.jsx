"use client";
import React, { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import LucideAmenityIcon from './common/LucideAmenityIcon';

export default function CustomSelectDropdown({
    label,
    options = [], // [{ value, label, sublabel, badge, price, icon }]
    value,
    onChange,
    theme = 'light', // 'light' | 'dark'
    placeholder = 'Select Option',
    id,
    ariaLabel // accessible name when no visible label is rendered
}) {
    const generatedId = useId();
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const containerRef = useRef(null);
    const listRef = useRef(null);
    const selectedItemRef = useRef(null);
    const dropdownId = id || `select-${generatedId.replace(/:/g, '')}`;

    const selectedIndex = options.findIndex(opt => String(opt.value) === String(value));
    const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;
    const isDark = theme === 'dark';

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Smoothly scroll selected/focused item into view when dropdown opens
    useEffect(() => {
        if (isOpen) {
            setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
            setTimeout(() => {
                selectedItemRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }, 50);
        }
    }, [isOpen, selectedIndex]);

    const handleSelect = (val) => {
        if (onChange) onChange(val);
        setIsOpen(false);
    };

    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (focusedIndex >= 0 && focusedIndex < options.length) {
                    handleSelect(options[focusedIndex].value);
                }
                break;
            case 'Escape':
            case 'Tab':
                setIsOpen(false);
                break;
            default:
                break;
        }
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
            {label && (
                <label
                    id={`${dropdownId}-label`}
                    htmlFor={`${dropdownId}-button`}
                    style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        color: isDark ? '#D5ED55' : '#121613',
                        letterSpacing: '0.8px',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '6px'
                    }}
                >
                    {label}
                </label>
            )}

            {/* Main Trigger Button */}
            <button
                id={`${dropdownId}-button`}
                type="button"
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-labelledby={label ? `${dropdownId}-label ${dropdownId}-button` : undefined}
                aria-label={!label ? ariaLabel : undefined}
                aria-controls={`${dropdownId}-listbox`}
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    background: isDark ? 'rgba(255, 255, 255, 0.07)' : '#F8F9F5',
                    border: isOpen
                        ? (isDark ? '1.5px solid #D5ED55' : '1.5px solid #121613')
                        : (isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(18, 22, 19, 0.12)'),
                    color: isDark ? '#FFFFFF' : '#121613',
                    fontSize: '13.5px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isOpen ? '0 6px 22px rgba(0,0,0,0.08)' : 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <LucideAmenityIcon
                        name={selectedOption?.label || ''}
                        icon={selectedOption?.icon || ''}
                        size={17}
                        color={isDark ? '#D5ED55' : '#166534'}
                    />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    {selectedOption?.price !== undefined && (
                        <span style={{ fontSize: '12px', color: isDark ? '#D5ED55' : '#166534', fontWeight: '800' }}>
                            (₹{selectedOption.price.toLocaleString('en-IN')})
                        </span>
                    )}
                </div>

                <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isDark ? '#D5ED55' : '#121613',
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.25s ease',
                    flexShrink: 0
                }}>
                    <ChevronDown size={14} strokeWidth={2.5} />
                </div>
            </button>

            {/* Custom Dropdown Menu with Prevent Lenis Scroll & Wheel Propagation */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={listRef}
                        id={`${dropdownId}-listbox`}
                        role="listbox"
                        aria-labelledby={`${dropdownId}-label`}
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        data-lenis-prevent="true"
                        data-lenis-prevent-wheel="true"
                        data-lenis-prevent-touch="true"
                        onWheel={(e) => e.stopPropagation()}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            left: 0,
                            right: 0,
                            zIndex: 10000,
                            background: isDark ? '#0F1A13' : '#FFFFFF',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(18, 22, 19, 0.14)',
                            borderRadius: '16px',
                            boxShadow: '0 18px 45px rgba(0, 0, 0, 0.2)',
                            padding: '8px',
                            maxHeight: '280px',
                            overflowY: 'auto',
                            overscrollBehavior: 'contain',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {options.map((opt, idx) => {
                                const isSelected = String(opt.value) === String(value);
                                const isFocused = idx === focusedIndex;
                                return (
                                    <div
                                        key={opt.value}
                                        id={`${dropdownId}-option-${idx}`}
                                        role="option"
                                        aria-selected={isSelected}
                                        ref={isSelected ? selectedItemRef : null}
                                        onClick={() => handleSelect(opt.value)}
                                        style={{
                                            padding: '10px 12px',
                                            borderRadius: '10px',
                                            background: isSelected 
                                                ? (isDark ? 'rgba(213, 237, 85, 0.16)' : '#F1F3EC') 
                                                : (isFocused ? (isDark ? 'rgba(255,255,255,0.06)' : '#F8F9F5') : 'transparent'),
                                            border: isSelected 
                                                ? (isDark ? '1px solid #D5ED55' : '1.5px solid #121613') 
                                                : '1px solid transparent',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onMouseEnter={() => setFocusedIndex(idx)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                            <LucideAmenityIcon
                                                name={opt.label}
                                                icon={opt.icon || ''}
                                                size={16}
                                                color={isSelected ? (isDark ? '#D5ED55' : '#166534') : (isDark ? '#A2B6A6' : '#59655D')}
                                            />
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: '800', color: isDark ? '#FFFFFF' : '#121613', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {opt.label}
                                                </div>
                                                {opt.sublabel && (
                                                    <div style={{ fontSize: '11px', color: isDark ? '#A2B6A6' : '#59655D', fontWeight: '600' }}>
                                                        {opt.sublabel}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                            {opt.badge && (
                                                <span style={{ fontSize: '10px', fontWeight: '800', background: isDark ? '#121613' : '#F1F3EC', color: isDark ? '#E5A93B' : '#121613', padding: '2px 8px', borderRadius: '999px' }}>
                                                    {opt.badge}
                                                </span>
                                            )}
                                            {opt.price !== undefined && (
                                                <span style={{ fontSize: '13px', fontWeight: '800', color: isDark ? '#D5ED55' : '#121613' }}>
                                                    ₹{opt.price.toLocaleString('en-IN')}
                                                </span>
                                            )}
                                            {isSelected && (
                                                <Check size={16} strokeWidth={3} color={isDark ? '#D5ED55' : '#166534'} />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
