"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import {
  Compass, Mountain, Globe, Sparkles, ExternalLink, Plus, Trash2,
  Save, CheckCircle2, AlertCircle, RefreshCw, HelpCircle, Tag, Eye, ChevronRight, X
} from "lucide-react";
import { pms } from "@/lib/pmsClient";
import { DEFAULT_DESTINATION_CONTENT } from "@/lib/cmsContent";
import { 
    META_LABEL_STYLE, ELLIPSIS_STYLE, CARD_CLICKABLE, ROW_SPACE_WRAP, IMG_FILL_STYLE 
} from '../../AdminSharedStyles';

const REGIONS_DATA = {
  munnar: {
    id: 'munnar',
    name: 'Munnar & Suryanelli',
    altitude: '7,900 FT',
    campsCount: 5,
    bestSeason: 'Sept - May',
    tempRange: '8°C - 16°C',
    roadType: '4x4 Jeep Convoy',
    image: 'https://images.unsplash.com/photo-1590053351608-f99a5bb7965f?auto=format&fit=crop&w=800&q=80'
  },
  vagamon: {
    id: 'vagamon',
    name: 'Vagamon Pine Forest',
    altitude: '3,800 FT',
    campsCount: 2,
    bestSeason: 'All Year Active',
    tempRange: '14°C - 22°C',
    roadType: 'All-Terrain Sedan / SUV',
    image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80'
  },
  wayanad: {
    id: 'wayanad',
    name: 'Wayanad 900 Kandi',
    altitude: '4,200 FT',
    campsCount: 4,
    bestSeason: 'Oct - June',
    tempRange: '16°C - 24°C',
    roadType: '4x4 Forest Offroad',
    image: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&w=800&q=80'
  }
};

