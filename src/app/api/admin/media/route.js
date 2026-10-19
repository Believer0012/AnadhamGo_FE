import { NextResponse } from 'next/server';
import { getAdminPayload, getClientIp } from '@/lib/authConfig';
import { checkRateLimit } from '@/lib/redis';
import { uploadBuffer, deleteFile, IS_SUPABASE_CONFIGURED } from '@/lib/supabaseStorage';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { recordAuditEvent, logCrash } from '@/lib/auditLedger';

// ── POST: Upload a campsite / room / event photo to Supabase Storage ──
// Accepts multipart/form-data with fields:
//   - file: the image file (required)
//   - folder: destination folder e.g. "camps/pkg-kolukkumalai/gallery" (optional, default "uploads")
// Returns: { success, url, path, width, height, sizeKB }
export async function POST(request) {
    const ip = getClientIp(request);

    // Rate limit: max 30 uploads per minute per IP
    const rateLimit = await checkRateLimit(`ratelimit:media_upload:${ip}`, 30, 60);
    if (!rateLimit.allowed) {
        return NextResponse.json({ success: false, message: 'Upload rate limit reached. Please wait.' }, { status: 429 });
    }

    // Admin auth required
    if (!getAdminPayload(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const folder = String(formData.get('folder') || 'uploads').replace(/[^a-zA-Z0-9/_-]/g, '').substring(0, 120);

        if (!file || typeof file === 'string') {
            return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
        }

        // Allowed MIME types
        const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
        if (!ALLOWED_TYPES.includes(file.type?.toLowerCase())) {
            return NextResponse.json({ success: false, message: 'Invalid file type. Only JPEG, PNG, WebP, and AVIF are allowed.' }, { status: 400 });
        }

        // Max 10MB raw file
        const MAX_BYTES = 10 * 1024 * 1024;
        if (file.size > MAX_BYTES) {
            return NextResponse.json({ success: false, message: 'File too large. Maximum upload size is 10MB.' }, { status: 400 });
        }

        // Read raw buffer
        const arrayBuffer = await file.arrayBuffer();
        const inputBuffer = Buffer.from(arrayBuffer);

        // Process with Sharp: decode, strip metadata, resize to max 1920px wide, and re-encode to WebP
        let processedBuffer;
        let metadata;
        try {
            const sharpInstance = sharp(inputBuffer)
                .resize({ width: 1920, height: 1440, fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 85 });
            processedBuffer = await sharpInstance.toBuffer();
            metadata = await sharp(processedBuffer).metadata();
            if (!metadata || !metadata.width || !metadata.height) {
                throw new Error('Image metadata extraction failed');
            }
        } catch (sharpErr) {
            console.error('Sharp image validation/decoding error:', sharpErr);
            return NextResponse.json({ success: false, message: 'Invalid, corrupted, or unprocessable image file.' }, { status: 400 });
        }

        // Unique file path: folder/uuid.webp
        const fileName = `${randomUUID()}.webp`;
        const filePath = `${folder}/${fileName}`;

        let publicUrl = null;

        if (IS_SUPABASE_CONFIGURED) {
            const { url, error } = await uploadBuffer(processedBuffer, filePath, 'image/webp');
            if (error) {
                return NextResponse.json({ success: false, message: `Upload failed: ${error}` }, { status: 500 });
            }
            publicUrl = url;
        } else {
            // Local filesystem fallback: write to public/uploads directory
            const fs = await import('fs');
            const path = await import('path');
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const localDest = path.join(uploadsDir, fileName);
            fs.writeFileSync(localDest, processedBuffer);
            publicUrl = `/uploads/${fileName}`;
        }

        recordAuditEvent({
            category: 'MEDIA',
            action: 'UPLOAD_SUCCESS',
            actor: getAdminPayload(request)?.campName || 'Admin Coordinator',
            recordId: filePath,
            details: `Uploaded image to ${publicUrl} (${Math.round(processedBuffer.length / 1024)} KB WebP)`,
            status: 'SUCCESS',
            severity: 'INFO'
        }, request);

        return NextResponse.json({
            success: true,
            url: publicUrl,
            path: filePath,
            width: metadata?.width || null,
            height: metadata?.height || null,
            sizeKB: Math.round(processedBuffer.length / 1024)
        });

    } catch (err) {
        console.error('Media upload error:', err);
        logCrash({ source: 'ADMIN_MEDIA', route: 'POST /api/admin/media', error: err, request });
        return NextResponse.json({ success: false, message: 'Internal error during file upload.' }, { status: 500 });
    }
}

// ── DELETE: Remove a file from Supabase Storage ──
// Body: { path: "camps/pkg-kolukkumalai/gallery/uuid.webp" }
export async function DELETE(request) {
    const ip = getClientIp(request);

    const rateLimit = await checkRateLimit(`ratelimit:media_delete:${ip}`, 20, 60);
    if (!rateLimit.allowed) {
        return NextResponse.json({ success: false, message: 'Too many requests.' }, { status: 429 });
    }

    if (!getAdminPayload(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { path } = await request.json();
        if (!path || typeof path !== 'string' || path.includes('..')) {
            return NextResponse.json({ success: false, message: 'Invalid file path.' }, { status: 400 });
        }

        const { success, error } = await deleteFile(path);
        if (!success) {
            recordAuditEvent({
                category: 'MEDIA',
                action: 'DELETE_FAILED',
                actor: getAdminPayload(request)?.campName || 'Admin Coordinator',
                recordId: path,
                details: `Media deletion failed for ${path}`,
                status: 'FAILED',
                severity: 'HIGH'
            }, request);
            return NextResponse.json({ success: false, message: error || 'Delete failed.' }, { status: 500 });
        }

        recordAuditEvent({
            category: 'MEDIA',
            action: 'DELETE_SUCCESS',
            actor: getAdminPayload(request)?.campName || 'Admin Coordinator',
            recordId: path,
            details: `Deleted media file ${path}`,
            status: 'SUCCESS',
            severity: 'WARN'
        }, request);

        return NextResponse.json({ success: true, message: 'File deleted.' });
    } catch (err) {
        console.error('Media delete error:', err);
        logCrash({ source: 'ADMIN_MEDIA', route: 'DELETE /api/admin/media', error: err, request });
        return NextResponse.json({ success: false, message: 'Internal error during file deletion.' }, { status: 500 });
    }
}
