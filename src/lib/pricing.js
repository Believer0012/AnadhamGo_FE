// ── SERVER-SIDE PRICE AUTHORITY ──
// The server recomputes booking totals from the camps catalog so a client can
// never underpay by sending a forged `total` field. Mirrors the client pricing
// formula exactly (squad discount, children rate, per-person add-ons).
import { getAllCamps } from './campsData.js';
import { applyDiscounts } from './discountsCore.js';

// Canonical add-on catalog — matches the public booking engine.
//   type:  'flat' (per group) | 'per_person' (× campers) | 'quantity' (× counter)
//   group: section shown in the booking modal, or null to keep the id priced-but-hidden
//          (bbq/jeep are already bundled into every stay, so they stay hidden here but
//           remain in the catalog for price authority / back-compat with old bookings).
//   `perPerson` is kept in sync with `type` for any older code still reading it.
export const ADDON_CATALOG = {
    bbq: { id: 'bbq', name: 'Campfire Live Barbecue Platter', price: 450, perPerson: true, type: 'per_person', group: null },
    jeep: { id: 'jeep', name: 'Private 4x4 Off-Road Jeep Upgrade', price: 1200, perPerson: false, type: 'flat', group: null },
    drone: { id: 'drone', name: '4K Drone Mountain Video Reel Shoot', price: 1500, perPerson: false, type: 'flat', group: 'Experiences' },
    yoga: { id: 'yoga', name: 'Sunrise Mountain Yoga & Pranayama', price: 250, perPerson: true, type: 'per_person', group: 'Experiences' },
    guitar: { id: 'guitar', name: 'Acoustic Guitarist for Campfire Circle', price: 2000, perPerson: false, type: 'flat', group: 'Around the campfire' },
    'ad-lunch-veg': { id: 'ad-lunch-veg', name: 'Optional Lunch (Vegetarian Meal)', price: 120, perPerson: true, type: 'quantity', group: 'Food' },
    'ad-lunch-nonveg': { id: 'ad-lunch-nonveg', name: 'Optional Lunch (Non-Vegetarian Meal)', price: 170, perPerson: true, type: 'quantity', group: 'Food' },
    'ad-live-bbq': { id: 'ad-live-bbq', name: 'Live BBQ (Per Piece / Portion)', price: 200, perPerson: false, type: 'quantity', group: 'Food' },
    'ad-forest-walk': { id: 'ad-forest-walk', name: 'Shola National Park Forest Walk', price: 300, perPerson: true, type: 'per_person', group: 'Experiences' },
    'ad-campfire-extra': { id: 'ad-campfire-extra', name: 'Extra Campfire Hour Duration', price: 500, perPerson: false, type: 'flat', group: 'Around the campfire' }
};

// Ordered sections for the booking modal's add-ons step
export const ADDON_GROUPS = ['Experiences', 'Food', 'Around the campfire'];

// GST is shown inclusive: totals already contain tax; this returns the tax portion
// baked into an inclusive total, for the "Includes GST (12%): ₹X" summary line.
export const GST_RATE = 0.12;
export function gstIncludedAmount(totalInclusive, rate = GST_RATE) {
    const t = Math.max(0, Number(totalInclusive) || 0);
    return Math.round(t - t / (1 + rate));
}

// Resolve an add-on's pricing type, tolerating older records that only had `perPerson`
export function addonType(addon) {
    if (!addon) return 'flat';
    if (addon.type) return addon.type;
    return addon.perPerson ? 'per_person' : 'flat';
}

// Cost of a single add-on given headcount and (for quantity add-ons) a chosen count
export function addonCost(addon, { totalGuests = 1, quantity = 0 } = {}) {
    if (!addon) return 0;
    const type = addonType(addon);
    if (type === 'quantity') return Math.max(0, Number(quantity) || 0) * addon.price;
    if (type === 'per_person') return addon.price * Math.max(1, Number(totalGuests) || 1);
    return addon.price;
}

export function parseRoomCapacity(capacity) {
    const m = String(capacity || '').match(/\d+/);
    return m ? parseInt(m[0], 10) : 4;
}

export function findCampAndRoom(campsiteId, roomId) {
    const camps = getAllCamps();
    const camp = camps.find(c => c.id === campsiteId || c.id?.toLowerCase() === String(campsiteId).toLowerCase()) || null;
    if (!camp) return { camp: null, room: null };
    const roomClean = String(roomId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const room = (camp.rooms || []).find(r => 
        r.id === roomId || 
        r.name === roomId || 
        r.name.toLowerCase().replace(/[^a-z0-9]/g, '') === roomClean ||
        r.id.toLowerCase().replace(/[^a-z0-9]/g, '') === roomClean
    ) || (camp.rooms && camp.rooms[0]) || null;
    return { camp, room };
}

// Recompute the exact total the customer must pay (in rupees)
// Squad-off and all other campaigns are applied from the admin-managed discount store.
export function computeBookingTotal({ camp, room, adults, children, addonIds = [], addonQuantities = {}, discounts = null }) {
    const pricePerPerson = room?.price || camp?.price || 2499;
    const totalGuests = adults + children;

    const baseTotal = (pricePerPerson * adults) + (Math.round(pricePerPerson * 0.5) * children);
    const discount = applyDiscounts({ baseTotal, guests: totalGuests, campsiteId: camp?.id || null, discounts });
    const discounted = discount.discountedTotal;

    // flat / per_person add-ons are chosen via addonIds; quantity add-ons via addonQuantities.
    const selected = new Set(Array.isArray(addonIds) ? addonIds : []);
    const addonTotal = Object.values(ADDON_CATALOG).reduce((sum, addon) => {
        const type = addonType(addon);
        if (type === 'quantity') {
            return sum + addonCost(addon, { quantity: addonQuantities?.[addon.id] });
        }
        if (!selected.has(addon.id)) return sum;
        return sum + addonCost(addon, { totalGuests });
    }, 0);

    return {
        total: discounted + addonTotal,
        discountPercent: discount.discountPercent,
        discountAmount: discount.discountAmount,
        discountLabel: discount.discountLabel,
        baseTotal,
        pricePerPerson
    };
}

// Total guest capacity across all rooms of a camp (per date batch)
export function campGuestCapacity(camp) {
    if (!camp || !Array.isArray(camp.rooms) || camp.rooms.length === 0) return 40;
    return camp.rooms.reduce((sum, room) => {
        const units = Number(room.totalUnits) > 0 ? Number(room.totalUnits) : 1;
        return sum + (parseRoomCapacity(room.capacity) * units);
    }, 0);
}