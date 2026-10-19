"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, X, ArrowDownRight, CheckCircle2 } from 'lucide-react';

/**
 * Custom High-Impact Error Pop-Up / Alert Banner for Booking Engine
 * Displays live validation errors, lists unfilled fields with red tags,
 * and allows 1-click focus to resolve.
 */
export default function BookingValidationPopup({
    errors = [],
    title = "Please complete the required details",
    onClose,
    onFocusField
}) {
    if (!errors || errors.length === 0) return null;

    // Normalize errors into array of objects { field, label, message }
    const errorList = errors.map((err, idx) => {
        if (typeof err === 'string') {
            return { id: `err-${idx}`, label: err, message: err };
        }
        return { id: err.field || `err-${idx}`, ...err };
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="booking-error-popup-card"
            style={{
                background: 'linear-gradient(135deg, #FEF2F2 0%, #FFF1F2 100%)',
                border: '2px solid #F43F5E',
                borderRadius: '18px',
                padding: '16px 20px',
                marginBottom: '18px',
                boxShadow: '0 12px 32px -8px rgba(225, 29, 72, 0.28), 0 0 0 1px rgba(244, 63, 94, 0.15)',
                position: 'relative',
                zIndex: 20
            }}
            role="alert"
            aria-live="assertive"
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: '#FFE4E6',
                        border: '1.5px solid #FDA4AF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#E11D48',
                        flexShrink: 0,
                        marginTop: '1px'
                    }}>
                        <AlertTriangle size={20} strokeWidth={2.5} />
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                            <span style={{
                                background: '#E11D48',
                                color: '#FFFFFF',
                                fontSize: '10px',
                                fontWeight: '900',
                                padding: '2px 8px',
                                borderRadius: '999px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.6px'
                            }}>
                                Required Fields Missing
                            </span>
                            <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#9F1239' }}>
                                {title}
                            </span>
                        </div>

                        <p style={{ fontSize: '12px', color: '#881337', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                            You cannot proceed until the highlighted details in red below are provided:
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {errorList.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => onFocusField && item.field && onFocusField(item.field)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background: '#FFFFFF',
                                        padding: '6px 12px',
                                        borderRadius: '10px',
                                        border: '1px solid #FECDD3',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        color: '#BE123C',
                                        cursor: onFocusField && item.field ? 'pointer' : 'default',
                                        transition: 'all 0.15s ease',
                                        width: 'fit-content',
                                        maxWidth: '100%'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (onFocusField && item.field) {
                                            e.currentTarget.style.background = '#FFF1F2';
                                            e.currentTarget.style.borderColor = '#F43F5E';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (onFocusField && item.field) {
                                            e.currentTarget.style.background = '#FFFFFF';
                                            e.currentTarget.style.borderColor = '#FECDD3';
                                        }
                                    }}
                                >
                                    <span style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: '#E11D48',
                                        display: 'inline-block',
                                        flexShrink: 0
                                    }} />
                                    <span>{item.message || item.label}</span>
                                    {onFocusField && item.field && (
                                        <span style={{
                                            fontSize: '10px',
                                            fontWeight: '800',
                                            color: '#E11D48',
                                            background: '#FFE4E6',
                                            padding: '1px 6px',
                                            borderRadius: '6px',
                                            marginLeft: '4px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '2px'
                                        }}>
                                            Fill now <ArrowDownRight size={10} />
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Dismiss error notice"
                        style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            border: '1px solid #FDA4AF',
                            background: '#FFFFFF',
                            color: '#BE123C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            padding: 0,
                            transition: 'all 0.15s ease'
                        }}
                    >
                        <X size={15} />
                    </button>
                )}
            </div>
        </motion.div>
    );
}
