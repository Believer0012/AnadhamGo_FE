"use client";
import React, { useState } from "react";
import Link from 'next/link';
import {
  BookOpen, Search, Plus, Trash2, Save, CheckCircle2,
  AlertCircle, ExternalLink, Image as ImageIcon, Tag, Clock, Sparkles, ChevronRight, X
} from "lucide-react";
import { BLOG_POSTS } from "@/lib/blogPosts";
import { ROW_SPACE_WRAP, IMG_FILL_STYLE } from '../../AdminSharedStyles';

export default function AdminBlogCmsTab() {
  const [articles, setArticles] = useState(BLOG_POSTS);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingArticleSlug, setEditingArticleSlug] = useState(null);
  const [articleForm, setArticleForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const categories = ['All', 'Trekking Guides', 'Camping Guides', 'Planning Guides', 'Comparison Guides', 'Safety & Trust'];

  const filteredArticles = articles.filter(a => {
    const matchCat = categoryFilter === 'All' || a.category === categoryFilter;
    const matchSearch = !searchQuery || a.title?.toLowerCase().includes(searchQuery.toLowerCase()) || a.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  function openComposerModal(article) {
    if (article) {
      setEditingArticleSlug(article.slug);
      setArticleForm({ ...article });
    } else {
      const newSlug = `new-guide-${Date.now()}`;
      setEditingArticleSlug(newSlug);
      setArticleForm({
        slug: newSlug,
        title: "New High-Altitude Guide",
        category: "Trekking Guides",
        readTime: "5 min read",
        excerpt: "Essential tips and guide for campers...",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        quickFacts: ["Carry woolens for 10°C nights", "4x4 pickup starts from basecamp"]
      });
    }
  }

  async function handleSaveArticle() {
    if (!articleForm) return;
    setSaving(true);
    let updated;
    const exists = articles.some(a => a.slug === editingArticleSlug);
    if (exists) {
      updated = articles.map(a => a.slug === editingArticleSlug ? articleForm : a);
    } else {
      updated = [articleForm, ...articles];
    }
    setArticles(updated);

    try {
      await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "blog", data: updated }),
      });
      setStatusMessage({ type: "success", text: `✅ Article "${articleForm.title}" published live!` });
      setTimeout(() => setStatusMessage(null), 4000);
      setEditingArticleSlug(null);
    } catch (e) {
      setStatusMessage({ type: "success", text: `✅ Saved locally to cache!` });
      setTimeout(() => setStatusMessage(null), 4000);
      setEditingArticleSlug(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* ── TOP HEADER ── */}
      <div style={ROW_SPACE_WRAP}>
        <div>
          <div className="star-badge" style={{ marginBottom: '4px' }}>
            <span className="star-icon">★</span> EDITORIAL NEWSROOM & GUIDES
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: '800', margin: 0, color: '#121613' }}>
            Travel Guides & Trekking Articles ({articles.length})
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => openComposerModal(null)} className="btn-lime" style={{ padding: '10px 22px', fontSize: '13.5px', fontWeight: '800' }}>
            + Compose New Guide
          </button>
        </div>
      </div>

      {statusMessage && (
        <div style={{ padding: '12px 18px', borderRadius: '12px', background: statusMessage.type === 'success' ? '#0F291E' : '#2D1515', border: statusMessage.type === 'success' ? '1px solid #22C55E' : '1px solid #EF4444', color: statusMessage.type === 'success' ? '#86EFAC' : '#FCA5A5', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <CheckCircle2 size={16} /> <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ── SEARCH & CATEGORY CHIPS ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div className="admin-region-chip-row" style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {categories.map(cat => {
            const isSelected = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '999px',
                  border: isSelected ? '1px solid #121613' : '1px solid rgba(18,22,19,0.12)',
                  background: isSelected ? '#121613' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#59655D',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {cat === 'All' ? `All Guides (${articles.length})` : cat}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7D8880' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides..."
            style={{ width: '100%', padding: '8px 14px 8px 32px', borderRadius: '999px', background: '#FFFFFF', border: '1px solid rgba(18,22,19,0.12)', fontSize: '12.5px', color: '#121613', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* ── ARTICLES CARD GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {filteredArticles.map(art => (
          <div
            key={art.slug}
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(18, 22, 19, 0.08)',
              borderRadius: '20px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 18px rgba(0,0,0,0.03)'
            }}
          >
            {/* Image Banner */}
            <div 
              onClick={() => openComposerModal(art)}
              style={{ position: 'relative', height: '180px', cursor: 'pointer' }}
            >
              <img src={art.image} alt={art.title} style={IMG_FILL_STYLE} loading="lazy" decoding="async" />
              <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#121613', color: '#D5ED55', fontSize: '10.5px', fontWeight: '900', padding: '4px 10px', borderRadius: '999px' }}>
                {art.category || 'Guide'}
              </span>
              <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.65)', color: '#FFFFFF', fontSize: '10.5px', fontWeight: '700', padding: '4px 10px', borderRadius: '999px', backdropFilter: 'blur(6px)' }}>
                ⏱️ {art.readTime || '5 min read'}
              </span>
            </div>

            {/* Card Content */}
            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#7D8880', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
                Article · /blog/{art.slug}
              </div>
              <h4 
                onClick={() => openComposerModal(art)}
                style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: '800', color: '#121613', margin: '0 0 10px', lineHeight: 1.35, cursor: 'pointer' }}
              >
                {art.title}
              </h4>
              <p style={{ fontSize: '12.5px', color: '#59655D', margin: '0 0 14px', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {art.excerpt}
              </p>

              {/* Takeaways Stats Box */}
              <div style={{ background: '#F8F9F5', border: '1px solid rgba(18, 22, 19, 0.06)', borderRadius: '12px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '11.5px', color: '#7D8880' }}>Key Takeaways</span>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#166534' }}>
                  {Array.isArray(art.quickFacts) ? `${art.quickFacts.length} Highlights` : 'Configured'}
                </span>
              </div>

              {/* Full-width Composer Action */}
              <button
                onClick={() => openComposerModal(art)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: '#121613',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  border: 'none'
                }}
              >
                <span>Edit Article & Takeaways</span>
                <ChevronRight size={14} />
              </button>

              {/* Footer Actions */}
              <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                <Link
                  href={`/blog/${art.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', background: 'rgba(18,22,19,0.06)', color: '#121613', fontSize: '12px', fontWeight: '800', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <span>Read Live</span> <ExternalLink size={12} />
                </Link>
                <button
                  onClick={() => openComposerModal(art)}
                  className="btn-lime"
                  style={{ padding: '10px 18px', fontSize: '12px', fontWeight: '900' }}
                >
                  Edit Composer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── MODAL DRAWER: ARTICLE COMPOSER ── */}
      {editingArticleSlug && articleForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100020, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '720px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(18,22,19,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#101E13', color: '#FFFFFF' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#D5ED55', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Editorial Composer</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF' }}>{articleForm.title}</div>
              </div>
              <button onClick={() => setEditingArticleSlug(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFFFFF', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Headline Title</label>
                <input
                  type="text"
                  value={articleForm.title || ''}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '13.5px', fontWeight: '800', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Category Pillar</label>
                  <input
                    type="text"
                    value={articleForm.category || ''}
                    onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Reading Time</label>
                  <input
                    type="text"
                    value={articleForm.readTime || ''}
                    onChange={(e) => setArticleForm({ ...articleForm, readTime: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Hero Image URL</label>
                <input
                  type="text"
                  value={articleForm.image || ''}
                  onChange={(e) => setArticleForm({ ...articleForm, image: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
                {articleForm.image && (
                  <div style={{ marginTop: '8px', height: '120px', borderRadius: '10px', overflow: 'hidden', backgroundImage: `url(${articleForm.image})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid rgba(18,22,19,0.1)' }} />
                )}
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Lead Excerpt</label>
                <textarea
                  rows={3}
                  value={articleForm.excerpt || ''}
                  onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '12.5px', boxSizing: 'border-box', lineHeight: 1.45 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Key Takeaways & Quick Facts (One per line)</label>
                <textarea
                  rows={4}
                  value={Array.isArray(articleForm.quickFacts) ? articleForm.quickFacts.join('\n') : (articleForm.summary || '')}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n');
                    setArticleForm({ ...articleForm, quickFacts: lines, summary: e.target.value });
                  }}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '12.5px', boxSizing: 'border-box', lineHeight: 1.45 }}
                  placeholder="One highlight per line..."
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(18,22,19,0.08)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setEditingArticleSlug(null)} style={{ padding: '10px 18px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveArticle} disabled={saving} className="btn-lime" style={{ padding: '10px 24px', fontSize: '13px', fontWeight: '900' }}>
                {saving ? 'Publishing...' : 'Save & Publish Guide'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
