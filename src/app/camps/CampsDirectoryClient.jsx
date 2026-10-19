"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteHeader from '../../components/SiteHeader';
import Footer from '../../components/Footer';
import CustomSelectDropdown from '../../components/CustomSelectDropdown';
import dynamic from 'next/dynamic';
const BookingEngineModal = dynamic(() => import('../../components/BookingEngineModal'), { ssr: false });
import LucideAmenityIcon from '../../components/common/LucideAmenityIcon';
import VerifiedStayBadge from '../../components/common/VerifiedStayBadge';
import { MapPin, Clock, Heart, Camera, Star, Search, X, Share2, Tent, Sunrise, Flame, Footprints, Telescope, Leaf, Zap } from 'lucide-react';
import { INITIAL_ALL_CAMPS, getAllCamps, saveAllCamps } from '../../lib/campsData';
import { waLink } from '../../lib/whatsapp';

const SORT_OPTIONS = [
    { value: 'recommended', label: 'Recommended', icon: 'Sparkles' },
    { value: 'price-asc', label: 'Price: Low to High', icon: 'TrendingDown' },
    { value: 'price-desc', label: 'Price: High to Low', icon: 'TrendingUp' },
    { value: 'altitude', label: 'Highest Altitude (FT)', icon: 'Mountain' },
    { value: 'rating', label: 'Top Rated (4.9+)', icon: 'Star' }
];

