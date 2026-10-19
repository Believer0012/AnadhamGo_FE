export const DEFAULT_WA_PHONE = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '919074858014';

/**
 * Automatically log a WhatsApp inquiry click intent to the CRM / PMS pipeline
 */
export const logWhatsAppInquiry = async ({
  text = '',
  phone = DEFAULT_WA_PHONE,
  source = 'Website WhatsApp Trigger',
  campsiteId = null,
  name = 'WhatsApp Visitor',
  email = '',
  guests = 2,
  travelDates = 'Flexible'
} = {}) => {
  if (typeof window === 'undefined') return;
  try {
    fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phone: 'WhatsApp Direct',
        email,
        inquiryType: 'WhatsApp Concierge Click',
        guests,
        travelDates,
        campsiteId,
        message: text ? `Pre-filled message: "${text.slice(0, 300)}"` : 'Direct WhatsApp Concierge Click',
        source: source || 'Website WhatsApp Trigger',
        tenantId: 't-aanandham-hq',
        status: 'NEW_LEAD'
      })
    }).catch(() => {});
  } catch (e) {}
};

/**
 * Format a phone number into an international numeric string without special chars
 */
export const cleanPhone = (phone = '') => {
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return DEFAULT_WA_PHONE;
  if (digits.length === 10) return '91' + digits;
  return digits;
};

/**
 * Validate phone number has at least 10 valid numeric digits
 */
export const isValidPhoneNumber = (phone = '') => {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 10;
};

/**
 * Build a standard wa.me URL with smart argument order detection
 * Supports waLink(text, phone) and waLink(phone, text)
 */
export const waLink = (arg1 = '', arg2 = null) => {
  let text = '';
  let phone = DEFAULT_WA_PHONE;

  const isPhonePattern = (str) => {
    if (!str || typeof str !== 'string') return false;
    const trimmed = str.trim();
    // Digits only with optional leading +, length 10 to 14
    return /^\+?\d{10,14}$/.test(trimmed.replace(/[\s-]/g, ''));
  };

  if (isPhonePattern(arg1)) {
    // Called as waLink(phone, text)
    phone = arg1;
    text = typeof arg2 === 'string' ? arg2 : '';
  } else if (arg2 && isPhonePattern(arg2)) {
    // Called as waLink(text, phone)
    text = typeof arg1 === 'string' ? arg1 : '';
    phone = arg2;
  } else {
    // Called as waLink(text)
    text = typeof arg1 === 'string' ? arg1 : '';
    if (arg2) phone = arg2;
  }

  const clean = cleanPhone(phone);
  const encoded = encodeURIComponent(String(text).trim());
  return `https://wa.me/${clean}${encoded ? `?text=${encoded}` : ''}`;
};

/**
 * Build standardized Booking Confirmation / Reservation Message
 */
export const buildBookingWaText = ({
  guestName,
  phone,
  email,
  packageTitle,
  dates,
  guests = 1,
  stayType,
  totalAmount,
  notes
}) => {
  const lines = [
    '🌲 *AANANDHAM GLAMPING & EXPEDITIONS RESERVATION* 🌲',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    guestName ? `👤 *Guest:* ${guestName}` : '',
    phone ? `📞 *Phone:* ${phone}` : '',
    email ? `✉️ *Email:* ${email}` : '',
    packageTitle ? `⛺ *Package:* ${packageTitle}` : '',
    dates ? `📅 *Dates:* ${dates}` : '',
    guests ? `👥 *Group Size:* ${guests} Camper${Number(guests) > 1 ? 's' : ''}` : '',
    stayType ? `🏡 *Stay Option:* ${stayType}` : '',
    totalAmount ? `💰 *Estimated Total:* ₹${Number(totalAmount).toLocaleString('en-IN')}` : '',
    notes ? `📝 *Special Requests:* ${notes}` : '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '✨ *Status:* Inquiring for Instant Mountain Ridge Confirmation',
    'Please confirm availability and share advance payment details.'
  ].filter(Boolean);

  return lines.join('\n');
};

/**
 * Build standardized Custom Package Expedition Message
 */
export const buildCustomPackageWaText = ({
  name,
  phone,
  stayType,
  duration,
  groupSize,
  selectedActivities = [],
  dietaryPref,
  dates,
  budget,
  estimatedPrice
}) => {
  const lines = [
    '🏔️ *CUSTOM AANANDHAM EXPEDITION INQUIRY* 🏔️',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    name ? `👤 *Lead Organizer:* ${name}` : '',
    phone ? `📞 *Phone:* ${phone}` : '',
    stayType ? `🏕️ *Preferred Stay:* ${stayType}` : '',
    duration ? `⏳ *Duration:* ${duration}` : '',
    groupSize ? `👥 *Squad Size:* ${groupSize} People` : '',
    dates ? `📅 *Preferred Dates:* ${dates}` : '',
    selectedActivities.length > 0 ? `🎯 *Curated Activities:*\n  • ${selectedActivities.join('\n  • ')}` : '',
    dietaryPref ? `🍲 *Meal Plan:* ${dietaryPref}` : '',
    budget ? `💵 *Target Budget:* ₹${Number(budget).toLocaleString('en-IN')}` : '',
    estimatedPrice ? `✨ *Calculated Estimate:* ₹${Number(estimatedPrice).toLocaleString('en-IN')}` : '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    'Please share custom itinerary and slot availability!'
  ].filter(Boolean);

  return lines.join('\n');
};

/**
 * Build standardized General Contact / Inquiry Message
 */
export const buildInquiryWaText = ({
  name,
  email,
  phone,
  subject,
  message
}) => {
  const lines = [
    '👋 *HELLO AANANDHAM ADVENTURE DESK*',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    name ? `👤 *Name:* ${name}` : '',
    phone ? `📞 *Phone:* ${phone}` : '',
    email ? `✉️ *Email:* ${email}` : '',
    subject ? `📌 *Subject:* ${subject}` : '',
    message ? `💬 *Message:* ${message}` : '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    'Looking forward to your guidance for our Munnar trip!'
  ].filter(Boolean);

  return lines.join('\n');
};
