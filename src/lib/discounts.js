// ── DISCOUNT CAMPAIGNS (SERVER STORE) ──
// Server-only wrapper: persists campaigns to .data/discounts.json (or memory
// on read-only serverless FS). Re-exports the client-safe core for consumers.
// NOTE: do NOT import this module from client components (bundles Node 'fs').
// Client-safe logic lives in ./discountsCore.js.
import fs from 'fs';
import path from 'path';
import {
    DEFAULT_DISCOUNTS,
    loadDiscountsFromStorage,
    saveDiscountsToStorage,
    getActiveDiscounts,
    applyDiscounts
} from './discountsCore';

export {
    DEFAULT_DISCOUNTS,
    loadDiscountsFromStorage,
    saveDiscountsToStorage,
    getActiveDiscounts,
    applyDiscounts
};

const DATA_DIR = path.join(process.cwd(), '.data');
const DISCOUNTS_FILE = path.join(DATA_DIR, 'discounts.json');

let memoryStore = null;

function ensureDataDir() {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) { /* read-only serverless FS */ }
}

// Server-side read (file -> memory -> defaults)
export function getDiscounts() {
    try {
        ensureDataDir();
        if (fs.existsSync(DISCOUNTS_FILE)) {
            const raw = fs.readFileSync(DISCOUNTS_FILE, 'utf-8');
            const data = JSON.parse(raw);
            if (Array.isArray(data)) {
                memoryStore = data;
                return data;
            }
        }
        fs.writeFileSync(DISCOUNTS_FILE, JSON.stringify(DEFAULT_DISCOUNTS, null, 2), 'utf-8');
        memoryStore = DEFAULT_DISCOUNTS;
        return DEFAULT_DISCOUNTS;
    } catch (err) {
        return memoryStore || DEFAULT_DISCOUNTS;
    }
}

// Server-side persist
export function saveDiscounts(list) {
    memoryStore = Array.isArray(list) ? list : [];
    try {
        ensureDataDir();
        fs.writeFileSync(DISCOUNTS_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
        return { success: true, persistedToDisk: true };
    } catch (err) {
        return { success: false, persistedToDisk: false, inMemoryOnly: true, error: err.message };
    }
}