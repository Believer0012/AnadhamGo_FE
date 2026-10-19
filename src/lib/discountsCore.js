// ── DISCOUNT CAMPAIGNS (CLIENT-SAFE CORE) ──
// Pure logic + localStorage helpers. No Node-only imports — safe for client
// bundles. Server persistence lives in ./discounts.js (fs-backed store).
// Admin UI edits campaigns via /api/admin/discounts; public pages consume
// via GET /api/discounts.

// Default campaigns seeded to match the historic squad-off behaviour.
// minGuests: the discount only applies when the group is at least this size.
export const DEFAULT_DISCOUNTS = [
    { id: 'squad-10', name: 'Squad Off (4+ Guests)', type: 'percent', value: 10, minGuests: 4, scope: 'all', active: true, createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'squad-15', name: 'Squad Off (8+ Guests)', type: 'percent', value: 15, minGuests: 8, scope: 'all', active: true, createdAt: '2026-01-01T00:00:00.000Z' }
];

// Client-side localStorage override (used by the admin UI for instant previews)
const LS_KEY = 'aanandham_admin_discounts_v2';

export function loadDiscountsFromStorage() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (e) { /* ignore */ }
    return null;
}

export function saveDiscountsToStorage(list) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(list));
    } catch (e) { /* ignore */ }
}

// Active discounts applicable to a group/campsite
export function getActiveDiscounts({ campsiteId = null, guests = 1, discounts = null } = {}) {
    const list = discounts || DEFAULT_DISCOUNTS;
    const now = Date.now();
    return list.filter(d => {
        if (!d.active) return false;
        if (d.expiresAt && now > new Date(d.expiresAt).getTime()) return false;
        if (d.scope && d.scope !== 'all' && d.scope !== campsiteId) return false;
        if (d.minGuests && Number(d.minGuests) > 0 && guests < Number(d.minGuests)) return false;
        return true;
    });
}

// Apply the best applicable discount to a base total.
// Returns the discounted total, the amount saved, and the campaign used.
export function applyDiscounts({ baseTotal, guests = 1, campsiteId = null, discounts = null }) {
    const active = getActiveDiscounts({ campsiteId, guests, discounts });
    const total = Number(baseTotal) || 0;

    if (active.length === 0 || total <= 0) {
        return { discountedTotal: total, discountAmount: 0, discountPercent: 0, discountLabel: null, applied: null };
    }

    // Pick the campaign that saves the customer the most
    let best = null;
    let bestAmount = 0;
    for (const d of active) {
        let amount = 0;
        if (d.type === 'percent') {
            amount = Math.round(total * (Number(d.value) / 100));
        } else {
            amount = Math.min(Math.round(Number(d.value) || 0), total);
        }
        if (amount > bestAmount) {
            bestAmount = amount;
            best = d;
        }
    }

    if (!best) {
        return { discountedTotal: total, discountAmount: 0, discountPercent: 0, discountLabel: null, applied: null };
    }

    const discountedTotal = Math.max(0, total - bestAmount);
    const discountPercent = best.type === 'percent' ? Number(best.value) : Math.round((bestAmount / total) * 100);
    const discountLabel = best.type === 'percent' ? `${discountPercent}% ${best.name}` : `${best.name}`;

    return { discountedTotal, discountAmount: bestAmount, discountPercent, discountLabel, applied: best };
}