"use client";
import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { ADDON_GROUPS, addonType, addonCost } from '../../lib/pricing';
import { ADDONS_LIST } from './BookingConstants';
import { BK, selectedBox, stepperBtn, sectionLabel, fmtINR } from './bookingUI';

// Step 2 — content only. Grouped add-ons: flat/per-person are checkboxes, quantity are counters.
export default function Step2AddonsActivities({
    selectedAddons = [],
    toggleAddon = () => {},
    addonQuantities = {},
    setAddonQuantities = () => {},
    totalGuests = 2,
}) {
    const setQty = (id, next) => setAddonQuantities((prev) => ({ ...prev, [id]: Math.max(0, next) }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <p style={{ margin: 0, fontSize: '13.5px', color: BK.body2 }}>
                Everything here is optional — skip ahead if you like. Per-person prices are counted for your <strong style={{ color: BK.ink }}>{totalGuests} camper{totalGuests === 1 ? '' : 's'}</strong>.
            </p>

            {ADDON_GROUPS.map((group) => {
                const items = ADDONS_LIST.filter((a) => a.group === group);
                if (!items.length) return null;
                return (
                    <section key={group} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <h3 style={sectionLabel}>{group}</h3>
                        {items.map((a) => {
                            const type = addonType(a);
                            const Icon = a.icon;
                            if (type === 'quantity') {
                                const qty = addonQuantities[a.id] || 0;
                                const on = qty > 0;
                                const box = selectedBox(on);
                                const cost = addonCost(a, { quantity: qty });
                                return (
                                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', border: box.border, background: box.background, borderRadius: BK.radiusCardSm }}>
                                        <span aria-hidden="true" style={{ width: '40px', height: '40px', borderRadius: '11px', background: on ? '#fff' : BK.primarySoft, color: BK.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Icon ? <Icon size={19} strokeWidth={1.8} /> : null}</span>
                                        <div style={{ flexGrow: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '14.5px', fontWeight: 600, color: BK.ink }}>{a.name}</div>
                                            <div style={{ fontSize: '12.5px', color: BK.muted, marginTop: '2px' }}>{fmtINR(a.price)} each{on ? ` · ${fmtINR(cost)}` : ''}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                            <button type="button" aria-label={`Remove one ${a.name}`} disabled={qty <= 0} onClick={() => setQty(a.id, qty - 1)} style={stepperBtn(qty <= 0)}><Minus size={15} strokeWidth={2.4} /></button>
                                            <span style={{ fontFamily: BK.fontDisplay, minWidth: '16px', textAlign: 'center', fontSize: '17px', fontWeight: 800, color: BK.ink }}>{qty}</span>
                                            <button type="button" aria-label={`Add one ${a.name}`} onClick={() => setQty(a.id, qty + 1)} style={stepperBtn(false)}><Plus size={15} strokeWidth={2.4} /></button>
                                        </div>
                                    </div>
                                );
                            }
                            const on = selectedAddons.includes(a.id);
                            const box = selectedBox(on);
                            const cost = addonCost(a, { totalGuests });
                            const sub = type === 'per_person' ? `${fmtINR(a.price)} × ${totalGuests} people` : 'per group';
                            return (
                                <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', border: box.border, background: box.background, borderRadius: BK.radiusCardSm, cursor: 'pointer' }}>
                                    <span aria-hidden="true" style={{ width: '40px', height: '40px', borderRadius: '11px', background: on ? '#fff' : BK.primarySoft, color: BK.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Icon ? <Icon size={19} strokeWidth={1.8} /> : null}</span>
                                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '14.5px', fontWeight: 600, color: BK.ink }}>{a.name}</div>
                                        {a.desc ? <div style={{ fontSize: '12.5px', color: BK.muted, marginTop: '2px' }}>{a.desc}</div> : null}
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: BK.primary }}>+{fmtINR(cost)}</div>
                                        <div style={{ fontSize: '11.5px', color: BK.muted, marginTop: '1px' }}>{sub}</div>
                                    </div>
                                    <input type="checkbox" checked={on} onChange={() => toggleAddon(a.id)} aria-label={a.name} style={{ width: '22px', height: '22px', margin: '0 2px 0 6px', accentColor: BK.primary, flexShrink: 0, cursor: 'pointer' }} />
                                </label>
                            );
                        })}
                    </section>
                );
            })}
        </div>
    );
}
