"use client";
import { useState, useEffect, useRef, useMemo } from 'react';

const CONTAINER = { maxWidth: '1440px', margin: '0 auto', width: '100%' };
const IMG_FILL = { width: '100%', height: '100%', objectFit: 'cover' };
const SECTION_PAD = { position: 'relative', padding: '110px clamp(20px, 4vw, 48px)', background: '#F8F9F5' };

import { motion, AnimatePresence, useScroll, useTransform, LayoutGroup, useMotionValue, useSpring, MotionConfig } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Footer from '../components/Footer';
import SiteHeader from '../components/SiteHeader';
const BookingEngineModal = dynamic(() => import('../components/BookingEngineModal'), { ssr: false });
import { useAuth } from '../hooks/useAuth';
import { INITIAL_ALL_CAMPS, getAllCamps, saveAllCamps } from '../lib/campsData';
import { inr } from '../lib/utils';
import { waLink } from '../lib/whatsapp';
import { GraduationCap, Building2, Tent, Flame, Check, ChevronLeft, ChevronRight, ChevronDown, Download, Play, ShieldCheck, Stethoscope, Truck, Heart, MapPin, Clock, Zap, Camera, Search, MessageCircle, Star, Sunrise, Footprints, PersonStanding, Telescope, Leaf, Mountain, Waves, Link2 } from 'lucide-react';
import { WhatsAppIcon, InstagramIcon } from '../components/common/BrandIcons';
import VerifiedStayBadge from '../components/common/VerifiedStayBadge';
import DestinationsShowcase from '../components/DestinationsShowcase';
import HomeHero from '../components/home/HomeHero';
import TripCategories from '../components/home/TripCategories';
import PopularStays from '../components/home/PopularStays';
import ExperiencesSection from '../components/home/ExperiencesSection';
import ThingsToDo from '../components/home/ThingsToDo';
import PlanYourTrip from '../components/home/PlanYourTrip';
import ValleyEditorial from '../components/home/ValleyEditorial';
import TravelGuides from '../components/home/TravelGuides';
import Testimonials from '../components/home/Testimonials';
import MountainStories from '../components/home/MountainStories';
import EventsSection from '../components/home/EventsSection';
import WorkationSection from '../components/home/WorkationSection';
import ValleyMapSection from '../components/home/ValleyMapSection';

// ── OVERVIEW HIGHLIGHTS DATA (Ref Screenshot 3 Batch 2 - media_1786655246018.png) ──
const OVERVIEW_HIGHLIGHTS = [
    {
        img: '/images/high-altitude-ridge-tent.jpg',
        title: 'Live in a High-Altitude Ridge Tent',
        sub: 'Stay options for solo travelers, couples, and groups',
        objectPosition: 'center 60%'
    },
    {
        img: '/images/sunrise-cloud-treks.jpg',
        title: 'Sunrise Peaks & Cloud Bed Treks',
        sub: 'Guided ridge walks through misty tea valleys',
        objectPosition: 'center 70%'
    },
    {
        img: '/images/acoustic-campfires-bbq.jpg',
        title: 'Acoustic Campfires & Live BBQ',
        sub: 'Starlit night sessions under pristine mountain skies',
        objectPosition: 'center center'
    }
];

// ── PROGRAM SCHEDULE DATA (2-Day / 1-Night Wilderness Expedition) ──
const PROGRAM_DAYS = [
    {
        day: 'Day 1',
        title: 'Check-in, Sunset Ridge Hike & Campfire BBQ',
        subtitle: 'Sanctuary Arrival, Highland Ridge Exploration & Starlit Dinner',
        badge: 'Day 01 · Afternoon to Night',
        tags: ['Gated Sanctuary', 'Sunset Ridge Hike', 'Live Mountain BBQ', 'Stargazing Deck'],
        schedule: [
            {
                time: '02:00 PM',
                title: 'Sanctuary Check-in & Welcome Spiced Tea',
                desc: 'Arrive at the mountain sanctuary basecamp, welcome organic herbal drinks, and check-in to high-altitude dome pods, glamping cabins, or ridge tents.'
            },
            {
                time: '04:30 PM',
                title: 'Guided Sunset Ridge Hike',
                desc: 'Panoramic nature hike along scenic highland ridges overlooking expansive water bodies, misty peaks, and rolling tea valleys.'
            },
            {
                time: '07:00 PM',
                title: 'Roaring Campfire & Acoustic Circle',
                desc: 'Gather around the open campfire under pristine, zero light-pollution mountain skies with music and storytelling.'
            },
            {
                time: '08:30 PM',
                title: 'Live Mountain BBQ & Authentic Regional Dinner',
                desc: 'Freshly prepared barbecue skewers followed by a warm, authentic regional buffet dinner.'
            },
            {
                time: '10:30 PM',
                title: 'Stargazing & Alpine Rest',
                desc: 'Quiet hours with thermal blankets, clean en-suite washrooms with hot water, and peaceful alpine sleep.'
            }
        ]
    },
    {
        day: 'Day 2',
        title: 'High-Altitude Sunrise Safari & Heritage Trail',
        subtitle: 'Mountain Ridge Summit Access, Golden Cloud Bed Sunrise & Plantation Heritage',
        badge: 'Day 02 · Dawn to Departure',
        tags: ['High-Altitude Summit Access', '4x4 Off-Road Safari', 'Cloud Bed Sunrise', 'Heritage Plantation Trail'],
        schedule: [
            {
                time: '04:30 AM',
                title: 'Dawn Wakeup & Hot Spiced Tea',
                desc: 'Crisp mountain morning wakeup call with steaming hot spiced hill tea.'
            },
            {
                time: '05:00 AM',
                title: '4x4 Off-Road Jeep Convoy Climb',
                desc: 'Rugged 4x4 mountain safari traversing scenic highland tracks to panoramic viewpoint peaks and ridge summits.'
            },
            {
                time: '06:15 AM',
                title: 'Legendary Sunrise Above the Clouds',
                desc: 'Witness the breathtaking golden cloud bed sunrise over infinite valleys and the Western Ghats mountain ridges.'
            },
            {
                time: '08:00 AM',
                title: 'Historic Mountain Estate & Heritage Trail',
                desc: 'Guided plantation nature walk exploring historic tea, coffee & spice estates and heritage processing traditions.'
            },
            {
                time: '09:30 AM',
                title: 'Traditional Basecamp Breakfast',
                desc: 'Freshly prepared hot South Indian breakfast (Appam, Stew, Dosa, and fresh fruits).'
            },
            {
                time: '11:00 AM',
                title: 'Wrap-up & Checkout',
                desc: 'Departure with unforgettable summit memories and your new wilderness tribe.'
            }
        ]
    }
];

