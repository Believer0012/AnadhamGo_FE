"use client";
import React, { useState, useEffect, useRef } from 'react';

const CONTAINER = { maxWidth: '1440px', margin: '0 auto', width: '100%' };

import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import SiteHeader from '../../components/SiteHeader';
import Footer from '../../components/Footer';
import { useAuth } from '../../hooks/useAuth';
import { inr } from '../../lib/utils';
import { waLink } from '../../lib/whatsapp';
import { Mountain, Compass, Tent, Waves, ShieldCheck, Flame, Leaf, CloudSun, Plus, Minus, Star, Sunrise, Footprints, Telescope, MapPin, MessageCircle, Thermometer, Wind, ScrollText, Truck, PenLine, Hexagon, Heart, Sparkles, Users } from 'lucide-react';
import { InstagramIcon, WhatsAppIcon } from '../../components/common/BrandIcons';

// ── HIGH-PERFORMANCE CLEAN REVEAL VARIANTS (Fast & Silky 60FPS) ──
const sectionReveal = {
    hidden: { opacity: 0, y: 18 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.25, 1, 0.5, 1] }
    }
};

const staggerContainer = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.03
        }
    }
};

const cardReveal = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] }
    }
};

const stickyReveal = {
    hidden: { opacity: 0, y: 18 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.25, 1, 0.5, 1] }
    }
};

// ── 1. ELEVATION TIERS & TERRAIN PROFILE ──
const ELEVATION_TIERS = [
    {
        id: 'tier-7900',
        altitude: '7,900 FT',
        elevationMeters: '2,408 M',
        name: 'Kolukkumalai Sunrise Peak',
        badge: 'SUMMIT PINNACLE · TIGER FACE ROCK',
        badgeColor: '#E5A93B',
        accentColor: '#E5A93B',
        accentBg: 'rgba(229, 169, 59, 0.12)',
        borderTint: 'rgba(229, 169, 59, 0.35)',
        glowColor: 'rgba(229, 169, 59, 0.25)',
        image: '/images/kolukkumalai-sunrise-peak.jpg',
        stoneType: 'Pre-Cambrian Charnockite Granite',
        terrainType: 'Rugged High-Altitude Ridge Crest',
        access: '14 km 4x4 Off-Road Jeep Expedition',
        atmosphere: 'Sea of Clouds · High Cloud Inversion',
        desc: 'World’s highest organic tea estate at 7,900 FT on the Kerala-Tamil Nadu crest. Accessible exclusively via rugged 4x4 Jeep convoys over jagged boulder tracks. Famous for dawn floating above endless cloud beds.',
        temp: '8°C - 14°C',
        wind: '32 km/h Peak Gales',
        icon: Mountain,
        coord: '10.0894° N, 77.2285° E'
    },
    {
        id: 'tier-6800',
        altitude: '6,800 FT',
        elevationMeters: '2,072 M',
        name: 'Phantom Head Cliffline',
        badge: 'SUNSET CREST · 360° VISTA',
        badgeColor: '#FB923C',
        accentColor: '#F97316',
        accentBg: 'rgba(249, 115, 22, 0.12)',
        borderTint: 'rgba(249, 115, 22, 0.35)',
        glowColor: 'rgba(249, 115, 22, 0.25)',
        image: '/images/phantom-head-trekking.jpg',
        stoneType: 'Ironstone & Weathered Basalt',
        terrainType: 'Precipitous Escarpment & Shola',
        access: 'Guided Ridge Trek from Basecamp',
        atmosphere: 'Golden Hour Inversion & Twilight Mist',
        desc: 'A distinct high-altitude monolithic formation overlooking Bison Valley and Suryanelli tea plateau. Offers unobstructed 360° sunset amphitheater and sweeping panoramas of Anayirangal Lake.',
        temp: '11°C - 17°C',
        wind: '22 km/h Sunset Breeze',
        icon: Compass,
        coord: '10.0612° N, 77.1895° E'
    },
    {
        id: 'tier-6500',
        altitude: '6,500 FT',
        elevationMeters: '1,981 M',
        name: 'Aanandham Suryanelli Basecamp',
        badge: 'WEATHER-SEALED SANCTUARY',
        badgeColor: '#D5ED55',
        accentColor: '#D5ED55',
        accentBg: 'rgba(213, 237, 85, 0.12)',
        borderTint: 'rgba(213, 237, 85, 0.35)',
        glowColor: 'rgba(213, 237, 85, 0.22)',
        image: '/images/high-altitude-ridge-tent.jpg',
        stoneType: 'Highland Slate & Tea Loam',
        terrainType: 'Insulated Meadow & Geodesic Ridge',
        access: 'Direct Basecamp Approach',
        atmosphere: 'Bortle Class 2 Zero-Light Sky',
        desc: 'Our private weather-insulated geodesic dome sanctuary positioned directly above the night mist inversion line. Features en-suite hot water washrooms, live acoustic campfire pit, and starlit ridge deck.',
        temp: '13°C - 19°C',
        wind: '16 km/h Valley Draft',
        icon: Tent,
        coord: '10.0521° N, 77.1789° E'
    },
    {
        id: 'tier-5500',
        altitude: '5,500 FT',
        elevationMeters: '1,676 M',
        name: 'Anayirangal Lake Basin',
        badge: 'FRESHWATER RESERVOIR BASIN',
        badgeColor: '#38BDF8',
        accentColor: '#38BDF8',
        accentBg: 'rgba(56, 189, 248, 0.12)',
        borderTint: 'rgba(56, 189, 248, 0.35)',
        glowColor: 'rgba(56, 189, 248, 0.22)',
        image: '/images/anayirangal-elephant-lake.jpg',
        stoneType: 'Fluvial Alluvium & Shola Soil',
        terrainType: 'Lake Basin & Tata Tea Slopes',
        access: 'Shoreline Walk & Scenic Drive',
        atmosphere: 'Evergreen Mist & Pine Forest',
        desc: 'Historic watering oasis where wild mountain elephant herds descend from the high rainforest. Bordered by mist-covered tea plantations, emerald pine groves, and tranquil waters reflecting the Western Ghats.',
        temp: '15°C - 22°C',
        wind: '10 km/h Shoreline Calm',
        icon: Waves,
        coord: '10.0125° N, 77.1560° E'
    }
];

// ── 2. THE 4 PILLARS OF AANANDHAM HOSPITALITY (Vibrant Colored Sticky Notes) ──
const WILDERNESS_PILLARS = [
    {
        id: '01',
        title: '01 — Belong',
        subtitle: 'Feel at home, wherever you are.',
        tag: 'PILLAR · 01',
        stamp: 'FEEL AT HOME',
        stampColor: '#1E3A1E',
        paperBg: '#FEF08A', // Sunlit Canary Yellow
        inkColor: '#1A1D0E',
        tapeColor: 'rgba(234, 179, 8, 0.9)',
        tapeRotation: '-2.5deg',
        rotation: '-1.6deg',
        icon: Heart,
        metric: 'Part of Something',
        desc: 'We create spaces where guests feel welcomed, comfortable and connected—not like visitors, but like part of something.',
        specs: [
            'Welcoming spaces where you are embraced like family',
            'Comfort-first mountain stays with thoughtful details',
            'Safe, inclusive sanctuary for solos, couples & squads'
        ],
        memo: '“You never arrive as just a visitor; you arrive as part of something.”'
    },
    {
        id: '02',
        title: '02 — Experience',
        subtitle: 'Stay for the place. Remember the feeling.',
        tag: 'PILLAR · 02',
        stamp: 'REMEMBER THE FEELING',
        stampColor: '#1A381E',
        paperBg: '#D9F99D', // Electric Mountain Lime
        inkColor: '#0F2414',
        tapeColor: 'rgba(132, 204, 22, 0.9)',
        tapeRotation: '2.4deg',
        rotation: '1.4deg',
        icon: Compass,
        metric: 'Feel the Destination',
        desc: 'From mountain mornings to local flavours and quiet evenings, we focus on experiences that let you genuinely feel the destination.',
        specs: [
            'Golden sunrise cloud beds above the mist line',
            'Authentic local flavours & slow-cooked clay pot meals',
            'Quiet ridge evenings listening to the mountain breeze'
        ],
        memo: '“Stay for the place. Remember the feeling forever.”'
    },
    {
        id: '03',
        title: '03 — Connect',
        subtitle: 'People make places memorable.',
        tag: 'PILLAR · 03',
        stamp: 'SHARED MOMENTS',
        stampColor: '#4A1D08',
        paperBg: '#FED7AA', // Warm Sunburst Amber / Peach
        inkColor: '#2D1406',
        tapeColor: 'rgba(251, 146, 60, 0.9)',
        tapeRotation: '-1.8deg',
        rotation: '-1.2deg',
        icon: Users,
        metric: 'Meaningful Bonds',
        desc: 'Our properties are designed to encourage conversations, shared moments and meaningful connections between travellers, locals and hosts.',
        specs: [
            'Campfire circles designed for spontaneous conversations',
            'Bonds between travellers, native guides & hosts',
            'Laughter and stories shared with people you just met'
        ],
        memo: '“People make places memorable. Strangers become lifelong friends.”'
    },
    {
        id: '04',
        title: '04 — Aanandham',
        subtitle: 'Hospitality that brings happiness.',
        tag: 'PILLAR · 04',
        stamp: 'BRINGS HAPPINESS',
        stampColor: '#0A331E',
        paperBg: '#A7F3D0', // Fresh Alpine Mint
        inkColor: '#062817',
        tapeColor: 'rgba(52, 211, 153, 0.9)',
        tapeRotation: '2.0deg',
        rotation: '1.6deg',
        icon: Sparkles,
        metric: 'Pure Mountain Joy',
        desc: 'At the heart of everything is Aanandham—creating peaceful spaces, joyful moments and stays that leave you feeling a little lighter than when you arrived.',
        specs: [
            'Peaceful off-grid spaces to unplug and recharge',
            'Joyful moments that unfold naturally without rush',
            'Stays that leave you feeling lighter than when you arrived'
        ],
        memo: '“At the heart of everything is Aanandham: hospitality that brings happiness.”'
    }
];

