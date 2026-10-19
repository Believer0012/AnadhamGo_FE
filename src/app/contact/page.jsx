"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import SiteHeader from '../../components/SiteHeader';
import Footer from '../../components/Footer';
import CustomThemeCalendar from '../../components/CustomThemeCalendar';
import { useAuth } from '../../hooks/useAuth';
import { inr, generateBookingId } from '../../lib/utils';
import { waLink, buildInquiryWaText } from '../../lib/whatsapp';
import { getSecurityHeaders } from '../../lib/securityClient';
import { Phone, PhoneCall, Mail, Mountain, Plane, Car, SquareParking, Truck, Check, MapPin } from 'lucide-react';
import { WhatsAppIcon } from '../../components/common/BrandIcons';

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

const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '919074858014';
const formattedAdminPhone = adminPhone.length === 12 && adminPhone.startsWith('91')
    ? `+91 ${adminPhone.slice(2, 7)} ${adminPhone.slice(7)}`
    : `+${adminPhone}`;

// ── CONTACT DISPATCH CHANNELS ──
const CONTACT_CHANNELS = [
    {
        id: 'phone',
        badge: '24/7 EXPEDITION HOTLINE',
        title: 'Direct Voice Concierge',
        val: formattedAdminPhone,
        sub: 'Live basecamp coordinators on ridge',
        icon: Phone,
        href: `tel:+${adminPhone}`,
        actionLabel: 'Call Concierge',
        accent: '#E5A93B'
    },
    {
        id: 'whatsapp',
        badge: 'PRIORITY DISPATCH',
        title: 'WhatsApp Travel Desk',
        val: formattedAdminPhone,
        sub: 'Instant booking & route guidance',
        icon: WhatsAppIcon,
        href: waLink('Hi Aanandham Concierge! I have an inquiry regarding campsites and treks.'),
        actionLabel: 'WhatsApp Chat →',
        accent: '#25D366'
    },
    {
        id: 'email',
        badge: 'EXPEDITION DESK',
        title: 'Reservations & Media',
        val: 'bookings@aanandham.in',
        sub: 'Replies within 2 to 4 hours',
        icon: Mail,
        href: 'mailto:bookings@aanandham.in',
        actionLabel: 'Send Email →',
        accent: '#D5ED55'
    },
    {
        id: 'location',
        badge: 'SANCTUARY LOCATION',
        title: 'Suryanelli Base Station',
        val: 'Suryanelli, Munnar, Kerala 685618',
        sub: '6,500 FT Elevation · Western Ghats',
        icon: Mountain,
        href: 'https://maps.google.com/?q=Suryanelli+Munnar+Kerala',
        actionLabel: 'Google Maps →',
        accent: '#F28B66'
    }
];

// ── EXPEDITION TYPE TEMPLATES & MODAL CONFIGURATION ──
const EXPEDITION_TEMPLATES = {
    booking: {
        id: 'booking',
        title: 'Dome Glamp',
        tagline: 'Luxury Weatherproof Dome Stay & Mountain BBQ',
        badge: 'GLAMPING SUITE',
        accent: '#D5ED55',
        defaultMessage: 'Interested in luxury weatherproof dome glamping overlooking the clouds. Please share package availability with campfire BBQ & western washroom setup.',
        modalTitle: 'Customize Dome Glamping Details',
        categories: [
            {
                key: 'campsite',
                label: 'Preferred Mountain Sanctuary',
                options: ['Suryanelli Cloud Bed (6,200 FT)', 'Phantom Head Ridge (6,500 FT)', 'Vagamon Pine Glamp (3,800 FT)', 'Flexible / Best View']
            },
            {
                key: 'bbq',
                label: 'Campfire BBQ Preference',
                options: ['Veg Paneer & Grilled Corn Platter', 'Non-Veg Chicken & Spiced BBQ', 'Jain / Pure Vegetarian', 'Both Veg & Non-Veg Spread']
            },
            {
                key: 'occasion',
                label: 'Expedition Occasion',
                options: ['Couple / Anniversary Romantic Sanctuary', 'Family Cloud Pod Vacation', 'Friends Squad Gathering', 'Solo Explorer Nature Retreat']
            }
        ]
    },
    kolukkumalai: {
        id: 'kolukkumalai',
        title: '4x4 Safari',
        tagline: 'High-Altitude Peak Sunrise & Off-Road Convoy',
        badge: 'KOLUKKUMALAI RIDGE',
        accent: '#E5A93B',
        defaultMessage: 'Looking for Kolukkumalai 7,900 FT Sunrise 4x4 Jeep Safari to Jagged Rock Point. Arriving at Suryanelli basecamp.',
        modalTitle: 'Configure Kolukkumalai 4x4 Sunrise Safari',
        categories: [
            {
                key: 'slot',
                label: 'Preferred Safari Departure',
                options: ['04:30 AM Peak Cloud-Bed Sunrise (Most Popular)', '03:00 PM Golden Hour Sunset Trail', 'Full Day Off-Road Wilderness Circuit']
            },
            {
                key: 'jeep',
                label: '4x4 Convoy Allocation',
                options: ['Private Exclusive 4x4 Mahindra Thar (Up to 6 Pax)', 'Shared Convoy Safari Slot', 'Open-Top Wildlife Jeep']
            },
            {
                key: 'pickup',
                label: 'Pickup & Meeting Hub',
                options: ['Suryanelli Base Hub (Safe Private Parking)', 'Munnar Town Center Pickup', 'Direct Camp Check-In']
            }
        ]
    },
    custom: {
        id: 'custom',
        title: 'Squad Offsite',
        tagline: 'Corporate Retreats & Private Mountain Buyouts',
        badge: 'GROUP EXPEDITION',
        accent: '#60A5FA',
        defaultMessage: 'Planning a corporate retreat / squad buyout. Require private campsite, bonfire setup, guided ridge treks, and custom catering.',
        modalTitle: 'Configure Squad Buyout / Corporate Retreat',
        categories: [
            {
                key: 'groupSize',
                label: 'Squad / Team Size',
                options: ['10 to 15 Members', '16 to 25 Members', '26 to 45+ Full Mountain Buyout']
            },
            {
                key: 'activities',
                label: 'Curated Offsite Activities',
                options: ['Guided Forest & Peak Trek', 'Outdoor Team Leadership Drills', 'Live Acoustic Campfire & BBQ Night', 'Stargazing Astronomy Session']
            },
            {
                key: 'catering',
                label: 'Group Dining & Catering',
                options: ['Authentic Kerala Sadya & Buffet', 'High-Altitude Live BBQ & Grills', 'Continental & Multi-Cuisine Spread']
            }
        ]
    },
    general: {
        id: 'general',
        title: 'General Query',
        tagline: 'Route Directions, Road Status & Basecamp Rules',
        badge: 'CONCIERGE DESK',
        accent: '#A7F3D0',
        defaultMessage: 'I have a few questions regarding road conditions, safe parking at Suryanelli basecamp, pet friendliness, and booking terms.',
        modalTitle: 'General Basecamp Inquiry',
        categories: [
            {
                key: 'topic',
                label: 'Topic of Inquiry',
                options: ['Road Conditions & Low Ground-Clearance Cars', 'Safe Parking & Overnight Security at Hub', 'Pet Policy & Family Safety', 'Weather Forecast & Best Visiting Months', 'Cancellation & Date Rescheduling']
            }
        ]
    }
};

