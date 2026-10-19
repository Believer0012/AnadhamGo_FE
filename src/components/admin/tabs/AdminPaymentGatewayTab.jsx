"use client";
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, CreditCard, MessageCircle, AlertCircle, Save, CheckCircle2, Zap } from 'lucide-react';
import { getPaymentSettings, savePaymentSettings, DEFAULT_PAYMENT_SETTINGS } from '@/lib/paymentSettings';

export default function AdminPaymentGatewayTab() {
    const [settings, setSettings] = useState(DEFAULT_PAYMENT_SETTINGS);
    const [savedToast, setSavedToast] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    useEffect(() => {
        const current = getPaymentSettings();
        setSettings(current);
    }, []);

    const isPhoneMissing = !settings.phone || !settings.phone.trim();
    const isPayeeMissing = !settings.payeeName || !settings.payeeName.trim();
    const isKeyMissing = settings.mode === 'razorpay' && (!settings.razorpayKeyId || !settings.razorpayKeyId.trim());

    const handleSave = (e) => {
        e?.preventDefault();
        setHasAttemptedSubmit(true);
        setErrorMsg(null);

        const errors = [];
        if (isPayeeMissing) errors.push('Payee Business Name is required');
        if (isPhoneMissing) errors.push('WhatsApp Concierge Phone is required');
        if (isKeyMissing) errors.push('Razorpay Key ID is required when Live Online Gateway is enabled');

        if (errors.length > 0) {
            setErrorMsg(errors.join(' · '));
            return;
        }

        savePaymentSettings(settings);
        setSavedToast(true);
        setErrorMsg(null);
        setTimeout(() => setSavedToast(false), 3000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '840px' }}>
            {/* Header */}
            <div style={{ background: '#FFFFFF', padding: '24px 28px', borderRadius: '20px', border: '1px solid rgba(18, 22, 19, 0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#D5ED55', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#121613' }}>
                        <CreditCard size={22} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#121613', margin: 0, fontFamily: 'var(--font-heading)' }}>
                            Payment Gateway & Maintenance Controls
                        </h2>
                        <p style={{ fontSize: '13px', color: '#59655D', margin: '3px 0 0 0' }}>
                            Toggle between automated Razorpay checkout and zero-advance WhatsApp concierge booking.
                        </p>
                    </div>
                </div>
            </div>

            {/* Custom Validation Error Alert Popup */}
            {errorMsg && (
                <div 
                    className="booking-error-popup-card"
                    style={{
                        background: 'linear-gradient(135deg, #FEF2F2 0%, #FFF1F2 100%)',
                        border: '2px solid #F43F5E',
                        borderRadius: '16px',
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        boxShadow: '0 8px 24px -4px rgba(225, 29, 72, 0.22)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            background: '#FFE4E6',
                            border: '1.5px solid #FDA4AF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#E11D48',
                            flexShrink: 0
                        }}>
                            <AlertCircle size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: '900', color: '#BE123C', textTransform: 'uppercase' }}>
                                Missing Required Parameters
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#881337', marginTop: '2px' }}>
                                {errorMsg}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setErrorMsg(null)}
                        style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: '1px solid #FDA4AF',
                            background: '#FFFFFF',
                            color: '#BE123C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Mode Switch Card */}
            <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: '20px', border: '1px solid rgba(18, 22, 19, 0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#121613', marginBottom: '16px' }}>
                    1. Active Payment Mode Selector
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    {/* Option 1: Coming Soon / Maintenance */}
                    <div 
                        onClick={() => { setSettings(prev => ({ ...prev, mode: 'coming_soon' })); setErrorMsg(null); }}
                        style={{
                            padding: '20px',
                            borderRadius: '16px',
                            border: settings.mode === 'coming_soon' ? '2px solid #E5A93B' : '1px solid rgba(18, 22, 19, 0.1)',
                            background: settings.mode === 'coming_soon' ? 'rgba(229, 169, 59, 0.06)' : '#FAFAF7',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', background: '#E5A93B', color: '#121613', padding: '3px 8px', borderRadius: '6px' }}>
                                Safe Mode (Zero Risk)
                            </span>
                            <input 
                                type="radio" 
                                name="paymentMode" 
                                checked={settings.mode === 'coming_soon'} 
                                onChange={() => { setSettings(prev => ({ ...prev, mode: 'coming_soon' })); setErrorMsg(null); }}
                                style={{ accentColor: '#E5A93B', width: '18px', height: '18px' }}
                            />
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: '900', color: '#121613', marginBottom: '6px' }}>
                            Launching Soon / Maintenance Mode
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#59655D', lineHeight: 1.5 }}>
                            Hides the online Razorpay checkout button. Customers reserve tents with <strong>Zero Advance directly via WhatsApp</strong>. Zero money deduction risks.
                        </div>
                    </div>

                    {/* Option 2: Live Razorpay Gateway */}
                    <div 
                        onClick={() => { setSettings(prev => ({ ...prev, mode: 'razorpay' })); setErrorMsg(null); }}
                        style={{
                            padding: '20px',
                            borderRadius: '16px',
                            border: settings.mode === 'razorpay' ? '2px solid #166534' : '1px solid rgba(18, 22, 19, 0.1)',
                            background: settings.mode === 'razorpay' ? 'rgba(22, 101, 52, 0.06)' : '#FAFAF7',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', background: '#D5ED55', color: '#121613', padding: '3px 8px', borderRadius: '6px' }}>
                                Live Online Gateway
                            </span>
                            <input 
                                type="radio" 
                                name="paymentMode" 
                                checked={settings.mode === 'razorpay'} 
                                onChange={() => { setSettings(prev => ({ ...prev, mode: 'razorpay' })); setErrorMsg(null); }}
                                style={{ accentColor: '#166534', width: '18px', height: '18px' }}
                            />
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: '900', color: '#121613', marginBottom: '6px' }}>
                            Live Razorpay Gateway Checkout
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#59655D', lineHeight: 1.5 }}>
                            Enables instant online payment for 30% advance or 100% full payment with automated voucher generation.
                        </div>
                    </div>
                </div>

                {/* Configuration Fields */}
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#121613', marginBottom: '16px' }}>
                    2. Gateway Parameters & Concierge Hotline
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: (hasAttemptedSubmit && isPayeeMissing) ? '#DC2626' : '#121613', marginBottom: '6px' }}>
                            Payee Business Name *
                        </label>
                        <input 
                            type="text" 
                            value={settings.payeeName || ''} 
                            onChange={(e) => {
                                setSettings(prev => ({ ...prev, payeeName: e.target.value }));
                                setErrorMsg(null);
                            }}
                            placeholder="Aanandham Wilderness Stays"
                            className={(hasAttemptedSubmit && isPayeeMissing) ? 'booking-modal-input is-invalid' : ''}
                            style={{
                                width: '100%',
                                padding: '11px 14px',
                                borderRadius: '10px',
                                border: (hasAttemptedSubmit && isPayeeMissing) ? '2px solid #DC2626' : '1px solid rgba(18, 22, 19, 0.15)',
                                background: (hasAttemptedSubmit && isPayeeMissing) ? '#FEF2F2' : '#FAFAF7',
                                fontSize: '13px'
                            }}
                        />
                        {hasAttemptedSubmit && isPayeeMissing && (
                            <div className="custom-field-error-pill" style={{ marginTop: '6px' }}>
                                <AlertCircle size={13} />
                                <span>Payee Business Name is required</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: (hasAttemptedSubmit && isPhoneMissing) ? '#DC2626' : '#121613', marginBottom: '6px' }}>
                            WhatsApp Concierge Phone (with country code) *
                        </label>
                        <input 
                            type="text" 
                            value={settings.phone || ''} 
                            onChange={(e) => {
                                setSettings(prev => ({ ...prev, phone: e.target.value }));
                                setErrorMsg(null);
                            }}
                            placeholder="919074858014"
                            className={(hasAttemptedSubmit && isPhoneMissing) ? 'booking-modal-input is-invalid' : ''}
                            style={{
                                width: '100%',
                                padding: '11px 14px',
                                borderRadius: '10px',
                                border: (hasAttemptedSubmit && isPhoneMissing) ? '2px solid #DC2626' : '1px solid rgba(18, 22, 19, 0.15)',
                                background: (hasAttemptedSubmit && isPhoneMissing) ? '#FEF2F2' : '#FAFAF7',
                                fontSize: '13px'
                            }}
                        />
                        {hasAttemptedSubmit && isPhoneMissing && (
                            <div className="custom-field-error-pill" style={{ marginTop: '6px' }}>
                                <AlertCircle size={13} />
                                <span>WhatsApp Concierge Phone is required</span>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: (hasAttemptedSubmit && isKeyMissing) ? '#DC2626' : '#121613', marginBottom: '6px' }}>
                        Razorpay Key ID {settings.mode === 'razorpay' ? '*' : '(Optional for Coming Soon)'}
                    </label>
                    <input 
                        type="text" 
                        value={settings.razorpayKeyId || ''} 
                        onChange={(e) => {
                            setSettings(prev => ({ ...prev, razorpayKeyId: e.target.value }));
                            setErrorMsg(null);
                        }}
                        placeholder="rzp_live_xxxxxxxx or rzp_test_xxxxxxxx"
                        className={(hasAttemptedSubmit && isKeyMissing) ? 'booking-modal-input is-invalid' : ''}
                        style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            border: (hasAttemptedSubmit && isKeyMissing) ? '2px solid #DC2626' : '1px solid rgba(18, 22, 19, 0.15)',
                            background: (hasAttemptedSubmit && isKeyMissing) ? '#FEF2F2' : '#FAFAF7',
                            fontSize: '13px'
                        }}
                    />
                    {hasAttemptedSubmit && isKeyMissing && (
                        <div className="custom-field-error-pill" style={{ marginTop: '6px' }}>
                            <AlertCircle size={13} />
                            <span>Razorpay Key ID is required when Live Online Gateway is active</span>
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button 
                        type="button" 
                        onClick={handleSave}
                        className="btn-lime"
                        style={{ padding: '12px 28px', fontSize: '14px', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderRadius: '12px' }}
                    >
                        <Save size={16} />
                        <span>Save & Apply Payment Settings</span>
                    </button>

                    {savedToast && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontSize: '13px', fontWeight: '800' }}>
                            <CheckCircle2 size={16} />
                            <span>Saved & Broadcasted to All Browsers!</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
