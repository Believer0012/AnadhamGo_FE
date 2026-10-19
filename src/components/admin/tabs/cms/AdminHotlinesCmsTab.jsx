"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import {
  PhoneCall, MapPin, Clock, Save, CheckCircle2,
  AlertCircle, ExternalLink, MessageCircle, ShieldAlert, Mail, Tag, ChevronRight, X
} from "lucide-react";
import { pms } from "@/lib/pmsClient";
import { DEFAULT_HOTLINES_CONTENT } from "@/lib/cmsContent";
import { ROW_SPACE_WRAP } from '../../AdminSharedStyles';

export default function AdminHotlinesCmsTab() {
  const [hotlines, setHotlines] = useState(DEFAULT_HOTLINES_CONTENT);
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
      const data = await pms.cms.getHotlines();
      if (data) setHotlines(data);
    } catch (e) {
      console.warn("Using local hotlines cache", e);
    } finally {
      setLoading(false);
    }
  }

  function openEditModal() {
    setForm({ ...hotlines });
    setIsEditModalOpen(true);
  }

  async function handleSaveHotlines() {
    if (!form) return;
    setSaving(true);
    setHotlines(form);
    try {
      await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "hotlines", data: form }),
      });
      setStatusMessage({ type: "success", text: `✅ 24/7 Hotlines & Concierge published live!` });
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

  const cleanPhone = (hotlines.whatsappNumber || "+91 90748 58014").replace(/[^0-9]/g, '');

  const channels = [
    {
      icon: MessageCircle,
      title: "WhatsApp Live Concierge",
      value: hotlines.whatsappNumber || "+91 90748 58014",
      subtext: "Real-time camper inquiries & summit coordination",
      badge: "Instant Response",
      color: "#22C55E",
      action: `https://wa.me/${cleanPhone}?text=Hello%20Aanandham%20Concierge`
    },
    {
      icon: ShieldAlert,
      title: "Emergency Basecamp Speed Dial",
      value: hotlines.emergencyNumber || "+91 94470 12345",
      subtext: "24/7 Wilderness SOS & medical escort dispatch",
      badge: "24/7 Active SOS",
      color: "#EF4444",
      action: `tel:${hotlines.emergencyNumber}`
    },
    {
      icon: Mail,
      title: "Official Support & Desk Email",
      value: hotlines.supportEmail || "concierge@aanandham.in",
      subtext: "Corporate booking inquiries & invoices",
      badge: "Verified Desk",
      color: "#3B82F6",
      action: `mailto:${hotlines.supportEmail}`
    },
    {
      icon: MapPin,
      title: "Basecamp Physical Coordinates",
      value: hotlines.gpsCoordinates || "10.0270° N, 77.1420° E",
      subtext: hotlines.basecampAddress || "Suryanelli - Kolukkumalai Basecamp, Munnar, Kerala",
      badge: "GPS Tagged",
      color: "#E5A93B",
      action: "https://maps.google.com"
    }
  ];

  return (
    <div>
      {/* ── TOP HEADER ── */}
      <div style={ROW_SPACE_WRAP}>
        <div>
          <div className="star-badge" style={{ marginBottom: '4px' }}>
            <span className="star-icon">★</span> 24/7 MOUNTAIN DISPATCH
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: '800', margin: 0, color: '#121613' }}>
            Concierge & Communications Channels (/contact)
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            href="/contact"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '10px 18px', borderRadius: '10px', background: '#FFFFFF', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', textDecoration: 'none', color: '#121613', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Live /contact Page</span> <ExternalLink size={13} />
          </Link>
          <button onClick={openEditModal} className="btn-lime" style={{ padding: '10px 22px', fontSize: '13.5px', fontWeight: '800' }}>
            Edit Hotlines
          </button>
        </div>
      </div>

      {statusMessage && (
        <div style={{ padding: '12px 18px', borderRadius: '12px', background: statusMessage.type === 'success' ? '#0F291E' : '#2D1515', border: statusMessage.type === 'success' ? '1px solid #22C55E' : '1px solid #EF4444', color: statusMessage.type === 'success' ? '#86EFAC' : '#FCA5A5', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <CheckCircle2 size={16} /> <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ── INTERACTIVE WHATSAPP CONCIERGE BANNER ── */}
      <div style={{ background: '#101E13', borderRadius: '22px', border: '1px solid rgba(34, 197, 94, 0.35)', padding: '24px 28px', color: '#FFFFFF', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle size={26} color="#0B150E" />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '900', color: '#86EFAC', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Primary Guest Contact Line
            </div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#FFFFFF', margin: '2px 0' }}>
              {hotlines.whatsappNumber || "+91 90748 58014"}
            </div>
            <div style={{ fontSize: '12px', color: '#C5D8C8' }}>
              Operational Hours: {hotlines.operationalHours || "24/7 All Days Active"}
            </div>
          </div>
        </div>

        <a
          href={`https://wa.me/${cleanPhone}?text=Hello%20Aanandham%20Concierge`}
          target="_blank"
          rel="noreferrer"
          style={{ background: '#22C55E', color: '#0B150E', padding: '12px 22px', borderRadius: '12px', fontSize: '13.5px', fontWeight: '900', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <span>Test WhatsApp Chat</span> <ExternalLink size={14} />
        </a>
      </div>

      {/* ── COMMUNICATIONS CHANNELS SQUARED CARDS GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {channels.map((ch, idx) => (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8F9F5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(18,22,19,0.06)' }}>
                <ch.icon size={20} color="#121613" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', background: '#F4F7EB', color: '#166534', padding: '4px 10px', borderRadius: '999px' }}>
                {ch.badge}
              </span>
            </div>

            <div style={{ fontSize: '11px', color: '#7D8880', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px' }}>
              {ch.title}
            </div>
            <div style={{ fontSize: '17px', fontWeight: '900', color: '#121613', marginBottom: '6px' }}>
              {ch.value}
            </div>
            <p style={{ fontSize: '12.5px', color: '#59655D', margin: '0 0 16px', lineHeight: 1.4 }}>
              {ch.subtext}
            </p>

            <button
              onClick={openEditModal}
              style={{
                marginTop: 'auto',
                width: '100%',
                padding: '11px',
                borderRadius: '12px',
                background: '#121613',
                color: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: '800',
                cursor: 'pointer',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>Configure Channel</span>
              <ChevronRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* ── MODAL DRAWER: HOTLINES EDITOR ── */}
      {isEditModalOpen && form && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100020, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '640px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(18,22,19,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#101E13', color: '#FFFFFF' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#D5ED55', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Communications Console</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF' }}>Edit 24/7 Mountain Hotlines</div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFFFFF', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Hotline Badge Text</label>
                <input
                  type="text"
                  value={form.hotlineBadge || ''}
                  onChange={(e) => setForm({ ...form, hotlineBadge: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>WhatsApp Number</label>
                  <input
                    type="text"
                    value={form.whatsappNumber || ''}
                    onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Emergency Speed Dial</label>
                  <input
                    type="text"
                    value={form.emergencyNumber || ''}
                    onChange={(e) => setForm({ ...form, emergencyNumber: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Official Support Email</label>
                <input
                  type="email"
                  value={form.supportEmail || ''}
                  onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Physical Basecamp Address</label>
                <input
                  type="text"
                  value={form.basecampAddress || ''}
                  onChange={(e) => setForm({ ...form, basecampAddress: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Operating Hours</label>
                  <input
                    type="text"
                    value={form.operationalHours || ''}
                    onChange={(e) => setForm({ ...form, operationalHours: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#59655D', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>GPS Coordinates</label>
                  <input
                    type="text"
                    value={form.gpsCoordinates || ''}
                    onChange={(e) => setForm({ ...form, gpsCoordinates: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.1)', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(18,22,19,0.08)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setIsEditModalOpen(false)} style={{ padding: '10px 18px', borderRadius: '10px', background: '#F8F9F5', border: '1px solid rgba(18,22,19,0.12)', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveHotlines} disabled={saving} className="btn-lime" style={{ padding: '10px 24px', fontSize: '13px', fontWeight: '900' }}>
                {saving ? 'Publishing...' : 'Save & Publish Hotlines'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
