"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getSecurityHeaders } from '@/lib/securityClient';
import { getAllCamps, INITIAL_ALL_CAMPS } from '../lib/campsData';
import { inr, generateBookingId, getDefaultUpcomingBatch } from '../lib/utils';
import { waLink, isValidPhoneNumber } from '../lib/whatsapp';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { getPaymentSettings } from '../lib/paymentSettings';
import { loadDiscountsFromStorage, applyDiscounts } from '../lib/discountsCore';
import ErrorBoundary from './ErrorBoundary';

// Submodules
import { ROW_GAP_10, parseRoomCapacity, ADDONS_LIST } from './booking/BookingConstants';
import { ADDON_CATALOG, addonCost, gstIncludedAmount, GST_RATE } from '@/lib/pricing';
import BookingSummary from './booking/BookingSummary';
import { BK, ctaStyle, ghostStyle } from './booking/bookingUI';
import { WhatsAppIcon } from './common/BrandIcons';
import { ArrowRight } from 'lucide-react';
import BookingWizardHeader from './booking/BookingWizardHeader';
import Step1CampsiteLodging from './booking/Step1CampsiteLodging';
import Step2AddonsActivities from './booking/Step2AddonsActivities';
import Step3CamperContact from './booking/Step3CamperContact';
import Step4PaymentGateway from './booking/Step4PaymentGateway';
import Step5ConfirmationPass from './booking/Step5ConfirmationPass';

export { parseRoomCapacity };

