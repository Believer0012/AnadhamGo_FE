"use client";
import React from 'react';
import { ADDON_CATALOG } from '../../lib/pricing';
import { BK, sectionLabel, fmtINR } from './bookingUI';

// Step 4 — review content only. The shared summary renders the price + the two
// actions (Send on WhatsApp / Pay now).
export default function Step4PaymentGateway({
    selectedPkg = {},
    selectedRoom = {},
    travelDate = '',
    adults = 2,
    children = 0,
    totalGuests = 2,
    totalUnits = 1,
    vegCount = 0,
    nonVegCount = 0,
    customerName = '',
    customerPhone = '',
    selectedAddons = [],
    addonQuantities = {},
    totalAmount = 0,
    setStep = () => {},
}) {
    const guestLine = `${adults} ${adults === 1 ? 'adult' : 'adults'}${children ? `, ${children} ${children === 1 ? 'kid' : 'kids'}` : ''}`;
    const addonNames = [
        ...selectedAddons.map((id) => ADDON_CATALOG[id]?.name).filter(Boolean),
        ...Object.entries(addonQuantities).filter(([, q]) => q > 0).map(([id, q]) => `${ADDON_CATALOG[id]?.name || id} × ${q}`),
    ];
    const addonText = addonNames.length ? addonNames.join(', ') : 'None';

    const rows = [
        { key: 'Stay', title: `${totalUnits} × ${selectedRoom?.name || 'Ridge Glamping Tent'}`, sub: `${travelDate} · ${guestLine}`, step: 1 },
        { key: 'Add-ons', title: addonText, sub: '', step: 2 },
        { key: 'Lead camper', title: customerName || 'Your name', sub: `+91 ${customerPhone || '—'} · ${vegCount} veg, ${nonVegCount} non-veg`, step: 3 },
    ];

    const preview = `Hi! I'd like to book ${selectedPkg?.title || 'your camp'}.
Dates: ${travelDate}
Stay: ${totalUnits} × ${selectedRoom?.name || 'Ridge Glamping Tent'}, ${guestLine}
Add-ons: ${addonText}
Meals: ${vegCount} veg, ${nonVegCount} non-veg
Estimated total: ${fmtINR(totalAmount)} — ${customerName || 'Camper'}`;

    const steps = [
        { t: 'Send your enquiry on WhatsApp', s: 'We fill in the message for you — just tap send.' },
        { t: 'We confirm your spot', s: 'Our basecamp team checks availability and replies.' },
        { t: 'Pay when you arrive', s: 'Nothing to pay today — or pay now online if you prefer.' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Review list */}
            <div style={{ border: `1px solid ${BK.lineMid}`, borderRadius: BK.radiusCard, overflow: 'hidden' }}>
                {rows.map((r, i) => (
                    <div key={r.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 16px', borderBottom: i < rows.length - 1 ? `1px solid ${BK.line}` : 'none' }}>
                        <div style={{ width: '92px', flexShrink: 0, fontSize: '12.5px', fontWeight: 700, color: BK.muted, paddingTop: '2px' }}>{r.key}</div>
                        <div style={{ flexGrow: 1, minWidth: 0, fontSize: '14px', lineHeight: 1.5 }}>
                            <div style={{ fontWeight: 600, color: BK.ink }}>{r.title}</div>
                            {r.sub ? <div style={{ color: BK.body2 }}>{r.sub}</div> : null}
                        </div>
                        <button type="button" onClick={() => setStep(r.step)} style={{ fontSize: '13px', fontWeight: 700, color: BK.primary, background: 'none', border: 'none', cursor: 'pointer', minHeight: '32px' }}>Edit</button>
                    </div>
                ))}
            </div>

            {/* What happens next */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={sectionLabel}>What happens next</h3>
                <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {steps.map((s, i) => (
                        <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <span style={{ fontFamily: BK.fontDisplay, width: '28px', height: '28px', borderRadius: '50%', background: BK.primarySoft, color: BK.primary, fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                            <div style={{ fontSize: '14px', lineHeight: 1.45 }}>
                                <div style={{ fontWeight: 600, color: BK.ink }}>{s.t}</div>
                                <div style={{ color: BK.muted }}>{s.s}</div>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>

            {/* Message preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: BK.muted }}>Your message preview</div>
                <div style={{ background: '#efeae2', borderRadius: BK.radiusCard, padding: '14px' }}>
                    <div style={{ maxWidth: '440px', marginLeft: 'auto', background: '#dcf5c9', borderRadius: '12px 12px 4px 12px', padding: '10px 12px', fontSize: '13.5px', lineHeight: 1.5, color: BK.ink, whiteSpace: 'pre-line' }}>{preview}</div>
                </div>
                <div style={{ fontSize: '12px', color: BK.muted }}>You can also pay now online — online payment is optional.</div>
            </div>
        </div>
    );
}