// ── 4-STEP TRAVEL GUIDE TO SURYANELLI BASECAMP (Vibrant Sticky Paper Notes) ──
const TRAVEL_STEPS = [
    {
        num: 'STAGE 01',
        title: 'Arrive in Munnar / Kochi',
        desc: 'Fly into Cochin Int\'l Airport (COK) or take the train to Aluva / Ernakulam. Luxury private cabs & express KSRTC mountain buses run daily directly to Munnar town.',
        time: 'Approx 3.5 hrs from Kochi (COK)',
        tag: 'STAGE · 01',
        stamp: 'PAVED HIGHWAY',
        stampColor: '#166534',
        paperBg: '#FEF08A', // Sunlit Canary Yellow
        inkColor: '#1A2218',
        rotation: '-1.5deg',
        icon: Plane,
        memo: 'Early morning drives through Neriamangalam forest offer misty river valley views.'
    },
    {
        num: 'STAGE 02',
        title: 'Drive Lockhart Gap Route',
        desc: 'From Munnar town, ascend the breathtaking Lockhart Gap scenic mountain corridor towards Suryanelli. Completely paved and accessible to all cars.',
        time: '24 km · 45 mins from Munnar',
        tag: 'STAGE · 02',
        stamp: 'SCENIC CORRIDOR',
        stampColor: '#047857',
        paperBg: '#A7F3D0', // Alpine Mint
        inkColor: '#0A2518',
        rotation: '1.5deg',
        icon: Car,
        memo: 'Roll windows down to catch fresh eucalyptus and high-grown tea leaf aromas.'
    },
    {
        num: 'STAGE 03',
        title: 'Safe Parking at Base Camp',
        desc: 'Pull into our Aanandham Suryanelli meeting station. Safe monitored parking for personal cars with restrooms and welcoming hot cardamom tea.',
        time: 'Complimentary Camper Parking',
        tag: 'STAGE · 03',
        stamp: 'MONITORED PARKING',
        stampColor: '#C2410C',
        paperBg: '#FED7AA', // Sunburst Peach
        inkColor: '#2B1405',
        rotation: '-1.2deg',
        icon: SquareParking,
        memo: 'Our camp staff meet you at basecamp to assist with luggage and boarding badges.'
    },
    {
        num: 'STAGE 04',
        title: 'Hop on 4x4 Jeep Safari',
        desc: 'Board our rugged 4x4 Mahindra Jeeps for an off-road ridge climb navigating private rocky tea estate trails to our secluded 7,900 FT ridge sanctuary.',
        time: 'Included with all Camp Packages',
        tag: 'STAGE · 04',
        stamp: '4X4 OFF-ROAD SAFARI',
        stampColor: '#15803D',
        paperBg: '#BAE6FD', // Glacial Sky Blue
        inkColor: '#0C2333',
        rotation: '1.6deg',
        icon: Truck,
        memo: 'The 4x4 climb through mountain mists is an unforgettable highlight in itself!'
    }
];

