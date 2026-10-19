import fs from 'fs';
import path from 'path';
import { prisma, isPrismaConfigured } from './prisma.js';

const DATA_DIR = path.join(process.cwd(), '.data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

const INITIAL_SERVER_BOOKINGS = [];

// In-memory fallback if disk write is not available
let memoryStore = [...INITIAL_SERVER_BOOKINGS];

// Helper: Ensure directory exists on local disk
function ensureDataDir() {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
    } catch (e) {
        // Ignored on read-only serverless filesystems (e.g. Vercel)
    }
}

// Helper: Read local disk fallback
function readLocalBookings() {
    try {
        ensureDataDir();
        if (fs.existsSync(BOOKINGS_FILE)) {
            const raw = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
            const data = JSON.parse(raw);
            if (Array.isArray(data) && data.length > 0) {
                memoryStore = data;
                return data;
            }
        }
        fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(INITIAL_SERVER_BOOKINGS, null, 2), 'utf-8');
        memoryStore = [...INITIAL_SERVER_BOOKINGS];
        return INITIAL_SERVER_BOOKINGS;
    } catch (err) {
        return memoryStore.length > 0 ? memoryStore : INITIAL_SERVER_BOOKINGS;
    }
}

// Helper: Write local disk fallback (only used in pure local / non-Prisma development mode)
function writeLocalBookings(bookings) {
    memoryStore = bookings;
    // On production or when PostgreSQL/Prisma is configured, skip doomed disk writes on read-only serverless filesystems
    if (isPrismaConfigured) {
        return { success: true, inMemoryOnly: true };
    }
    try {
        ensureDataDir();
        fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
        return { success: true, persistedToDisk: true };
    } catch (err) {
        return { success: false, persistedToDisk: false, inMemoryOnly: true, error: err.message };
    }
}

// Helper: Convert Prisma DB record to application JSON format
function mapFromPrisma(record) {
    if (!record) return null;
    return {
        ...record,
        holdExpiresAt: record.holdExpiresAt != null ? Number(record.holdExpiresAt) : null,
        paidAt: record.paidAt ? (typeof record.paidAt === 'string' ? record.paidAt : record.paidAt.toISOString()) : null,
        checkInAt: record.checkInAt ? (typeof record.checkInAt === 'string' ? record.checkInAt : record.checkInAt.toISOString()) : null,
        createdAt: typeof record.createdAt === 'string' ? record.createdAt : record.createdAt?.toISOString?.() || String(record.createdAt),
        addons: Array.isArray(record.addons) ? record.addons : (typeof record.addons === 'string' ? JSON.parse(record.addons || '[]') : []),
        attendanceRoster: Array.isArray(record.attendanceRoster) ? record.attendanceRoster : (typeof record.attendanceRoster === 'string' ? JSON.parse(record.attendanceRoster || '[]') : []),
        utrNumber: record.utrNumber || null,
        paidAmount: record.paidAmount != null ? Number(record.paidAmount) : (record.advancePaid != null ? Number(record.advancePaid) : null),
        advancePaid: record.advancePaid != null ? Number(record.advancePaid) : (record.paidAmount != null ? Number(record.paidAmount) : null),
        balanceDue: record.balanceDue != null ? Number(record.balanceDue) : null,
        balanceCollected: record.balanceCollected != null ? Number(record.balanceCollected) : null,
        isBalancePaid: Boolean(record.isBalancePaid),
        paymentMode: record.paymentMode || null,
        settlementMethod: record.settlementMethod || null,
        mealSummary: record.mealSummary || null,
        dietaryChoice: record.dietaryChoice || null,
        vegCount: record.vegCount != null ? Number(record.vegCount) : null,
        nonVegCount: record.nonVegCount != null ? Number(record.nonVegCount) : null,
        email: record.email || null,
        pickupDropStatus: record.pickupDropStatus || null,
        pickupTime: record.pickupTime || null,
        dropTime: record.dropTime || null,
        checkedInCount: record.checkedInCount != null ? Number(record.checkedInCount) : null,
        shortCount: record.shortCount != null ? Number(record.shortCount) : null,
        marshalName: record.marshalName || null,
        marshalNotes: record.marshalNotes || null,
        convoyTime: record.convoyTime || null,
        emergencyPhone: record.emergencyPhone || null,
        discountCode: record.discountCode || null,
        discountAmount: record.discountAmount != null ? Number(record.discountAmount) : null,
        allocatedUnit: record.allocatedUnit || record.assignedTent || null,
        assignedTent: record.assignedTent || record.allocatedUnit || null,
        wristbandRange: record.wristbandRange || null,
        campsiteId: record.campsiteId || null,
        lastNotifiedStatus: record.lastNotifiedStatus || null
    };
}

