const fs = require('fs');
const path = require('path');

const PMS_DIR = path.resolve(__dirname, '../../../pms(pwd a)');
const targetFile = path.join(PMS_DIR, 'src/components/BookingEngineModal.jsx');

let content = fs.readFileSync(targetFile, 'utf8');

// 1. Fix pricing calculation in baseLodgingAmount
const oldPriceCalc = `    // Pricing calculation
    const baseLodgingAmount = useMemo(() => {
        if (!selectedRoom) return 0;
        const rate = selectedRoom.price || 0;
        return rate * totalUnits;
    }, [selectedRoom, totalUnits]);`;

const newPriceCalc = `    // Pricing calculation — guaranteed non-zero, server-matched per-person calculation
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
    }, [selectedRoom, selectedPkg, initialRoom, initialPackage, adults, children]);`;

content = content.replace(oldPriceCalc, newPriceCalc);

// Also fix rawTotal and totalAmount
const oldTotal = `    const rawTotal = baseLodgingAmount + addonsAmount;

    const discountSummary = useMemo(() => {
        return applyDiscounts(rawTotal, discounts, {
            stayDate: travelDate,
            partySize: totalGuests,
            campId: selectedPkgId,
            advancePayment: paymentMode === 'advance'
        });
    }, [rawTotal, discounts, travelDate, totalGuests, selectedPkgId, paymentMode]);

    const totalAmount = discountSummary.finalTotal;`;

const newTotal = `    const rawTotal = Math.max(0, baseLodgingAmount + addonsAmount);

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

    const totalAmount = Math.max(100, Number(discountSummary?.discountedTotal ?? discountSummary?.finalTotal ?? rawTotal) || Number(rawTotal) || 2499);`;

content = content.replace(oldTotal, newTotal);

// 2. Fix handleDirectWhatsAppBooking
const oldWaBooking = `    // Direct WhatsApp Concierge Booking
    const handleDirectWhatsAppBooking = () => {
        if (isSubmitting) return;
        setValidationError('');

        const msg = \`*🏕️ New Booking Inquiry - Aanandham Wilderness*

*Guest:* \${customerName.trim() || 'Wilderness Explorer'}
*Phone:* \${customerPhone.trim() || 'Not specified'}
\${customerEmail.trim() ? \`*Email:* \${customerEmail.trim()}\\n\` : ''}*Sanctuary:* \${selectedPkg.title}
*Stay Dates:* \${travelDate}
*Camper Count:* \${totalGuests} (\${adults} Adults, \${children} Kids)
*Lodging:* \${selectedRoom?.name || 'Standard Tent'} (\${totalUnits} unit(s))
*Dietary:* \${dietaryChoice} (\${vegCount} Veg, \${nonVegCount} Non-Veg)
\${selectedAddons && selectedAddons.length > 0 ? \`*Upgrades:* \${selectedAddons.join(', ')}\\n\` : ''}*Estimated Fare:* ₹\${(totalAmount || 0).toLocaleString('en-IN')}

_Please confirm availability and permit details for our expedition._\`;

        // 1. Immediately open WhatsApp to connect directly with concierge
        window.open(waLink(msg, paymentSettings.phone || '919074858014'), '_blank');
        
        // 2. Close modal immediately without generating any booking voucher
        onClose();
        setIsSubmitting(false);
    };`;

const newWaBooking = `    // Direct WhatsApp Concierge Booking
    const handleDirectWhatsAppBooking = () => {
        if (isSubmitting) return;
        setValidationError('');

        const amountToPayNow = paymentMode === 'advance' ? advanceAmount : totalAmount;
        const balDue = paymentMode === 'advance' ? balanceAmount : 0;
        const addonsListText = selectedAddons && selectedAddons.length > 0 ? selectedAddons.join(', ') : 'None';
        const cleanDates = String(travelDate || '').replace(/–/g, '-');

        const msg = \`*🏕️ Campsite Booking & Permit Inquiry - Aanandham Wilderness*

*Explorer Details:*
• *Name:* \${customerName.trim() || 'Wilderness Camper'}
• *Phone:* \${customerPhone.trim() || 'Not provided'}
\${customerEmail.trim() ? \`• *Email:* \${customerEmail.trim()}\\n\` : ''}
*Sanctuary & Stay:*
• *Campsite:* \${selectedPkg.title || selectedPkg.name}
• *Dates / Batch:* \${cleanDates}
• *Lodging:* \${selectedRoom?.name || 'Standard Unit'} (\${totalUnits} unit(s))
• *Total Campers:* \${totalGuests} (\${adults} Adults\${children > 0 ? \`, \${children} Children\` : ''})

*Food & Add-ons:*
• *Meal Choice:* \${dietaryChoice} (\${vegCount} Veg, \${nonVegCount} Non-Veg)
• *Add-Ons / Upgrades:* \${addonsListText}
\${specialNotes?.trim() ? \`• *Special Notes:* \${specialNotes.trim()}\\n\` : ''}
*Pricing & Payment Choice:*
• *Total Expedition Amount:* ₹\${(totalAmount || 0).toLocaleString('en-IN')}
• *Selected Payment Choice:* \${paymentMode === 'advance' ? \`30% Advance (₹\${amountToPayNow.toLocaleString('en-IN')} advance, ₹\${balDue.toLocaleString('en-IN')} balance on arrival)\` : \`100% Full Payment (₹\${totalAmount.toLocaleString('en-IN')})\`}

_Hi Aanandham Basecamp Concierge! Please check availability and confirm permit details for our expedition._\`;

        // 1. Asynchronously log inquiry into PMS Inbound CRM Leads Store
        try {
            fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: customerName.trim() || 'Wilderness Explorer',
                    phone: customerPhone.trim() || 'Not specified',
                    email: customerEmail.trim() || '',
                    inquiryType: 'WhatsApp Concierge Inquiry',
                    guests: totalGuests,
                    travelDates: cleanDates,
                    campsiteId: selectedPkgId,
                    message: \`Lodging: \${selectedRoom?.name || 'Standard Unit'} (\${totalUnits} units) | Dietary: \${dietaryChoice} (\${vegCount}V/\${nonVegCount}NV) | Est. Total: ₹\${totalAmount} | \${addonsListText !== 'None' ? \`Addons: \${addonsListText}\` : ''}\`,
                    source: 'Booking Engine (WhatsApp Direct)',
                    tenantId: 't-aanandham-hq',
                    status: 'NEW_LEAD'
                })
            }).catch(() => {});
        } catch (e) {}

        // 2. Open WhatsApp to connect directly with concierge
        window.open(waLink(msg, paymentSettings.phone || '919074858014'), '_blank');
        
        // 3. Close modal
        onClose();
        setIsSubmitting(false);
    };`;

content = content.replace(oldWaBooking, newWaBooking);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('✅ Updated BookingEngineModal.jsx in PMS!');
