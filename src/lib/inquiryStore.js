import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const MAX_INQUIRIES = 500;

let memoryStore = [];

function ensureDataDir() {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
    } catch (e) {
        // Ignored on read-only serverless filesystems (e.g. Vercel)
    }
}

function readStoredInquiries() {
    try {
        ensureDataDir();
        if (fs.existsSync(INQUIRIES_FILE)) {
            const raw = fs.readFileSync(INQUIRIES_FILE, 'utf-8');
            const data = JSON.parse(raw);
            if (Array.isArray(data) && data.length > 0) {
                memoryStore = data;
                return data;
            }
        }
        fs.writeFileSync(INQUIRIES_FILE, JSON.stringify([], null, 2), 'utf-8');
        memoryStore = [];
        return [];
    } catch (err) {
        return memoryStore;
    }
}

function writeStoredInquiries(inquiries) {
    memoryStore = inquiries;
    try {
        ensureDataDir();
        fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');
        return { success: true, persistedToDisk: true };
    } catch (err) {
        return { success: false, persistedToDisk: false, inMemoryOnly: true, error: err.message };
    }
}

export async function getStoredInquiries({ limit, offset } = {}) {
    const all = readStoredInquiries();
    if (typeof limit === 'number') {
        const start = typeof offset === 'number' ? offset : 0;
        return all.slice(start, start + limit);
    }
    return all;
}

export async function addStoredInquiry(record) {
    const all = readStoredInquiries();
    const updated = [record, ...all].slice(0, MAX_INQUIRIES);
    writeStoredInquiries(updated);
    return record;
}
