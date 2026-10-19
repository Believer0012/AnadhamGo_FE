"use client";
import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, Plus, Tent, Mountain, Users, ShowerHead, Trees, Sparkles, 
    Trash2, Upload, Camera, Save, RefreshCw, AlertCircle, IndianRupee, MapPin, X 
} from 'lucide-react';
import { inr } from '../../lib/utils';
import LucideAmenityIcon from '../common/LucideAmenityIcon';
import { 
    META_LABEL_STYLE, ELLIPSIS_STYLE, MUTED_TEXT_11, ROW_SPACE_8, 
    ROW_SPACE_10, H2_STYLE, FIELD_LABEL_5, CARD_CLICKABLE, MICRO_LABEL, 
    ROW_SPACE_WRAP, ROW_SPACE_14, FORM_INPUT_STYLE, FIELD_LABEL_STYLE, 
    SECTION_LABEL_STYLE, IMG_FILL_STYLE, uploadImageMedia, compressImageFile 
} from './AdminSharedStyles';

export default function PropertyDetailInspector({
    currentDetailProperty = {},
    setActivePropertyDetailId = () => {},
    openAddRoomModal = () => {},
    openEditRoomModal = () => {},
    handleDeleteRoom = () => {},
    openPropertyModal = () => {},
    handleOpenPropertyModal,
    isAddRoomModalOpen = false,
    setIsAddRoomModalOpen = () => {},
    editingRoom = null,
    setEditingRoom = () => {},
    roomForm = {},
    setRoomForm = () => {},
    handleSaveRoom = () => {},
    handleUploadPhoto,
    handleToggleAvailability = () => {},
    handleAdjustPrice = () => {},
    handleAdjustRoomUnits = () => {},
    handleToggleRoomAvailability = () => {},
    showToast = () => {}
}) {
    const onOpenPropertyModal = openPropertyModal || handleOpenPropertyModal;
    const handleOpenRoomModal = (room = null) => {
        if (room) openEditRoomModal(room);
        else openAddRoomModal();
    };

    const handleRoomImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (handleUploadPhoto) {
            try {
                const url = await handleUploadPhoto(file, 'rooms');
                if (url) setRoomForm(prev => ({ ...prev, image: url }));
                return;
            } catch (err) {
                console.error('Upload handler error:', err);
            }
        }
        try {
            const compressed = await compressImageFile(file, 800, 600, 0.85);
            setRoomForm(prev => ({ ...prev, image: compressed }));
        } catch (err) {
            console.error('Compression fallback error:', err);
        }
    };
    return (
            <div style={{ minHeight: '100vh', width: '100%', background: '#F8F9F5', color: '#121613', paddingBottom: '90px' }}>
                
                {/* Clean Sticky Header */}
                <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#FFFFFF', borderBottom: '1px solid rgba(18, 22, 19, 0.08)', padding: '16px clamp(24px, 4vw, 56px)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <button
                                onClick={() => setActivePropertyDetailId(null)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 16px',
                                    borderRadius: '999px',
                                    background: '#F1F3EC',
                                    border: '1px solid rgba(18, 22, 19, 0.12)',
                                    color: '#121613',
                                    fontSize: '13px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                }}
                            >
← Back to Campsites
                            </button>
                            <div>
                                <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block' }}>
                                    CAMPSITE INVENTORY & GALLERY
                                </span>
                                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '800', margin: 0, color: '#121613' }}>
                                    {currentDetailProperty.title}
                                </h2>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Link
                                href={`/camps/${currentDetailProperty.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '999px',
                                    background: '#F8F9F5',
                                    border: '1px solid rgba(18, 22, 19, 0.12)',
                                    color: '#121613',
                                    fontSize: '12.5px',
                                    fontWeight: '700',
                                    textDecoration: 'none'
                                }}
                            >
View Public Page →
                            </Link>
                            <button
                                onClick={() => handleToggleAvailability(currentDetailProperty.id)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '999px',
                                    background: currentDetailProperty.isAvailable ? '#DCFCE7' : 'rgba(239, 68, 68, 0.08)',
                                    border: currentDetailProperty.isAvailable ? '1px solid rgba(22, 101, 52, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                                    color: currentDetailProperty.isAvailable ? '#166534' : '#DC2626',
                                    fontSize: '12.5px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                }}
                            >
{currentDetailProperty.isAvailable ? '● Active & Bookable' : '○ Property Sold Out'}
                            </button>
                            <button
                                onClick={() => onOpenPropertyModal(currentDetailProperty)}
                                className="btn-lime"
                                style={{ padding: '8px 16px', fontSize: '12.5px', fontWeight: '800' }}
                            >
Edit Property & Gallery 
                            </button>
                        </div>
                    </div>
                </header>

                <main style={{ maxWidth: '1440px', margin: '36px auto 0', padding: '0 clamp(24px, 4vw, 56px)', boxSizing: 'border-box' }}>
                    
                    {/* Top Property Overview Hero Box */}
                    <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', minHeight: '260px', display: 'flex', alignItems: 'flex-end', padding: '36px', backgroundImage: `url(${currentDetailProperty.image})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '40px', border: '1px solid rgba(18, 22, 19, 0.1)', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14, 24, 17, 0.95) 0%, rgba(14, 24, 17, 0.4) 100%)' }} />
                        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', width: '100%' }}>
                            <div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                    <span style={{ background: '#E5A93B', color: '#121613', fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '999px' }}>
                                        {currentDetailProperty.region} Region
                                    </span>
                                    <span style={{ background: 'rgba(0,0,0,0.6)', color: '#FFFFFF', fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '999px', backdropFilter: 'blur(6px)' }}>
                                        {currentDetailProperty.altitude}
                                    </span>
                                </div>
                                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: '800', margin: '0 0 8px', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                                    {currentDetailProperty.title}
                                </h1>
                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', margin: 0, maxWidth: '680px', lineHeight: 1.55 }}>
                                    {currentDetailProperty.description}
                                </p>
                            </div>

                            <div style={{ background: 'rgba(18, 22, 19, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(229, 169, 59, 0.3)', borderRadius: '18px', padding: '18px 24px', textAlign: 'right' }}>
                                <div style={{ fontSize: '10.5px', color: '#A2B6A6', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700' }}>Base Price / Camper</div>
                                <div style={{ fontSize: '28px', fontWeight: '800', color: '#E5A93B' }}>
                                    ₹{currentDetailProperty.price.toLocaleString('en-IN')}
                                </div>
                                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => handleAdjustPrice(currentDetailProperty.id, -100)} style={{ padding: '5px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#FFFFFF', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>-₹100</button>
                                    <button onClick={() => handleAdjustPrice(currentDetailProperty.id, 100)} style={{ padding: '5px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#FFFFFF', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>+₹100</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 1: PHOTO GALLERY THUMBNAILS */}
                    <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '28px', border: '1px solid rgba(18, 22, 19, 0.08)', marginBottom: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                            <div>
                                <h3 style={H2_STYLE}>
Campsite Photo Gallery ({currentDetailProperty.gallery ? currentDetailProperty.gallery.length : 1})
                                </h3>
                                <div style={{ fontSize: '12.5px', color: '#59655D' }}>High-res wilderness, pod, and sunset photos displayed on public page</div>
                            </div>
                            <button onClick={() => onOpenPropertyModal(currentDetailProperty)} className="btn-lime" style={{ padding: '8px 16px', fontSize: '12.5px', fontWeight: '800' }}>
Manage Gallery Photos 
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '8px' }}>
                            {(currentDetailProperty.gallery || [currentDetailProperty.image]).map((img, idx) => (
                                <div key={idx} style={{ position: 'relative', width: '160px', height: '110px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0, border: img === currentDetailProperty.image ? '2px solid #E5A93B' : '1px solid rgba(18,22,19,0.1)' }}>
                                    <img src={img} alt="" style={IMG_FILL_STYLE}  loading="lazy" decoding="async"/>
                                    {img === currentDetailProperty.image && (
                                        <span style={{ position: 'absolute', top: '6px', left: '6px', background: '#121613', color: '#E5A93B', fontSize: '9.5px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
Cover
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 2: ROOMS & PODS INVENTORY */}
                    <div style={{ marginBottom: '48px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
                            <div>
                                <div className="star-badge">
<span className="star-icon">★</span> ACCOMMODATION UNITS
                                </div>
                                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: '800', margin: '4px 0 0', color: '#121613' }}>
                                    Rooms, Dome Pods & Tent Inventory ({currentDetailProperty.rooms ? currentDetailProperty.rooms.length : 0})
                                </h3>
                            </div>
                            <button
                                onClick={() => handleOpenRoomModal()}
                                className="btn-lime"
                                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
                            >
                                + Add Room Type
                            </button>
                        </div>

                        {/* Clean Squared Room Cards with Edit & Delete */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                            {currentDetailProperty.rooms && currentDetailProperty.rooms.map(room => (
                                <div
                                    key={room.id}
                                    style={{
                                        background: '#FFFFFF',
                                        border: room.isAvailable ? '1px solid rgba(18, 22, 19, 0.08)' : '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: '0 4px 18px rgba(0,0,0,0.03)'
                                    }}
                                >
                                    <div style={{ position: 'relative', height: '170px' }}>
                                        <img src={room.image || currentDetailProperty.image} alt={room.name} style={IMG_FILL_STYLE}  loading="lazy" decoding="async"/>
                                        <span style={{ position: 'absolute', top: '12px', left: '12px', background: room.isAvailable ? '#121613' : '#EF4444', color: room.isAvailable ? '#E5A93B' : '#FFFFFF', fontSize: '10.5px', fontWeight: '800', padding: '4px 10px', borderRadius: '999px' }}>
                                            {room.isAvailable ? 'Available' : 'Sold Out'}
                                        </span>
                                        <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.65)', color: '#FFFFFF', fontSize: '10.5px', fontWeight: '700', padding: '4px 10px', borderRadius: '999px', backdropFilter: 'blur(6px)' }}>
                                            Capacity: {room.capacity}
                                        </span>
                                    </div>

                                    <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: '800', margin: 0, color: '#121613' }}>
                                                {room.name}
                                            </h4>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontSize: '18px', fontWeight: '800', color: '#121613', display: 'block' }}>
                                                    ₹{room.price.toLocaleString('en-IN')}
                                                </span>
                                                <span style={{ fontSize: '10.5px', color: '#59655D', fontWeight: '600' }}>/ camper</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                                            {(Array.isArray(room.features) ? room.features : (typeof room.features === 'string' ? room.features.split(',').map(s => s.trim()).filter(Boolean) : (Array.isArray(room.amenities) ? room.amenities : []))).map((feat, idx) => (
                                                <span key={idx} style={{ background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.06)', color: '#3A443E', fontSize: '11px', fontWeight: '700', padding: '3px 9px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                    <LucideAmenityIcon name={feat} size={11} color="#166534" />
                                                    <span>{feat}</span>
                                                </span>
                                            ))}
                                        </div>

                                        {/* Unit Inventory Tracker */}
                                        <div style={{ background: '#F8F9F5', border: '1px solid rgba(18, 22, 19, 0.06)', borderRadius: '14px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                            <div>
                                                <div style={{ fontSize: '10.5px', color: '#7D8880', fontWeight: '700', textTransform: 'uppercase' }}>Inventory</div>
                                                <div style={{ fontSize: '13px', fontWeight: '800', color: '#121613' }}>
                                                    {room.bookedUnits || 0} / {room.totalUnits} Units Booked
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button onClick={() => handleAdjustRoomUnits(currentDetailProperty.id, room.id, -1)} style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid rgba(18,22,19,0.12)', color: '#121613', fontWeight: '800', cursor: 'pointer' }}>-</button>
                                                <button onClick={() => handleAdjustRoomUnits(currentDetailProperty.id, room.id, 1)} style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid rgba(18,22,19,0.12)', color: '#121613', fontWeight: '800', cursor: 'pointer' }}>+</button>
                                            </div>
                                        </div>

                                        {/* Action Buttons: Toggle, Edit, Delete */}
                                        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                                            <button
                                                onClick={() => handleToggleRoomAvailability(currentDetailProperty.id, room.id)}
                                                style={{
                                                    flex: 1,
                                                    padding: '9px',
                                                    borderRadius: '10px',
                                                    background: room.isAvailable ? 'rgba(239, 68, 68, 0.08)' : 'rgba(22, 101, 52, 0.08)',
                                                    border: room.isAvailable ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(22, 101, 52, 0.25)',
                                                    color: room.isAvailable ? '#DC2626' : '#166534',
                                                    fontSize: '11.5px',
                                                    fontWeight: '800',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {room.isAvailable ? 'Mark Sold Out' : 'Mark Available'}
                                            </button>
                                            <button
                                                onClick={() => handleOpenRoomModal(room)}
                                                style={{
                                                    padding: '9px 12px',
                                                    borderRadius: '10px',
                                                    background: '#F1F3EC',
                                                    border: '1px solid rgba(18, 22, 19, 0.1)',
                                                    color: '#121613',
                                                    fontSize: '11.5px',
                                                    fontWeight: '800',
                                                    cursor: 'pointer'
                                                }}
                                            >
Edit 
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRoom(currentDetailProperty.id, room.id)}
                                                style={{
                                                    padding: '9px 12px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(239, 68, 68, 0.08)',
                                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                                    color: '#EF4444',
                                                    fontSize: '11.5px',
                                                    fontWeight: '800',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                            <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </main>

                {/* MODAL: ADD / EDIT ROOM TYPE */}
                <AnimatePresence>
                    {isAddRoomModalOpen && (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 100010, background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                            <motion.div initial={{ scale: 0.96, y: 14 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96 }} style={{ background: '#FFFFFF', border: '1px solid rgba(18, 22, 19, 0.1)', borderRadius: '24px', padding: '32px', maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto', color: '#121613', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.18)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(18, 22, 19, 0.08)', paddingBottom: '14px' }}>
                                    <div>
                                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#E5A93B', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block' }}>
                                            ACCOMMODATION SETUP
                                        </span>
                                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '800', margin: '2px 0 0', color: '#121613' }}>
                                            {editingRoom ? 'Edit Room / Pod Details' : 'Add New Room / Pod Type'}
                                        </h3>
                                    </div>
                                    <button onClick={() => { setIsAddRoomModalOpen(false); setEditingRoom(null); }} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F8F9F5', border: 'none', color: '#121613', cursor: 'pointer', fontWeight: '800' }}>
<X size={15} strokeWidth={2.5} />
                                    </button>
                                </div>

                                <form onSubmit={handleSaveRoom} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    
                                    {/* FAST CAPACITY PRESETS */}
                                    <div style={{ background: '#F4F7EB', borderRadius: '16px', padding: '14px 16px', border: '1px solid rgba(22, 101, 52, 0.15)' }}>
                                        <div style={ROW_SPACE_8}>
                                            <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.6px', margin: 0 }}>
Fast Capacity & Tent Presets
                                            </label>
                                            <span style={{ fontSize: '10.5px', color: '#59655D', fontWeight: '700' }}>1-Click Setup</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '6px' }}>
                                            {[
                                                {
label: ' Single Tent (1P)',
                                                    name: 'Single Solo Ridge Tent',
                                                    capacity: '1 Person',
                                                    price: 1699,
                                                    totalUnits: 10,
                                                    features: 'Solo Foam Bed, Waterproof Flysheet, Thermal Sleeping Bag, Clean Washrooms',
                                                    image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=600&q=80'
                                                },
                                                {
                                                    label: '★ 2-Person Glamp',
                                                    name: 'Ridge Glamping Tent',
                                                    capacity: '2 Persons',
                                                    price: 2499,
                                                    totalUnits: 8,
                                                    features: 'Double King Bed, Valley Deck, Thermal Blankets, En-suite Restroom',
                                                    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80'
                                                },
                                                {
label: ' 3-Person Tent',
                                                    name: '3-Person Alpine Weatherproof Tent',
                                                    capacity: '3 Persons',
                                                    price: 1999,
                                                    totalUnits: 12,
                                                    features: '3 Foam Mattresses, Warm Fleece Blankets, Shared Modern Washrooms, Lantern',
                                                    image: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=600&q=80'
                                                },
                                                {
label: ' 4-Person Quad',
                                                    name: 'Weatherproof 4-Person Alpine Quad Tent',
                                                    capacity: '4 Persons',
                                                    price: 1799,
                                                    totalUnits: 14,
                                                    features: '4 Sleeping Bags, Waterproof Flysheet, Modern Hot Washrooms, Power Backup',
                                                    image: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=600&q=80'
                                                },
                                                {
                                                    label: '★ A-Frame Cabin',
                                                    name: 'Wooden A-Frame Cabin',
                                                    capacity: '2-4 Persons',
                                                    price: 3499,
                                                    totalUnits: 4,
                                                    features: 'Timber Balcony Deck, Panoramic Glass Window, Hot Shower Geyser, En-suite Restroom',
                                                    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'
                                                }
                                            ].map((preset, pIdx) => (
                                                <button
                                                    key={pIdx}
                                                    type="button"
                                                    onClick={() => {
                                                        setRoomForm({
                                                            ...roomForm,
                                                            name: preset.name,
                                                            capacity: preset.capacity,
                                                            price: preset.price,
                                                            totalUnits: preset.totalUnits,
                                                            features: preset.features,
                                                            image: roomForm.image || preset.image
                                                        });
showToast(` Applied ${preset.label} preset`);
                                                    }}
                                                    style={{
                                                        padding: '7px 6px',
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(18, 22, 19, 0.12)',
                                                        background: '#FFFFFF',
                                                        color: '#121613',
                                                        fontSize: '11px',
                                                        fontWeight: '800',
                                                        cursor: 'pointer',
                                                        textAlign: 'center',
                                                        transition: 'all 0.15s ease'
                                                    }}
                                                    onMouseOver={(e) => { e.currentTarget.style.background = '#121613'; e.currentTarget.style.color = '#D5ED55'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = '#121613'; }}
                                                >
                                                    {preset.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* PHOTO UPLOAD & URL SECTION */}
                                    <div style={{ background: '#F8F9F5', borderRadius: '16px', padding: '18px', border: '1px solid rgba(18, 22, 19, 0.08)' }}>
                                        <div style={ROW_SPACE_10}>
                                            <div>
                                                <label style={{ fontSize: '12px', fontWeight: '800', color: '#121613', display: 'block' }}>
Room / Pod Photo
                                                </label>
                                                <span style={{ fontSize: '11px', color: '#59655D' }}>Upload file from device or paste image URL</span>
                                            </div>
                                            <label style={{ cursor: 'pointer', background: '#121613', color: '#FFFFFF', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                <span><Upload size={14} /> Upload File</span>
                                                <input type="file" accept="image/*" onChange={handleRoomImageUpload} style={{ display: 'none' }} />
                                            </label>
                                        </div>

                                        {/* Image Preview */}
                                        {roomForm.image ? (
                                            <div style={{ position: 'relative', height: '140px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #E5A93B', marginBottom: '12px' }}>
                                                <img src={roomForm.image} alt="Room Preview" style={IMG_FILL_STYLE}  loading="lazy" decoding="async"/>
                                                <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#121613', color: '#E5A93B', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>
Selected Room Photo
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setRoomForm({ ...roomForm, image: '' })}
                                                    style={{ position: 'absolute', top: '8px', right: '8px', background: '#EF4444', color: '#FFFFFF', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                                                >
Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '90px', borderRadius: '12px', border: '2px dashed rgba(18,22,19,0.18)', background: '#FFFFFF', cursor: 'pointer', marginBottom: '12px' }}>
                                                    <span style={{ fontSize: '20px', marginBottom: '4px' }}><Camera size={20} /></span>
                                                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#121613' }}>Click to select photo from device</span>
                                                    <input type="file" accept="image/*" onChange={handleRoomImageUpload} style={{ display: 'none' }} />
                                                </label>
                                                <div>
                                                    <input
                                                        type="url"
                                                        placeholder="Or paste direct image URL (https://...)"
                                                        value={roomForm.image}
                                                        onChange={e => setRoomForm({ ...roomForm, image: e.target.value })}
                                                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid rgba(18, 22, 19, 0.12)', fontSize: '12.5px', color: '#121613', boxSizing: 'border-box' }}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div>
                                        <label style={FIELD_LABEL_5}>
                                            Accommodation Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Single Solo Ridge Tent / Geodesic Dome"
                                            value={roomForm.name}
                                            onChange={e => setRoomForm({ ...roomForm, name: e.target.value })}
                                            style={FORM_INPUT_STYLE}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={FIELD_LABEL_5}>
                                                Guest Capacity *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. 1 Person, 2 Persons, 4 Persons"
                                                value={roomForm.capacity}
                                                onChange={e => setRoomForm({ ...roomForm, capacity: e.target.value })}
                                                style={FORM_INPUT_STYLE}
                                            />
                                        </div>
                                        <div>
                                            <label style={FIELD_LABEL_5}>
                                                Price Per Camper / Person (INR) *
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                value={roomForm.price}
                                                onChange={e => setRoomForm({ ...roomForm, price: e.target.value })}
                                                style={FORM_INPUT_STYLE}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={FIELD_LABEL_5}>
                                            Total Units Available in Campsite *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={roomForm.totalUnits}
                                            onChange={e => setRoomForm({ ...roomForm, totalUnits: e.target.value })}
                                            style={FORM_INPUT_STYLE}
                                        />
                                    </div>

                                    <div>
                                        <label style={FIELD_LABEL_5}>
                                            Features & Amenities (Comma Separated)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Panoramic Mountain View, Ensuite Washroom, Hot Water, Fleece Blankets"
                                            value={roomForm.features}
                                            onChange={e => setRoomForm({ ...roomForm, features: e.target.value })}
                                            style={FORM_INPUT_STYLE}
                                        />
                                    </div>

                                    <button type="submit" className="btn-lime" style={{ padding: '14px', fontSize: '14.5px', fontWeight: '800', marginTop: '6px', cursor: 'pointer' }}>
                                        {editingRoom ? 'Save Room Type Changes' : '+ Publish Room Type'}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
    );
}