// ── WHY AANANDHAM.GO PILLARS DATA (Expedition Tag Field Notes) ──
const WHY_AANANDHAM_PILLARS = [
    {
        id: 'safety',
        badge: '100% Verified Safe',
        serial: 'EXP-TAG · 01',
        seal: 'VERIFIED SAFE',
        tagline: 'Gated Grounds & En-suite Washrooms',
        title: '100% Female & Family-Safe',
        fullTitle: '100% Female & Family-Safe Campgrounds',
        desc: 'We eliminate the roughness from wilderness camping. Every campsite features private gated perimeters, dedicated on-site female & male coordinators, clean western washrooms with running hot water, and 24/7 power backup.',
        image: '/images/munnar-mist-valley-wide.jpg',
        stat: '350+ Solo Female Campers',
        statIcon: ShieldCheck,
        rotation: '-1.2deg',
        paperBg: '#FFFDF6',
        accentColor: '#166534',
        highlights: ['Gated Private Perimeter', '24/7 Guides On-Site', 'Modern Western Washrooms & Hot Water', 'Zero-Tolerance Safety Protocol']
    },
    {
        id: 'offroad',
        badge: '7,900 FT Summit Access',
        serial: 'EXP-TAG · 02',
        seal: 'SUMMIT ACCESS',
        tagline: 'Exclusive 4x4 Off-Road Fleet',
        title: 'High-Altitude 4x4 Convoys',
        fullTitle: 'High-Altitude 4x4 Off-Road Convoys',
        desc: 'Our fleet of verified 4x4 off-road Mahindra jeeps takes you through rugged private tea estate tracks, crossing rolling cloud valleys to untouched summit vistas where ordinary transport cannot go.',
        image: '/images/high-altitude-4x4-convoy.jpg',
        stat: '7,900 FT Highest Camp',
        statIcon: Truck,
        rotation: '1.4deg',
        paperBg: '#FAF8EE',
        accentColor: '#B45309',
        highlights: ['Verified 4x4 Convoy Fleet', 'Professional Mountain Drivers', 'Private Tea Ridge Permits', 'Sunrise Peak Access']
    },
    {
        id: 'marshals',
        badge: 'Experienced Mountain Guides',
        serial: 'EXP-TAG · 03',
        seal: 'LOCAL GUIDES',
        tagline: 'Native Western Ghats Explorers',
        title: 'Experienced Local Guides',
        fullTitle: 'Experienced Local Mountain Guides',
        desc: 'Led by Western Ghats natives who grew up traversing these mist valleys. They know every hidden viewpoint, weather shift, and tea trail, keeping the group comfortable, safe, and moving at an easy pace.',
        image: '/images/experienced-local-guides.jpg',
        stat: 'Native Valley Guides',
        statIcon: Footprints,
        rotation: '-1.0deg',
        paperBg: '#F7FAF4',
        accentColor: '#047857',
        highlights: ['Native Mountain Guides', 'Comfortable Trail Pacing', 'Basic First-Aid on Trail', 'Local Stories & Hidden Trails']
    },
    {
        id: 'stargazing',
        badge: 'Milky Way Stargazing',
        serial: 'EXP-TAG · 04',
        seal: 'STARGAZING',
        tagline: 'High-Altitude Night Skies',
        title: 'Milky Way Stargazing',
        fullTitle: 'Zero-Light-Pollution Milky Way Stargazing',
        desc: 'Experience crystal-clear night skies above 6,500 FT. Away from city lights and smog, watch the Milky Way, meteor showers, and endless constellations right outside your tent.',
        image: '/images/stargazing-night-skies.jpg',
        stat: 'Zero Light Pollution',
        statIcon: Telescope,
        rotation: '1.2deg',
        paperBg: '#F5F8FC',
        accentColor: '#1E40AF',
        highlights: ['Milky Way & Clear Constellations', 'Zero City Light Pollution', 'Telescope Moon Observation', 'High-Altitude Night Ridge Decks']
    }
];

// ── HOLISTIC EXPERIENCE DATA (Authentic Aanandham Wilderness Pillars) ──
const EXPERIENCE_ITEMS = [
    {
        category: 'Summit & Treks',
        title: 'Sunrise Peaks & Cloud Bed Hikes',
        desc: 'Hike along misty tea ridges to high-altitude summit viewpoints. Breathe in crisp alpine air as golden morning clouds roll beneath your feet across majestic mountain ridges.',
        icon: Sunrise
    },
    {
        category: 'Campfire & Nights',
        title: 'Acoustic Campfires & Stargazing',
        desc: 'Gather around roaring woodfire pits under pristine, zero light-pollution dark skies. Enjoy live BBQ skewers, acoustic jam circles, and telescope stargazing.',
        icon: Flame
    },
    {
        category: 'Heritage & Culture',
        title: 'Estate Heritage & Spice Trails',
        desc: 'Walk through lush high-altitude tea & spice estates. Learn heritage processing traditions with local guides and savor authentic forest-to-table dining.',
        icon: Leaf
    },
    {
        category: '4x4 Off-Road Safari',
        title: 'Rugged Mahindra 4x4 Convoys',
        desc: 'Tackle rugged mountain estate tracks in certified 4x4 jeeps. Traverse misty ridgelines, cross forest streams, and take in endless panoramic valley vistas.',
        icon: Truck
    }
];

// ── KERALA WILDERNESS & CAMPSITES DATA ──
const KERALA_WILDERNESS_GALLERY = [
    {
        id: 'kolukkumalai',
        name: 'Kolukkumalai Sunrise Ridge',
        location: 'Munnar, Kerala',
        altitude: '7,900 FT',
        category: 'High-Altitude 4x4 Safari',
        img: '/images/high-altitude-4x4-convoy.jpg',
        badge: 'Highest Organic Tea Camp'
    },
    {
        id: 'suryanelli',
        name: 'Suryanelli Valley Glamp Pods',
        location: 'Suryanelli, Idukki',
        altitude: '6,500 FT',
        category: 'Private Ridge Glamping',
        img: '/images/high-altitude-ridge-tent.jpg',
        badge: 'Starlit Pod Stays'
    },
    {
        id: 'phantom-head',
        name: 'Phantom Head Peak & Ridge',
        location: 'Munnar, Kerala',
        altitude: '6,800 FT',
        category: 'Guided Sunset Trek',
        img: '/images/phantom-head-trekking.jpg',
        badge: '360° Mountain Vista'
    },
    {
        id: 'anayirangal',
        name: 'Anayirangal Lake Mist Campsite',
        location: 'Munnar Valley, Kerala',
        altitude: '5,500 FT',
        category: 'Lakeside Wilderness',
        img: '/images/anayirangal-elephant-lake.jpg',
        badge: 'Elephant Corridor Views'
    },
    {
        id: 'vagamon',
        name: 'Vagamon Pine Valley Meadows',
        location: 'Vagamon, Idukki',
        altitude: '4,800 FT',
        category: 'Pine Forest Glamping',
        img: '/images/services/munnar-emerald-hills.jpg',
        badge: 'Fog & Mist Trails'
    },
    {
        id: 'wayanad',
        name: 'Wayanad 900 Kandi Rain Canopy',
        location: 'Wayanad, Kerala',
        altitude: '3,200 FT',
        category: 'Canopy & Treehouse Treks',
        img: '/images/services/munnar-mist-ridge.jpg',
        badge: 'Deep Rainforest'
    }
];

// ── CUSTOM ARRANGEMENTS & EVENTS DATA (Roughed-Up Scotch-Taped Paper Scraps) ──
const EVENT_ARRANGEMENTS = [
    {
        tagCode: 'SCRAP · 01',
        stamp: '✓ SQUAD EXPEDITION',
        stampColor: '#B45309',
        accentColor: '#D97706',
        btnBg: '#E5A93B',
        iconClass: GraduationCap,
        title: 'College & Youth Expeditions',
        badge: 'Squad Groups (10-80 pax)',
        desc: 'Curated high-energy student treks with budget-friendly tents, acoustic campfires, guided ridge hikes, and dedicated safety marshals.',
        rotation: '-2.2deg',
        tapeAngle: '-3deg',
        paperBg: '#FFF9E8',
        borderTint: 'rgba(217, 119, 6, 0.3)',
        statPill: '✦ 10-80 Pax Capacity',
        marginalNote: 'Direct 4x4 convoy pickup from transit base points.',
        features: ['Discounted group rates', '4x4 Convoy coordination', 'Campfire & acoustic mic setup', 'Strict safety & medical support']
    },
    {
        tagCode: 'SCRAP · 02',
        stamp: '✓ OFFSITE PRO',
        stampColor: '#047857',
        accentColor: '#059669',
        btnBg: '#10B981',
        iconClass: Building2,
        title: 'Corporate Ridge Offsites',
        badge: 'Team Building & Strategy',
        desc: 'Step out of boardrooms into the clouds. High-altitude glamping, off-road team challenges, outdoor strategy sessions, and curated dining.',
        rotation: '2.5deg',
        tapeAngle: '2.8deg',
        paperBg: '#EDF8EE',
        borderTint: 'rgba(16, 185, 129, 0.3)',
        statPill: '✦ Custom Schedules',
        marginalNote: 'Projector & presentation setups under starlight.',
        features: ['Executive glamp suites', 'Outdoor team-building games', 'Projector & sound gear', 'Custom chef-curated menus']
    },
    {
        tagCode: 'SCRAP · 03',
        stamp: '✓ SOLO TRIBE',
        stampColor: '#C2410C',
        accentColor: '#EA580C',
        btnBg: '#F97316',
        iconClass: Tent,
        title: 'Strangers Camp Meet',
        badge: 'Weekend Community Camp',
        desc: 'Travel alone and leave with a tribe. Safe, vibrant weekend camps where solo travelers bond over stargazing, icebreakers, and ridge sunrises.',
        rotation: '-1.8deg',
        tapeAngle: '-2.2deg',
        paperBg: '#FFF1E8',
        borderTint: 'rgba(234, 88, 12, 0.3)',
        statPill: '✦ 45%+ Solo Attendees',
        marginalNote: 'Dedicated female camp leads & safe grounds.',
        features: ['Icebreaker games & trails', 'Dedicated female marshals', 'Telescope stargazing deck', 'Instant tribe WhatsApp group']
    },
    {
        tagCode: 'SCRAP · 04',
        stamp: '✓ BESPOKE',
        stampColor: '#7E22CE',
        accentColor: '#9333EA',
        btnBg: '#A855F7',
        iconClass: Flame,
        title: 'Private Ridge Celebrations',
        badge: 'Bespoke Arrangements',
        desc: 'Celebrate birthdays, pre-weddings, and milestones amidst mist and mountain ridges with drone cinematography and starlit barbecue dinners.',
        rotation: '2.1deg',
        tapeAngle: '3.5deg',
        paperBg: '#F8EEFC',
        borderTint: 'rgba(147, 51, 234, 0.3)',
        statPill: '✦ 100% Ridge Privacy',
        marginalNote: '4K Drone cinematography options included.',
        features: ['Exclusive campsite buyout', '4K Drone aerial coverage', 'Acoustic guitarist on request', 'Fairy light & candlelit dinner']
    }
];