function BookingEngineModalInner({ 
    isOpen, 
    onClose, 
    initialPackage, 
    initialRoom, 
    initialRoomId, 
    initialDate, 
    initialGuests = 2,
    initialAdults,
    initialChildren = 0,
    initialCustomUnits = null 
}) {
    const modalRef = useRef(null);
    const prevIsOpenRef = useRef(false);
    const prevInitialRoomIdRef = useRef(initialRoomId);
    const prevInitialPkgIdRef = useRef(initialPackage?.id);
    const prevInitialDateRef = useRef(initialDate);
    const prevInitialGuestsRef = useRef(initialGuests || initialAdults);
    useFocusTrap(isOpen, modalRef);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [campsList, setCampsList] = useState(INITIAL_ALL_CAMPS);
    const [discounts, setDiscounts] = useState(null);
    const [selectedPkgId, setSelectedPkgId] = useState(() => {
        return initialPackage?.id || (typeof initialPackage === 'string' ? initialPackage : '') || 'pkg-kolukkumalai';
    });
    const [selectedRoomId, setSelectedRoomId] = useState(() => {
        return initialRoomId || initialRoom?.id || initialPackage?.rooms?.[0]?.id || '';
    });
    const [travelDate, setTravelDate] = useState(() => initialDate || getDefaultUpcomingBatch());
    const [adults, setAdults] = useState(() => initialAdults || (typeof initialGuests === 'number' ? Math.max(1, initialGuests) : 2));
    const [children, setChildren] = useState(initialChildren || 0);
    const [customUnits, setCustomUnits] = useState(initialCustomUnits || null);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [addonQuantities, setAddonQuantities] = useState({}); // quantity-type add-ons: { id: count }

    // Explorer Details
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [specialNotes, setSpecialNotes] = useState('');
    const [dietaryChoice, setDietaryChoice] = useState('Standard Spicing');
    const [vegCount, setVegCount] = useState(1);
    const [nonVegCount, setNonVegCount] = useState(1);
    const [honeypot, setHoneypot] = useState('');
    
    // Step state: 1: Stay & Dates, 2: Add-Ons, 3: Explorer Details, 4: Payment, 5: Confirmed Voucher
    const [step, setStep] = useState(1);
    const [validationError, setValidationError] = useState('');
    const [lastSubmitTime, setLastSubmitTime] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Payment Options (Step 4) & Admin Dynamic Controls
    const [paymentSettings, setPaymentSettings] = useState(() => getPaymentSettings());
    const [paymentMode, setPaymentMode] = useState('advance'); // 'advance' (30%) | 'full' (100%)
    const [confirmedPass, setConfirmedPass] = useState(null);
    const payeeName = paymentSettings.payeeName || 'Aanandham Wilderness Stays';

    // Synchronize payment settings on custom event & modal open
    useEffect(() => {
        const syncSettings = () => setPaymentSettings(getPaymentSettings());
        syncSettings();
        window.addEventListener('aanandham_payment_settings_updated', syncSettings);
        return () => window.removeEventListener('aanandham_payment_settings_updated', syncSettings);
    }, [isOpen]);

    // Freeze background body scrolling while modal is open
    useEffect(() => {
        if (isOpen && typeof document !== 'undefined') {
            document.body.classList.add('booking-modal-open');
            document.documentElement.classList.add('booking-modal-open');
        } else if (typeof document !== 'undefined') {
            document.body.classList.remove('booking-modal-open');
            document.documentElement.classList.remove('booking-modal-open');
        }
        return () => {
            if (typeof document !== 'undefined') {
                document.body.classList.remove('booking-modal-open');
                document.documentElement.classList.remove('booking-modal-open');
            }
        };
    }, [isOpen]);

    // ── Live PMS Funnel Tracking Dispatches ──
    useEffect(() => {
        if (isOpen && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('pms_track', { 
                detail: { eventType: 'booking_start', campId: selectedPkgId } 
            }));
        }
    }, [isOpen, selectedPkgId]);

    useEffect(() => {
        if (isOpen && step >= 3 && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('pms_track', { 
                detail: { eventType: 'checkout_init', campId: selectedPkgId } 
            }));
        }
    }, [isOpen, step, selectedPkgId]);

    // Load active camps list from localStorage / default data and live OpenPMS feed
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const loaded = getAllCamps();
            if (loaded && loaded.length > 0) {
                setCampsList(loaded);
            }
            fetch('/api/admin/camps')
                .then(r => r.json())
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) {
                        setCampsList(data);
                    }
                })
                .catch(() => {});
        }
    }, [isOpen]);

    // Synchronize props when modal transitions to open or when initial stay parameters change
    useEffect(() => {
        const justOpened = isOpen && !prevIsOpenRef.current;
        const propsChanged = isOpen && (
            prevInitialRoomIdRef.current !== initialRoomId ||
            prevInitialPkgIdRef.current !== initialPackage?.id ||
            prevInitialDateRef.current !== initialDate ||
            prevInitialGuestsRef.current !== (initialGuests || initialAdults)
        );

        if (justOpened || propsChanged) {
            prevInitialRoomIdRef.current = initialRoomId;
            prevInitialPkgIdRef.current = initialPackage?.id;
            prevInitialDateRef.current = initialDate;
            prevInitialGuestsRef.current = initialGuests || initialAdults;

            setStep(1);
            setValidationError('');
            setConfirmedPass(null);
            setSelectedAddons([]);
            setAddonQuantities({});

            if (initialDate) {
                setTravelDate(initialDate);
            } else {
                setTravelDate(getDefaultUpcomingBatch());
            }

            if (initialAdults !== undefined) {
                setAdults(Math.max(1, initialAdults));
            } else if (initialGuests) {
                setAdults(Math.max(1, initialGuests));
            }
            if (initialChildren !== undefined) {
                setChildren(initialChildren);
            }

            if (initialCustomUnits !== undefined) {
                setCustomUnits(initialCustomUnits);
            } else {
                setCustomUnits(null);
            }

            const targetId = String(initialPackage?.id || (typeof initialPackage === 'string' ? initialPackage : '') || '');
            const targetTitle = String(initialPackage?.title || (typeof initialPackage === 'string' ? initialPackage : '') || '').toLowerCase();
            
            const matched = campsList.find(p => 
                p.id === targetId || 
                p.id === `pkg-${targetId}` ||
                p.id.replace('pkg-', '') === targetId.replace('pkg-', '') ||
                p.title.toLowerCase() === targetTitle ||
                (targetTitle && p.title.toLowerCase().includes(targetTitle.slice(0, 12))) ||
                (targetTitle && targetTitle.includes(p.title.toLowerCase().slice(0, 12)))
            );

            const activeId = matched ? matched.id : (initialPackage?.id || campsList[0]?.id || 'pkg-kolukkumalai');
            setSelectedPkgId(activeId);

            const activePkg = matched || initialPackage || campsList.find(p => p.id === activeId) || campsList[0];
            const targetRoomName = String(typeof initialRoom === 'string' ? initialRoom : initialRoom?.name || '').toLowerCase();
            const targetRoomId = String(typeof initialRoomId === 'string' ? initialRoomId : initialRoom?.id || '').toLowerCase();

            const roomsAvailable = (initialPackage?.rooms && initialPackage.rooms.length > 0) ? initialPackage.rooms : (activePkg?.rooms || []);
            if (roomsAvailable.length > 0) {
                const roomMatch = roomsAvailable.find(r => 
                    (targetRoomId && r.id?.toLowerCase() === targetRoomId) ||
                    (targetRoomName && r.name?.toLowerCase() === targetRoomName) ||
                    (targetRoomName && r.name?.toLowerCase().includes(targetRoomName)) ||
                    (targetRoomName && targetRoomName.includes(r.name?.toLowerCase()))
                );
                setSelectedRoomId(roomMatch ? roomMatch.id : (initialRoomId || initialRoom?.id || roomsAvailable[0].id));
            } else {
                setSelectedRoomId(initialRoomId || initialRoom?.id || 'standard-tent');
            }
        }

        prevIsOpenRef.current = isOpen;
    }, [isOpen, initialPackage, initialRoom, initialRoomId, initialDate, initialAdults, initialGuests, initialCustomUnits, campsList]);

    // Re-synchronize selected room if package changes
    const selectedPkg = useMemo(() => {
        if (initialPackage && typeof initialPackage === 'object' && (initialPackage.id === selectedPkgId || !selectedPkgId || selectedPkgId.includes(initialPackage.id) || (initialPackage.id && initialPackage.id.includes(selectedPkgId)))) {
            return initialPackage;
        }
        return campsList.find(p => p.id === selectedPkgId) || initialPackage || campsList[0] || INITIAL_ALL_CAMPS[0];
    }, [campsList, selectedPkgId, initialPackage]);

    const selectedRoom = useMemo(() => {
        const availableRooms = (selectedPkg?.rooms && selectedPkg.rooms.length > 0) 
            ? selectedPkg.rooms 
            : ((initialPackage?.rooms && initialPackage.rooms.length > 0) ? initialPackage.rooms : []);
        if (!availableRooms.length) {
            return initialRoom || {
                id: selectedRoomId || 'standard-tent',
                name: 'Standard Alpine Ridge Tent',
                price: Number(selectedPkg?.price || initialPackage?.price || 2499),
                capacity: '2 Adults'
            };
        }
        return availableRooms.find(r => r.id === selectedRoomId || String(r.id).toLowerCase() === String(selectedRoomId).toLowerCase()) || initialRoom || availableRooms[0];
    }, [selectedPkg, initialPackage, selectedRoomId, initialRoom]);

    // Load active discounts on open
    useEffect(() => {
        if (isOpen && typeof window !== 'undefined') {
            const rawDiscounts = loadDiscountsFromStorage();
            setDiscounts(rawDiscounts);
        }
    }, [isOpen]);

    // Headcount math
    const totalGuests = Math.max(1, (Number(adults) || 1) + (Number(children) || 0));
    const roomCapacity = selectedRoom ? parseRoomCapacity(selectedRoom.capacity) : 2;
    const autoRequiredUnits = Math.max(1, Math.ceil(adults / roomCapacity));
    const totalUnits = customUnits !== null ? customUnits : autoRequiredUnits;
    const totalRoomCapacity = totalUnits * roomCapacity;

    // Pricing calculation — guaranteed non-zero, server-matched per-person calculation
    const baseLodgingAmount = useMemo(() => {
        const ratePerPerson = Number(
            selectedRoom?.price || 
            selectedRoom?.basePrice || 
            selectedRoom?.pricePerPerson || 
            selectedPkg?.price || 
            selectedPkg?.basePrice || 
            initialRoom?.price ||
            initialPackage?.price ||
            2499
        );
        const adultCount = Math.max(1, Number(adults) || 1);
        const childCount = Math.max(0, Number(children) || 0);
        return (ratePerPerson * adultCount) + Math.round(ratePerPerson * 0.5 * childCount);
    }, [selectedRoom, selectedPkg, initialRoom, initialPackage, adults, children]);

    const addonsAmount = useMemo(() => {
        // flat / per-person toggles
        const toggles = selectedAddons.reduce((sum, addonId) => {
            const addon = ADDON_CATALOG[addonId];
            if (!addon) return sum;
            return sum + addonCost(addon, { totalGuests });
        }, 0);
        // quantity counters
        const counters = Object.entries(addonQuantities).reduce((sum, [id, qty]) => {
            const addon = ADDON_CATALOG[id];
            if (!addon || !qty) return sum;
            return sum + addonCost(addon, { quantity: qty });
        }, 0);
        return toggles + counters;
    }, [selectedAddons, addonQuantities, totalGuests]);

    const rawTotal = Math.max(0, baseLodgingAmount + addonsAmount);

    const discountSummary = useMemo(() => {
        try {
            return applyDiscounts({
                baseTotal: rawTotal,
                guests: totalGuests,
                campsiteId: selectedPkgId,
                discounts
            });
        } catch (e) {
            return { discountedTotal: rawTotal, discountAmount: 0 };
        }
    }, [rawTotal, discounts, totalGuests, selectedPkgId]);

    const totalAmount = Math.max(100, Number(discountSummary?.discountedTotal ?? rawTotal) || Number(rawTotal) || 2499);
    const advanceAmount = Math.round(totalAmount * 0.3);
    const balanceAmount = Math.max(0, totalAmount - advanceAmount);
    // GST is shown inclusive (the tax portion already baked into totalAmount)
    const gstAmount = gstIncludedAmount(totalAmount);

    // Meals: a single veg counter drives non-veg = campers − veg (kept in sync for the payload)
    useEffect(() => {
        const clampedVeg = Math.min(Math.max(0, vegCount), totalGuests);
        if (clampedVeg !== vegCount) setVegCount(clampedVeg);
        const derivedNonVeg = Math.max(0, totalGuests - clampedVeg);
        if (derivedNonVeg !== nonVegCount) setNonVegCount(derivedNonVeg);
    }, [totalGuests, vegCount, nonVegCount]);

    // Price line items for the shared summary aside
    const summaryLineItems = useMemo(() => {
        const items = [];
        const ratePerPerson = Number(baseLodgingAmount && adults ? Math.round(baseLodgingAmount / (adults + 0.5 * children)) : (selectedRoom?.price || selectedPkg?.price || 2499));
        items.push({ label: `Stay · ${adults} × ${inr(ratePerPerson)}`, amount: baseLodgingAmount });
        const disc = discountSummary?.discountAmount || 0;
        if (disc > 0) items.push({ label: discountSummary?.discountLabel || 'Discount', amount: -disc, tone: 'discount' });
        selectedAddons.forEach((id) => {
            const a = ADDON_CATALOG[id];
            if (!a) return;
            items.push({ label: a.name, amount: addonCost(a, { totalGuests }) });
        });
        Object.entries(addonQuantities).forEach(([id, qty]) => {
            const a = ADDON_CATALOG[id];
            if (!a || !qty) return;
            items.push({ label: `${a.name} × ${qty}`, amount: qty * a.price });
        });
        return items;
    }, [baseLodgingAmount, adults, children, selectedRoom, selectedPkg, discountSummary, selectedAddons, addonQuantities, totalGuests]);

    const currentStepPrice = useMemo(() => {
        if (step === 1) return baseLodgingAmount;
        return totalAmount;
    }, [step, baseLodgingAmount, totalAmount]);

    const toggleAddon = (addonId) => {
        setSelectedAddons(prev => 
            prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
        );
    };

    const handleStep1Next = () => {
        setValidationError('');
        const effectiveDate = travelDate || initialDate || getDefaultUpcomingBatch();
        if (!travelDate) {
            setTravelDate(effectiveDate);
        }
        if (!selectedPkgId) {
            setSelectedPkgId(selectedPkg?.id || campsList[0]?.id || 'pkg-kolukkumalai');
        }
        if (!selectedRoomId && selectedRoom?.id) {
            setSelectedRoomId(selectedRoom.id);
        }
        setStep(2);
    };

    const isValidEmailAddress = (email) => {
        if (!email || typeof email !== 'string') return false;
        const trimmed = email.trim().toLowerCase();
        if (trimmed.length < 6 || trimmed.length > 254) return false;
        if (/\s/.test(trimmed)) return false;
        if (trimmed.includes('..')) return false;
        const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;
        return regex.test(trimmed);
    };

    const handleStep3Next = () => {
        setValidationError('');
        if (!customerName.trim()) {
            setValidationError('Please enter your full name as on government ID.');
            return;
        }
        if (!customerPhone.trim() || !isValidPhoneNumber(customerPhone)) {
            setValidationError('Please enter a valid 10-digit mobile / WhatsApp number.');
            return;
        }
        // Email is optional — validate format only when one is provided
        if (customerEmail.trim() && !isValidEmailAddress(customerEmail)) {
            setValidationError('Invalid email format. Please enter a valid email address with domain (e.g. yourname@gmail.com).');
            return;
        }
        setStep(4);
    };

    // Razorpay Checkout
    const handleRazorpayCheckout = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setValidationError('');

        try {
            const amountToCharge = paymentMode === 'advance' ? advanceAmount : totalAmount;
            
            const orderRes = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getSecurityHeaders()
                },
                body: JSON.stringify({
                    name: customerName.trim(),
                    phone: customerPhone.trim(),
                    email: customerEmail.trim(),
                    package: selectedPkg.title,
                    campsiteId: selectedPkg.id,
                    dates: travelDate,
                    guests: totalGuests,
                    adults,
                    children,
                    roomType: selectedRoom?.name || 'Standard Tent',
                    addons: selectedAddons,
                    addonIds: selectedAddons,
                    addonQuantities,
                    total: totalAmount,
                    paidAmount: amountToCharge,
                    balanceDue: totalAmount - amountToCharge,
                    paymentMode: paymentMode === 'advance' ? 'Advance 30% via Razorpay' : 'Full 100% via Razorpay',
                    dietaryChoice,
                    vegCount,
                    nonVegCount,
                    notes: specialNotes,
                    honeypot,
                    paymentGateway: 'razorpay'
                })
            });

            const orderData = await orderRes.json();

            if (!orderRes.ok || !orderData.success) {
                throw new Error(orderData.message || 'Failed to initialize payment gateway.');
            }

            const rzpOrder = orderData.order || orderData.razorpayOrder || {};
            // Use the key the ORDER was created with (server-authoritative) so Checkout's
            // key_id always matches the order — a mismatch here is what triggers a 401 on
            // Razorpay's /preferences call. The public env var is only a last-resort fallback.
            const orderKey = orderData.keyId || orderData.razorpayKeyId || rzpOrder.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
            const bookingRefId = orderData.bookingId || orderData.booking?.id;

            // No real gateway configured (dev mock order or missing key): don't open a broken
            // Checkout — guide the guest to the WhatsApp enquiry instead.
            const isMockOrder = !rzpOrder.id || String(rzpOrder.id).startsWith('order_dev_') || rzpOrder.mock === true;
            if (isMockOrder || !orderKey || orderKey === 'rzp_test_placeholder') {
                setIsSubmitting(false);
                setValidationError('Online payment isn’t available in this environment yet. Please tap “Send on WhatsApp” to reserve — our team will confirm and collect payment.');
                return;
            }

            if (!window.Razorpay) {
                await new Promise((resolve, reject) => {
                    if (window.Razorpay) return resolve();
                    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
                    if (existing) {
                        existing.addEventListener('load', () => resolve());
                        existing.addEventListener('error', () => reject(new Error('Razorpay SDK failed to load. Please check your network or try WhatsApp Enquire.')));
                        setTimeout(() => {
                            if (window.Razorpay) resolve();
                            else reject(new Error('Razorpay SDK connection timed out. Please check if an ad-blocker is blocking checkout.razorpay.com, or use WhatsApp Enquire.'));
                        }, 3500);
                        return;
                    }

                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.async = true;
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error('Failed to load Razorpay payment SDK. Please ensure ad-blockers are disabled for checkout, or use WhatsApp Enquire.'));
                    document.body.appendChild(script);
                });
            }

            const cleanPhone = String(customerPhone || '').replace(/\D/g, '').slice(-10) || '9847011223';
            const options = {
                key: orderKey,
                amount: rzpOrder.amount || Math.round(amountToCharge * 100),
                currency: rzpOrder.currency || 'INR',
                name: paymentSettings.payeeName || 'Aanandham Wilderness Stays',
                description: `${selectedPkg.title} - ${selectedRoom?.name || 'Camp Booking'}`,
                image: typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://www.aanandham.in/logo.png' : undefined,
                order_id: rzpOrder.id,
                prefill: {
                    name: customerName?.trim() || 'Wilderness Explorer',
                    email: customerEmail?.trim() || 'camper@aanandham.in',
                    contact: cleanPhone
                },
                theme: {
                    color: '#166534'
                },
                handler: async function (response) {
                    try {
                        const verifyRes = await fetch('/api/payments/verify', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                ...getSecurityHeaders()
                            },
                            body: JSON.stringify({
                                orderId: response.razorpay_order_id || rzpOrder.id,
                                paymentId: response.razorpay_payment_id,
                                signature: response.razorpay_signature,
                                razorpay_order_id: response.razorpay_order_id || rzpOrder.id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                bookingId: bookingRefId
                            })
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            setConfirmedPass({
                                ...(orderData.booking || {}),
                                id: bookingRefId,
                                name: customerName,
                                phone: customerPhone,
                                email: customerEmail,
                                package: selectedPkg.title,
                                dates: travelDate,
                                guests: totalGuests,
                                roomType: selectedRoom?.name,
                                status: 'Confirmed',
                                isPaid: true,
                                paymentId: response.razorpay_payment_id,
                                paidAmount: amountToCharge,
                                balanceDue: totalAmount - amountToCharge
                            });
                            if (typeof window !== 'undefined') {
                                window.dispatchEvent(new CustomEvent('pms_track', {
                                    detail: { eventType: 'booking_success', campId: selectedPkgId }
                                }));
                            }
                            setStep(5);
                        } else {
                            setValidationError(verifyData.message || 'Payment signature verification failed. Please contact our support.');
                        }
                    } catch (err) {
                        setValidationError('Verification error. Please contact WhatsApp concierge.');
                    } finally {
                        setIsSubmitting(false);
                    }
                },
                modal: {
                    backdropclose: true,
                    escape: true,
                    animation: true,
                    ondismiss: function() {
                        setIsSubmitting(false);
                        setValidationError('Payment window was closed. Your campsite permit & booking details are preserved. Click "Pay Securely" to retry, or use "WhatsApp Enquire" below.');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                setValidationError(response?.error?.description || 'Payment transaction was declined or cancelled.');
                setIsSubmitting(false);
            });
            rzp.open();

        } catch (err) {
            setValidationError(err.message || 'An unexpected error occurred.');
            setIsSubmitting(false);
        }
    };

    // Direct WhatsApp Concierge Booking with Comprehensive Inquiry
    const handleDirectWhatsAppBooking = () => {
        const amountToPayNow = paymentMode === 'advance' ? advanceAmount : totalAmount;
        const balDue = paymentMode === 'advance' ? balanceAmount : 0;
        const addonNamesForMsg = [
            ...selectedAddons.map(id => ADDON_CATALOG[id]?.name).filter(Boolean),
            ...Object.entries(addonQuantities).filter(([, q]) => q > 0).map(([id, q]) => `${ADDON_CATALOG[id]?.name || id} × ${q}`)
        ];
        const addonsListText = addonNamesForMsg.length > 0 ? addonNamesForMsg.join(', ') : 'None';
        const cleanDates = String(travelDate || '').replace(/–/g, '-');

        const msg = `*Aanandham Wilderness — Campsite Booking & Permit Inquiry*

*Explorer Details:*
- *Name:* ${customerName.trim() || 'Wilderness Camper'}
- *Phone:* ${customerPhone.trim() || 'Not provided'}
${customerEmail.trim() ? `- *Email:* ${customerEmail.trim()}\n` : ''}
*Sanctuary & Stay:*
- *Campsite:* ${selectedPkg.title || selectedPkg.name}
- *Dates / Batch:* ${cleanDates}
- *Lodging:* ${selectedRoom?.name || 'Standard Tent'} (${totalUnits} unit(s))
- *Total Campers:* ${totalGuests} (${adults} Adults${children > 0 ? `, ${children} Children` : ''})

*Food & Add-ons:*
- *Meal Choice:* ${dietaryChoice} (${vegCount} Veg, ${nonVegCount} Non-Veg)
- *Add-Ons / Upgrades:* ${addonsListText}
${specialNotes?.trim() ? `- *Special Notes:* ${specialNotes.trim()}\n` : ''}
*Pricing & Estimate:*
- *Total Expedition Amount:* ₹${(totalAmount || 0).toLocaleString('en-IN')}

_Hi Aanandham Basecamp Concierge! Please check availability and confirm permit details for our expedition._`;

        // Log inquiry into CRM Pipeline in background
        try {
            fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: customerName.trim() || 'Wilderness Camper',
                    phone: customerPhone.trim() || 'Not provided',
                    email: customerEmail.trim() || '',
                    inquiryType: 'WhatsApp Concierge Inquiry',
                    guests: totalGuests,
                    travelDates: cleanDates,
                    campsiteId: selectedPkgId,
                    message: `Lodging: ${selectedRoom?.name || 'Standard Tent'} (${totalUnits} units) | Meals: ${dietaryChoice} (${vegCount}V/${nonVegCount}NV) | Total: ₹${totalAmount} | ${addonsListText !== 'None' ? `Addons: ${addonsListText}` : ''}`,
                    source: 'Booking Engine (WhatsApp Direct)',
                    tenantId: 't-aanandham-hq',
                    status: 'NEW_LEAD'
                })
            }).catch(() => {});
        } catch (e) {}

        window.open(waLink(msg, paymentSettings.phone || '919074858014'), '_blank');
    };

    const handleSharePassToWhatsApp = () => {
        if (!confirmedPass) return;
        const msg = `*✅ Wilderness Permit Voucher*

*Permit ID:* ${confirmedPass.id}
*Guest:* ${confirmedPass.name}
*Campsite:* ${confirmedPass.package}
*Stay Dates:* ${confirmedPass.dates}
*Status:* ${confirmedPass.status}
*Total Amount:* ₹${(confirmedPass.total || 0).toLocaleString('en-IN')}
*Pass Portal:* ${typeof window !== 'undefined' ? window.location.origin : ''}/pass/${confirmedPass.id}`;
        window.open(waLink(msg, paymentSettings.phone || '919074858014'), '_blank');
    };

    if (!isOpen || !mounted || typeof document === 'undefined' || !document.body) return null;

    // ── Shared summary data (drives the desktop aside + mobile bottom bar) ──
    const guestLine = `${adults} ${adults === 1 ? 'adult' : 'adults'}${children ? `, ${children} ${children === 1 ? 'kid' : 'kids'}` : ''}`;
    const unitLine = `${totalUnits} × ${selectedRoom?.name || 'Tent'}`;
    const summaryRows = [
        { label: 'Dates', value: travelDate },
        { label: 'Guests', value: guestLine },
        { label: 'Stay', value: unitLine },
    ];
    if (step >= 3) summaryRows.push({ label: 'Meals', value: `${vegCount} veg · ${nonVegCount} non-veg` });
    const includedList = (Array.isArray(selectedPkg?.inclusions) && selectedPkg.inclusions.length)
        ? selectedPkg.inclusions.slice(0, 3)
        : ['Sunrise 4×4 jeep to the ridge', 'Campfire BBQ dinner & breakfast', 'Guided trek & forest permits'];
    const barSummaryText = `${travelDate} · ${guestLine}`;
    const hasAddons = selectedAddons.length > 0 || Object.values(addonQuantities).some(Boolean);

    const stepFooter = step === 4 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <button type="button" onClick={handleDirectWhatsAppBooking} style={{ ...ctaStyle, width: '100%' }}>
                <WhatsAppIcon size={18} /> Send on WhatsApp
            </button>
            <button type="button" disabled={isSubmitting} onClick={handleRazorpayCheckout} style={{ ...ghostStyle, width: '100%', justifyContent: 'center', opacity: isSubmitting ? 0.6 : 1 }}>
                {isSubmitting ? 'Processing…' : 'Pay now'}
            </button>
        </div>
    ) : (() => {
        const map = {
            1: { back: null, label: 'Continue to add-ons', on: handleStep1Next },
            2: { back: () => setStep(1), label: hasAddons ? 'Continue' : 'Skip add-ons', on: () => setStep(3) },
            3: { back: () => setStep(2), label: 'Review booking', on: handleStep3Next },
        };
        const n = map[step] || map[1];
        return (
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                {n.back && <button type="button" onClick={n.back} style={{ ...ghostStyle, padding: '0 18px' }}>Back</button>}
                <button type="button" onClick={n.on} style={{ ...ctaStyle, flexGrow: 1 }}>{n.label} <ArrowRight size={17} /></button>
            </div>
        );
    })();

    return createPortal(
        <>
            <style>{`
                .bk-body{display:flex;min-height:0;flex:1;}
                .bk-left{flex:1 1 auto;min-width:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:20px 24px 28px;}
                .bk-aside-wrap{display:flex;}
                .bk-bar-wrap{display:none;}
                @media (max-width:767px){
                    .booking-modal-overlay{align-items:flex-end !important;padding:0 !important;}
                    .booking-modal-container{max-width:100% !important;height:100% !important;max-height:100% !important;border-radius:20px 20px 0 0 !important;}
                    .bk-body{flex-direction:column;}
                    .bk-left{padding:18px 16px 20px;}
                    .bk-aside-wrap{display:none;}
                    .bk-bar-wrap{display:block;}
                }
            `}</style>
            <div
                className="booking-modal-overlay"
                style={{ position: 'fixed', inset: 0, zIndex: 100005, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(10, 15, 12, 0.8)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <motion.div
                    ref={modalRef}
                    className="booking-modal-container"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="booking-modal-title"
                    initial={{ opacity: 0, scale: 0.97, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: 20 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    style={{ width: '100%', maxWidth: '960px', height: '720px', maxHeight: '90vh', borderRadius: BK.radiusModal, background: '#FFFFFF', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                    onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                >
                    <BookingWizardHeader
                        step={step}
                        setStep={setStep}
                        confirmedPass={confirmedPass}
                        validationError={validationError}
                        setValidationError={setValidationError}
                        campTitle={selectedPkg?.shortTitle || selectedPkg?.title}
                        campLocation={selectedPkg?.location || selectedPkg?.region}
                        altitude={selectedPkg?.altitude}
                        campImage={selectedPkg?.image}
                        onClose={onClose}
                    />

                    {step === 5 ? (
                        <div className="booking-modal-body booking-modal-scroll" style={{ flex: 1, overflowY: 'auto', padding: 'clamp(14px, 3vw, 24px)' }}>
                            {confirmedPass && (
                                <Step5ConfirmationPass
                                    confirmedPass={confirmedPass}
                                    handleSharePassToWhatsApp={handleSharePassToWhatsApp}
                                    onClose={onClose}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="bk-body">
                            <div className="bk-left" onWheel={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}>
                                {step === 1 && (
                                    <Step1CampsiteLodging
                                        campsList={campsList}
                                        selectedPkgId={selectedPkgId}
                                        setSelectedPkgId={setSelectedPkgId}
                                        customUnits={customUnits}
                                        setCustomUnits={setCustomUnits}
                                        selectedRoomId={selectedRoomId}
                                        setSelectedRoomId={setSelectedRoomId}
                                        selectedPkg={selectedPkg}
                                        travelDate={travelDate}
                                        setTravelDate={setTravelDate}
                                        adults={adults}
                                        setAdults={setAdults}
                                        children={children}
                                        setChildren={setChildren}
                                        totalGuests={totalGuests}
                                        selectedRoom={selectedRoom}
                                        totalUnits={totalUnits}
                                        roomCapacity={roomCapacity}
                                        setValidationError={setValidationError}
                                    />
                                )}
                                {step === 2 && (
                                    <Step2AddonsActivities
                                        selectedAddons={selectedAddons}
                                        toggleAddon={toggleAddon}
                                        addonQuantities={addonQuantities}
                                        setAddonQuantities={setAddonQuantities}
                                        totalGuests={totalGuests}
                                    />
                                )}
                                {step === 3 && (
                                    <Step3CamperContact
                                        customerName={customerName}
                                        setCustomerName={setCustomerName}
                                        customerPhone={customerPhone}
                                        setCustomerPhone={setCustomerPhone}
                                        customerEmail={customerEmail}
                                        setCustomerEmail={setCustomerEmail}
                                        specialNotes={specialNotes}
                                        setSpecialNotes={setSpecialNotes}
                                        dietaryChoice={dietaryChoice}
                                        setDietaryChoice={setDietaryChoice}
                                        vegCount={vegCount}
                                        setVegCount={setVegCount}
                                        nonVegCount={nonVegCount}
                                        totalGuests={totalGuests}
                                        honeypot={honeypot}
                                        setHoneypot={setHoneypot}
                                    />
                                )}
                                {step === 4 && (
                                    <Step4PaymentGateway
                                        selectedPkg={selectedPkg}
                                        selectedRoom={selectedRoom}
                                        travelDate={travelDate}
                                        adults={adults}
                                        children={children}
                                        totalGuests={totalGuests}
                                        totalUnits={totalUnits}
                                        vegCount={vegCount}
                                        nonVegCount={nonVegCount}
                                        customerName={customerName}
                                        customerPhone={customerPhone}
                                        selectedAddons={selectedAddons}
                                        addonQuantities={addonQuantities}
                                        totalAmount={totalAmount}
                                        setStep={setStep}
                                    />
                                )}
                            </div>

                            <div className="bk-aside-wrap">
                                <BookingSummary
                                    variant="aside"
                                    rows={summaryRows}
                                    lineItems={summaryLineItems}
                                    gstAmount={gstAmount}
                                    gstRate={GST_RATE}
                                    included={step === 1 ? includedList : []}
                                    total={totalAmount}
                                >
                                    {stepFooter}
                                </BookingSummary>
                            </div>

                            <div className="bk-bar-wrap">
                                <BookingSummary variant="bar" total={totalAmount} barSummary={barSummaryText}>
                                    {stepFooter}
                                </BookingSummary>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </>,
        document.body
    );
}

export default function BookingEngineModal(props) {
    if (!props.isOpen) return null;
    return (
        <ErrorBoundary
            title="Reservation Wizard Glitch"
            description="The booking wizard encountered an unexpected display issue. Please retry or contact our reservation concierge."
            onReset={props.onClose}
        >
            <BookingEngineModalInner {...props} />
        </ErrorBoundary>
    );
}
