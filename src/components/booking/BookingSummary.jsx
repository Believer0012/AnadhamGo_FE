"use client";
import React from 'react';
import { Check } from 'lucide-react';
import { BK, fmtINR } from './bookingUI';

// Shared live booking summary. `variant="aside"` is the desktop right panel;
// `variant="bar"` is the mobile sticky bottom bar. Footer buttons come in as children.
export default function BookingSummary({
    variant = 'aside',
    rows = [],                 // [{ label, value }]
    lineItems = [],            // [{ label, amount, tone }]
    gstAmount = 0,
    gstRate = 0.12,
    included = [],             // string[]
    total = 0,
    dueNowText = '₹0 due now',
    dueNowSub = 'Pay on arrival',
    barSummary = '',           // one-line summary for the mobile bar
    children,
}) {
    if (variant === 'bar') {
        return (
            <div style={{ borderTop: `1px solid ${BK.line}`, padding: '12px 16px calc(14px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: '10px', background: BK.white, boxShadow: '0 -8px 20px -12px rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ minWidth: 0 }}>
                        <div className="disp" aria-live="polite" style={{ fontFamily: BK.fontDisplay, fontSize: '21px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, color: BK.ink }}>{fmtINR(total)}</div>
                        {barSummary ? <div style={{ fontSize: '12px', color: BK.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{barSummary}</div> : null}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: BK.primary, textAlign: 'right', flexShrink: 0 }}>{dueNowText}<br /><span style={{ color: BK.muted, fontWeight: 400 }}>{dueNowSub}</span></div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>{children}</div>
            </div>
        );
    }

    return (
        <aside aria-label="Booking summary" style={{ width: '360px', flexShrink: 0, boxSizing: 'border-box', background: BK.panel, borderLeft: `1px solid ${BK.line}`, padding: '22px 24px 20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: BK.muted }}>Your booking</div>

            {rows.length > 0 && (
                <dl style={{ margin: '14px 0 0', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                    {rows.map((r) => (
                        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                            <dt style={{ color: BK.muted }}>{r.label}</dt>
                            <dd style={{ margin: 0, fontWeight: 600, textAlign: 'right', color: BK.ink }}>{r.value}</dd>
                        </div>
                    ))}
                </dl>
            )}

            <div style={{ height: '1px', background: 'rgba(19,32,26,0.12)', margin: '16px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', overflowY: 'auto', minHeight: 0 }}>
                {lineItems.map((l, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                        <span style={{ color: l.tone === 'discount' ? BK.primary : BK.body2 }}>{l.label}</span>
                        <span style={{ fontWeight: 600, color: l.tone === 'discount' ? BK.primary : BK.ink }}>{l.amount < 0 ? `−${fmtINR(Math.abs(l.amount))}` : fmtINR(l.amount)}</span>
                    </div>
                ))}
                {gstAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '12px', color: BK.muted }}>
                        <span>Includes GST ({Math.round(gstRate * 100)}%)</span>
                        <span>{fmtINR(gstAmount)}</span>
                    </div>
                )}
            </div>

            {included.length > 0 && (
                <>
                    <div style={{ marginTop: '16px', fontSize: '12px', fontWeight: 700, color: BK.muted }}>Included for every camper</div>
                    <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: BK.body2 }}>
                        {included.map((t) => (
                            <li key={t} style={{ display: 'flex', gap: '7px', alignItems: 'flex-start' }}>
                                <Check size={13} strokeWidth={3} color={BK.primary} style={{ flexShrink: 0, marginTop: '2px' }} />
                                {t}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <div style={{ marginTop: 'auto', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: '12.5px', color: BK.muted, fontWeight: 600 }}>Total</div>
                        <div className="disp" aria-live="polite" style={{ fontFamily: BK.fontDisplay, fontSize: '30px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, color: BK.ink }}>{fmtINR(total)}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '12.5px', lineHeight: 1.35 }}>
                        <div style={{ fontWeight: 700, color: BK.primary }}>{dueNowText}</div>
                        <div style={{ color: BK.muted }}>{dueNowSub}</div>
                    </div>
                </div>
                {children}
            </div>
        </aside>
    );
}
