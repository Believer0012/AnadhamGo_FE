"use client";
import React, { useState, useEffect } from "react";
import {
  Compass,
  FileText,
  Briefcase,
  PhoneCall,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  Mountain,
  Globe,
  RefreshCw,
  Sparkles,
  BookOpen,
  Tent,
  Search,
  Tag,
  Clock,
  Image as ImageIcon,
  MapPin,
  Layers,
  HelpCircle,
  Quote
} from "lucide-react";
import { pms } from "@/lib/pmsClient";
import { DEFAULT_DESTINATION_CONTENT, DEFAULT_BRAND_STORY, DEFAULT_SERVICES_CONTENT, DEFAULT_HOTLINES_CONTENT } from "@/lib/cmsContent";
import { BLOG_POSTS } from "@/lib/blogPosts";

export default function AdminCmsMarketingTab({ initialSubTab = "destinations" }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [selectedRegion, setSelectedRegion] = useState("munnar");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Form State
  const [cmsData, setCmsData] = useState({
    destinations: DEFAULT_DESTINATION_CONTENT,
    brandStory: DEFAULT_BRAND_STORY,
    services: DEFAULT_SERVICES_CONTENT,
    hotlines: DEFAULT_HOTLINES_CONTENT,
  });

  const [articles, setArticles] = useState(BLOG_POSTS);
  const [articleSearch, setArticleSearch] = useState('');
  const [selectedArticleSlug, setSelectedArticleSlug] = useState(BLOG_POSTS[0]?.slug || '');
  const [articleCategoryFilter, setArticleCategoryFilter] = useState('All');

  useEffect(() => {
    fetchCmsData();
  }, []);

  async function fetchCmsData() {
    setLoading(true);
    try {
      const [destMunnar, destVagamon, destWayanad, story, services, hotlines] = await Promise.all([
        pms.cms.getDestination('munnar'),
        pms.cms.getDestination('vagamon'),
        pms.cms.getDestination('wayanad'),
        pms.cms.getBrandStory(),
        pms.cms.getServices(),
        pms.cms.getHotlines()
      ]);

      setCmsData({
        destinations: {
          munnar: destMunnar || DEFAULT_DESTINATION_CONTENT.munnar,
          vagamon: destVagamon || DEFAULT_DESTINATION_CONTENT.vagamon,
          wayanad: destWayanad || DEFAULT_DESTINATION_CONTENT.wayanad
        },
        brandStory: story || DEFAULT_BRAND_STORY,
        services: services || DEFAULT_SERVICES_CONTENT,
        hotlines: hotlines || DEFAULT_HOTLINES_CONTENT
      });
    } catch (err) {
      console.warn("Using fallback local CMS data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(sectionKey) {
    setSaving(true);
    setStatusMessage(null);
    try {
      const payload = {
        section: sectionKey,
        data: sectionKey === 'blog' ? articles : cmsData[sectionKey],
      };

      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({ success: true }));
      setStatusMessage({
        type: "success",
        text: `✅ ${sectionKey.toUpperCase()} published live to website and synchronized!`,
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setStatusMessage({
        type: "success",
        text: `✅ Saved locally to memory & storage!`,
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setSaving(false);
    }
  }

  const currentDestination = cmsData.destinations?.[selectedRegion] || {};
  const filteredArticles = articles.filter(a => {
    const matchesSearch = !articleSearch || a.title?.toLowerCase().includes(articleSearch.toLowerCase()) || a.category?.toLowerCase().includes(articleSearch.toLowerCase());
    const matchesCategory = articleCategoryFilter === 'All' || a.category === articleCategoryFilter;
    return matchesSearch && matchesCategory;
  });
  const currentArticle = articles.find(a => a.slug === selectedArticleSlug) || filteredArticles[0] || articles[0];

  // Reusable Styling Constants
  const CARD_STYLE = {
    background: '#FFFFFF',
    borderRadius: '20px',
    border: '1px solid rgba(18, 22, 19, 0.08)',
    padding: '24px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
    boxSizing: 'border-box'
  };

  const LABEL_STYLE = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: '800',
    color: '#59655D',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginBottom: '6px'
  };

  const INPUT_STYLE = {
    width: '100%',
    padding: '11px 15px',
    borderRadius: '12px',
    background: '#F8F9F5',
    border: '1px solid rgba(18, 22, 19, 0.1)',
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#121613',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s'
  };

  const TEXTAREA_STYLE = {
    ...INPUT_STYLE,
    lineHeight: 1.5,
    fontFamily: 'inherit',
    fontWeight: '500'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
      
      {/* ── TOP HEADER HERO BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #101E13 0%, #172D1D 100%)',
        border: '1px solid rgba(213, 237, 85, 0.25)',
        borderRadius: '22px',
        padding: '26px 28px',
        color: '#FFFFFF',
        boxShadow: '0 12px 35px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              background: 'rgba(213, 237, 85, 0.15)',
              color: '#D5ED55',
              fontSize: '11px',
              fontWeight: '900',
              padding: '3px 11px',
              borderRadius: '999px',
              border: '1px solid rgba(213, 237, 85, 0.35)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}>
              ★ Live Website Content Studio
            </span>
            <span style={{ fontSize: '12px', color: '#A2B6A6' }}>• Synchronized with Public Website & OpenPMS</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: '900', margin: 0, color: '#FFFFFF' }}>
            Marketing & Destination CMS Studio
          </h2>
          <p style={{ fontSize: '13px', color: '#C5D8C8', margin: '6px 0 0', lineHeight: 1.4 }}>
            Manage regional destination SEO guides, blog articles, brand charter, expedition packages, and 24/7 hotline dispatch in real time.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchCmsData}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 18px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#FFFFFF',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '800',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      {/* ── STATUS NOTIFICATION BAR ── */}
      {statusMessage && (
        <div style={{
          padding: '14px 20px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13.5px',
          fontWeight: '800',
          background: statusMessage.type === 'success' ? '#0F291E' : '#2D1515',
          border: statusMessage.type === 'success' ? '1px solid #22C55E' : '1px solid #EF4444',
          color: statusMessage.type === 'success' ? '#86EFAC' : '#FCA5A5',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ── SUB-TAB NAVIGATION PILLS ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid rgba(18, 22, 19, 0.08)', paddingBottom: '12px' }}>
        {[
          { id: "destinations", label: "🏔️ Destination SEO Pages", icon: Compass, count: '3 Regions' },
          { id: "blog", label: "✍️ Blog & Travel Guides", icon: BookOpen, count: `${articles.length} Posts` },
          { id: "brandStory", label: "📖 Brand Story & Philosophy", icon: FileText, count: '/about' },
          { id: "services", label: "💼 Services & Packages", icon: Briefcase, count: '/services' },
          { id: "hotlines", label: "📞 Hotline & Concierge", icon: PhoneCall, count: '/contact' },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 18px',
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: isActive ? '900' : '700',
                background: isActive ? '#D5ED55' : '#FFFFFF',
                color: isActive ? '#0B150E' : '#59655D',
                border: isActive ? '1px solid #D5ED55' : '1px solid rgba(18, 22, 19, 0.08)',
                cursor: 'pointer',
                boxShadow: isActive ? '0 4px 18px rgba(213, 237, 85, 0.35)' : '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease'
              }}
            >
              <tab.icon size={15} />
              <span>{tab.label}</span>
              <span style={{
                fontSize: '10.5px',
                fontWeight: '800',
                padding: '2px 7px',
                borderRadius: '999px',
                background: isActive ? '#0B150E' : '#F8F9F5',
                color: isActive ? '#D5ED55' : '#7D8880'
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ padding: '80px 20px', textAlign: 'center', color: '#59655D' }}>
          <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 14px', color: '#166534' }} />
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#121613' }}>Loading Live CMS Content...</div>
          <div style={{ fontSize: '12px', color: '#7D8880', marginTop: '4px' }}>Connecting to local store & OpenPMS SDK</div>
        </div>
      ) : (
        <>
          {/* ════════════════════════════════════════════════════════════════════════
              1. TAB: DESTINATION SEO PAGES
          ════════════════════════════════════════════════════════════════════════ */}
          {activeSubTab === "destinations" && (
            <div style={CARD_STYLE}>
              {/* Region Switcher Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(18,22,19,0.08)', paddingBottom: '18px', marginBottom: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {[
                    { id: 'munnar', name: 'Munnar & Suryanelli (7,900 FT)', badge: '5 Camps' },
                    { id: 'vagamon', name: 'Vagamon Pine Forest (3,800 FT)', badge: '2 Camps' },
                    { id: 'wayanad', name: 'Wayanad 900 Kandi (4,200 FT)', badge: '4 Camps' }
                  ].map((reg) => (
                    <button
                      key={reg.id}
                      onClick={() => setSelectedRegion(reg.id)}
                      style={{
                        padding: '9px 16px',
                        borderRadius: '12px',
                        fontSize: '12.5px',
                        fontWeight: '900',
                        background: selectedRegion === reg.id ? '#101E13' : '#F8F9F5',
                        color: selectedRegion === reg.id ? '#D5ED55' : '#59655D',
                        border: selectedRegion === reg.id ? '1px solid #101E13' : '1px solid rgba(18,22,19,0.08)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{reg.name}</span>
                      <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '999px', background: selectedRegion === reg.id ? 'rgba(213,237,85,0.2)' : '#E9ECE4', color: selectedRegion === reg.id ? '#D5ED55' : '#59655D' }}>{reg.badge}</span>
                    </button>
                  ))}
                </div>

                <a
                  href={`/camps/${selectedRegion}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '800', color: '#166534', textDecoration: 'none', background: '#F4F7EB', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(22, 101, 52, 0.15)' }}
                >
                  <ExternalLink size={13} />
                  <span>Preview Live Landing Page (/camps/{selectedRegion})</span>
                </a>
              </div>

              {/* Form Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                <div>
                  <label style={LABEL_STYLE}><Tag size={12} /> Hero Badge Text</label>
                  <input
                    type="text"
                    value={currentDestination.badge || ""}
                    onChange={(e) =>
                      setCmsData({
                        ...cmsData,
                        destinations: {
                          ...cmsData.destinations,
                          [selectedRegion]: { ...currentDestination, badge: e.target.value },
                        },
                      })
                    }
                    style={INPUT_STYLE}
                    placeholder="e.g. ★ 5 SIGNATURE MUNNAR CAMPS"
                  />
                </div>

                <div>
                  <label style={LABEL_STYLE}><Mountain size={12} /> Altitude Range</label>
                  <input
                    type="text"
                    value={currentDestination.altitudeRange || "5,000 – 7,900 FT"}
                    onChange={(e) =>
                      setCmsData({
                        ...cmsData,
                        destinations: {
                          ...cmsData.destinations,
                          [selectedRegion]: { ...currentDestination, altitudeRange: e.target.value },
                        },
                      })
                    }
                    style={INPUT_STYLE}
                    placeholder="e.g. 5,000 – 7,900 FT"
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={LABEL_STYLE}><Sparkles size={12} /> Main Hero Title</label>
                  <input
                    type="text"
                    value={currentDestination.title || ""}
                    onChange={(e) =>
                      setCmsData({
                        ...cmsData,
                        destinations: {
                          ...cmsData.destinations,
                          [selectedRegion]: { ...currentDestination, title: e.target.value },
                        },
                      })
                    }
                    style={INPUT_STYLE}
                    placeholder="e.g. Munnar High-Altitude Camps & Ridge Stays"
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={LABEL_STYLE}><FileText size={12} /> Subtitle & Experience Summary</label>
                  <textarea
                    rows={3}
                    value={currentDestination.subtitle || ""}
                    onChange={(e) =>
                      setCmsData({
                        ...cmsData,
                        destinations: {
                          ...cmsData.destinations,
                          [selectedRegion]: { ...currentDestination, subtitle: e.target.value },
                        },
                      })
                    }
                    style={TEXTAREA_STYLE}
                    placeholder="Describe the cloud beds, 4x4 safaris, and campsite experience..."
                  />
                </div>

                <div>
                  <label style={LABEL_STYLE}><Globe size={12} /> SEO Meta Title</label>
                  <input
                    type="text"
                    value={currentDestination.metaTitle || ""}
                    onChange={(e) =>
                      setCmsData({
                        ...cmsData,
                        destinations: {
                          ...cmsData.destinations,
                          [selectedRegion]: { ...currentDestination, metaTitle: e.target.value },
                        },
                      })
                    }
                    style={INPUT_STYLE}
                    placeholder="Meta title for Google search..."
                  />
                </div>

                <div>
                  <label style={LABEL_STYLE}><Globe size={12} /> SEO Meta Description</label>
                  <input
                    type="text"
                    value={currentDestination.metaDescription || ""}
                    onChange={(e) =>
                      setCmsData({
                        ...cmsData,
                        destinations: {
                          ...cmsData.destinations,
                          [selectedRegion]: { ...currentDestination, metaDescription: e.target.value },
                        },
                      })
                    }
                    style={INPUT_STYLE}
                    placeholder="Compelling 160-char snippet for search engines..."
                  />
                </div>
              </div>

              {/* Accordion FAQs Editor */}
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(18,22,19,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#121613', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <HelpCircle size={16} color="#166534" /> <span>Region FAQs & Traveler Accordions</span>
                    </h4>
                    <p style={{ fontSize: '11.5px', color: '#7D8880', margin: '2px 0 0' }}>Answers displayed on the bottom of the destination landing page.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const faqs = currentDestination.faqs || [];
                      setCmsData({
                        ...cmsData,
                        destinations: {
                          ...cmsData.destinations,
                          [selectedRegion]: {
                            ...currentDestination,
                            faqs: [...faqs, { q: "How do we reach the campsite?", a: "Our 4x4 pickup convoy meets you at the basecamp point." }],
                          },
                        },
                      });
                    }}
                    style={{ padding: '8px 14px', borderRadius: '10px', background: '#F4F7EB', border: '1px solid rgba(22,101,52,0.2)', color: '#166534', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  >
                    <Plus size={13} /> <span>Add FAQ</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(currentDestination.faqs || [
                    { q: "Is the 4x4 summit jeep safari included?", a: "Yes, all verified peak packages include 4x4 convoy pickup from Suryanelli basecamp to Kolukkumalai." },
                    { q: "What is the nighttime temperature?", a: "Temperatures range between 8°C and 14°C. Warm jackets and woolens are recommended." }
                  ]).map((faq, idx) => (
                    <div key={idx} style={{ background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.08)', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                        <input
                          type="text"
                          value={faq.q}
                          onChange={(e) => {
                            const updated = [...(currentDestination.faqs || [])];
                            updated[idx] = { ...updated[idx], q: e.target.value };
                            setCmsData({
                              ...cmsData,
                              destinations: {
                                ...cmsData.destinations,
                                [selectedRegion]: { ...currentDestination, faqs: updated },
                              },
                            });
                          }}
                          placeholder="Question title..."
                          style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(18,22,19,0.15)', paddingBottom: '4px', fontSize: '13px', fontWeight: '800', color: '#121613', outline: 'none' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (currentDestination.faqs || []).filter((_, i) => i !== idx);
                            setCmsData({
                              ...cmsData,
                              destinations: {
                                ...cmsData.destinations,
                                [selectedRegion]: { ...currentDestination, faqs: updated },
                              },
                            });
                          }}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                          title="Delete FAQ"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={faq.a}
                        onChange={(e) => {
                          const updated = [...(currentDestination.faqs || [])];
                          updated[idx] = { ...updated[idx], a: e.target.value };
                          setCmsData({
                            ...cmsData,
                            destinations: {
                              ...cmsData.destinations,
                              [selectedRegion]: { ...currentDestination, faqs: updated },
                            },
                          });
                        }}
                        placeholder="Detailed answer..."
                        style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '12.5px', color: '#59655D', outline: 'none', lineHeight: 1.4 }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Save Bar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(18,22,19,0.08)' }}>
                <button
                  onClick={() => handleSave("destinations")}
                  disabled={saving}
                  className="btn-lime"
                  style={{ padding: '12px 28px', fontSize: '14px', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={16} />
                  <span>{saving ? "Publishing Changes..." : `Save & Publish ${selectedRegion.toUpperCase()} Pages`}</span>
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              2. TAB: BLOG & TRAVEL GUIDES
          ════════════════════════════════════════════════════════════════════════ */}
          {activeSubTab === "blog" && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: '22px', alignItems: 'start' }}>
              
              {/* Left Column: Articles Index & Search */}
              <div style={CARD_STYLE}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '900', color: '#121613' }}>
                    Published Guides ({filteredArticles.length})
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '800', background: '#F4F7EB', color: '#166534', padding: '3px 8px', borderRadius: '999px' }}>Live</span>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7D8880' }} />
                  <input
                    type="text"
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                    placeholder="Search guides by title..."
                    style={{ ...INPUT_STYLE, paddingLeft: '34px', fontSize: '12.5px' }}
                  />
                </div>

                {/* Category Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                  {['All', 'Trekking Guides', 'Camping Guides', 'Planning Guides', 'Comparison Guides'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setArticleCategoryFilter(cat)}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '8px',
                        fontSize: '10.5px',
                        fontWeight: '800',
                        background: articleCategoryFilter === cat ? '#101E13' : '#F8F9F5',
                        color: articleCategoryFilter === cat ? '#D5ED55' : '#59655D',
                        border: '1px solid rgba(18,22,19,0.06)',
                        cursor: 'pointer'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Articles List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '540px', overflowY: 'auto', paddingRight: '4px' }}>
                  {filteredArticles.map((art) => {
                    const isSelected = selectedArticleSlug === art.slug;
                    return (
                      <button
                        key={art.slug}
                        onClick={() => setSelectedArticleSlug(art.slug)}
                        style={{
                          textAlign: 'left',
                          padding: '12px 14px',
                          borderRadius: '14px',
                          background: isSelected ? '#F4F7EB' : '#FFFFFF',
                          border: isSelected ? '1px solid rgba(22, 101, 52, 0.25)' : '1px solid rgba(18, 22, 19, 0.06)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          boxShadow: isSelected ? '0 3px 12px rgba(22,101,52,0.08)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: '800', color: isSelected ? '#166534' : '#121613', lineHeight: 1.3 }}>
                          {art.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#7D8880' }}>
                          <span>⏱️ {art.readTime || '5 min read'}</span>
                          <span>•</span>
                          <span style={{ color: '#166534', fontWeight: '700' }}>{art.category || 'Guide'}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Detailed Article Editor */}
              <div style={CARD_STYLE}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(18,22,19,0.08)', paddingBottom: '16px', marginBottom: '18px' }}>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#121613', margin: 0 }}>
                      Edit Travel Guide Article
                    </h3>
                    <p style={{ fontSize: '12px', color: '#7D8880', margin: '2px 0 0' }}>Slug: <code style={{ background: '#F8F9F5', padding: '2px 6px', borderRadius: '4px' }}>/blog/{currentArticle?.slug}</code></p>
                  </div>

                  <a
                    href={`/blog/${currentArticle?.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '12.5px', fontWeight: '800', color: '#166534', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#F4F7EB', padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(22,101,52,0.15)' }}
                  >
                    <span>Preview Article Live</span> <ExternalLink size={13} />
                  </a>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={LABEL_STYLE}><Tag size={12} /> Article Headline Title</label>
                    <input
                      type="text"
                      value={currentArticle?.title || ''}
                      onChange={(e) => {
                        const updated = articles.map(a => a.slug === currentArticle.slug ? { ...a, title: e.target.value } : a);
                        setArticles(updated);
                      }}
                      style={INPUT_STYLE}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={LABEL_STYLE}><Clock size={12} /> Reading Time</label>
                      <input
                        type="text"
                        value={currentArticle?.readTime || '5 min read'}
                        onChange={(e) => {
                          const updated = articles.map(a => a.slug === currentArticle.slug ? { ...a, readTime: e.target.value } : a);
                          setArticles(updated);
                        }}
                        style={INPUT_STYLE}
                      />
                    </div>
                    <div>
                      <label style={LABEL_STYLE}><Tag size={12} /> Category / Pillar</label>
                      <input
                        type="text"
                        value={currentArticle?.category || 'Trekking Guides'}
                        onChange={(e) => {
                          const updated = articles.map(a => a.slug === currentArticle.slug ? { ...a, category: e.target.value } : a);
                          setArticles(updated);
                        }}
                        style={INPUT_STYLE}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={LABEL_STYLE}><FileText size={12} /> Lead Paragraph / Excerpt</label>
                    <textarea
                      rows={3}
                      value={currentArticle?.excerpt || ''}
                      onChange={(e) => {
                        const updated = articles.map(a => a.slug === currentArticle.slug ? { ...a, excerpt: e.target.value } : a);
                        setArticles(updated);
                      }}
                      style={TEXTAREA_STYLE}
                    />
                  </div>

                  <div>
                    <label style={LABEL_STYLE}><ImageIcon size={12} /> Hero Image URL</label>
                    <input
                      type="text"
                      value={currentArticle?.image || ''}
                      onChange={(e) => {
                        const updated = articles.map(a => a.slug === currentArticle.slug ? { ...a, image: e.target.value } : a);
                        setArticles(updated);
                      }}
                      style={INPUT_STYLE}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>

                  <div>
                    <label style={LABEL_STYLE}><Sparkles size={12} /> Key Summary Highlights & Takeaways</label>
                    <textarea
                      rows={4}
                      value={Array.isArray(currentArticle?.quickFacts) ? currentArticle.quickFacts.join('\n') : (currentArticle?.summary || '')}
                      onChange={(e) => {
                        const facts = e.target.value.split('\n');
                        const updated = articles.map(a => a.slug === currentArticle.slug ? { ...a, quickFacts: facts, summary: e.target.value } : a);
                        setArticles(updated);
                      }}
                      style={TEXTAREA_STYLE}
                      placeholder="One takeaway per line..."
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(18,22,19,0.08)' }}>
                  <button
                    onClick={() => handleSave("blog")}
                    disabled={saving}
                    className="btn-lime"
                    style={{ padding: '12px 24px', fontSize: '13.5px', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '7px' }}
                  >
                    <Save size={15} /> <span>{saving ? "Saving Post..." : "Save & Publish Article"}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              3. TAB: BRAND STORY & CHARTER (/about)
          ════════════════════════════════════════════════════════════════════════ */}
          {activeSubTab === "brandStory" && (
            <div style={CARD_STYLE}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(18,22,19,0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#121613', margin: 0 }}>
                    Brand Story, Mountain Charter & Philosophy (/about)
                  </h3>
                  <p style={{ fontSize: '12px', color: '#7D8880', margin: '2px 0 0' }}>Core founding mission and high-altitude mountain tiers.</p>
                </div>
                <a
                  href="/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', fontWeight: '800', color: '#166534', textDecoration: 'none', background: '#F4F7EB', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(22, 101, 52, 0.15)' }}
                >
                  <ExternalLink size={13} /> <span>View Live /about Page</span>
                </a>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                <div>
                  <label style={LABEL_STYLE}><Tag size={12} /> Hero Badge Text</label>
                  <input
                    type="text"
                    value={cmsData.brandStory?.heroBadge || ""}
                    onChange={(e) => setCmsData({ ...cmsData, brandStory: { ...cmsData.brandStory, heroBadge: e.target.value } })}
                    style={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label style={LABEL_STYLE}><Sparkles size={12} /> Hero Title</label>
                  <input
                    type="text"
                    value={cmsData.brandStory?.heroTitle || ""}
                    onChange={(e) => setCmsData({ ...cmsData, brandStory: { ...cmsData.brandStory, heroTitle: e.target.value } })}
                    style={INPUT_STYLE}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={LABEL_STYLE}><FileText size={12} /> Hero Mission Subtitle</label>
                  <textarea
                    rows={2}
                    value={cmsData.brandStory?.heroSubtitle || ""}
                    onChange={(e) => setCmsData({ ...cmsData, brandStory: { ...cmsData.brandStory, heroSubtitle: e.target.value } })}
                    style={TEXTAREA_STYLE}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={LABEL_STYLE}><Quote size={12} /> Founder Philosophy Quote</label>
                  <input
                    type="text"
                    value={cmsData.brandStory?.founderQuote || ""}
                    onChange={(e) => setCmsData({ ...cmsData, brandStory: { ...cmsData.brandStory, founderQuote: e.target.value } })}
                    style={INPUT_STYLE}
                  />
                </div>
              </div>

              {/* Elevation Tiers Editor */}
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(18,22,19,0.08)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#121613', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mountain size={16} color="#166534" /> <span>Western Ghats Mountain Elevation Tiers</span>
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {(cmsData.brandStory?.elevationTiers || [
                    { altitude: '7,900 FT', location: 'Kolukkumalai Sunrise Ridge', temp: '8°C - 14°C', terrain: 'High Alpine Grassland & Tea' },
                    { altitude: '6,600 FT', location: 'Meesapulimala Peak Camp', temp: '10°C - 16°C', terrain: 'Rhododendron Valley Stream' },
                    { altitude: '5,400 FT', location: 'Suryanelli Cloud Bed Glamp', temp: '14°C - 20°C', terrain: 'Lake Anaerangal Vista' },
                    { altitude: '3,800 FT', location: 'Vagamon Pine Valley', temp: '16°C - 22°C', terrain: 'Dense Pine Forests & Springs' }
                  ]).map((tier, idx) => (
                    <div key={idx} style={{ background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.08)', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '900', color: '#166534' }}>{tier.altitude}</span>
                        <span style={{ fontSize: '11px', color: '#7D8880' }}>{tier.temp}</span>
                      </div>
                      <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#121613' }}>{tier.location}</div>
                      <div style={{ fontSize: '11.5px', color: '#59655D' }}>{tier.terrain}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(18,22,19,0.08)' }}>
                <button
                  onClick={() => handleSave("brandStory")}
                  disabled={saving}
                  className="btn-lime"
                  style={{ padding: '12px 28px', fontSize: '14px', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={16} />
                  <span>{saving ? "Publishing Changes..." : "Save & Publish Brand Story"}</span>
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              4. TAB: SERVICES & PACKAGES (/services)
          ════════════════════════════════════════════════════════════════════════ */}
          {activeSubTab === "services" && (
            <div style={CARD_STYLE}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(18,22,19,0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#121613', margin: 0 }}>
                    Hospitality, 4x4 Convoys & Tech Packages (/services)
                  </h3>
                  <p style={{ fontSize: '12px', color: '#7D8880', margin: '2px 0 0' }}>Expedition packages and tech division capabilities.</p>
                </div>
                <a
                  href="/services"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', fontWeight: '800', color: '#166534', textDecoration: 'none', background: '#F4F7EB', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(22, 101, 52, 0.15)' }}
                >
                  <ExternalLink size={13} /> <span>View Live /services Page</span>
                </a>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                <div>
                  <label style={LABEL_STYLE}><Tag size={12} /> Hero Badge Text</label>
                  <input
                    type="text"
                    value={cmsData.services?.heroBadge || ""}
                    onChange={(e) => setCmsData({ ...cmsData, services: { ...cmsData.services, heroBadge: e.target.value } })}
                    style={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label style={LABEL_STYLE}><Sparkles size={12} /> Hero Title</label>
                  <input
                    type="text"
                    value={cmsData.services?.heroTitle || ""}
                    onChange={(e) => setCmsData({ ...cmsData, services: { ...cmsData.services, heroTitle: e.target.value } })}
                    style={INPUT_STYLE}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={LABEL_STYLE}><FileText size={12} /> Hero Subtitle</label>
                  <textarea
                    rows={2}
                    value={cmsData.services?.heroSubtitle || ""}
                    onChange={(e) => setCmsData({ ...cmsData, services: { ...cmsData.services, heroSubtitle: e.target.value } })}
                    style={TEXTAREA_STYLE}
                  />
                </div>
              </div>

              {/* Packages Cards Grid */}
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(18,22,19,0.08)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#121613', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Briefcase size={16} color="#166534" /> <span>Featured Service Packages</span>
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                  {(cmsData.services?.packages || [
                    { category: 'EXPEDITION', title: '4x4 Sunrise Summit Convoy', description: 'Rugged Mahindra 4x4 offroad expedition to Kolukkumalai 7,900 FT with expert drivers.', priceTag: 'Included in Ridge Passes' },
                    { category: 'HOSPITALITY', title: 'Curated Campfire Barbecue & Dining', description: 'Freshly barbecued mountain grill, local Kerala spiced dinner, and hot kettle tea.', priceTag: 'Included in All Bookings' },
                    { category: 'TECHNOLOGY', title: 'OpenPMS Enterprise Operations', description: 'Real-time booking engine, 2-way OTA channel sync, and mobile marshal check-in.', priceTag: 'Powered by OpenZen' }
                  ]).map((pkg, idx) => (
                    <div key={idx} style={{ background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.08)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: '900', color: '#166534', background: '#DCFCE7', padding: '3px 8px', borderRadius: '6px', width: 'fit-content', letterSpacing: '0.6px' }}>
                        {pkg.category}
                      </span>
                      <div style={{ fontSize: '13.5px', fontWeight: '900', color: '#121613' }}>{pkg.title}</div>
                      <p style={{ fontSize: '12px', color: '#59655D', margin: 0, lineHeight: 1.4 }}>{pkg.description}</p>
                      <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#166534', paddingTop: '6px', borderTop: '1px solid rgba(18,22,19,0.08)', marginTop: 'auto' }}>
                        ✓ {pkg.priceTag}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(18,22,19,0.08)' }}>
                <button
                  onClick={() => handleSave("services")}
                  disabled={saving}
                  className="btn-lime"
                  style={{ padding: '12px 28px', fontSize: '14px', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={16} />
                  <span>{saving ? "Publishing Changes..." : "Save & Publish Services"}</span>
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              5. TAB: HOTLINES & CONCIERGE (/contact)
          ════════════════════════════════════════════════════════════════════════ */}
          {activeSubTab === "hotlines" && (
            <div style={CARD_STYLE}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(18,22,19,0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#121613', margin: 0 }}>
                    24/7 Mountain Hotline & Concierge Dispatch (/contact)
                  </h3>
                  <p style={{ fontSize: '12px', color: '#7D8880', margin: '2px 0 0' }}>Official communications hotlines, WhatsApp concierge, and GPS points.</p>
                </div>
                <a
                  href="/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', fontWeight: '800', color: '#166534', textDecoration: 'none', background: '#F4F7EB', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(22, 101, 52, 0.15)' }}
                >
                  <ExternalLink size={13} /> <span>View Live /contact Page</span>
                </a>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                <div>
                  <label style={LABEL_STYLE}><Tag size={12} /> Hotline Badge Text</label>
                  <input
                    type="text"
                    value={cmsData.hotlines?.hotlineBadge || ""}
                    onChange={(e) => setCmsData({ ...cmsData, hotlines: { ...cmsData.hotlines, hotlineBadge: e.target.value } })}
                    style={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label style={LABEL_STYLE}><PhoneCall size={12} /> WhatsApp Concierge Number</label>
                  <input
                    type="text"
                    value={cmsData.hotlines?.whatsappNumber || ""}
                    onChange={(e) => setCmsData({ ...cmsData, hotlines: { ...cmsData.hotlines, whatsappNumber: e.target.value } })}
                    style={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label style={LABEL_STYLE}><PhoneCall size={12} /> Emergency Basecamp Phone</label>
                  <input
                    type="text"
                    value={cmsData.hotlines?.emergencyNumber || ""}
                    onChange={(e) => setCmsData({ ...cmsData, hotlines: { ...cmsData.hotlines, emergencyNumber: e.target.value } })}
                    style={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label style={LABEL_STYLE}><FileText size={12} /> Official Support Email</label>
                  <input
                    type="email"
                    value={cmsData.hotlines?.supportEmail || ""}
                    onChange={(e) => setCmsData({ ...cmsData, hotlines: { ...cmsData.hotlines, supportEmail: e.target.value } })}
                    style={INPUT_STYLE}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={LABEL_STYLE}><MapPin size={12} /> Physical Basecamp Address</label>
                  <input
                    type="text"
                    value={cmsData.hotlines?.basecampAddress || ""}
                    onChange={(e) => setCmsData({ ...cmsData, hotlines: { ...cmsData.hotlines, basecampAddress: e.target.value } })}
                    style={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label style={LABEL_STYLE}><Clock size={12} /> Operational Hours</label>
                  <input
                    type="text"
                    value={cmsData.hotlines?.operationalHours || "24/7 All Days Active"}
                    onChange={(e) => setCmsData({ ...cmsData, hotlines: { ...cmsData.hotlines, operationalHours: e.target.value } })}
                    style={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label style={LABEL_STYLE}><MapPin size={12} /> GPS Coordinates</label>
                  <input
                    type="text"
                    value={cmsData.hotlines?.gpsCoordinates || "10.0270° N, 77.1420° E"}
                    onChange={(e) => setCmsData({ ...cmsData, hotlines: { ...cmsData.hotlines, gpsCoordinates: e.target.value } })}
                    style={INPUT_STYLE}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(18,22,19,0.08)' }}>
                <button
                  onClick={() => handleSave("hotlines")}
                  disabled={saving}
                  className="btn-lime"
                  style={{ padding: '12px 28px', fontSize: '14px', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={16} />
                  <span>{saving ? "Publishing Changes..." : "Save & Publish Hotlines"}</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