// ── 3. OUR EVOLUTION TIMELINE (2024 — 2026) ──
const TIMELINE_MILESTONES = [
    {
        year: '2024',
        title: 'The Engineering Dorm Spark',
        tag: 'WHERE IT STARTED',
        desc: 'Living the usual college life of classes and deadlines, we asked: Is life really meant to be just about work and waiting for breaks? We packed our rucksacks for the Western Ghats to find a freer way of living.'
    },
    {
        year: '2024',
        title: '4x4 Trail Scouting & The Epiphany',
        tag: 'EXPEDITION FOUNDATION',
        desc: 'Partnered with Suryanelli marshals to map private cloud-inversion ridges. We discovered that the real magic wasn’t just the destination—it was the laughter, shared meals, and bonds formed with strangers.'
    },
    {
        year: '2025',
        title: 'Aanandham First Campsite Launch',
        tag: 'FIRST RIDGE CAMP',
        desc: 'Pitched our flagship weather-insulated dome camps and ridge tents in Suryanelli. Introduced live earthen-pot BBQs, verified mountain marshals, clean en-suite washrooms, and instant digital booking.'
    },
    {
        year: '2026',
        title: 'Kerala’s Premier Wilderness Community',
        tag: 'EXPEDITION ECOSYSTEM',
        desc: 'Expanded into Kerala’s leading mountain travel community with multi-property reservations, automated QR check-ins, OpenZen tech integration, and thousands of travelers discovering Aanandham.'
    }
];

// ── 4. NEARBY LANDMARKS & TRAILS ──
const NEARBY_PLACES = [
    {
        id: 'kolukkumalai',
        title: 'Kolukkumalai Sunrise Peak',
        category: 'High Peaks',
        badge: 'FLAGSHIP 4X4 EXPEDITION',
        badgeColor: '#E5A93B',
        accessType: '4x4 Off-Road Only',
        distance: '14 km from Camp',
        duration: '45 mins Jeep Convoy',
        altitude: '7,900 FT · 2,408 M',
        bestTime: '04:30 AM (Dawn)',
        guideType: 'Tribal Marshal Led',
        image: '/images/kolukkumalai-sunrise-peak.jpg',
        desc: 'World’s highest organic tea estate situated on the razor-edge crest of Kerala and Tamil Nadu. Famous for the Tiger Face Rock formation and surreal dawn cloud inversions.',
        highlight: 'Cloud Bed Sunrise'
    },
    {
        id: 'phantom-head',
        title: 'Phantom Head Cliffline',
        category: 'Trails',
        badge: 'GUIDED SUNSET TREK',
        badgeColor: '#FB923C',
        accessType: 'Guided Ridge Hike',
        distance: '1.2 km from Camp',
        duration: '25 min Ridge Walk',
        altitude: '6,800 FT · 2,072 M',
        bestTime: '05:00 PM (Sunset)',
        guideType: 'Aanandham Guide Led',
        image: '/images/phantom-head-trekking.jpg',
        desc: 'Monolithic granite cliff line shaped like a phantom skull. Features an unobstructed 360° panoramic amphitheater overlooking the Bison Valley, Anayirangal Lake, and Suryanelli tea plateau.',
        highlight: '360° Sunset Vista'
    },
    {
        id: 'anayirangal',
        title: 'Anayirangal Lake Basin',
        category: 'Lakes & Waterfalls',
        badge: 'WILDLIFE CORRIDOR',
        badgeColor: '#38BDF8',
        accessType: 'Shoreline Walk & Drive',
        distance: '6.0 km from Camp',
        duration: '15 min Scenic Drive',
        altitude: '5,500 FT · 1,676 M',
        bestTime: '03:30 PM (Fauna)',
        guideType: 'Self / Guided Walk',
        image: '/images/anayirangal-elephant-lake.jpg',
        desc: 'Translated as "where wild elephants descend to drink", this emerald reservoir is bordered by Tata Tea plantations, misty pine forests, and historic mountain elephant corridors.',
        highlight: 'Wild Elephant Shore'
    },
    {
        id: 'lockhart-gap',
        title: 'Lockhart Gap Valley Vista',
        category: 'High Peaks',
        badge: 'NATURAL VALLEY CHASM',
        badgeColor: '#A7F3D0',
        accessType: 'Mountain Pass Drive',
        distance: '8.5 km on NH-85',
        duration: '20 min Scenic Drive',
        altitude: '6,200 FT · 1,890 M',
        bestTime: '06:30 AM & 05:30 PM',
        guideType: 'Scenic Deck',
        image: '/images/munnar-mist-valley-wide.jpg',
        desc: 'Colossal natural mountain chasm carved between two monolithic granite precipices, creating a natural funnel for mist clouds rolling across the Bison Valley.',
        highlight: 'Granite Valley Gap'
    },
    {
        id: 'chinnakanal',
        title: 'Chinnakanal Spring Waterfalls',
        category: 'Lakes & Waterfalls',
        badge: 'NATURAL SPRING CASCADE',
        badgeColor: '#D5ED55',
        accessType: 'Roadside Trail Walk',
        distance: '5.0 km from Camp',
        duration: '12 min Drive',
        altitude: '5,900 FT · 1,798 M',
        bestTime: '08:00 AM – 04:00 PM',
        guideType: 'Spring Cascade',
        image: '/images/chinnakanal-waterfalls.jpg',
        desc: 'Pure mountain spring water tumbling 800 FT over granite rock shelves, surrounded by wild cardamom plantations, silver oaks, and high-altitude mist.',
        highlight: '800 FT Spring Falls'
    }
];

// ── 5. EXPEDITION CREATORS & MOUNTAIN MARSHALS ──
const TEAM_CREATORS = [
    {
        name: 'Suryanarayanan K.',
        role: 'Founder & Wilderness Architect',
        handle: '@surya.ridge',
        img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=85',
        specialty: 'High-Altitude Navigation & 4x4 Offroading',
        exp: '14+ Years in Western Ghats'
    },
    {
        name: 'Ananya Menon',
        role: 'Lead Expedition Host & Camp Guide',
        handle: '@ananya.wildlife',
        img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
        specialty: 'Camper Care & High-Altitude Safety',
        exp: 'Wilderness Safety Specialist'
    },
    {
        name: 'Muthuvel Pandian',
        role: 'Chief 4x4 Trail Master',
        handle: '@muthuvel.kolukkumalai',
        img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=85',
        specialty: 'Rugged Rock Ascent & Cloud Bed Lead',
        exp: '20+ Years Kolukkumalai Safari'
    }
];

// ── 6. VERIFIED EXPLORER REVIEWS & CHRONICLES ──
const CAMPER_REVIEWS = [
    {
        name: 'Dr. Arvind & Shweta',
        type: 'Couple · Dome Stay',
        rating: 5,
        date: 'Hosted Dec 2025',
        quote: 'Waking up inside the geodesic dome with the morning mist drifting right outside the panoramic window is something we will never forget. The hot showers and campfire BBQ were extraordinary.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    {
        name: 'Karthik Raja',
        type: 'Solo Trekker · Jeep Safari',
        rating: 5,
        date: 'Hosted Jan 2026',
        quote: 'Muthuvel’s 4x4 Jeep driving to Kolukkumalai peak at 4:30 AM is peak adrenaline. You literally watch the sun ignite the clouds from 7,900 FT. 10/10 safety and hospitality.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    {
        name: 'Meera Nambiar & Family',
        type: 'Family of 4 · Private Sanctuary',
        rating: 5,
        date: 'Hosted Jan 2026',
        quote: 'We brought our two kids (8 and 11) for their first real camping trip. Clean washrooms, cozy blankets, zero plastic, and safe trails. The kids didn’t ask for an iPad once!',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    }
];

// ── 7. ABOUT & BASECAMP FAQS ──
const ABOUT_FAQS = [
    {
        num: '01',
        q: 'Where is Aanandham Basecamp located, and how do we reach it?',
        a: 'Aanandham is located in Suryanelli, near Munnar, perched at 6,500 FT along the Western Ghats ridgeline. We provide safe parking for standard vehicles at our Suryanelli base point, from where our dedicated 4x4 Jeeps transport you up to the private sanctuary ridge.'
    },
    {
        num: '02',
        q: 'Is it safe for solo female travelers and families with young children?',
        a: 'Absolutely. We maintain a strict 1:6 guide-to-guest ratio, well-lit perimeter pathways, 24/7 on-site staff, private sanitized washrooms with hot water geysers, and locked thermal insulated domes. Over 40% of our guests are families and solo female explorers.'
    },
    {
        num: '03',
        q: 'What should we pack for the high-altitude weather?',
        a: 'Night temperatures hover between 10°C and 16°C. We provide thermal insulated duvets, but recommend bringing a windproof jacket, comfortable hiking shoes, a woolen cap/beanie, and personal toiletries. We provide towels, soaps, and hot water.'
    },
    {
        num: '04',
        q: 'How does your Leave-No-Trace zero plastic policy work?',
        a: 'We do not permit single-use plastic water bottles or polythene packaging on our ridges. We provide pure mountain spring water in sanitized copper dispensers and reusable flasks. All camp waste is organically composted or transported down for municipal recycling.'
    }
];

