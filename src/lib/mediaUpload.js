/**
 * uploadCampsitePhoto — Upload a photo file from the admin panel to Supabase Storage
 * via the secured /api/admin/media route (admin JWT required in localStorage).
 *
 * @param {File} file - The raw File object from an <input type="file"> element
 * @param {string} folder - Destination folder, e.g. "camps/pkg-kolukkumalai/gallery"
 * @param {Function} onProgress - Optional callback ({ percent }) for progress UI
 * @returns {Promise<{ url: string, path: string, sizeKB: number }>}
 * @throws {Error} with a user-friendly message on failure
 */
export async function uploadCampsitePhoto(file, folder = 'uploads', onProgress = null) {
    if (!file) throw new Error('No file provided');

    const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    if (!ALLOWED.includes(file.type?.toLowerCase())) {
        throw new Error('Invalid file type. Only JPEG, PNG, WebP, and AVIF are allowed.');
    }
    if (file.size > 10 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 10MB.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    // Simulate progress (XHR gives real progress; fetch doesn't natively)
    if (onProgress) onProgress({ percent: 10 });

    const res = await fetch('/api/admin/media', {
        method: 'POST',
        credentials: 'include',
        body: formData
    });

    if (onProgress) onProgress({ percent: 90 });

    const json = await res.json();

    if (!res.ok || !json.success) {
        throw new Error(json.message || `Upload failed (${res.status})`);
    }

    if (onProgress) onProgress({ percent: 100 });

    return {
        url: json.url,
        path: json.path,
        sizeKB: json.sizeKB,
        width: json.width,
        height: json.height
    };
}

/**
 * deleteCampsitePhoto — Remove a photo from Supabase Storage via admin API
 * @param {string} filePath - e.g. "camps/pkg-kolukkumalai/gallery/uuid.webp"
 * @returns {Promise<void>}
 */
export async function deleteCampsitePhoto(filePath) {
    const res = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ path: filePath })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
        throw new Error(json.message || 'Delete failed');
    }
}
