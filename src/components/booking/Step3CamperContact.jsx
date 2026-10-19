"use client";
import React, { useState } from 'react';
import { Minus, Plus, Check } from 'lucide-react';
import { isValidPhoneNumber } from '../../lib/whatsapp';
import { BK, stepperBtn, sectionLabel } from './bookingUI';

const DIET_OPTIONS = ['Mild spice for kids', 'Jain', 'Gluten-sensitive'];
const inputStyle = { height: '46px', padding: '0 14px', borderRadius: BK.radiusInput, border: `1.5px solid rgba(19,32,26,0.2)`, fontSize: '16px', color: BK.ink, background: '#fff', boxSizing: 'border-box', width: '100%', fontFamily: 'inherit' };
const labelStyle = { fontSize: '13px', fontWeight: 600, color: BK.ink };
const errStyle = { fontSize: '12px', color: '#c02434', fontWeight: 600 };

// Step 3 — content only. Contact + meals + dietary needs + notes.
export default function Step3CamperContact({
    customerName = '', setCustomerName = () => {},
    customerPhone = '', setCustomerPhone = () => {},
    customerEmail = '', setCustomerEmail = () => {},
    specialNotes = '', setSpecialNotes = () => {},
    dietaryChoice = 'Standard', setDietaryChoice = () => {},
    vegCount = 0, setVegCount = () => {},
    nonVegCount = 0,
    totalGuests = 2,
    honeypot = '', setHoneypot = () => {},
}) {
    const [touched, setTouched] = useState({});
    const selectedDiets = String(dietaryChoice || '').split(',').map((s) => s.trim()).filter((s) => s && s.toLowerCase() !== 'standard');
    const toggleDiet = (d) => {
        const set = new Set(selectedDiets);
        set.has(d) ? set.delete(d) : set.add(d);
        setDietaryChoice(set.size ? Array.from(set).join(', ') : 'Standard');
    };

    const nameErr = touched.name && !customerName.trim() ? 'Please enter your full name.' : '';
    const phoneErr = touched.phone && (!customerPhone.trim() || !isValidPhoneNumber(customerPhone)) ? 'Enter a valid 10-digit number.' : '';
    const emailErr = touched.email && customerEmail.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(customerEmail.trim()) ? 'Enter a valid email address.' : '';

    const vegPct = totalGuests ? (vegCount / totalGuests) * 100 : 0;
    const nonPct = 100 - vegPct;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Honeypot (hidden anti-bot field) */}
            <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }} />

            {/* Contact */}
            <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <legend style={{ ...sectionLabel, padding: 0 }}>Who should we contact?</legend>
                <p style={{ margin: '-4px 0 0', fontSize: '13px', color: BK.muted }}>We&#39;ll confirm your booking on WhatsApp. No account needed.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="gd-name" style={labelStyle}>Full name</label>
                    <input id="gd-name" type="text" autoComplete="name" required placeholder="e.g. Anand Kumar" value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                        style={{ ...inputStyle, borderColor: nameErr ? '#e0637a' : inputStyle.border }} />
                    {nameErr ? <span style={errStyle}>{nameErr}</span> : null}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="gd-phone" style={labelStyle}>WhatsApp number</label>
                        <div style={{ display: 'flex' }}>
                            <span style={{ height: '46px', boxSizing: 'border-box', padding: '0 12px', border: `1.5px solid rgba(19,32,26,0.2)`, borderRight: 0, borderRadius: `${BK.radiusInput} 0 0 ${BK.radiusInput}`, background: BK.panel, fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>+91</span>
                            <input id="gd-phone" type="tel" inputMode="numeric" autoComplete="tel-national" required placeholder="94001 23456" value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                                style={{ ...inputStyle, borderRadius: `0 ${BK.radiusInput} ${BK.radiusInput} 0`, borderColor: phoneErr ? '#e0637a' : 'rgba(19,32,26,0.2)' }} />
                        </div>
                        {phoneErr ? <span style={errStyle}>{phoneErr}</span> : null}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="gd-email" style={labelStyle}>Email <span style={{ fontWeight: 500, color: BK.muted }}>(optional)</span></label>
                        <input id="gd-email" type="email" autoComplete="email" placeholder="For your booking receipt" value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                            style={{ ...inputStyle, borderColor: emailErr ? '#e0637a' : 'rgba(19,32,26,0.2)' }} />
                        {emailErr ? <span style={errStyle}>{emailErr}</span> : null}
                    </div>
                </div>
            </fieldset>

            {/* Meals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                    <h3 style={sectionLabel}>Campfire dinner &amp; breakfast</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: BK.muted }}>Included for all {totalGuests} campers. How many want vegetarian?</p>
                </div>
                <div aria-hidden="true" style={{ display: 'flex', height: '8px', borderRadius: BK.pill, overflow: 'hidden', background: '#eceee8' }}>
                    <div style={{ width: `${vegPct}%`, background: BK.veg, transition: 'width .2s' }} />
                    <div style={{ width: `${nonPct}%`, background: BK.nonveg, transition: 'width .2s' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
                    <div style={{ padding: '12px 14px', borderRadius: BK.radiusCardSm, border: `1px solid ${BK.lineMid}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14.5px', fontWeight: 600, color: BK.ink }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: BK.veg }} />Vegetarian</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                            <button type="button" aria-label="One less vegetarian" disabled={vegCount <= 0} onClick={() => setVegCount(Math.max(0, vegCount - 1))} style={stepperBtn(vegCount <= 0)}><Minus size={15} strokeWidth={2.4} /></button>
                            <span aria-live="polite" style={{ fontFamily: BK.fontDisplay, minWidth: '16px', textAlign: 'center', fontSize: '18px', fontWeight: 800, color: BK.ink }}>{vegCount}</span>
                            <button type="button" aria-label="One more vegetarian" disabled={vegCount >= totalGuests} onClick={() => setVegCount(Math.min(totalGuests, vegCount + 1))} style={stepperBtn(vegCount >= totalGuests)}><Plus size={15} strokeWidth={2.4} /></button>
                        </div>
                    </div>
                    <div style={{ padding: '12px 14px', borderRadius: BK.radiusCardSm, border: `1px solid ${BK.lineMid}`, background: '#fbfaf6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14.5px', fontWeight: 600, color: BK.ink }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: BK.nonveg }} />Non-veg BBQ</div>
                        <span style={{ fontFamily: BK.fontDisplay, fontSize: '18px', fontWeight: 800 }}>{nonVegCount}</span>
                    </div>
                </div>

                <div style={{ marginTop: '4px', fontSize: '13px', fontWeight: 600, color: BK.ink }}>Any dietary needs? <span style={{ fontWeight: 500, color: BK.muted }}>Pick all that apply</span></div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {DIET_OPTIONS.map((d) => {
                        const on = selectedDiets.includes(d);
                        return (
                            <button key={d} type="button" aria-pressed={on} onClick={() => toggleDiet(d)}
                                style={{ minHeight: '40px', padding: '0 14px', borderRadius: BK.pill, border: on ? `1.5px solid ${BK.primary}` : `1px solid rgba(19,32,26,0.18)`, background: on ? BK.primary : '#fff', color: on ? '#fff' : BK.ink, fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                {on && <Check size={13} strokeWidth={3} />}{d}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="gd-notes" style={labelStyle}>Anything else we should know? <span style={{ fontWeight: 500, color: BK.muted }}>(optional)</span></label>
                <textarea id="gd-notes" rows={3} placeholder="e.g. Arriving by bus at Munnar around 1 PM, celebrating an anniversary" value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    style={{ padding: '12px 14px', borderRadius: BK.radiusInput, border: `1.5px solid rgba(19,32,26,0.2)`, fontSize: '16px', color: BK.ink, resize: 'vertical', lineHeight: 1.45, fontFamily: 'inherit' }} />
            </div>
        </div>
    );
}