// ── 4-STEP BOOKING PROCESS (Ref Screenshot 3 - media_1786656749498.png) ──
const FOUR_STEPS = [
    {
        num: '01',
        title: 'Choose your signature campsite',
        desc: 'Select from high-altitude ridge glamping tents, weatherproof alpine tents, or lakeside ridge cabins tailored for couples, solo travelers, and squads.'
    },
    {
        num: '02',
        title: 'Reserve dates & custom add-ons',
        desc: 'Pick your check-in weekend and personalize your journey with live campfire barbecue platters, private 4x4 off-road convoys, or mountain yoga.'
    },
    {
        num: '03',
        title: 'Confirm booking & receive permits',
        desc: 'Secure your pass with instant confirmation. You’ll receive a verified arrival kit, packing checklist, and direct WhatsApp coordinator access.'
    },
    {
        num: '04',
        title: 'Reach basecamp & conquer peaks',
        desc: 'Arrive at our verified basecamp in Munnar or Wayanad. Our 4x4 Jeep convoy and certified Wilderness First Aid marshals take care of all gear, meals, campfire setups, and guided summit trails — just show up ready for adventure!'
    }
];

// ── TESTIMONIALS DATA (Ref Screenshot 5 - media_1786656749593.png) ──
const TESTIMONIALS = [
    {
        id: 1,
        quote: "Best decision I made this year. I was burnt out from work and needed a reset – this camp delivered exactly that. The mountain marshals really know their stuff, the vibe is super chill, and I made friends from all over the country. Experiencing the Kolukkumalai cloud sunrise above 7,900 FT was unforgettable.",
        author: "Daniel Kim",
        campBadge: "camp '25",
        batchDate: "Aanandham, August 2025",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    {
        id: 2,
        quote: "I was nervous about traveling alone as a female solo camper, but this crew made me feel safe and at home immediately. We trekked every morning, explored the peaks, and had the kind of deep conversations around the campfire you remember for life.",
        author: "Emma Rodriguez",
        campBadge: "camp '25",
        batchDate: "Aanandham, March 2025",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
    },
    {
        id: 3,
        quote: "Unmatched wilderness comfort. We organized a 24-member corporate team offsite at the Suryanelli ridge. Clean private western washrooms, delicious hot barbecue at 12°C, and the 4x4 jeep safari was pure adrenaline. Outstanding organization.",
        author: "Karthik & Tribe",
        campBadge: "camp '25",
        batchDate: "Aanandham, November 2025",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
    },
    {
        id: 4,
        quote: "The heart-shaped lake at Chembra Peak took my breath away. Our trek leader paced the entire group patiently, carried medical kits, and pointed out endemic bird species. The food at basecamp felt just like home-cooked Kerala Sadhya.",
        author: "Dr. Sneha Pillai",
        campBadge: "camp '26",
        batchDate: "Aanandham, January 2026",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
    }
];

// ── FAQ DATA (Ref Screenshot 2 - media_1786656749472.png) ──
const FAQ_DATA = [
    {
        id: 'faq-01',
        num: '01',
        question: 'Do I need prior high-altitude trekking or camping experience?',
        answer: 'Not at all! We offer beginner-friendly ridge glamping and scenic walks as well as moderate to challenging summit climbs. Every expedition is guided by certified Wilderness First Aid trek marshals who pace the hike according to the group’s comfort.'
    },
    {
        id: 'faq-02',
        num: '02',
        question: "I'm traveling alone – will I feel out of place?",
        answer: 'Over 45% of our campers and trekkers join solo! Our community-driven Strangers Camp format, shared campfire BBQ, and group icebreaker games make it effortless to meet like-minded nature enthusiasts and build lasting friendships.'
    },
    {
        id: 'faq-03',
        num: '03',
        question: "What's not included in the price?",
        answer: 'The package covers your campsite accommodation, all meals (BBQ dinner + morning breakfast), 4x4 Jeep transfers, guide fees, and forest department entry permits. Personal travel to the basecamp meeting point and personal porterage are not included.'
    },
    {
        id: 'faq-04',
        num: '04',
        question: 'What if the dates don’t work for me?',
        answer: 'We organize custom private batches for groups of 4 or more on any weekday or weekend of the year! Simply reach out to our expedition desk via the Custom Arrangements form or WhatsApp, and we will tailor dates and itineraries for you.'
    },
    {
        id: 'faq-05',
        num: '05',
        question: 'Is the camp safe for travelers?',
        answer: '100% yes. We enforce strict zero-tolerance safety policies, maintain 24/7 on-site female and male camp coordinators, provide private enclosed western washrooms, and station staff at all perimeter points throughout the night.'
    },
    {
        id: 'faq-06',
        num: '06',
        question: 'Can I extend my stay at the villa / glamp?',
        answer: 'Absolutely! You can easily extend your stay at our tea estate glamping pods or combine a high-altitude Kolukkumalai sunrise trek with Vagamon paragliding or Wayanad bamboo rafting. Let us know during booking!'
    }
];

// ── LUXURY HIGH-PERFORMANCE CLEAR REVEAL VARIANTS (Visible & Silky 60FPS) ──
const sectionReveal = {
    hidden: { opacity: 0, y: 36 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
    }
};

const fadeInUp = {
    hidden: { opacity: 0, y: 32 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.05
        }
    }
};

