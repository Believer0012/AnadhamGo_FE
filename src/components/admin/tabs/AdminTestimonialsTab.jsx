"use client";
import React from 'react';
import { MessageSquareQuote, Plus, Save, Trash2, Heart, RefreshCw, Dices, AlertCircle, Upload, Camera } from 'lucide-react';
import { 
    META_LABEL_STYLE, ELLIPSIS_STYLE, MUTED_TEXT_11, ROW_SPACE_8, 
    ROW_SPACE_10, H2_STYLE, ROW_SPACE_WRAP, ROW_SPACE_14, FORM_INPUT_STYLE, FIELD_LABEL_STYLE,
    IMG_FILL_STYLE, compressImageFile, uploadImageMedia
} from '../AdminSharedStyles';

const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80'
];

export default function AdminTestimonialsTab({
    testimonials = [],
    setTestimonials,
    handleSaveTestimonials,
    testimonialsSaving = false,
    handleResetDefaultTestimonials,
    handleQuickAddRandomTestimonial
}) {
    const handleAddTestimonial = () => {
        const newT = {
            id: `testi_${Date.now()}`,
            name: 'New Camper Guest',
            role: 'Solo Trekker · Bengaluru',
            quote: 'An unforgettable sunrise experience above the cloud beds of Kolukkumalai. The staff hospitality was top-notch.',
            rating: 5,
            campsite: 'Kolukkumalai Sunrise Glamping',
            avatar: AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)],
            active: true
        };
        setTestimonials(prev => [newT, ...(prev || [])]);
    };

    const handleUpdateTestimonial = (id, updates) => {
        setTestimonials(prev => (prev || []).map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const handleRemoveTestimonial = (id) => {
        setTestimonials(prev => (prev || []).filter(t => t.id !== id));
    };

    const handleAvatarUpload = async (id, e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const mediaUrl = await uploadImageMedia(file, 'testimonials/avatars');
            handleUpdateTestimonial(id, { avatar: mediaUrl });
        } catch (err) {
            console.error('Avatar media upload failed, using optimized local fallback:', err);
            try {
                const compressed = await compressImageFile(file, 240, 240, 0.85);
                handleUpdateTestimonial(id, { avatar: compressed });
            } catch (cErr) {
                console.error('Fallback compression failed:', cErr);
            }
        }
    };

    return (
        <div style={{ width: '100%' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <div className="star-badge" style={{ marginBottom: '3px' }}>
                        <span className="star-icon">★</span> SOCIAL PROOF & REVIEWS
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: '800', margin: '0 0 4px', color: '#121613' }}>
                        Guest Testimonials & Reviews
                    </h2>
                    <p style={{ fontSize: '12.5px', color: '#59655D', margin: 0 }}>
                        Curate verified reviews displayed on the public website and campsite landing pages.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleAddTestimonial}
                        className="btn-secondary"
                        style={{ padding: '9px 16px', fontSize: '12.5px', fontWeight: '800', border: '1px solid rgba(18,22,19,0.15)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFFFFF', borderRadius: '10px' }}
                    >
                        <Plus size={14} />
                        <span>Add Review</span>
                    </button>
                    {handleQuickAddRandomTestimonial && (
                        <button
                            onClick={handleQuickAddRandomTestimonial}
                            className="btn-secondary"
                            style={{ padding: '9px 16px', fontSize: '12.5px', fontWeight: '800', border: '1px solid rgba(18,22,19,0.15)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFFFFF', borderRadius: '10px' }}
                        >
                            <Dices size={14} />
                            <span>Quick Random</span>
                        </button>
                    )}
                    {handleResetDefaultTestimonials && (
                        <button
                            onClick={handleResetDefaultTestimonials}
                            className="btn-secondary"
                            style={{ padding: '9px 16px', fontSize: '12.5px', fontWeight: '800', border: '1px solid rgba(18,22,19,0.15)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFFFFF', borderRadius: '10px', color: '#B45309' }}
                        >
                            <RefreshCw size={14} />
                            <span>Reset Defaults</span>
                        </button>
                    )}
                    <button
                        onClick={handleSaveTestimonials}
                        disabled={testimonialsSaving}
                        className="btn-lime"
                        style={{ padding: '9px 20px', fontSize: '12.5px', fontWeight: '800', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: testimonialsSaving ? 0.6 : 1 }}
                    >
                        <Save size={14} />
                        <span>{testimonialsSaving ? 'Saving...' : 'Save Reviews'}</span>
                    </button>
                </div>
            </div>

            {/* Testimonials List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                {(testimonials || []).map((t) => (
                    <div
                        key={t.id}
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '16px',
                            border: t.active ? '1.5px solid rgba(22, 101, 52, 0.25)' : '1px solid rgba(18, 22, 19, 0.08)',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#F1F3EC', border: '1px solid rgba(18,22,19,0.1)', flexShrink: 0 }}>
                                    <img src={t.avatar || AVATAR_PRESETS[0]} alt={t.name} style={IMG_FILL_STYLE} loading="lazy" decoding="async" />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={t.author || t.name || ''}
                                        onChange={(e) => handleUpdateTestimonial(t.id, { author: e.target.value, name: e.target.value })}
                                        placeholder="Guest Camper Name"
                                        style={{ fontWeight: '800', fontSize: '13.5px', color: '#121613', border: 'none', background: 'transparent', padding: 0, outline: 'none', width: '100%' }}
                                    />
                                    <input
                                        type="text"
                                        value={t.batchDate || t.role || ''}
                                        onChange={(e) => handleUpdateTestimonial(t.id, { batchDate: e.target.value, role: e.target.value })}
                                        placeholder="Batch / Season Date"
                                        style={{ fontSize: '11px', color: '#59655D', border: 'none', background: 'transparent', padding: 0, outline: 'none', width: '100%' }}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => handleRemoveTestimonial(t.id)}
                                title="Remove testimonial"
                                style={{ background: '#FEE2E2', border: 'none', color: '#DC2626', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>

                        <div>
                            <textarea
                                rows={3}
                                value={t.quote || ''}
                                onChange={(e) => handleUpdateTestimonial(t.id, { quote: e.target.value })}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18, 22, 19, 0.1)', color: '#121613', fontSize: '12.5px', lineHeight: 1.5, resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
                            />
                        </div>

                        {/* Avatar Picker / Upload */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                <label style={{ cursor: 'pointer', padding: '4px 10px', borderRadius: '6px', background: '#F1F3EC', fontSize: '11px', fontWeight: '800', color: '#121613', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Upload size={12} />
                                    <span>Upload Photo</span>
                                    <input type="file" accept="image/*" onChange={(e) => handleAvatarUpload(t.id, e)} style={{ display: 'none' }} />
                                </label>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {AVATAR_PRESETS.map((u, pIdx) => (
                                        <button
                                            key={pIdx}
                                            type="button"
                                            onClick={() => handleUpdateTestimonial(t.id, { avatar: u })}
                                            style={{ width: '26px', height: '26px', borderRadius: '50%', overflow: 'hidden', padding: 0, border: t.avatar === u ? '2px solid #166534' : '2px solid transparent', cursor: 'pointer' }}
                                        >
                                            <img src={u} alt="" style={IMG_FILL_STYLE} loading="lazy" decoding="async" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(18,22,19,0.08)', paddingTop: '10px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: t.active ? '#166534' : '#7D8880', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={!!t.active}
                                    onChange={(e) => handleUpdateTestimonial(t.id, { active: e.target.checked })}
                                    style={{ width: '16px', height: '16px', accentColor: '#166534', cursor: 'pointer' }}
                                />
                                Publish on Website
                            </label>
                            <span style={{ fontSize: '11px', color: '#8A938B', fontWeight: '700' }}>★ {t.rating || 5}.0</span>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ background: '#121613', borderRadius: '20px', padding: '24px 28px', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '20px' }}>
                <div>
                    <div style={{ fontSize: '11px', color: '#E5A93B', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {(testimonials || []).filter(t => t.active).length} TESTIMONIAL{(testimonials || []).filter(t => t.active).length === 1 ? '' : 'S'} PUBLISHED
                    </div>
                    <div style={{ fontSize: '13.5px', color: '#A2B6A6', marginTop: '2px' }}>
                        Changes take effect immediately on the homepage testimonials carousel.
                    </div>
                </div>
                <button
                    onClick={handleSaveTestimonials}
                    disabled={testimonialsSaving}
                    className="btn-lime"
                    style={{ padding: '13px 32px', fontSize: '14px', fontWeight: '900', border: 'none', cursor: 'pointer', opacity: testimonialsSaving ? 0.6 : 1 }}
                >
                    {testimonialsSaving ? 'Saving...' : 'Save Reviews'}
                </button>
            </div>
        </div>
    );
}
