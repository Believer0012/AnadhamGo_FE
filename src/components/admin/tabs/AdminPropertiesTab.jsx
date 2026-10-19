"use client";
import React from 'react';
import Link from 'next/link';
import { Tent, Mountain, Plus, ChevronRight, Trees, Sparkles, MapPin } from 'lucide-react';
import { inr } from '../../../lib/utils';
import LucideAmenityIcon from '../../common/LucideAmenityIcon';
import { 
    META_LABEL_STYLE, ELLIPSIS_STYLE, MUTED_TEXT_11, ROW_SPACE_8, 
    ROW_SPACE_10, H2_STYLE, CARD_CLICKABLE, ROW_SPACE_WRAP, ROW_SPACE_14, IMG_FILL_STYLE 
} from '../AdminSharedStyles';

export default function AdminPropertiesTab({
    properties = [],
    propertyFilterRegion = 'All',
    setPropertyFilterRegion = () => {},
    openPropertyModal = () => {},
    handleOpenPropertyModal,
    setActivePropertyDetailId = () => {},
    handleAdjustPrice = () => {},
    handleToggleAvailability = () => {}
}) {
    const onOpenModal = openPropertyModal || handleOpenPropertyModal;
    const filteredProperties = Array.isArray(properties)
        ? properties.filter(p => !propertyFilterRegion || propertyFilterRegion === 'All' || p.region === propertyFilterRegion)
        : [];

    return (
        <div>
                    <div style={{ width: '100%' }}>
                        <div style={ROW_SPACE_WRAP}>
                            <div>
                                <div className="star-badge" style={{ marginBottom: '4px' }}>
                                    <span className="star-icon">★</span> LIVE OPENPMS MASTER FEED
                                </div>
                                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: '800', margin: 0, color: '#121613' }}>
                                    Regional Campsites & Glamping Pods
                                </h2>
                                <p style={{ fontSize: '12.5px', color: '#59655D', margin: '4px 0 0', fontWeight: '500' }}>
                                    Synced directly from OpenPMS operations inventory · {properties.length} Active Properties
                                </p>
                            </div>
                            <button onClick={() => onOpenModal()} className="btn-lime" style={{ padding: '10px 22px', fontSize: '13.5px', fontWeight: '800' }}>
                                + Add New Campsite
                            </button>
                        </div>

{/* Region Filter Selector */}
                        <div className="admin-region-chip-row" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }}>
                            {['All', ...Array.from(new Set(properties.map(p => p.region).filter(Boolean)))].map(reg => (
                                <button
                                    key={reg}
                                    onClick={() => setPropertyFilterRegion(reg)}
                                    style={{
                                        padding: '8px 18px',
                                        borderRadius: '999px',
                                        border: propertyFilterRegion === reg ? '1px solid #121613' : '1px solid rgba(18,22,19,0.12)',
                                        background: propertyFilterRegion === reg ? '#121613' : '#FFFFFF',
                                        color: propertyFilterRegion === reg ? '#FFFFFF' : '#59655D',
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {reg === 'All' ? 'All Kerala Regions' : reg}
                                </button>
                            ))}
                        </div>

                        {/* Properties Squared Card Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                            {filteredProperties.map(prop => (
                                <div
                                    key={prop.id}
                                    style={{
                                        background: '#FFFFFF',
                                        border: prop.isAvailable ? '1px solid rgba(18, 22, 19, 0.08)' : '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: '0 4px 18px rgba(0,0,0,0.03)'
                                    }}
                                >
                                    <div 
                                        onClick={() => setActivePropertyDetailId(prop.id)}
                                        style={{ position: 'relative', height: '190px', cursor: 'pointer' }}
                                    >
                                        <img src={prop.image} alt={prop.title} style={IMG_FILL_STYLE}  loading="lazy" decoding="async"/>
                                        <span style={{ position: 'absolute', top: '12px', left: '12px', background: prop.isAvailable ? '#121613' : '#EF4444', color: prop.isAvailable ? '#E5A93B' : '#FFFFFF', fontSize: '10.5px', fontWeight: '800', padding: '4px 10px', borderRadius: '999px' }}>
                                            {prop.isAvailable ? 'Available' : 'Sold Out'}
                                        </span>
                                        <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.65)', color: '#FFFFFF', fontSize: '10.5px', fontWeight: '700', padding: '4px 10px', borderRadius: '999px', backdropFilter: 'blur(6px)' }}>
                                            {prop.altitude}
                                        </span>
                                    </div>

                                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <div style={{ fontSize: '11px', color: '#7D8880', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
{prop.region || 'Munnar'} · {prop.location}
                                        </div>
                                        <h4 
                                            onClick={() => setActivePropertyDetailId(prop.id)}
                                            style={{ fontFamily: 'var(--font-heading)', fontSize: '17.5px', fontWeight: '800', color: '#121613', margin: '0 0 14px', lineHeight: 1.35, cursor: 'pointer' }}
                                        >
                                            {prop.title}
                                        </h4>

                                        {/* Rate & Adjust */}
                                        <div style={{ background: '#F8F9F5', border: '1px solid rgba(18, 22, 19, 0.06)', borderRadius: '14px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                            <div>
                                                <div style={{ fontSize: '10.5px', color: '#7D8880' }}>Base Rate / Camper</div>
                                                <div style={{ fontSize: '19px', fontWeight: '800', color: '#121613' }}>
                                                    ₹{prop.price.toLocaleString('en-IN')}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button onClick={() => handleAdjustPrice(prop.id, -100)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid rgba(18,22,19,0.1)', color: '#121613', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>-</button>
                                                <button onClick={() => handleAdjustPrice(prop.id, 100)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid rgba(18,22,19,0.1)', color: '#121613', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>+</button>
                                            </div>
                                        </div>

                                        {/* Manage Rooms Button */}
                                        <button
                                            onClick={() => setActivePropertyDetailId(prop.id)}
style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        background: '#121613',
                        color: '#FFFFFF',
                                                fontSize: '13px',
                                                fontWeight: '800',
                                                cursor: 'pointer',
                                                marginBottom: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                border: 'none'
                                            }}
                                        >
                                            <span>Manage Rooms & Gallery ({prop.gallery ? prop.gallery.length : 1} photos)</span>
<span><ChevronRight size={14} /></span>
                                        </button>

                                        <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                                            <Link
                                                href={`/camps/${prop.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(18,22,19,0.06)', color: '#121613', fontSize: '12px', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                                            >
 Public Page
                                            </Link>
                                            <button
                                                onClick={() => handleToggleAvailability(prop.id)}
                                                style={{ flex: 1, padding: '10px', borderRadius: '10px', background: prop.isAvailable ? 'rgba(239, 68, 68, 0.08)' : 'rgba(22, 101, 52, 0.08)', border: prop.isAvailable ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(22, 101, 52, 0.3)', color: prop.isAvailable ? '#DC2626' : '#166534', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                                            >
                                                {prop.isAvailable ? 'Mark Sold Out' : 'Mark Available'}
                                            </button>
                                            <button onClick={() => onOpenModal(prop)} style={{ padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.08)', color: '#121613', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
Edit 
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
        </div>
    );
}
