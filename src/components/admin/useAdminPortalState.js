"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { INITIAL_ALL_CAMPS, INITIAL_EVENTS } from '@/lib/campsData';
import { getDiscounts, saveDiscounts, DEFAULT_DISCOUNTS } from '@/lib/discountsCore';
import { DEFAULT_TESTIMONIALS, loadTestimonialsFromStorage, saveTestimonialsToStorage } from '@/lib/testimonialsCore';
import { getSecurityHeaders } from '@/lib/securityClient';
import { compressImageFile, uploadImageMedia } from './AdminSharedStyles';

const INITIAL_MARSHALS = [
    {
        id: 'marshal-kolu-1',
        name: 'Arjun Das (Lead Marshal)',
        station: 'Kolukkumalai Sunrise 4x4 Station',
        campId: 'pkg-kolukkumalai',
        phone: '+91 91886 85831',
        passcode: 'KOLU7900',
        status: 'On Duty',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        notes: 'Lead 4x4 off-road convoy pilot & high-altitude ridge coordinator.'
    },
    {
        id: 'marshal-meesa-1',
        name: 'Vipin Kumar',
        station: 'Meesapulimala High Altitude Basecamp',
        campId: 'pkg-meesapulimala',
        phone: '+91 94471 23456',
        passcode: 'MEESA8600',
        status: 'On Duty',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        notes: 'Trek guide & basecamp safety coordinator.'
    }
];

const INITIAL_DB_LOGS = [
    { id: 'log-seed-1', action: 'BOOT_SYSTEM', details: 'Database connection pool initialized', recordId: 'SYS_01', timestamp: '2026-08-21T08:00:00.000Z', actor: 'System Core' },
    { id: 'log-seed-2', action: 'SECURITY_CHECK', details: 'Rate limit rules verified active', recordId: 'SEC_01', timestamp: '2026-08-21T08:00:00.000Z', actor: 'Security Engine' }
];

const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
];