export default function CampsDirectoryClient({ 
    initialCamps = INITIAL_ALL_CAMPS,
    initialRegion = 'All',
    heroBadge = '★ 11 VERIFIED CAMPS',
    heroTitle = null,
    heroSubtitle = null
}) {
    const router = useRouter();
    const [camps, setCamps] = useState(initialCamps);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState(initialRegion);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('recommended'); // 'recommended' | 'price-asc' | 'price-desc' | 'altitude' | 'rating'
    const [onlyWishlisted, setOnlyWishlisted] = useState(false);

    // User Wishlist stored in localStorage
    const [wishlist, setWishlist] = useState([]);

    // Modals state
    const [selectedPackageForBooking, setSelectedPackageForBooking] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedLightboxPhoto, setSelectedLightboxPhoto] = useState(null);
    const [toastMessage, setToastMessage] = useState('');

    // Load camps & wishlist from localStorage on mount + listen for admin updates
    useEffect(() => {
        const refreshCamps = async () => {
            try {
                const res = await fetch('/api/admin/camps', { cache: 'no-store' });
                if (res && res.ok) {
                    const serverCamps = await res.json();
                    if (Array.isArray(serverCamps) && serverCamps.length > 0) {
                        saveAllCamps(serverCamps);
                        setCamps(prev => {
                            if (JSON.stringify(prev) === JSON.stringify(serverCamps)) return prev;
                            return serverCamps;
                        });
                    }
                }
            } catch (e) {}
        };

        refreshCamps();

        try {
            const savedWishlist = JSON.parse(localStorage.getItem('aanandham_user_wishlist') || '[]');
            setWishlist(savedWishlist);
        } catch (e) {
            console.error('Error reading wishlist from localStorage:', e);
        }

        // Re-read local data only. Re-fetching here looped forever: saveAllCamps() above
        // dispatches 'storage', which re-triggered the fetch (~50 requests/second).
        const handleStorage = () => {
            const local = getAllCamps();
            setCamps(prev => (JSON.stringify(prev) === JSON.stringify(local) ? prev : local));
            try {
                setWishlist(JSON.parse(localStorage.getItem('aanandham_user_wishlist') || '[]'));
            } catch (e) {}
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Listen for global booking open trigger from sticky bar / dock
    useEffect(() => {
        const handleGlobalBooking = (e) => {
            e.preventDefault();
            if (e.detail?.camp) {
                setSelectedPackageForBooking(e.detail.camp);
            } else if (camps && camps.length > 0) {
                setSelectedPackageForBooking(camps[0]);
            }
            setIsBookingModalOpen(true);
        };
        window.addEventListener('aanandham_open_booking', handleGlobalBooking);
        return () => window.removeEventListener('aanandham_open_booking', handleGlobalBooking);
    }, [camps]);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3200);
    };

    // Toggle Wishlist / Like
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
            showToast(`❤️ Added "${campTitle}" to your saved wishlist!`);
        }
        setWishlist(updated);
        try {
            localStorage.setItem('aanandham_user_wishlist', JSON.stringify(updated));
        } catch (e) {}
    };

    // Share Camp Action
    const handleShare = async (camp, e) => {
        e?.stopPropagation();
        e?.preventDefault();
        const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/camps/${camp.id}` : '';
        const shareData = {
            title: `${camp.title} | Aanandham.go Wilderness`,
            text: `Check out ${camp.title} at ${camp.altitude} in ${camp.location}!`,
            url: shareUrl
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err) {}
        }

        try {
            await navigator.clipboard.writeText(shareUrl);
            showToast('✓ Link copied to clipboard!');
        } catch (err) {
            window.open(waLink(`Check out this Kerala wilderness camp: ${camp.title} - ${shareUrl}`), '_blank');
        }
    };

    // Filter & Sort Logic
    const filteredCamps = useMemo(() => {
        return camps.filter(camp => {
            // Search query filter
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch = !q || 
                camp.title.toLowerCase().includes(q) || 
                (camp.location && camp.location.toLowerCase().includes(q)) || 
                (camp.altitude && camp.altitude.toLowerCase().includes(q)) ||
                (camp.description && camp.description.toLowerCase().includes(q));

            // Region filter
            const matchesRegion = selectedRegion === 'All' || (camp.region || 'Munnar') === selectedRegion;

            // Category filter
            const matchesCategory = selectedCategory === 'All' || 
                (camp.category && camp.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
                (camp.tag && camp.tag.toLowerCase().includes(selectedCategory.toLowerCase()));

            // Wishlist only filter
            const matchesWishlist = !onlyWishlisted || wishlist.includes(camp.id);

            return matchesSearch && matchesRegion && matchesCategory && matchesWishlist;
        }).sort((a, b) => {
            if (sortBy === 'price-asc') return a.price - b.price;
            if (sortBy === 'price-desc') return b.price - a.price;
            if (sortBy === 'rating') return (b.rating || 4.9) - (a.rating || 4.9);
            if (sortBy === 'altitude') {
                const altA = parseInt(String(a.altitude || '0').replace(/\D/g, '')) || 0;
                const altB = parseInt(String(b.altitude || '0').replace(/\D/g, '')) || 0;
                return altB - altA;
            }
            return 0; // Default recommended
        });
    }, [camps, searchQuery, selectedRegion, selectedCategory, sortBy, onlyWishlisted, wishlist]);

    // Distinct Regions
    const allRegions = useMemo(() => {
        const set = new Set(['All']);
        camps.forEach(c => {
            if (c.region) set.add(c.region);
        });
        return Array.from(set);
    }, [camps]);

    return (
        <div style={{ minHeight: '100vh', width: '100%', background: '#F8F9F5', color: '#121613' }}>
            
            {/* ── HEADER ── */}
            <SiteHeader transparentOnTop={false} activePage="camps" />

            <main id="main-content" style={{ paddingBottom: '120px' }}>

                {/* ── HERO BANNER ── */}
                <section style={{
                    background: 'linear-gradient(180deg, #101E13 0%, #0D170F 100%)',
                    color: '#FFFFFF',
                    padding: 'clamp(115px, 12vw, 150px) clamp(20px, 4vw, 48px) clamp(44px, 6vw, 72px)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Ambient Glow */}
                    <div style={{
                        position: 'absolute',
                        top: '-120px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '700px',
                        height: '350px',
                        background: 'radial-gradient(circle, rgba(213, 237, 85, 0.12) 0%, rgba(16, 30, 19, 0) 70%)',
                        pointerEvents: 'none',
                        filter: 'blur(60px)'
                    }} />

                    <div style={{ maxWidth: '1440px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
                        <div style={{ maxWidth: '820px' }}>
                            <div className="star-badge" style={{ background: 'rgba(213, 237, 85, 0.15)', color: '#D5ED55', border: '1px solid rgba(213, 237, 85, 0.3)', marginBottom: '16px' }}>
                                <span className="star-icon">★</span> {heroBadge}
                            </div>
                            
                            <h1 style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'clamp(32px, 5.5vw, 56px)',
                                fontWeight: '800',
                                letterSpacing: '-0.035em',
                                lineHeight: 1.15,
                                margin: '0 0 16px',
                                color: '#FFFFFF'
                            }}>
                                {heroTitle ? heroTitle : (
                                    <>Kerala High-Altitude Camps & <span style={{ color: '#D5ED55' }}>Wilderness Basecamps</span></>
                                )}
                            </h1>

                            <p style={{
                                fontSize: 'clamp(15px, 1.8vw, 17px)',
                                color: '#A2B6A6',
                                lineHeight: 1.7,
                                margin: '0 0 28px'
                            }}>
                                {heroSubtitle ? heroSubtitle : 'Explore verified campgrounds perched above rolling cloud beds. Featuring luxury ridge glamping tents, 4x4 summit convoys, private campfire barbecues, and live availability across Munnar, Suryanelli, Wayanad, Vagamon, and Athirappilly.'}
                            </p>

                            {/* Wishlist Bar Pill (Only shown if wishlist has items) */}
                            {wishlist.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => setOnlyWishlisted(!onlyWishlisted)}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '10px 20px',
                                            borderRadius: '999px',
                                            background: onlyWishlisted ? '#D5ED55' : 'rgba(255, 255, 255, 0.1)',
                                            border: onlyWishlisted ? '1px solid #D5ED55' : '1px solid rgba(255, 255, 255, 0.2)',
                                            color: onlyWishlisted ? '#121613' : '#FFFFFF',
                                            fontSize: '13.5px',
                                            fontWeight: '800',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>{onlyWishlisted ? <Heart size={15} fill="#121613" /> : <Heart size={15} />} {onlyWishlisted ? 'Showing Wishlist Only' : `Saved Wishlist (${wishlist.length})`}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── FILTER & SEARCH BAR SECTION ── */}
                <section style={{
                    maxWidth: '1440px',
                    margin: '-30px auto 40px',
                    padding: '0 clamp(20px, 4vw, 48px)',
                    position: 'relative',
                    zIndex: 10
                }}>
                    <div className="camps-filter-card" style={{
                        background: '#FFFFFF',
                        borderRadius: '24px',
                        padding: '24px 28px',
                        border: '1px solid rgba(18, 22, 19, 0.08)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px'
                    }}>
                        
                        {/* Row 1: Search Input & Sort Selector */}
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                            
                            {/* Search Input */}
                            <div className="camps-filter-search" style={{ flex: 1, position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="Search by location or camp name"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 18px 14px 44px',
                                        borderRadius: '14px',
                                        background: '#F8F9F5',
                                        border: '1px solid rgba(18, 22, 19, 0.12)',
                                        color: '#121613',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', opacity: 0.6 }}>
                                    <Search size={16} color="#121613" />
                                </span>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#59655D' }}
                                    >
                                        <X size={14} strokeWidth={2.5} />
                                    </button>
                                )}
                            </div>

                            {/* Sort Selector with Reusable CustomSelectDropdown */}
                            <div className="camps-filter-sort" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '800', color: '#7D8880', textTransform: 'uppercase', letterSpacing: '0.6px', flexShrink: 0 }}>
                                    Sort:
                                </span>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <CustomSelectDropdown
                                        options={SORT_OPTIONS}
                                        value={sortBy}
                                        onChange={val => setSortBy(val)}
                                        theme="light"
                                        placeholder="Sort By..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Region Pills & Categories */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderTop: '1px solid rgba(18, 22, 19, 0.06)', paddingTop: '16px' }}>
                            
                            {/* Region Pills */}
                            <div className="camps-pills-row" data-lenis-prevent="true" data-lenis-prevent-wheel="true" data-lenis-prevent-touch="true">
                                {allRegions.map(reg => {
                                    const isSelected = selectedRegion === reg;
                                    return (
                                        <button
                                            key={reg}
                                            onClick={() => setSelectedRegion(reg)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '999px',
                                                background: isSelected ? '#121613' : '#F1F3EC',
                                                color: isSelected ? '#D5ED55' : '#121613',
                                                border: 'none',
                                                fontSize: '12.5px',
                                                fontWeight: '800',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {reg === 'All' ? 'All Kerala' : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {reg}</span>}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Category Filter Pills */}
                            <div className="camps-pills-row" data-lenis-prevent="true" data-lenis-prevent-wheel="true" data-lenis-prevent-touch="true">
                                {[
                                    { id: 'All', label: 'All Styles' },
                                    { id: 'Glamp', label: 'Glamping' },
                                    { id: 'Summit', label: 'Summit Treks' },
                                    { id: 'Forest', label: 'Rainforest & Pine' }
                                ].map(cat => {
                                    const isSelected = selectedCategory === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            style={{
                                                padding: '7px 14px',
                                                borderRadius: '999px',
                                                background: isSelected ? '#E5A93B' : 'transparent',
                                                color: isSelected ? '#121613' : '#59655D',
                                                border: isSelected ? '1px solid #E5A93B' : '1px solid rgba(18, 22, 19, 0.12)',
                                                fontSize: '12px',
                                                fontWeight: '800',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {cat.label}
                                        </button>
                                    );
                                })}
                            </div>

                        </div>
                    </div>
                </section>

                {/* ── CAMPSITES LISTING GRID ── */}
                <section style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 clamp(20px, 4vw, 48px)' }}>
                    
                    {/* Header showing count */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                        <div>
                            <span style={{ fontSize: '13px', fontWeight: '800', color: '#7D8880', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                                Showing {filteredCamps.length} of {camps.length} Campsites
                            </span>
                        </div>
                        {onlyWishlisted && (
                            <button
                                onClick={() => setOnlyWishlisted(false)}
                                style={{ background: 'none', border: 'none', color: '#166534', fontWeight: '800', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Show All Basecamps →
                            </button>
                        )}
                    </div>

                    {filteredCamps.length === 0 ? (
                        <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '60px 20px', textAlign: 'center', border: '1px solid rgba(18,22,19,0.08)' }}>
                            <div style={{ fontSize: '42px', marginBottom: '14px', display: 'inline-flex' }}><Tent size={42} strokeWidth={1.6} /></div>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: '800', margin: '0 0 8px' }}>
                                No campsites match your filters
                            </h3>
                            <p style={{ fontSize: '14px', color: '#59655D', marginBottom: '20px' }}>
                                Try clearing search filters or switching to "All Kerala" regions.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedRegion('All');
                                    setSelectedCategory('All');
                                    setOnlyWishlisted(false);
                                }}
                                className="btn-lime"
                                style={{ padding: '12px 28px', fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}
                            >
                                Reset All Filters
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '28px' }}>
                            {filteredCamps.map((camp) => {
                                const isLiked = wishlist.includes(camp.id);
                                const galleryList = camp.gallery && camp.gallery.length > 0 ? camp.gallery : [camp.image];

                                return (
                                    <div
                                        key={camp.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => router.push(`/camps/${camp.id}`)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                router.push(`/camps/${camp.id}`);
                                            }
                                        }}
                                        className="hover-lift card-img-zoom camps-card"
                                        style={{
                                            background: '#FFFFFF',
                                            borderRadius: '28px',
                                            overflow: 'hidden',
                                            border: '1px solid rgba(18, 22, 19, 0.08)',
                                            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.03)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            textAlign: 'left'
                                        }}
                                    >
                                        {/* Top Image & Media Header */}
                                        <div className="camps-card-media" style={{ position: 'relative', height: '270px', overflow: 'hidden' }}>
                                            <img
                                                src={camp.image || galleryList[0]}
                                                alt={camp.title}
                                                width="400"
                                                height="270"
                                                loading="lazy"
                                                decoding="async"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            
                                            {/* Gradient Overlay for Readability */}
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 40%, rgba(0,0,0,0.65) 100%)', pointerEvents: 'none' }} />

                                            {/* Unified Top Header Row: Badges Left, Actions Right (Zero Overlap) */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '14px',
                                                left: '14px',
                                                right: '14px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                gap: '8px',
                                                zIndex: 3,
                                                pointerEvents: 'none'
                                            }}>
                                                {/* Badges Left */}
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxWidth: 'calc(100% - 90px)', pointerEvents: 'auto' }}>
                                                    <span style={{
                                                        background: '#E5A93B',
                                                        color: '#121613',
                                                        fontSize: '11px',
                                                        fontWeight: '800',
                                                        padding: '4px 11px',
                                                        borderRadius: '999px',
                                                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {camp.altitude || 'Western Ghats'}
                                                    </span>
                                                    {camp.tag && (
                                                        <span style={{
                                                            background: '#121613',
                                                            color: '#D5ED55',
                                                            fontSize: '10.5px',
                                                            fontWeight: '800',
                                                            padding: '4px 10px',
                                                            borderRadius: '999px',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {camp.tag}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Action Buttons Right: Like ❤️ & Share 🔗 */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, pointerEvents: 'auto' }}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleWishlist(camp.id, camp.title, e);
                                                        }}
                                                        aria-label={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
                                                        style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            borderRadius: '50%',
                                                            background: isLiked ? '#EF4444' : 'rgba(0, 0, 0, 0.55)',
                                                            border: '1px solid rgba(255, 255, 255, 0.25)',
                                                            color: '#FFFFFF',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            backdropFilter: 'blur(6px)',
                                                            boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
                                                            transition: 'transform 0.15s ease'
                                                        }}
                                                    >
                                                        <Heart size={15} fill={isLiked ? '#FFFFFF' : 'none'} color="#FFFFFF" strokeWidth={2.5} />
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleShare(camp, e);
                                                        }}
                                                        aria-label="Share campsite link"
                                                        style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            borderRadius: '50%',
                                                            background: 'rgba(0, 0, 0, 0.55)',
                                                            border: '1px solid rgba(255, 255, 255, 0.25)',
                                                            color: '#FFFFFF',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            backdropFilter: 'blur(6px)',
                                                            boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
                                                            transition: 'transform 0.15s ease'
                                                        }}
                                                    >
                                                        <Share2 size={15} color="#FFFFFF" strokeWidth={2.2} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Unified Bottom Info Row: Photos Button Left, Rating Right */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '12px',
                                                left: '14px',
                                                right: '14px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                gap: '8px',
                                                zIndex: 3,
                                                pointerEvents: 'none'
                                            }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedLightboxPhoto(camp.image);
                                                    }}
                                                    style={{
                                                        background: 'rgba(0, 0, 0, 0.58)',
                                                        border: '1px solid rgba(255, 255, 255, 0.25)',
                                                        color: '#FFFFFF',
                                                        padding: '5px 11px',
                                                        borderRadius: '999px',
                                                        fontSize: '11px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        backdropFilter: 'blur(6px)',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        pointerEvents: 'auto'
                                                    }}
                                                >
                                                    <Camera size={13} color="#FFFFFF" />
                                                    <span>{galleryList.length} Photos</span>
                                                </button>

                                                <span style={{
                                                    fontSize: '11.5px',
                                                    fontWeight: '800',
                                                    background: 'rgba(255, 255, 255, 0.95)',
                                                    color: '#121613',
                                                    padding: '4px 10px',
                                                    borderRadius: '999px',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    flexShrink: 0
                                                }}>
                                                    <Star size={12} fill="#E5A93B" color="#E5A93B" />
                                                    <span>{camp.rating || 4.98}</span>
                                                    <span style={{ opacity: 0.65, fontWeight: '600', fontSize: '10px' }}>({camp.reviewsCount || 342})</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Body — Booking-Focused Details */}
                                        <div className="camps-card-body" style={{ padding: '22px 22px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                            
                                            {/* Location & Live Availability Row */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                                                <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                    <MapPin size={13} color="#166534" strokeWidth={2.5} />
                                                    <span>{camp.location || camp.region}</span>
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '800', color: '#166534', background: '#DCFCE7', padding: '3px 9px', borderRadius: '999px' }}>
                                                        <span className="live-available-dot" />
                                                        <span>Live Available</span>
                                                    </span>
                                                    <VerifiedStayBadge size="sm" />
                                                </div>
                                            </div>

                                            {/* Campsite Title */}
                                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '19px', fontWeight: '800', color: '#121613', margin: '0 0 6px', lineHeight: 1.35 }}>
                                                {camp.title}
                                            </h3>

                                            {/* Stay Accommodation Spec */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#4B5563', fontWeight: '600', marginBottom: '10px' }}>
                                                <Tent size={13} color="#166534" />
                                                <span>{camp.category || 'High-Altitude Ridge Stay'} · {camp.altitude} · {camp.duration || '2D / 1N'}</span>
                                            </div>

                                            {/* Description snippet */}
                                            <p className="camps-card-desc" style={{ 
                                                fontSize: '13px', 
                                                color: '#59655D', 
                                                lineHeight: 1.5, 
                                                margin: '0 0 12px',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {camp.description ? camp.description.slice(0, 125) + '...' : 'High-altitude ridge glamping, sunrise jeep convoy safari, campfire barbecue dinner, and certified trail guides.'}
                                            </p>

                                            {/* Included Highlights & Perks Chips */}
                                            {camp.highlights && (
                                                <div className="camps-card-highlights" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                                    {camp.highlights.slice(0, 3).map((h, hidx) => (
                                                        <span key={hidx} style={{ fontSize: '11px', fontWeight: '700', background: '#F1F3EC', color: '#121613', padding: '4px 10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                            <LucideAmenityIcon name={h} size={11} color="#166534" />
                                                            <span>{h}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Price & Book Now Action Footer */}
                                            <div style={{ borderTop: '1px solid rgba(18, 22, 19, 0.08)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', gap: '8px' }}>
                                                <div>
                                                    <span style={{ fontSize: '10px', color: '#7D8880', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                                                        Starts at
                                                    </span>
                                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                                                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: '900', color: '#121613' }}>
                                                            ₹{camp.price.toLocaleString('en-IN')}
                                                        </span>
                                                        <span style={{ fontSize: '11px', color: '#59655D', fontWeight: '600' }}>
                                                            / camper
                                                        </span>
                                                    </div>
                                                    <span style={{ fontSize: '10px', color: '#166534', fontWeight: '700', display: 'block', marginTop: '1px' }}>
                                                        Zero Advance · Pay at Camp
                                                    </span>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {/* Details Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/camps/${camp.id}`);
                                                        }}
                                                        style={{
                                                            padding: '9px 14px',
                                                            borderRadius: '11px',
                                                            background: '#F1F3EC',
                                                            border: '1px solid rgba(18, 22, 19, 0.08)',
                                                            color: '#121613',
                                                            fontSize: '12.5px',
                                                            fontWeight: '800',
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '3px'
                                                        }}
                                                    >
                                                        <span>Details →</span>
                                                    </button>

                                                    {/* Direct Booking Modal Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedPackageForBooking(camp);
                                                            setIsBookingModalOpen(true);
                                                        }}
                                                        className="btn-lime"
                                                        title="Direct Booking · No Login Required · Zero Upfront Advance"
                                                        style={{
                                                            padding: '9px 18px',
                                                            borderRadius: '11px',
                                                            fontSize: '12.5px',
                                                            fontWeight: '800',
                                                            cursor: 'pointer',
                                                            border: 'none',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '4px',
                                                            boxShadow: '0 4px 14px rgba(213, 237, 85, 0.35)'
                                                        }}
                                                    >
                                                        <Zap size={12} fill="#121613" />
                                                        <span>Book</span>
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* ── ACCOMMODATION STYLES PER-TYPE GALLERY BREAKDOWN ── */}
                <section style={{ maxWidth: '1440px', margin: '100px auto 0', padding: '0 clamp(20px, 4vw, 48px)' }}>
                    <div style={{ background: '#101E13', borderRadius: '32px', padding: 'clamp(40px, 6vw, 70px) clamp(24px, 4vw, 60px)', color: '#FFFFFF' }}>
                        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
                            <div className="star-badge" style={{ background: 'rgba(213, 237, 85, 0.15)', color: '#D5ED55', border: '1px solid rgba(213, 237, 85, 0.3)', margin: '0 auto 12px' }}>
                                <span className="star-icon">★</span> ACCOMMODATION TYPES
                            </div>
                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '800', color: '#FFFFFF', margin: '0 0 12px' }}>
                                Experience Wilderness With Luxury Rest
                            </h2>
                            <p style={{ fontSize: '15px', color: '#A2B6A6', margin: 0, lineHeight: 1.65 }}>
                                Every campsite includes clean western washrooms, running hot water, 24/7 power backup, and dedicated basecamp coordinators.
                            </p>
                        </div>

                        <div className="accommodation-types-grid" data-lenis-prevent="true" data-lenis-prevent-wheel="true" data-lenis-prevent-touch="true">
                            {[
                                {
                                    title: 'Ridge Glamping Tents',
                                    badge: 'Couples & Privacy',
                                    img: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
                                    desc: 'Insulated high-altitude ridge glamping tents with private viewing deck, plush queen beds, and valley sunset vistas.',
                                    features: ['King / Queen Plush Bed', 'Panoramic Cloud Vista Window', 'Private Sit-Out Balcony', 'En-suite Washroom']
                                },
                                {
                                    title: 'Alpine Ridge Tents',
                                    badge: 'Trek & Adventure',
                                    img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
                                    desc: 'Dual-layered weatherproof Quechua tents with thermal sleeping bags and memory foam ground mattresses on elevated timber platforms.',
                                    features: ['2-Layer Weatherproof Shell', 'Thermal Cold-Weather Sleeping Bags', 'Elevated Timber Platform', 'Campfire Circle Access']
                                },
                                {
                                    title: 'Wooden A-Frame Cabins',
                                    badge: 'Family & Groups',
                                    img: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
                                    desc: 'Rustic timber cabins nestled against mountain slopes with panoramic valley glass windows and private verandas.',
                                    features: ['Timber Balcony Deck', 'Queen Plush Bed', 'En-suite Restroom', '24/7 Hot Water Facility']
                                }
                            ].map((pod, pidx) => (
                                <div key={pidx} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ height: '200px', position: 'relative' }}>
                                        <img src={pod.img} alt={pod.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}  loading="lazy" decoding="async"/>
                                        <span style={{ position: 'absolute', top: '14px', left: '14px', background: '#D5ED55', color: '#121613', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '999px' }}>
                                            {pod.badge}
                                        </span>
                                    </div>
                                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 8px' }}>
                                            {pod.title}
                                        </h3>
                                        <p style={{ fontSize: '13.5px', color: '#A2B6A6', lineHeight: 1.6, margin: '0 0 16px', flex: 1 }}>
                                            {pod.desc}
                                        </p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {(Array.isArray(pod.features) ? pod.features : (typeof pod.features === 'string' ? pod.features.split(',').map(s => s.trim()).filter(Boolean) : [])).map((feat, fidx) => (
                                                <span key={fidx} style={{ fontSize: '12px', color: '#D5ED55', fontWeight: '600' }}>
                                                    ✓ {feat}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

            </main>

            {/* ── FOOTER ── */}
            <Footer />

            {/* ── BOOKING MODAL ── */}
            <BookingEngineModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                initialPackage={selectedPackageForBooking}
            />

            {/* ── FULLSCREEN PHOTO LIGHTBOX ── */}
            <AnimatePresence>
                {selectedLightboxPhoto && (
                    <div
                        onClick={() => setSelectedLightboxPhoto(null)}
                        style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(0, 0, 0, 0.92)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
                    >
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '900px', width: '100%', maxHeight: '85vh', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 90px rgba(0,0,0,0.6)' }}>
                            <img src={selectedLightboxPhoto} alt="Campsite Preview" style={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain', display: 'block', margin: '0 auto' }}  loading="lazy" decoding="async"/>
                            <button onClick={() => setSelectedLightboxPhoto(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.7)', color: '#FFFFFF', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontWeight: '800', fontSize: '16px' }}>✕</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── TOAST NOTIFICATION ── */}
            <AnimatePresence>
                {toastMessage && (
                    <div style={{
                        position: 'fixed',
                        top: '24px',
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
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -15, scale: 0.95 }}
                            style={{
                                pointerEvents: 'auto',
                                background: '#121613',
                                color: '#FFFFFF',
                                padding: '12px 24px',
                                borderRadius: '999px',
                                fontSize: '13.5px',
                                fontWeight: '700',
                                border: '1.5px solid #D5ED55',
                                boxShadow: '0 16px 40px rgba(0,0,0,0.7), 0 0 24px rgba(213, 237, 85, 0.25)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <span>{toastMessage}</span>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
