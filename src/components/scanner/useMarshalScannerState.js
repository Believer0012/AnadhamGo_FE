"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Tent, Home, CircleCheck, Hourglass, CircleX, PersonStanding, 
    CheckCircle2, AlertCircle, Sparkles, Check, X, ShieldCheck
} from 'lucide-react';
import { AANANDHAM_CAMPS, getCleanWhatsAppPhone } from './ScannerShared';
import { getSecurityHeaders } from '@/lib/securityClient';

export function useMarshalScannerState({ onBackToAdmin = null, embedded = false, forcedScope = null }) {
    const jsQRRef = useRef(null);

    useEffect(() => {
        import('jsqr').then((mod) => { jsQRRef.current = mod.default; });
    }, []);
    // ── NAVIGATION TABS: 'scanner' | 'roster' | 'kitchen' ──
    const [activeTab, setActiveTab] = useState('scanner');

    // ── CAMERA & SCANNER STATE ──
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const animFrameRef = useRef(null);
    const streamRef = useRef(null);
    const facingModeRef = useRef('environment');

    const [isCameraEnabled, setIsCameraEnabled] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [facingMode, setFacingMode] = useState('environment');
    const [torchOn, setTorchOn] = useState(false);
    const [hasTorchSupport, setHasTorchSupport] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [manualIdInput, setManualIdInput] = useState('');
    const [isSearchingManual, setIsSearchingManual] = useState(false);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // ── SIMULATION / TEST PASS MODAL STATE ──
    const [isTestEmailModalOpen, setIsTestEmailModalOpen] = useState(false);
    const [testEmailInput, setTestEmailInput] = useState('aman.tshekar@gmail.com');
    const [testNameInput, setTestNameInput] = useState('Aman Shekar');
    const [testPhoneInput, setTestPhoneInput] = useState('+91 90748 58014');
    const [testGuestsCount, setTestGuestsCount] = useState(4);
    const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
    const [isSeedingDemo, setIsSeedingDemo] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // ── ROSTER, STATS & SANCTUARY PROPERTY SELECTION ──
    const [rosterList, setRosterList] = useState([]);
    const [selectedCampground, setSelectedCampground] = useState('all');
    const [stats, setStats] = useState({
        totalExpectedCampers: 0,
        totalCheckedInCampers: 0,
        totalPendingCampers: 0,
        totalShortCampers: 0,
        vegMealsCount: 0,
        nonVegMealsCount: 0,
        totalBalanceDue: 0,
        totalBalanceCollected: 0
    });
    const [isLoadingRoster, setIsLoadingRoster] = useState(false);
    const [rosterSearchQuery, setRosterSearchQuery] = useState('');
    const [rosterFilterStatus, setRosterFilterStatus] = useState('all');

    // Load active sanctuary preference
    useEffect(() => {
        try {
            const savedCamp = localStorage.getItem('marshal_active_campsite');
            if (savedCamp) setSelectedCampground(savedCamp);
        } catch { /* ignore */ }
    }, []);

    const handleSelectCampground = (campId) => {
        setSelectedCampground(campId);
        try {
            localStorage.setItem('marshal_active_campsite', campId);
        } catch { /* ignore */ }
        const campObj = AANANDHAM_CAMPS.find(c => c.id === campId);
        showToast(`📍 Active Sanctuary: ${campObj ? campObj.name : 'All Sanctuaries'}`);
    };

    // ── CURRENT SCANNED / SELECTED BOOKING ──
    const [scannedBooking, setScannedBooking] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [rosterChecklist, setRosterChecklist] = useState([]);
    const [isBalancePaid, setIsBalancePaid] = useState(false);
    const [assignedTent, setAssignedTent] = useState('Ridge Glamping Tent');
    const [isChangingTent, setIsChangingTent] = useState(false);
    const [wristbandRange, setWristbandRange] = useState('#101 - #104');
    const [marshalNotes, setMarshalNotes] = useState('');
    const [isSubmittingCheckin, setIsSubmittingCheckin] = useState(false);
    const [extraGuestsCount, setExtraGuestsCount] = useState(0);

    // ── GATE SETTLEMENT & MULTI-OPTION PAYMENT STATE ──
    const [settlementMethod, setSettlementMethod] = useState('cash'); // 'cash' | 'gateway'

    // ── NEW SCREEN: FULL-SCREEN GATE PERMIT CONFIRMATION SCREEN ──
    const [clearedGatePermit, setClearedGatePermit] = useState(null);

    // ── HOST SECURITY, PASSCODE AUTHENTICATION & STATION SCOPE ──
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authStation, setAuthStation] = useState({
        campId: 'all',
        campName: 'All Sanctuaries (Enterprise Master HQ)',
        shortName: 'Master HQ Scope',
        isMasterAdmin: true,
        icon: '⛺'
    });
    const [hostPasscode, setHostPasscode] = useState('');
    const [passcodeError, setPasscodeError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [showPasscodeText, setShowPasscodeText] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    // Check for remembered session on mount (Permanent 30-day field session)
    useEffect(() => {
        const restoreSession = async () => {
            try {
                // 1. Instant Zero-Flicker Local Storage Restore
                const stored = localStorage.getItem('hostSession_aanandham');
                if (stored) {
                    const session = JSON.parse(stored);
                    if (session?.expires && Date.now() < session.expires) {
                        setIsAuthenticated(true);
                        if (session.station) {
                            setAuthStation(session.station);
                            if (session.station.campId !== 'all') {
                                setSelectedCampground(session.station.campId);
                            }
                        }
                    } else {
                        localStorage.removeItem('hostSession_aanandham');
                    }
                }

                // 2. Background Server Cookie Verification
                const res = await fetch('/api/admin/auth');
                const data = await res.json();
                if (data.authenticated && data.role) {
                    const station = {
                        campId: data.campId || 'all',
                        campName: data.campName || 'All Sanctuaries (Enterprise Master HQ)',
                        shortName: data.shortName || 'Master HQ Scope',
                        isMasterAdmin: data.isMasterAdmin !== false,
                        icon: data.icon || '⛺'
                    };
                    setIsAuthenticated(true);
                    setAuthStation(station);
                    if (station.campId !== 'all') {
                        setSelectedCampground(station.campId);
                    }
                    try {
                        localStorage.setItem('hostSession_aanandham', JSON.stringify({
                            expires: Date.now() + 24 * 60 * 60 * 1000,
                            station
                        }));
                    } catch { /* ignore */ }
                }
            } catch {
                // Network or localStorage not available
            }
        };

        restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleHostLogin = async (e) => {
        e?.preventDefault();
        const trimmed = hostPasscode.trim();
        if (!trimmed) return;

        setIsLoggingIn(true);
        setPasscodeError('');

        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: await getSecurityHeaders({ 'Content-Type': 'application/json' }),
                credentials: 'include',
                body: JSON.stringify({ passcode: trimmed, rememberMe })
            });

            const data = await res.json();
            if (data.success) {
                playSuccessChime();
                const station = {
                    campId: data.campId || 'all',
                    campName: data.campName || 'All Sanctuaries (Enterprise Master HQ)',
                    shortName: data.shortName || 'Master HQ Scope',
                    isMasterAdmin: data.isMasterAdmin !== false,
                    icon: data.icon || '⛺'
                };
                setAuthStation(station);

                // Auto-scope to assigned camp if not master HQ
                if (station.campId !== 'all') {
                    setSelectedCampground(station.campId);
                    try { localStorage.setItem('marshal_active_campsite', station.campId); } catch { /* ignore */ }
                }

                // Persist session ONLY when "Remember station session" is checked (24h).
                // Without it, the session dies with the browser tab (session cookie + no local persistence).
                if (rememberMe) {
                    try {
                        localStorage.setItem('hostSession_aanandham', JSON.stringify({
                            expires: Date.now() + 24 * 60 * 60 * 1000,
                            station
                        }));
                    } catch { /* ignore */ }
                } else {
                    try { localStorage.removeItem('hostSession_aanandham'); } catch { /* ignore */ }
                }

                setIsAuthenticated(true);
                setHostPasscode('');
                setPasscodeError('');
                showToast(`✓ ${station.shortName || station.campName} Station Authenticated`);
            } else {
                setPasscodeError(data.message || 'Invalid passcode. Access denied.');
            }
        } catch {
            setPasscodeError('Network error verifying credentials. Please try again.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleHostLogout = async () => {
        try {
            await fetch('/api/admin/auth', {
                method: 'DELETE',
                credentials: 'include'
            });
        } catch {
            // Ignored
        }
        try { localStorage.removeItem('hostSession_aanandham'); } catch { /* ignore */ }
        stopCamera();
        setIsAuthenticated(false);
        setAuthStation({
            campId: 'all',
            campName: 'All Sanctuaries (Enterprise Master HQ)',
            shortName: 'Master HQ Scope',
            isMasterAdmin: true,
            icon: '⛺'
        });
        setScannedBooking(null);
        setClearedGatePermit(null);
        showToast('🔒 Basecamp Host Console Locked');
    };

    // ── TOAST NOTIFICATION HELPER ──
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 4000);
    };

    // ── AUDIO CHIME FEEDBACK ──
    const playSuccessChime = useCallback(() => {
        if (!soundEnabled) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const now = ctx.currentTime;
            
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(783.99, now);
            gain1.gain.setValueAtTime(0.3, now);
            gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.15);

            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1046.50, now + 0.12);
            gain2.gain.setValueAtTime(0.4, now + 0.12);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.12);
            osc2.stop(now + 0.35);

            if (navigator.vibrate) {
                navigator.vibrate([80, 40, 100]);
            }
        } catch (e) {
            console.log('Audio feedback not supported:', e);
        }
    }, [soundEnabled]);

    // ── FETCH ROSTER & HEADCOUNT DATA ──
    const fetchRosterData = useCallback(async () => {
        setIsLoadingRoster(true);
        try {
            const res = await fetch('/api/marshal/roster');
            const data = await res.json();
            if (data.success) {
                setRosterList(data.roster || []);
                setStats(data.stats || {});
            }
        } catch (e) {
            console.error('Failed to fetch roster:', e);
        } finally {
            setIsLoadingRoster(false);
        }
    }, []);

    useEffect(() => {
        fetchRosterData();
    }, [fetchRosterData]);

    // ── CAMERA CONTROLS ──
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        setIsCameraEnabled(false);
        setTorchOn(false);
    }, []);

    const startCamera = useCallback(async () => {
        if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
            setHasCameraPermission(false);
            setErrorMessage('Camera access is not supported on this browser or connection is not secure (HTTPS required).');
            return;
        }

        try {
            setErrorMessage('');

            // Stop any existing stream before starting a new one
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            }

            const currentFacingMode = facingModeRef.current;

            // Try with preferred constraints, fall back to simpler ones
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: currentFacingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
                    audio: false
                });
            } catch {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: currentFacingMode },
                        audio: false
                    });
                } catch {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                }
            }

            streamRef.current = stream;

            // Bind stream to video element BEFORE setting state (avoids re-render detach)
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.muted = true;
                // Play on metadata ready (required by mobile browsers)
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play().catch(() => {});
                };
                // Also try to play immediately (works on Android Chrome)
                videoRef.current.play().catch(() => {});
            }

            setHasCameraPermission(true);
            setIsCameraEnabled(true);
            setErrorMessage('');

            const track = stream.getVideoTracks()[0];
            const capabilities = track?.getCapabilities?.() ?? {};
            setHasTorchSupport(Boolean(capabilities?.torch));

        } catch (err) {
            console.error('Camera error:', err);
            setHasCameraPermission(false);
            setIsCameraEnabled(false);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setErrorMessage('Camera permission denied. Please allow camera access in your browser settings.');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setErrorMessage('No camera found on this device.');
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                setErrorMessage('Camera is already in use by another app.');
            } else {
                setErrorMessage('Camera could not start. Try manual Booking ID search instead.');
            }
        }
    }, []);

    // Keep facingModeRef in sync with facingMode state
    useEffect(() => {
        facingModeRef.current = facingMode;
    }, [facingMode]);

    // Restart camera when facingMode changes (flip camera)
    useEffect(() => {
        if (isCameraEnabled) {
            startCamera();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facingMode]);

    const toggleCameraPower = () => {
        if (isCameraEnabled) {
            stopCamera();
        } else {
            startCamera();
        }
    };

    const toggleTorch = async () => {
        if (!videoRef.current || !videoRef.current.srcObject) return;
        const track = videoRef.current.srcObject.getVideoTracks()[0];
        if (track && track.applyConstraints) {
            try {
                await track.applyConstraints({
                    advanced: [{ torch: !torchOn }]
                });
                setTorchOn(!torchOn);
            } catch (e) {
                console.warn('Could not toggle torch:', e);
            }
        }
    };

    // ── VERIFY SCANNED PASS ──
    const handleScannedResult = useCallback(async (rawQrData) => {
        if (!rawQrData || isValidating) return;

        setIsValidating(true);
        setErrorMessage('');
        setClearedGatePermit(null);

        playSuccessChime();

        try {
            const res = await fetch('/api/marshal/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrData: rawQrData })
            });

            const data = await res.json();

            if (data.success && data.booking) {
                setScannedBooking(data.booking);
                setRosterChecklist(data.booking.roster || []);
                setIsBalancePaid(Boolean(data.booking.isBalancePaid));
                setMarshalNotes(data.booking.marshalNotes || '');
                const preassigned = data.booking.assignedTent || data.booking.roomType || data.booking.campsite || 'Ridge Glamping Tent';
                setAssignedTent(preassigned);
                setIsChangingTent(false);
                setWristbandRange(data.booking.wristbandRange || `#101 - #${100 + (data.booking.roster?.length || data.booking.totalGuests || 2)}`);
                setExtraGuestsCount(0);
                showToast(`✓ Verified Pass #${data.booking.id} (${data.booking.name})`);
            } else {
                setErrorMessage(data.message || 'Scanned QR code is not registered with Aanandham Camps.');
                setScannedBooking(null);
            }
        } catch (err) {
            setErrorMessage('Network error validating pass. Please check Wi-Fi / 4G.');
            setScannedBooking(null);
        } finally {
            setIsValidating(false);
        }
    }, [stopCamera]);

    // ── MANUAL ID SEARCH ──
    const handleSearchManual = async (e) => {
        e?.preventDefault();
        if (!manualIdInput.trim()) return;

        setIsSearchingManual(true);
        setErrorMessage('');
        setClearedGatePermit(null);

        try {
            const res = await fetch('/api/marshal/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: manualIdInput.trim() })
            });

            const data = await res.json();

            if (data.success && data.booking) {
                playSuccessChime();
                setScannedBooking(data.booking);
                setRosterChecklist(data.booking.roster || []);
                setIsBalancePaid(Boolean(data.booking.isBalancePaid));
                setMarshalNotes(data.booking.marshalNotes || '');
                const preassigned = data.booking.assignedTent || data.booking.roomType || data.booking.campsite || 'Ridge Glamping Tent';
                setAssignedTent(preassigned);
                setIsChangingTent(false);
                setWristbandRange(data.booking.wristbandRange || `#101 - #${100 + (data.booking.roster?.length || data.booking.totalGuests || 2)}`);
                setExtraGuestsCount(0);
                setIsManualModalOpen(false);
            } else {
                setErrorMessage(data.message || `No reservation found for #${manualIdInput}`);
            }
        } catch (err) {
            setErrorMessage('Failed to search reservation ID.');
        } finally {
            setIsSearchingManual(false);
        }
    };

    // ── SCAN FRAME LOOP ──
    useEffect(() => {
        let isSubscribed = true;

        const scanFrame = () => {
            if (!isSubscribed) return;

            if (isCameraEnabled && activeTab === 'scanner' && !scannedBooking && !clearedGatePermit && videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                const canvas = canvasRef.current;
                if (canvas) {
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    canvas.width = videoRef.current.videoWidth;
                    canvas.height = videoRef.current.videoHeight;
                    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQRRef.current && jsQRRef.current(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: 'dontInvert'
                    });

                    if (code && code.data) {
                        handleScannedResult(code.data);
                        return;
                    }
                }
            }

            if (isCameraEnabled && activeTab === 'scanner' && !scannedBooking && !clearedGatePermit) {
                animFrameRef.current = requestAnimationFrame(scanFrame);
            }
        };

        // Only kick off the scan loop when camera is active
        if (isCameraEnabled && activeTab === 'scanner' && !scannedBooking && !clearedGatePermit) {
            animFrameRef.current = requestAnimationFrame(scanFrame);
        }

        return () => {
            isSubscribed = false;
            // Only cancel the animation frame — do NOT stop the camera stream here
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
                animFrameRef.current = null;
            }
        };
    }, [isCameraEnabled, activeTab, scannedBooking, clearedGatePermit, handleScannedResult]);

    // ── MANUAL LOOKUP ──
    const handleManualSearch = async (e) => {
        e?.preventDefault();
        if (!manualIdInput.trim()) return;

        setIsSearchingManual(true);
        setErrorMessage('');

        try {
            const res = await fetch('/api/marshal/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: manualIdInput.trim() })
            });

            const data = await res.json();

            if (data.success && data.booking) {
                playSuccessChime();
                setScannedBooking(data.booking);
                setRosterChecklist(data.booking.roster || []);
                setIsBalancePaid(Boolean(data.booking.isBalancePaid));
                setMarshalNotes(data.booking.marshalNotes || '');
                const preassigned = data.booking.assignedTent || data.booking.roomType || data.booking.campsite || 'Ridge Glamping Tent';
                setAssignedTent(preassigned);
                setIsChangingTent(false);
                setWristbandRange(data.booking.wristbandRange || `#101 - #${100 + (data.booking.roster?.length || data.booking.totalGuests || 2)}`);
                setExtraGuestsCount(0);
                setIsManualModalOpen(false);
            } else {
                setErrorMessage(data.message || `No reservation found for #${manualIdInput}`);
            }
        } catch (err) {
            setErrorMessage('Failed to search reservation ID.');
        } finally {
            setIsSearchingManual(false);
        }
    };

    // ── GALLERY IMAGE UPLOAD ──
    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = async () => {
                if (!jsQRRef.current) {
                    const mod = await import('jsqr');
                    jsQRRef.current = mod.default;
                }
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQRRef.current(imageData.data, imageData.width, imageData.height);

                if (code && code.data) {
                    handleScannedResult(code.data);
                } else {
                    setErrorMessage('No valid QR code detected in image. Please try a clearer screenshot.');
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    // ── TRIGGER DEMO EMAIL PASS ──
    const handleSendTestEmail = async (e) => {
        e.preventDefault();
        if (!testEmailInput.trim()) return;

        setIsSendingTestEmail(true);
        try {
            const res = await fetch('/api/marshal/test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testEmailInput.trim(),
                    name: testNameInput.trim() || 'Explorer Lead',
                    phone: testPhoneInput.trim() || '+91 91886 85831',
                    guests: testGuestsCount
                })
            });

            const data = await res.json();
            if (data.success) {
                showToast(`✓ Confirmation pass sent to ${testEmailInput}!`);
                setIsTestEmailModalOpen(false);
                fetchRosterData();
                if (data.booking) {
                    setScannedBooking(data.booking);
                    const roster = (Array.isArray(data.booking.attendanceRoster) && data.booking.attendanceRoster.length > 0)
                        ? data.booking.attendanceRoster
                        : Array.from({ length: Number(data.booking.guests || testGuestsCount || 2) }, (_, idx) => ({
                            id: idx + 1,
                            name: idx === 0 ? `${data.booking.name} (Lead)` : `Squad Camper #${idx + 1}`,
                            present: true,
                            status: 'present',
                            mealType: idx < Math.ceil(testGuestsCount / 2) ? 'Veg' : 'Non-Veg'
                        }));
                    setRosterChecklist(roster);
                    const preassigned = data.booking.roomType || data.booking.assignedTent || data.booking.package || 'Ridge Glamping Tent';
                    setAssignedTent(preassigned);
                    setIsChangingTent(false);
                    setWristbandRange(`#101 - #${100 + roster.length}`);
                    setIsBalancePaid(false);
                    setExtraGuestsCount(0);
                }
            } else {
                setErrorMessage(data.message || 'Failed to dispatch test pass');
            }
        } catch (err) {
            setErrorMessage('Network error sending test email.');
        } finally {
            setIsSendingTestEmail(false);
        }
    };

    // ── TRIGGER DEMO SEEDING ──
    const handleSeedDemoCampers = async () => {
        setIsSeedingDemo(true);
        try {
            const res = await fetch('/api/marshal/seed', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                showToast(`✓ Generated ${data.count} simulation campers!`);
                await fetchRosterData();
                setActiveTab('roster');
            } else {
                setErrorMessage(data.message || 'Failed to seed sample campers');
            }
        } catch (e) {
            setErrorMessage('Network error generating demo campers.');
        } finally {
            setIsSeedingDemo(false);
        }
    };

    // ── SELECT GUEST FROM ROSTER ──
    const selectGuestFromRoster = (guest) => {
        setScannedBooking(guest);
        const guestTotal = Number(guest.totalGuests || guest.guests || (Array.isArray(guest.roster) ? guest.roster.length : 0)) || 2;
        const vegCount = Number(guest.vegCount ?? Math.ceil(guestTotal / 2));

        const initialRoster = (Array.isArray(guest.roster) && guest.roster.length > 0)
            ? guest.roster.map((c, idx) => ({
                id: c.id || idx + 1,
                name: c.name || (idx === 0 ? `${guest.name} (Lead)` : `Squad Camper #${idx + 1}`),
                status: c.status || (c.present !== false ? 'present' : 'absent'),
                present: c.present !== false,
                mealType: c.mealType || (idx < vegCount ? 'Veg' : 'Non-Veg')
            }))
            : Array.from({ length: guestTotal }, (_, idx) => ({
                id: idx + 1,
                name: idx === 0 ? `${guest.name} (Lead)` : `Squad Camper #${idx + 1}`,
                present: true,
                status: 'present',
                mealType: idx < vegCount ? 'Veg' : 'Non-Veg'
            }));

        setRosterChecklist(initialRoster);
        setIsBalancePaid(Boolean(guest.isBalancePaid));
        setMarshalNotes(guest.notes || '');
        const preassigned = guest.assignedTent || guest.roomType || guest.campsite || 'Ridge Glamping Tent';
        setAssignedTent(preassigned);
        setIsChangingTent(false);
        setWristbandRange(guest.wristbandRange || `#101 - #${100 + initialRoster.length}`);
        setExtraGuestsCount(0);
        setClearedGatePermit(null);
        setErrorMessage('');
        setActiveTab('scanner');
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        showToast(`✓ Opened #${guest.id} · ${guest.name}`);
    };

    // ── ONE-TAP "CHECK IN ALL REMAINING LATE CAMPERS" ──
    const checkInAllRemaining = () => {
        setRosterChecklist(prev => prev.map(c => ({ ...c, present: true, status: 'present' })));
        showToast('✓ Marked all campers as present!');
    };

    // ── ADD EXTRA WALK-IN CAMPER ──
    const handleAddExtraCamper = () => {
        const nextId = rosterChecklist.length + 1;
        setRosterChecklist(prev => [
            ...prev,
            { id: nextId, name: `Extra Camper #${nextId} (Walk-In)`, present: true, status: 'present', isExtra: true, mealType: 'Non-Veg' }
        ]);
        setExtraGuestsCount(prev => prev + 1);
        showToast('✓ Added 1 extra walk-in camper (+₹2,499 added to balance)');
    };

    const handleRemoveExtraCamper = () => {
        if (extraGuestsCount <= 0) return;
        setRosterChecklist(prev => prev.slice(0, -1));
        setExtraGuestsCount(prev => Math.max(0, prev - 1));
    };

    // ── AUTO-GENERATE WRISTBAND SEQUENCE ──
    const handleAutoGenerateWristbands = () => {
        const startNum = 101;
        const count = Math.max(1, presentCount || totalCount || 1);
        const endNum = startNum + count - 1;
        const rangeStr = count > 1 ? `#${startNum} - #${endNum}` : `#${startNum}`;
        setWristbandRange(rangeStr);
        showToast(`✓ Auto-generated wristbands: ${rangeStr}`);
    };

    // ── CLEAR & SIMPLE KITCHEN FOOD COUNT FOR CHEF / CATERING STAFF (WHATSAPP) ──
    const getKitchenDispatchText = () => {
        const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
        const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        const activeCampName = AANANDHAM_CAMPS.find(c => c.id === selectedCampground)?.name || 'All Sanctuaries';
        const totalMeals = Number(activeStats.vegMealsCount || 0) + Number(activeStats.nonVegMealsCount || 0);

        return (
`🏕️ *AANANDHAM — KITCHEN FOOD COUNT*
📍 *Campsite:* ${activeCampName}
📅 *Date:* ${dateStr} • ${timeStr}
━━━━━━━━━━━━━━━━━━━
🍽️ *TOTAL DINNER: ${totalMeals} PEOPLE*

🥗 *VEG:*  *${activeStats.vegMealsCount} Meals*
🍗 *NON-VEG:*  *${activeStats.nonVegMealsCount} Meals*
━━━━━━━━━━━━━━━━━━━
👥 *ARRIVAL STATUS:*
✅ *In Camp Now:* ${activeStats.totalCheckedInCampers} People
⏳ *Expected / En Route:* ${activeStats.totalPendingCampers} People
━━━━━━━━━━━━━━━━━━━
_Sent by Aanandham Organizers_`
        );
    };

    const handleCopyKitchenHeadcount = () => {
        const msg = getKitchenDispatchText();
        if (navigator.clipboard) {
            navigator.clipboard.writeText(msg);
            showToast('✓ Kitchen Food Count copied for WhatsApp!');
        }
    };

    // ── ATTENDANCE CALCULATIONS ──
    const presentCount = rosterChecklist.filter(c => c.present || c.status === 'present').length;
    const totalCount = rosterChecklist.length;
    const shortCount = Math.max(0, totalCount - presentCount);
    const extraBalance = extraGuestsCount * 2499;
    const dynamicBalanceDue = Math.max(0, (scannedBooking?.balanceDue || 0) + extraBalance);

    // ── CONFIRM CHECK-IN & OPEN THE NEW GATE PERMIT CONFIRMATION SCREEN ──
    const handleConfirmCheckin = async () => {
        if (!scannedBooking) return;

        setIsSubmittingCheckin(true);

        const formattedPaymentMode = isBalancePaid 
            ? (settlementMethod === 'cash' 
                ? 'Cash Collected at Gate' 
                : 'Online Payment Gateway')
            : 'Payment Pending at Gate';

        try {
            const res = await fetch('/api/marshal/checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: scannedBooking.id,
                    name: scannedBooking.name,
                    phone: scannedBooking.phone,
                    email: scannedBooking.email,
                    campsite: scannedBooking.campsite,
                    checkedInCount: presentCount,
                    shortCount,
                    roster: rosterChecklist,
                    isBalancePaid,
                    paymentMode: formattedPaymentMode,
                    settlementMethod: isBalancePaid ? settlementMethod : null,
                    balanceCollected: isBalancePaid ? dynamicBalanceDue : 0,
                    assignedTent,
                    wristbandRange,
                    marshalNotes: `[Tent: ${assignedTent || 'Unassigned'} | Wristbands: ${wristbandRange || 'None'} | Payment: ${formattedPaymentMode}] ${marshalNotes || ''}`,
                    marshalName: 'Basecamp Host'
                })
            });

            const data = await res.json();

            if (data.success) {
                if (data.booking) {
                    setScannedBooking(data.booking);
                }
                const permitNumber = `GP-${Math.floor(1000 + Math.random() * 9000)}`;
                const permitDetails = {
                    permitId: permitNumber,
                    bookingId: scannedBooking.id,
                    name: scannedBooking.name,
                    campsite: scannedBooking.campsite,
                    assignedTent,
                    wristbandRange,
                    presentCount,
                    totalCount,
                    shortCount,
                    vegCount: scannedBooking.vegCount,
                    nonVegCount: scannedBooking.nonVegCount,
                    balanceCollected: isBalancePaid ? dynamicBalanceDue : 0,
                    isFullySettled: isBalancePaid,
                    settlementMethod: isBalancePaid ? settlementMethod : null,
                    settlementLabel: formattedPaymentMode,
                    convoyTime: scannedBooking.convoyTime,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };

                setClearedGatePermit(permitDetails);
                playSuccessChime();
                await fetchRosterData();
                showToast(`✓ Check-in saved & registered for #${scannedBooking.id}!`);
            } else {
                setErrorMessage(data.message || 'Failed to complete check-in');
            }
        } catch (err) {
            setErrorMessage('Network error saving check-in.');
        } finally {
            setIsSubmittingCheckin(false);
        }
    };

    useEffect(() => {
        if (scannedBooking) {
            const el = document.getElementById('checkin-workspace');
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [scannedBooking]);

    const resetScanner = () => {
        setScannedBooking(null);
        setClearedGatePermit(null);
        setErrorMessage('');
        setManualIdInput('');
    };

    // ── MULTI-CAMP ISOLATED ROSTER & DYNAMIC STATS ──
    const isGuestMatchingCamp = (guest, campId) => {
        if (!campId || campId === 'all') return true;
        const gCampsite = String(guest.campsite || guest.package || '').toLowerCase();
        const gId = String(guest.campsiteId || '').toLowerCase();
        
        if (campId === 'pkg-kolukkumalai') return gId === 'pkg-kolukkumalai' || gCampsite.includes('kolukkumalai');
        if (campId === 'pkg-meesapulimala') return gId === 'pkg-meesapulimala' || gCampsite.includes('meesapulimala');
        if (campId === 'pkg-suryanelli') return gId === 'pkg-suryanelli' || gCampsite.includes('suryanelli');
        if (campId === 'pkg-mini-mexico') return gId === 'pkg-mini-mexico' || gCampsite.includes('mexico');
        if (campId === 'pkg-wildlink') return gId === 'pkg-wildlink' || gCampsite.includes('wildlink') || gCampsite.includes('pazhathottam');
        if (campId === 'pkg-vagamon-pine') return gId.includes('vagamon') || gCampsite.includes('vagamon');
        if (campId === 'pkg-wayanad') return gId.includes('wayanad') || gCampsite.includes('wayanad');
        return true;
    };

    const campIsolatedRoster = useMemo(() => {
        return rosterList.filter(guest => isGuestMatchingCamp(guest, selectedCampground));
    }, [rosterList, selectedCampground]);

    const activeStats = useMemo(() => {
        let expected = 0;
        let checkedIn = 0;
        let short = 0;
        let pending = 0;
        let veg = 0;
        let nonVeg = 0;
        let balanceDue = 0;
        let balanceSettled = 0;

        for (const b of campIsolatedRoster) {
            if (b.status === 'Cancelled' || b.status === 'Expired') continue;
            const totalGuests = Number(b.totalGuests || b.guests) || 2;
            const isFullyIn = b.status === 'Checked In';
            const isPartialIn = b.status === 'Partial Check-In' && Number(b.checkedInCount) > 0 && Number(b.shortCount) > 0;
            
            expected += totalGuests;
            if (isFullyIn) {
                checkedIn += totalGuests;
            } else if (isPartialIn) {
                checkedIn += Number(b.checkedInCount || 0);
                short += Number(b.shortCount || 0);
            } else {
                pending += totalGuests;
            }

            veg += Number(b.vegCount || 0);
            nonVeg += Number(b.nonVegCount || 0);

            if (b.isBalancePaid || isFullyIn) {
                balanceSettled += Number(b.totalPrice ? (b.totalPrice - (b.advancePaid || 0)) : (b.balanceCollected || 0));
            } else {
                balanceDue += Number(b.balanceDue || 0);
            }
        }

        return {
            totalExpectedCampers: expected,
            totalCheckedInCampers: checkedIn,
            totalPendingCampers: pending,
            totalShortCampers: short,
            vegMealsCount: veg,
            nonVegMealsCount: nonVeg,
            totalBalanceDue: balanceDue,
            totalBalanceCollected: balanceSettled,
            totalBookings: campIsolatedRoster.length
        };
    }, [campIsolatedRoster]);

    // ── FILTERED ROSTER LIST (SEARCH + STATUS CHIPS) ──
    const filteredRoster = useMemo(() => {
        return campIsolatedRoster.filter(item => {
            const matchesQuery = 
                item.name.toLowerCase().includes(rosterSearchQuery.toLowerCase()) ||
                item.id.toLowerCase().includes(rosterSearchQuery.toLowerCase()) ||
                (item.phone && item.phone.includes(rosterSearchQuery)) ||
                (item.campsite && item.campsite.toLowerCase().includes(rosterSearchQuery.toLowerCase()));

            if (!matchesQuery) return false;

            const isFullyIn = item.status === 'Checked In';
            const isPartialIn = item.status === 'Partial Check-In' && Number(item.shortCount) > 0 && Number(item.checkedInCount) > 0;

            if (rosterFilterStatus === 'checked_in') return isFullyIn;
            if (rosterFilterStatus === 'short') return isPartialIn;
            if (rosterFilterStatus === 'pending') return !isFullyIn && !isPartialIn;

            return true;
        });
    }, [campIsolatedRoster, rosterSearchQuery, rosterFilterStatus]);

    // ── TENT / POD DROPDOWN OPTIONS ──
    const tentOptions = [
        { value: 'Pod #1 (Sunset Ridge Deck)', label: 'Pod #1 (Sunset Ridge Deck)', icon: Tent, color: '#D5ED55' },
        { value: 'Pod #2 (Panoramic Glass Dome)', label: 'Pod #2 (Panoramic Glass Dome)', icon: Tent, color: '#D5ED55' },
        { value: 'Pod #3 (Sunrise Cliff Edge)', label: 'Pod #3 (Sunrise Cliff Edge)', icon: Tent, color: '#D5ED55' },
        { value: 'Pod #4 (Valley View Dome)', label: 'Pod #4 (Valley View Dome)', icon: Tent, color: '#D5ED55' },
        { value: 'Pod #5 (Cloud View Pod)', label: 'Pod #5 (Cloud View Pod)', icon: Tent, color: '#D5ED55' },
        { value: 'Alpine Tent A-1 (2-Person)', label: 'Alpine Tent A-1 (2-Person)', icon: Tent, color: '#60A5FA' },
        { value: 'Alpine Tent A-2 (2-Person)', label: 'Alpine Tent A-2 (2-Person)', icon: Tent, color: '#60A5FA' },
        { value: 'Alpine Quad Q-1 (4-Person)', label: 'Alpine Quad Q-1 (4-Person)', icon: Tent, color: '#34D399' },
        { value: 'Alpine Quad Q-2 (4-Person)', label: 'Alpine Quad Q-2 (4-Person)', icon: Tent, color: '#34D399' },
        { value: 'Cottage #1 (Cliffside Wooden)', label: 'Cottage #1 (Cliffside Wooden)', icon: Home, color: '#FBBF24' },
        { value: 'Cottage #2 (Honeymoon Suite)', label: 'Cottage #2 (Honeymoon Suite)', icon: Home, color: '#FBBF24' }
    ];

    // ── CAMPER ATTENDANCE STATUS OPTIONS ──
    const camperStatusOptions = [
        { value: 'present', label: 'Present (Checked In)', icon: CircleCheck, color: '#D5ED55', borderColor: 'rgba(213,237,85,0.4)' },
        { value: 'late', label: 'Arriving Late (Next Jeep)', icon: Hourglass, color: '#FACC15', borderColor: 'rgba(234,179,8,0.4)' },
        { value: 'absent', label: 'Absent / No-Show', icon: CircleX, color: '#EF4444', borderColor: 'rgba(239,68,68,0.4)' },
        { value: 'departed', label: 'Departed Camp', icon: PersonStanding, color: '#8E9B92', borderColor: 'rgba(255,255,255,0.2)' }
    ];

    // ── CENTERED FLOATING TOAST NOTIFICATION RENDERER ──
    const renderToast = () => (
        <AnimatePresence>
            {toastMessage && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    pointerEvents: 'none',
                    zIndex: 999999,
                    padding: '0 16px'
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                        style={{
                            pointerEvents: 'auto',
                            background: 'linear-gradient(135deg, rgba(16, 36, 22, 0.96) 0%, rgba(9, 21, 13, 0.96) 100%)',
                            border: '1.5px solid #D5ED55',
                            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.75), 0 0 28px rgba(213, 237, 85, 0.35)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            color: '#FFFFFF',
                            padding: '11px 24px',
                            borderRadius: '999px',
                            fontWeight: '800',
                            fontSize: '13.5px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            maxWidth: '92vw',
                            textAlign: 'center',
                            letterSpacing: '0.2px'
                        }}
                    >
                        <Sparkles size={17} color="#D5ED55" style={{ flexShrink: 0 }} />
                        <span style={{ color: '#FFFFFF', fontWeight: '800' }}>{toastMessage}</span>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    // ── HOST PASSCODE SECURITY LOCK SCREEN ──

    return {
        jsQRRef,
        activeTab,
        setActiveTab,
        videoRef,
        canvasRef,
        animFrameRef,
        streamRef,
        facingModeRef,
        isCameraEnabled,
        setIsCameraEnabled,
        hasCameraPermission,
        setHasCameraPermission,
        facingMode,
        setFacingMode,
        torchOn,
        setTorchOn,
        hasTorchSupport,
        setHasTorchSupport,
        soundEnabled,
        setSoundEnabled,
        manualIdInput,
        setManualIdInput,
        isSearchingManual,
        setIsSearchingManual,
        isManualModalOpen,
        setIsManualModalOpen,
        errorMessage,
        setErrorMessage,
        isTestEmailModalOpen,
        setIsTestEmailModalOpen,
        testEmailInput,
        setTestEmailInput,
        testNameInput,
        setTestNameInput,
        testPhoneInput,
        setTestPhoneInput,
        testGuestsCount,
        setTestGuestsCount,
        isSendingTestEmail,
        setIsSendingTestEmail,
        isSeedingDemo,
        setIsSeedingDemo,
        toastMessage,
        setToastMessage,
        rosterList,
        setRosterList,
        selectedCampground,
        setSelectedCampground,
        stats,
        setStats,
        isLoadingRoster,
        setIsLoadingRoster,
        rosterSearchQuery,
        setRosterSearchQuery,
        rosterFilterStatus,
        setRosterFilterStatus,
        handleSelectCampground,
        scannedBooking,
        setScannedBooking,
        isValidating,
        setIsValidating,
        rosterChecklist,
        setRosterChecklist,
        isBalancePaid,
        setIsBalancePaid,
        assignedTent,
        setAssignedTent,
        isChangingTent,
        setIsChangingTent,
        wristbandRange,
        setWristbandRange,
        marshalNotes,
        setMarshalNotes,
        isSubmittingCheckin,
        setIsSubmittingCheckin,
        extraGuestsCount,
        setExtraGuestsCount,
        settlementMethod,
        setSettlementMethod,
        clearedGatePermit,
        setClearedGatePermit,
        isAuthenticated,
        setIsAuthenticated,
        authStation,
        setAuthStation,
        hostPasscode,
        setHostPasscode,
        authPasscode: hostPasscode,
        setAuthPasscode: setHostPasscode,
        passcodeError,
        setPasscodeError,
        authError: passcodeError,
        isLoggingIn,
        setIsLoggingIn,
        showPasscodeText,
        setShowPasscodeText,
        rememberMe,
        setRememberMe,
        authRememberMe: rememberMe,
        setAuthRememberMe: setRememberMe,
        handleHostLogin,
        handlePasscodeSubmit: handleHostLogin,
        handleHostLogout,
        showToast,
        playSuccessChime,
        fetchRosterData,
        stopCamera,
        startCamera,
        toggleCameraPower,
        toggleTorch,
        handleScannedResult,
        handleSearchManual,
        handleManualSearch,
        handleImageUpload,
        handleSendTestEmail,
        handleSeedDemoCampers,
        selectGuestFromRoster,
        checkInAllRemaining,
        handleAddExtraCamper,
        handleRemoveExtraCamper,
        handleAutoGenerateWristbands,
        getKitchenDispatchText,
        handleCopyKitchenHeadcount,
        presentCount,
        totalCount,
        shortCount,
        extraBalance,
        dynamicBalanceDue,
        handleConfirmCheckin,
        resetScanner,
        isGuestMatchingCamp,
        campIsolatedRoster,
        activeStats,
        filteredRoster,
        tentOptions,
        camperStatusOptions,
        renderToast
    };
}
