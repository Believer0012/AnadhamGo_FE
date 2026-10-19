/**
 * Aanandham Glamping & Sanctuary PMS - Core TypeScript Definitions
 */

export type CampRegion = 'Munnar' | 'Vagamon' | 'Wayanad' | 'All';

export type BookingStatus = 'Confirmed' | 'Checked In' | 'Cancelled' | 'Pending Payment';

export type GroupType = 'Solo' | 'Couple' | 'Family' | 'Friends Batch' | 'Corporate Expedition';

export type SettlementMethod = 'cash' | 'upi' | 'razorpay' | 'complimentary';

export interface AttendanceCamper {
    name: string;
    mealPref: 'veg' | 'nonveg' | 'jain';
    checkedIn: boolean;
    wristbandId?: string;
    checkInTime?: string;
}

export interface Booking {
    id: string;
    name: string;
    phone: string;
    email: string;
    package: string;
    campsiteId?: string;
    region?: string;
    dates: string;
    checkInDate?: string;
    checkOutDate?: string;
    guests: number;
    roomType?: string;
    groupType?: GroupType;
    allocatedUnit?: string;
    assignedTent?: string;
    wristbandRange?: string;
    total: number;
    advancePaid?: number;
    paidAmount?: number;
    balanceDue?: number;
    balanceCollected?: number;
    isBalancePaid?: boolean;
    settlementMethod?: SettlementMethod;
    status: BookingStatus;
    checkedInCount?: number;
    checkInAt?: string;
    marshalName?: string;
    marshalNotes?: string;
    convoyTime?: string;
    emergencyPhone?: string;
    discountCode?: string;
    discountAmount?: number;
    utrNumber?: string;
    addons?: Array<{ id: string; name: string; price: number; quantity?: number }>;
    attendanceRoster?: AttendanceCamper[];
    createdAt?: string;
    updatedAt?: string;
}

export interface RoomOption {
    id: string;
    name: string;
    capacity: string;
    price: number;
    totalUnits: number;
    bookedUnits?: number;
    image: string;
    features?: string;
}

export interface Campsite {
    id: string;
    title: string;
    region: string;
    category: string;
    tag?: string;
    location: string;
    altitude: string;
    price: number;
    originalPrice?: number;
    duration: string;
    difficulty: string;
    image: string;
    gallery: string[];
    description: string;
    highlights?: string;
    inclusions?: string;
    exclusions?: string;
    rooms?: RoomOption[];
    bookedUnits?: number;
    capacity?: number;
}

export interface ExpeditionEvent {
    id: string;
    title: string;
    region: string;
    campsite: string;
    dates: string;
    price: number;
    capacity: number;
    booked: number;
    badge?: string;
    status: 'Active' | 'Completed' | 'Sold Out';
    image: string;
    description: string;
}

export interface MarshalProfile {
    id: string;
    name: string;
    station: string;
    campId: string;
    phone: string;
    passcode: string;
    status: 'On Duty' | 'Off Duty' | 'Standby';
    avatar: string;
    notes?: string;
}

export interface DiscountCampaign {
    id: string;
    name: string;
    code?: string;
    type: 'percent' | 'flat';
    value: number;
    minGuests: number;
    scope: string;
    active: boolean;
    validUntil?: string;
    createdAt?: string;
}

export interface Testimonial {
    id: string;
    quote: string;
    author: string;
    campBadge: string;
    batchDate: string;
    avatar: string;
    active: boolean;
    rating?: number;
}

export interface PaymentSettings {
    paymentMode: 'gateway' | 'qr_manual' | 'both';
    upiId: string;
    merchantName: string;
    razorpayKeyId: string;
    enableInstantBooking: boolean;
}

export interface DbAuditLog {
    id: string;
    action: string;
    details: string;
    recordId?: string;
    timestamp: string;
    actor: string;
    severity?: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
}

export interface HeadcountStats {
    totalExpected: number;
    totalCheckedIn: number;
    remainingLate: number;
    totalVegMeals: number;
    totalNonVegMeals: number;
    totalJainMeals: number;
    totalBalancePending: number;
}