export default function AboutPage() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeFaq, setActiveFaq] = useState(0);
    const { user: currentUser, logout: handleLogout } = useAuth();

    const ctaRef = useRef(null);
    const { scrollYProgress: ctaScrollProgress } = useScroll({
        target: ctaRef,
        offset: ["start end", "end start"]
    });
    const ctaBgScale = useTransform(ctaScrollProgress, [0, 0.5, 1], [1.0, 1.16, 1.28]);
    const ctaBgY = useTransform(ctaScrollProgress, [0, 1], ["-6%", "6%"]);

    const filteredPlaces = activeCategory === 'All' 
        ? NEARBY_PLACES 
        : NEARBY_PLACES.filter(p => p.category === activeCategory);

    return (
        <div style={{
            minHeight: '100%',
            backgroundColor: '#F8F9F5',
            color: '#121613',
            fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
            position: 'relative',
            overflowX: 'clip'
        }}>
            {/* ── UNIFIED REUSABLE SITE HEADER ── */}
            <SiteHeader 
                activePage="about" 
                currentUser={currentUser} 
                onLogout={handleLogout}
            />

            <main>
                {/* ─────────────────────────────────────────────────────────────
                    1. HERO SECTION: CINEMATIC ATMOSPHERIC MOUNTAIN HERO
                ───────────────────────────────────────────────────────────── */}
                <section 
                    className="hero-defensive-height"
                    style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        padding: 'clamp(120px, 16vh, 160px) 24px clamp(50px, 8vh, 80px)',
                        backgroundImage: 'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=95")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center 40%',
                        color: '#FFFFFF'
                    }}
                >
                    {/* Radial Obsidian Overlay (Matching Home Hero Lighting) */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(ellipse at center, rgba(14, 24, 17, 0.4) 0%, rgba(11, 21, 14, 0.88) 100%)'
                    }} />

                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 2 }}
                    >
                        {/* Centered Brand Logo */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.88 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7 }}
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: '24px'
                            }}
                        >
                            <img
                                src="/logo.png"
                                alt="Aanandham Logo"
                                className="hero-brand-logo"
                                style={{
                                    height: '92px',
                                    width: 'auto',
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 12px 28px rgba(0, 0, 0, 0.6))'
                                }}
                             loading="lazy" decoding="async"/>
                        </motion.div>

                        {/* Main Headline in Bricolage Grotesque */}
                        <motion.h1 
                            className="hero-headline"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'clamp(42px, 7vw, 84px)',
                                fontWeight: '800',
                                lineHeight: 1.05,
                                letterSpacing: '-0.04em',
                                color: '#FFFFFF',
                                marginBottom: '24px'
                            }}
                        >
                            <span className="text-hover-marker text-hover-marker-dark" style={{ cursor: 'pointer', display: 'inline-block' }}>
                                <span className="marker-text">
                                    Our Story<span style={{ color: '#E5A93B' }}> & Ethos</span>
                                </span>
                            </span>
                            <br />
                            <span style={{ fontSize: '0.65em', fontWeight: '700', color: '#E1E9E2', letterSpacing: '-0.02em' }}>
                                Out of the Textbooks, Into the Wild
                            </span>
                        </motion.h1>

                        {/* Subtitle Description */}
                        <motion.p
                            className="hero-subtitle"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.75, delay: 0.2 }}
                            style={{
                                fontSize: 'clamp(16px, 2vw, 19px)',
                                color: 'rgba(255, 255, 255, 0.88)',
                                lineHeight: 1.65,
                                maxWidth: '800px',
                                margin: '0 auto clamp(24px, 4vh, 40px)'
                            }}
                        >
                            Born from a bunch of students who fell in love with Kerala’s misty mountains, freshwater springs, and 7,900 FT sunrise cloud beds. Built to share real wilderness adventures with everyone at an honest, affordable rate.
                        </motion.p>

                        {/* Quick Action Button Cluster */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '14px'
                            }}
                        >
                            <Link
                                href="/camps"
                                className="btn-lime"
                                style={{
                                    padding: '14px 34px',
                                    fontSize: '15px',
                                    textDecoration: 'none',
                                    boxShadow: '0 10px 30px rgba(213, 237, 85, 0.3)'
                                }}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Tent size={16} /> Explore Our Camps →</span>
                            </Link>

                            <a
                                href="#ethos"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textDecoration: 'none',
                                    background: 'rgba(0, 0, 0, 0.45)',
                                    border: '1px solid rgba(255, 255, 255, 0.4)',
                                    color: '#FFFFFF',
                                    padding: '13px 30px',
                                    borderRadius: '999px',
                                    fontWeight: '600',
                                    fontSize: '15px',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.25s ease'
                                }}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><ScrollText size={15} /> Read Our Story ↓</span>
                            </a>

                            <a
                                href="https://instagram.com/aanandham.go"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hero-instagram-btn"
                            >
                                <InstagramIcon size={16} />
                                <span>@aanandham.go</span>
                            </a>
                        </motion.div>
                    </motion.div>
                </section>

                {/* ── LIVE BASECAMP MARQUEE TICKER ── */}
                <div className="marquee-container" aria-hidden="true" style={{ background: '#0B150E', color: '#FFFFFF' }}>
                    <div className="marquee-track">
                        {[
                            { icon: Star, label: '7,900 FT HIGH-ALTITUDE SUMMIT RIDGE', highlight: true },
                            { icon: Sunrise, label: 'KOLUKKUMALAI SUNRISE 4X4 JEEP EXPEDITIONS' },
                            { icon: Flame, label: 'STARLIT CAMPFIRE & FARM-TO-TABLE DINING' },
                            { icon: Tent, label: 'THERMAL INSULATED PODS & CLEAN SHOWERS', highlight: true },
                            { icon: Footprints, label: 'SECRET PHANTOM HEAD PEAK TRAILS' },
                            { icon: Telescope, label: 'ZERO LIGHT-POLLUTION MILKY WAY STARGAZING', highlight: true },
                            { icon: Leaf, label: '100% LEAVE NO TRACE ECO CHARTER' },
                            { icon: Star, label: '7,900 FT HIGH-ALTITUDE SUMMIT RIDGE', highlight: true },
                            { icon: Sunrise, label: 'KOLUKKUMALAI SUNRISE 4X4 JEEP EXPEDITIONS' }
                        ].map((item, idx) => (
                            <div key={idx} className="marquee-item" style={{ color: item.highlight ? '#E5A93B' : '#FFFFFF' }}>
                                <item.icon size={16} strokeWidth={2.4} />
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                    2. OUT OF THE CLASSROOM: THE EDITORIAL STORY SECTION
                ───────────────────────────────────────────────────────────── */}
                <motion.section 
                    id="ethos" 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={sectionReveal}
                    style={{
                        padding: '110px 24px',
                        background: '#F8F9F5',
                        position: 'relative'
                    }}
                >
                    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                            gap: 'clamp(32px, 4vw, 56px)',
                            alignItems: 'center'
                        }}>
                            {/* Left: Editorial Narrative */}
                            <motion.div 
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.15 }}
                                variants={cardReveal}
                            >
                                <div className="star-badge" style={{ marginBottom: '16px' }}>
                                    <span className="star-icon">★</span> OUR STORY · IT STARTED WITH A FEELING
                                </div>

                                <h2 style={{
                                    fontFamily: 'var(--font-heading), "Bricolage Grotesque", sans-serif',
                                    fontSize: 'clamp(30px, 4.2vw, 48px)',
                                    fontWeight: '800',
                                    lineHeight: 1.15,
                                    letterSpacing: '-0.03em',
                                    color: '#0B150E',
                                    margin: '0 0 22px'
                                }}>
                                    We Were Engineering Students Asking One Question: <span style={{ color: '#E5A93B' }}>Is Life Just About Routines?</span>
                                </h2>

                                <p style={{ fontSize: '15.5px', color: '#59655D', lineHeight: 1.75, marginBottom: '18px' }}>
                                    We were engineering students, living the usual life — classes, deadlines, assignments, and the constant thought of building a career. But somewhere along the way, we started asking ourselves a simple question: <strong style={{ color: '#0B150E' }}>Is life really meant to be just about work, routines, and waiting for the next break?</strong>
                                </p>

                                <p style={{ fontSize: '15.5px', color: '#59655D', lineHeight: 1.75, marginBottom: '22px' }}>
                                    We wanted to experience something different. We wanted to discover new places, get lost on unfamiliar roads, wake up surrounded by mountains, meet new people, and experience the kind of peace that you don’t find in everyday life.
                                </p>

                                {/* The 5 Moments of Human Connection */}
                                <div style={{
                                    background: 'rgba(240, 246, 242, 0.75)',
                                    border: '1px solid rgba(22, 101, 52, 0.12)',
                                    borderRadius: '20px',
                                    padding: '20px 22px',
                                    marginBottom: '24px'
                                }}>
                                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#166534', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Sparkles size={15} style={{ color: '#E5A93B' }} />
                                        And every time we travelled, we noticed something beautiful:
                                    </div>
                                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#0B150E', marginBottom: '14px', fontStyle: 'italic' }}>
                                        “Happiness became easier to find when we were together.”
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                                        {[
                                            { icon: '💬', text: 'A random conversation with a stranger' },
                                            { icon: '🍲', text: 'A shared meal at a new place' },
                                            { icon: '😄', text: 'Laughing with people we’d just met' },
                                            { icon: '⛰️', text: 'Watching the mountains in silence' },
                                            { icon: '📖', text: 'Coming back with stories we never planned to create' }
                                        ].map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#2C3A30', fontWeight: '600', background: '#FFFFFF', padding: '9px 13px', borderRadius: '12px', border: '1px solid rgba(11, 21, 14, 0.06)' }}>
                                                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                                                <span>{item.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <p style={{ fontSize: '15.5px', color: '#59655D', lineHeight: 1.75, marginBottom: '18px' }}>
                                    Those moments made us realize that travel isn’t only about the places we visit. It’s about the people we meet and the happiness we create along the way. That’s where <strong style={{ color: '#0B150E' }}>Aanandham.go</strong> began — a travel community built from our desire to explore, connect, and share that feeling with others.
                                </p>

                                <p style={{ fontSize: '15.5px', color: '#59655D', lineHeight: 1.75, marginBottom: '28px' }}>
                                    The word <span style={{ color: '#166534', fontWeight: '800' }}>Aanandham</span> means <em>happiness</em> — and that’s exactly what we want to bring into people’s lives. We want to connect people through journeys, take them to places that make them feel alive, and create an environment where strangers can become friends, routines can be forgotten, and happiness can come naturally. Whether it’s a mountain escape, a new destination, a spontaneous road trip, or simply sitting around with people you’ve just met — we believe every journey has the potential to create a little more Aanandham.
                                </p>

                                {/* Founder Quote Card with Spring Hover */}
                                <motion.div 
                                    whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                                    transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                                    style={{
                                        background: '#FFFFFF',
                                        border: '1px solid rgba(11, 21, 14, 0.08)',
                                        borderLeft: '4px solid #E5A93B',
                                        borderRadius: '0 20px 20px 0',
                                        padding: '24px 26px',
                                        boxShadow: '0 12px 30px rgba(0,0,0,0.04)',
                                        cursor: 'default',
                                        marginBottom: '16px'
                                    }}
                                >
                                    <p style={{
                                        fontSize: '15px',
                                        fontStyle: 'italic',
                                        color: '#0B150E',
                                        lineHeight: 1.65,
                                        margin: '0 0 14px'
                                    }}>
                                        “We’re not here just to take you places. We’re here to bring people together, create experiences, and make happiness part of the journey. Because we started Aanandham.go for the same reason we started travelling in the first place: We wanted to live a little more freely. And now, we want you to experience that feeling with us.”
                                    </p>
                                    
                                    {/* Brand Credo Ribbon */}
                                    <div style={{
                                        background: 'rgba(229, 169, 59, 0.1)',
                                        borderRadius: '12px',
                                        padding: '10px 14px',
                                        marginBottom: '16px',
                                        border: '1px dashed #E5A93B',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <Heart size={14} style={{ color: '#E5A93B', flexShrink: 0 }} />
                                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#0B150E' }}>
                                            Go somewhere. Meet someone. Feel something. Go with Aanandham.
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E5A93B', color: '#0B150E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '14px' }}>
                                            A
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0B150E' }}>The Aanandham Student Founders & Mountain Marshals</div>
                                            <div style={{ fontSize: '11.5px', color: '#E5A93B' }}>Co-Founders & Community Curators · Aanandham.go</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Right: Bespoke Visual Collage with Real Photography */}
                            <motion.div variants={cardReveal} style={{ position: 'relative' }}>
                                <div style={{
                                    borderRadius: '32px',
                                    overflow: 'hidden',
                                    boxShadow: '0 24px 60px rgba(0,0,0,0.12)',
                                    border: '1px solid rgba(11, 21, 14, 0.08)',
                                    position: 'relative'
                                }}>
                                    <motion.img
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                        src="/images/munnar-mist-valley-wide.jpg"
                                        alt="Aanandham Mountain Camp Story"
                                        style={{ width: '100%', height: '420px', objectFit: 'cover' }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        padding: '24px',
                                        background: 'linear-gradient(to top, rgba(7, 14, 8, 0.92) 0%, transparent 100%)',
                                        pointerEvents: 'none'
                                    }}>
                                        <div style={{ display: 'inline-block', background: '#E5A93B', color: '#070E08', fontSize: '11px', fontWeight: '900', padding: '4px 12px', borderRadius: '999px', marginBottom: '6px' }}>
                                            PRIVATE RIDGE SANCTUARY
                                        </div>
                                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>
                                            Suryanelli Basecamp · Overlooking Anayirangal Valley
                                        </div>
                                    </div>
                                </div>

                                <motion.div 
                                    whileHover={{ y: -6, scale: 1.02 }}
                                    transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                                    style={{
                                        position: 'absolute',
                                        bottom: '-28px',
                                        left: '-24px',
                                        background: '#0B150E',
                                        border: '1.5px solid rgba(213, 237, 85, 0.4)',
                                        borderRadius: '24px',
                                        padding: '18px 24px',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        maxWidth: '320px',
                                        color: '#FFFFFF',
                                        zIndex: 3
                                    }}
                                >
                                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(229, 169, 59, 0.2)', color: '#E5A93B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                                        <CloudSun size={16} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#FFFFFF' }}>
                                            180° Panoramic Cloud Beds
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#A2B6A6' }}>
                                            Sunrise rolling across the misty valley
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>

                {/* ─────────────────────────────────────────────────────────────
                    3. SURYANELLI RIDGE GEOGRAPHY & ELEVATION METER (Staggered Cascade)
                ───────────────────────────────────────────────────────────── */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    variants={sectionReveal}
                    style={{
                        padding: '110px clamp(20px, 4vw, 48px)',
                        background: '#070E08',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        position: 'relative',
                        color: '#FFFFFF'
                    }}
                >
                    <div style={CONTAINER}>
                        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                            <div className="star-badge" style={{ margin: '0 auto 16px' }}>
                                <span className="star-icon">▲</span> RIDGE TOPOGRAPHY
                            </div>
                            <h2 style={{
                                fontFamily: 'var(--font-heading), "Bricolage Grotesque", sans-serif',
                                fontSize: 'clamp(32px, 4.5vw, 50px)',
                                fontWeight: '800',
                                color: '#FFFFFF',
                                letterSpacing: '-0.03em',
                                margin: '0 0 14px'
                            }}>
                                The Suryanelli <span style={{ color: '#E5A93B' }}>Altitude Spectrum</span>
                            </h2>
                            <p style={{ fontSize: '16px', color: '#A2B6A6', maxWidth: '640px', margin: '0 auto' }}>
                                From the emerald tea shorelines of Anayirangal Lake to the rugged 7,900 FT granite summit of Kolukkumalai.
                            </p>
                        </div>

                        {/* Altitude Scale Grid */}
                        <motion.div 
                            variants={staggerContainer}
                            className="altitude-spectrum-grid"
                        >
                            {ELEVATION_TIERS.map((tier, idx) => (
                                <motion.div
                                    key={tier.id || idx}
                                    variants={cardReveal}
                                    className={`stone-slab-card stone-slab-tier-${idx + 1}`}
                                    whileHover={{ y: -8 }}
                                    transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                                >
                                    {/* Dark outer bark ring edge — like the outer ring of a tree cross section */}
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'transparent',
                                        boxShadow: 'inset 0 0 0 10px rgba(60, 28, 8, 0.55), inset 0 0 0 14px rgba(40, 18, 5, 0.25)',
                                        pointerEvents: 'none',
                                        zIndex: 3
                                    }} />

                                    {/* Pure Natural Tree Bark & Timber Grain Overlay */}
                                    <div className="stone-cleavage-overlay" />

                                    {/* Metal nail pins — top-left and top-right corners */}
                                    <div style={{
                                        position: 'absolute', top: '14px', left: '14px', zIndex: 10,
                                        width: '12px', height: '12px', borderRadius: '50%',
                                        background: 'radial-gradient(circle at 35% 35%, #D4C8A8, #8A7A5A 55%, #4A3C28 100%)',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,240,200,0.4)',
                                        border: '1px solid rgba(60,40,15,0.8)'
                                    }} />
                                    <div style={{
                                        position: 'absolute', top: '14px', right: '14px', zIndex: 10,
                                        width: '12px', height: '12px', borderRadius: '50%',
                                        background: 'radial-gradient(circle at 35% 35%, #D4C8A8, #8A7A5A 55%, #4A3C28 100%)',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,240,200,0.4)',
                                        border: '1px solid rgba(60,40,15,0.8)'
                                    }} />
                                    {/* Bottom nails */}
                                    <div style={{
                                        position: 'absolute', bottom: '14px', left: '14px', zIndex: 10,
                                        width: '10px', height: '10px', borderRadius: '50%',
                                        background: 'radial-gradient(circle at 35% 35%, #C8BC9A, #807058 55%, #402E18 100%)',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,240,200,0.3)',
                                        border: '1px solid rgba(60,40,15,0.7)'
                                    }} />
                                    <div style={{
                                        position: 'absolute', bottom: '14px', right: '14px', zIndex: 10,
                                        width: '10px', height: '10px', borderRadius: '50%',
                                        background: 'radial-gradient(circle at 35% 35%, #C8BC9A, #807058 55%, #402E18 100%)',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,240,200,0.3)',
                                        border: '1px solid rgba(60,40,15,0.7)'
                                    }} />

                                    {/* Altitude Header & Stone Icon Pill */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', position: 'relative', zIndex: 2 }}>
                                        <div>
                                            <div className="stone-engraved-num" style={{
                                                fontSize: 'clamp(28px, 3.2vw, 36px)',
                                                color: '#2C1608'
                                            }}>
                                                {tier.altitude}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#5C3A1E', fontWeight: '700', letterSpacing: '0.8px', marginTop: '4px' }}>
                                                {tier.elevationMeters} · AMSL
                                            </div>
                                        </div>

                                        {/* Natural wood icon pill */}
                                        <div className="stone-icon-pill">
                                            <tier.icon size={16} color="#5C3A1E" />
                                        </div>
                                    </div>

                                    {/* Recessed Inscribed Stone Photo Window */}
                                    <div className="stone-photo-thumb">
                                        <img 
                                            src={tier.image} 
                                            alt={tier.name} 
                                            loading="lazy"
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, transparent 60%)'
                                        }} />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '8px',
                                            left: '8px',
                                            right: '8px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{
                                                background: 'rgba(0, 0, 0, 0.85)',
                                                color: '#FFFFFF',
                                                fontSize: '9.5px',
                                                fontWeight: '700',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                letterSpacing: '0.5px'
                                            }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><MapPin size={10} /> {tier.coord}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Badge & Title */}
                                    <div style={{ position: 'relative', zIndex: 2 }}>
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: tier.accentBg,
                                            border: `1px solid ${tier.borderTint}`,
                                            borderRadius: '6px',
                                            padding: '3px 9px',
                                            fontSize: '10px',
                                            fontWeight: '800',
                                            color: tier.badgeColor,
                                            letterSpacing: '0.8px',
                                            textTransform: 'uppercase',
                                            marginBottom: '10px'
                                        }}>
                                            <span>▲</span>
                                            <span>{tier.badge}</span>
                                        </div>

                                        <h3 style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '18px',
                                            fontWeight: '800',
                                            color: '#2C1608',
                                            margin: '0 0 10px',
                                            lineHeight: 1.3
                                        }}>
                                            {tier.name}
                                        </h3>

                                        <p style={{ fontSize: '12.8px', color: '#3E2210', lineHeight: 1.65, margin: '0 0 16px' }}>
                                            {tier.desc}
                                        </p>

                                        {/* Micro-Spec Chips */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
                                            <div className="stone-spec-chip">
                                                <span style={{ color: tier.accentColor, display: 'inline-flex' }}><Compass size={14} /></span>
                                                <span>{tier.terrainType}</span>
                                            </div>
                                            <div className="stone-spec-chip">
                                                <span style={{ color: tier.accentColor, display: 'inline-flex' }}><Truck size={14} /></span>
                                                <span>{tier.access}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Weather & Barometer Footer */}
                                    <div style={{
                                        marginTop: 'auto',
                                        paddingTop: '14px',
                                        borderTop: '1px solid rgba(80, 40, 10, 0.25)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        fontSize: '11.5px',
                                        color: '#5A3218',
                                        position: 'relative',
                                        zIndex: 2
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Thermometer size={13} />
                                            <strong style={{ color: '#2C1608' }}>{tier.temp}</strong>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Wind size={13} />
                                            <span style={{ color: '#5A3218', fontWeight: '700' }}>{tier.wind}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.section>

                {/* ─────────────────────────────────────────────────────────────
                    4. THE 4 UNCOMPROMISING WILDERNESS PILLARS (Vibrant Colored Sticky Notes with Spring Physics)
                ───────────────────────────────────────────────────────────── */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.05 }}
                    variants={sectionReveal}
                    style={{
                        padding: '120px 24px 140px',
                        background: '#0B150E',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Atmospheric Ridge Glow & Mist Backlight */}
                    <div style={{
                        position: 'absolute',
                        top: '15%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '1000px',
                        height: '450px',
                        background: 'radial-gradient(circle, rgba(229, 169, 59, 0.14) 0%, rgba(213, 237, 85, 0.08) 45%, transparent 70%)',
                        pointerEvents: 'none',
                        filter: 'blur(80px)'
                    }} />

                    <div style={{ width: '100%', maxWidth: 'min(100%, 1340px)', margin: '0 auto', position: 'relative', zIndex: 2, boxSizing: 'border-box' }}>
                        
                        <div style={{ textAlign: 'center', marginBottom: '74px' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'rgba(229, 169, 59, 0.18)',
                                border: '1.5px solid #E5A93B',
                                color: '#E5A93B',
                                padding: '8px 22px',
                                borderRadius: '999px',
                                fontSize: '12.5px',
                                fontWeight: '900',
                                letterSpacing: '1.2px',
                                textTransform: 'uppercase',
                                boxShadow: '0 0 24px rgba(229, 169, 59, 0.3)',
                                marginBottom: '16px'
                            }}>
                                <span style={{ color: '#E5A93B', fontSize: '15px' }}>★</span> CORE HOSPITALITY ETHOS
                            </div>

                            <h2 style={{
                                fontFamily: 'var(--font-heading), "Bricolage Grotesque", sans-serif',
                                fontSize: 'clamp(34px, 4.8vw, 54px)',
                                fontWeight: '800',
                                color: '#FFFFFF',
                                letterSpacing: '-0.03em',
                                margin: '0 0 14px'
                            }}>
                                The 4 Pillars of <span style={{ color: '#E5A93B' }}>Aanandham Hospitality</span>
                            </h2>
                            <p style={{ fontSize: '16.5px', color: '#A2B6A6', maxWidth: '680px', margin: '0 auto' }}>
                                Welcoming spaces, unforgettable memories, meaningful human connections, and pure happiness written into every stay.
                            </p>
                        </div>

                        {/* 4 Vibrant Colored Sticky Notes Grid with Staggered Cascading Reveal (4 in a Row Centered) */}
                        <motion.div 
                            variants={staggerContainer}
                            className="pillars-sticky-grid"
                            style={{
                                paddingTop: '20px'
                            }}
                        >
                            {WILDERNESS_PILLARS.map((pillar, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={stickyReveal}
                                    whileHover={{
                                        y: -10,
                                        scale: 1.02,
                                        boxShadow: '0 30px 70px -10px rgba(0, 0, 0, 0.55), 0 16px 30px -6px rgba(0, 0, 0, 0.3)'
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                                    style={{
                                        position: 'relative',
                                        background: pillar.paperBg,
                                        color: pillar.inkColor,
                                        borderRadius: '24px',
                                        padding: '40px 32px 32px',
                                        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.38), 0 6px 16px rgba(0,0,0,0.18)',
                                        border: '1.5px solid rgba(0, 0, 0, 0.08)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    {/* Textured Washi Tape Strip with Brass Pin on Top */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '-12px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: '130px',
                                            height: '24px',
                                            background: pillar.tapeColor,
                                            borderRadius: '4px',
                                            backdropFilter: 'blur(8px)',
                                            WebkitBackdropFilter: 'blur(8px)',
                                            boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
                                            borderLeft: '3px dashed rgba(0,0,0,0.2)',
                                            borderRight: '3px dashed rgba(0,0,0,0.2)',
                                            opacity: 0.95,
                                            zIndex: 4,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <div style={{
                                            width: '7px',
                                            height: '7px',
                                            borderRadius: '50%',
                                            background: '#FFFFFF',
                                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.4)',
                                            border: '1.5px solid #E5A93B'
                                        }} />
                                    </div>

                                    {/* Header Row: Dispatch Badge + Mini Logo + Metric Pill + Vintage Ink Stamp */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                            <img
                                                src="/logo.png"
                                                alt="Aanandham Logo"
                                                style={{
                                                    height: '26px',
                                                    width: '26px',
                                                    objectFit: 'contain',
                                                    borderRadius: '50%',
                                                    border: '1px solid rgba(0,0,0,0.15)'
                                                }}
                                             loading="lazy" decoding="async"/>
                                            <span style={{
                                                fontSize: '11px',
                                                fontWeight: '900',
                                                letterSpacing: '1.2px',
                                                textTransform: 'uppercase',
                                                background: 'rgba(0,0,0,0.08)',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                border: '1px solid rgba(0,0,0,0.06)'
                                            }}>
                                                {pillar.tag}
                                            </span>

                                            <span style={{
                                                fontSize: '11px',
                                                fontWeight: '800',
                                                background: 'rgba(0,0,0,0.06)',
                                                padding: '4px 10px',
                                                borderRadius: '999px',
                                                color: pillar.stampColor
                                            }}>
                                                ★ {pillar.metric}
                                            </span>
                                        </div>

                                        {/* Vintage Double-Bordered Ink Stamp with Pop on Hover */}
                                        <motion.div
                                            whileHover={{ rotate: 0, scale: 1.1 }}
                                            transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                                            style={{
                                                border: `2px solid ${pillar.stampColor}`,
                                                outline: `1px dashed ${pillar.stampColor}`,
                                                outlineOffset: '2px',
                                                color: pillar.stampColor,
                                                padding: '4px 9px',
                                                borderRadius: '4px',
                                                fontSize: '9.5px',
                                                fontWeight: '900',
                                                letterSpacing: '0.9px',
                                                textTransform: 'uppercase',
                                                transform: 'rotate(-4deg)',
                                                opacity: 0.95,
                                                userSelect: 'none',
                                                background: 'rgba(255,255,255,0.45)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {pillar.stamp}
                                        </motion.div>
                                    </div>

                                    {/* Icon & Bold Headline */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '16px',
                                            background: 'rgba(0, 0, 0, 0.08)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '22px',
                                            color: pillar.inkColor,
                                            flexShrink: 0,
                                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                                        }}>
                                            <pillar.icon size={22} color={pillar.inkColor} />
                                        </div>
                                        <div>
                                            <h3 style={{
                                                fontFamily: 'var(--font-heading), "Bricolage Grotesque", sans-serif',
                                                fontSize: '23px',
                                                fontWeight: '800',
                                                lineHeight: 1.2,
                                                margin: 0,
                                                color: pillar.inkColor,
                                                letterSpacing: '-0.02em'
                                            }}>
                                                {pillar.title}
                                            </h3>
                                            {pillar.subtitle && (
                                                <div style={{
                                                    fontSize: '13px',
                                                    fontWeight: '700',
                                                    color: pillar.stampColor,
                                                    marginTop: '4px',
                                                    lineHeight: 1.35
                                                }}>
                                                    {pillar.subtitle}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p style={{
                                        fontSize: '14.5px',
                                        lineHeight: 1.7,
                                        margin: '0 0 20px',
                                        opacity: 0.94,
                                        fontWeight: '500'
                                    }}>
                                        {pillar.desc}
                                    </p>

                                    {/* Tactical Checklist Badges */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '22px' }}>
                                        {pillar.specs.map((chk, cIdx) => (
                                            <div key={cIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', fontWeight: '700', opacity: 0.92 }}>
                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '50%',
                                                    background: 'rgba(0,0,0,0.08)',
                                                    color: pillar.stampColor,
                                                    fontSize: '11px',
                                                    fontWeight: '900',
                                                    flexShrink: 0
                                                }}>
                                                    ✓
                                                </span>
                                                <span>{chk}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Field Quote with Signature */}
                                    <div style={{
                                        marginTop: 'auto',
                                        paddingTop: '18px',
                                        borderTop: '1px dashed rgba(0, 0, 0, 0.18)',
                                        fontStyle: 'italic',
                                        fontSize: '13px',
                                        lineHeight: '1.6',
                                        opacity: '0.9',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '8px'
                                    }}>
                                        <span style={{ fontSize: '15px', display: 'inline-flex' }}><PenLine size={14} /></span>
                                        <span>{pillar.memo}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.section>

                {/* ─────────────────────────────────────────────────────────────
                    5. OUR JOURNEY — Ancient Stone Tablet Chronicles
                ───────────────────────────────────────────────────────────── */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.05 }}
                    variants={sectionReveal}
                    style={{
                        padding: '110px clamp(20px, 4vw, 48px)',
                        background: 'linear-gradient(175deg, #1A1410 0%, #0E0C0A 50%, #141008 100%)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Stone dust texture background overlay */}
                    <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        backgroundImage: `
                            radial-gradient(ellipse at 20% 30%, rgba(180, 140, 80, 0.06) 0%, transparent 55%),
                            radial-gradient(ellipse at 80% 70%, rgba(120, 90, 50, 0.07) 0%, transparent 50%),
                            repeating-linear-gradient(45deg, transparent 0px, transparent 18px, rgba(255,255,255,0.012) 18px, rgba(255,255,255,0.012) 19px)
                        `
                    }} />

                    <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
                        {/* Section Header */}
                        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: 'rgba(180, 140, 70, 0.12)',
                                border: '1px solid rgba(180, 140, 70, 0.3)',
                                borderRadius: '999px', padding: '5px 16px',
                                fontSize: '11px', fontWeight: '800',
                                color: '#C8A855', letterSpacing: '1.2px', textTransform: 'uppercase',
                                marginBottom: '18px'
                            }}>
                                <span style={{ display: 'inline-flex' }}><Hexagon size={13} /></span> CHRONICLES INSCRIBED IN STONE
                            </div>
                            <h2 style={{
                                fontFamily: 'var(--font-heading), "Bricolage Grotesque", sans-serif',
                                fontSize: 'clamp(30px, 4.2vw, 48px)',
                                fontWeight: '800',
                                color: '#F5E8C8',
                                letterSpacing: '-0.03em',
                                margin: '0 0 14px',
                                textShadow: '0 2px 20px rgba(180, 130, 50, 0.25)'
                            }}>
                                From A Solitary Ridge Tent to{' '}
                                <span style={{
                                    color: '#D4A845',
                                    textShadow: '0 0 30px rgba(212, 168, 69, 0.4)'
                                }}>Kerala's Premier Basecamp</span>
                            </h2>
                            <p style={{ fontSize: '15.5px', color: '#8A7A62', maxWidth: '580px', margin: '0 auto', lineHeight: 1.65 }}>
                                Our authentic evolution — carved in stone, from the spark of an idea in 2024 to Kerala&apos;s premier wilderness platform.
                            </p>
                        </div>

                        {/* Ancient Stone Tablet Grid */}
                        <motion.div 
                            variants={staggerContainer}
                            className="stone-tablets-grid"
                        >
                            {TIMELINE_MILESTONES.map((mile, mIdx) => {
                                const stoneConfigs = [
                                    {
                                        // Limestone — warm beige-grey
                                        base: '#AEA898',
                                        mottle: `
                                            radial-gradient(ellipse 75% 55% at 25% 35%, rgba(135,128,115,0.7) 0%, transparent 70%),
                                            radial-gradient(ellipse 50% 70% at 75% 65%, rgba(170,162,148,0.55) 0%, transparent 65%),
                                            radial-gradient(ellipse 40% 35% at 55% 15%, rgba(195,188,172,0.45) 0%, transparent 55%),
                                            radial-gradient(ellipse 35% 40% at 85% 30%, rgba(120,114,100,0.4) 0%, transparent 50%),
                                            radial-gradient(ellipse 60% 30% at 15% 80%, rgba(188,180,165,0.5) 0%, transparent 60%)
                                        `,
                                        tag: '#4E3E28', year: '#302418', title: '#221A10', body: '#504030',
                                        rule: 'rgba(60,48,30,0.35)', footer: 'rgba(60,48,30,0.45)'
                                    },
                                    {
                                        // Dark slate grey
                                        base: '#8E8878',
                                        mottle: `
                                            radial-gradient(ellipse 65% 60% at 60% 40%, rgba(108,102,90,0.65) 0%, transparent 68%),
                                            radial-gradient(ellipse 45% 55% at 20% 70%, rgba(145,138,124,0.5) 0%, transparent 62%),
                                            radial-gradient(ellipse 55% 35% at 80% 20%, rgba(165,158,144,0.4) 0%, transparent 55%),
                                            radial-gradient(ellipse 30% 45% at 40% 85%, rgba(95,90,78,0.45) 0%, transparent 50%),
                                            radial-gradient(ellipse 70% 25% at 50% 10%, rgba(175,168,155,0.35) 0%, transparent 55%)
                                        `,
                                        tag: '#3A2E1C', year: '#241A0E', title: '#180E08', body: '#443828',
                                        rule: 'rgba(45,35,20,0.35)', footer: 'rgba(45,35,20,0.45)'
                                    },
                                    {
                                        // Sandstone — warmer tan-grey
                                        base: '#B8AC98',
                                        mottle: `
                                            radial-gradient(ellipse 80% 45% at 40% 55%, rgba(148,140,124,0.6) 0%, transparent 65%),
                                            radial-gradient(ellipse 40% 60% at 80% 30%, rgba(185,178,162,0.5) 0%, transparent 60%),
                                            radial-gradient(ellipse 55% 40% at 15% 25%, rgba(200,192,176,0.45) 0%, transparent 55%),
                                            radial-gradient(ellipse 45% 35% at 65% 80%, rgba(128,120,106,0.4) 0%, transparent 52%),
                                            radial-gradient(ellipse 35% 50% at 90% 70%, rgba(172,164,150,0.45) 0%, transparent 55%)
                                        `,
                                        tag: '#524030', year: '#382A1A', title: '#281E10', body: '#564434',
                                        rule: 'rgba(68,52,35,0.38)', footer: 'rgba(68,52,35,0.48)'
                                    },
                                    {
                                        // River stone — cool grey
                                        base: '#98948A',
                                        mottle: `
                                            radial-gradient(ellipse 70% 50% at 35% 60%, rgba(118,114,106,0.62) 0%, transparent 66%),
                                            radial-gradient(ellipse 50% 65% at 72% 25%, rgba(155,150,140,0.5) 0%, transparent 63%),
                                            radial-gradient(ellipse 60% 38% at 20% 15%, rgba(178,172,162,0.42) 0%, transparent 55%),
                                            radial-gradient(ellipse 38% 42% at 88% 75%, rgba(105,100,92,0.45) 0%, transparent 52%),
                                            radial-gradient(ellipse 65% 28% at 55% 90%, rgba(165,160,150,0.4) 0%, transparent 58%)
                                        `,
                                        tag: '#3C3022', year: '#281E12', title: '#1C120A', body: '#483C2C',
                                        rule: 'rgba(50,40,25,0.32)', footer: 'rgba(50,40,25,0.42)'
                                    }
                                ];

                                const s = stoneConfigs[mIdx % 4];

                                return (
                                    <motion.div
                                        key={mIdx}
                                        variants={cardReveal}
                                        whileHover={{ y: -8 }}
                                        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                                        style={{
                                            position: 'relative',
                                            transform: 'none',
                                            filter: 'drop-shadow(0 18px 40px rgba(0,0,0,0.65)) drop-shadow(0 4px 10px rgba(0,0,0,0.4))',
                                            cursor: 'default'
                                        }}
                                    >
                                        {/* Stone Slab — clean rounded luxury tablet */}
                                        <div style={{
                                            backgroundColor: s.base,
                                            backgroundImage: s.mottle,
                                            borderRadius: '24px',
                                            border: '1.5px solid rgba(180, 140, 70, 0.35)',
                                            padding: '36px 26px 32px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            minHeight: '330px',
                                            height: '100%',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            boxSizing: 'border-box'
                                        }}>


                                            {/* Engraved top rule */}
                                            <div style={{
                                                height: '2px',
                                                background: `linear-gradient(90deg, transparent, ${s.rule}, ${s.rule}, transparent)`,
                                                marginBottom: '20px',
                                                borderRadius: '1px'
                                            }} />

                                            {/* Tag — chiseled into stone */}
                                            <div style={{
                                                fontSize: '10px', fontWeight: '800', letterSpacing: '2px',
                                                color: s.tag, textTransform: 'uppercase',
                                                marginBottom: '10px', fontFamily: 'var(--font-heading)',
                                                position: 'relative', zIndex: 1
                                            }}>
                                                ◈ {mile.tag}
                                            </div>

                                            {/* Carved Year — deep engraving into stone */}
                                            <div style={{
                                                fontFamily: 'var(--font-heading), "Bricolage Grotesque", sans-serif',
                                                fontSize: '58px', fontWeight: '900',
                                                letterSpacing: '-0.04em', lineHeight: 1,
                                                color: s.year,
                                                textShadow: `0 1px 0 rgba(255,255,240,0.4), 0 -1px 1px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.2)`,
                                                marginBottom: '14px', position: 'relative', zIndex: 1
                                            }}>
                                                {mile.year}
                                            </div>

                                            {/* Carved divider groove */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', position: 'relative', zIndex: 1 }}>
                                                <div style={{ flex: 1, height: '1px', background: s.rule }} />
                                                <div style={{ fontSize: '8px', color: s.rule, letterSpacing: '3px' }}>✦✦✦</div>
                                                <div style={{ flex: 1, height: '1px', background: s.rule }} />
                                            </div>

                                            {/* Title — inscribed into stone face */}
                                            <h3 style={{
                                                fontFamily: 'var(--font-heading)',
                                                fontSize: '16.5px', fontWeight: '800',
                                                color: s.title, margin: '0 0 11px',
                                                lineHeight: 1.28, letterSpacing: '-0.01em',
                                                position: 'relative', zIndex: 1
                                            }}>
                                                {mile.title}
                                            </h3>

                                            {/* Description — etched smaller */}
                                            <p style={{
                                                fontSize: '12.5px', color: s.body,
                                                lineHeight: 1.68, margin: '0 0 auto',
                                                flexGrow: 1, position: 'relative', zIndex: 1
                                            }}>
                                                {mile.desc}
                                            </p>

                                            {/* Bottom engraved rule */}
                                            <div style={{
                                                height: '1px',
                                                background: `linear-gradient(90deg, transparent, ${s.rule}, transparent)`,
                                                marginTop: '20px'
                                            }} />

                                            {/* Stone era stamp */}
                                            <div style={{
                                                marginTop: '10px', fontSize: '9px',
                                                color: s.footer, letterSpacing: '1.5px',
                                                fontWeight: '700', textTransform: 'uppercase',
                                                textAlign: 'right', position: 'relative', zIndex: 1
                                            }}>
                                                AANANDHAM · ANNO {mile.year}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}

                        </motion.div>
                    </div>
                </motion.section>


                {/* ─────────────────────────────────────────────────────────────
                    6. SURROUNDING LANDMARKS & HIGH PEAKS (Category Tabs & Staggered Reveal)
                ───────────────────────────────────────────────────────────── */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    variants={sectionReveal}
                    style={{
                        padding: '110px clamp(20px, 4vw, 48px)',
                        background: '#0B150E',
                        position: 'relative',
                        color: '#FFFFFF'
                    }}
                >
                    <div style={CONTAINER}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                            flexWrap: 'wrap',
                            gap: '24px',
                            marginBottom: '52px'
                        }}>
                            <div>
                                <div className="star-badge" style={{ marginBottom: '14px' }}>
                                    <span className="star-icon">★</span> EXPEDITION CORRIDORS
                                </div>
                                <h2 style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: 'clamp(30px, 4.5vw, 48px)',
                                    fontWeight: '800',
                                    color: '#FFFFFF',
                                    margin: 0
                                }}>
                                    High Ridges & Landmarks Around Us
                                </h2>
                            </div>

                            {/* Filter Tabs (Touch Scrollable on Mobile) */}
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                background: '#121F14',
                                padding: '6px',
                                borderRadius: '999px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                                overflowX: 'auto',
                                maxWidth: '100%',
                                scrollbarWidth: 'none'
                            }}>
                                {['All', 'High Peaks', 'Trails', 'Lakes & Waterfalls'].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        style={{
                                            padding: '8px 18px',
                                            borderRadius: '999px',
                                            border: 'none',
                                            background: activeCategory === cat ? '#E5A93B' : 'transparent',
                                            color: activeCategory === cat ? '#0B150E' : 'rgba(255,255,255,0.7)',
                                            fontSize: '13px',
                                            fontWeight: activeCategory === cat ? '800' : '600',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            flexShrink: 0,
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Landmarks Cards Grid with Clean Engineered Specs */}
                        <motion.div 
                            variants={staggerContainer}
                            className="about-landmarks-grid"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
                                gap: '24px'
                            }}
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredPlaces.map((place) => (
                                    <motion.div
                                        key={place.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.94 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.94 }}
                                        transition={{ duration: 0.35 }}
                                        whileHover={{ y: -6 }}
                                        style={{
                                            background: '#0F1A12',
                                            borderRadius: '24px',
                                            overflow: 'hidden',
                                            border: '1px solid rgba(255, 255, 255, 0.09)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            boxShadow: '0 16px 36px rgba(0,0,0,0.35)'
                                        }}
                                    >
                                        {/* Image Container */}
                                        <div style={{ position: 'relative', height: '210px', width: '100%', overflow: 'hidden' }}>
                                            <img
                                                src={place.image}
                                                alt={place.title}
                                                loading="lazy"
                                                decoding="async"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            <div style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: 'linear-gradient(to top, #0F1A12 0%, transparent 60%)'
                                            }} />
                                            
                                            {/* Badge on Top Left */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '14px',
                                                left: '14px',
                                                background: 'rgba(15, 26, 18, 0.85)',
                                                backdropFilter: 'blur(10px)',
                                                border: `1px solid ${place.badgeColor || '#E5A93B'}`,
                                                color: place.badgeColor || '#E5A93B',
                                                fontSize: '10.5px',
                                                fontWeight: '800',
                                                padding: '4px 10px',
                                                borderRadius: '999px',
                                                letterSpacing: '0.6px',
                                                textTransform: 'uppercase'
                                            }}>
                                                ✦ {place.badge}
                                            </div>

                                            {/* Altitude on Top Right */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '14px',
                                                right: '14px',
                                                background: 'rgba(0, 0, 0, 0.85)',
                                                backdropFilter: 'blur(8px)',
                                                color: '#FFFFFF',
                                                fontSize: '11px',
                                                fontWeight: '800',
                                                padding: '4px 10px',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255, 255, 255, 0.15)'
                                            }}>
                                                {place.altitude}
                                            </div>
                                        </div>

                                        {/* Clean Structured Content */}
                                        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                            {/* Title */}
                                            <h3 style={{
                                                fontFamily: 'var(--font-heading)',
                                                fontSize: '21px',
                                                fontWeight: '800',
                                                color: '#FFFFFF',
                                                margin: '0 0 10px',
                                                lineHeight: 1.25
                                            }}>
                                                {place.title}
                                            </h3>

                                            {/* Structured 2x2 Specs Grid (Engineered Details) */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: '8px',
                                                background: 'rgba(255, 255, 255, 0.04)',
                                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                                borderRadius: '12px',
                                                padding: '10px 12px',
                                                marginBottom: '14px'
                                            }}>
                                                <div>
                                                    <div style={{ fontSize: '9.5px', color: '#7D8880', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Access Mode</div>
                                                    <div style={{ fontSize: '11.5px', color: '#E5A93B', fontWeight: '800', marginTop: '1px' }}>{place.accessType}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '9.5px', color: '#7D8880', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Duration / Dist.</div>
                                                    <div style={{ fontSize: '11.5px', color: '#FFFFFF', fontWeight: '700', marginTop: '1px' }}>{place.duration}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '9.5px', color: '#7D8880', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Prime Window</div>
                                                    <div style={{ fontSize: '11.5px', color: '#D5ED55', fontWeight: '700', marginTop: '1px' }}>{place.bestTime}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '9.5px', color: '#7D8880', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Guide Protocol</div>
                                                    <div style={{ fontSize: '11.5px', color: '#FFFFFF', fontWeight: '700', marginTop: '1px' }}>{place.guideType}</div>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p style={{ fontSize: '13px', color: '#A2B6A6', lineHeight: 1.55, margin: '0 0 18px', flex: 1 }}>
                                                {place.desc}
                                            </p>

                                            {/* Inquire Button */}
                                            <a
                                                href={waLink(`Hi Aanandham Concierge! I want to inquire about the ${place.title} (${place.badge}) itinerary and permits.`)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    padding: '11px 18px',
                                                    fontSize: '13px',
                                                    fontWeight: '800',
                                                    borderRadius: '12px',
                                                    background: 'rgba(229, 169, 59, 0.15)',
                                                    border: '1px solid rgba(229, 169, 59, 0.35)',
                                                    color: '#E5A93B',
                                                    textDecoration: 'none',
                                                    transition: 'all 0.2s ease',
                                                    marginTop: 'auto'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#E5A93B';
                                                    e.currentTarget.style.color = '#121613';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(229, 169, 59, 0.15)';
                                                    e.currentTarget.style.color = '#E5A93B';
                                                }}
                                            >
                                                <WhatsAppIcon size={15} />
                                                <span>Inquire Corridor Route →</span>
                                            </a>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </motion.section>

                {/* ─────────────────────────────────────────────────────────────
                    7. THE CREATORS & MOUNTAIN MARSHALS (Photo-First Portrait Showcase)
                ───────────────────────────────────────────────────────────── */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    variants={sectionReveal}
                    style={{
                        padding: '120px clamp(20px, 4vw, 48px)',
                        background: '#F8F9F5',
                        position: 'relative'
                    }}
                >
                    <div style={CONTAINER}>
                        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                            <div className="star-badge" style={{ margin: '0 auto 16px' }}>
                                <span className="star-icon">★</span> EXPEDITION CREATORS
                            </div>
                            <h2 style={{
                                fontFamily: 'var(--font-heading), "Bricolage Grotesque", sans-serif',
                                fontSize: 'clamp(34px, 4.8vw, 54px)',
                                fontWeight: '800',
                                color: '#0B150E',
                                letterSpacing: '-0.03em',
                                margin: '0 0 14px'
                            }}>
                                The Creators & <span style={{ color: '#E5A93B' }}>Mountain Guides</span>
                            </h2>
                            <p style={{ fontSize: '16px', color: '#59655D', maxWidth: '640px', margin: '0 auto' }}>
                                The wilderness architects, expedition leads, and local ridge masters who live here and craft your Aanandham mountain journeys.
                            </p>
                        </div>

                        {/* Large Photo-First Portrait Cards */}
                        <motion.div 
                            variants={staggerContainer}
                            className="about-team-grid"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))',
                                gap: '28px'
                            }}
                        >
                            {TEAM_CREATORS.map((member, i) => (
                                <motion.div
                                    key={i}
                                    variants={cardReveal}
                                    whileHover={{ 
                                        y: -12,
                                        boxShadow: '0 30px 70px rgba(0,0,0,0.22)' 
                                    }}
                                    transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                                    style={{
                                        position: 'relative',
                                        height: 'clamp(420px, 58vh, 520px)',
                                        borderRadius: '32px',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(11, 21, 14, 0.12)',
                                        boxShadow: '0 24px 60px rgba(0,0,0,0.14)',
                                        background: '#070E08',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <img
                                        src={member.img}
                                        alt={member.name}
                                        loading="lazy"
                                        decoding="async"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />

                                    {/* Gradient Dark Scrim Overlay */}
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(180deg, rgba(7, 14, 8, 0.15) 0%, rgba(7, 14, 8, 0.4) 45%, rgba(7, 14, 8, 0.95) 90%)',
                                        pointerEvents: 'none'
                                    }} />

                                    {/* Top Corner Experience Pill */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '20px',
                                        left: '20px',
                                        background: 'rgba(7, 14, 8, 0.75)',
                                        border: '1px solid rgba(229, 169, 59, 0.4)',
                                        color: '#E5A93B',
                                        fontSize: '12px',
                                        fontWeight: '800',
                                        padding: '6px 14px',
                                        borderRadius: '999px',
                                        backdropFilter: 'blur(12px)',
                                        WebkitBackdropFilter: 'blur(12px)'
                                    }}>
                                        ★ {member.exp}
                                    </div>

                                    {/* Bottom Content Container */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        padding: '32px 28px',
                                        zIndex: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px'
                                    }}>
                                        <div style={{
                                            fontSize: '13px',
                                            fontWeight: '800',
                                            color: '#D5ED55',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {member.handle}
                                        </div>

                                        <h3 style={{
                                            fontFamily: 'var(--font-heading), "Bricolage Grotesque", sans-serif',
                                            fontSize: '28px',
                                            fontWeight: '800',
                                            color: '#FFFFFF',
                                            lineHeight: 1.15,
                                            margin: '2px 0 4px',
                                            textShadow: '0 4px 12px rgba(0,0,0,0.6)'
                                        }}>
                                            {member.name}
                                        </h3>

                                        <div style={{
                                            fontSize: '15px',
                                            color: '#E5A93B',
                                            fontWeight: '800',
                                            marginBottom: '6px'
                                        }}>
                                            {member.role}
                                        </div>

                                        <div style={{
                                            fontSize: '13px',
                                            color: '#C8D8CB',
                                            lineHeight: 1.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{ color: '#D5ED55' }}>✦</span>
                                            <span>{member.specialty}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.section>

                {/* ─────────────────────────────────────────────────────────────
                    8. VERIFIED EXPLORER CHRONICLES & REVIEWS (Staggered Review Cards)
                ───────────────────────────────────────────────────────────── */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.05 }}
                    variants={sectionReveal}
                    style={{
                        padding: '110px 24px',
                        background: '#0B150E',
                        position: 'relative',
                        color: '#FFFFFF'
                    }}
                >
                    <div style={{ maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
                        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                            <div className="star-badge" style={{ margin: '0 auto 16px' }}>
                                <span className="star-icon">★</span> VERIFIED CAMPER TESTIMONIALS
                            </div>
                            <h2 style={{
                                fontFamily: 'var(--font-heading), "Bricolage Grotesque", sans-serif',
                                fontSize: 'clamp(32px, 4.5vw, 50px)',
                                fontWeight: '800',
                                color: '#FFFFFF',
                                letterSpacing: '-0.03em',
                                margin: '0 0 14px'
                            }}>
                                High-Altitude <span style={{ color: '#E5A93B' }}>Camper Chronicles</span>
                            </h2>
                            <p style={{ fontSize: '16px', color: '#A2B6A6', maxWidth: '640px', margin: '0 auto' }}>
                                Direct stories from solo adventurers, couples, and families who slept on our Suryanelli ridge.
                            </p>
                        </div>

                        {/* Review Cards Grid */}
                        <motion.div 
                            variants={staggerContainer}
                            className="about-reviews-grid"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))',
                                gap: '28px'
                            }}
                        >
                            {CAMPER_REVIEWS.map((rev, rIdx) => (
                                <motion.div
                                    key={rIdx}
                                    variants={cardReveal}
                                    whileHover={{ 
                                        y: -10, 
                                        borderColor: 'rgba(229, 169, 59, 0.4)',
                                        boxShadow: '0 25px 55px rgba(0,0,0,0.6)' 
                                    }}
                                    transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                                    style={{
                                        background: '#0E1B11',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '28px',
                                        padding: '32px 28px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: '0 20px 48px rgba(0,0,0,0.5)',
                                        cursor: 'default'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                                        <div style={{ color: '#E5A93B', fontSize: '15px' }}>
                                            {'★'.repeat(rev.rating)}
                                        </div>
                                        <span style={{ fontSize: '11.5px', color: '#8E9B92' }}>
                                            {rev.date}
                                        </span>
                                    </div>

                                    <p style={{ fontSize: '14.5px', color: '#DCE8DF', lineHeight: 1.7, margin: '0 0 24px', flex: 1, fontStyle: 'italic' }}>
                                        “{rev.quote}”
                                    </p>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                        <img
                                            src={rev.avatar}
                                            alt={rev.name}
                                            loading="lazy"
                                            decoding="async"
                                            style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #E5A93B' }}
                                        />
                                        <div>
                                            <div style={{ fontSize: '14.5px', fontWeight: '800', color: '#FFFFFF' }}>{rev.name}</div>
                                            <div style={{ fontSize: '12px', color: '#D5ED55' }}>✓ {rev.type}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.section>

                {/* ─────────────────────────────────────────────────────────────
                    9. ABOUT & BASECAMP FAQS (Interactive Animated Accordions)
                ───────────────────────────────────────────────────────────── */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    variants={sectionReveal}
                    style={{
                        padding: '110px clamp(20px, 4vw, 48px)',
                        background: '#F8F9F5',
                        position: 'relative'
                    }}
                >
                    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                            <div className="star-badge" style={{ margin: '0 auto 16px' }}>
                                <span className="star-icon">★</span> EXPEDITION INTELLIGENCE
                            </div>
                            <h2 style={{
                                fontFamily: 'var(--font-heading), "Bricolage Grotesque", sans-serif',
                                fontSize: 'clamp(32px, 4.5vw, 50px)',
                                fontWeight: '800',
                                color: '#0B150E',
                                letterSpacing: '-0.03em',
                                margin: '0 0 14px'
                            }}>
                                Frequently Asked Questions
                            </h2>
                            <p style={{ fontSize: '16px', color: '#59655D', maxWidth: '620px', margin: '0 auto' }}>
                                Everything you need to know before joining us on the Suryanelli ridge.
                            </p>
                        </div>

                        {/* Collapsible Accordion */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {ABOUT_FAQS.map((faq, fIdx) => {
                                const isOpen = activeFaq === fIdx;
                                return (
                                    <motion.div
                                        key={fIdx}
                                        whileHover={{ y: -2 }}
                                        style={{
                                            background: '#FFFFFF',
                                            border: '1px solid rgba(11, 21, 14, 0.08)',
                                            borderRadius: '24px',
                                            overflow: 'hidden',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
                                            transition: 'border-color 0.3s ease'
                                        }}
                                    >
                                        <button
                                            onClick={() => setActiveFaq(isOpen ? -1 : fIdx)}
                                            style={{
                                                width: '100%',
                                                background: 'transparent',
                                                border: 'none',
                                                padding: '24px 28px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                gap: '16px'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: '900', color: '#E5A93B' }}>{faq.num}</span>
                                                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '800', color: '#0B150E' }}>{faq.q}</span>
                                            </div>
                                            <motion.div 
                                                animate={{ rotate: isOpen ? 180 : 0 }}
                                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                                style={{
                                                    width: '34px',
                                                    height: '34px',
                                                    borderRadius: '50%',
                                                    background: isOpen ? '#E5A93B' : '#F1F3EC',
                                                    color: isOpen ? '#070E08' : '#0B150E',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}
                                            >
                                                {isOpen ? <Minus size={12} /> : <Plus size={12} />}
                                            </motion.div>
                                        </button>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                                    style={{ padding: '0 28px 24px 58px', overflow: 'hidden' }}
                                                >
                                                    <p style={{ fontSize: '15px', color: '#59655D', lineHeight: 1.7, margin: 0 }}>
                                                        {faq.a}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </motion.section>

                {/* ─────────────────────────────────────────────────────────────
                    10. ORGANIC CURVED NATURE CTA BANNER (With Dynamic Scroll-Zoom Mountain Backdrop)
                ───────────────────────────────────────────────────────────── */}
                <motion.section 
                    ref={ctaRef}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    variants={sectionReveal}
                    style={{
                        padding: '80px 24px 120px',
                        background: '#F8F9F5'
                    }}
                >
                    <div style={{
                        maxWidth: '1240px',
                        margin: '0 auto',
                        border: '1.5px solid rgba(213, 237, 85, 0.45)',
                        borderRadius: '36px',
                        padding: 'clamp(56px, 8vw, 96px) 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Dynamic Mountain Sunrise Backdrop with Parallax Scroll Zoom */}
                        <motion.div
                            style={{
                                position: 'absolute',
                                inset: '-15%',
                                backgroundImage: 'url("/images/kolukkumalai-sunrise-peak.jpg")',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center 42%',
                                scale: ctaBgScale,
                                y: ctaBgY,
                                zIndex: 0
                            }}
                        />

                        {/* Layered Obsidian and Sunrise Gradient Backdrop */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(180deg, rgba(7, 14, 8, 0.78) 0%, rgba(11, 21, 14, 0.84) 55%, rgba(7, 14, 8, 0.94) 100%), radial-gradient(circle at 75% 50%, rgba(229, 169, 59, 0.35) 0%, transparent 65%)',
                            zIndex: 1
                        }} />

                        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div className="star-badge" style={{ marginBottom: '18px' }}>
                                <span className="star-icon">★</span> EXPEDITIONS ARE LIVE
                            </div>
                            <h2 style={{
                                fontFamily: 'var(--font-heading), "Bricolage Grotesque", sans-serif',
                                fontSize: 'clamp(34px, 5.2vw, 56px)',
                                fontWeight: '800',
                                color: '#FFFFFF',
                                letterSpacing: '-0.03em',
                                maxWidth: '840px',
                                margin: '0 0 18px',
                                lineHeight: 1.15,
                                textShadow: '0 8px 30px rgba(0,0,0,0.7)'
                            }}>
                                Ready to Swap the Screen for the{' '}
                                <span style={{
                                    position: 'relative',
                                    display: 'inline-block',
                                    color: '#FFFFFF'
                                }}>
                                    <span style={{ position: 'relative', zIndex: 2 }}>Sunrise Cloud Bed</span>
                                    {/* Clean Marker Underline Highlight (Preserves Text Color) */}
                                    <span style={{
                                        position: 'absolute',
                                        bottom: '4px',
                                        left: '-4px',
                                        right: '-4px',
                                        height: '11px',
                                        background: 'linear-gradient(90deg, rgba(229, 169, 59, 0.6) 0%, rgba(213, 237, 85, 0.65) 100%)',
                                        borderRadius: '6px',
                                        zIndex: 1,
                                        transform: 'rotate(-0.8deg)',
                                        boxShadow: '0 0 16px rgba(229, 169, 59, 0.45)'
                                    }} />
                                </span>?
                            </h2>
                            <p style={{
                                fontSize: '16.5px',
                                color: '#DCE7DE',
                                maxWidth: '660px',
                                margin: '0 0 40px',
                                lineHeight: 1.65,
                                textShadow: '0 4px 16px rgba(0,0,0,0.6)'
                            }}>
                                Reserve your verified geodesic dome, romantic cliffside tent, or 4x4 high-peak safari in Suryanelli & Kolukkumalai.
                            </p>

                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                <Link
                                    href="/camps"
                                    className="btn-lime"
                                    style={{
                                        padding: '16px 42px',
                                        fontSize: '15.5px',
                                        fontWeight: '800',
                                        textDecoration: 'none',
                                        boxShadow: '0 10px 30px rgba(213, 237, 85, 0.4)'
                                    }}
                                >
                                    Explore Campsite Packages →
                                </Link>
                                <Link
                                    href="/contact"
                                    style={{
                                        padding: '16px 32px',
                                        borderRadius: '999px',
                                        background: 'rgba(11, 21, 14, 0.85)',
                                        border: '1px solid rgba(255, 255, 255, 0.25)',
                                        color: '#FFFFFF',
                                        fontSize: '15.5px',
                                        fontWeight: '700',
                                        textDecoration: 'none',
                                        backdropFilter: 'blur(16px)',
                                        WebkitBackdropFilter: 'blur(16px)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><MessageCircle size={16} /> Talk to Concierge</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* ─────────────────────────────────────────────────────────────
                    SECTION: SQUAD & OFFSITE ESCAPES (Private Buyouts & Groups)
                ───────────────────────────────────────────────────────────── */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={sectionReveal}
                    style={{
                        padding: '120px clamp(20px, 4vw, 48px)',
                        background: '#0B150E',
                        position: 'relative',
                        overflow: 'hidden',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                >
                    {/* Ambient Dark Forest Photo Backing */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1800&q=80)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: 0.32,
                            pointerEvents: 'none'
                        }}
                    />

                    <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
                        <div className="star-badge" style={{ margin: '0 auto 16px', background: 'rgba(213, 237, 85, 0.15)', border: '1px solid rgba(213, 237, 85, 0.4)', color: '#D5ED55' }}>
                            <span className="star-icon">★</span> SQUAD & OFFSITE ESCAPES
                        </div>
                        <h2 style={{
                            fontFamily: 'var(--font-heading), "Bricolage Grotesque", sans-serif',
                            fontSize: 'clamp(32px, 4.5vw, 54px)',
                            fontWeight: '800',
                            color: '#FFFFFF',
                            letterSpacing: '-0.035em',
                            margin: '0 0 16px'
                        }}>
                            Planning a Team Offsite or Squad Expedition?
                        </h2>
                        <p style={{ fontSize: '16px', color: '#C8D8CB', lineHeight: 1.65, maxWidth: '640px', margin: '0 auto 36px' }}>
                            We host private 15 to 30 person mountain buyouts with high-altitude bonfire barbecues, private 4x4 safaris, and outdoor leadership treks.
                        </p>
                        <a
                            href={waLink('Hi Aanandham Desk! We are planning a corporate offsite or group expedition.')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-lime"
                            style={{
                                padding: '16px 36px',
                                fontSize: '15.5px',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 12px 35px rgba(213, 237, 85, 0.45)'
                            }}
                        >
                            <WhatsAppIcon size={18} />
                            <span>Chat with Mountain Offsite Lead →</span>
                        </a>
                    </div>
                </motion.section>

            </main>

            {/* ── UNIFIED REUSABLE FOOTER ── */}
            <Footer />
        </div>
    );
}
