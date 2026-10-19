import React from 'react';

export const META_LABEL_STYLE = { fontSize: '10.5px', fontWeight: '800', color: '#7D8880', textTransform: 'uppercase', letterSpacing: '0.8px' };
export const ELLIPSIS_STYLE = { fontSize: '13px', fontWeight: '800', color: '#121613', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
export const MUTED_TEXT_11 = { color: '#7D8880', fontSize: '11px' };
export const COL_GAP_14 = { display: 'flex', flexDirection: 'column', gap: '14px' };
export const ROW_SPACE_8 = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' };
export const ROW_SPACE_10 = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' };
export const H2_STYLE = { fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '800', margin: 0, color: '#121613' };
export const FIELD_LABEL_5 = { fontSize: '12px', fontWeight: '700', color: '#121613', display: 'block', marginBottom: '5px' };
export const CARD_CLICKABLE = { background: '#FFFFFF', border: '1px solid rgba(18,22,19,0.08)', borderRadius: '14px', padding: '14px 16px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', transition: 'all 0.15s ease' };
export const MICRO_LABEL = { fontSize: '11.5px', fontWeight: '700', color: '#59655D', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' };
export const ROW_SPACE_WRAP = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' };
export const ROW_SPACE_14 = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' };

export const FORM_INPUT_STYLE = { width: '100%', padding: '11px 14px', borderRadius: '12px', background: '#F8F9F5', border: '1px solid rgba(18, 22, 19, 0.12)', color: '#121613', fontSize: '13.5px', boxSizing: 'border-box' };
export const FORM_INPUT_SMALL_STYLE = { width: '100%', padding: '9px 12px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18, 22, 19, 0.12)', color: '#121613', fontSize: '13px', fontWeight: '700', outline: 'none', boxSizing: 'border-box' };
export const FIELD_LABEL_STYLE = { fontSize: '12px', fontWeight: '700', color: '#121613', display: 'block', marginBottom: '4px' };
export const SECTION_LABEL_STYLE = { fontSize: '10.5px', fontWeight: '800', color: '#59655D', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' };
export const IMG_FILL_STYLE = { width: '100%', height: '100%', objectFit: 'cover' };

export const drawerWaveVariants = {
    hidden: { 
        opacity: 0,
        y: -6,
        clipPath: 'circle(0% at calc(100% - 42px) 36px)',
        WebkitClipPath: 'circle(0% at calc(100% - 42px) 36px)',
        scale: 0.98,
        transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] }
    },
    visible: { 
        opacity: 1,
        y: 0,
        clipPath: 'circle(150% at calc(100% - 42px) 36px)',
        WebkitClipPath: 'circle(150% at calc(100% - 42px) 36px)',
        scale: 1,
        transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
    },
    exit: { 
        opacity: 0,
        y: -4,
        clipPath: 'circle(0% at calc(100% - 42px) 36px)',
        WebkitClipPath: 'circle(0% at calc(100% - 42px) 36px)',
        scale: 0.98,
        transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] }
    }
};

export const drawerStaggerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.12 }
    },
    exit: {
        opacity: 0,
        transition: { staggerChildren: 0.02, staggerDirection: -1 }
    }
};

export const drawerItemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.28, ease: "easeOut" }
    },
    exit: {
        opacity: 1,
        transition: { duration: 0.38 }
    }
};

export function compressImageFile(file, maxWidth = 1280, maxHeight = 960, quality = 0.82) {
    return new Promise((resolve, reject) => {
        if (!file) return reject(new Error('No file provided'));
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
        if (!file.type || !allowedMimeTypes.includes(file.type.toLowerCase())) {
            return reject(new Error('Invalid file format. Please upload JPG, PNG, WebP, or AVIF images only.'));
        }
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const image = new Image();
            image.onload = () => {
                let width = image.width;
                let height = image.height;
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0, width, height);
                const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                const compressedDataUrl = canvas.toDataURL(format, quality);
                resolve(compressedDataUrl);
            };
            image.onerror = () => reject(new Error('Failed to parse uploaded image file'));
            image.src = readerEvent.target.result;
        };
        reader.onerror = () => reject(new Error('Error reading image file'));
        reader.readAsDataURL(file);
    });
}

export async function uploadImageMedia(file, folder = 'uploads') {
    if (!file) throw new Error('No file provided');
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        
        const res = await fetch('/api/admin/media', {
            method: 'POST',
            body: formData
        });
        
        if (res.ok) {
            const data = await res.json();
            if (data.url) {
                return data.url;
            }
        }
        // If API fails or in local preview without full auth, fall back to compressed data URL
        return await compressImageFile(file, 1280, 960, 0.82);
    } catch (err) {
        console.warn('Direct media API upload failed, falling back to local compression:', err);
        return await compressImageFile(file, 1280, 960, 0.82);
    }
}