const cardReveal = {
    hidden: { opacity: 0, y: 32, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
};

const fadeInLeft = {
    hidden: { opacity: 0, x: -36 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
    }
};

const fadeInRight = {
    hidden: { opacity: 0, x: 36 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
    }
};

// ── HIGH-PERFORMANCE INSTANT CTA BANNER ──
function CtaParallaxBanner({ onOpenBooking, defaultPackage }) {
    return (
        <section 
            id="cta"
            style={{ position: 'relative', padding: '80px clamp(20px, 4vw, 48px) 110px', background: '#F8F9F5' }}
        >
            <div style={CONTAINER}>
                <div 
                    style={{
                        position: 'relative',
                        borderRadius: '40px',
                        overflow: 'hidden',
                        padding: 'clamp(80px, 10vw, 130px) 32px',
                        textAlign: 'center',
                        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.12)',
                        cursor: 'default'
                    }}
                >
                    {/* Background */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%'
                        }}
                    >
                        <Image
                            src="/images/services/munnar-hero-landing.jpg"
                            alt="Canopy Wilderness"
                            fill
                            priority
                            sizes="100vw"
                            style={{
                                objectFit: 'cover',
                                filter: 'brightness(0.68) contrast(1.15)'
                            }}
                        />
                    </div>

                    {/* Radial & Edge Vignette Gradients */}
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(14, 24, 17, 0.3) 0%, rgba(14, 24, 17, 0.75) 100%)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14, 24, 17, 0.85) 0%, transparent 60%)' }} />

                    {/* Content Layer */}
                    <div style={{ position: 'relative', zIndex: 2, maxWidth: '760px', margin: '0 auto' }}>
                        <div style={{
                            fontSize: '12px',
                            fontWeight: '900',
                            letterSpacing: '2px',
                            color: '#E5A93B',
                            textTransform: 'uppercase',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(0, 0, 0, 0.5)',
                            padding: '6px 18px',
                            borderRadius: '999px',
                            border: '1px solid rgba(213, 237, 85, 0.3)',
                            backdropFilter: 'blur(8px)',
                            marginBottom: '18px'
                        }}>
                            <span>★</span> READY FOR THE EXPEDITION?
                        </div>
                        <h2 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 'clamp(32px, 5vw, 54px)',
                            fontWeight: '800',
                            color: '#FFFFFF',
                            letterSpacing: '-0.035em',
                            lineHeight: 1.15,
                            marginBottom: '32px'
                        }}>
                            Reserve your spot and <span className="text-marker-dark-2">join the adventure</span> today
                        </h2>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => onOpenBooking(defaultPackage)}
                                style={{
                                    background: '#E5A93B',
                                    color: '#121613',
                                    border: 'none',
                                    padding: '16px 48px',
                                    borderRadius: '999px',
                                    fontSize: '15px',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                            >
                                <span>Instant Reserve Spot →</span>
                            </button>
                            <a
                                href={waLink('Hi Aanandham Team! I want to reserve a spot for the upcoming wilderness camp.')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-whatsapp-glass"
                            >
                                <WhatsAppIcon size={19} color="#25D366" />
                                <span>WhatsApp Helpdesk</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Isolated high-performance Scroll Progress Indicator (0 parent re-renders, 0 layout reflows)
function ScrollProgressBar() {
    const barRef = useRef(null);

    useEffect(() => {
        let ticking = false;
        let cachedTotalHeight = 1;

        const updateHeight = () => {
            cachedTotalHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        };
        updateHeight();

        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    if (barRef.current) {
                        const scale = Math.min(1, Math.max(0, window.scrollY / cachedTotalHeight));
                        barRef.current.style.transform = `scaleX(${scale})`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', updateHeight, { passive: true });
        window.addEventListener('orientationchange', updateHeight, { passive: true });

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', updateHeight);
            window.removeEventListener('orientationchange', updateHeight);
        };
    }, []);

    return (
        <div className="scroll-progress-container">
            <div 
                ref={barRef}
                className="scroll-progress-bar" 
                style={{ 
                    transform: 'scaleX(0)', 
                    transformOrigin: '0% 50%',
                    willChange: 'transform' 
                }} 
            />
        </div>
    );
}

export default function HomePage() {
    const router = useRouter();
    const [selectedLightboxImg, setSelectedLightboxImg] = useState(null);
    const [expandedPackageId, setExpandedPackageId] = useState(null);
    const [activeTab, setActiveTab] = useState('All');
    const [activeDayIdx, setActiveDayIdx] = useState(0);
    const [expandedDayIdx, setExpandedDayIdx] = useState(0);
    const [activeWhyIdx, setActiveWhyIdx] = useState(0);
    const [activeFaq, setActiveFaq] = useState(0);
    const [highlightIdx, setHighlightIdx] = useState(0);
    const [testimonialIdx, setTestimonialIdx] = useState(0);
    const [testimonials, setTestimonials] = useState(TESTIMONIALS);

    // Testimonials and Instagram posts are now loaded by <Testimonials /> and <MountainStories />.
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const openBookingModal = (pkg, opts = {}) => {
        if (pkg) setSelectedPackage(pkg);
        setIsBookingModalOpen(true);
    };
    const [selectedPackage, setSelectedPackage] = useState(INITIAL_ALL_CAMPS[0]);
    const { user: currentUser, logout } = useAuth();
    const [campsList, setCampsList] = useState(INITIAL_ALL_CAMPS);

    useEffect(() => {
        const syncCamps = () => {
            const camps = getAllCamps();
            setCampsList(camps);
        };
        syncCamps();
        window.addEventListener('storage', syncCamps);
        fetch('/api/admin/camps')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    saveAllCamps(data);
                    setCampsList(data);
                }
            })
            .catch(() => {});
        return () => window.removeEventListener('storage', syncCamps);
    }, []);

    // Listen for global booking open trigger from sticky bar / dock
    useEffect(() => {
        const handleGlobalBooking = (e) => {
            e.preventDefault();
            if (e.detail?.camp) {
                setSelectedPackage(e.detail.camp);
            }
            setIsBookingModalOpen(true);
        };
        window.addEventListener('aanandham_open_booking', handleGlobalBooking);
        return () => window.removeEventListener('aanandham_open_booking', handleGlobalBooking);
    }, []);

    const filteredPackages = useMemo(() => {
        if (!campsList || !Array.isArray(campsList)) return INITIAL_ALL_CAMPS;
        if (activeTab === 'All') return campsList;
        if (activeTab === 'Treks') return campsList.filter(p => p.category?.toLowerCase().includes('trek') || p.title?.toLowerCase().includes('summit') || p.tags?.some(t => t?.toLowerCase().includes('trek')));
        if (activeTab === 'Glamping') return campsList.filter(p => p.category?.toLowerCase().includes('glamp') || p.tags?.some(t => t?.toLowerCase().includes('glamp')) || p.title?.toLowerCase().includes('ridge'));
        if (activeTab === 'Water') return campsList.filter(p => p.category?.toLowerCase().includes('water') || p.category?.toLowerCase().includes('lake') || p.tags?.some(t => t?.toLowerCase().includes('water') || t?.toLowerCase().includes('lake') || t?.toLowerCase().includes('rapids')));
        return campsList;
    }, [activeTab, campsList]);

    // User Wishlist & Share Toasts
    const [wishlist, setWishlist] = useState([]);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        try {
            const savedWishlist = JSON.parse(localStorage.getItem('aanandham_user_wishlist') || '[]');
            setWishlist(savedWishlist);
        } catch (e) {}
    }, []);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const handleToggleWishlist = (campId, campTitle, e) => {
        e?.stopPropagation();
        e?.preventDefault();
        let updated;
        const isLiked = wishlist.includes(campId);
        if (isLiked) {
            updated = wishlist.filter(id => id !== campId);
            showToast(`Removed "${campTitle}" from your wishlist`);
        } else {
            updated = [...wishlist, campId];
            showToast(`❤️ Added "${campTitle}" to saved wishlist!`);
        }
        setWishlist(updated);
        try {
            localStorage.setItem('aanandham_user_wishlist', JSON.stringify(updated));
        } catch (e) {}
    };

    const handleShareCamp = async (pkg, e) => {
        e?.stopPropagation();
        e?.preventDefault();
        const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/camps/${pkg.id}` : '';
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${pkg.title} | Aanandham.go`,
                    text: `Check out ${pkg.title} at ${pkg.altitude} in ${pkg.location}!`,
                    url: shareUrl
                });
                return;
            } catch (e) {}
        }
        try {
            await navigator.clipboard.writeText(shareUrl);
            showToast('✓ Link copied to clipboard!');
        } catch (e) {
            window.open(waLink(`Check out this camp: ${pkg.title} - ${shareUrl}`), '_blank');
        }
    };

    // Floating Mouse-Follow Preview Card State for Program Section
    const programContainerRef = useRef(null);
    const [hoveredProgramDay, setHoveredProgramDay] = useState(null);
    const programMouseX = useMotionValue(0);
    const programMouseY = useMotionValue(0);
    const smoothProgramX = useSpring(programMouseX, { stiffness: 420, damping: 30 });
    const smoothProgramY = useSpring(programMouseY, { stiffness: 420, damping: 30 });

    const handleProgramMouseMove = (e) => {
        if (!programContainerRef.current) return;
        const rect = programContainerRef.current.getBoundingClientRect();
        programMouseX.set(e.clientX - rect.left);
        programMouseY.set(e.clientY - rect.top);
    };

    // Mobile Horizontal Slider Scroll Tracker for Packages Preview (RAF Throttled)
    const packagesSliderRef = useRef(null);
    const [activePackageSlideIdx, setActivePackageSlideIdx] = useState(0);
    const activePackageSlideIdxRef = useRef(0);
    const packageSliderRafRef = useRef(null);

    const handlePackageSliderScroll = () => {
        if (packageSliderRafRef.current) return;
        packageSliderRafRef.current = requestAnimationFrame(() => {
            packageSliderRafRef.current = null;
            if (!packagesSliderRef.current) return;
            const scrollLeft = packagesSliderRef.current.scrollLeft;
            const cardEl = packagesSliderRef.current.children[0];
            const cardWidth = cardEl ? cardEl.offsetWidth : 300;
            const cardStep = cardWidth + 18;
            const newIdx = Math.round(scrollLeft / cardStep);
            if (newIdx >= 0 && newIdx < filteredPackages.length && newIdx !== activePackageSlideIdxRef.current) {
                activePackageSlideIdxRef.current = newIdx;
                setActivePackageSlideIdx(newIdx);
            }
        });
    };

    // Mobile Horizontal Slider Scroll Tracker for Kerala Wilderness Grid (RAF Throttled)
    const wildernessSliderRef = useRef(null);
    const [activeWildernessIdx, setActiveWildernessIdx] = useState(0);
    const activeWildernessIdxRef = useRef(0);
    const wildernessSliderRafRef = useRef(null);

    const handleWildernessSliderScroll = () => {
        if (wildernessSliderRafRef.current) return;
        wildernessSliderRafRef.current = requestAnimationFrame(() => {
            wildernessSliderRafRef.current = null;
            if (!wildernessSliderRef.current) return;
            const scrollLeft = wildernessSliderRef.current.scrollLeft;
            const cardEl = wildernessSliderRef.current.children[0];
            const cardWidth = cardEl ? cardEl.offsetWidth : 300;
            const cardStep = cardWidth + 18;
            const newIdx = Math.round(scrollLeft / cardStep);
            if (newIdx >= 0 && newIdx < KERALA_WILDERNESS_GALLERY.length && newIdx !== activeWildernessIdxRef.current) {
                activeWildernessIdxRef.current = newIdx;
                setActiveWildernessIdx(newIdx);
            }
        });
    };

    // Read logged-in user profile from localStorage
    const handleLogout = () => {
        logout?.();
    };

    // Disable background page scrolling when modals are open
    useEffect(() => {
        if (isVideoModalOpen || selectedLightboxImg || isBookingModalOpen) {
            window.__lenis?.stop();
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                window.__lenis?.start();
                document.body.style.overflow = originalOverflow || '';
            };
        }
    }, [isVideoModalOpen, selectedLightboxImg, isBookingModalOpen]);

    const nextTestimonial = () => setTestimonialIdx((prev) => (prev + 1) % (testimonials.length > 0 ? testimonials.length : TESTIMONIALS.length));
    const prevTestimonial = () => setTestimonialIdx((prev) => {
        const len = testimonials.length > 0 ? testimonials.length : TESTIMONIALS.length;
        return prev === 0 ? len - 1 : prev - 1;
    });
    const nextHighlight = () => setHighlightIdx((prev) => (prev + 1) % OVERVIEW_HIGHLIGHTS.length);
    const prevHighlight = () => setHighlightIdx((prev) => (prev === 0 ? OVERVIEW_HIGHLIGHTS.length - 1 : prev - 1));
    
    const nextWhyPillar = () => setActiveWhyIdx((prev) => (prev + 1) % WHY_AANANDHAM_PILLARS.length);
    const prevWhyPillar = () => setActiveWhyIdx((prev) => (prev === 0 ? WHY_AANANDHAM_PILLARS.length - 1 : prev - 1));

    const handleOpenBooking = (pkg) => {
        setSelectedPackage(pkg);
        setIsBookingModalOpen(true);
    };

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aanandham.in';
    const schemaData = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                '@id': `${siteUrl}/#website`,
                'url': siteUrl,
                'name': 'Aanandham.go',
                'description': 'Discover Pulga, Kasol and the Parvati Valley — village guides, treks and mountain stays — plus verified camping in Munnar, Kerala.',
                'inLanguage': 'en-IN',
                // Organization entity is defined once in the root layout's JSON-LD
                'publisher': { '@id': `${siteUrl}/#organization` }
            },
            {
                '@type': 'ItemList',
                '@id': `${siteUrl}/#packages`,
                'name': 'Aanandham.go Wilderness Expeditions & Camp Packages',
                'itemListElement': INITIAL_ALL_CAMPS.map((pkg, idx) => ({
                    '@type': 'ListItem',
                    'position': idx + 1,
                    'item': {
                        '@type': 'TouristTrip',
                        'name': pkg.title,
                        'description': pkg.description,
                        'image': pkg.image,
                        'touristType': 'Adventure Travelers, Couples & Families',
                        'offers': {
                            '@type': 'Offer',
                            'price': pkg.price,
                            'priceCurrency': 'INR',
                            'priceValidUntil': '2027-12-31',
                            'availability': 'https://schema.org/InStock',
                            'url': `${siteUrl}/camps/${pkg.id}`
                        },
                        'aggregateRating': {
                            '@type': 'AggregateRating',
                            'ratingValue': (pkg.rating || 4.9).toString(),
                            'reviewCount': (pkg.reviewsCount || 100).toString(),
                            'bestRating': '5',
                            'worstRating': '1'
                        }
                    }
                }))
            },
            {
                '@type': 'FAQPage',
                '@id': `${siteUrl}/#faq`,
                'mainEntity': FAQ_DATA.map(f => ({
                    '@type': 'Question',
                    'name': f.question,
                    'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': f.answer
                    }
                }))
            }
        ]
    };

    return (
        <MotionConfig reducedMotion="never">
            <div style={{ backgroundColor: '#F8F9F5', color: '#121613', minHeight: '100%', position: 'relative' }}>
            
            {/* ── GOOGLE RICH RESULTS STRUCTURED DATA ── */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />

            {/* Skip-to-content link now lives in <SiteHeader /> so every page has it */}

            {/* ── SCROLL PROGRESS BAR (0 React Re-renders on Scroll) ── */}
            <ScrollProgressBar />

            {/* ── UNIFIED REUSABLE SITE HEADER ── */}
            <SiteHeader 
                activePage="home" 
                currentUser={currentUser} 
                onLogout={handleLogout} 
            />

            <main id="main-content">

            {/* ── HERO + VALLEY ROUTE (Himalayan discovery) ── */}
            <HomeHero />

            {/* ── EXPLORE DESTINATIONS ── */}
            <DestinationsShowcase camps={campsList} />
            <ValleyMapSection camps={campsList} />

            {/* ── TRIP CATEGORIES + POPULAR STAYS ── */}
            <TripCategories />
            <PopularStays camps={campsList} />

            {/* ── EXPERIENCES + THINGS TO DO ── */}
            <ExperiencesSection />
            <ThingsToDo />

            {/* ── TRIP PLANNER ── */}
            <PlanYourTrip />

            {/* ── PARVATI VALLEY EDITORIAL — replaces legacy 1. OVERVIEW ── */}
            <ValleyEditorial />

            {/* ─────────────────────────────────────────────────────────────
                2. WHY AANANDHAM.GO SECTION (Flagship Value & Trust Pillars)
            ───────────────────────────────────────────────────────────── */}
            <motion.section 
                id="why-aanandham" 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={sectionReveal}
                style={{ position: 'relative', padding: 'clamp(50px, 5vw, 68px) clamp(20px, 4vw, 48px) clamp(70px, 7vw, 96px)', background: '#F8F9F5' }}
            >
                <div style={CONTAINER}>
                    <div className="why-aanandham-grid">
                        
                        {/* Interactive Cinematic Showcase Card (Desktop: Left, Mobile: Below Header/Tabs) */}
                        <motion.div 
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.15 }}
                            variants={fadeInLeft}
                            className="why-showcase-col reveal-fade-left"
                        >
                            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                                <AnimatePresence initial={false}>
                                    <motion.img
                                        key={activeWhyIdx}
                                        src={WHY_AANANDHAM_PILLARS[activeWhyIdx].image}
                                        alt={WHY_AANANDHAM_PILLARS[activeWhyIdx].title}
                                        width="800"
                                        height="590"
                                        decoding="async"
                                        initial={{ opacity: 0, scale: 1.04, filter: 'blur(4px)' }}
                                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, scale: 0.98, filter: 'blur(2px)' }}
                                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </AnimatePresence>
                            </div>

                            {/* Subtle Cinematic Gradient Overlay */}
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14, 24, 17, 0.88) 0%, rgba(14, 24, 17, 0.15) 50%, rgba(14, 24, 17, 0.35) 100%)', pointerEvents: 'none' }} />

                            {/* Top Left Pillar Badge (Single clean badge, removed repeated top-right pill) */}
                            <div style={{
                                position: 'absolute',
                                top: 'clamp(14px, 2.5vw, 22px)',
                                left: 'clamp(14px, 2.5vw, 22px)',
                                background: 'rgba(0, 0, 0, 0.65)',
                                color: '#E5A93B',
                                fontSize: '12px',
                                fontWeight: '800',
                                padding: '6px 16px',
                                borderRadius: '999px',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(229, 169, 59, 0.35)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E5A93B' }}></span>
                                <span>{WHY_AANANDHAM_PILLARS[activeWhyIdx].badge}</span>
                            </div>

                            {/* Minimized Bottom Content Card — Clean title & controls so photography breathes */}
                            <div className="why-showcase-content" style={{ position: 'absolute', bottom: '22px', left: '22px', right: '22px' }}>
                                <div style={{ fontSize: '11px', color: '#E5A93B', fontWeight: '800', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                    {WHY_AANANDHAM_PILLARS[activeWhyIdx].tagline}
                                </div>
                                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(19px, 2.4vw, 24px)', fontWeight: '800', color: '#FFFFFF', margin: '0 0 12px', lineHeight: 1.25 }}>
                                    {WHY_AANANDHAM_PILLARS[activeWhyIdx].title}
                                </h3>

                                {/* Carousel Controls & Indicator */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.18)' }}>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {WHY_AANANDHAM_PILLARS.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveWhyIdx(idx)}
                                                aria-label={`Go to pillar slide ${idx + 1}`}
                                                style={{
                                                    width: activeWhyIdx === idx ? '24px' : '8px',
                                                    height: '8px',
                                                    borderRadius: '999px',
                                                    background: activeWhyIdx === idx ? '#E5A93B' : 'rgba(255,255,255,0.3)',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.25s ease'
                                                }}
                                            >
                                                <span className="sr-only">Go to pillar slide {idx + 1}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            onClick={prevWhyPillar} 
                                            aria-label="Previous reason"
                                            style={{ width: '38px', height: '38px', minWidth: '38px', minHeight: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', color: '#121613', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                                        >
                                            <ChevronLeft size={12} />
                                        </button>
                                        <button 
                                            onClick={nextWhyPillar} 
                                            aria-label="Next reason"
                                            style={{ width: '38px', height: '38px', minWidth: '38px', minHeight: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', color: '#121613', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                                        >
                                            <ChevronRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Content & Interactive Feature Pillars (Desktop: Right, Mobile: Top) */}
                        <motion.div 
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.15 }}
                            variants={fadeInRight} 
                            className="why-content-col reveal-fade-right"
                        >
                            <div className="star-badge">
                                <span className="star-icon">★</span> WHY AANANDHAM.GO
                            </div>
                            <h2 style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'clamp(28px, 4.2vw, 48px)',
                                fontWeight: '800',
                                color: '#121613',
                                letterSpacing: '-0.035em',
                                lineHeight: 1.15,
                                marginBottom: '16px'
                            }}>
                                The <span className="text-highlight-gold">gold standard</span> in <span style={{ color: '#59655D' }}>Kerala wilderness glamping</span>
                            </h2>

                            <p style={{ fontSize: '15px', color: '#59655D', lineHeight: 1.7, marginBottom: '22px' }}>
                                We believe nature should be experienced with <span className="text-highlight-subtle">absolute safety</span>, deep local knowledge, and zero compromise on comfort. From <span className="text-highlight-subtle">7,900 FT cloud ridges</span> to <span className="text-highlight-subtle">private en-suite washrooms</span>, here is why 15,000+ adventurers trust <span className="text-hover-marker" style={{ cursor: 'pointer' }}><span className="marker-text">Aanandham.go</span></span>.
                            </p>

                            {/* 4 Interactive Expedition Tag Note Cards (2x2 Grid on Desktop / Smooth Swipe Track on Mobile) */}
                            <h3 style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'clamp(20px, 2.5vw, 26px)',
                                fontWeight: '800',
                                color: '#121613',
                                letterSpacing: '-0.02em',
                                lineHeight: 1.3,
                                marginBottom: '20px'
                            }}>
                                Four Reasons Adventurers Trust Their Wilderness Stay
                            </h3>
                            <div className="why-desktop-pillars" style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', 
                                gap: '16px', 
                                marginBottom: '28px',
                                paddingTop: '6px'
                            }}>
                                {WHY_AANANDHAM_PILLARS.map((pillar, idx) => {
                                    const isSelected = activeWhyIdx === idx;
                                    return (
                                        <motion.div
                                            key={pillar.id}
                                            onClick={() => setActiveWhyIdx(idx)}
                                            whileHover={{ 
                                                y: -6, 
                                                rotate: 0,
                                                scale: 1.02,
                                                boxShadow: isSelected 
                                                    ? '0 20px 40px rgba(229, 169, 59, 0.25), 0 4px 12px rgba(0,0,0,0.08)' 
                                                    : '0 16px 36px rgba(0,0,0,0.12)' 
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                            transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                                            style={{
                                                position: 'relative',
                                                background: isSelected ? '#FFFFFF' : '#FAFAF7',
                                                border: isSelected 
                                                    ? '2px solid #E5A93B' 
                                                    : '1.5px solid rgba(18, 22, 19, 0.18)',
                                                borderRadius: '16px',
                                                padding: '22px 20px 18px 20px',
                                                cursor: 'pointer',
                                                transform: 'none',
                                                transition: 'border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease',
                                                boxShadow: isSelected 
                                                    ? '0 14px 34px rgba(229, 169, 59, 0.22), 0 4px 12px rgba(0,0,0,0.06)' 
                                                    : '0 4px 14px rgba(0,0,0,0.04)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                minHeight: '175px'
                                            }}
                                        >
                                            {/* Brass Metal Eyelet Ring at Top Left */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '12px',
                                                left: '14px',
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: 'radial-gradient(circle at 35% 35%, #FDE047 0%, #D97706 70%, #78350F 100%)',
                                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.3)',
                                                border: '1px solid #92400E',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <div style={{
                                                    width: '4px',
                                                    height: '4px',
                                                    borderRadius: '50%',
                                                    background: '#0B150E'
                                                }} />
                                            </div>

                                            {/* Top Row: Serial Tag + Seal Stamp Badge */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingLeft: '14px' }}>
                                                <span style={{
                                                    fontSize: '10px',
                                                    fontWeight: '900',
                                                    letterSpacing: '1px',
                                                    color: isSelected ? '#E5A93B' : '#2D3748',
                                                    textTransform: 'uppercase',
                                                    fontFamily: 'monospace'
                                                }}>
                                                    {pillar.serial}
                                                </span>

                                                <span style={{
                                                    fontSize: '9px',
                                                    fontWeight: '900',
                                                    letterSpacing: '0.8px',
                                                    textTransform: 'uppercase',
                                                    padding: '3px 8px',
                                                    borderRadius: '4px',
                                                    background: isSelected ? 'rgba(229, 169, 59, 0.2)' : 'rgba(0, 0, 0, 0.08)',
                                                    color: isSelected ? '#92400E' : '#1A202C',
                                                    border: `1px solid ${isSelected ? 'rgba(229, 169, 59, 0.5)' : 'rgba(0,0,0,0.12)'}`
                                                }}>
                                                    ✓ {pillar.seal}
                                                </span>
                                            </div>

                                            {/* Main Content: Icon + Title */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                <div style={{
                                                    width: '38px',
                                                    height: '38px',
                                                    borderRadius: '10px',
                                                    background: isSelected ? 'rgba(229, 169, 59, 0.22)' : 'rgba(0, 0, 0, 0.08)',
                                                    color: isSelected ? '#92400E' : '#121613',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '18px',
                                                    flexShrink: 0,
                                                    transition: 'background 0.25s ease, color 0.25s ease'
                                                }}>
                                                    <pillar.statIcon size={18} strokeWidth={2.4} />
                                                </div>
                                                <h4 style={{
                                                    fontFamily: 'var(--font-heading)',
                                                    fontSize: '15.5px',
                                                    fontWeight: '800',
                                                    color: '#0F172A',
                                                    margin: 0,
                                                    lineHeight: 1.25,
                                                    letterSpacing: '-0.02em'
                                                }}>
                                                    {pillar.fullTitle || pillar.title}
                                                </h4>
                                            </div>

                                            {/* High-Contrast Tagline Pill */}
                                            <div style={{
                                                fontSize: '11.5px',
                                                fontWeight: '800',
                                                color: isSelected ? '#121613' : '#1E293B',
                                                background: isSelected ? 'rgba(229, 169, 59, 0.22)' : 'rgba(0, 0, 0, 0.06)',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                marginTop: 'auto',
                                                width: 'fit-content',
                                                border: isSelected ? '1px solid rgba(229, 169, 59, 0.45)' : '1px solid rgba(0,0,0,0.06)'
                                            }}>
                                                ✦ {pillar.tagline}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Certified Trust Badges */}
                            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid rgba(18, 22, 19, 0.08)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#121613', fontWeight: '700' }}>
                                    <span style={{ color: '#E5A93B', display: 'inline-flex' }}><ShieldCheck size={16} /></span>
                                    <span>Kerala Forest Eco-Permits</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#121613', fontWeight: '700' }}>
                                    <span style={{ color: '#E5A93B', display: 'inline-flex' }}><Star size={16} fill="#E5A93B" /></span>
                                    <span>4.98 / 5.0 Rating</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#121613', fontWeight: '700' }}>
                                    <span style={{ color: '#E5A93B', display: 'inline-flex' }}><Truck size={16} /></span>
                                    <span>4x4 Jeep Convoy</span>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </motion.section>

            {/* 3. PACKAGES PREVIEW — replaced by <PopularStays /> (new stay discovery, see top of page) */}

            {/* 4. PROGRAM SECTION — replaced by <PlanYourTrip /> (trip planner, see top of page) */}

            {/* 7. EXPERIENCE — replaced by <ExperiencesSection /> + <ThingsToDo /> (see top of page) */}

            {/* ── EVENTS + WORKATION — replace legacy 8. CUSTOM ARRANGEMENTS & EVENTS (group trips kept inside EventsSection) ── */}
            <EventsSection />
            <WorkationSection />

            {/* ─────────────────────────────────────────────────────────────
                9. MAKE IT HAPPEN IN JUST FOUR STEPS (Ref Screenshot 3 - media_1786656749498.png)
                   - Pinned sticky left heading while right steps scroll until section end
            ───────────────────────────────────────────────────────────── */}
            <motion.section 
                id="steps" 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={sectionReveal}
                style={SECTION_PAD}
            >
                <div style={CONTAINER}>
                    <div className="sticky-split-grid" style={{ alignItems: 'flex-start', gap: 'clamp(32px, 4vw, 56px)' }}>
                        
                        {/* Sticky Pinned Left Header */}
                        <motion.div 
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.15 }}
                            variants={fadeInLeft}
                            className="sticky-pinned-col reveal-fade-left" 
                            style={{ position: 'sticky', top: '100px' }}
                        >
                            <div className="star-badge" style={{ marginBottom: '14px' }}>
                                <span className="star-icon">★</span> STEPS
                            </div>
                            <h2 style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'clamp(34px, 4.5vw, 52px)',
                                fontWeight: '800',
                                color: '#121613',
                                letterSpacing: '-0.035em',
                                lineHeight: 1.1,
                                marginBottom: '24px'
                            }}>
                                Make it happen in <br />just <span className="text-marker-2">four steps</span>
                            </h2>
                            <p style={{ fontSize: '15.5px', color: '#59655D', lineHeight: 1.7, marginBottom: '32px', maxWidth: '420px' }}>
                                We’ve made the entire process smooth and hassle-free. Our team guides you through every step from booking to arrival — just show up ready for waves & peaks.
                            </p>
                        </motion.div>

                        {/* Scrolling Right Steps List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {FOUR_STEPS.map((step, idx) => (
                                <motion.div 
                                    key={idx} 
                                    variants={cardReveal}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.15 }}
                                    className={`hover-lift reveal-fade-up reveal-delay-${idx + 1}`}
                                    style={{ 
                                        display: 'flex', 
                                        gap: '24px', 
                                        alignItems: 'flex-start',
                                        background: '#FFFFFF',
                                        border: '1px solid rgba(18, 22, 19, 0.08)',
                                        borderRadius: '24px',
                                        padding: '28px 28px',
                                        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.02)'
                                    }}
                                >
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '14px',
                                        background: '#121613',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '15px',
                                        fontWeight: '900',
                                        color: '#E5A93B',
                                        flexShrink: 0,
                                        boxShadow: '0 4px 14px rgba(18, 22, 19, 0.15)'
                                    }}>
                                        {step.num}
                                    </div>
                                    <div style={{ flex: 1, paddingTop: '2px' }}>
                                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '800', color: '#121613', marginBottom: '8px', lineHeight: 1.3 }}>
                                            {step.title}
                                        </h3>
                                        <p style={{ fontSize: '14px', color: '#59655D', lineHeight: 1.65, margin: 0 }}>
                                            {step.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                    </div>
                </div>
            </motion.section>
            {/* 9.5 KERALA WILDERNESS GALLERY — replaced by <MountainStories /> */}

            {/* ── TRAVEL GUIDES + TESTIMONIALS — replace legacy 10. TESTIMONIALS & VIDEO DIARIES ── */}
            <TravelGuides />
            <Testimonials />

            {/* ─────────────────────────────────────────────────────────────
                11. ORGANIC CURVED NATURE CTA BANNER WITH SCROLL-DRIVEN ZOOM
            ───────────────────────────────────────────────────────────── */}
            <CtaParallaxBanner 
                onOpenBooking={handleOpenBooking} 
                defaultPackage={INITIAL_ALL_CAMPS[0]} 
            />

            {/* ─────────────────────────────────────────────────────────────
                12. FREQUENTLY ASKED QUESTIONS (Ref Screenshot 2 - media_1786656749472.png)
                   - Pinned sticky left contact card while right FAQ questions scroll until section end
            ───────────────────────────────────────────────────────────── */}
            <motion.section 
                id="faq" 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={sectionReveal}
                style={SECTION_PAD}
            >
                <div style={CONTAINER}>
                    
                    <div style={{ marginBottom: '60px' }}>
                        <div className="star-badge">
                            <span className="star-icon">★</span> FAQ
                        </div>
                        <h2 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 'clamp(34px, 5vw, 52px)',
                            fontWeight: '800',
                            color: '#121613',
                            letterSpacing: '-0.035em'
                        }}>
                            Frequently <br />Asked Questions
                        </h2>
                    </div>

                    <div className="sticky-split-grid">
                        
                        {/* Sticky Pinned Left Floating Card */}
                        <motion.div 
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.15 }}
                            variants={fadeInLeft}
                            className="hover-lift sticky-pinned-col faq-help-card reveal-fade-left" 
                            style={{ 
                                background: '#FFFFFF', 
                                border: '1px solid rgba(18, 22, 19, 0.08)', 
                                borderRadius: '24px', 
                                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.03)',
                                boxSizing: 'border-box'
                            }}
                        >
                            <div style={{ 
                                width: '48px', 
                                height: '48px', 
                                borderRadius: '14px', 
                                background: 'rgba(213, 237, 85, 0.25)', 
                                border: '1px solid rgba(18, 22, 19, 0.06)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontSize: '22px', 
                                marginBottom: '20px' 
                            }}>
                                <MessageCircle size={22} strokeWidth={2.2} />
                            </div>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: '800', color: '#121613', marginBottom: '10px' }}>
                                Still have questions?
                            </h3>
                            <p style={{ fontSize: '14px', color: '#59655D', lineHeight: 1.65, marginBottom: '28px' }}>
                                Whether it’s about the program, accommodation, or anything in between – we’re happy to help.
                            </p>
                            <Link
                                href="/contact"
                                className="action-arrow-btn-dark"
                                style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
                            >
                                <span>Contact Us</span>
                                <div className="btn-arrow-circle">
                                    →
                                </div>
                            </Link>
                        </motion.div>

                        {/* Scrolling Right Accordions 01-06 */}
                        <motion.div 
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.15 }}
                            variants={fadeInRight}
                            className="reveal-fade-right"
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            {FAQ_DATA.map((faq, index) => {
                                const isOpen = activeFaq === index;
                                return (
                                    <div key={faq.id} style={{ borderBottom: '1px solid rgba(18, 22, 19, 0.1)', padding: '24px 0' }}>
                                        <button onClick={() => setActiveFaq(isOpen ? -1 : index)} style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
                                            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                                <span style={{ fontSize: '13px', fontWeight: '800', color: '#8E9B92', marginTop: '2px' }}>{faq.num}</span>
                                                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '19px', fontWeight: '700', color: '#121613', lineHeight: 1.4 }}>{faq.question}</span>
                                            </div>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F1F3EC', color: '#121613', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <ChevronDown size={11} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
                                            </div>
                                        </button>
                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div 
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                                                    style={{ overflow: 'hidden' }}
                                                >
                                                    <div style={{ padding: '16px 0 0 38px' }}>
                                                        <p style={{ fontSize: '15px', color: '#59655D', lineHeight: 1.65, margin: 0 }}>{faq.answer}</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* ── STORIES FROM THE MOUNTAINS (#AanandhamTravels) — replaces the legacy Instagram strip ── */}
            <MountainStories />

            </main>

            {/* ─────────────────────────────────────────────────────────────
                13. DEEP FOREST GREEN FOOTER (Ref Screenshot 2 Batch 3 - media_1786657185483.png)
                   - Interactive lighting & directional ↗ arrows
                   - Smooth watermark light-up
            ───────────────────────────────────────────────────────────── */}
            {/* 13. REUSABLE FOOTER */}
            <Footer />

            {/* ─────────────────────────────────────────────────────────────
                MODALS (Real Video, Gallery Lightbox & Booking Engine)
            ───────────────────────────────────────────────────────────── */}

            {/* ─────────────────────────────────────────────────────────────
                MODALS (Real Video, Gallery Lightbox & Booking Engine)
            ───────────────────────────────────────────────────────────── */}
            
            {/* 1. Real 4K Mountain Expedition Video Modal */}
            <AnimatePresence>
                {isVideoModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Aanandham Wilderness Video Player"
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 9999,
                            background: 'rgba(0, 0, 0, 0.94)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '24px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95 }}
                            style={{
                                width: '100%',
                                maxWidth: '860px',
                                background: '#0A0D0B',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '28px',
                                overflow: 'hidden',
                                position: 'relative',
                                boxShadow: '0 25px 80px rgba(0,0,0,0.5)'
                            }}
                        >
                            <button
                                onClick={() => setIsVideoModalOpen(false)}
                                aria-label="Close video player"
                                className="modal-close-btn"
                                style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    zIndex: 10
                                }}
                            >
                                ✕
                            </button>
                            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                                <iframe
                                    src="https://www.youtube-nocookie.com/embed/1s-P5_Lq0pI?autoplay=1"
                                    title="Aanandham Wilderness Camp Video Diaries"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        border: 0
                                    }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. Fullscreen Kerala Wilderness Lightbox Modal */}
            <AnimatePresence>
                {selectedLightboxImg && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        role="dialog"
                        aria-modal="true"
                        aria-label={selectedLightboxImg.name}
                        onClick={() => setSelectedLightboxImg(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 9999,
                            background: 'rgba(0, 0, 0, 0.95)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '24px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.92, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.92 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '920px',
                                background: '#101E13',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '32px',
                                overflow: 'hidden',
                                position: 'relative',
                                boxShadow: '0 30px 90px rgba(0, 0, 0, 0.6)',
                                color: '#FFFFFF'
                            }}
                        >
                            <button
                                onClick={() => setSelectedLightboxImg(null)}
                                aria-label="Close image preview"
                                className="modal-close-btn"
                                style={{
                                    position: 'absolute',
                                    top: '20px',
                                    right: '20px',
                                    zIndex: 10
                                }}
                            >
                                ✕
                            </button>

                            <div style={{ height: '480px', position: 'relative', overflow: 'hidden' }}>
                                <img
                                    src={selectedLightboxImg.img}
                                    alt={selectedLightboxImg.name}
                                    style={IMG_FILL}
                                 loading="lazy" decoding="async"/>
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: 'linear-gradient(0deg, #101E13 0%, rgba(16, 30, 19, 0) 100%)',
                                    height: '140px'
                                }} />
                            </div>

                            <div style={{ padding: '24px 32px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                        <span style={{ background: '#E5A93B', color: '#121613', fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '999px' }}>
                                            {selectedLightboxImg.altitude}
                                        </span>
                                        <span style={{ color: '#A2B6A6', fontSize: '13px', fontWeight: '600' }}>
                                            {selectedLightboxImg.location}
                                        </span>
                                    </div>
                                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: '800', margin: 0, color: '#FFFFFF' }}>
                                        {selectedLightboxImg.name}
                                    </h3>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <Link
                                        href={`/camps/${(INITIAL_ALL_CAMPS.find(p => p.id === `pkg-${selectedLightboxImg.id}` || p.id.includes(selectedLightboxImg.id) || selectedLightboxImg.id.includes(p.id.replace('pkg-', ''))) || INITIAL_ALL_CAMPS[0]).id}`}
                                        onClick={() => setSelectedLightboxImg(null)}
                                        style={{
                                            padding: '12px 24px',
                                            borderRadius: '999px',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.25)',
                                            color: '#FFFFFF',
                                            fontSize: '13.5px',
                                            fontWeight: '700',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        Explore Full Details →
                                    </Link>
                                    <button
                                        onClick={() => {
                                            const matchingPkg = INITIAL_ALL_CAMPS.find(p => 
                                                p.id === `pkg-${selectedLightboxImg.id}` ||
                                                p.id.includes(selectedLightboxImg.id) || 
                                                selectedLightboxImg.id.includes(p.id.replace('pkg-', '')) ||
                                                p.title.toLowerCase().includes(selectedLightboxImg.name.toLowerCase().split(' ')[0])
                                            ) || INITIAL_ALL_CAMPS[0];
                                            setSelectedLightboxImg(null);
                                            handleOpenBooking(matchingPkg);
                                        }}
                                        className="btn-lime"
                                        style={{ padding: '12px 28px', fontSize: '14px', fontWeight: '800' }}
                                    >
                                        Book This Campsite →
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 3. Interactive Full Booking Engine Modal */}
            <BookingEngineModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                initialPackage={selectedPackage}
            />

            {/* Floating Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <div style={{
                        position: 'fixed',
                        bottom: '32px',
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        pointerEvents: 'none',
                        zIndex: 100000,
                        padding: '0 16px'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ duration: 0.22 }}
                            style={{
                                pointerEvents: 'auto',
                                background: '#121613',
                                color: '#FFFFFF',
                                padding: '12px 24px',
                                borderRadius: '999px',
                                boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
                                fontSize: '13.5px',
                                fontWeight: '700',
                                border: '1px solid rgba(213, 237, 85, 0.4)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <span>{toastMessage}</span>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            </div>
        </MotionConfig>
    );
}
