// ── TESTIMONIALS (CLIENT-SAFE CORE) ──
// Pure logic + localStorage helpers. No Node-only imports — safe for client
// bundles. Server persistence lives in ./testimonials.js (fs-backed store).
// Admin edits testimonials via /api/admin/testimonials; public pages consume
// via GET /api/testimonials.

export const DEFAULT_TESTIMONIALS = [
    {
        id: 't-1',
        quote: "Best decision I made this year. I was burnt out from work and needed a reset – this camp delivered exactly that. The camp staff really know their stuff, the vibe is super chill, and I made friends from all over the country. Experiencing the Kolukkumalai cloud sunrise above 7,900 FT was unforgettable.",
        author: "Daniel Kim",
        campBadge: "camp '25",
        batchDate: "Aanandham, August 2025",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        instagram: "daniel.kim.trails",
        active: true
    },
    {
        id: 't-2',
        quote: "I was nervous about traveling alone as a female solo camper, but this crew made me feel safe and at home immediately. We trekked every morning, explored the peaks, and had the kind of deep conversations around the campfire you remember for life.",
        author: "Emma Rodriguez",
        campBadge: "camp '25",
        batchDate: "Aanandham, March 2025",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        instagram: "emma.roams",
        active: true
    },
    {
        id: 't-3',
        quote: "Unmatched wilderness comfort. We organized a 24-member corporate team offsite at the Suryanelli ridge. Clean private western washrooms, delicious hot barbecue at 12°C, and the 4x4 jeep safari was pure adrenaline. Outstanding organization.",
        author: "Karthik & Tribe",
        campBadge: "camp '25",
        batchDate: "Aanandham, November 2025",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        active: true
    },
    {
        id: 't-4',
        quote: "The heart-shaped lake at Chembra Peak took my breath away. Our trek leader paced the entire group patiently, carried medical kits, and pointed out endemic bird species. The food at basecamp felt just like home-cooked Kerala Sadhya.",
        author: "Dr. Sneha Pillai",
        campBadge: "camp '26",
        batchDate: "Aanandham, January 2026",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
        active: true
    }
];

// Client-side localStorage override (used by the admin UI for instant previews)
const LS_KEY = 'aanandham_admin_testimonials_v2';

export function loadTestimonialsFromStorage() {
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

export function saveTestimonialsToStorage(list) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(list));
    } catch (e) { /* ignore */ }
}

// Active (published) testimonials only
export function getActiveTestimonials(list) {
    return (Array.isArray(list) ? list : DEFAULT_TESTIMONIALS).filter(t => t.active !== false);
}