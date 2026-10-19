"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Camera, Flashlight, RefreshCw, Upload, Search, CheckCircle2, AlertCircle, 
    Clock, UserCheck, UserX, Users, Phone, MessageCircle, DollarSign, 
    Utensils, Tent, MapPin, Home, ArrowLeft, ArrowRight, Volume2, VolumeX, 
    X, QrCode, Sparkles, ShieldCheck, Power, SlidersHorizontal, ChevronRight, 
    ChevronDown, TrendingUp, ListFilter, Send, Mail, Flame, Compass, Ticket, 
    CheckSquare, Square, UserPlus, UserMinus, Tag, Layers, History, Check, 
    FileText, Printer, Share2, Award, Lock, Unlock, KeyRound, ShieldAlert, 
    LogIn, Eye, EyeOff, Copy, CreditCard, Edit2, Wallet, Sunrise, Mountain, 
    Trees, Leaf, ChefHat, CircleCheck, CircleX, Hourglass, PersonStanding, 
    Crown, Drumstick, Truck, Smartphone, IndianRupee 
} from 'lucide-react';
import { ROW_GAP_8, ROW_GAP_10, ROW_GAP_6, ROW_SPACE, StationGlyph, AANANDHAM_CAMPS, getCleanWhatsAppPhone } from './ScannerShared';


export function ScannerEmailTestPassModal({ state = {} }) {
    const {
        isTestEmailModalOpen, setIsTestEmailModalOpen = () => {},
        testEmailInput, setTestEmailInput = () => {},
        testPhoneInput, setTestPhoneInput = () => {},
        testNameInput, setTestNameInput = () => {},
        testGuestsCount = 2, setTestGuestsCount = () => {},
        isSendingTestEmail,
        handleSendTestEmail = () => {}
    } = state || {};

    if (!isTestEmailModalOpen) return null;

    return (
        <div>
            {isTestEmailModalOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    zIndex: 100
                }}>
                    <div style={{
                        background: '#101E13',
                        border: '1px solid rgba(229, 169, 59, 0.3)',
                        borderRadius: '24px',
                        padding: '24px',
                        width: '100%',
                        maxWidth: '420px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={ROW_GAP_8}>
                                <Mail size={18} color="#E5A93B" />
                                <span style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>
                                    Dispatch Test Reservation Pass
                                </span>
                            </div>
                            <button
                                onClick={() => setIsTestEmailModalOpen(false)}
                                style={{ background: 'none', border: 'none', color: '#8E9B92', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p style={{ fontSize: '12.5px', color: '#A2B6A6', lineHeight: 1.45, margin: '0 0 16px' }}>
                            Enter your email address to receive an official booking pass with live QR code, 4-digit gate PIN, and PDF voucher via Resend.
                        </p>

                        <form onSubmit={handleSendTestEmail} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: '#8E9B92', display: 'block', marginBottom: '4px' }}>
                                    Recipient Email:
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="yourname@gmail.com"
                                    value={testEmailInput}
                                    onChange={e => setTestEmailInput(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '12px',
                                        background: '#08120A',
                                        border: '1px solid rgba(229, 169, 59, 0.4)',
                                        color: '#FFFFFF',
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: '#8E9B92', display: 'block', marginBottom: '4px' }}>
                                    Camper Phone (for WhatsApp / Call):
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+91 98471 23456"
                                    value={testPhoneInput}
                                    onChange={e => setTestPhoneInput(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '12px',
                                        background: '#08120A',
                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                        color: '#FFFFFF',
                                        fontSize: '13px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#8E9B92', display: 'block', marginBottom: '4px' }}>
                                        Lead Name:
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Aman Shekar"
                                        value={testNameInput}
                                        onChange={e => setTestNameInput(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            borderRadius: '12px',
                                            background: '#08120A',
                                            border: '1px solid rgba(255, 255, 255, 0.12)',
                                            color: '#FFFFFF',
                                            fontSize: '13px',
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#8E9B92', display: 'block', marginBottom: '4px' }}>
                                        Guests:
                                    </label>
                                    <select
                                        value={testGuestsCount}
                                        onChange={e => setTestGuestsCount(Number(e.target.value))}
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            borderRadius: '12px',
                                            background: '#08120A',
                                            border: '1px solid rgba(255, 255, 255, 0.12)',
                                            color: '#FFFFFF',
                                            fontSize: '13px',
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <option value={2}>2 Campers</option>
                                        <option value={4}>4 Campers</option>
                                        <option value={6}>6 Campers</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSendingTestEmail}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '14px',
                                    background: '#E5A93B',
                                    color: '#0B150E',
                                    fontSize: '14px',
                                    fontWeight: '800',
                                    border: 'none',
                                    cursor: 'pointer',
                                    marginTop: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Send size={15} />
                                <span>{isSendingTestEmail ? 'Sending via Resend...' : 'Send Live Pass Email →'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export function ScannerManualLookupModal({ state = {} }) {
    const {
        isManualModalOpen, setIsManualModalOpen = () => {},
        manualIdInput = '', setManualIdInput = () => {},
        isSearchingManual = false,
        handleManualSearch = () => {}
    } = state || {};

    if (!isManualModalOpen) return null;

    return (
        <div>
            {isManualModalOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    zIndex: 100
                }}>
                    <div style={{
                        background: '#101E13',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '24px',
                        padding: '24px',
                        width: '100%',
                        maxWidth: '400px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>
                                Look up Booking Pass
                            </span>
                            <button
                                onClick={() => setIsManualModalOpen(false)}
                                style={{ background: 'none', border: 'none', color: '#8E9B92', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleManualSearch}>
                            <input
                                type="text"
                                placeholder="e.g. BK-1234 or phone number"
                                value={manualIdInput}
                                onChange={e => setManualIdInput(e.target.value)}
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    background: '#08120A',
                                    border: '1px solid rgba(213, 237, 85, 0.4)',
                                    color: '#FFFFFF',
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    outline: 'none',
                                    marginBottom: '16px',
                                    boxSizing: 'border-box'
                                }}
                            />

                            <button
                                type="submit"
                                disabled={isSearchingManual || !manualIdInput.trim()}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '14px',
                                    background: '#D5ED55',
                                    color: '#0B150E',
                                    fontSize: '14px',
                                    fontWeight: '800',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {isSearchingManual ? 'Searching...' : 'Find & Check In Camper →'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
