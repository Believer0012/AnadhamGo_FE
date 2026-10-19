"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SiteHeader from '../../components/SiteHeader';
import Footer from '../../components/Footer';
import { waLink } from '../../lib/whatsapp';
import {
    Code2, Globe, Smartphone, Layers, Cpu,
    Camera, TrendingUp, PenTool, Share2, Users,
    ArrowRight, ArrowUpRight, Star, Award, Zap,
    Clock, HelpCircle, ChevronDown, CheckCircle2,
    DollarSign, Mail, MessageCircle, Briefcase,
    ShieldCheck, Sparkles, Rocket, LayoutGrid, Check,
    Eye
} from 'lucide-react';
import { WhatsAppIcon } from '../../components/common/BrandIcons';

const CONTAINER = { maxWidth: '1440px', margin: '0 auto', width: '100%' };

// ── REVEAL VARIANTS ──
const sectionReveal = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const cardReveal = {
    hidden: { opacity: 0, y: 18, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
};

// ═══════════════════════════════════════════════════════════════════
// TRUST & PERFORMANCE STATS (Original Live Data)
// ═══════════════════════════════════════════════════════════════════

const TRUST_STATS = [
    { icon: Briefcase, value: '9+', label: 'Projects Shipped', sub: 'Production platforms & SaaS' },
    { icon: Users, value: '14+', label: 'Happy Clients', sub: 'Hospitality brands, resorts & cafés' },
    { icon: Award, value: '1+', label: 'Year Combined', sub: 'Studio & engineering delivery' },
    { icon: TrendingUp, value: '94', label: 'Avg. Lighthouse', sub: 'Sub-second speed & SEO' }
];

// ═══════════════════════════════════════════════════════════════════
// 1. SERVICE WINGS (OpenZen Tech Division + Aanandham Studio)
// ═══════════════════════════════════════════════════════════════════

const SERVICE_WINGS = [
    {
        id: 'openzen-tech',
        badge: 'TECH DIVISION · PARTNERSHIP',
        title: 'OpenZen',
        tagline: 'Websites, SaaS Products & Custom Software Engineering',
        description: 'Our technology partnership arm — building production-grade web platforms, SaaS products, and tailored software for hospitality, travel, and consumer brands across India.',
        accent: '#166534',
        accentBg: 'rgba(22, 101, 52, 0.08)',
        accentBorder: 'rgba(22, 101, 52, 0.25)',
        badgeColor: '#166534',
        tagBg: 'rgba(22, 101, 52, 0.08)',
        tagColor: '#166534',
        icon: Cpu,
        logoSrc: '/images/openzone-dark.png',
        btnBg: '#121613',
        btnColor: '#FFFFFF',
        services: [
            {
                title: 'Custom Website Development',
                desc: 'Next.js, React, and headless CMS websites optimised for SEO, performance, and conversion.',
                icon: Globe,
                deliverables: ['Design System', 'Frontend', 'CMS', 'Analytics']
            },
            {
                title: 'SaaS Product Engineering',
                desc: 'Multi-tenant SaaS platforms with subscription billing, dashboards, and admin tooling.',
                icon: Layers,
                deliverables: ['Auth', 'Billing', 'Dashboards', 'APIs']
            },
            {
                title: 'Custom Software & Internal Tools',
                desc: 'Bespoke business automation, CRMs, booking engines, and operations dashboards.',
                icon: Code2,
                deliverables: ['Discovery', 'Build', 'Integrate', 'Maintain']
            },
            {
                title: 'Mobile App Development',
                desc: 'Cross-platform iOS & Android apps with React Native or native stacks.',
                icon: Smartphone,
                deliverables: ['UX', 'Native', 'Backend', 'App Store']
            }
        ],
        ctaText: 'Start a Tech Project',
        waMessage: `*🚀 New Tech Project Inquiry — OpenZen*

Hello OpenZen Team! I would like to discuss building a software / web project with you.

*Services of Interest:*
• Custom Website / Web App (Next.js & React)
• SaaS Product / Internal Dashboard / Tools
• Mobile App Development (iOS / Android)

*Target Timeline:* 4–8 Weeks
*Direct Desk Contact:* +91 90748 58014

Please let me know when we can schedule a 30-minute discovery call and scope review. Thank you!`
    },
    {
        id: 'aanandham-marketing',
        badge: 'IN-HOUSE STUDIO · BRAND & MARKETING',
        title: 'Aanandham Studio',
        tagline: 'Brand Setup, Social Media & Growth Marketing',
        description: 'Our in-house creative and growth studio — full-funnel brand building, social media management, content production, and performance marketing for hospitality and lifestyle brands.',
        accent: '#E5A93B',
        accentBg: 'rgba(229, 169, 59, 0.1)',
        accentBorder: 'rgba(229, 169, 59, 0.35)',
        badgeColor: '#B45309',
        tagBg: 'rgba(229, 169, 59, 0.12)',
        tagColor: '#92400E',
        icon: Sparkles,
        logoSrc: '/logo.png',
        btnBg: '#E5A93B',
        btnColor: '#0B150E',
        services: [
            {
                title: 'Brand Setup & Identity',
                desc: 'Logo, visual language, tone of voice, brand guidelines, and launch collateral.',
                icon: PenTool,
                deliverables: ['Logo', 'Palette', 'Typography', 'Guidelines']
            },
            {
                title: 'Social Media Management',
                desc: 'Instagram, Facebook, YouTube, and LinkedIn — content calendars, reels, and community growth.',
                icon: Share2,
                deliverables: ['Strategy', 'Content', 'Reels', 'Engagement']
            },
            {
                title: 'Performance Marketing',
                desc: 'Meta Ads, Google Ads, and SEO — full-funnel campaigns with weekly optimisation.',
                icon: TrendingUp,
                deliverables: ['Ads', 'SEO', 'Funnels', 'Reporting']
            },
            {
                title: 'Content & Photography',
                desc: 'On-site shoots, drone cinematography, influencer collaborations, and UGC production.',
                icon: Camera,
                deliverables: ['Photo', 'Video', 'Drone', 'Influencer']
            }
        ],
        ctaText: 'Grow Your Brand',
        waMessage: `*🎨 Brand & Growth Inquiry — Aanandham Studio*

Hello Aanandham Studio Team! I would like to discuss brand setup & growth marketing services.

*Services of Interest:*
• Brand Identity, Logo & Style Guidelines
• Social Media Management & Viral Reels
• Performance Marketing (Meta & Google Ads)
• On-Site 4K Drone Cinematography & Content

*Direct Desk Contact:* +91 90748 58014

Please let me know your availability for a creative discovery call. Thank you!`
    }
];

// ═══════════════════════════════════════════════════════════════════
// 2. CASE STUDIES & PORTFOLIO (Live Content with Brand Logos)
// ═══════════════════════════════════════════════════════════════════

const PORTFOLIO_PROJECTS = [
    {
        id: 'p1',
        type: 'tech',
        categoryTag: 'TECH',
        year: '2026',
        client: 'Kalari Travels',
        sub: 'Tour & Travel Platform',
        icon: Globe,
        title: 'Kalari Travels — Tour & Travel Booking Platform',
        desc: 'Comprehensive travel and tour booking platform powered by Next.js architecture with Sanity CMS for dynamic content management.',
        tags: ['Next.js', 'Sanity CMS', 'React', 'Tailwind'],
        image: '/images/services/munnar-mist-ridge.jpg',
        highlights: ['Next.js Architecture', 'Sanity Headless CMS', 'Tour Booking Engine'],
        liveUrl: 'https://kalaritravels.in/'
    },
    {
        id: 'p2',
        type: 'tech',
        categoryTag: 'TECH',
        year: '2025',
        client: 'Aanandham.go',
        sub: 'Web Platform',
        logo: '/logo.png',
        title: 'Aanandham.go — Wilderness Camping & Booking Platform',
        desc: 'Luxury camping, high-altitude ridge dome stays, multi-property booking engine, Razorpay payments, Prisma + PostgreSQL, and QR check-in scanner.',
        tags: ['Next.js', 'Prisma', 'Razorpay', 'Supabase', 'PMS'],
        image: '/images/high-altitude-4x4-convoy.jpg',
        highlights: ['Multi-Property Engine', 'Razorpay Instant Checkout', 'Live QR Check-in'],
        liveUrl: 'https://www.aanandham.in/'
    },
    {
        id: 'p3',
        type: 'tech',
        categoryTag: 'TECH',
        year: '2024',
        client: 'Stay Abroad Living',
        sub: 'Student Relocation Platform',
        icon: Layers,
        title: 'Stay Abroad Living — International Student Housing',
        desc: 'Student relocation and accommodation platform — helping international students find verified housing with seamless booking worldwide.',
        tags: ['WordPress', 'PHP', 'Custom Theme', 'SEO'],
        image: '/images/services/munnar-emerald-hills.jpg',
        highlights: ['Worldwide Housing Search', 'Custom Verification Engine', 'Seamless Booking'],
        liveUrl: 'https://stayabroadliving.com/'
    },
    {
        id: 'p4',
        type: 'tech',
        categoryTag: 'TECH',
        year: '2024',
        client: 'Rpees Millennium Stay Inn',
        sub: '3-Star Resort & Booking Platform',
        icon: Globe,
        title: 'Rpees Millennium Stay Inn — 3-Star Resort Web Platform',
        desc: 'Direct booking portal and web platform for 3-star resort located in Nedumkandam, Idukki — dynamic room showcase, direct inquiries, and seamless booking.',
        tags: ['React', 'Next.js', 'Tailwind', 'Direct Booking'],
        image: '/images/services/munnar-vertical-plantation.jpg',
        highlights: ['Nedumkandam, Idukki', 'Direct Booking Engine', 'Responsive React UI'],
        liveUrl: 'http://rpees.in/'
    },
    {
        id: 'p5',
        type: 'marketing',
        categoryTag: 'MARKETING',
        year: '2025-2026',
        client: 'Aanandham Social',
        sub: 'Brand & Community Growth',
        logo: '/logo.png',
        title: 'Aanandham.go — Wilderness Storytelling & Community',
        desc: 'Reels-first content, drone cinematography, UGC creator partnerships, and authentic high-altitude Western Ghats community building.',
        tags: ['Instagram', 'Reels', 'UGC', 'Community'],
        image: '/images/stargazing-night-skies.jpg',
        highlights: ['Viral Reel Campaigns', 'UGC Creator Network', 'Community First'],
        liveUrl: 'https://instagram.com/aanandham.go'
    }
];

// ═══════════════════════════════════════════════════════════════════
// 3. PACKAGES & TRANSPARENT PRICING
// ═══════════════════════════════════════════════════════════════════

const PRICING_PACKAGES = [
    {
        title: 'Web & Mobile MVP Launch',
        tagline: 'Production Next.js Platform + Brand Identity',
        price: 'Fixed Scope',
        period: '4-Week Turnaround',
        badge: 'STARTER BUNDLE ⭐',
        accent: '#E5A93B',
        division: 'OpenZen Tech',
        waMsg: 'Hi OpenZen! We want to discuss the Web & Mobile MVP Launch package.',
        features: [
            'Custom Next.js Web App with 95+ Lighthouse Score',
            'Complete Brand Identity, Logo & Visual Style System',
            'Razorpay / Stripe Payment Gateway Integration',
            'Automated WhatsApp Lead Concierge & CRM Setup',
            '30 Days Dedicated Production Engineering Support',
            'Weekly Live Staging Sprints & Milestone Demos'
        ],
        ctaText: 'Inquire MVP Build'
    },
    {
        title: 'Brand & Social Acceleration',
        tagline: 'Visual Content, 4K Drone & Reels on Autopilot',
        price: 'Monthly Retainer',
        period: 'Ongoing Growth',
        badge: 'MOST POPULAR STUDIO',
        accent: '#D5ED55',
        division: 'Aanandham Studio',
        logo: '/logo.png',
        waMsg: 'Hi Aanandham Studio! We want to discuss the Brand & Social Acceleration retainer.',
        features: [
            'Monthly On-Location 4K Drone & Video Shoots',
            '16–20 Edited Viral Short-Form Reels / Shorts',
            'Full Social Media Management & Copywriting',
            'Travel Creator & Influencer Collaboration Sourcing',
            'Weekly Community Growth & Engagement Reports',
            'Dedicated Creative Producer & Drone Cinematographer'
        ],
        ctaText: 'Accelerate Your Brand'
    },
    {
        title: 'The Full Growth Ecosystem',
        tagline: 'Custom SaaS/PMS + 4K Media + 6.8x ROAS Ads',
        price: 'Custom Scope',
        period: 'Full Scale Partnership',
        badge: 'HOSPITALITY SUITE',
        accent: '#E5A93B',
        division: 'OpenZen × Aanandham',
        logo: '/logo.png',
        waMsg: 'Hi! We want to discuss The Full Growth Ecosystem with Aanandham × OpenZen.',
        features: [
            'Multi-Tenant Hospitality PMS with QR Gate Access',
            'On-Site 4K FPV Drone Cinematography & Viral Reels',
            'Full-Funnel Performance Marketing (Meta & Google)',
            'Automated GSTR Invoicing & Tax Ledger Integration',
            'OTA Channel Sync (Airbnb, Booking.com, Agoda)',
            'Dedicated Tech & Growth PM with Weekly Analytics'
        ],
        ctaText: 'Discuss Full Suite'
    }
];

// ═══════════════════════════════════════════════════════════════════
// 4. PROCESS STEPS
// ═══════════════════════════════════════════════════════════════════

const PROCESS_STEPS = [
    {
        num: '01',
        title: 'Discovery Call',
        desc: 'We learn your goals, audience, and constraints in a 30-minute call.'
    },
    {
        num: '02',
        title: 'Proposal & Scope',
        desc: 'Detailed scope, timeline, and transparent pricing within 48 hours.'
    },
    {
        num: '03',
        title: 'Design & Build',
        desc: 'Weekly check-ins, async updates, and live staging environment.'
    },
    {
        num: '04',
        title: 'Launch & Iterate',
        desc: 'Smooth launch, post-launch support, and growth optimisation.'
    }
];

const FAQS = [
    {
        q: 'What technology stack does OpenZen use for web and software platforms?',
        a: 'We build with Next.js (App Router), React, Tailwind/Vanilla CSS, Node.js, Prisma, PostgreSQL (Supabase/Neon), and Razorpay/Stripe SDKs. Every project is production-grade, SEO-optimized, and built for sub-second speeds.'
    },
    {
        q: 'How long does a typical brand launch or web build take?',
        a: 'Most web platforms and brand launch MVPs ship in 4 to 6 weeks with weekly live milestone demos. You see active progress every 7 days without lengthy corporate delays.'
    },
    {
        q: 'Who owns the code and creative assets after launch?',
        a: 'You do — 100%. All GitHub repositories, design systems, Figma files, raw 4K video footage, and domain configurations belong entirely to you upon project handover.'
    },
    {
        q: 'What results can we expect from performance marketing and social media?',
        a: 'Our hospitality and lifestyle campaigns have scaled accounts from 0 to 180K followers and achieved verified 6.8x ROAS on Meta and Google Ads. We focus strictly on bottom-line bookings, not vanity metrics.'
    },
    {
        q: 'How do we get started?',
        a: 'Click "Book a Discovery Call" or message us on WhatsApp. We will schedule a quick 30-minute call and deliver a detailed scope proposal within 48 hours.'
    }
];

export default function ServicesPage() {
    const [selectedPortfolioTab, setSelectedPortfolioTab] = useState('all');
    const [openFaq, setOpenFaq] = useState(null);

    const filteredPortfolio = selectedPortfolioTab === 'all'
        ? PORTFOLIO_PROJECTS
        : PORTFOLIO_PROJECTS.filter(p => p.type === selectedPortfolioTab);

    return (
        <>
            <SiteHeader activePage="services" />
            <main id="main-content" style={{ overflow: 'hidden', background: '#0B150E', minHeight: '100vh', color: '#FFFFFF' }}>

                {/* ═══════════════════════════════════════════════════════
                    SECTION 1 [DARK]: HERO SECTION — Atmospheric Munnar Landscape
                ═══════════════════════════════════════════════════════ */}
                <section
                    style={{
                        position: 'relative',
                        minHeight: '88vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 'clamp(120px, 15vw, 165px) clamp(20px, 4vw, 48px) clamp(80px, 10vw, 120px)',
                        background: '#0B150E',
                        overflow: 'hidden'
                    }}
                >
                    {/* Atmospheric Real Munnar Tea Hills Landscape Background */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: 'url("/images/services/munnar-hero-landing.jpg")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center 42%',
                            filter: 'brightness(0.58) saturate(1.15)',
                            transform: 'scale(1)'
                        }}
                    />

                    {/* Gradient Mist Overlay */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(180deg, rgba(11,21,14,0.78) 0%, rgba(11,21,14,0.88) 60%, #0B150E 100%)'
                        }}
                    />

                    {/* Ambient Glow Orbs */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '20%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '600px',
                            height: '350px',
                            background: 'radial-gradient(circle, rgba(229,169,59,0.2) 0%, rgba(22,101,52,0.15) 50%, transparent 80%)',
                            filter: 'blur(60px)',
                            pointerEvents: 'none'
                        }}
                    />

                    <div style={{ ...CONTAINER, position: 'relative', zIndex: 2, textAlign: 'center' }}>
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={sectionReveal}
                            style={{ maxWidth: '960px', margin: '0 auto' }}
                        >
                            {/* Direct Clean Brand Logos & Tag (No background box or pill clutter) */}
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '24px'
                            }}>
                                <img
                                    src="/logo.png"
                                    alt="Aanandham Logo"
                                    width="32"
                                    height="32"
                                    style={{ width: '32px', height: '32px', objectFit: 'contain', background: 'transparent' }}
                                />
                                <span style={{ color: '#E5A93B', fontSize: '15px', fontWeight: '900', lineHeight: 1, opacity: 0.8 }}>×</span>
                                <img
                                    src="/images/openzone-white.png"
                                    alt="OpenZen Logo"
                                    width="32"
                                    height="32"
                                    style={{ width: '32px', height: '32px', objectFit: 'contain', background: 'transparent' }}
                                />
                                <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#E5A93B', letterSpacing: '1.5px', textTransform: 'uppercase', marginLeft: '4px' }}>
                                    AANANDHAM × OPENZEN
                                </span>
                            </div>

                            {/* Main Live Headline from aanandham.in */}
                            <h1 style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'clamp(36px, 5.5vw, 72px)',
                                fontWeight: '800',
                                letterSpacing: '-0.035em',
                                lineHeight: 1.05,
                                color: '#FFFFFF',
                                margin: '0 auto 24px',
                                maxWidth: '900px'
                            }}>
                                We Build <span className="text-marker-2">Brands</span> &amp; <span style={{ color: '#E5A93B' }}>Software</span><br />
                                <span style={{ background: 'linear-gradient(90deg, #E5A93B 0%, #D5ED55 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>That Customers Love</span>
                            </h1>

                            <p style={{
                                fontSize: 'clamp(15px, 1.8vw, 18px)',
                                color: '#A2B6A6',
                                lineHeight: 1.65,
                                maxWidth: '720px',
                                margin: '0 auto 40px',
                                fontWeight: '500'
                            }}>
                                Two service wings under one roof — <strong style={{ color: '#FFFFFF' }}>OpenZen</strong> for web, SaaS &amp; custom software, and <strong style={{ color: '#FFFFFF' }}>Aanandham Studio</strong> for brand setup, social media, and performance marketing. From first sketch to 180K followers.
                            </p>

                            {/* Action Row */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', alignItems: 'center', marginBottom: '48px' }}>
                                <a
                                    href="#wings"
                                    className="services-cta-gold"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '16px 34px',
                                        borderRadius: '999px',
                                        background: '#E5A93B',
                                        color: '#0B150E',
                                        fontWeight: '800',
                                        fontSize: '15px',
                                        textDecoration: 'none',
                                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(229, 169, 59, 0.4)',
                                        transition: 'all 0.25s ease'
                                    }}
                                >
                                    <span>Explore Our Services</span>
                                    <ArrowRight size={16} strokeWidth={3} />
                                </a>

                                <a
                                    href={waLink('Hi! I want to discuss a project with the Aanandham × OpenZen team.')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="services-cta-whatsapp"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '16px 30px',
                                        borderRadius: '999px',
                                        background: 'rgba(37, 211, 102, 0.12)',
                                        color: '#25D366',
                                        fontWeight: '700',
                                        fontSize: '15px',
                                        border: '1px solid rgba(37, 211, 102, 0.35)',
                                        backdropFilter: 'blur(10px)',
                                        textDecoration: 'none',
                                        transition: 'all 0.25s ease'
                                    }}
                                >
                                    <WhatsAppIcon size={18} color="#25D366" />
                                    <span>Book a Discovery Call</span>
                                </a>
                            </div>

                            {/* Glassmorphic Trust Stats Card */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                gap: '16px',
                                maxWidth: '740px',
                                margin: '0 auto',
                                padding: '24px 32px',
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '20px',
                                backdropFilter: 'blur(12px)',
                                boxShadow: '0 12px 36px rgba(0,0,0,0.3)'
                            }}>
                                {TRUST_STATS.map((s, i) => (
                                    <div key={i} style={{ textAlign: 'center' }}>
                                        <s.icon size={20} color="#E5A93B" style={{ marginBottom: '8px' }} />
                                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', fontFamily: 'var(--font-heading)' }}>
                                            {s.value}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#A2B6A6', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '4px' }}>
                                            {s.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    SECTION 2 [LIGHT]: THE TWO SERVICE WINGS (SIDE-BY-SIDE CLEAN BOXES)
                ═══════════════════════════════════════════════════════ */}
                <section
                    id="wings"
                    style={{
                        padding: 'clamp(70px, 8vw, 105px) clamp(20px, 4vw, 48px)',
                        background: '#F8F9F5',
                        color: '#121613'
                    }}
                >
                    <div style={CONTAINER}>
                        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 16px',
                                borderRadius: '999px',
                                background: '#FFFFFF',
                                border: '1px solid rgba(0,0,0,0.08)',
                                fontSize: '12px',
                                fontWeight: '800',
                                color: '#166534',
                                textTransform: 'uppercase',
                                letterSpacing: '1.2px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                marginBottom: '16px'
                            }}>
                                <span style={{ color: '#E5A93B' }}>★</span> TWO SERVICE WINGS
                            </div>

                            <h2 style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'clamp(30px, 4.5vw, 48px)',
                                fontWeight: '800',
                                color: '#121613',
                                letterSpacing: '-0.035em',
                                margin: '0 0 14px'
                            }}>
                                Pick Your <span style={{ color: '#166534', textDecoration: 'underline', textDecorationColor: '#E5A93B' }}>Wing</span>
                            </h2>

                            <p style={{ fontSize: '16px', color: '#4B5563', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
                                Whether you need a custom software product or full-funnel brand growth, we have a dedicated team for it.
                            </p>
                        </div>

                        {/* Side-by-Side Dual Wings Grid */}
                        <div className="wings-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 520px), 1fr))',
                            gap: 'clamp(24px, 3vw, 36px)',
                            alignItems: 'stretch'
                        }}>
                            {SERVICE_WINGS.map((wing) => (
                                <motion.div
                                    key={wing.id}
                                    variants={cardReveal}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0 }}
                                    style={{
                                        background: '#FFFFFF',
                                        border: `1px solid ${wing.accentBorder}`,
                                        borderRadius: '28px',
                                        padding: 'clamp(28px, 3.5vw, 42px)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Top Wing Header with Logo / Emblem */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                {wing.logoSrc ? (
                                                    <img
                                                        src={wing.logoSrc}
                                                        alt={`${wing.title} Logo`}
                                                        width="52"
                                                        height="52"
                                                        style={{
                                                            width: 'clamp(46px, 4vw, 54px)',
                                                            height: 'clamp(46px, 4vw, 54px)',
                                                            objectFit: 'contain',
                                                            background: 'transparent',
                                                            flexShrink: 0
                                                        }}
                                                    />
                                                ) : null}

                                                <div>
                                                    <div style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '3px 8px',
                                                        borderRadius: '6px',
                                                        background: wing.accentBg,
                                                        fontSize: '10.5px',
                                                        fontWeight: '800',
                                                        letterSpacing: '1px',
                                                        textTransform: 'uppercase',
                                                        color: wing.badgeColor,
                                                        marginBottom: '2px'
                                                    }}>
                                                        {wing.badge}
                                                    </div>
                                                    <h3 style={{
                                                        fontFamily: 'var(--font-heading)',
                                                        fontSize: 'clamp(28px, 3.5vw, 38px)',
                                                        fontWeight: '800',
                                                        color: '#121613',
                                                        letterSpacing: '-0.03em',
                                                        margin: 0
                                                    }}>
                                                        {wing.title}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>

                                        <p style={{ fontSize: '15.5px', color: wing.badgeColor, fontWeight: '700', margin: '0 0 10px', lineHeight: 1.4 }}>
                                            {wing.tagline}
                                        </p>

                                        <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.65, margin: '0 0 26px' }}>
                                            {wing.description}
                                        </p>

                                        {/* 4 Clean Sub-Cards Grid (2x2 inside each wing box) */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                            gap: '14px',
                                            marginBottom: '32px'
                                        }}>
                                            {wing.services.map((s, si) => (
                                                <div
                                                    key={si}
                                                    style={{
                                                        background: '#F8F9F5',
                                                        border: '1px solid rgba(0,0,0,0.06)',
                                                        borderRadius: '16px',
                                                        padding: '18px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'space-between',
                                                        transition: 'all 0.25s ease'
                                                    }}
                                                    className="clean-wing-subcard"
                                                >
                                                    <div>
                                                        <div style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '10px',
                                                            background: wing.accentBg,
                                                            color: wing.badgeColor,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            marginBottom: '12px'
                                                        }}>
                                                            <s.icon size={19} />
                                                        </div>

                                                        <h4 style={{
                                                            fontFamily: 'var(--font-heading)',
                                                            fontSize: '15px',
                                                            fontWeight: '800',
                                                            color: '#121613',
                                                            margin: '0 0 6px',
                                                            lineHeight: 1.3
                                                        }}>
                                                            {s.title}
                                                        </h4>

                                                        <p style={{ fontSize: '12.5px', color: '#6B7280', lineHeight: 1.55, margin: '0 0 12px' }}>
                                                            {s.desc}
                                                        </p>
                                                    </div>

                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                        {s.deliverables.map((d, di) => (
                                                            <span
                                                                key={di}
                                                                style={{
                                                                    fontSize: '10px',
                                                                    fontWeight: '700',
                                                                    background: wing.tagBg,
                                                                    color: wing.tagColor,
                                                                    padding: '2px 7px',
                                                                    borderRadius: '5px'
                                                                }}
                                                            >
                                                                {d}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Button at Bottom of Wing Card */}
                                    <div style={{ paddingTop: '18px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                        <a
                                            href={waLink(wing.waMessage)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                fontSize: '14.5px',
                                                padding: '14px 24px',
                                                borderRadius: '999px',
                                                background: wing.btnBg,
                                                color: wing.btnColor,
                                                fontWeight: '800',
                                                textDecoration: 'none',
                                                boxShadow: wing.id === 'openzen-tech'
                                                    ? '0 6px 18px rgba(0,0,0,0.2)'
                                                    : '0 6px 18px rgba(229,169,59,0.3)',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                                        >
                                            <WhatsAppIcon size={16} color={wing.btnColor} />
                                            <span>{wing.ctaText}</span>
                                            <ArrowUpRight size={16} strokeWidth={3} />
                                        </a>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    SECTION 3 [DARK]: SELECTED WORK & PROOF IN PRODUCTION
                ═══════════════════════════════════════════════════════ */}
                <section id="portfolio" style={{ padding: 'clamp(70px, 8vw, 105px) clamp(20px, 4vw, 48px)', background: '#121613', color: '#FFFFFF' }}>
                    <div style={CONTAINER}>
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                padding: '6px 14px',
                                borderRadius: '999px',
                                marginBottom: '16px'
                            }}>
                                <Eye size={14} color="#E5A93B" />
                                <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1.2px', textTransform: 'uppercase', color: '#E5A93B' }}>
                                    SELECTED WORK
                                </span>
                            </div>

                            <h2 style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'clamp(28px, 4vw, 44px)',
                                fontWeight: '800',
                                color: '#FFFFFF',
                                letterSpacing: '-0.035em',
                                margin: '0 0 12px'
                            }}>
                                <span className="text-marker-2">Proof</span> in Production
                            </h2>

                            <p style={{ fontSize: '15px', color: '#A2B6A6', maxWidth: '600px', margin: '0 auto 32px' }}>
                                A selection of recent projects across tech and marketing wings.
                            </p>

                            {/* Portfolio Tabs with Clean Lucide Icons */}
                            <div style={{ display: 'inline-flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                {[
                                    { id: 'all', label: 'All Work', icon: LayoutGrid },
                                    { id: 'tech', label: 'Tech & Software', icon: Code2 },
                                    { id: 'marketing', label: 'Brand & Marketing', icon: Sparkles }
                                ].map(tab => {
                                    const isSelected = selectedPortfolioTab === tab.id;
                                    const TabIcon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setSelectedPortfolioTab(tab.id)}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                background: isSelected ? '#E5A93B' : 'rgba(255,255,255,0.06)',
                                                color: isSelected ? '#0B150E' : '#A2B6A6',
                                                border: `1px solid ${isSelected ? '#E5A93B' : 'rgba(255,255,255,0.12)'}`,
                                                padding: '8px 18px',
                                                borderRadius: '999px',
                                                fontSize: '12.5px',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <TabIcon size={14} color={isSelected ? '#0B150E' : '#A2B6A6'} />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Portfolio Cards Grid */}
                        <motion.div
                            layout
                            className="portfolio-grid"
                            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}
                        >
                            <AnimatePresence>
                                {filteredPortfolio.map((p) => {
                                    const CardIcon = p.icon;
                                    return (
                                        <motion.article
                                            key={p.id}
                                            layout
                                            variants={cardReveal}
                                            initial="hidden"
                                            animate="visible"
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            style={{
                                                background: '#0B150E',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: '20px',
                                                padding: '26px 24px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                                                cursor: 'default'
                                            }}
                                            className="portfolio-work-card"
                                        >
                                            <div>
                                                {/* Top Row: Category Badge & Client + Year */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{
                                                            background: p.categoryTag === 'TECH' ? 'rgba(22, 101, 52, 0.25)' : 'rgba(229, 169, 59, 0.15)',
                                                            color: p.categoryTag === 'TECH' ? '#4ADE80' : '#E5A93B',
                                                            border: `1px solid ${p.categoryTag === 'TECH' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(229, 169, 59, 0.3)'}`,
                                                            padding: '3px 9px',
                                                            borderRadius: '6px',
                                                            fontSize: '10px',
                                                            fontWeight: '800',
                                                            letterSpacing: '0.8px',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {p.categoryTag}
                                                        </span>
                                                        <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: '#E5A93B' }}>
                                                            {p.client} · {p.sub}
                                                        </span>
                                                    </div>

                                                    <span style={{
                                                        background: 'rgba(255,255,255,0.06)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        color: '#A2B6A6',
                                                        padding: '3px 9px',
                                                        borderRadius: '6px',
                                                        fontSize: '10.5px',
                                                        fontWeight: '700'
                                                    }}>
                                                        {p.year}
                                                    </span>
                                                </div>

                                                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '19px', fontWeight: '800', color: '#FFFFFF', lineHeight: 1.3, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                                                    {p.title}
                                                </h3>

                                                <p style={{ fontSize: '13.5px', color: '#A2B6A6', lineHeight: 1.6, margin: '0 0 16px' }}>
                                                    {p.desc}
                                                </p>

                                                {/* Highlights Checklist */}
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                                                    {p.highlights.map((h, hi) => (
                                                        <div
                                                            key={hi}
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '5px',
                                                                background: 'rgba(229, 169, 59, 0.08)',
                                                                border: '1px solid rgba(229, 169, 59, 0.2)',
                                                                color: '#E5A93B',
                                                                padding: '4px 9px',
                                                                borderRadius: '6px',
                                                                fontSize: '10.5px',
                                                                fontWeight: '700'
                                                            }}
                                                        >
                                                            <Check size={10} strokeWidth={3.5} />
                                                            <span>{h}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Tech tags & View Live */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '8px' }}>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                    {p.tags.map((t, ti) => (
                                                        <span key={ti} style={{ fontSize: '10px', fontWeight: '600', background: 'rgba(255,255,255,0.04)', color: '#A2B6A6', padding: '3px 8px', borderRadius: '4px' }}>
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>

                                                {p.liveUrl && (
                                                    <a
                                                        href={p.liveUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            color: '#E5A93B',
                                                            fontSize: '11.5px',
                                                            fontWeight: '800',
                                                            textDecoration: 'none'
                                                        }}
                                                    >
                                                        <span>View Live</span>
                                                        <ArrowUpRight size={12} strokeWidth={3} />
                                                    </a>
                                                )}
                                            </div>
                                        </motion.article>
                                    );
                                })}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    SECTION 4 [LIGHT]: SIMPLE, TRANSPARENT PROCESS
                ═══════════════════════════════════════════════════════ */}
                <section
                    id="process"
                    style={{
                        padding: 'clamp(70px, 8vw, 105px) clamp(20px, 4vw, 48px)',
                        background: '#FFFFFF',
                        color: '#121613'
                    }}
                >
                    <div style={CONTAINER}>
                        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 16px',
                                borderRadius: '999px',
                                background: '#F8F9F5',
                                border: '1px solid rgba(0,0,0,0.08)',
                                fontSize: '12px',
                                fontWeight: '800',
                                color: '#166534',
                                textTransform: 'uppercase',
                                letterSpacing: '1.2px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                marginBottom: '16px'
                            }}>
                                <span style={{ color: '#E5A93B' }}>★</span> HOW WE WORK
                            </div>

                            <h2 style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'clamp(30px, 4.5vw, 48px)',
                                fontWeight: '800',
                                color: '#121613',
                                letterSpacing: '-0.035em',
                                margin: '0 0 14px'
                            }}>
                                Simple, <span style={{ color: '#166534', textDecoration: 'underline', textDecorationColor: '#E5A93B' }}>Transparent</span> Process
                            </h2>

                            <p style={{ fontSize: '16px', color: '#4B5563', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                                No surprises, no hidden fees. Just clear steps from idea to launch.
                            </p>
                        </div>

                        {/* 4 Clean Light Process Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                            {PROCESS_STEPS.map((step, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={cardReveal}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0 }}
                                    style={{
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        borderRadius: '22px',
                                        padding: '28px 24px',
                                        position: 'relative',
                                        background: '#F8F9F5',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
                                        transition: 'all 0.25s ease'
                                    }}
                                    className="clean-process-card"
                                >
                                    <div style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '38px',
                                        fontWeight: '800',
                                        color: '#166534',
                                        lineHeight: 1,
                                        marginBottom: '14px',
                                        letterSpacing: '-0.02em'
                                    }}>
                                        {step.num}
                                    </div>

                                    <h4 style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '18px',
                                        fontWeight: '800',
                                        color: '#121613',
                                        margin: '0 0 8px',
                                        letterSpacing: '-0.01em'
                                    }}>
                                        {step.title}
                                    </h4>

                                    <p style={{ fontSize: '13.5px', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
                                        {step.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    SECTION 5 [DARK]: PACKAGES & TRANSPARENT PRICING
                ═══════════════════════════════════════════════════════ */}
                <section style={{ padding: 'clamp(70px, 8vw, 105px) clamp(20px, 4vw, 48px)', background: '#121613', color: '#FFFFFF' }} id="pricing">
                    <div style={CONTAINER}>
                        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '5px 14px',
                                borderRadius: '999px',
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                fontSize: '11px',
                                fontWeight: '800',
                                color: '#E5A93B',
                                textTransform: 'uppercase',
                                letterSpacing: '1.2px',
                                marginBottom: '16px'
                            }}>
                                <span>★</span> TRANSPARENT ENGAGEMENT
                            </div>

                            <h2 style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'clamp(30px, 4.2vw, 48px)',
                                fontWeight: '800',
                                letterSpacing: '-0.035em',
                                color: '#FFFFFF',
                                margin: '0 0 14px'
                            }}>
                                Choose Your <span style={{ background: 'linear-gradient(90deg, #E5A93B 0%, #D5ED55 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Level</span>
                            </h2>

                            <p style={{ fontSize: '15px', color: '#A2B6A6', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
                                No hidden fees, no scope creep. Transparent fixed pricing whether launching a web platform or scaling performance marketing.
                            </p>
                        </div>

                        {/* Bundles Grid */}
                        <div className="packages-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
                            {PRICING_PACKAGES.map((b, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        borderRadius: '24px',
                                        padding: 'clamp(24px, 4vw, 36px)',
                                        background: '#0B150E',
                                        color: '#FFFFFF',
                                        border: idx === 1 ? '2px solid #E5A93B' : '1px solid rgba(255,255,255,0.08)',
                                        boxShadow: idx === 1 ? '0 16px 40px rgba(229,169,59,0.15)' : '0 10px 30px rgba(0,0,0,0.2)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative'
                                    }}
                                >
                                    {idx === 1 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-12px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            padding: '4px 14px',
                                            borderRadius: '999px',
                                            background: '#E5A93B',
                                            color: '#0B150E',
                                            fontSize: '11px',
                                            fontWeight: '800',
                                            letterSpacing: '0.04em'
                                        }}>
                                            MOST REQUESTED
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#E5A93B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                            {b.badge}
                                        </div>
                                        {b.logo && (
                                            <img src={b.logo} alt="Aanandham" width="20" height="20" style={{ borderRadius: '50%', objectFit: 'contain' }} />
                                        )}
                                    </div>

                                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 6px', lineHeight: 1.25 }}>
                                        {b.title}
                                    </h3>

                                    <div style={{ fontSize: '13.5px', color: '#A2B6A6', marginBottom: '24px' }}>
                                        {b.tagline}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '28px' }}>
                                        <span style={{ fontSize: '38px', fontWeight: '900', color: '#FFFFFF', fontFamily: 'var(--font-heading)' }}>{b.price}</span>
                                        <span style={{ fontSize: '14px', color: '#A2B6A6' }}>{b.period}</span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', flex: 1, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
                                        {b.features.map((f, fi) => (
                                            <div key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px' }}>
                                                <CheckCircle2 size={16} color="#E5A93B" style={{ flexShrink: 0, marginTop: '2px' }} />
                                                <span style={{ color: '#DCE7DE' }}>{f}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <a
                                        href={waLink(b.waMsg)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            borderRadius: '12px',
                                            background: idx === 1 ? '#E5A93B' : 'rgba(255,255,255,0.08)',
                                            color: idx === 1 ? '#0B150E' : '#FFFFFF',
                                            border: idx === 1 ? 'none' : '1px solid rgba(255,255,255,0.15)',
                                            fontWeight: '800',
                                            fontSize: '14px',
                                            textAlign: 'center',
                                            textDecoration: 'none',
                                            display: 'block',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {b.ctaText}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    SECTION 6 [LIGHT]: INTERACTIVE FAQ ACCORDION
                ═══════════════════════════════════════════════════════ */}
                <section
                    id="faqs"
                    style={{
                        padding: 'clamp(70px, 8vw, 105px) clamp(20px, 4vw, 48px)',
                        background: '#F8F9F5',
                        color: '#121613'
                    }}
                >
                    <div style={{ ...CONTAINER, maxWidth: '900px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 16px',
                                borderRadius: '999px',
                                background: '#FFFFFF',
                                border: '1px solid rgba(0,0,0,0.08)',
                                fontSize: '12px',
                                fontWeight: '800',
                                color: '#166534',
                                textTransform: 'uppercase',
                                letterSpacing: '1.2px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                marginBottom: '16px'
                            }}>
                                <span style={{ color: '#E5A93B' }}>★</span> FREQUENTLY ASKED QUESTIONS
                            </div>

                            <h2 style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'clamp(28px, 4vw, 44px)',
                                fontWeight: '800',
                                letterSpacing: '-0.03em',
                                color: '#121613',
                                margin: '0 0 12px'
                            }}>
                                Everything You <span style={{ color: '#166534', textDecoration: 'underline', textDecorationColor: '#E5A93B' }}>Need to Know</span>
                            </h2>
                            <p style={{ fontSize: '16px', color: '#4B5563', margin: 0 }}>
                                Clear answers about tech stacks, delivery timelines, and project handover.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {FAQS.map((faq, idx) => {
                                const isOpen = openFaq === idx;
                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            border: '1px solid rgba(0,0,0,0.08)',
                                            borderRadius: '18px',
                                            overflow: 'hidden',
                                            background: '#FFFFFF',
                                            boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
                                        }}
                                    >
                                        <button
                                            onClick={() => setOpenFaq(isOpen ? null : idx)}
                                            style={{
                                                width: '100%',
                                                padding: '22px 26px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '16px',
                                                background: 'none',
                                                border: 'none',
                                                textAlign: 'left',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <span style={{ fontSize: '16.5px', fontWeight: '800', color: '#121613' }}>
                                                {faq.q}
                                            </span>
                                            <ChevronDown
                                                size={19}
                                                color="#166534"
                                                style={{
                                                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                                                    transition: 'transform 0.25s ease',
                                                    flexShrink: 0
                                                }}
                                            />
                                        </button>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                >
                                                    <div style={{ padding: '0 26px 24px', fontSize: '14.5px', color: '#4B5563', lineHeight: 1.7, borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '14px' }}>
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
                </section>

                {/* ═══════════════════════════════════════════════════════
                    SECTION 7 [DARK]: BOTTOM CALL TO ACTION
                ═══════════════════════════════════════════════════════ */}
                <section style={{
                    padding: 'clamp(60px, 6vw, 84px) clamp(20px, 4vw, 48px) clamp(80px, 8vw, 110px)',
                    background: 'linear-gradient(135deg, #0B150E 0%, #1A1F1A 100%)',
                    color: '#FFFFFF',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at 50% 50%, rgba(229,169,59,0.08) 0%, transparent 60%)',
                        pointerEvents: 'none'
                    }} />

                    <div style={{ ...CONTAINER, position: 'relative', zIndex: 1, textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '24px' }}>
                            <img
                                src="/logo.png"
                                alt="Aanandham Logo"
                                width="44"
                                height="44"
                                style={{ width: '44px', height: '44px', objectFit: 'contain', background: 'transparent' }}
                            />
                            <span style={{ color: '#E5A93B', fontSize: '20px', fontWeight: '900', lineHeight: 1 }}>×</span>
                            <img
                                src="/images/openzone-white.png"
                                alt="OpenZen Logo"
                                width="44"
                                height="44"
                                style={{ width: '44px', height: '44px', objectFit: 'contain', background: 'transparent' }}
                            />
                        </div>

                        <h2 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 'clamp(32px, 5vw, 56px)',
                            fontWeight: '800',
                            letterSpacing: '-0.035em',
                            lineHeight: 1.1,
                            margin: '0 0 16px',
                            color: '#FFFFFF'
                        }}>
                            Let’s Build <span style={{ background: 'linear-gradient(90deg, #E5A93B 0%, #D5ED55 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Something</span><br />Worth Talking About
                        </h2>

                        <p style={{ fontSize: '16px', maxWidth: '560px', margin: '0 auto 32px', color: '#A2B6A6' }}>
                            Whether it’s a custom SaaS, a brand launch, or a growth campaign — we’d love to hear your story.
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                            <a
                                href={waLink('Hi! I want to start a project with the Aanandham × OpenZen team.')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="services-cta-whatsapp"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '14px 30px',
                                    borderRadius: '999px',
                                    background: '#E5A93B',
                                    color: '#0B150E',
                                    fontWeight: '800',
                                    fontSize: '15px',
                                    textDecoration: 'none',
                                    boxShadow: '0 10px 25px rgba(229,169,59,0.3)',
                                    transition: 'all 0.25s ease'
                                }}
                            >
                                <WhatsAppIcon size={18} color="#0B150E" />
                                <span>Start on WhatsApp</span>
                            </a>

                            <a
                                href="mailto:bookings@aanandham.in?subject=Project Inquiry - Aanandham × OpenZen"
                                className="services-cta-email"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '14px 26px',
                                    borderRadius: '999px',
                                    background: 'rgba(255,255,255,0.08)',
                                    color: '#FFFFFF',
                                    fontWeight: '700',
                                    fontSize: '15px',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    textDecoration: 'none'
                                }}
                            >
                                <Mail size={16} />
                                <span>Email Us</span>
                            </a>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />

            <style jsx global>{`
                .clean-wing-subcard:hover {
                    background: #FFFFFF !important;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.06) !important;
                    border-color: rgba(22,101,52,0.2) !important;
                    transform: translateY(-2px);
                }
                .clean-process-card:hover {
                    background: #FFFFFF !important;
                    box-shadow: 0 12px 32px rgba(0,0,0,0.08) !important;
                    border-color: rgba(22,101,52,0.25) !important;
                    transform: translateY(-3px);
                }
                .portfolio-work-card:hover .portfolio-img-zoom {
                    transform: scale(1.05);
                }
            `}</style>
        </>
    );
}