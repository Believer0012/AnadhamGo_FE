"use client";
import React, { useMemo } from 'react';
import { Check, Users, Tent, Minus, Plus, Triangle } from 'lucide-react';
import { generateUpcomingWeekendBatches } from '../../lib/utils';
import CustomDateBatchPicker from '../CustomDateBatchPicker';
import { BK, selectedBox, stepperBtn, sectionLabel, fmtINR } from './bookingUI';

const MAX_CAMPERS = 12;

// Step 1 — content only. The shell renders the summary + primary CTA.
export default function Step1CampsiteLodging({
    selectedPkg = {},
    selectedRoomId,
    setSelectedRoomId = () => {},
    travelDate,
    setTravelDate = () => {},
    adults = 2,
    setAdults = () => {},
    children = 0,
    setChildren = () => {},
    totalGuests = 2,
    selectedRoom = {},
    totalUnits = 1,
    roomCapacity = 2,
}) {
    const rooms = useMemo(() => {
        const list = (selectedPkg?.rooms && selectedPkg.rooms.length > 0) ? selectedPkg.rooms : [];
        if (list.length) return list;
        return [{ id: selectedRoom?.id || 'standard-tent', name: selectedRoom?.name || 'Standard Alpine Ridge Tent', price: selectedRoom?.price || selectedPkg?.price || 2499, capacity: selectedRoom?.capacity || '2 Adults', image: selectedPkg?.image }];
    }, [selectedPkg, selectedRoom]);

    const batches = useMemo(() => generateUpcomingWeekendBatches(5), []);
    const roomPrice = Number(selectedRoom?.price || selectedRoom?.pricePerPerson || selectedPkg?.price || 2499);
    const kidPrice = Math.round(roomPrice * 0.5);
    const atMax = totalGuests >= MAX_CAMPERS;
    const spare = Math.max(0, totalUnits * roomCapacity - totalGuests);
    const unitName = selectedRoom?.name || 'Tent';

    const capLabel = (r) => {
        const m = String(r.capacity || '').match(/\d+/);
        const n = m ? m[0] : '2';
        return `Sleeps ${n}`;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>

            {/* Lodging */}
            <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                <legend style={{ ...sectionLabel, padding: 0, marginBottom: '12px' }}>Where you&#39;ll sleep</legend>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 165px), 1fr))', gap: '12px' }}>
                    {rooms.map((r) => {
                        const on = String(r.id) === String(selectedRoomId) || (rooms.length === 1);
                        const box = selectedBox(on);
                        const img = r.image || selectedPkg?.image;
                        return (
                            <label key={r.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', border: box.border, background: box.background, borderRadius: BK.radiusCard, overflow: 'hidden', cursor: 'pointer' }}>
                                <input type="radio" name="lodging" checked={on} onChange={() => setSelectedRoomId(r.id)} style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} />
                                <div aria-hidden="true" style={{ height: '84px', position: 'relative', background: img ? `center/cover no-repeat url(${img})` : 'linear-gradient(135deg,#4d7a58,#1f3a26)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)' }}>
                                    {!img && <Tent size={28} strokeWidth={1.6} />}
                                    <span style={{ position: 'absolute', top: '8px', right: '8px', width: '24px', height: '24px', borderRadius: '50%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: on ? BK.primary : 'rgba(255,255,255,0.9)', border: on ? '2px solid #fff' : '1.5px solid rgba(19,32,26,0.25)' }}>
                                        {on && <Check size={14} strokeWidth={3} />}
                                    </span>
                                </div>
                                <div style={{ padding: '11px 12px 13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontFamily: BK.fontDisplay, fontSize: '14.5px', fontWeight: 700, lineHeight: 1.2, color: BK.ink }}>{r.name}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: BK.muted }}>
                                        <Users size={13} /> {capLabel(r)}
                                    </span>
                                    <span style={{ marginTop: '4px', fontSize: '12.5px', color: BK.muted }}>
                                        <strong style={{ fontFamily: BK.fontDisplay, fontSize: '17px', color: BK.ink }}>{fmtINR(r.price || r.pricePerPerson || selectedPkg?.price || 2499)}</strong> / person
                                    </span>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </fieldset>

            {/* Dates */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={sectionLabel}>Pick a weekend</h3>
                    <span style={{ fontSize: '12.5px', color: BK.muted }}>Check-in 2:00 PM · Check-out 11:00 AM</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))', gap: '8px' }}>
                    {batches.map((b) => {
                        const on = travelDate === b.title || travelDate === b.rawDate;
                        const d = b.rawDate ? new Date(`${b.rawDate}T00:00:00`) : null;
                        const shortLabel = d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : b.title;
                        return (
                            <button key={b.id} type="button" aria-pressed={on} onClick={() => setTravelDate(b.title)}
                                style={{ minHeight: '74px', padding: '9px 6px', borderRadius: BK.radiusCardSm, border: on ? `2px solid ${BK.primary}` : `1px solid ${BK.lineStrong}`, background: on ? BK.primary : BK.white, color: on ? '#fff' : BK.ink, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
                                <span style={{ fontSize: '11.5px', fontWeight: 600 }}>Sat</span>
                                <span style={{ fontFamily: BK.fontDisplay, fontSize: '16px', fontWeight: 800, lineHeight: 1.1 }}>{shortLabel}</span>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: on ? BK.lime : BK.primary }}>Open</span>
                            </button>
                        );
                    })}
                </div>
                <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: BK.muted, marginBottom: '6px' }}>More dates &amp; full calendar</div>
                    <CustomDateBatchPicker value={travelDate} onDateChange={setTravelDate} label={null} theme="light" />
                </div>
            </div>

            {/* Campers */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ ...sectionLabel, marginBottom: '6px' }}>Who&#39;s coming</h3>

                <CounterRow label="Adults" sub={`Ages 12+ · ${fmtINR(roomPrice)} each`}
                    value={adults} onDec={() => adults > 1 && setAdults(adults - 1)} onInc={() => !atMax && setAdults(adults + 1)}
                    decOff={adults <= 1} incOff={atMax} />
                <CounterRow label="Kids" sub={`Ages 5–11 · ${fmtINR(kidPrice)} each`}
                    value={children} onDec={() => children > 0 && setChildren(children - 1)} onInc={() => !atMax && setChildren(children + 1)}
                    decOff={children <= 0} incOff={atMax} />

                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: BK.radiusCardSm, background: BK.primarySoft }}>
                    <span aria-hidden="true" style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#fff', color: BK.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Triangle size={18} strokeWidth={1.9} />
                    </span>
                    <div aria-live="polite" style={{ fontSize: '13px', lineHeight: 1.4 }}>
                        <div style={{ fontWeight: 700, color: BK.ink }}>{totalUnits} × {unitName}{totalUnits > 1 ? 's' : ''} for {totalGuests} camper{totalGuests === 1 ? '' : 's'}</div>
                        <div style={{ color: BK.body2 }}>{spare === 0 ? 'A perfect fit — every spot is used.' : `Room for ${spare} more at no extra cost.`}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CounterRow({ label, sub, value, onDec, onInc, decOff, incOff }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${BK.line}`, gap: '12px' }}>
            <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: BK.ink }}>{label}</div>
                <div style={{ fontSize: '12.5px', color: BK.muted, marginTop: '2px' }}>{sub}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                <button type="button" aria-label={`Remove a ${label.toLowerCase().replace(/s$/, '')}`} disabled={decOff} onClick={onDec} style={stepperBtn(decOff)}><Minus size={16} strokeWidth={2.4} /></button>
                <span aria-live="polite" style={{ fontFamily: BK.fontDisplay, minWidth: '22px', textAlign: 'center', fontSize: '19px', fontWeight: 800, color: BK.ink }}>{value}</span>
                <button type="button" aria-label={`Add a ${label.toLowerCase().replace(/s$/, '')}`} disabled={incOff} onClick={onInc} style={stepperBtn(incOff)}><Plus size={16} strokeWidth={2.4} /></button>
            </div>
        </div>
    );
}
