// ── MARKETING CMS CONTENT DEFAULT STORE & HELPERS ──
import { BLOG_POSTS } from './blogPosts';

import { DEFAULT_DESTINATION_CONTENT } from './cmsDestinationDefaults';
export { DEFAULT_DESTINATION_CONTENT };

export const DEFAULT_BRAND_STORY = {
    heroBadge: 'STUDENT EXPLORERS & MOUNTAIN CHARTER',
    heroTitle: 'From Kerala Classrooms to Sunrise Cloud Beds',
    heroSubtitle: 'Born from a bunch of students who fell in love with Kerala’s misty mountains, freshwater springs, and 7,900 FT sunrise cloud beds. Built to share real wilderness adventures with everyone at an honest, affordable rate.',
    founderQuote: 'We didn’t start Aanandham in a boardroom. We started it around a crackling campfire with cold hands, hot cardamom tea, and a promise to make Kerala’s misty sunrise cloud beds accessible to everyone.',
    elevationTiers: [
        { altitude: '7,900 FT', location: 'Kolukkumalai Sunrise Ridge', temp: '8°C - 14°C', terrain: 'High Alpine Grassland & Organic Tea Edge' },
        { altitude: '6,600 FT', location: 'Meesapulimala Peak Camp', temp: '10°C - 16°C', terrain: 'Valley of Rhododendrons & Mountain Stream' },
        { altitude: '5,400 FT', location: 'Suryanelli Cloud Bed Glamp', temp: '14°C - 20°C', terrain: 'Overlooking Anaerangal Lake & Cloud Beds' },
        { altitude: '3,800 FT', location: 'Vagamon Pine Valley', temp: '16°C - 22°C', terrain: 'Dense Pine Forest & Natural Water Springs' }
    ]
};

export const DEFAULT_SERVICES_CONTENT = {
    heroBadge: 'EXPEDITION & TECH DIVISION',
    heroTitle: 'Wilderness Adventures & Production Systems',
    heroSubtitle: 'From private cloud-summit convoys and curated campfire dining to enterprise hospitality technology shipped by OpenZen.',
    packages: [
        { category: 'EXPEDITION', title: '4x4 Sunrise Summit Convoy', description: 'Rugged Mahindra 4x4 offroad expedition to Kolukkumalai 7,900 FT with expert tea estate drivers.', priceTag: 'Included in Ridge Passes' },
        { category: 'HOSPITALITY', title: 'Curated Campfire Barbecue & Dining', description: 'Freshly barbecued mountain grill, local Kerala spiced dinner, and hot kettle tea at dawn.', priceTag: 'Included in All Bookings' },
        { category: 'TECHNOLOGY', title: 'OpenPMS Enterprise Operations', description: 'Real-time booking engine, 2-way OTA channel sync, and mobile staff check-in systems.', priceTag: 'Powered by OpenZen' }
    ]
};

export const DEFAULT_HOTLINES_CONTENT = {
    hotlineBadge: '24/7 EXPEDITION HOTLINE',
    whatsappNumber: '+91 90748 58014',
    emergencyNumber: '+91 90748 58014',
    supportEmail: 'concierge@aanandham.in',
    basecampAddress: 'Suryanelli Basecamp, Munnar, Kerala 685618',
    operationalHours: '24/7 All Days Active',
    gpsCoordinates: '10.0270° N, 77.1420° E'
};

export const DEFAULT_SITE_PAGES_CONTENT = {
    about: DEFAULT_BRAND_STORY,
    services: DEFAULT_SERVICES_CONTENT,
    contact: DEFAULT_HOTLINES_CONTENT
};

// In-memory cache for CMS content
let cmsCache = {
    destinations: DEFAULT_DESTINATION_CONTENT,
    sitePages: DEFAULT_SITE_PAGES_CONTENT,
    blogPosts: BLOG_POSTS
};

export function getCmsContent() {
    return cmsCache;
}

export function setCmsContent(newContent) {
    cmsCache = {
        ...cmsCache,
        ...newContent
    };
    return cmsCache;
}