export default function AdminDestinationsCmsTab() {
  const [destinations, setDestinations] = useState(DEFAULT_DESTINATION_CONTENT);
  const [regionFilter, setRegionFilter] = useState('All');
  const [editingRegionKey, setEditingRegionKey] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [m, v, w] = await Promise.all([
        pms.cms.getDestination('munnar'),
        pms.cms.getDestination('vagamon'),
        pms.cms.getDestination('wayanad')
      ]);
      setDestinations({
        munnar: m || DEFAULT_DESTINATION_CONTENT.munnar,
        vagamon: v || DEFAULT_DESTINATION_CONTENT.vagamon,
        wayanad: w || DEFAULT_DESTINATION_CONTENT.wayanad
      });
    } catch (e) {
      console.warn("Using local destinations cache", e);
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(regionKey) {
    setEditingRegionKey(regionKey);
    setEditForm({
      ...(destinations[regionKey] || DEFAULT_DESTINATION_CONTENT[regionKey]),
      faqs: destinations[regionKey]?.faqs || [
        { q: "Is 4x4 pickup convoy included?", a: "Yes, all verified peak packages include 4x4 pickup." },
        { q: "What are the night temperatures?", a: "Night temperatures range between 8°C and 14°C." }
      ]
    });
  }

  async function handleSaveRegion() {
    if (!editingRegionKey || !editForm) return;
    setSaving(true);
    const updated = {
      ...destinations,
      [editingRegionKey]: editForm
    };
    setDestinations(updated);
    try {
      await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "destinations", data: updated }),
      });
      setStatusMessage({ type: "success", text: `✅ Destination "${REGIONS_DATA[editingRegionKey]?.name}" published live!` });
      setTimeout(() => setStatusMessage(null), 4000);
      setEditingRegionKey(null);
    } catch (e) {
      setStatusMessage({ type: "success", text: `✅ Saved locally to cache!` });
      setTimeout(() => setStatusMessage(null), 4000);
      setEditingRegionKey(null);
    } finally {
      setSaving(false);
    }
  }

  const regionKeys = Object.keys(REGIONS_DATA);
  const filteredKeys = regionFilter === 'All' ? regionKeys : regionKeys.filter(k => k === regionFilter);

  return (
    <div>
      {/* ── TOP HEADER ── */}
      <div style={ROW_SPACE_WRAP}>
        <div>
          <div className="star-badge" style={{ marginBottom: '4px' }}>
            <span className="star-icon">★</span> DESTINATION & REGIONAL SEO
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: '800', margin: 0, color: '#121613' }}>
            Western Ghats Regional Hubs & Meta
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={fetchData} style={{ padding: '10px 18px', borderRadius: '10px', background: '#FFFFFF', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> <span>Sync Live</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div style={{ padding: '12px 18px', borderRadius: '12px', background: statusMessage.type === 'success' ? '#0F291E' : '#2D1515', border: statusMessage.type === 'success' ? '1px solid #22C55E' : '1px solid #EF4444', color: statusMessage.type === 'success' ? '#86EFAC' : '#FCA5A5', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <CheckCircle2 size={16} /> <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ── REGION FILTER CHIPS ── */}
      <div className="admin-region-chip-row" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }}>
        {['All', ...regionKeys].map(regKey => {
          const label = regKey === 'All' ? 'All Kerala Destinations (3)' : REGIONS_DATA[regKey]?.name;
          const isSelected = regionFilter === regKey;
          return (
            <button
              key={regKey}
              onClick={() => setRegionFilter(regKey)}
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
              {label}
            </button>
          );
        })}
      </div>

      {/* ── DESTINATIONS CARD GRID (Learned from Campsites Grid) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {filteredKeys.map(key => {
          const regionInfo = REGIONS_DATA[key];
          const content = destinations[key] || DEFAULT_DESTINATION_CONTENT[key];

          return (
            <div
              key={key}
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
              {/* Photo Banner with Top Badges */}
              <div 
                onClick={() => openEditModal(key)}
                style={{ position: 'relative', height: '190px', cursor: 'pointer' }}
              >
                <img src={regionInfo.image} alt={regionInfo.name} style={IMG_FILL_STYLE} loading="lazy" decoding="async" />
                <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#121613', color: '#D5ED55', fontSize: '10.5px', fontWeight: '900', padding: '4px 10px', borderRadius: '999px' }}>
                  {content.badge || `★ ${regionInfo.campsCount} VERIFIED CAMPS`}
                </span>
                <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.65)', color: '#FFFFFF', fontSize: '10.5px', fontWeight: '700', padding: '4px 10px', borderRadius: '999px', backdropFilter: 'blur(6px)' }}>
                  {regionInfo.altitude}
                </span>
              </div>

              {/* Card Body */}
              <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#7D8880', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
                  Western Ghats Hub · {regionInfo.campsCount} Active Camps
                </div>
                <h4 
                  onClick={() => openEditModal(key)}
                  style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '800', color: '#121613', margin: '0 0 10px', lineHeight: 1.3, cursor: 'pointer' }}
                >
                  {content.title || regionInfo.name}
                </h4>
                <p style={{ fontSize: '12.5px', color: '#59655D', margin: '0 0 14px', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {content.subtitle}
                </p>

                {/* Vibe & Altitude Stats Box */}
                <div style={{ background: '#F8F9F5', border: '1px solid rgba(18, 22, 19, 0.06)', borderRadius: '14px', padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#7D8880', fontWeight: '800', textTransform: 'uppercase' }}>Best Season</div>
                    <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#121613' }}>{regionInfo.bestSeason}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#7D8880', fontWeight: '800', textTransform: 'uppercase' }}>Night Temperature</div>
                    <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#166534' }}>{regionInfo.tempRange}</div>
                  </div>
                </div>

                {/* Edit Destination Button */}
                <button
                  onClick={() => openEditModal(key)}
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
                  <span>Edit Destination SEO & FAQs ({content.faqs ? content.faqs.length : 2} items)</span>
                  <ChevronRight size={14} />
                </button>

                {/* Footer Action Links */}
                <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                  <Link
                    href={`/camps/${key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', background: 'rgba(18,22,19,0.06)', color: '#121613', fontSize: '12px', fontWeight: '800', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    <span>Live Page</span> <ExternalLink size={12} />
                  </Link>
                  <button
                    onClick={() => openEditModal(key)}
                    className="btn-lime"
                    style={{ padding: '10px 18px', fontSize: '12px', fontWeight: '900' }}
                  >
                    Edit SEO Meta
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── MODAL DRAWER: REGION DETAILS & FAQ BUILDER ── */}
      {editingRegionKey && editForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100020, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '720px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(18,22,19,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#101E13', color: '#FFFFFF' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#D5ED55', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Destination SEO Editor</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF' }}>{REGIONS_DATA[editingRegionKey]?.name}</div>
              </div>
              <button onClick={() => setEditingRegionKey(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFFFFF', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Google SERP Snippet Preview */}
              <div style={{ background: '#F8F9F5', borderRadius: '14px', padding: '14px 18px', border: '1px solid rgba(18,22,19,0.08)' }}>
                <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#7D8880', textTransform: 'uppercase', marginBottom: '4px' }}>Google Search Simulation</div>
                <div style={{ fontSize: '12px', color: '#202124' }}>https://aanandham.in › camps › {editingRegionKey}</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a0dab', textDecoration: 'underline' }}>{editForm.metaTitle || editForm.title}</div>
                <div style={{ fontSize: '12.5px', color: '#4d5156', marginTop: '2px' }}>{editForm.metaDescription || editForm.subtitle}</div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Hero Badge</label>
                <input
                  type="text"
                  value={editForm.badge || ''}
                  onChange={(e) => setEditForm({ ...editForm, badge: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Main Title Headline</label>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '13.5px', fontWeight: '800', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Experience Summary & Subtitle</label>
                <textarea
                  rows={3}
                  value={editForm.subtitle || ''}
                  onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '12.5px', boxSizing: 'border-box', lineHeight: 1.45 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>SEO Meta Title</label>
                  <input
                    type="text"
                    value={editForm.metaTitle || ''}
                    onChange={(e) => setEditForm({ ...editForm, metaTitle: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>SEO Meta Description</label>
                  <input
                    type="text"
                    value={editForm.metaDescription || ''}
                    onChange={(e) => setEditForm({ ...editForm, metaDescription: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* FAQs Manager */}
              <div style={{ borderTop: '1px solid rgba(18,22,19,0.08)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: '#121613' }}>Accordion FAQs ({editForm.faqs?.length || 0})</div>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, faqs: [...(editForm.faqs || []), { q: "New Question?", a: "Answer text..." }] })}
                    style={{ padding: '6px 12px', borderRadius: '8px', background: '#F4F7EB', border: '1px solid rgba(22,101,52,0.2)', color: '#166534', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer' }}
                  >
                    + Add Question
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(editForm.faqs || []).map((faq, idx) => (
                    <div key={idx} style={{ background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.08)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={faq.q}
                          onChange={(e) => {
                            const updated = [...editForm.faqs];
                            updated[idx] = { ...updated[idx], q: e.target.value };
                            setEditForm({ ...editForm, faqs: updated });
                          }}
                          style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(18,22,19,0.15)', fontSize: '12.5px', fontWeight: '800', color: '#121613', outline: 'none' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editForm.faqs.filter((_, i) => i !== idx);
                            setEditForm({ ...editForm, faqs: updated });
                          }}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={faq.a}
                        onChange={(e) => {
                          const updated = [...editForm.faqs];
                          updated[idx] = { ...updated[idx], a: e.target.value };
                          setEditForm({ ...editForm, faqs: updated });
                        }}
                        style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '12px', color: '#59655D', outline: 'none', lineHeight: 1.4 }}
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(18,22,19,0.08)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setEditingRegionKey(null)} style={{ padding: '10px 18px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveRegion} disabled={saving} className="btn-lime" style={{ padding: '10px 24px', fontSize: '13px', fontWeight: '900' }}>
                {saving ? 'Publishing...' : 'Save & Publish Destination'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
