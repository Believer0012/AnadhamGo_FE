"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, Trash2, Plus, Sparkles, MapPin, Mountain } from 'lucide-react';
import { 
    FORM_INPUT_STYLE, FIELD_LABEL_STYLE, H2_STYLE, COL_GAP_14, 
    SECTION_LABEL_STYLE, IMG_FILL_STYLE, ROW_SPACE_10, compressImageFile, uploadImageMedia
} from '../AdminSharedStyles';

export default function PropertyEditModal({
    isPropertyModalOpen,
    setIsPropertyModalOpen,
    editingProperty,
    propertyForm,
    setPropertyForm,
    imageUrlInput,
    setImageUrlInput,
    handleSaveProperty,
    handleUploadPhoto,
    handleRemovePhoto
}) {
    if (!isPropertyModalOpen) return null;

    const handleAddImageUrl = (e) => {
        e?.preventDefault();
        if (!imageUrlInput?.trim()) return;
        const currentGallery = Array.isArray(propertyForm.gallery) ? propertyForm.gallery : [];
        setPropertyForm({ ...propertyForm, gallery: [...currentGallery, imageUrlInput.trim()] });
        if (setImageUrlInput) setImageUrlInput('');
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const uploadedUrls = [];
        for (const file of files) {
            try {
                const mediaUrl = await uploadImageMedia(file, 'camps/gallery');
                if (mediaUrl) uploadedUrls.push(mediaUrl);
            } catch (err) {
                console.error('Server upload failed, using optimized local fallback:', err);
                try {
                    const base64 = await compressImageFile(file, 1280, 800, 0.85);
                    uploadedUrls.push(base64);
                } catch (cErr) {
                    console.error('Fallback compression failed:', cErr);
                }
            }
        }
        if (uploadedUrls.length > 0) {
            const currentGallery = Array.isArray(propertyForm.gallery) ? propertyForm.gallery : [];
            setPropertyForm({
                ...propertyForm,
                gallery: [...currentGallery, ...uploadedUrls],
                image: propertyForm.image || uploadedUrls[0]
            });
        }
    };

    const removePhotoAt = (idx) => {
        const currentGallery = Array.isArray(propertyForm.gallery) ? propertyForm.gallery : [];
        const nextGallery = currentGallery.filter((_, i) => i !== idx);
        setPropertyForm({
            ...propertyForm,
            gallery: nextGallery,
            image: nextGallery[0] || ''
        });
    };

    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, zIndex: 100010, background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                <motion.div initial={{ scale: 0.96, y: 14 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96 }} className="admin-modal-box" style={{ maxWidth: '720px', maxHeight: '88vh' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid rgba(18, 22, 19, 0.08)', paddingBottom: '14px' }}>
                        <div>
                            <h3 style={H2_STYLE}>
                                {editingProperty ? 'Edit Campsite & Photo Gallery' : 'Add New Kerala Campsite'}
                            </h3>
                            <div style={{ fontSize: '12px', color: '#59655D' }}>Configure pricing, photos, itinerary, and inclusions</div>
                        </div>
                        <button onClick={() => setIsPropertyModalOpen(false)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F8F9F5', border: 'none', color: '#121613', cursor: 'pointer', fontWeight: '800' }}>
                            <X size={15} strokeWidth={2.5} />
                        </button>
                    </div>

                    <form onSubmit={handleSaveProperty} style={COL_GAP_14}>
                        {/* PHOTO GALLERY MANAGER */}
                        <div style={{ background: '#F8F9F5', borderRadius: '16px', padding: '16px', border: '1px solid rgba(18, 22, 19, 0.08)' }}>
                            <div style={ROW_SPACE_10}>
                                <div>
                                    <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#121613', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block' }}>
                                        Photo Gallery ({propertyForm.gallery ? propertyForm.gallery.length : 0} Images)
                                    </label>
                                    <span style={{ fontSize: '11px', color: '#59655D' }}>Upload from device or paste image URLs</span>
                                </div>
                                <label style={{ cursor: 'pointer', background: '#121613', color: '#FFFFFF', padding: '6px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                    <Upload size={14} />
                                    <span>Upload Photos</span>
                                    <input type="file" multiple accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                                </label>
                            </div>

                            {/* URL Input Bar */}
                            <div style={{ display: 'flex', gap: '6px', margin: '10px 0' }}>
                                <input
                                    type="url"
                                    placeholder="Paste photo URL (https://images.unsplash.com/...)"
                                    value={imageUrlInput || ''}
                                    onChange={e => setImageUrlInput && setImageUrlInput(e.target.value)}
                                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid rgba(18, 22, 19, 0.12)', fontSize: '12px', color: '#121613', outline: 'none' }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddImageUrl}
                                    style={{ padding: '8px 14px', borderRadius: '8px', background: '#D5ED55', border: 'none', color: '#0B150E', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                                >
                                    + Add URL
                                </button>
                            </div>

                            {/* Thumbnail Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                                {(propertyForm.gallery || []).map((img, idx) => (
                                    <div key={idx} style={{ position: 'relative', height: '65px', borderRadius: '8px', overflow: 'hidden', border: propertyForm.image === img ? '2px solid #D5ED55' : '1px solid rgba(18, 22, 19, 0.1)' }}>
                                        <img src={img} alt="" style={IMG_FILL_STYLE} loading="lazy" decoding="async" />
                                        <button
                                            type="button"
                                            onClick={() => removePhotoAt(idx)}
                                            style={{ position: 'absolute', top: '3px', right: '3px', background: 'rgba(239, 68, 68, 0.85)', color: '#FFFFFF', border: 'none', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={FIELD_LABEL_STYLE}>
                                Sanctuary / Campsite Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={propertyForm.name || ''}
                                onChange={e => setPropertyForm({ ...propertyForm, name: e.target.value })}
                                style={FORM_INPUT_STYLE}
                            />
                        </div>

                        <div className="admin-form-grid-2">
                            <div>
                                <label style={FIELD_LABEL_STYLE}>
                                    Location / District *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={propertyForm.location || ''}
                                    onChange={e => setPropertyForm({ ...propertyForm, location: e.target.value })}
                                    style={FORM_INPUT_STYLE}
                                />
                            </div>
                            <div>
                                <label style={FIELD_LABEL_STYLE}>
                                    Base Price Per Night (₹) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={propertyForm.price || ''}
                                    onChange={e => setPropertyForm({ ...propertyForm, price: Number(e.target.value) })}
                                    style={FORM_INPUT_STYLE}
                                />
                            </div>
                        </div>

                        <div className="admin-form-grid-2">
                            <div>
                                <label style={FIELD_LABEL_STYLE}>
                                    Category
                                </label>
                                <select
                                    value={propertyForm.category || 'luxury'}
                                    onChange={e => setPropertyForm({ ...propertyForm, category: e.target.value })}
                                    style={FORM_INPUT_STYLE}
                                >
                                    <option value="luxury">Luxury Glamping</option>
                                    <option value="wilderness">Wilderness Camping</option>
                                    <option value="plantation">Tea Plantation</option>
                                    <option value="waterfront">Waterfront & Lake</option>
                                </select>
                            </div>
                            <div>
                                <label style={FIELD_LABEL_STYLE}>
                                    Total Capacity (Max Campers)
                                </label>
                                <input
                                    type="number"
                                    value={propertyForm.capacity || 30}
                                    onChange={e => setPropertyForm({ ...propertyForm, capacity: Number(e.target.value) })}
                                    style={FORM_INPUT_STYLE}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={FIELD_LABEL_STYLE}>
                                Description
                            </label>
                            <textarea
                                rows={3}
                                value={propertyForm.description || ''}
                                onChange={e => setPropertyForm({ ...propertyForm, description: e.target.value })}
                                style={{ ...FORM_INPUT_STYLE, resize: 'vertical' }}
                            />
                        </div>

                        <div className="admin-form-grid-2">
                            <div>
                                <label style={FIELD_LABEL_STYLE}>
                                    Highlights (Comma Separated)
                                </label>
                                <input
                                    type="text"
                                    value={propertyForm.highlights || ''}
                                    onChange={e => setPropertyForm({ ...propertyForm, highlights: e.target.value })}
                                    style={FORM_INPUT_STYLE}
                                />
                            </div>
                            <div>
                                <label style={FIELD_LABEL_STYLE}>
                                    Inclusions (Comma Separated)
                                </label>
                                <input
                                    type="text"
                                    value={propertyForm.inclusions || ''}
                                    onChange={e => setPropertyForm({ ...propertyForm, inclusions: e.target.value })}
                                    style={FORM_INPUT_STYLE}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-lime" style={{ padding: '13px', fontSize: '14px', fontWeight: '800', marginTop: '4px', cursor: 'pointer', borderRadius: '12px' }}>
                            {editingProperty ? 'Save Campsite & Gallery Changes' : '+ Publish New Campsite'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