// Helper: Convert application record to Prisma DB insert/update format
function mapToPrisma(data) {
    const payload = { ...data };
    if (payload.holdExpiresAt !== undefined) {
        payload.holdExpiresAt = payload.holdExpiresAt != null ? BigInt(Math.floor(Number(payload.holdExpiresAt))) : null;
    }
    if (payload.paidAt !== undefined) {
        payload.paidAt = payload.paidAt ? new Date(payload.paidAt) : null;
    }
    if (payload.checkInAt !== undefined) {
        payload.checkInAt = payload.checkInAt ? new Date(payload.checkInAt) : null;
    }
    if (payload.createdAt !== undefined) {
        const d = new Date(payload.createdAt);
        payload.createdAt = isNaN(d.getTime()) ? new Date() : d;
    }
    if (payload.addons !== undefined) {
        payload.addons = Array.isArray(payload.addons) ? payload.addons : [];
    }
    if (payload.attendanceRoster !== undefined) {
        payload.attendanceRoster = Array.isArray(payload.attendanceRoster) ? payload.attendanceRoster : [];
    }
    if (payload.total !== undefined) {
        payload.total = Number(payload.total) || 0;
    }
    if (payload.paidAmount !== undefined || payload.advancePaid !== undefined) {
        const amt = payload.paidAmount !== undefined ? payload.paidAmount : payload.advancePaid;
        payload.paidAmount = amt != null ? Number(amt) : null;
        payload.advancePaid = payload.paidAmount;
    }
    if (payload.balanceDue !== undefined) {
        payload.balanceDue = payload.balanceDue != null ? Number(payload.balanceDue) : null;
    }
    if (payload.balanceCollected !== undefined) {
        payload.balanceCollected = payload.balanceCollected != null ? Number(payload.balanceCollected) : null;
    }
    if (payload.isBalancePaid !== undefined) {
        payload.isBalancePaid = Boolean(payload.isBalancePaid);
    }
    if (payload.guests !== undefined) {
        payload.guests = Number(payload.guests) || 1;
    }
    if (payload.vegCount !== undefined) {
        payload.vegCount = payload.vegCount != null ? Number(payload.vegCount) : null;
    }
    if (payload.nonVegCount !== undefined) {
        payload.nonVegCount = payload.nonVegCount != null ? Number(payload.nonVegCount) : null;
    }
    if (payload.checkedInCount !== undefined) {
        payload.checkedInCount = payload.checkedInCount != null ? Number(payload.checkedInCount) : null;
    }
    if (payload.shortCount !== undefined) {
        payload.shortCount = payload.shortCount != null ? Number(payload.shortCount) : null;
    }
    if (payload.assignedTent !== undefined || payload.allocatedUnit !== undefined) {
        const unit = payload.assignedTent || payload.allocatedUnit || null;
        payload.assignedTent = unit;
        payload.allocatedUnit = unit;
    }
    if (payload.discountAmount !== undefined) {
        payload.discountAmount = payload.discountAmount != null ? Number(payload.discountAmount) : null;
    }

    // Strip transient non-database flags
    delete payload.lastUpdated;

    return payload;
}

/**
 * Retrieve bookings with optional pagination (Postgres/Neon if configured, otherwise local JSON/memory fallback)
 */
export async function getStoredBookings({ limit, offset } = {}) {
    if (isPrismaConfigured && prisma) {
        try {
            const query = {
                orderBy: { createdAt: 'desc' }
            };
            if (typeof limit === 'number' && limit > 0) {
                query.take = limit;
            }
            if (typeof offset === 'number' && offset >= 0) {
                query.skip = offset;
            }
            const records = await prisma.booking.findMany(query);
            return (records || []).map(mapFromPrisma);
        } catch (err) {
            console.error('Prisma query error, falling back to local store:', err);
        }
    }
    const all = readLocalBookings();
    if (typeof offset === 'number' || typeof limit === 'number') {
        const start = typeof offset === 'number' ? offset : 0;
        const end = typeof limit === 'number' ? start + limit : undefined;
        return all.slice(start, end);
    }
    return all;
}