// ── FREQUENTLY ASKED TRAVEL & CONTACT QUESTIONS ──
const CONTACT_FAQS = [
    {
        num: '01',
        q: 'How far in advance should we reserve our dome stay or sunrise safari?',
        a: 'We recommend booking 2 to 3 weeks in advance for weekends and peak season (September through February) as our private geodesic domes and 4x4 safari slots are limited to maintain low crowd density on the ridge.'
    },
    {
        num: '02',
        q: 'Can low-ground-clearance sedans reach the Suryanelli meeting base?',
        a: 'Yes, absolutely! The road from Kochi/Munnar to our Suryanelli meeting station is completely paved and accessible to all hatchbacks, sedans, and SUVs. From our meeting base, our 4x4 Jeeps take care of the off-road ridge climb.'
    },
    {
        num: '03',
        q: 'Do you arrange airport transfers from Kochi or Madurai?',
        a: 'Yes. We have trusted cab partners offering direct airport/station pick-ups and drops from Cochin International Airport (COK), Coimbatore (CJB), and Madurai (IXM) at standardized rates.'
    },
    {
        num: '04',
        q: 'What is the check-in and check-out schedule?',
        a: 'Standard check-in is at 3:00 PM (welcoming you with hot cardamom tea and sunset ridge hikes) and check-out is at 11:00 AM the following morning following the sunrise Kolukkumalai expedition and breakfast.'
    }
];

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        inquiryType: 'booking',
        guests: '2',
        travelDates: '',
        message: '',
        honeypot: ''
    });

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submissionMode, setSubmissionMode] = useState('whatsapp');
    const [waUrl, setWaUrl] = useState('');
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalSelections, setModalSelections] = useState({});
    const [activeFaq, setActiveFaq] = useState(0);
    const [lastSubmitTime, setLastSubmitTime] = useState(0);
    const { user: currentUser, logout: handleLogout } = useAuth();

    const ctaRef = useRef(null);
    const { scrollYProgress: ctaScrollProgress } = useScroll({
        target: ctaRef,
        offset: ["start end", "end start"]
    });
    const ctaBgScale = useTransform(ctaScrollProgress, [0, 0.5, 1], [1.0, 1.16, 1.28]);

    const handleTypeSelect = (typeId) => {
        const template = EXPEDITION_TEMPLATES[typeId];
        const prevDefaultMessages = Object.values(EXPEDITION_TEMPLATES).map(t => t.defaultMessage);
        
        const shouldUpdateMsg = !formData.message || prevDefaultMessages.includes(formData.message) || formData.message.startsWith('Selected Package:');
        
        setFormData(prev => ({
            ...prev,
            inquiryType: typeId,
            message: shouldUpdateMsg ? template.defaultMessage : prev.message,
            guests: typeId === 'custom' ? '10+' : prev.guests
        }));

        const initialSelections = {};
        template.categories.forEach(cat => {
            initialSelections[cat.key] = cat.options[0];
        });
        setModalSelections(initialSelections);
    };

    const applyModalCustomization = () => {
        const template = EXPEDITION_TEMPLATES[formData.inquiryType] || EXPEDITION_TEMPLATES.booking;
        const lines = [
            `Selected Package: ${template.title}`,
            ...template.categories.map(cat => `• ${cat.label}: ${modalSelections[cat.key] || cat.options[0]}`),
            '',
            'Please confirm availability and share advance payment details.'
        ];
        setFormData(prev => ({
            ...prev,
            message: lines.join('\n')
        }));
        setIsModalOpen(false);
    };

        const handleSend = async (e, mode = 'whatsapp') => {
        if (e) e.preventDefault();

        if (!formData.name || !formData.email) {
            alert('Please fill in your name and email address.');
            return;
        }

        // 🛡️ BOT & HONEYPOT TRAP (B5)
        if (formData.honeypot && formData.honeypot.trim().length > 0) {
            setSubmitted(true);
            return;
        }

        // Rapid submission cooldown
        const now = Date.now();
        if (now - lastSubmitTime < 2000) {
            return;
        }
        setLastSubmitTime(now);
        setLoading(true);
        setSubmissionMode(mode);

        const summaryText = buildInquiryWaText({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone ? formData.phone.trim() : 'N/A',
            subject: `[${formData.inquiryType.toUpperCase()}] Stay Inquiry (${formData.guests} Campers · ${formData.travelDates || 'Flexible'})`,
            message: formData.message.trim() || 'I would like to check availability and package details for this expedition.'
        });

        const link = waLink(summaryText);
        setWaUrl(link);

        if (mode === 'whatsapp') {
            // 🚀 INSTANT SPOT-ON DISPATCH: Trigger WhatsApp immediately before any async wait so browser never blocks popup
            try {
                const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                if (isMobile) {
                    window.location.href = link;
                } else {
                    window.open(link, '_blank', 'noopener,noreferrer');
                }
            } catch (err) {
                console.warn('[WHATSAPP OPEN TRIGGER]', err);
            }

            // Sync lead to CRM in background without blocking user
            const newInquiryRecord = {
                id: generateBookingId(),
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone ? formData.phone.trim() : 'N/A',
                package: `[${formData.inquiryType.toUpperCase()}] ${formData.message ? formData.message.slice(0, 40) : 'General Inquiry'}...`,
                region: 'Kerala Inquiry',
                dates: formData.travelDates || 'Flexible',
                guests: Number(formData.guests) || 2,
                roomType: formData.inquiryType === 'corporate' ? 'Private Buyout' : 'Custom Inquiry',
                addons: [],
                total: (Number(formData.guests) || 2) * 2499,
                status: 'Pending',
                source: 'Contact Form (WhatsApp Direct)',
                notes: formData.message.trim(),
                inquiryType: formData.inquiryType,
                travelDates: formData.travelDates || 'Flexible',
                message: formData.message.trim(),
                createdAt: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
                mode: 'whatsapp'
            };

            fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newInquiryRecord)
            }).catch(() => {});

            try {
                const currentBookings = JSON.parse(localStorage.getItem('aanandham_admin_bookings_v2') || '[]');
                localStorage.setItem('aanandham_admin_bookings_v2', JSON.stringify([newInquiryRecord, ...currentBookings]));
                window.dispatchEvent(new Event('storage'));
            } catch (e) {}

            setLoading(false);
            setSubmitted(true);
        } else {
            // ✉️ EMAIL MODE: Send directly through Resend backend API (Zero external redirect)
            try {
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: await getSecurityHeaders({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify({
                        name: formData.name.trim(),
                        email: formData.email.trim(),
                        phone: formData.phone ? formData.phone.trim() : 'N/A',
                        inquiryType: formData.inquiryType,
                        guests: Number(formData.guests) || 2,
                        travelDates: formData.travelDates || 'Flexible',
                        message: formData.message.trim(),
                        honeypot: formData.honeypot
                    })
                });

                const data = await res.json();
                if (!data.success) {
                    console.warn('[CONTACT RESEND API WARNING]', data.message);
                }
            } catch (err) {
                console.error('[CONTACT DISPATCH ERROR]', err);
            }

            setLoading(false);
            setSubmitted(true);
        }
    };

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
                activePage="contact" 
                currentUser={currentUser} 
                onLogout={handleLogout}
            />

            <main id="contact-content">
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
                        padding: 'clamp(120px, 16vh, 160px) clamp(20px, 4vw, 48px) clamp(50px, 8vh, 80px)',
                        backgroundImage: 'url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=95")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center 40%',
                        color: '#FFFFFF'
                    }}
                >
                    {/* Radial Obsidian Overlay */}
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

                        {/* Main Headline */}
                        <motion.h1 
                            className="hero-headline"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'clamp(38px, 6vw, 74px)',
                                fontWeight: '800',
                                lineHeight: 1.08,
                                letterSpacing: '-0.04em',
                                color: '#FFFFFF',
                                marginBottom: '20px'
                            }}
                        >
                            <span className="text-hover-marker text-hover-marker-dark" style={{ cursor: 'pointer', display: 'inline-block' }}>
                                <span className="marker-text">
                                    Basecamp Concierge<span style={{ color: '#E5A93B' }}> & Inquiries</span>
                                </span>
                            </span>
                            <br />
                            <span style={{ fontSize: '0.62em', fontWeight: '700', color: '#E1E9E2', letterSpacing: '-0.02em' }}>
                                24/7 Reservations & High-Altitude Trek Dispatch
                            </span>
                        </motion.h1>

                        {/* Subtitle Description */}
                        <motion.p
                            className="hero-subtitle"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.75, delay: 0.2 }}
                            style={{
                                fontSize: 'clamp(15px, 2vw, 18px)',
                                color: 'rgba(255, 255, 255, 0.88)',
                                lineHeight: 1.65,
                                maxWidth: '760px',
                                margin: '0 auto clamp(24px, 4vh, 36px)'
                            }}
                        >
                            Have questions about geodesic dome glamping, 4x4 Kolukkumalai sunrise safaris, corporate offsites, or custom itineraries? Our mountain team is here 24/7.
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
                            <a
                                href={waLink('Hi Aanandham Desk! I have an inquiry regarding campsites and treks.')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-lime"
                                style={{
                                    padding: '14px 32px',
                                    fontSize: '15px',
                                    textDecoration: 'none',
                                    boxShadow: '0 10px 30px rgba(213, 237, 85, 0.35)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <WhatsAppIcon size={18} />
                                <span>Instant WhatsApp Concierge →</span>
                            </a>

                            <a
                                href="#inquiry-form"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textDecoration: 'none',
                                    background: 'rgba(0, 0, 0, 0.45)',
                                    border: '1px solid rgba(255, 255, 255, 0.4)',
                                    color: '#FFFFFF',
                                    padding: '13px 28px',
                                    borderRadius: '999px',
                                    fontWeight: '600',
                                    fontSize: '15px',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                Send Expedition Form ↓
                            </a>
                        </motion.div>
                    </motion.div>
                </section>

                {/* ─────────────────────────────────────────────────────────────
                    2. SECTION: DIRECT BASECAMP DISPATCH CHANNELS (4 High-Contrast Cards)
                ───────────────────────────────────────────────────────────── */}
                <motion.section 
                    id="dispatch-channels"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={sectionReveal}
                    style={{
                        padding: '90px clamp(20px, 4vw, 48px)',
                        background: '#FFFFFF',
                        borderBottom: '1px solid rgba(18, 22, 19, 0.06)'
                    }}
                >
                    <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
                        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                            <div className="star-badge" style={{ margin: '0 auto 14px' }}>
                                <span className="star-icon">★</span> DIRECT BASECAMP DISPATCH
                            </div>
                            <h2 style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'clamp(30px, 4.5vw, 48px)',
                                fontWeight: '800',
                                color: '#121613',
                                letterSpacing: '-0.03em',
                                margin: '0 0 12px'
                            }}>
                                Instant Mountain Contact Channels
                            </h2>
                            <p style={{ fontSize: '15.5px', color: '#59655D', maxWidth: '600px', margin: '0 auto' }}>
                                Direct connection to our camp staff, reservation desks, and emergency mountain logistics team.
                            </p>
                        </div>

                        {/* 4 Dispatch Channel Cards Grid */}
                        <motion.div 
                            variants={staggerContainer}
                            className="contact-channels-grid"
                        >
                            {CONTACT_CHANNELS.map((ch, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={cardReveal}
                                    whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}
                                    style={{
                                        background: '#F8F9F5',
                                        borderRadius: '24px',
                                        padding: '30px 24px',
                                        border: '1px solid rgba(18, 22, 19, 0.08)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        minHeight: '260px'
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                                            <div style={{
                                                width: '46px',
                                                height: '46px',
                                                borderRadius: '14px',
                                                background: '#121613',
                                                color: ch.accent,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '19px'
                                            }}>
                                                <ch.icon size={19} color={ch.accent} />
                                            </div>

                                            <span style={{
                                                fontSize: '10.5px',
                                                fontWeight: '800',
                                                background: 'rgba(229, 169, 59, 0.14)',
                                                color: '#C86D14',
                                                padding: '4px 10px',
                                                borderRadius: '999px',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {ch.badge}
                                            </span>
                                        </div>

                                        <h3 style={{
                                            fontFamily: 'var(--font-heading)',
                                            fontSize: '18px',
                                            fontWeight: '800',
                                            color: '#121613',
                                            margin: '0 0 4px'
                                        }}>
                                            {ch.title}
                                        </h3>

                                        <div style={{
                                            fontSize: '15px',
                                            fontWeight: '700',
                                            color: '#121613',
                                            marginBottom: '4px',
                                            wordBreak: 'break-word'
                                        }}>
                                            {ch.val}
                                        </div>

                                        <p style={{ fontSize: '13px', color: '#7E8B82', margin: '0 0 20px' }}>
                                            {ch.sub}
                                        </p>
                                    </div>

                                    <a
                                        href={ch.href}
                                        target={ch.href.startsWith('http') ? '_blank' : '_self'}
                                        rel="noopener noreferrer"
                                        onClick={(e) => {
                                            if (ch.id === 'email') {
                                                if (navigator.clipboard) {
                                                    navigator.clipboard.writeText('bookings@aanandham.in');
                                                    setCopiedEmail(true);
                                                    setTimeout(() => setCopiedEmail(false), 3500);
                                                }
                                                // If on desktop or browser without default email client, also open Gmail compose in new tab
                                                window.open('https://mail.google.com/mail/?view=cm&fs=1&to=bookings@aanandham.in&su=Aanandham%20Wilderness%20Stay%20Inquiry', '_blank');
                                            }
                                        }}
                                        className="action-arrow-btn-dark"
                                        style={{ textDecoration: 'none', position: 'relative' }}
                                    >
                                        <span>{ch.id === 'email' && copiedEmail ? 'Email Copied! ✓' : ch.actionLabel}</span>
                                        <div className="btn-arrow-circle">{ch.id === 'email' && copiedEmail ? '✓' : '→'}</div>
                                    </a>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.section>

                {/* ─────────────────────────────────────────────────────────────
                    3. SECTION: INTERACTIVE EXPEDITION INQUIRY & RESERVATIONS FORM
                ───────────────────────────────────────────────────────────── */}
                <motion.section 
                    id="inquiry-form"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={sectionReveal}
                    style={{
                        padding: '100px clamp(20px, 4vw, 48px)',
                        background: '#F8F9F5',
                        position: 'relative'
                    }}
                >
                    <div style={{ maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
                        <div className="contact-hub-grid">
                            
                            {/* Left Column Narrative */}
                            <div>
                                <div className="star-badge" style={{ marginBottom: '14px' }}>
                                    <span className="star-icon">★</span> CUSTOM EXPEDITION INQUIRY
                                </div>
                                <h2 style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: 'clamp(30px, 4vw, 46px)',
                                    fontWeight: '800',
                                    color: '#121613',
                                    letterSpacing: '-0.035em',
                                    lineHeight: 1.15,
                                    margin: '0 0 16px'
                                }}>
                                    Plan Your Mountain Escape with Our Ridge Guides
                                </h2>
                                <p style={{ fontSize: '15px', color: '#59655D', lineHeight: 1.7, margin: '0 0 24px' }}>
                                    Fill in your preferred dates, party size, and expedition type. Our local team in Suryanelli will personally review availability and respond with a customized route & tariff plan.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
                                    {[
                                        { title: 'Personalized Ridge Itinerary', desc: 'Custom tailored for couples, family treks, or off-road adventure squads.' },
                                        { title: 'Zero Hidden Costs', desc: 'Trek guides, jeep pickups, safe basecamp parking, and camp meals included.' },
                                        { title: 'Weather & Ridge Safety Intel', desc: 'Real-time updates on high-altitude mist, rain forecasts, and sunrise visibility.' }
                                    ].map((feat, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                background: '#E5A93B',
                                                color: '#121613',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '12px',
                                                fontWeight: '800',
                                                flexShrink: 0,
                                                marginTop: '2px'
                                            }}>
                                                ✓
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '14.5px', color: '#121613' }}>{feat.title}</div>
                                                <div style={{ fontSize: '13px', color: '#7E8B82' }}>{feat.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Live Basecamp Status Strip */}
                                <div style={{
                                    background: '#121613',
                                    color: '#FFFFFF',
                                    borderRadius: '16px',
                                    padding: '16px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    border: '1px solid rgba(229, 169, 59, 0.3)'
                                }}>
                                    <div style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        background: '#10B981',
                                        boxShadow: '0 0 10px #10B981',
                                        flexShrink: 0
                                    }} />
                                    <div style={{ fontSize: '13px', fontWeight: '700' }}>
                                        <span style={{ color: '#D5ED55' }}>Live Ridge Status:</span> Guides active on Suryanelli ridge · 14°C mist
                                    </div>
                                </div>
                            </div>

                            {/* Right Column Form Card */}
                            <div style={{
                                background: '#FFFFFF',
                                borderRadius: '28px',
                                padding: 'clamp(24px, 4vw, 36px)',
                                border: '1px solid rgba(18, 22, 19, 0.08)',
                                boxShadow: '0 16px 45px rgba(0, 0, 0, 0.04)'
                            }}>
                                <div className="star-badge" style={{ marginBottom: '8px' }}>
                                    <span className="star-icon">★</span> EXPEDITION DESK
                                </div>
                                <h3 style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '22px',
                                    fontWeight: '800',
                                    color: '#121613',
                                    margin: '0 0 18px'
                                }}>
                                    Send Expedition Request
                                </h3>

                                {submitted ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={{
                                            textAlign: 'center',
                                            padding: '40px 20px',
                                            background: '#F8F9F5',
                                            borderRadius: '20px',
                                            border: '1px solid rgba(18, 22, 19, 0.08)'
                                        }}
                                    >
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '50%',
                                            background: submissionMode === 'email' ? '#D5ED55' : '#E5A93B',
                                            color: '#121613',
                                            fontSize: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 16px'
                                        }}>
                                            {submissionMode === 'email' ? <Mail size={24} /> : <Check size={26} />}
                                        </div>
                                        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: '800', color: '#121613', marginBottom: '8px' }}>
                                            {submissionMode === 'email' ? 'Inquiry Sent via Email!' : 'Inquiry Received!'}
                                        </h4>
                                        <p style={{ fontSize: '14px', color: '#59655D', lineHeight: 1.6, maxWidth: '380px', margin: '0 auto 20px' }}>
                                            {submissionMode === 'email' ? (
                                                <>Thank you, <strong style={{ color: '#121613' }}>{formData.name}</strong>. A confirmation has been dispatched to <strong style={{ color: '#121613' }}>{formData.email}</strong>. Our mountain team will reply within 2 to 4 hours.</>
                                            ) : (
                                                <>Thank you, <strong style={{ color: '#121613' }}>{formData.name}</strong>. Your request has been routed directly to our camp staff.</>
                                            )}
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                                            {submissionMode === 'whatsapp' && waUrl && (
                                                <a
                                                    href={waUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-lime"
                                                    style={{
                                                        padding: '12px 24px',
                                                        fontSize: '13.5px',
                                                        textDecoration: 'none',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}
                                                >
                                                    <WhatsAppIcon size={16} />
                                                    <span>Open WhatsApp Chat →</span>
                                                </a>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setSubmitted(false)}
                                                style={{
                                                    background: '#121613',
                                                    color: '#FFFFFF',
                                                    border: 'none',
                                                    padding: '12px 20px',
                                                    borderRadius: '999px',
                                                    fontSize: '13px',
                                                    fontWeight: '700',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                New Request
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={(e) => handleSend(e, 'whatsapp')} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        
                                        {/* Honeypot Bot Trap (Invisible to humans) */}
                                        <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                                            <label htmlFor="company_website_check">Leave this empty</label>
                                            <input
                                                id="company_website_check"
                                                type="text"
                                                name="company_website_check"
                                                tabIndex="-1"
                                                autoComplete="off"
                                                value={formData.honeypot}
                                                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                <label style={{ fontSize: '11px', fontWeight: '800', color: '#121613', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                                                    Expedition Type
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsModalOpen(true)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#C86D14',
                                                        fontSize: '11px',
                                                        fontWeight: '800',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <span>Custom Options</span>
                                                </button>
                                            </div>
                                            <div className="contact-form-types">
                                                {[
                                                    { id: 'booking', label: 'Dome Glamp' },
                                                    { id: 'kolukkumalai', label: '4x4 Safari' },
                                                    { id: 'custom', label: 'Squad Offsite' },
                                                    { id: 'general', label: 'General Query' }
                                                ].map((t) => {
                                                    const isSel = formData.inquiryType === t.id;
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={t.id}
                                                            onClick={() => handleTypeSelect(t.id)}
                                                            style={{
                                                                padding: '9px 6px',
                                                                borderRadius: '10px',
                                                                border: isSel ? '1.5px solid #121613' : '1px solid rgba(18, 22, 19, 0.1)',
                                                                background: isSel ? '#121613' : '#F8F9F5',
                                                                color: isSel ? '#D5ED55' : '#121613',
                                                                fontSize: '11.5px',
                                                                fontWeight: isSel ? '800' : '600',
                                                                cursor: 'pointer',
                                                                textAlign: 'center',
                                                                transition: 'all 0.15s ease'
                                                            }}
                                                        >
                                                            {t.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Dynamic Tagline & Modal Quick Trigger Banner */}
                                            {EXPEDITION_TEMPLATES[formData.inquiryType] && (
                                                <div style={{
                                                    marginTop: '8px',
                                                    padding: '8px 12px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(18, 22, 19, 0.04)',
                                                    border: '1px dashed rgba(18, 22, 19, 0.12)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '8px'
                                                }}>
                                                    <div style={{ fontSize: '11.5px', color: '#59655D', fontWeight: '600' }}>
                                                        <strong style={{ color: '#121613' }}>{EXPEDITION_TEMPLATES[formData.inquiryType].title}:</strong> {EXPEDITION_TEMPLATES[formData.inquiryType].tagline}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsModalOpen(true)}
                                                        style={{
                                                            background: '#121613',
                                                            color: EXPEDITION_TEMPLATES[formData.inquiryType].accent,
                                                            border: 'none',
                                                            padding: '5px 10px',
                                                            borderRadius: '8px',
                                                            fontSize: '11px',
                                                            fontWeight: '800',
                                                            cursor: 'pointer',
                                                            whiteSpace: 'nowrap',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}
                                                    >
                                                        <span>Configure Options →</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Name & Phone */}
                                        <div className="contact-form-row">
                                            <div>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#121613', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                    Your Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Rahul Nair"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        borderRadius: '12px',
                                                        border: '1.5px solid rgba(18, 22, 19, 0.1)',
                                                        background: '#F8F9F5',
                                                        fontSize: '13.5px',
                                                        color: '#121613',
                                                        outline: 'none',
                                                        boxSizing: 'border-box'
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#121613', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                    Phone / WhatsApp *
                                                </label>
                                                <input
                                                    type="tel"
                                                    required
                                                    placeholder="e.g. +91 98765 43210"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        borderRadius: '12px',
                                                        border: '1.5px solid rgba(18, 22, 19, 0.1)',
                                                        background: '#F8F9F5',
                                                        fontSize: '13.5px',
                                                        color: '#121613',
                                                        outline: 'none',
                                                        boxSizing: 'border-box'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Email & Guests */}
                                        <div className="contact-form-row">
                                            <div>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#121613', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    placeholder="e.g. rahul@gmail.com"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        borderRadius: '12px',
                                                        border: '1.5px solid rgba(18, 22, 19, 0.1)',
                                                        background: '#F8F9F5',
                                                        fontSize: '13.5px',
                                                        color: '#121613',
                                                        outline: 'none',
                                                        boxSizing: 'border-box'
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#121613', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                    Campers
                                                </label>
                                                <select
                                                    value={formData.guests}
                                                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        borderRadius: '12px',
                                                        border: '1.5px solid rgba(18, 22, 19, 0.1)',
                                                        background: '#F8F9F5',
                                                        fontSize: '13.5px',
                                                        color: '#121613',
                                                        outline: 'none',
                                                        boxSizing: 'border-box'
                                                    }}
                                                >
                                                    <option value="1">1 Camper (Solo)</option>
                                                    <option value="2">2 Campers (Couple)</option>
                                                    <option value="3-5">3 to 5 (Squad)</option>
                                                    <option value="6-10">6 to 10 (Group)</option>
                                                    <option value="10+">10+ (Offsite)</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Travel Date */}
                                        <div>
                                            <CustomThemeCalendar 
                                                onDateSelect={(date) => setFormData({ ...formData, travelDates: date })}
                                                theme="light"
                                                label="Expedition Date"
                                            />
                                        </div>

                                        {/* Special Notes / Requests */}
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#121613', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                Special Requests / Notes (Optional)
                                            </label>
                                            <textarea
                                                rows="2"
                                                placeholder="e.g. Campfire BBQ, sunrise jeep safari, beginner trek preferences..."
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 14px',
                                                    borderRadius: '12px',
                                                    border: '1.5px solid rgba(18, 22, 19, 0.1)',
                                                    background: '#F8F9F5',
                                                    fontSize: '13.5px',
                                                    color: '#121613',
                                                    outline: 'none',
                                                    boxSizing: 'border-box',
                                                    fontFamily: 'inherit',
                                                    resize: 'none'
                                                }}
                                            />
                                        </div>

                                        {/* Dual Action Submit Buttons: WhatsApp & Email */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '8px' }}>
                                            <button
                                                type="button"
                                                disabled={loading}
                                                onClick={(e) => handleSend(e, 'whatsapp')}
                                                className="btn-lime hover-lift"
                                                style={{
                                                    padding: '13px 18px',
                                                    fontSize: '13.5px',
                                                    fontWeight: '800',
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    boxShadow: '0 8px 24px rgba(213, 237, 85, 0.4)',
                                                    cursor: 'pointer',
                                                    border: 'none',
                                                    borderRadius: '12px'
                                                }}
                                            >
                                                <WhatsAppIcon size={17} />
                                                <span>{loading ? 'Sending...' : 'Send via WhatsApp →'}</span>
                                            </button>

                                            <button
                                                type="button"
                                                disabled={loading}
                                                onClick={(e) => handleSend(e, 'email')}
                                                className="hover-lift"
                                                style={{
                                                    padding: '13px 18px',
                                                    fontSize: '13.5px',
                                                    fontWeight: '800',
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    background: '#121613',
                                                    color: '#FFFFFF',
                                                    borderRadius: '12px',
                                                    border: '1px solid rgba(255,255,255,0.15)',
                                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Mail size={15} color="#D5ED55" />
                                                <span>{loading ? 'Sending...' : 'Send via Email →'}</span>
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>

                        </div>
                    </div>
                </motion.section>

                {/* ─────────────────────────────────────────────────────────────
                    4. 4-STEP TRAVEL GUIDE TO SURYANELLI BASECAMP
                ───────────────────────────────────────────────────────────── */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    variants={sectionReveal}
                    style={{
                        padding: '100px 24px',
                        background: '#0B150E',
                        position: 'relative',
                        color: '#FFFFFF'
                    }}
                >
                    <div style={{ width: '100%', maxWidth: 'min(100%, 1380px)', margin: '0 auto', boxSizing: 'border-box' }}>
                        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                            <div className="star-badge" style={{ margin: '0 auto 16px' }}>
                                <span className="star-icon">★</span> ROUTE INTELLIGENCE
                            </div>
                            <h2 style={{
                                fontFamily: 'var(--font-heading), "Bricolage Grotesque", sans-serif',
                                fontSize: 'clamp(32px, 4.5vw, 50px)',
                                fontWeight: '800',
                                color: '#FFFFFF',
                                letterSpacing: '-0.03em',
                                margin: '0 0 14px'
                            }}>
                                How to Reach <span style={{ color: '#E5A93B' }}>Suryanelli Basecamp</span>
                            </h2>
                            <p style={{ fontSize: '16px', color: '#A2B6A6', maxWidth: '640px', margin: '0 auto' }}>
                                Clear step-by-step navigation from major Kerala & Tamil Nadu transit hubs.
                            </p>
                        </div>

                        {/* 4 Pinned Notebook Pages Grid (4 in a Single Horizontal Row on Desktop) */}
                        <motion.div 
                            variants={staggerContainer}
                            className="route-notebook-grid"
                            style={{
                                paddingTop: '24px'
                            }}
                        >
                            {TRAVEL_STEPS.map((st, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={cardReveal}
                                    className="route-notebook-sheet"
                                    whileHover={{ 
                                        y: -14, 
                                        rotate: 0,
                                        scale: 1.03,
                                        boxShadow: '0 32px 70px -10px rgba(0, 0, 0, 0.7), 0 12px 24px -4px rgba(0, 0, 0, 0.35)'
                                    }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                                    style={{
                                        background: st.paperBg,
                                        color: st.inkColor,
                                        transform: `rotate(${st.rotation})`
                                    }}
                                >
                                    {/* Realistic 3D Metallic Pushpin Pinned at Top Center (No Washi Tape) */}
                                    <motion.div
                                        whileHover={{ scale: 1.2, y: -2 }}
                                        transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                                        style={{
                                            position: 'absolute',
                                            top: '-12px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            zIndex: 6,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {/* Pin Cast Shadow */}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '-4px',
                                            right: '-4px',
                                            width: '14px',
                                            height: '14px',
                                            borderRadius: '50%',
                                            background: 'rgba(0, 0, 0, 0.4)',
                                            filter: 'blur(2px)'
                                        }} />
                                        {/* 3D Brass Metallic Pin Head */}
                                        <div style={{
                                            width: '22px',
                                            height: '22px',
                                            borderRadius: '50%',
                                            background: 'radial-gradient(circle at 32% 32%, #FEF08A 0%, #E5A93B 55%, #78350F 100%)',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 2px 3px rgba(255,255,255,0.8), inset 0 -2px 3px rgba(0,0,0,0.6)',
                                            border: '1.5px solid #92400E',
                                            position: 'relative'
                                        }}>
                                            {/* Specular Highlight Point */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '3px',
                                                left: '4px',
                                                width: '5px',
                                                height: '5px',
                                                borderRadius: '50%',
                                                background: '#FFFFFF',
                                                opacity: 0.9
                                            }} />
                                        </div>
                                    </motion.div>

                                    {/* 3 Punched Spiral Binder Holes along Top Edge */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '8px',
                                        left: '24px',
                                        right: '24px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        opacity: 0.25,
                                        pointerEvents: 'none'
                                    }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0B150E' }} />
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0B150E' }} />
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0B150E' }} />
                                    </div>

                                    {/* 3D Folded Dog-Ear Corner at Bottom Right */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        width: '36px',
                                        height: '36px',
                                        background: 'linear-gradient(135deg, transparent 50%, rgba(0, 0, 0, 0.22) 50%, rgba(0,0,0,0.08) 100%)',
                                        borderTopLeftRadius: '14px',
                                        boxShadow: '-2px -2px 6px rgba(0,0,0,0.12)',
                                        pointerEvents: 'none'
                                    }} />

                                    {/* Header Row: Stage Badge + Mini Logo + Vintage Ink Stamp */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <img
                                                src="/logo.png"
                                                alt="Aanandham Logo"
                                                style={{
                                                    height: '22px',
                                                    width: '22px',
                                                    objectFit: 'contain',
                                                    borderRadius: '50%',
                                                    border: '1px solid rgba(0,0,0,0.15)'
                                                }}
                                             loading="lazy" decoding="async"/>
                                            <span style={{
                                                fontSize: '10.5px',
                                                fontWeight: '900',
                                                letterSpacing: '1px',
                                                textTransform: 'uppercase',
                                                background: 'rgba(0,0,0,0.07)',
                                                padding: '3px 8px',
                                                borderRadius: '5px'
                                            }}>
                                                {st.tag}
                                            </span>
                                        </div>

                                        {/* Vintage Double-Bordered Ink Stamp with Pop on Hover */}
                                        <motion.div
                                            whileHover={{ rotate: 0, scale: 1.08 }}
                                            transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                                            style={{
                                                border: `1.5px solid ${st.stampColor}`,
                                                outline: `1px dashed ${st.stampColor}`,
                                                outlineOffset: '2px',
                                                color: st.stampColor,
                                                padding: '3px 7px',
                                                borderRadius: '4px',
                                                fontSize: '8.5px',
                                                fontWeight: '900',
                                                letterSpacing: '0.8px',
                                                textTransform: 'uppercase',
                                                transform: 'rotate(-3deg)',
                                                opacity: 0.95,
                                                userSelect: 'none',
                                                background: 'rgba(255,255,255,0.6)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {st.stamp}
                                        </motion.div>
                                    </div>

                                    {/* Icon & Bold Headline */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '12px',
                                            background: 'rgba(0, 0, 0, 0.07)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '17px',
                                            color: st.inkColor,
                                            flexShrink: 0
                                        }}>
                                            <st.icon size={17} color={st.inkColor} />
                                        </div>
                                        <h3 style={{
                                            fontFamily: 'var(--font-heading), "Bricolage Grotesque", sans-serif',
                                            fontSize: '18.5px',
                                            fontWeight: '800',
                                            lineHeight: 1.2,
                                            margin: 0,
                                            color: st.inkColor,
                                            letterSpacing: '-0.02em'
                                        }}>
                                            {st.title}
                                        </h3>
                                    </div>

                                    {/* Description */}
                                    <p style={{
                                        fontSize: '13px',
                                        lineHeight: 1.7,
                                        margin: '0 0 14px',
                                        opacity: 0.94,
                                        fontWeight: '500'
                                    }}>
                                        {st.desc}
                                    </p>

                                    {/* Transit Time Pill */}
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '11.5px',
                                        fontWeight: '800',
                                        background: 'rgba(0,0,0,0.06)',
                                        padding: '5px 10px',
                                        borderRadius: '6px',
                                        marginBottom: '14px',
                                        width: 'fit-content',
                                        color: st.stampColor
                                    }}>
                                        <span>⏱</span>
                                        <span>{st.time}</span>
                                    </div>

                                    {/* Handwritten Field Memo */}
                                    <div style={{
                                        marginTop: 'auto',
                                        paddingTop: '12px',
                                        borderTop: '1px dashed rgba(0, 0, 0, 0.16)',
                                        fontStyle: 'italic',
                                        fontSize: '12px',
                                        lineHeight: '1.5',
                                        opacity: '0.9',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '6px'
                                    }}>
                                        <span style={{ fontSize: '13px', display: 'inline-flex' }}><MapPin size={13} /></span>
                                        <span>{st.memo}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.section>

                {/* ─────────────────────────────────────────────────────────────
                    5. SECTION: BASECAMP TRAVEL FAQ & MOUNTAIN LOGISTICS
                ───────────────────────────────────────────────────────────── */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={sectionReveal}
                    style={{
                        padding: '100px clamp(20px, 4vw, 48px)',
                        background: '#FFFFFF',
                        borderTop: '1px solid rgba(18, 22, 19, 0.06)'
                    }}
                >
                    <div style={{ maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
                        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
                            <div className="star-badge" style={{ margin: '0 auto 14px' }}>
                                <span className="star-icon">★</span> LOGISTICS & FAQS
                            </div>
                            <h2 style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'clamp(30px, 4.5vw, 48px)',
                                fontWeight: '800',
                                color: '#121613',
                                letterSpacing: '-0.03em',
                                margin: '0 0 12px'
                            }}>
                                Frequently Asked Travel Questions
                            </h2>
                            <p style={{ fontSize: '15.5px', color: '#59655D', maxWidth: '640px', margin: '0 auto' }}>
                                Everything you need to know about reaching basecamp, weather preparation, dome glamping, and 4x4 safaris.
                            </p>
                        </div>

                        {/* FAQ Accordion List */}
                        <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {CONTACT_FAQS.map((faq, idx) => {
                                const isOpen = activeFaq === idx;
                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            border: '1px solid rgba(18, 22, 19, 0.08)',
                                            borderRadius: '20px',
                                            background: isOpen ? '#F8F9F5' : '#FFFFFF',
                                            overflow: 'hidden',
                                            transition: 'all 0.25s ease'
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setActiveFaq(isOpen ? -1 : idx)}
                                            style={{
                                                width: '100%',
                                                padding: '22px 24px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                gap: '16px'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: '800', color: '#E5A93B' }}>
                                                    {faq.num}
                                                </span>
                                                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '16.5px', fontWeight: '800', color: '#121613' }}>
                                                    {faq.q}
                                                </span>
                                            </div>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: isOpen ? '#121613' : '#F8F9F5',
                                                color: isOpen ? '#D5ED55' : '#121613',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '16px',
                                                fontWeight: '800',
                                                flexShrink: 0,
                                                transform: isOpen ? 'rotate(45deg)' : 'none',
                                                transition: 'transform 0.25s ease, background 0.2s ease, color 0.2s ease'
                                            }}>
                                                +
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                                >
                                                    <div style={{ padding: '0 24px 22px 52px', fontSize: '14.5px', color: '#59655D', lineHeight: 1.65 }}>
                                                        {faq.a}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.section>

                {/* ─────────────────────────────────────────────────────────────
                    6. SECTION: OFFSITE & CORPORATE EXPEDITIONS BANNER
                ───────────────────────────────────────────────────────────── */}
                <motion.section 
                    ref={ctaRef}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={sectionReveal}
                    style={{
                        padding: '110px clamp(20px, 4vw, 48px)',
                        position: 'relative',
                        overflow: 'hidden',
                        color: '#FFFFFF',
                        background: '#0B150E'
                    }}
                >
                    <motion.div 
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: 'url("https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2560&q=95")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            scale: ctaBgScale,
                            opacity: 0.32,
                            pointerEvents: 'none'
                        }}
                    />

                    <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
                        <div className="star-badge" style={{ margin: '0 auto 16px', background: 'rgba(213, 237, 85, 0.15)', border: '1px solid rgba(213, 237, 85, 0.4)', color: '#D5ED55' }}>
                            <span className="star-icon">★</span> SQUAD & OFFSITE ESCAPES
                        </div>
                        <h2 style={{
                            fontFamily: 'var(--font-heading)',
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

            {/* ── INTERACTIVE EXPEDITION CONFIGURATOR MODAL ── */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(11, 21, 14, 0.8)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 99999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px',
                            boxSizing: 'border-box'
                        }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 15 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                background: '#121F16',
                                color: '#FFFFFF',
                                borderRadius: '24px',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                maxWidth: '560px',
                                width: '100%',
                                padding: 'clamp(24px, 4vw, 32px)',
                                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                boxSizing: 'border-box'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div>
                                    <div style={{
                                        display: 'inline-block',
                                        fontSize: '10.5px',
                                        fontWeight: '800',
                                        color: EXPEDITION_TEMPLATES[formData.inquiryType]?.accent || '#D5ED55',
                                        letterSpacing: '1px',
                                        textTransform: 'uppercase',
                                        marginBottom: '4px'
                                    }}>
                                        {EXPEDITION_TEMPLATES[formData.inquiryType]?.badge || 'EXPEDITION'}
                                    </div>
                                    <h3 style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '22px',
                                        fontWeight: '800',
                                        margin: 0,
                                        color: '#FFFFFF'
                                    }}>
                                        {EXPEDITION_TEMPLATES[formData.inquiryType]?.modalTitle || 'Configure Expedition Details'}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{
                                        background: 'rgba(255,255,255,0.08)',
                                        border: 'none',
                                        color: '#FFFFFF',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Categories & Interactive Selectable Chips */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '24px' }}>
                                {EXPEDITION_TEMPLATES[formData.inquiryType]?.categories.map((cat) => (
                                    <div key={cat.key}>
                                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#A2B6A6', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {cat.label}
                                        </label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {cat.options.map((opt) => {
                                                const isSelected = modalSelections[cat.key] === opt;
                                                return (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => setModalSelections(prev => ({ ...prev, [cat.key]: opt }))}
                                                        style={{
                                                            padding: '8px 12px',
                                                            borderRadius: '10px',
                                                            fontSize: '12px',
                                                            fontWeight: isSelected ? '800' : '600',
                                                            border: isSelected ? `1.5px solid ${EXPEDITION_TEMPLATES[formData.inquiryType]?.accent || '#D5ED55'}` : '1px solid rgba(255,255,255,0.1)',
                                                            background: isSelected ? 'rgba(213, 237, 85, 0.12)' : 'rgba(255,255,255,0.04)',
                                                            color: isSelected ? (EXPEDITION_TEMPLATES[formData.inquiryType]?.accent || '#D5ED55') : '#E2E8F0',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.15s ease',
                                                            textAlign: 'left'
                                                        }}
                                                    >
                                                        {opt}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{
                                        padding: '11px 18px',
                                        borderRadius: '12px',
                                        background: 'transparent',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        color: '#FFFFFF',
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={applyModalCustomization}
                                    className="btn-lime"
                                    style={{
                                        padding: '11px 22px',
                                        borderRadius: '12px',
                                        fontSize: '13px',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        border: 'none',
                                        boxShadow: '0 8px 20px rgba(213, 237, 85, 0.3)'
                                    }}
                                >
                                    Apply to Inquiry Form ✓
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── COMPLETE SITE FOOTER ── */}
            <Footer />
        </div>
    );
}
