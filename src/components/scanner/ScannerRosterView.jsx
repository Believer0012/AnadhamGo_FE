"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
    Search, CheckCircle2, Clock, Phone, MessageCircle, 
    DollarSign, Utensils, Tent, MapPin, RefreshCw, Users, Check,
    AlertCircle, ListFilter, UserCheck, ShieldCheck, Sunrise, Mountain, Trees, Leaf, ArrowRight, Drumstick
} from 'lucide-react';
import { ROW_GAP_8, ROW_GAP_10, ROW_GAP_6, ROW_SPACE, StationGlyph, AANANDHAM_CAMPS, getCleanWhatsAppPhone } from './ScannerShared';

export default function ScannerRosterView({ state = {} }) {
    const {
        authStation = {},
        selectedSanctuary,
        handleStationChange,
        scopedStats,
        rosterSearch, setRosterSearch,
        rosterFilter, setRosterFilter,
        rosterSearchQuery = '', setRosterSearchQuery = () => {},
        rosterFilterStatus = 'all', setRosterFilterStatus = () => {},
        isLoadingRoster = false,
        filteredRoster = [],
        filteredRosterList = [],
        rosterLoading = false,
        handleSelectRosterGuest,
        handleCheckInAllRemainingLate,
        scopedRosterList,
        fetchRosterData = () => {},
        rosterList = [],
        handleSelectCampground = () => {},
        selectedCampground,
        isGuestMatchingCamp = () => true,
        activeStats = {},
        selectGuestFromRoster = () => {},
        filterStatus,
        setFilterStatus,
        searchQuery,
        setSearchQuery,
        checkInAllRemaining = () => {},
        checkInAllRemainingLate
    } = state || {};

    const campIsolatedRoster = scopedRosterList || rosterList || [];

    return (
        <main style={{
            flex: 1,
            padding: '16px clamp(16px, 4vw, 24px) 80px',
            maxWidth: '800px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            {/* ── ACTIVE SANCTUARY PROPERTY SELECTOR BAR ── */}
            <div style={{
                background: 'rgba(16, 30, 19, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '18px',
                padding: '12px 14px',
                marginBottom: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                            <div style={ROW_GAP_6}>
                                <MapPin size={14} color="#D5ED55" />
                                <span style={{ fontSize: '11px', fontWeight: '800', color: '#D5ED55', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {authStation.isMasterAdmin ? 'Sanctuary Property Scope (Master):' : `Station Scope: ${authStation.shortName}:`}
                                </span>
                            </div>
                            <span style={{ fontSize: '11px', color: '#8E9B92', fontWeight: '700' }}>
                                {campIsolatedRoster.length} Bookings in Scope
                            </span>
                        </div>

                        {!authStation.isMasterAdmin && authStation.campId !== 'all' ? (
                            <div style={{
                                background: 'rgba(96, 165, 250, 0.1)',
                                border: '1px solid rgba(96, 165, 250, 0.3)',
                                borderRadius: '12px',
                                padding: '10px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px'
                            }}>
                                <div style={ROW_GAP_8}>
                                    <span style={{ fontSize: '16px', display: 'inline-flex' }}><StationGlyph icon={authStation.icon} size={16} /></span>
                                    <div>
                                        <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#FFFFFF', display: 'block' }}>
                                            {authStation.campName}
                                        </span>
                                        <span style={{ fontSize: '10.5px', color: '#93C5FD' }}>
                                            Station Passcode Activated · Filter locked to your campsite
                                        </span>
                                    </div>
                                </div>
                                <span style={{ 
                                    fontSize: '10px', 
                                    color: '#60A5FA', 
                                    fontWeight: '800',
                                    background: 'rgba(96, 165, 250, 0.15)',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    whiteSpace: 'nowrap'
                                }}>
                                    STATION LOCKED
                                </span>
                            </div>
                        ) : (
                            <div className="admin-region-chip-row" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                                {AANANDHAM_CAMPS.map(camp => {
                                    const isSelected = selectedCampground === camp.id;
                                    const count = rosterList.filter(g => isGuestMatchingCamp(g, camp.id)).length;
                                    return (
                                        <button
                                            key={camp.id}
                                            type="button"
                                            onClick={() => handleSelectCampground(camp.id)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '10px',
                                                background: isSelected ? '#D5ED55' : 'rgba(255, 255, 255, 0.05)',
                                                color: isSelected ? '#0B150E' : '#C8D8CB',
                                                border: `1px solid ${isSelected ? '#D5ED55' : 'rgba(255, 255, 255, 0.08)'}`,
                                                fontSize: '11.5px',
                                                fontWeight: '800',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                whiteSpace: 'nowrap',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            <camp.icon size={14} strokeWidth={2.2} />
                                            <span>{camp.name}</span>
                                            <span style={{
                                                fontSize: '9.5px',
                                                padding: '1px 5px',
                                                borderRadius: '999px',
                                                background: isSelected ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)',
                                                color: isSelected ? '#0B150E' : '#8E9B92'
                                            }}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Headcount Stat Ribbon */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
                        <div style={{ background: 'rgba(16, 30, 19, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '10px 6px', textAlign: 'center' }}>
                            <span style={{ fontSize: '9.5px', color: '#8E9B92', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Expected</span>
                            <span style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF' }}>{activeStats.totalExpectedCampers}</span>
                        </div>
                        <div style={{ background: 'rgba(16, 30, 19, 0.8)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '14px', padding: '10px 6px', textAlign: 'center' }}>
                            <span style={{ fontSize: '9.5px', color: '#4ADE80', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>At Camp</span>
                            <span style={{ fontSize: '18px', fontWeight: '900', color: '#4ADE80' }}>{activeStats.totalCheckedInCampers}</span>
                        </div>
                        <div style={{ background: 'rgba(16, 30, 19, 0.8)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '14px', padding: '10px 6px', textAlign: 'center' }}>
                            <span style={{ fontSize: '9.5px', color: '#FACC15', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>En Route</span>
                            <span style={{ fontSize: '18px', fontWeight: '900', color: '#FACC15' }}>{activeStats.totalPendingCampers}</span>
                        </div>
                        <div style={{ background: 'rgba(16, 30, 19, 0.8)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '14px', padding: '10px 6px', textAlign: 'center' }}>
                            <span style={{ fontSize: '9.5px', color: '#FCA5A5', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Short</span>
                            <span style={{ fontSize: '18px', fontWeight: '900', color: '#EF4444' }}>{activeStats.totalShortCampers}</span>
                        </div>
                    </div>

                    {/* Search & Status Filter */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} color="#8E9B92" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Search by camper name, booking ID, phone, campsite..."
                                value={rosterSearchQuery}
                                onChange={e => setRosterSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px 12px 38px',
                                    borderRadius: '14px',
                                    background: '#101E13',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#FFFFFF',
                                    fontSize: '13px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {/* Filter Chips */}
                        <div className="admin-region-chip-row" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                            {[
                                { id: 'all', label: `All (${campIsolatedRoster.length})` },
                                { id: 'pending', label: `Expected (${campIsolatedRoster.filter(r => r.status !== 'Checked In' && r.status !== 'Partial Check-In').length})` },
                                { id: 'checked_in', label: `Checked In (${campIsolatedRoster.filter(r => r.status === 'Checked In').length})` },
                                { id: 'short', label: `Short Arrival (${campIsolatedRoster.filter(r => r.status === 'Partial Check-In' && Number(r.shortCount) > 0 && Number(r.checkedInCount) > 0).length})` }
                            ].map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => setRosterFilterStatus(filter.id)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '999px',
                                        background: rosterFilterStatus === filter.id ? '#D5ED55' : 'rgba(255, 255, 255, 0.06)',
                                        color: rosterFilterStatus === filter.id ? '#0B150E' : '#C8D8CB',
                                        border: 'none',
                                        fontSize: '11.5px',
                                        fontWeight: '800',
                                        whiteSpace: 'nowrap',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Guest Cards */}
                    {isLoadingRoster ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#8E9B92' }}>
                            Loading guest roster...
                        </div>
                    ) : filteredRoster.length === 0 ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', background: '#101E13', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            <p style={{ color: '#8E9B92', margin: 0, fontSize: '13px' }}>No reservations match your sanctuary and filter selection.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {filteredRoster.map((guest, gIdx) => {
                                const isCheckedIn = guest.status === 'Checked In';
                                const isPartial = guest.status === 'Partial Check-In' && Number(guest.shortCount) > 0 && Number(guest.checkedInCount) > 0;
                                const guestInitials = guest.name 
                                    ? guest.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                                    : 'EX';
                                
                                const avatarGradients = [
                                    'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                    'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                                    'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                                    'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                    'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)'
                                ];

                                return (
                                    <div
                                        key={guest.id}
                                        style={{
                                            background: '#101E13',
                                            border: `1px solid ${isCheckedIn ? 'rgba(34, 197, 94, 0.3)' : isPartial ? 'rgba(234, 179, 8, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                                            borderRadius: '18px',
                                            padding: '16px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px'
                                        }}
                                    >
                                        {/* Top Row: Avatar, Guest Info & Status Badge */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                                            <div style={ROW_GAP_10}>
                                                <div style={{
                                                    width: '42px',
                                                    height: '42px',
                                                    borderRadius: '14px',
                                                    background: avatarGradients[gIdx % avatarGradients.length],
                                                    color: '#FFFFFF',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: '900',
                                                    fontSize: '14px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                                    flexShrink: 0
                                                }}>
                                                    {guestInitials}
                                                </div>

                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                        <span style={{ fontSize: '15.5px', fontWeight: '900', color: '#FFFFFF' }}>
                                                            {guest.name}
                                                        </span>
                                                        <span style={{ fontSize: '11px', color: '#8E9B92' }}>
                                                            #{guest.id}
                                                        </span>
                                                    </div>
                                                    <span style={{ fontSize: '12px', color: '#A2B6A6', display: 'block', marginTop: '2px' }}>
                                                        {guest.campsite} • {guest.convoyTime}
                                                    </span>
                                                </div>
                                            </div>

                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '999px',
                                                background: isCheckedIn ? 'rgba(34,197,94,0.2)' : isPartial ? 'rgba(234,179,8,0.2)' : 'rgba(213,237,85,0.12)',
                                                color: isCheckedIn ? '#4ADE80' : isPartial ? '#FACC15' : '#D5ED55',
                                                fontSize: '11.5px',
                                                fontWeight: '800'
                                            }}>
                                                {isCheckedIn ? '✓ Checked In' : isPartial ? `${guest.checkedInCount || (guest.totalGuests - guest.shortCount)}/${guest.totalGuests} Present (${guest.shortCount} Late)` : 'Expected · Not Arrived'}
                                            </span>
                                        </div>

                                        {/* Middle Info Bar: Headcount, Catering & Balance */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '12px', color: '#8E9B92', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '10px' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Users size={13} /> <strong>{guest.totalGuests}</strong> Campers</span>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Leaf size={13} color='#4ADE80' /> <strong style={{ color: '#4ADE80' }}>{guest.vegCount}V</strong> / <Drumstick size={13} color='#FB923C' /> <strong style={{ color: '#FB923C' }}>{guest.nonVegCount}NV</strong></span>
                                            <span style={{ color: guest.isBalancePaid ? '#4ADE80' : '#FCA5A5', fontWeight: '700' }}>
                                                {guest.isBalancePaid ? '✓ Balance Paid' : `₹${guest.balanceDue} Due`}
                                            </span>
                                        </div>

                                        {/* Bottom Action Bar: WhatsApp, Call, Fast Check-in */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {guest.phone && (
                                                    <>
                                                        <a
                                                            href={`https://wa.me/${getCleanWhatsAppPhone(guest.phone)}?text=Hi%20${encodeURIComponent(guest.name)}%2C%20welcome%20to%20Aanandham!%20Your%20campsite%20is%20ready.`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                padding: '6px 10px',
                                                                borderRadius: '8px',
                                                                background: 'rgba(37, 211, 102, 0.12)',
                                                                border: '1px solid rgba(37, 211, 102, 0.25)',
                                                                color: '#25D366',
                                                                fontSize: '11px',
                                                                fontWeight: '800',
                                                                textDecoration: 'none'
                                                            }}
                                                        >
                                                            <MessageCircle size={12} />
                                                            <span>WhatsApp</span>
                                                        </a>
                                                        <a
                                                            href={`tel:${guest.phone.replace(/[^\d+]/g, '')}`}
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                padding: '6px 10px',
                                                                borderRadius: '8px',
                                                                background: 'rgba(255, 255, 255, 0.06)',
                                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                                color: '#FFFFFF',
                                                                fontSize: '11px',
                                                                fontWeight: '800',
                                                                textDecoration: 'none'
                                                            }}
                                                        >
                                                            <Phone size={12} />
                                                            <span>Call</span>
                                                        </a>
                                                    </>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => selectGuestFromRoster(guest)}
                                                style={{
                                                    padding: '7px 14px',
                                                    borderRadius: '10px',
                                                    background: '#D5ED55',
                                                    color: '#0B150E',
                                                    fontSize: '12px',
                                                    fontWeight: '900',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                <span>Verify Pass & Check-In</span>
                                                <ArrowRight size={13} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
        </main>
    );
}