export function useAdminPortalState(initialTab = 'properties') {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passcode, setPasscode] = useState('');
    const [passcodeError, setPasscodeError] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    // Active Navigation Tab with URL & LocalStorage sync
    const [activeTab, setActiveTabState] = useState(initialTab);

    const setActiveTab = (tab) => {
        setActiveTabState(tab);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('aanandham_admin_active_tab', tab);
                const url = new URL(window.location.href);
                url.searchParams.set('tab', tab);
                window.history.replaceState({}, '', url.toString());
            } catch { /* ignore */ }
        }
    };

    // Dedicated Full-Page Property Details View State
    const [activePropertyDetailId, setActivePropertyDetailId] = useState(null);

    // Dynamic Data States
    const [properties, setProperties] = useState(INITIAL_ALL_CAMPS);
    const [events, setEvents] = useState(INITIAL_EVENTS);
    const [bookings, setBookings] = useState([]);

    // Filter by Region
    const [propertyFilterRegion, setPropertyFilterRegion] = useState('All');

    // Create / Edit Property Modal State
    const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [propertyForm, setPropertyForm] = useState({
        title: '',
        region: 'Munnar',
        category: 'Summit Trek & Glamp',
        tag: 'Bestseller',
        location: 'Suryanelli / Kolukkumalai, Munnar, Kerala',
        altitude: '7,900 FT',
        price: 2499,
        originalPrice: 3200,
        duration: '2 Days / 1 Night',
        difficulty: 'Moderate Offroad',
        image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80'
        ],
        description: '',
        highlights: '4x4 Jeep Safari, Campfire BBQ, Dome Pods, Sunrise Ridge',
        inclusions: 'Dome Pod Stay, 4x4 Jeep Safari, Live BBQ, Dinner & Breakfast, Forest Permits',
        exclusions: 'Personal transport, personal trekking gear'
    });

    // Mobile Responsive & Drawer State
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [scannerOverlayOpen, setScannerOverlayOpen] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isMobileSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileSidebarOpen]);

    // Create / Edit Room Modal State
    const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [roomForm, setRoomForm] = useState({
        name: '',
        capacity: '2 Adults',
        price: 2499,
        totalUnits: 8,
        image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=600&q=80',
        features: 'Private Deck, King Bed, Mountain View'
    });

    // Create Event Modal State
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [eventForm, setEventForm] = useState({
        title: '',
        region: 'Munnar',
        campsite: 'Kolukkumalai Sunrise Ridge',
        dates: 'Sep 12 – 13, 2026',
        price: 2499,
        capacity: 30,
        booked: 0,
        badge: 'New Batch',
        status: 'Active',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        description: 'Guided wilderness expedition with campfire barbecue and sunrise ridge trek.'
    });

    // Manual Booking Creator Modal State
    const [isAddBookingModalOpen, setIsAddBookingModalOpen] = useState(false);
    const [newBookingForm, setNewBookingForm] = useState({
        name: '',
        phone: '',
        email: '',
        package: 'Kolukkumalai Sunrise 4x4 & High-Altitude Ridge Glamp',
        region: 'Munnar',
        dates: '',
        guests: 2,
        groupType: 'Family',
        allocatedUnit: 'Tent #01',
        roomType: 'Ridge Glamping Tent',
        pricePerGuest: 2499,
        status: 'Confirmed',
        notes: ''
    });

    // Sidebar Collapse State
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Booking Search, Camp Divider & Filter
    const [bookingSearch, setBookingSearch] = useState('');
    const [bookingFilterStatus, setBookingFilterStatus] = useState('All');
    const [bookingFilterCamp, setBookingFilterCamp] = useState('All');
    const [bookingSortBy, setBookingSortBy] = useState('newest');

    // Generic Delete Confirmation Dialog State
    const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({
        isOpen: false,
        title: '',
        subtitle: '',
        itemDetails: null,
        confirmText: 'Delete Record',
        onConfirm: null
    });

    const openDeleteConfirm = ({ title, subtitle, itemDetails, confirmText = 'Delete Record', onConfirm }) => {
        setDeleteConfirmDialog({
            isOpen: true,
            title,
            subtitle,
            itemDetails,
            confirmText,
            onConfirm: () => {
                if (typeof onConfirm === 'function') onConfirm();
                closeDeleteConfirm();
            }
        });
    };

    const closeDeleteConfirm = () => {
        setDeleteConfirmDialog(prev => ({ ...prev, isOpen: false }));
    };

    // Mountain Marshals State
    const [marshals, setMarshals] = useState(INITIAL_MARSHALS);
    const [isMarshalModalOpen, setIsMarshalModalOpen] = useState(false);
    const [editingMarshal, setEditingMarshal] = useState(null);
    const [marshalForm, setMarshalForm] = useState({
        name: '',
        station: 'Kolukkumalai Sunrise 4x4 Station',
        campId: 'pkg-kolukkumalai',
        phone: '+91 91886 85831',
        passcode: 'MARSHAL7900',
        status: 'On Duty',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        notes: ''
    });

    // Audit Logs State
    const [dbLogs, setDbLogs] = useState(INITIAL_DB_LOGS);
    const [logViewTab, setLogViewTab] = useState('db');
    const [logSearch, setLogSearch] = useState('');
    const [logFilterSeverity, setLogFilterSeverity] = useState('All');

    const logDbAction = (action, details, recordId = '') => {
        const newLog = {
            id: 'log-' + Date.now(),
            action,
            details,
            recordId,
            timestamp: new Date().toISOString(),
            actor: 'Admin Coordinator'
        };
        setDbLogs(prev => [newLog, ...prev.slice(0, 49)]);
    };

    // Admin Notification Settings
    const [adminPhone, setAdminPhone] = useState('+91 90748 58014');
    const [adminTelegram, setAdminTelegram] = useState('@aanandham_concierge_bot');
    const [settingsSavedToast, setSettingsSavedToast] = useState(false);

    // Payment Gateway & QR Settings State
    const [paymentSettings, setPaymentSettings] = useState({
        paymentMode: 'gateway',
        upiId: 'aanandhamcamps@okhdfcbank',
        merchantName: 'Aanandham Glamping Reserves',
        razorpayKeyId: 'rzp_test_placeholder',
        enableInstantBooking: true
    });

    // Discounts & Offers State
    const [discounts, setDiscounts] = useState(DEFAULT_DISCOUNTS);
    const [discountsSaving, setDiscountsSaving] = useState(false);

    // Testimonials State
    const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
    const [testimonialsSaving, setTestimonialsSaving] = useState(false);

    // Toast message state
    const [toastMessage, setToastMessage] = useState('');
    const toastTimerRef = useRef(null);
    const showToast = (msg) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToastMessage(msg);
        toastTimerRef.current = setTimeout(() => setToastMessage(''), 3200);
    };

    // Security & Auth State
    const [adminProfile, setAdminProfile] = useState({ role: 'SUPER_ADMIN', campName: 'Super Admin HQ' });
    const [adminScopeCamp, setAdminScopeCamp] = useState('all');
    const [adminScopePasscode, setAdminScopePasscode] = useState('');
    const [authLogs, setAuthLogs] = useState([]);
    const [authStats, setAuthStats] = useState({ totalAttempts: 0, failedAttempts: 0, lockoutCount: 0 });
    const [securityOverview, setSecurityOverview] = useState(null);
    const [inquiries, setInquiries] = useState([]);
    const [isExportingCsv, setIsExportingCsv] = useState(false);
    const [copiedBookingId, setCopiedBookingId] = useState(null);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const [isLoadingAudit, setIsLoadingAudit] = useState(false);
    const [isOnlineMode, setIsOnlineMode] = useState(true);

    const fetchBookings = async () => {
        setIsLoadingBookings(true);
        try {
            const [bRes, cRes] = await Promise.all([
                fetch('/api/admin/bookings'),
                fetch('/api/admin/camps')
            ]);
            if (bRes.ok) {
                const bData = await bRes.json();
                if (Array.isArray(bData.bookings)) {
                    setBookings(bData.bookings);
                    setIsOnlineMode(true);
                }
            }
            if (cRes.ok) {
                const cData = await cRes.json();
                if (Array.isArray(cData) && cData.length > 0) {
                    setProperties(cData);
                }
            }
            showToast('✓ Database Synchronized Live');
        } catch (err) {
            console.error('Failed to load admin data:', err);
            showToast('Sync completed with local cache');
        } finally {
            setIsLoadingBookings(false);
        }
    };

    const fetchAuditLogs = async () => {
        setIsLoadingAudit(true);
        try {
            const res = await fetch('/api/admin/audit');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data.logs)) setDbLogs(data.logs);
            }
        } catch (err) {
            console.error('Failed to load audit logs:', err);
        } finally {
            setIsLoadingAudit(false);
        }
    };

    const fetchInquiries = async () => {
        try {
            const res = await fetch('/api/inquiries');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data.inquiries)) setInquiries(data.inquiries);
            }
        } catch (err) {
            console.error('Failed to load inquiries:', err);
        }
    };

    // Load initial data & verify existing session
    useEffect(() => {
        const checkAuthSession = async () => {
            try {
                const res = await fetch('/api/admin/auth');
                if (res.ok) {
                    const data = await res.json();
                    if (data.authenticated) {
                        setIsAuthenticated(true);
                        setAdminProfile(data.user || data.profile || { role: data.role || 'SUPER_ADMIN', campName: data.campName || 'Super Admin HQ' });
                        try {
                            localStorage.setItem('aanandham_admin_authenticated', 'true');
                        } catch { /* ignore */ }
                        fetchBookings();
                        return;
                    }
                }
                // Token invalid or expired
                setIsAuthenticated(false);
                try {
                    localStorage.removeItem('aanandham_admin_authenticated');
                } catch { /* ignore */ }
            } catch (err) {
                console.error('Session verification network error:', err);
            }
        };

        const loadInitialData = async () => {
            // First check if token / session exists in cookie or localStorage
            try {
                if (localStorage.getItem('aanandham_admin_authenticated') === 'true') {
                    setIsAuthenticated(true);
                }
            } catch { /* ignore */ }

            // Restore saved active tab on page refresh
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const urlTab = urlParams.get('tab');
                const savedTab = urlTab || localStorage.getItem('aanandham_admin_active_tab');
                if (savedTab && ['properties', 'destinations', 'blog', 'about', 'services', 'contact', 'testimonials', 'bookings', 'marshals', 'events', 'overview'].includes(savedTab)) {
                    setActiveTabState(savedTab);
                }
            } catch { /* ignore */ }

            await checkAuthSession();

            try {
                const dRes = await fetch('/api/discounts');
                if (dRes.ok) {
                    const dData = await dRes.json();
                    if (Array.isArray(dData.discounts)) setDiscounts(dData.discounts);
                }
            } catch (err) {
                console.error('Failed to load discounts:', err);
            }

            try {
                const tRes = await fetch('/api/testimonials');
                if (tRes.ok) {
                    const tData = await tRes.json();
                    if (Array.isArray(tData.testimonials)) setTestimonials(tData.testimonials);
                }
            } catch (err) {
                console.error('Failed to load testimonials:', err);
            }

            try {
                const storedPayment = localStorage.getItem('aanandham_payment_settings');
                if (storedPayment) setPaymentSettings(JSON.parse(storedPayment));
            } catch { /* ignore */ }
        };

        loadInitialData();
    }, []);

    // Handlers
    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passcode: passcode.trim(), rememberMe })
            });
            const data = await res.json();
            if (data.success) {
                setIsAuthenticated(true);
                setPasscodeError(false);
                setAdminProfile(data.profile || { role: data.role || 'SUPER_ADMIN', campName: data.campName || 'Super Admin HQ' });
                try {
                    if (rememberMe) {
                        localStorage.setItem('aanandham_admin_authenticated', 'true');
                    }
                } catch { /* ignore */ }
                showToast('Welcome to Aanandham Operations Command Center');
                fetchBookings();
            } else {
                setPasscodeError(data.message || 'Invalid Passcode');
                showToast(data.message || 'Invalid Passcode');
            }
        } catch {
            setPasscodeError('Authentication Network Error');
            showToast('Authentication Network Error');
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/admin/auth', { method: 'DELETE' });
        } catch { /* ignore */ }
        try {
            localStorage.removeItem('aanandham_admin_authenticated');
        } catch { /* ignore */ }
        setIsAuthenticated(false);
        setPasscode('');
        showToast('Logged out securely');
    };

    const handleSaveProperty = async (e) => {
        if (e) e.preventDefault();
        if (!propertyForm.title?.trim()) {
            showToast('Please enter a campsite name');
            return;
        }
        let nextProperties;
        if (editingProperty) {
            nextProperties = properties.map(p => p.id === editingProperty.id ? { ...propertyForm, id: p.id } : p);
            setProperties(nextProperties);
            logDbAction('UPDATE_CAMPSITE', `Updated campsite ${propertyForm.title}`, editingProperty.id);
            showToast(`Campsite "${propertyForm.title}" Updated!`);
        } else {
            const newCamp = { ...propertyForm, id: `pkg-${Date.now()}` };
            nextProperties = [newCamp, ...properties];
            setProperties(nextProperties);
            logDbAction('CREATE_CAMPSITE', `Created campsite ${propertyForm.title}`, newCamp.id);
            showToast(`Campsite "${propertyForm.title}" Added!`);
        }
        setIsPropertyModalOpen(false);
        try {
            await fetch('/api/admin/camps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nextProperties)
            });
        } catch (err) {
            console.error('Failed to sync campsite to server:', err);
        }
    };

    const handleDeleteProperty = (id) => {
        const camp = properties.find(p => p.id === id);
        openDeleteConfirm({
            title: 'Delete Campsite',
            subtitle: `Are you sure you want to permanently remove "${camp?.title || id}"?`,
            itemDetails: { Name: camp?.title, Region: camp?.region },
            onConfirm: async () => {
                const nextProperties = properties.filter(p => p.id !== id);
                setProperties(nextProperties);
                logDbAction('DELETE_CAMPSITE', `Deleted campsite ${camp?.title || id}`, id);
                showToast('Campsite Removed');
                try {
                    await fetch('/api/admin/camps', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(nextProperties)
                    });
                } catch (err) {
                    console.error('Failed to delete campsite on server:', err);
                }
            }
        });
    };

    const handleSaveRoom = async (e) => {
        if (e) e.preventDefault();
        if (!activePropertyDetailId) return;
        const nextProperties = properties.map(p => {
            if (p.id !== activePropertyDetailId) return p;
            const currentRooms = Array.isArray(p.rooms) ? p.rooms : [];
            if (editingRoom) {
                return {
                    ...p,
                    rooms: currentRooms.map(r => r.id === editingRoom.id ? { ...roomForm, id: r.id } : r)
                };
            } else {
                const newRoom = { ...roomForm, id: `room-${Date.now()}` };
                return {
                    ...p,
                    rooms: [...currentRooms, newRoom]
                };
            }
        });
        setProperties(nextProperties);
        setIsAddRoomModalOpen(false);
        showToast('Room Accommodation Saved');
        try {
            await fetch('/api/admin/camps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nextProperties)
            });
        } catch (err) {
            console.error('Failed to sync room to server:', err);
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (!activePropertyDetailId) return;
        const nextProperties = properties.map(p => {
            if (p.id !== activePropertyDetailId) return p;
            return {
                ...p,
                rooms: (p.rooms || []).filter(r => r.id !== roomId)
            };
        });
        setProperties(nextProperties);
        showToast('Room Accommodation Removed');
        try {
            await fetch('/api/admin/camps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nextProperties)
            });
        } catch (err) {
            console.error('Failed to sync room delete to server:', err);
        }
    };

    const handleSaveEvent = (e) => {
        if (e) e.preventDefault();
        if (!eventForm.title?.trim()) {
            showToast('Please enter an expedition title');
            return;
        }
        if (editingEvent) {
            setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? { ...eventForm, id: ev.id } : ev));
            showToast('Expedition Batch Updated');
        } else {
            const newEv = { ...eventForm, id: `event-${Date.now()}` };
            setEvents(prev => [newEv, ...prev]);
            showToast('New Expedition Batch Created');
        }
        setIsEventModalOpen(false);
    };

    const handleDeleteEvent = (id) => {
        setEvents(prev => prev.filter(ev => ev.id !== id));
        showToast('Expedition Batch Removed');
    };

    const handleSaveMarshal = (e) => {
        if (e) e.preventDefault();
        if (!marshalForm.name?.trim()) {
            showToast('Please enter marshal name');
            return;
        }
        if (editingMarshal) {
            setMarshals(prev => prev.map(m => m.id === editingMarshal.id ? { ...marshalForm, id: m.id } : m));
            showToast('Marshal Profile Updated');
        } else {
            const newM = { ...marshalForm, id: `marshal-${Date.now()}` };
            setMarshals(prev => [...prev, newM]);
            showToast('Marshal Deployed');
        }
        setIsMarshalModalOpen(false);
    };

    const handleDeleteMarshal = (id) => {
        setMarshals(prev => prev.filter(m => m.id !== id));
        showToast('Marshal Offboarded');
    };

    const handleSaveBooking = async (e) => {
        if (e) e.preventDefault();
        if (!newBookingForm.name?.trim() || !newBookingForm.phone?.trim()) {
            showToast('Please fill camper name and phone');
            return;
        }
        const created = {
            ...newBookingForm,
            id: `AN-${Date.now().toString().slice(-6)}`,
            createdAt: new Date().toISOString(),
            total: (Number(newBookingForm.pricePerGuest) || 2499) * (Number(newBookingForm.guests) || 1)
        };
        setBookings(prev => [created, ...prev]);
        setIsAddBookingModalOpen(false);
        showToast(`Booking Created for ${created.name}`);
        try {
            await fetch('/api/admin/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(created)
            });
        } catch (err) {
            console.error('Failed to persist booking to database:', err);
        }
    };

    const handleDeleteBooking = (id) => {
        const b = bookings.find(item => item.id === id);
        openDeleteConfirm({
            title: 'Delete Booking Record',
            subtitle: `Delete reservation for ${b?.name || id}?`,
            itemDetails: { Guest: b?.name, Pass: b?.id, Total: `₹${b?.total || 0}` },
            onConfirm: async () => {
                setBookings(prev => prev.filter(item => item.id !== id));
                showToast('Booking Record Deleted');
                try {
                    const res = await fetch(`/api/admin/bookings?id=${encodeURIComponent(id)}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    if (res.ok) {
                        showToast('✓ Permanently deleted from database');
                    } else {
                        showToast('Warning: Server delete returned status ' + res.status);
                    }
                } catch (err) {
                    console.error('Failed to delete booking on server:', err);
                    showToast('Failed to delete on server');
                }
            }
        });
    };

    const handleStatusChange = async (id, newStatus) => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
        showToast(`Status updated to ${newStatus}`);
        try {
            await fetch('/api/admin/bookings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });
        } catch (err) {
            console.error('Failed to sync booking status to database:', err);
        }
    };

    const handleSaveDiscounts = async () => {
        setDiscountsSaving(true);
        try {
            const res = await fetch('/api/admin/discounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discounts })
            });
            if (res.ok) {
                showToast('Discounts & Offers Saved & Applied Live!');
            } else {
                showToast('Failed to Save Discounts');
            }
        } catch {
            showToast('Network Error Saving Discounts');
        } finally {
            setDiscountsSaving(false);
        }
    };

    const handleResetDiscounts = async () => {
        if (!window.confirm('Reset all discounts back to defaults?')) return;
        setDiscounts(DEFAULT_DISCOUNTS);
        showToast('Discounts Reset to Defaults');
    };

    const handleAddDiscount = () => {
        setDiscounts(prev => [
            ...prev,
            { id: `campaign-${Date.now()}`, name: 'New Offer', type: 'percent', value: 5, minGuests: 2, scope: 'all', active: true }
        ]);
    };

    const handleUpdateDiscount = (id, patch) => {
        setDiscounts(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d));
    };

    const handleRemoveDiscount = (id) => {
        setDiscounts(prev => prev.filter(d => d.id !== id));
    };

    const handleSaveTestimonials = async () => {
        setTestimonialsSaving(true);
        try {
            const res = await fetch('/api/admin/testimonials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testimonials })
            });
            if (res.ok) {
                showToast('Testimonials Saved & Published Live!');
            } else {
                showToast('Failed to Save Testimonials');
            }
        } catch {
            showToast('Network Error Saving Testimonials');
        } finally {
            setTestimonialsSaving(false);
        }
    };

    const handleResetTestimonials = async () => {
        if (!window.confirm('Reset all testimonials to defaults?')) return;
        setTestimonials(DEFAULT_TESTIMONIALS);
        showToast('Testimonials Reset to Defaults');
    };

    const handleAddTestimonial = () => {
        setTestimonials(prev => [
            ...prev,
            { id: `t-${Date.now()}`, quote: '', author: 'Guest Camper', campBadge: 'camp', batchDate: '', avatar: '', active: true }
        ]);
    };

    const handleUpdateTestimonial = (id, patch) => {
        setTestimonials(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
    };

    const handleRandomTestimonialAvatar = (id) => {
        const pick = AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)];
        handleUpdateTestimonial(id, { avatar: pick });
    };

    const handleTestimonialAvatarUpload = async (id, file) => {
        if (!file) return;
        try {
            const mediaUrl = await uploadImageMedia(file, 'testimonials/avatars');
            handleUpdateTestimonial(id, { avatar: mediaUrl });
            showToast('Avatar Photo Uploaded & Linked Successfully');
        } catch (e) {
            showToast(e.message || 'Avatar Upload Failed');
        }
    };

    const handleSavePaymentSettings = () => {
        try {
            localStorage.setItem('aanandham_payment_settings', JSON.stringify(paymentSettings));
            setSettingsSavedToast(true);
            setTimeout(() => setSettingsSavedToast(false), 3000);
            showToast('Payment Gateway Settings Saved & Applied!');
        } catch {
            showToast('Failed to save payment settings');
        }
    };

    const handleSaveSettings = (e) => {
        if (e) e.preventDefault();
        showToast('Notification Settings Saved');
    };

    const handleExportBookingsCsv = () => {
        setIsExportingCsv(true);
        try {
            const headers = ['ID', 'Name', 'Phone', 'Email', 'Package', 'Dates', 'Guests', 'Total', 'Status', 'AllocatedUnit', 'AdvancePaid', 'BalanceDue'];
            const rows = bookings.map(b => [
                b.id || '',
                `"${(b.name || '').replace(/"/g, '""')}"`,
                b.phone || '',
                b.email || '',
                `"${(b.package || '').replace(/"/g, '""')}"`,
                b.dates || '',
                b.guests || 1,
                b.total || 0,
                b.status || 'Confirmed',
                b.allocatedUnit || b.assignedTent || '',
                b.advancePaid || b.paidAmount || 0,
                b.balanceDue || 0
            ]);
            const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `aanandham_reservations_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('CSV Export Downloaded Successfully');
        } catch {
            showToast('Failed to generate CSV export');
        } finally {
            setIsExportingCsv(false);
        }
    };

    const handleShareBookingWhatsApp = (booking) => {
        const text = encodeURIComponent(
            `*Aanandham Glamping Confirmation*\n\n` +
            `Camper: ${booking.name}\n` +
            `Package: ${booking.package}\n` +
            `Pass ID: ${booking.id}\n` +
            `Dates: ${booking.dates}\n` +
            `Guests: ${booking.guests}\n` +
            `Unit: ${booking.allocatedUnit || booking.assignedTent || 'Tent Assigned on Arrival'}\n\n` +
            `View Digital Pass: ${window.location.origin}/pass/${booking.id}`
        );
        window.open(`https://wa.me/${(booking.phone || '').replace(/\D/g, '')}?text=${text}`, '_blank');
    };

    const handleCopyBookingPassLink = (bookingId) => {
        const url = `${window.location.origin}/pass/${bookingId}`;
        navigator.clipboard.writeText(url);
        setCopiedBookingId(bookingId);
        setTimeout(() => setCopiedBookingId(null), 2500);
        showToast('Pass link copied to clipboard!');
    };

    // Filter Helpers
    const isBookingMatchingCamp = (b, campId) => {
        if (!campId || campId === 'All') return true;
        const bPkg = String(b.package || '').toLowerCase();
        const bRegion = String(b.region || '').toLowerCase();
        const bCampId = String(b.campsiteId || '').toLowerCase();
        if (campId === 'pkg-kolukkumalai' || campId === 'Kolukkumalai') {
            return bCampId === 'pkg-kolukkumalai' || bPkg.includes('kolukkumalai') || bRegion.includes('kolukkumalai');
        }
        if (campId === 'pkg-meesapulimala' || campId === 'Meesapulimala') {
            return bCampId === 'pkg-meesapulimala' || bPkg.includes('meesapulimala') || bRegion.includes('meesapulimala');
        }
        if (campId === 'pkg-suryanelli' || campId === 'Suryanelli') {
            return bCampId === 'pkg-suryanelli' || bPkg.includes('suryanelli');
        }
        if (campId === 'pkg-mini-mexico' || campId === 'Mini Mexico') {
            return bCampId === 'pkg-mini-mexico' || bPkg.includes('mexico');
        }
        if (campId === 'pkg-wildlink' || campId === 'Camp Wildlink' || campId === 'Vattavada') {
            return bCampId === 'pkg-wildlink' || bPkg.includes('wildlink') || bPkg.includes('pazhathottam') || bRegion.includes('vattavada');
        }
        if (campId === 'pkg-vagamon-pine' || campId === 'Vagamon') {
            return bCampId.includes('vagamon') || bPkg.includes('vagamon') || bRegion.includes('vagamon');
        }
        if (campId === 'pkg-wayanad' || campId === 'Wayanad') {
            return bCampId.includes('wayanad') || bPkg.includes('wayanad') || bRegion.includes('wayanad');
        }
        return true;
    };

    const filteredBookings = useMemo(() => {
        let result = bookings.filter(b => {
            const cleanSearch = bookingSearch.replace(/\D/g, '');
            const cleanPhone = (b.phone || '').replace(/\D/g, '');
            const matchSearch =
                !bookingSearch.trim() ||
                (b.name || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
                (cleanSearch && cleanPhone.includes(cleanSearch)) ||
                (b.phone || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
                (b.package || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
                (b.utrNumber || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
                (b.id || '').toLowerCase().includes(bookingSearch.toLowerCase());

            const matchStatus = bookingFilterStatus === 'All' ? true : b.status === bookingFilterStatus;
            const matchCamp = isBookingMatchingCamp(b, bookingFilterCamp);
            return matchSearch && matchStatus && matchCamp;
        });

        return result.sort((a, b) => {
            if (bookingSortBy === 'highest_amount') return (Number(b.total) || 0) - (Number(a.total) || 0);
            if (bookingSortBy === 'guests_desc') return (Number(b.guests) || 0) - (Number(a.guests) || 0);
            if (bookingSortBy === 'oldest') return (new Date(a.createdAt || 0).getTime() || 0) - (new Date(b.createdAt || 0).getTime() || 0);
            return (new Date(b.createdAt || 0).getTime() || 0) - (new Date(a.createdAt || 0).getTime() || 0);
        });
    }, [bookings, bookingSearch, bookingFilterStatus, bookingFilterCamp, bookingSortBy]);

    const filteredProperties = useMemo(() => {
        if (propertyFilterRegion === 'All') return properties;
        return properties.filter(p => p.region?.toLowerCase() === propertyFilterRegion.toLowerCase());
    }, [properties, propertyFilterRegion]);

    const filteredEvents = events;
    const filteredMarshals = marshals;
    const filteredLogs = dbLogs;
    const filteredInquiries = inquiries;

    // Derived statistics
    const paidBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Checked In');
    const totalRevenue = paidBookings.reduce((acc, b) => acc + (Number(b.total) || 0), 0);
    const estimatedDirectCosts = Math.round(totalRevenue * 0.45);
    const estimatedNetProfit = totalRevenue - estimatedDirectCosts;
    const profitMarginPercent = totalRevenue > 0 ? Math.round((estimatedNetProfit / totalRevenue) * 100) : 55;
    const activeCampers = paidBookings.reduce((acc, b) => acc + (Number(b.guests) || 0), 0);
    const activeEventsCount = events.filter(e => e.status === 'Active').length;

    const stats = {
        totalRevenue,
        estimatedNetProfit,
        profitMarginPercent,
        activeCampers,
        activeEventsCount,
        koluBookingsCount: bookings.filter(b => isBookingMatchingCamp(b, 'pkg-kolukkumalai')).length,
        meesaBookingsCount: bookings.filter(b => isBookingMatchingCamp(b, 'pkg-meesapulimala')).length,
        suryaBookingsCount: bookings.filter(b => isBookingMatchingCamp(b, 'pkg-suryanelli')).length,
        mexicoBookingsCount: bookings.filter(b => isBookingMatchingCamp(b, 'pkg-mini-mexico')).length,
        wildlinkBookingsCount: bookings.filter(b => isBookingMatchingCamp(b, 'pkg-wildlink')).length,
        vagaBookingsCount: bookings.filter(b => isBookingMatchingCamp(b, 'pkg-vagamon-pine')).length,
        wayaBookingsCount: bookings.filter(b => isBookingMatchingCamp(b, 'pkg-wayanad')).length
    };

    return {
        isAuthenticated, setIsAuthenticated,
        passcode, setPasscode,
        passcodeError, setPasscodeError,
        rememberMe, setRememberMe,
        activeTab, setActiveTab,
        activePropertyDetailId, setActivePropertyDetailId,
        properties, setProperties,
        events, setEvents,
        bookings, setBookings,
        propertyFilterRegion, setPropertyFilterRegion,
        isPropertyModalOpen, setIsPropertyModalOpen,
        editingProperty, setEditingProperty,
        imageUrlInput, setImageUrlInput,
        propertyForm, setPropertyForm,
        isMobileSidebarOpen, setIsMobileSidebarOpen,
        isMobile, setIsMobile,
        scannerOverlayOpen, setScannerOverlayOpen,
        isAddRoomModalOpen, setIsAddRoomModalOpen,
        editingRoom, setEditingRoom,
        roomForm, setRoomForm,
        isEventModalOpen, setIsEventModalOpen,
        editingEvent, setEditingEvent,
        eventForm, setEventForm,
        isAddBookingModalOpen, setIsAddBookingModalOpen,
        newBookingForm, setNewBookingForm,
        isSidebarCollapsed, setIsSidebarCollapsed,
        bookingSearch, setBookingSearch,
        bookingFilterStatus, setBookingFilterStatus,
        bookingFilterCamp, setBookingFilterCamp,
        bookingSortBy, setBookingSortBy,
        deleteConfirmDialog, setDeleteConfirmDialog,
        marshals, setMarshals,
        isMarshalModalOpen, setIsMarshalModalOpen,
        editingMarshal, setEditingMarshal,
        marshalForm, setMarshalForm,
        dbLogs, setDbLogs,
        logViewTab, setLogViewTab,
        logSearch, setLogSearch,
        logFilterSeverity, setLogFilterSeverity,
        securityOverview, setSecurityOverview,
        inquiries, setInquiries,
        adminPhone, setAdminPhone,
        adminTelegram, setAdminTelegram,
        settingsSavedToast, setSettingsSavedToast,
        paymentSettings, setPaymentSettings,
        discounts, setDiscounts,
        discountsSaving, setDiscountsSaving,
        testimonials, setTestimonials,
        testimonialsSaving, setTestimonialsSaving,
        toastMessage, setToastMessage,
        adminProfile, setAdminProfile,
        adminScopeCamp, setAdminScopeCamp,
        adminScopePasscode, setAdminScopePasscode,
        authLogs, setAuthLogs,
        authStats, setAuthStats,
        isExportingCsv, setIsExportingCsv,
        copiedBookingId, setCopiedBookingId,
        isLoadingBookings, setIsLoadingBookings,
        isLoadingAudit, setIsLoadingAudit,
        isOnlineMode, setIsOnlineMode,
        fetchBookings,
        fetchAuditLogs,
        fetchInquiries,
        // Handlers
        showToast,
        logDbAction,
        openDeleteConfirm,
        closeDeleteConfirm,
        handleLogin,
        handleLogout,
        handleSaveProperty,
        handleDeleteProperty,
        handleSaveRoom,
        handleDeleteRoom,
        handleSaveEvent,
        handleDeleteEvent,
        handleSaveMarshal,
        handleDeleteMarshal,
        handleSaveBooking,
        handleDeleteBooking,
        handleStatusChange,
        handleStatusUpdate: handleStatusChange,
        handleSaveDiscounts,
        handleResetDiscounts,
        handleResetDefaultDiscounts: handleResetDiscounts,
        handleAddDiscount,
        handleUpdateDiscount,
        handleRemoveDiscount,
        handleSaveTestimonials,
        handleResetTestimonials,
        handleResetDefaultTestimonials: handleResetTestimonials,
        handleAddTestimonial,
        handleUpdateTestimonial,
        handleRandomTestimonialAvatar,
        handleTestimonialAvatarUpload,
        handleQuickAddRandomTestimonial: handleAddTestimonial,
        handleQuickAddStaffPreset: handleSaveMarshal,
        handleSavePaymentSettings,
        handleSaveSettings,
        handleSaveGeneralSettings: handleSaveSettings,
        handleExportBookingsCsv,
        handleExportBookingsCSV: handleExportBookingsCsv,
        handleExportLedgerCSV: handleExportBookingsCsv,
        handleShareBookingWhatsApp,
        handleCopyBookingPassLink,
        filteredBookings,
        filteredProperties,
        filteredEvents,
        filteredMarshals,
        filteredLogs,
        filteredInquiries,
        auditLogs: dbLogs,
        financialStats: stats,
        stats
    };
}
