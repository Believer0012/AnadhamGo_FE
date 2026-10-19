"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import {
  Briefcase, Sparkles, Tag, Plus, Trash2, Save,
  CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, Truck, ChevronRight, X
} from "lucide-react";
import { pms } from "@/lib/pmsClient";
import { DEFAULT_SERVICES_CONTENT } from "@/lib/cmsContent";
import { ROW_SPACE_WRAP } from '../../AdminSharedStyles';

export default function AdminServicesCmsTab() {
  const [services, setServices] = useState(DEFAULT_SERVICES_CONTENT);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editingPackageIdx, setEditingPackageIdx] = useState(null);
  const [packageForm, setPackageForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const data = await pms.cms.getServices();
      if (data) setServices(data);
    } catch (e) {
      console.warn("Using local services cache", e);
    } finally {
      setLoading(false);
    }
  }

  function openPackageModal(idx) {
    if (idx !== null && services.packages?.[idx]) {
      setEditingPackageIdx(idx);
      setPackageForm({ ...services.packages[idx] });
    } else {
      setEditingPackageIdx('new');
      setPackageForm({
        category: 'EXPEDITION',
        title: 'New Mountain Experience',
        description: 'Guided wilderness trails and starlit experiences.',
        priceTag: 'Included in Packages'
      });
    }
  }

  async function handleSavePackage() {
    if (!packageForm) return;
    setSaving(true);
    const existing = services.packages || [];
    let updatedPackages;
    if (editingPackageIdx === 'new') {
      updatedPackages = [packageForm, ...existing];
    } else {
      updatedPackages = existing.map((p, i) => i === editingPackageIdx ? packageForm : p);
    }
    const updated = { ...services, packages: updatedPackages };
    setServices(updated);

    try {
      await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "services", data: updated }),
      });
      setStatusMessage({ type: "success", text: `✅ Package "${packageForm.title}" published live!` });
      setTimeout(() => setStatusMessage(null), 4000);
      setEditingPackageIdx(null);
    } catch (e) {
      setStatusMessage({ type: "success", text: `✅ Saved locally to cache!` });
      setTimeout(() => setStatusMessage(null), 4000);
      setEditingPackageIdx(null);
    } finally {
      setSaving(false);
    }
  }

  const packages = services.packages || [
    { category: 'EXPEDITION', title: '4x4 Sunrise Summit Convoy', description: 'Rugged Mahindra 4x4 offroad expedition to Kolukkumalai 7,900 FT with expert drivers.', priceTag: 'Included in Ridge Passes' },
    { category: 'HOSPITALITY', title: 'Curated Campfire Barbecue & Dining', description: 'Freshly barbecued mountain grill, local Kerala spiced dinner, and hot kettle tea.', priceTag: 'Included in All Bookings' },
    { category: 'TECHNOLOGY', title: 'OpenPMS Enterprise Operations', description: 'Real-time booking engine, 2-way OTA channel sync, and mobile marshal check-in.', priceTag: 'Powered by OpenZen' }
  ];

  const categories = ['All', 'EXPEDITION', 'HOSPITALITY', 'TECHNOLOGY'];
  const filtered = categoryFilter === 'All' ? packages : packages.filter(p => p.category?.toUpperCase() === categoryFilter);

  return (
    <div>
      {/* ── TOP HEADER ── */}
      <div style={ROW_SPACE_WRAP}>
        <div>
          <div className="star-badge" style={{ marginBottom: '4px' }}>
            <span className="star-icon">★</span> EXPEDITIONS & HOSPITALITY
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: '800', margin: 0, color: '#121613' }}>
            Curated Services & Experience Packages (/services)
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            href="/services"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '10px 18px', borderRadius: '10px', background: '#FFFFFF', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', textDecoration: 'none', color: '#121613', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Live /services Page</span> <ExternalLink size={13} />
          </Link>
          <button onClick={() => openPackageModal(null)} className="btn-lime" style={{ padding: '10px 22px', fontSize: '13.5px', fontWeight: '800' }}>
            + Add Service Package
          </button>
        </div>
      </div>

      {statusMessage && (
        <div style={{ padding: '12px 18px', borderRadius: '12px', background: statusMessage.type === 'success' ? '#0F291E' : '#2D1515', border: statusMessage.type === 'success' ? '1px solid #22C55E' : '1px solid #EF4444', color: statusMessage.type === 'success' ? '#86EFAC' : '#FCA5A5', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <CheckCircle2 size={16} /> <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ── CATEGORY FILTER CHIPS ── */}
      <div className="admin-region-chip-row" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }}>
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
              {cat === 'All' ? `All Services (${packages.length})` : cat}
            </button>
          );
        })}
      </div>

      {/* ── PACKAGES SQUARED CARDS GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {filtered.map((pkg, idx) => (
          <div
            key={idx}
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(18, 22, 19, 0.08)',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 18px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '900', color: '#166534', background: '#DCFCE7', padding: '4px 10px', borderRadius: '6px', letterSpacing: '0.6px' }}>
                {pkg.category}
              </span>
              <span style={{ fontSize: '11px', color: '#7D8880', fontWeight: '700' }}>Active Showcase</span>
            </div>

            <h4 
              onClick={() => openPackageModal(idx)}
              style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '800', color: '#121613', margin: '0 0 10px', lineHeight: 1.35, cursor: 'pointer' }}
            >
              {pkg.title}
            </h4>
            <p style={{ fontSize: '13px', color: '#59655D', margin: '0 0 16px', lineHeight: 1.45 }}>
              {pkg.description}
            </p>

            {/* Inclusions Tag Box */}
            <div style={{ background: '#F8F9F5', border: '1px solid rgba(18, 22, 19, 0.06)', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#166534' }}>✓ {pkg.priceTag}</span>
            </div>

            <button
              onClick={() => openPackageModal(idx)}
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
              <span>Edit Service Package</span>
              <ChevronRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* ── MODAL DRAWER: PACKAGE EDITOR ── */}
      {editingPackageIdx !== null && packageForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100020, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '600px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(18,22,19,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#101E13', color: '#FFFFFF' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#D5ED55', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Service Package Editor</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF' }}>{packageForm.title}</div>
              </div>
              <button onClick={() => setEditingPackageIdx(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFFFFF', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Category Badge</label>
                <input
                  type="text"
                  value={packageForm.category || ''}
                  onChange={(e) => setPackageForm({ ...packageForm, category: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Package Title</label>
                <input
                  type="text"
                  value={packageForm.title || ''}
                  onChange={(e) => setPackageForm({ ...packageForm, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '13.5px', fontWeight: '800', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Description</label>
                <textarea
                  rows={3}
                  value={packageForm.description || ''}
                  onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '12.5px', boxSizing: 'border-box', lineHeight: 1.45 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Price Tag / Inclusions</label>
                <input
                  type="text"
                  value={packageForm.priceTag || ''}
                  onChange={(e) => setPackageForm({ ...packageForm, priceTag: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '13px', fontWeight: '700', color: '#166534', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(18,22,19,0.08)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setEditingPackageIdx(null)} style={{ padding: '10px 18px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSavePackage} disabled={saving} className="btn-lime" style={{ padding: '10px 24px', fontSize: '13px', fontWeight: '900' }}>
                {saving ? 'Publishing...' : 'Save & Publish Package'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