/**
 * Persist / Bulk-sync bookings list with non-destructive upserts
 */
export async function saveStoredBookings(bookings, { hardSync = false } = {}) {
    if (!Array.isArray(bookings)) return false;
    writeLocalBookings(bookings);
    memoryStore = bookings;

    if (isPrismaConfigured && prisma) {
        try {
            // ONLY delete records if hardSync is explicitly true, NEVER on routine save
            if (hardSync) {
                const incomingIds = bookings.map(b => b.id).filter(Boolean);
                if (incomingIds.length > 0) {
                    await prisma.booking.deleteMany({
                        where: {
                            id: { notIn: incomingIds }
                        }
                    });
                }
            }
            // Non-destructive individual upserts
            for (const b of bookings) {
                if (!b || !b.id) continue;
                const mapped = mapToPrisma(b);
                await prisma.booking.upsert({
                    where: { id: b.id },
                    create: mapped,
                    update: mapped
                });
            }
            return true;
        } catch (err) {
            console.error('Prisma bulk save error:', err);
        }
    }
    return true;
}

/**
 * Add a new booking record (returns single created record, avoiding full-table findMany)
 */
export async function addServerBooking(newBooking) {
    const list = readLocalBookings();
    const updated = [newBooking, ...list.filter(b => b.id !== newBooking.id)];
    writeLocalBookings(updated);

    if (isPrismaConfigured && prisma) {
        try {
            const mapped = mapToPrisma(newBooking);
            const created = await prisma.booking.upsert({
                where: { id: newBooking.id },
                create: mapped,
                update: mapped
            });
            const result = mapFromPrisma(created);
            memoryStore = [result, ...memoryStore.filter(b => b.id !== newBooking.id)];
            return result;
        } catch (err) {
            console.error('Prisma addServerBooking error, saved locally:', err);
        }
    }

    return newBooking;
}

/**
 * Update an existing booking record by ID (returns single updated record, avoiding full-table findMany)
 */
export async function updateServerBooking(id, updates) {
    const list = readLocalBookings();
    let updatedRecord = null;
    let found = false;
    const updated = list.map(b => {
        if (b.id.toUpperCase() === id.toUpperCase()) {
            found = true;
            updatedRecord = { ...b, ...updates };
            return updatedRecord;
        }
        return b;
    });

    if (!found) {
        updatedRecord = { id, ...updates };
        updated.unshift(updatedRecord);
    }
    writeLocalBookings(updated);

    if (isPrismaConfigured && prisma) {
        try {
            const mapped = mapToPrisma({ id, ...updates });
            const updatedPrisma = await prisma.booking.upsert({
                where: { id },
                create: {
                    id,
                    name: updates.name || 'Explorer Lead',
                    phone: updates.phone || '+91 98471 23456',
                    package: updates.package || 'Kolukkumalai Sunrise Ridge Glamp',
                    dates: updates.dates || 'Upcoming Weekend',
                    guests: Number(updates.guests) || 2,
                    roomType: updates.roomType || 'Ridge Glamping Tent',
                    total: Number(updates.total) || 4998,
                    ...mapped
                },
                update: mapped
            });
            const result = mapFromPrisma(updatedPrisma);
            memoryStore = memoryStore.map(b => b.id === id ? { ...b, ...result } : b);
            return result;
        } catch (err) {
            console.error('Prisma updateServerBooking error, saved locally:', err);
        }
    }

    return updatedRecord || { id, ...updates };
}

/**
 * Delete a booking record by ID (permanently removes from PostgreSQL and local stores)
 */
export async function deleteServerBooking(id) {
    if (!id) return { success: false, message: 'No ID provided' };
    const cleanId = String(id).trim();

    if (isPrismaConfigured && prisma) {
        try {
            await prisma.booking.deleteMany({
                where: { 
                    id: { equals: cleanId, mode: 'insensitive' }
                }
            });
        } catch (err) {
            console.error('Prisma deleteServerBooking error:', err);
        }
    }

    memoryStore = memoryStore.filter(b => b.id && b.id.toUpperCase() !== cleanId.toUpperCase());
    const list = readLocalBookings();
    const updated = list.filter(b => b.id && b.id.toUpperCase() !== cleanId.toUpperCase());
    writeLocalBookings(updated);
    return { success: true, id: cleanId };
}
