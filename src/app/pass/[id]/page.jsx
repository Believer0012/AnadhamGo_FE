import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStoredBookings } from '@/lib/serverBookingStore';
import { generateGatePin, getCheckInLandmarkGuide, generatePassToken, verifyPassToken } from '@/lib/accessControl';
import { inr } from '@/lib/utils';
import { waLink } from '@/lib/whatsapp';
import { buildGoogleCalendarUrl } from '@/lib/calendarLink';
import { generateQrDataUri } from '@/lib/qrGenerator';
import { calculateRefundAmount } from '@/lib/cancellation';
import PrintPassButton from '@/components/PrintPassButton';
import { ShieldCheck, MapPin, Calendar, Users, Phone, ArrowLeft, KeyRound, QrCode, Utensils, IndianRupee, CheckCircle2, Download, Lock, RefreshCw, Clock, AlertTriangle, MessageCircle, TriangleAlert } from 'lucide-react';

const ROW_SPACE_BOTTOM = { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' };

export const metadata = {
    title: 'Verified Expedition Pass · Aanandham Wilderness',
    description: 'Official verified wilderness permit and check-in pass for Aanandham mountain sanctuaries.',
    robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
            index: false,
            follow: false
        }
    }
};

export default async function PassDetailPage({ params, searchParams }) {
    const { id } = await params;
    const sParams = await searchParams;
    const token = sParams?.token;

    const rawParam = decodeURIComponent(String(id || '')).trim();
    const cleanId = rawParam
        .replace(/^(booking|pass|reservation|ticket|ref|id|reference)\s*[:#\s-]*/i, '')
        .replace(/^#+/, '')
        .replace(/\s+/g, '')
        .toUpperCase();
    
    const alphanumericId = cleanId.replace(/[^A-Z0-9]/g, '');

    const allBookings = await getStoredBookings();
    let booking = allBookings.find(b => {
        const bRaw = String(b.id || '').toUpperCase().trim();
        const bClean = bRaw.replace(/^#+/, '').replace(/\s+/g, '');
        const bAlpha = bRaw.replace(/[^A-Z0-9]/g, '');
        return bClean === cleanId || 
               bAlpha === alphanumericId ||
               (alphanumericId.length >= 6 && bAlpha.includes(alphanumericId));
    });

    // Strict 404 if not found
    if (!booking) {
        notFound();
    }

    const data = booking;
    const isTokenVerified = token ? verifyPassToken(data.id, token, data.status) : false;

    const maskedName = isTokenVerified 
        ? data.name 
        : data.name ? `${data.name.split(' ')[0]} ${data.name.split(' ')[1] ? data.name.split(' ')[1][0] + '.' : ''}` : 'Verified Explorer';
    const maskedPhone = isTokenVerified 
        ? data.phone 
        : data.phone ? `••••••${String(data.phone).slice(-4)}` : '••••••••••';

    const isConfirmed = data.status === 'Confirmed' || data.status === 'confirmed';
    const isCancelled = data.status === 'Cancelled' || data.status === 'cancelled';
    const isPending = !isConfirmed && !isCancelled;

    const landmarkGuide = getCheckInLandmarkGuide(data.campsiteId || data.package, data);
    const refundInfo = calculateRefundAmount(data.rawDate || data.dates || data.createdAt, Number(data.paidAmount || data.total || 0));
    const passToken = generatePassToken(data.id);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.aanandham.in';
    const passUrl = `${baseUrl}/pass/${data.id}?token=${passToken}`;
    const icsUrl = `/api/pass/${data.id}/ics?token=${passToken}`;
    const qrImageUrl = (!isCancelled) ? await generateQrDataUri(passUrl, 260) : null;
    const cleanGuestPhone = data.phone ? String(data.phone).replace(/[^0-9+]/g, '') : null;

    const marshalWaMsg = `🏕️ *AANANDHAM CAMPER CHECK-IN PING*\n\n` +
        `🔖 *Pass Reference:* ${data.id}\n` +
        `👤 *Lead Camper:* ${data.name}\n` +
        `📍 *Destination:* ${data.package}\n` +
        `👥 *Squad:* ${data.guests} Campers\n` +
        `🍽️ *Food Allocation:* ${data.mealSummary || `${data.vegCount || 0} Veg + ${data.nonVegCount || 0} Non-Veg BBQ`}\n` +
        `💰 *Balance on Arrival:* ₹${Number(data.balanceDue || 0).toLocaleString('en-IN')}\n` +
        `📅 *Dates:* ${data.dates}\n\n` +
        `We are arriving at ${landmarkGuide.hubName}. Please verify our check-in pass! 🏔️✨`;

    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '919074858014';
    const formattedAdminPhone = adminPhone.length === 12 && adminPhone.startsWith('91')
        ? `+91 ${adminPhone.slice(2, 7)} ${adminPhone.slice(7)}`
        : `+${adminPhone}`;

    return (
        <main className="pass-page-main" style={{ minHeight: '100vh', background: '#0D1710', color: '#FFFFFF', padding: '32px 16px', fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
            <style>{`
                @media print {
                    body { background: #FFFFFF !important; color: #000000 !important; }
                    .pass-page-main { background: #FFFFFF !important; padding: 0 !important; }
                    .no-print { display: none !important; }
                    .pass-card-container { background: #FFFFFF !important; color: #000000 !important; border: 2px solid #000000 !important; box-shadow: none !important; }
                    .pass-header { background: #F3F4F6 !important; color: #000000 !important; border-bottom: 2px solid #000000 !important; }
                    .pass-header h1 { color: #000000 !important; }
                    .pass-header p { color: #4B5563 !important; }
                    .pin-box-print { background: #F3F4F6 !important; border: 2px dashed #000000 !important; color: #000000 !important; }
                    .pin-code-print { color: #000000 !important; }
                    .details-box-print { background: #F9FAFB !important; border: 1px solid #E5E7EB !important; color: #000000 !important; }
                    .details-box-print span { color: #000000 !important; }
                }
            `}</style>

            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                
                {/* Back & Print Bar */}
                <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                    <Link 
                        href="/"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#D5ED55', fontSize: '13px', fontWeight: '800', textDecoration: 'none', background: 'rgba(255,255,255,0.06)', padding: '8px 16px', borderRadius: '10px' }}
                    >
                        <ArrowLeft size={16} />
                        <span>Return to Aanandham</span>
                    </Link>

                    {/* Print / Save PDF Trigger */}
                    <PrintPassButton />
                </div>

                {/* Main Pass Card */}
                <div className="pass-card-container" style={{ background: '#121F15', borderRadius: '24px', overflow: 'hidden', border: isConfirmed ? '1px solid rgba(213, 237, 85, 0.25)' : '1px solid rgba(229, 169, 59, 0.35)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                    
                    {/* Header */}
                    <div className="pass-header" style={{ background: '#0A130D', padding: '28px 24px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '14px' }}>
                            <img
                                src="/logo.png"
                                alt="Aanandham.go Logo"
                                width="38"
                                height="38"
                                style={{ objectFit: 'contain' }}
                                loading="lazy" decoding="async"
                            />
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                                Aanandham<span style={{ color: '#D5ED55' }}>.go</span> Wilderness Stays
                            </div>
                        </div>

                        {isConfirmed ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#166534', color: '#D5ED55', fontSize: '11px', fontWeight: '900', padding: '4px 14px', borderRadius: '999px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                                <CheckCircle2 size={14} color="#D5ED55" />
                                <span>Verified Wilderness Permit · Active</span>
                            </div>
                        ) : isCancelled ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#991B1B', color: '#FFFFFF', fontSize: '11px', fontWeight: '900', padding: '4px 14px', borderRadius: '999px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                                <span>Permit Cancelled / Inactive</span>
                            </div>
                        ) : (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#D97706', color: '#FFFFFF', fontSize: '11px', fontWeight: '900', padding: '4px 14px', borderRadius: '999px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                                <Clock size={14} color="#FFFFFF" />
                                <span>Pending Verification · Awaiting Approval</span>
                            </div>
                        )}
                        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '800', margin: '12px 0 4px', color: '#FFFFFF' }}>
                            {data.package}
                        </h1>
                        <p style={{ fontSize: '13px', color: '#A2B6A6', margin: 0 }}>
                            Permit ID: <strong style={{ color: isConfirmed ? '#D5ED55' : '#FBBF24', letterSpacing: '1px' }}>{data.id}</strong>
                        </p>
                    </div>

                    <div style={{ padding: '24px' }}>
                        
                        {/* ── PENDING VERIFICATION ALERT BANNER ── */}
                        {isPending && (
                            <div className="no-print" style={{ background: 'rgba(217, 119, 6, 0.15)', border: '1px solid rgba(217, 119, 6, 0.5)', borderRadius: '16px', padding: '16px 18px', marginBottom: '20px', textAlign: 'left' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FBBF24', fontWeight: '800', fontSize: '13px', marginBottom: '4px' }}>
                                    <AlertTriangle size={16} color="#FBBF24" />
                                    <span>Payment Verification In Progress</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '12.5px', color: '#E2E8F0', lineHeight: 1.5 }}>
                                    Your booking request and payment are currently being reconciled by the basecamp coordinator. Your scannable check-in QR and official pass voucher will activate automatically upon verification.
                                </p>
                                <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <a
                                        href={waLink(`Hi Aanandham Coordinator, checking verification status for Booking Ref: ${data.id} (${data.name})`)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ background: '#25D366', color: '#0B150E', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><MessageCircle size={14} /> Chat with Camp Coordinator</span>
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* ── BALANCE COLLECTION BANNER (FOR HOST / MARSHAL) ── */}
                        <div className="details-box-print" style={{
                            background: Number(data.balanceDue) > 0 ? 'rgba(229, 169, 59, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                            border: Number(data.balanceDue) > 0 ? '1px solid rgba(229, 169, 59, 0.4)' : '1px solid rgba(34, 197, 94, 0.4)',
                            borderRadius: '16px',
                            padding: '14px 18px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <div>
                                <div style={{ fontSize: '11px', color: '#A2B6A6', fontWeight: '800', textTransform: 'uppercase' }}>
                                    Arrival Settlement Status
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: '900', color: Number(data.balanceDue) > 0 ? '#E5A93B' : '#22C55E' }}>
                                    {Number(data.balanceDue) > 0 ? `Collect ₹${Number(data.balanceDue).toLocaleString('en-IN')} on Check-In` : '100% Fully Paid Online'}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '10.5px', color: '#A2B6A6' }}>Total Fare</div>
                                <div style={{ fontSize: '14px', fontWeight: '800', color: '#FFFFFF' }}>₹{Number(data.total || 0).toLocaleString('en-IN')}</div>
                            </div>
                        </div>

                        {/* ── SCANNABLE QR CODE FOR BASECAMP MARSHALS ── */}
                        <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '20px', textAlign: 'center', color: '#121613', marginBottom: '24px' }}>
                            {qrImageUrl ? (
                                <img 
                                    src={qrImageUrl} 
                                    alt={`Pass QR Code for ${data.id}`}
                                    style={{ width: '180px', height: '180px', display: 'block', margin: '0 auto 10px', borderRadius: '8px' }}
                                    loading="lazy" decoding="async"
                                />
                            ) : (
                                <div style={{ width: '180px', height: '180px', margin: '0 auto 10px', background: '#F8FAFC', borderRadius: '12px', border: '2px dashed #CBD5E1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}>
                                    <Lock size={38} color="#D97706" />
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>QR Unlocks On Approval</span>
                                </div>
                            )}
                            <div style={{ fontSize: '13px', fontWeight: '900', color: isConfirmed ? '#166534' : '#D97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {isConfirmed ? 'Official Check-In QR' : 'Verification In Progress'}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#59655D', marginTop: '2px' }}>
                                {isConfirmed
                                    ? 'Present this QR code to the camp marshals upon arrival to verify your stay & squad roster'
                                    : 'Official check-in QR code will activate immediately once transaction is approved.'}
                            </div>
                        </div>

                        {/* ── 1-CLICK ADD TO CALENDAR ── */}
                        <div className="no-print" style={{ textAlign: 'center', margin: '0 0 20px', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#D5ED55', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center' }}>
                                Sync Stay to Your Calendar
                            </div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <a
                                    href={buildGoogleCalendarUrl({
                                        title: data.package,
                                        dates: data.dates,
                                        location: `${landmarkGuide.hubName}, Suryanelli, Munnar`,
                                        description: `Official Aanandham Wilderness Booking (Ref: ${data.id}). Present your digital pass or QR upon arrival at ${landmarkGuide.hubName} by 1:30 PM for 4x4 convoy.`,
                                        bookingId: data.id
                                    })}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        background: '#1C2D20',
                                        color: '#D5ED55',
                                        fontSize: '12.5px',
                                        fontWeight: '800',
                                        textDecoration: 'none',
                                        padding: '10px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(213, 237, 85, 0.3)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Calendar size={15} />
                                    <span>Google Calendar</span>
                                </a>

                                <a
                                    href={icsUrl}
                                    style={{
                                        background: '#1C2D20',
                                        color: '#FFFFFF',
                                        fontSize: '12.5px',
                                        fontWeight: '800',
                                        textDecoration: 'none',
                                        padding: '10px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Download size={15} />
                                    <span>Apple / Outlook (.ics)</span>
                                </a>
                            </div>
                        </div>

                        {/* ── MEAL & BBQ KITCHEN PREP ALLOCATION CARD ── */}
                        <div className="details-box-print" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '16px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '800', color: '#D5ED55', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
                                <Utensils size={14} color="#D5ED55" />
                                <span>Kitchen & Barbecue Allocation</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '10.5px', color: '#A2B6A6' }}>Veg Campers</div>
                                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#22C55E' }}>{data.vegCount ?? data.guests} Meals</div>
                                </div>
                                <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '10.5px', color: '#A2B6A6' }}>Non-Veg BBQ</div>
                                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#EF4444' }}>{data.nonVegCount ?? 0} Meals</div>
                                </div>
                            </div>
                            {data.dietaryChoice && (
                                <div style={{ fontSize: '12px', color: '#A2B6A6', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px' }}>
                                    <strong>Dietary Note:</strong> {data.dietaryChoice}
                                </div>
                            )}
                        </div>

                        {/* ── ITINERARY & SQUAD SUMMARY ── */}
                        <div className="details-box-print" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '16px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#D5ED55', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>
                                Squad & Pitch Allocation
                            </div>

                            <div style={{ display: 'grid', gap: '10px', fontSize: '13.5px' }}>
                                <div style={ROW_SPACE_BOTTOM}>
                                    <span style={{ color: '#A2B6A6' }}>Lead Camper:</span>
                                    <span style={{ fontWeight: '800', color: '#FFFFFF' }}>{maskedName}</span>
                                </div>
                                <div style={ROW_SPACE_BOTTOM}>
                                    <span style={{ color: '#A2B6A6' }}>Contact Phone:</span>
                                    {isTokenVerified ? (
                                        <a href={`tel:${data.phone}`} style={{ fontWeight: '800', color: '#D5ED55', textDecoration: 'none' }}>{data.phone}</a>
                                    ) : (
                                        <span style={{ fontWeight: '800', color: '#A2B6A6', fontFamily: 'monospace' }}>{maskedPhone}</span>
                                    )}
                                </div>
                                <div style={ROW_SPACE_BOTTOM}>
                                    <span style={{ color: '#A2B6A6' }}>Dates:</span>
                                    <span style={{ fontWeight: '800', color: '#FFFFFF' }}>{data.dates}</span>
                                </div>
                                <div style={ROW_SPACE_BOTTOM}>
                                    <span style={{ color: '#A2B6A6' }}>Lodging:</span>
                                    <span style={{ fontWeight: '800', color: '#FFFFFF' }}>{data.roomType || 'Alpine Tent'}</span>
                                </div>
                                <div style={ROW_SPACE_BOTTOM}>
                                    <span style={{ color: '#A2B6A6' }}>Campers:</span>
                                    <span style={{ fontWeight: '800', color: '#FFFFFF' }}>{data.guests} Persons ({data.adults || data.guests} Adults{data.children > 0 ? `, ${data.children} Kids` : ''})</span>
                                </div>
                                {data.addons && data.addons.length > 0 && (
                                    <div style={ROW_SPACE_BOTTOM}>
                                        <span style={{ color: '#A2B6A6' }}>Add-Ons:</span>
                                        <span style={{ fontWeight: '800', color: '#FFFFFF' }}>{Array.isArray(data.addons) ? data.addons.join(', ') : data.addons}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── CANCELLATION & REFUND POLICY TIER ── */}
                        <div className="details-box-print" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '16px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '800', color: '#D5ED55', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                                    <RefreshCw size={13} color="#D5ED55" />
                                    <span>Cancellation & Refund Policy</span>
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: refundInfo.refundPercentage > 0 ? '#22C55E' : '#E5A93B', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '6px' }}>
                                    {refundInfo.refundPercentage}% Refund Eligible
                                </span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#A2B6A6', margin: '0 0 6px', lineHeight: 1.5 }}>
                                {refundInfo.reason}
                            </p>
                            {refundInfo.refundAmount > 0 && (
                                <div style={{ fontSize: '11.5px', color: '#22C55E', fontWeight: '700' }}>
                                    Estimated Refund Value: ₹{refundInfo.refundAmount.toLocaleString('en-IN')}
                                </div>
                            )}
                        </div>

                        {/* ── OFFLINE LANDMARK GUIDE ── */}
                        <div className="details-box-print" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '16px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#D5ED55', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
                                4x4 Convoy & Navigation Guide
                            </div>
                            <p style={{ fontSize: '13px', color: '#FFFFFF', margin: '0 0 6px' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> <strong>Hub:</strong> {landmarkGuide.hubName}</span>
                            </p>
                            <p style={{ fontSize: '12.5px', color: '#A2B6A6', margin: '0 0 10px', lineHeight: 1.5 }}>
                                {landmarkGuide.parkingArea}
                            </p>
                            <div style={{ background: 'rgba(229, 169, 59, 0.12)', border: '1px solid rgba(229, 169, 59, 0.3)', borderRadius: '10px', padding: '10px', fontSize: '12px', color: '#E5A93B' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><TriangleAlert size={13} /> <strong>Offline Advisory:</strong> {landmarkGuide.offlineNote}</span>
                            </div>
                        </div>

                        {/* ── HOST / CAMPER 1-TAP ACTION BUTTONS ── */}
                        <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                            <a
                                href={`tel:${cleanGuestPhone || adminPhone}`}
                                style={{
                                    padding: '12px',
                                    borderRadius: '12px',
                                    fontSize: '13px',
                                    fontWeight: '800',
                                    textAlign: 'center',
                                    background: '#1F2937',
                                    color: '#FFFFFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    textDecoration: 'none',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                <Phone size={15} />
                                <span>Call Camper</span>
                            </a>

                            <a
                                href={waLink(marshalWaMsg)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-lime"
                                style={{
                                    padding: '12px',
                                    borderRadius: '12px',
                                    fontSize: '13px',
                                    fontWeight: '900',
                                    textAlign: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    textDecoration: 'none'
                                }}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>WhatsApp Dispatch <MessageCircle size={14} /></span>
                            </a>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ background: '#0A130D', padding: '16px', textAlign: 'center', fontSize: '11.5px', color: '#59655D', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        Aanandham Wilderness Stays · 24/7 Mountain Dispatch: {formattedAdminPhone}
                    </div>
                </div>
            </div>
        </main>
    );
}
