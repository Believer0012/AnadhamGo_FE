import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

export const IS_SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && (SUPABASE_ANON_KEY || SUPABASE_SERVICE_KEY));

// Server-side client (admin uploads) — uses service role key to bypass RLS
export const supabaseAdmin = IS_SUPABASE_CONFIGURED
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY, {
          auth: { persistSession: false }
      })
    : null;

// Client-side client (public reads) — uses anon key, respects RLS
export const supabaseClient = IS_SUPABASE_CONFIGURED
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

// Supabase Storage bucket name — create this in your Supabase dashboard
export const STORAGE_BUCKET = 'aanandham-media';

/**
 * Get public CDN URL for a file in Supabase Storage
 * @param {string} filePath - e.g. "camps/pkg-kolukkumalai/hero.jpg"
 * @returns {string} Public CDN URL
 */
export function getPublicUrl(filePath) {
    if (!IS_SUPABASE_CONFIGURED || !supabaseClient) return '';
    const { data } = supabaseClient.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);
    return data?.publicUrl || '';
}

/**
 * Upload a file Buffer to Supabase Storage (server-side only)
 * @param {Buffer} buffer - Raw file buffer
 * @param {string} filePath - e.g. "camps/pkg-kolukkumalai/gallery/photo1.jpg"
 * @param {string} contentType - e.g. "image/jpeg"
 * @returns {Promise<{ url: string, error: string|null }>}
 */
export async function uploadBuffer(buffer, filePath, contentType = 'image/jpeg') {
    if (!IS_SUPABASE_CONFIGURED || !supabaseAdmin) {
        return { url: null, error: 'Supabase Storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.' };
    }

    const { data, error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, buffer, {
            contentType,
            upsert: true, // Overwrite if same path already exists
            cacheControl: '31536000' // 1-year CDN cache
        });

    if (error) {
        return { url: null, error: error.message };
    }

    const publicUrl = getPublicUrl(data.path);
    return { url: publicUrl, error: null };
}

/**
 * Delete a file from Supabase Storage (server-side only)
 * @param {string} filePath - e.g. "camps/pkg-kolukkumalai/gallery/photo1.jpg"
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
export async function deleteFile(filePath) {
    if (!IS_SUPABASE_CONFIGURED || !supabaseAdmin) {
        return { success: false, error: 'Supabase Storage not configured' };
    }
    const { error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

    return { success: !error, error: error?.message || null };
}

/**
 * List all files in a folder prefix
 * @param {string} folderPath - e.g. "camps/pkg-kolukkumalai"
 * @returns {Promise<Array>}
 */
export async function listFiles(folderPath) {
    if (!IS_SUPABASE_CONFIGURED || !supabaseAdmin) return [];
    const { data, error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .list(folderPath, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) return [];
    return (data || []).map(file => ({
        name: file.name,
        path: `${folderPath}/${file.name}`,
        url: getPublicUrl(`${folderPath}/${file.name}`),
        size: file.metadata?.size || 0,
        createdAt: file.created_at
    }));
}
