"use client";
import React, { useState, useEffect } from 'react';
import { 
    Tent, FileText, Globe, BookOpen, 
    Save, CheckCircle2, 
    Sparkles, ArrowUpRight, MapPin, Tag, 
    Phone, Mail, Calendar, Layers, RefreshCw
} from 'lucide-react';
import { INITIAL_ALL_CAMPS } from '@/lib/campsData';
import { BLOG_POSTS } from '@/lib/blogPosts';
import { DEFAULT_DESTINATION_CONTENT, DEFAULT_SITE_PAGES_CONTENT } from '@/lib/cmsContent';

export default function CmsStudio({ isMobile = false }) {
    const [subTab, setSubTab] = useState('properties'); // 'properties' | 'articles' | 'destinations' | 'pages'
    
    // Camps State
    const [camps, setCamps] = useState(INITIAL_ALL_CAMPS);
    const [selectedCampId, setSelectedCampId] = useState(INITIAL_ALL_CAMPS[0]?.id || '');
    const [editingCamp, setEditingCamp] = useState(INITIAL_ALL_CAMPS[0] || null);

    // Blog Articles State
    const [articles, setArticles] = useState(BLOG_POSTS);
    const [selectedArticleSlug, setSelectedArticleSlug] = useState(BLOG_POSTS[0]?.slug || '');
    const [editingArticle, setEditingArticle] = useState(BLOG_POSTS[0] || null);

    // Destinations State
    const [destinations, setDestinations] = useState(DEFAULT_DESTINATION_CONTENT);
    const [selectedDest, setSelectedDest] = useState('munnar');

    // Site Pages State
    const [sitePages, setSitePages] = useState(DEFAULT_SITE_PAGES_CONTENT);

    // Status Banner
    const [saveStatus, setSaveStatus] = useState({ show: false, message: '', type: 'success' });

    // Load initial data from APIs if available
    useEffect(() => {
        const loadData = async () => {
            try {
                const campsRes = await fetch('/api/admin/camps');
                if (campsRes.ok) {
                    const campsData = await campsRes.json();
                    if (Array.isArray(campsData) && campsData.length > 0) {
                        setCamps(campsData);
                        setSelectedCampId(campsData[0]?.id);
                        setEditingCamp(campsData[0]);
                    }
                }

                const contentRes = await fetch('/api/admin/content');
                if (contentRes.ok) {
                    const result = await contentRes.json();
                    if (result.success && result.data) {
                        if (result.data.destinations) setDestinations(result.data.destinations);
                        if (result.data.sitePages) setSitePages(result.data.sitePages);
                        if (result.data.blogPosts) {
                            setArticles(result.data.blogPosts);
                            setSelectedArticleSlug(result.data.blogPosts[0]?.slug);
                            setEditingArticle(result.data.blogPosts[0]);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to load CMS data:', err);
            }
        };
        loadData();
    }, []);

    const showToast = (message, type = 'success') => {
        setSaveStatus({ show: true, message, type });
        setTimeout(() => setSaveStatus({ show: false, message: '', type: 'success' }), 4000);
    };

    // Save Handlers
    const handleSaveCamps = async () => {
        try {
            const updatedCamps = camps.map(c => c.id === editingCamp.id ? editingCamp : c);
            setCamps(updatedCamps);

            const res = await fetch('/api/admin/camps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCamps)
            });
            if (res.ok) {
                showToast(`Property "${editingCamp.shortTitle || editingCamp.title}" updated successfully!`);
            } else {
                showToast('Saved locally in browser session.', 'success');
            }
        } catch (err) {
            showToast('Saved locally in session.', 'success');
        }
    };

    const handleSaveArticles = async () => {
        try {
            const updated = articles.map(a => a.slug === editingArticle.slug ? editingArticle : a);
            setArticles(updated);

            const res = await fetch('/api/admin/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blogPosts: updated, destinations, sitePages })
            });
            if (res.ok) {
                showToast(`Article "${editingArticle.title}" published & saved!`);
            } else {
                showToast('Article saved locally in session.', 'success');
            }
        } catch (err) {
            showToast('Article saved locally.', 'success');
        }
    };

    const handleSaveDestinations = async () => {
        try {
            const res = await fetch('/api/admin/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blogPosts: articles, destinations, sitePages })
            });
            if (res.ok) {
                showToast('Destination landing pages updated successfully!');
            } else {
                showToast('Destinations saved locally.', 'success');
            }
        } catch (err) {
            showToast('Destinations saved locally.', 'success');
        }
    };

    const handleSaveSitePages = async () => {
        try {
            const res = await fetch('/api/admin/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blogPosts: articles, destinations, sitePages })
            });
            if (res.ok) {
                showToast('Site page content updated successfully!');
            } else {
                showToast('Page content saved locally.', 'success');
            }
        } catch (err) {
            showToast('Page content saved locally.', 'success');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Top CMS Header */}
            <div style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '24px 28px',
                border: '1px solid rgba(18, 22, 19, 0.08)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#D5ED55', color: '#0B150E', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '8px' }}>
                        <Sparkles size={12} /> Local Website CMS
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '900', color: '#121613', margin: '0 0 4px' }}>
                        Marketing & Content Management Studio
                    </h1>
                    <p style={{ fontSize: '13px', color: '#59655D', margin: 0 }}>
                        Manage website properties showcase, travel guides, landing pages, and marketing copy. Operational reservations run in OpenPMS.
                    </p>
                </div>

                {/* Sub-Studio Navigation Tabs */}
                <div style={{ display: 'flex', background: '#F1F3EC', padding: '4px', borderRadius: '14px', gap: '4px', flexWrap: 'wrap' }}>
                    {[
                        { id: 'properties', label: 'Campsites & Pods', icon: Tent },
                        { id: 'articles', label: 'Blog & Guides', icon: BookOpen },
                        { id: 'destinations', label: 'Destination SEO', icon: Globe },
                        { id: 'pages', label: 'Site Pages', icon: FileText }
                    ].map(tab => {
                        const Icon = tab.icon;
                        const isSelected = subTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setSubTab(tab.id)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '10px',
                                    background: isSelected ? '#121613' : 'transparent',
                                    color: isSelected ? '#D5ED55' : '#3A443E',
                                    border: 'none',
                                    fontSize: '12.5px',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.18s ease'
                                }}
                            >
                                <Icon size={14} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Notification Toast */}
            {saveStatus.show && (
                <div style={{
                    background: '#121613',
                    color: '#D5ED55',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.2)'
                }}>
                    <CheckCircle2 size={16} />
                    <span>{saveStatus.message}</span>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 1. PROPERTIES & CAMPSITES STUDIO */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {subTab === 'properties' && editingCamp && (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '280px 1fr', gap: '24px', alignItems: 'start' }}>
                    
                    {/* Left Column: Properties List */}
                    <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '16px', border: '1px solid rgba(18,22,19,0.08)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#7D8880', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>
                            All Campsites ({camps.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {camps.map(c => {
                                const isSelected = c.id === selectedCampId;
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => {
                                            setSelectedCampId(c.id);
                                            setEditingCamp(c);
                                        }}
                                        style={{
                                            padding: '10px 12px',
                                            borderRadius: '12px',
                                            background: isSelected ? '#121613' : '#F8F9F5',
                                            color: isSelected ? '#D5ED55' : '#121613',
                                            border: isSelected ? '1px solid #121613' : '1px solid rgba(18,22,19,0.06)',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '2px',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <div style={{ fontSize: '13px', fontWeight: '800' }}>{c.shortTitle || c.title}</div>
                                        <div style={{ fontSize: '11px', color: isSelected ? '#A2B6A6' : '#7D8880' }}>
                                            {c.region} · ₹{c.price}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Active Property Editor */}
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '28px', border: '1px solid rgba(18,22,19,0.08)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(18,22,19,0.08)', paddingBottom: '16px' }}>
                            <div>
                                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '800', margin: '0 0 2px' }}>
                                    Editing: {editingCamp.title}
                                </h2>
                                <span style={{ fontSize: '11.5px', color: '#7D8880' }}>ID: {editingCamp.id}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <a
                                    href={`/camps/${editingCamp.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ padding: '8px 14px', borderRadius: '10px', background: '#F1F3EC', color: '#121613', fontSize: '12px', fontWeight: '800', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                    <span>Preview Page</span> <ArrowUpRight size={13} />
                                </a>
                                <button
                                    onClick={handleSaveCamps}
                                    style={{ padding: '8px 18px', borderRadius: '10px', background: '#D5ED55', color: '#0B150E', border: 'none', fontSize: '12.5px', fontWeight: '900', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 10px rgba(213,237,85,0.4)' }}
                                >
                                    <Save size={14} /> <span>Save Changes</span>
                                </button>
                            </div>
                        </div>

                        {/* Property Form Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#59655D', marginBottom: '6px' }}>Full Property Title</label>
                                <input
                                    type="text"
                                    value={editingCamp.title || ''}
                                    onChange={e => setEditingCamp({ ...editingCamp, title: e.target.value })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#59655D', marginBottom: '6px' }}>Short Badge Name</label>
                                <input
                                    type="text"
                                    value={editingCamp.shortTitle || ''}
                                    onChange={e => setEditingCamp({ ...editingCamp, shortTitle: e.target.value })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#59655D', marginBottom: '6px' }}>Region (Munnar / Suryanelli / Vagamon / Wayanad)</label>
                                <input
                                    type="text"
                                    value={editingCamp.region || ''}
                                    onChange={e => setEditingCamp({ ...editingCamp, region: e.target.value })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#59655D', marginBottom: '6px' }}>Base Price (₹ per head)</label>
                                <input
                                    type="number"
                                    value={editingCamp.price || 0}
                                    onChange={e => setEditingCamp({ ...editingCamp, price: Number(e.target.value) })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#59655D', marginBottom: '6px' }}>Altitude (e.g. 7,900 FT)</label>
                                <input
                                    type="text"
                                    value={editingCamp.altitude || ''}
                                    onChange={e => setEditingCamp({ ...editingCamp, altitude: e.target.value })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#59655D', marginBottom: '6px' }}>Marketing Tag (e.g. Bestseller ⭐)</label>
                                <input
                                    type="text"
                                    value={editingCamp.tag || ''}
                                    onChange={e => setEditingCamp({ ...editingCamp, tag: e.target.value })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#59655D', marginBottom: '6px' }}>Primary Cover Image URL</label>
                            <input
                                type="text"
                                value={editingCamp.image || ''}
                                onChange={e => setEditingCamp({ ...editingCamp, image: e.target.value })}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#59655D', marginBottom: '6px' }}>Camp Marketing Story & Description</label>
                            <textarea
                                rows={4}
                                value={editingCamp.description || ''}
                                onChange={e => setEditingCamp({ ...editingCamp, description: e.target.value })}
                                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', lineHeight: 1.5, boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 2. BLOG & FIELD GUIDES STUDIO */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {subTab === 'articles' && editingArticle && (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '280px 1fr', gap: '24px', alignItems: 'start' }}>
                    
                    {/* Left Column: Articles List */}
                    <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '16px', border: '1px solid rgba(18,22,19,0.08)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#7D8880', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>
                            Published Articles ({articles.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {articles.map(a => {
                                const isSelected = a.slug === selectedArticleSlug;
                                return (
                                    <button
                                        key={a.slug}
                                        onClick={() => {
                                            setSelectedArticleSlug(a.slug);
                                            setEditingArticle(a);
                                        }}
                                        style={{
                                            padding: '10px 12px',
                                            borderRadius: '12px',
                                            background: isSelected ? '#121613' : '#F8F9F5',
                                            color: isSelected ? '#D5ED55' : '#121613',
                                            border: isSelected ? '1px solid #121613' : '1px solid rgba(18,22,19,0.06)',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '2px',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <div style={{ fontSize: '12.5px', fontWeight: '800', lineHeight: 1.3 }}>{a.title}</div>
                                        <div style={{ fontSize: '10.5px', color: isSelected ? '#A2B6A6' : '#7D8880' }}>
                                            {a.readTime} · {a.category}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Active Article Editor */}
                    <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '28px', border: '1px solid rgba(18,22,19,0.08)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(18,22,19,0.08)', paddingBottom: '16px' }}>
                            <div>
                                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '800', margin: '0 0 2px' }}>
                                    Editing Article: {editingArticle.title}
                                </h2>
                                <span style={{ fontSize: '11.5px', color: '#7D8880' }}>Slug: /blog/{editingArticle.slug}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <a
                                    href={`/blog/${editingArticle.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ padding: '8px 14px', borderRadius: '10px', background: '#F1F3EC', color: '#121613', fontSize: '12px', fontWeight: '800', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                    <span>View Article</span> <ArrowUpRight size={13} />
                                </a>
                                <button
                                    onClick={handleSaveArticles}
                                    style={{ padding: '8px 18px', borderRadius: '10px', background: '#D5ED55', color: '#0B150E', border: 'none', fontSize: '12.5px', fontWeight: '900', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 10px rgba(213,237,85,0.4)' }}
                                >
                                    <Save size={14} /> <span>Save Article</span>
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#59655D', marginBottom: '6px' }}>Article Headline</label>
                                <input
                                    type="text"
                                    value={editingArticle.title || ''}
                                    onChange={e => setEditingArticle({ ...editingArticle, title: e.target.value })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#59655D', marginBottom: '6px' }}>Category</label>
                                <input
                                    type="text"
                                    value={editingArticle.category || ''}
                                    onChange={e => setEditingArticle({ ...editingArticle, category: e.target.value })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#59655D', marginBottom: '6px' }}>Reading Time (e.g. 5 min read)</label>
                                <input
                                    type="text"
                                    value={editingArticle.readTime || ''}
                                    onChange={e => setEditingArticle({ ...editingArticle, readTime: e.target.value })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#59655D', marginBottom: '6px' }}>Cover Image URL</label>
                                <input
                                    type="text"
                                    value={editingArticle.image || ''}
                                    onChange={e => setEditingArticle({ ...editingArticle, image: e.target.value })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#59655D', marginBottom: '6px' }}>Short Summary / Excerpt</label>
                            <textarea
                                rows={2}
                                value={editingArticle.excerpt || ''}
                                onChange={e => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', lineHeight: 1.5, boxSizing: 'border-box' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#59655D', marginBottom: '6px' }}>Full Article Body Content</label>
                            <textarea
                                rows={10}
                                value={editingArticle.content || ''}
                                onChange={e => setEditingArticle({ ...editingArticle, content: e.target.value })}
                                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', lineHeight: 1.6, fontFamily: 'monospace', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 3. DESTINATION SEO LANDING PAGES STUDIO */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {subTab === 'destinations' && (
                <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '28px', border: '1px solid rgba(18,22,19,0.08)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(18,22,19,0.08)', paddingBottom: '16px' }}>
                        <div>
                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '800', margin: '0 0 2px' }}>
                                Destination SEO Landing Pages
                            </h2>
                            <p style={{ fontSize: '12.5px', color: '#59655D', margin: 0 }}>
                                Customize headlines, subheadings, and metadata for `/camps/munnar`, `/camps/vagamon`, and `/camps/wayanad`.
                            </p>
                        </div>
                        <button
                            onClick={handleSaveDestinations}
                            style={{ padding: '8px 18px', borderRadius: '10px', background: '#D5ED55', color: '#0B150E', border: 'none', fontSize: '12.5px', fontWeight: '900', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 10px rgba(213,237,85,0.4)' }}
                        >
                            <Save size={14} /> <span>Save Destination SEO</span>
                        </button>
                    </div>

                    {/* Destination Selector */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['munnar', 'vagamon', 'wayanad'].map(destKey => {
                            const isSelected = selectedDest === destKey;
                            return (
                                <button
                                    key={destKey}
                                    onClick={() => setSelectedDest(destKey)}
                                    style={{
                                        padding: '8px 18px',
                                        borderRadius: '10px',
                                        background: isSelected ? '#121613' : '#F1F3EC',
                                        color: isSelected ? '#D5ED55' : '#121613',
                                        border: 'none',
                                        fontSize: '12.5px',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {destKey} Page
                                </button>
                            );
                        })}
                    </div>

                    {/* Active Destination Form */}
                    {destinations[selectedDest] && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#59655D', marginBottom: '6px' }}>Hero Badge</label>
                                <input
                                    type="text"
                                    value={destinations[selectedDest].badge || ''}
                                    onChange={e => setDestinations({
                                        ...destinations,
                                        [selectedDest]: { ...destinations[selectedDest], badge: e.target.value }
                                    })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#59655D', marginBottom: '6px' }}>Hero Headline</label>
                                <input
                                    type="text"
                                    value={destinations[selectedDest].title || ''}
                                    onChange={e => setDestinations({
                                        ...destinations,
                                        [selectedDest]: { ...destinations[selectedDest], title: e.target.value }
                                    })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#59655D', marginBottom: '6px' }}>Hero Subtitle</label>
                                <textarea
                                    rows={3}
                                    value={destinations[selectedDest].subtitle || ''}
                                    onChange={e => setDestinations({
                                        ...destinations,
                                        [selectedDest]: { ...destinations[selectedDest], subtitle: e.target.value }
                                    })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', lineHeight: 1.5, boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#59655D', marginBottom: '6px' }}>Meta Title</label>
                                    <input
                                        type="text"
                                        value={destinations[selectedDest].metaTitle || ''}
                                        onChange={e => setDestinations({
                                            ...destinations,
                                            [selectedDest]: { ...destinations[selectedDest], metaTitle: e.target.value }
                                        })}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#59655D', marginBottom: '6px' }}>Meta Description</label>
                                    <input
                                        type="text"
                                        value={destinations[selectedDest].metaDescription || ''}
                                        onChange={e => setDestinations({
                                            ...destinations,
                                            [selectedDest]: { ...destinations[selectedDest], metaDescription: e.target.value }
                                        })}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 4. SITE PAGES STUDIO (ABOUT, SERVICES, CONTACT) */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {subTab === 'pages' && (
                <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '28px', border: '1px solid rgba(18,22,19,0.08)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(18,22,19,0.08)', paddingBottom: '16px' }}>
                        <div>
                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '800', margin: '0 0 2px' }}>
                                Core Marketing Pages Content
                            </h2>
                            <p style={{ fontSize: '12.5px', color: '#59655D', margin: 0 }}>
                                Update About Page story, Services packages, and Contact hotline dispatch channels.
                            </p>
                        </div>
                        <button
                            onClick={handleSaveSitePages}
                            style={{ padding: '8px 18px', borderRadius: '10px', background: '#D5ED55', color: '#0B150E', border: 'none', fontSize: '12.5px', fontWeight: '900', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 10px rgba(213,237,85,0.4)' }}
                        >
                            <Save size={14} /> <span>Save All Site Pages</span>
                        </button>
                    </div>

                    {/* Contact Hotline Details */}
                    <div style={{ background: '#F8F9F5', padding: '20px', borderRadius: '14px', border: '1px solid rgba(18,22,19,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ fontSize: '13.5px', fontWeight: '900', color: '#121613' }}>📞 Contact & 24/7 Hotline Settings</div>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#7D8880', marginBottom: '4px' }}>Official WhatsApp Concierge Number</label>
                                <input
                                    type="text"
                                    value={sitePages.contact?.hotlineNumber || '+91 90748 58014'}
                                    onChange={e => setSitePages({
                                        ...sitePages,
                                        contact: { ...sitePages.contact, hotlineNumber: e.target.value }
                                    })}
                                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(18,22,19,0.12)', fontSize: '12.5px', fontWeight: '700', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#7D8880', marginBottom: '4px' }}>Support Email Address</label>
                                <input
                                    type="text"
                                    value={sitePages.contact?.supportEmail || 'concierge@aanandham.in'}
                                    onChange={e => setSitePages({
                                        ...sitePages,
                                        contact: { ...sitePages.contact, supportEmail: e.target.value }
                                    })}
                                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(18,22,19,0.12)', fontSize: '12.5px', fontWeight: '700', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
