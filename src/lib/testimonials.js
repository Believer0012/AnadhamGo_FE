// ── TESTIMONIALS (SERVER STORE) ──
// Server-only wrapper: persists testimonials to .data/testimonials.json (or
// memory on read-only serverless FS). Re-exports the client-safe core.
// NOTE: do NOT import this module from client components (bundles Node 'fs').
// Client-safe logic lives in ./testimonialsCore.js.
import fs from 'fs';
import path from 'path';
import {
    DEFAULT_TESTIMONIALS,
    loadTestimonialsFromStorage,
    saveTestimonialsToStorage,
    getActiveTestimonials
} from './testimonialsCore';

export {
    DEFAULT_TESTIMONIALS,
    loadTestimonialsFromStorage,
    saveTestimonialsToStorage,
    getActiveTestimonials
};

const DATA_DIR = path.join(process.cwd(), '.data');
const TESTIMONIALS_FILE = path.join(DATA_DIR, 'testimonials.json');

let memoryStore = null;

function ensureDataDir() {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) { /* read-only serverless FS */ }
}

// Server-side read (file -> memory -> defaults)
export function getTestimonials() {
    try {
        ensureDataDir();
        if (fs.existsSync(TESTIMONIALS_FILE)) {
            const raw = fs.readFileSync(TESTIMONIALS_FILE, 'utf-8');
            const data = JSON.parse(raw);
            if (Array.isArray(data)) {
                memoryStore = data;
                return data;
            }
        }
        fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(DEFAULT_TESTIMONIALS, null, 2), 'utf-8');
        memoryStore = DEFAULT_TESTIMONIALS;
        return DEFAULT_TESTIMONIALS;
    } catch (err) {
        return memoryStore || DEFAULT_TESTIMONIALS;
    }
}

// Server-side persist
export function saveTestimonials(list) {
    memoryStore = Array.isArray(list) ? list : [];
    try {
        ensureDataDir();
        fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
        return { success: true, persistedToDisk: true };
    } catch (err) {
        return { success: false, persistedToDisk: false, inMemoryOnly: true, error: err.message };
    }
}