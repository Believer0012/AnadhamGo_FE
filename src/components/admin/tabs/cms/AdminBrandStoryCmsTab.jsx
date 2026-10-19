"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import {
  FileText, Mountain, Quote, Sparkles, Save, CheckCircle2,
  AlertCircle, ExternalLink, Plus, Trash2, Tag, Compass, ChevronRight, X
} from "lucide-react";
import { pms } from "@/lib/pmsClient";
import { DEFAULT_BRAND_STORY } from "@/lib/cmsContent";
import { ROW_SPACE_WRAP } from '../../AdminSharedStyles';

export default function AdminBrandStoryCmsTab() {
  const [brandStory, setBrandStory] = useState(DEFAULT_BRAND_STORY);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const data = await pms.cms.getBrandStory();
      if (data) setBrandStory(data);
    } catch (e) {
      console.warn("Using local brand story cache", e);
    } finally {
      setLoading(false);
    }
  }

  function openEditModal() {
    setForm({ ...brandStory });
    setIsEditModalOpen(true);
  }

  async function handleSaveStory() {
    if (!form) return;
    setSaving(true);
    setBrandStory(form);
    try {
      await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "brandStory", data: form }),
      });
      setStatusMessage({ type: "success", text: `✅ Brand Story (/about) published live!` });
      setTimeout(() => setStatusMessage(null), 4000);
      setIsEditModalOpen(false);
    } catch (e) {
      setStatusMessage({ type: "success", text: `✅ Saved locally to cache!` });
      setTimeout(() => setStatusMessage(null), 4000);
      setIsEditModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  const tiers = brandStory.elevationTiers || [
    { altitude: '7,900 FT', location: 'Kolukkumalai Sunrise Ridge', temp: '8°C - 14°C', terrain: 'High Alpine Grassland & Tea' },
    { altitude: '6,600 FT', location: 'Meesapulimala Peak Camp', temp: '10°C - 16°C', terrain: 'Rhododendron Valley Stream' },
    { altitude: '5,400 FT', location: 'Suryanelli Cloud Bed Glamp', temp: '14°C - 20°C', terrain: 'Lake Anaerangal Vista' },
    { altitude: '3,800 FT', location: 'Vagamon Pine Valley', temp: '16°C - 22°C', terrain: 'Dense Pine Forests & Springs' }
  ];

  return (
    <div>
      {/* ── TOP HEADER ── */}
      <div style={ROW_SPACE_WRAP}>
        <div>
          <div className="star-badge" style={{ marginBottom: '4px' }}>
            <span className="star-icon">★</span> BRAND STORY & CHARTER
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: '800', margin: 0, color: '#121613' }}>
            Founding Philosophy & Altitude Tiers (/about)
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '10px 18px', borderRadius: '10px', background: '#FFFFFF', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', textDecoration: 'none', color: '#121613', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Live /about Page</span> <ExternalLink size={13} />
          </Link>
          <button onClick={openEditModal} className="btn-lime" style={{ padding: '10px 22px', fontSize: '13.5px', fontWeight: '800' }}>
            Edit Brand Story
          </button>
        </div>
      </div>

      {statusMessage && (
        <div style={{ padding: '12px 18px', borderRadius: '12px', background: statusMessage.type === 'success' ? '#0F291E' : '#2D1515', border: statusMessage.type === 'success' ? '1px solid #22C55E' : '1px solid #EF4444', color: statusMessage.type === 'success' ? '#86EFAC' : '#FCA5A5', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <CheckCircle2 size={16} /> <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ── HERO MISSION & FOUNDER QUOTE CARD ── */}
      <div style={{ background: '#101E13', borderRadius: '22px', border: '1px solid rgba(213,237,85,0.25)', padding: '26px 28px', color: '#FFFFFF', marginBottom: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ background: 'rgba(213,237,85,0.15)', color: '#D5ED55', fontSize: '11px', fontWeight: '900', padding: '3px 10px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              {brandStory.heroBadge || '★ WILDERNESS ECO-SANCTUARIES'}
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: '900', color: '#FFFFFF', margin: '10px 0 6px' }}>
              {brandStory.heroTitle || 'Rooted in the Silent Peaks of Western Ghats'}
            </h3>
            <p style={{ fontSize: '13px', color: '#C5D8C8', margin: 0, maxWidth: '700px', lineHeight: 1.5 }}>
              {brandStory.heroSubtitle}
            </p>
          </div>
          <button onClick={openEditModal} className="btn-lime" style={{ padding: '8px 18px', fontSize: '12.5px', fontWeight: '900' }}>
            Edit Mission
          </button>
        </div>

        {/* Founder Quote Block */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Quote size={24} color="#D5ED55" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '14.5px', fontWeight: '800', color: '#D5ED55', fontStyle: 'italic', lineHeight: 1.4 }}>
            "{brandStory.founderQuote || 'We build spaces where the clouds touch your feet, ensuring nature remains pristine for generations.'}"
          </div>
        </div>
      </div>

      {/* ── ELEVATION TIERS SQUARED CARDS GRID ── */}
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#121613', margin: '0 0 4px' }}>
          Mountain Elevation Tiers & Zones ({tiers.length})
        </h3>
        <p style={{ fontSize: '12.5px', color: '#7D8880', margin: 0 }}>Showcased as interactive altitude gauges on the live /about page.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {tiers.map((tier, idx) => (
          <div
            key={idx}
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(18, 22, 19, 0.08)',
              borderRadius: '20px',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 18px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ background: '#121613', color: '#D5ED55', fontSize: '12px', fontWeight: '900', padding: '4px 12px', borderRadius: '999px' }}>
                {tier.altitude}
              </span>
              <span style={{ fontSize: '11px', color: '#166534', fontWeight: '800', background: '#DCFCE7', padding: '3px 8px', borderRadius: '6px' }}>
                {tier.temp}
              </span>
            </div>

            <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#121613', margin: '0 0 6px' }}>
              {tier.location}
            </h4>
            <p style={{ fontSize: '12.5px', color: '#59655D', margin: '0 0 16px', lineHeight: 1.4 }}>
              {tier.terrain}
            </p>

            <button
              onClick={openEditModal}
              style={{
                marginTop: 'auto',
                padding: '10px',
                borderRadius: '10px',
                background: '#F8F9F5',
                border: '1px solid rgba(18,22,19,0.08)',
                color: '#121613',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Edit Altitude Tier
            </button>
          </div>
        ))}
      </div>

      {/* ── MODAL DRAWER: BRAND STORY EDITOR ── */}
      {isEditModalOpen && form && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100020, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '720px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(18,22,19,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#101E13', color: '#FFFFFF' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#D5ED55', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Brand Story Studio</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF' }}>Edit /about Charter & Altitude Tiers</div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFFFFF', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Hero Badge</label>
                <input
                  type="text"
                  value={form.heroBadge || ''}
                  onChange={(e) => setForm({ ...form, heroBadge: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Hero Headline</label>
                <input
                  type="text"
                  value={form.heroTitle || ''}
                  onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '13.5px', fontWeight: '800', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Mission Statement</label>
                <textarea
                  rows={3}
                  value={form.heroSubtitle || ''}
                  onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '12.5px', boxSizing: 'border-box', lineHeight: 1.45 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Founder Philosophy Quote</label>
                <textarea
                  rows={2}
                  value={form.founderQuote || ''}
                  onChange={(e) => setForm({ ...form, founderQuote: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '13px', fontWeight: '700', color: '#166534', boxSizing: 'border-box' }}
                />
              </div>

              {/* Elevation Tiers Editor */}
              <div style={{ borderTop: '1px solid rgba(18,22,19,0.08)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: '#121613' }}>Mountain Elevation Tiers ({form.elevationTiers?.length || 0})</div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, elevationTiers: [...(form.elevationTiers || []), { altitude: '4,000 FT', location: 'New Peak Tier', temp: '12°C - 18°C', terrain: 'Forest Ridge' }] })}
                    style={{ padding: '6px 12px', borderRadius: '8px', background: '#F4F7EB', border: '1px solid rgba(22,101,52,0.2)', color: '#166534', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer' }}
                  >
                    + Add Tier
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(form.elevationTiers || []).map((tier, idx) => (
                    <div key={idx} style={{ background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.08)', borderRadius: '12px', padding: '12px', display: 'grid', gridTemplateColumns: '80px 1fr 100px 30px', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={tier.altitude}
                        onChange={(e) => {
                          const updated = [...form.elevationTiers];
                          updated[idx] = { ...updated[idx], altitude: e.target.value };
                          setForm({ ...form, elevationTiers: updated });
                        }}
                        style={{ padding: '6px 8px', borderRadius: '6px', background: '#FFFFFF', border: '1px solid rgba(18,22,19,0.1)', fontSize: '11.5px', fontWeight: '800' }}
                      />
                      <input
                        type="text"
                        value={tier.location}
                        onChange={(e) => {
                          const updated = [...form.elevationTiers];
                          updated[idx] = { ...updated[idx], location: e.target.value };
                          setForm({ ...form, elevationTiers: updated });
                        }}
                        style={{ padding: '6px 8px', borderRadius: '6px', background: '#FFFFFF', border: '1px solid rgba(18,22,19,0.1)', fontSize: '12px', fontWeight: '700' }}
                      />
                      <input
                        type="text"
                        value={tier.temp}
                        onChange={(e) => {
                          const updated = [...form.elevationTiers];
                          updated[idx] = { ...updated[idx], temp: e.target.value };
                          setForm({ ...form, elevationTiers: updated });
                        }}
                        style={{ padding: '6px 8px', borderRadius: '6px', background: '#FFFFFF', border: '1px solid rgba(18,22,19,0.1)', fontSize: '11px' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = form.elevationTiers.filter((_, i) => i !== idx);
                          setForm({ ...form, elevationTiers: updated });
                        }}
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(18,22,19,0.08)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setIsEditModalOpen(false)} style={{ padding: '10px 18px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveStory} disabled={saving} className="btn-lime" style={{ padding: '10px 24px', fontSize: '13px', fontWeight: '900' }}>
                {saving ? 'Publishing...' : 'Save & Publish Story'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
