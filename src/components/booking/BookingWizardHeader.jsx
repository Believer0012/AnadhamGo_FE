"use client";
import React from 'react';
import { Check, X, Tent, AlertCircle } from 'lucide-react';
import { BK } from './bookingUI';

// Redesigned wizard header: property line + altitude badge, a clickable 4-step
// progress bar (completed steps show a check), and the shared error banner.
// Backward compatible with the modal's props; camp info is optional with fallbacks.
export default function BookingWizardHeader({
    step,
    setStep,
    confirmedPass,
    validationError,
    setValidationError = () => {},
    campTitle = 'Your wilderness stay',
    campLocation = '',
    altitude = '',
    campImage = '',
    onClose,
}) {
    const steps = [
        { num: 1, label: 'Stay & dates' },
        { num: 2, label: 'Add-ons' },
        { num: 3, label: 'Guest details' },
        { num: 4, label: 'Confirm' },
    ];
    const titles = { 1: 'Book your stay', 2: 'Add to your trip', 3: 'Your details', 4: 'Review & send', 5: 'Boarding pass issued' };

    return (
        <div
            className="booking-modal-header"
            style={{
                padding: '18px 24px 14px',
                borderBottom: `1px solid ${BK.line}`,
                background: BK.white,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxSizing: 'border-box',
            }}
        >
            {/* Row 1: thumbnail + title + property line + close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                    aria-hidden="true"
                    style={{
                        width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                        background: campImage ? `center/cover no-repeat url(${campImage})` : '#3d6b48',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.85)',
                    }}
                >
                    {campImage ? null : <Tent size={22} strokeWidth={1.8} />}
                </div>
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <h2 id="booking-modal-title" style={{ margin: 0, fontFamily: BK.fontDisplay, fontSize: 'clamp(18px, 2.5vw, 22px)', fontWeight: 800, letterSpacing: '-0.02em', color: BK.ink }}>
                        {step === 5 ? titles[5] : titles[step]}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', fontSize: '13px', color: BK.muted, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: BK.ink, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '340px' }}>{campTitle}</span>
                        {campLocation ? (<><span aria-hidden="true">·</span><span>{campLocation}</span></>) : null}
                        {altitude ? (
                            <span style={{ background: BK.ink, color: BK.lime, fontSize: '10.5px', fontWeight: 700, padding: '2px 7px', borderRadius: '6px', letterSpacing: '0.3px' }}>{altitude}</span>
                        ) : null}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    aria-label="Close booking"
                    className="modal-close-btn-light"
                    style={{ width: BK.tap, height: BK.tap, minWidth: BK.tap, borderRadius: '50%', border: `1px solid ${BK.lineMid}`, background: BK.white, color: BK.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                >
                    <X size={18} strokeWidth={2} />
                </button>
            </div>

            {/* Row 2: progress bar */}
            {step < 5 && (
                <ol aria-label="Booking steps" style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '8px' }}>
                    {steps.map((s) => {
                        const isActive = step === s.num;
                        const isDone = step > s.num;
                        const clickable = isDone;
                        return (
                            <li key={s.num} aria-current={isActive ? 'step' : undefined} style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                                <div style={{ height: '4px', borderRadius: BK.pill, background: (isDone || isActive) ? BK.primary : 'rgba(19,32,26,0.1)' }} />
                                <button
                                    type="button"
                                    disabled={!clickable}
                                    onClick={() => clickable && setStep(s.num)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '7px', padding: 0, border: 'none', background: 'none',
                                        font: 'inherit', textAlign: 'left', cursor: clickable ? 'pointer' : 'default',
                                        fontSize: '12.5px', fontWeight: isActive ? 700 : 600,
                                        color: (isActive || isDone) ? BK.primary : BK.muted,
                                    }}
                                >
                                    <span style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10.5px', boxSizing: 'border-box',
                                        background: isActive ? BK.primary : isDone ? '#dcebdd' : 'transparent',
                                        color: isActive ? '#fff' : BK.primary,
                                        border: (isActive || isDone) ? 'none' : `1.5px solid #8a958d` }}>
                                        {isDone ? <Check size={11} strokeWidth={3.5} /> : s.num}
                                    </span>
                                    <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ol>
            )}

            {/* Error banner (shared) */}
            {validationError && step !== 5 && (
                <div role="alert" style={{ background: 'linear-gradient(135deg, #FEF2F2 0%, #FFF1F2 100%)', border: '1.5px solid #F43F5E', borderRadius: BK.radiusCard, padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <AlertCircle size={18} strokeWidth={2.4} color="#E11D48" style={{ flexShrink: 0 }} />
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#881337', lineHeight: 1.35 }}>{validationError}</div>
                    </div>
                    <button type="button" onClick={() => setValidationError('')} aria-label="Dismiss error" style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid #FDA4AF', background: '#fff', color: '#BE123C', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                        <X size={13} strokeWidth={2.4} />
                    </button>
                </div>
            )}
        </div>
    );
}
