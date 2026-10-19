"use client";
import React from 'react';
import {
    Flame,
    Truck,
    Bath,
    ShowerHead,
    Zap,
    HeartPulse,
    Wifi,
    Utensils,
    Tent,
    Mountain,
    Compass,
    Footprints,
    Coffee,
    Camera,
    Video,
    Music,
    Sparkles,
    Sun,
    Sunrise,
    Sunset,
    Eye,
    Bed,
    Moon,
    Thermometer,
    Wind,
    Umbrella,
    ShieldCheck,
    Lamp,
    Flashlight,
    Star,
    Telescope,
    Clock,
    Users,
    User,
    Check,
    CheckCircle2,
    TreePine,
    MapPin,
    AlertCircle,
    Calendar,
    ChevronDown,
    SlidersHorizontal,
    Radio
} from 'lucide-react';

export default function LucideAmenityIcon({
    name = '',
    icon = '',
    size = 18,
    color = 'currentColor',
    strokeWidth = 2,
    style = {},
    className = ''
}) {
    const term = `${name} ${icon}`.toLowerCase();

    // Map common amenity & feature terms to Lucide React SVG components
    if (term.includes('fire') || term.includes('flame') || term.includes('🔥') || term.includes('bbq') || term.includes('barbecue')) {
        return <Flame size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('jeep') || term.includes('4x4') || term.includes('safari') || term.includes('offroad') || term.includes('truck') || term.includes('🚙')) {
        return <Truck size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('shower') || term.includes('hot water') || term.includes('🚿') || term.includes('geyser')) {
        return <ShowerHead size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('washroom') || term.includes('restroom') || term.includes('toilet') || term.includes('bath') || term.includes('en-suite')) {
        return <Bath size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('power') || term.includes('charging') || term.includes('electricity') || term.includes('zap') || term.includes('⚡')) {
        return <Zap size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('medical') || term.includes('first aid') || term.includes('oxygen') || term.includes('health') || term.includes('🩺') || term.includes('pulse')) {
        return <HeartPulse size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('wifi') || term.includes('internet') || term.includes('network') || term.includes('cell')) {
        return <Wifi size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('food') || term.includes('dinner') || term.includes('breakfast') || term.includes('meal') || term.includes('buffet') || term.includes('dining') || term.includes('fork') || term.includes('platter')) {
        return <Utensils size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('tent') || term.includes('pod') || term.includes('camp') || term.includes('dome') || term.includes('glamp') || term.includes('⛺') || term.includes('shelter')) {
        return <Tent size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('mountain') || term.includes('summit') || term.includes('peak') || term.includes('ridge') || term.includes('altitude') || term.includes('🏔️') || term.includes('hill')) {
        return <Mountain size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('guide') || term.includes('marshal') || term.includes('compass') || term.includes('permit') || term.includes('🧭') || term.includes('navigation')) {
        return <Compass size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('trek') || term.includes('hike') || term.includes('walk') || term.includes('trail') || term.includes('footprints') || term.includes('expedition')) {
        return <Footprints size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('tea') || term.includes('coffee') || term.includes('chai') || term.includes('spiced tea') || term.includes('☕')) {
        return <Coffee size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('drone') || term.includes('4k') || term.includes('video') || term.includes('reel') || term.includes('cinematic')) {
        return <Video size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('photo') || term.includes('camera') || term.includes('shoot') || term.includes('📸')) {
        return <Camera size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('guitar') || term.includes('music') || term.includes('acoustic') || term.includes('jam') || term.includes('song') || term.includes('🎸')) {
        return <Music size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('yoga') || term.includes('pranayama') || term.includes('meditation') || term.includes('wellness') || term.includes('🧘') || term.includes('zen')) {
        return <Sparkles size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('sunrise') || term.includes('dawn') || term.includes('morning')) {
        return <Sunrise size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('sunset') || term.includes('golden hour') || term.includes('dusk')) {
        return <Sunset size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('sun') || term.includes('daylight')) {
        return <Sun size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('view') || term.includes('vista') || term.includes('panoramic') || term.includes('deck') || term.includes('balcony') || term.includes('window') || term.includes('glass')) {
        return <Eye size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('bed') || term.includes('mattress') || term.includes('king') || term.includes('bunk') || term.includes('sleep') || term.includes('pillow')) {
        return <Bed size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('night') || term.includes('moon') || term.includes('stargaz') || term.includes('midnight') || term.includes('starlit')) {
        return <Moon size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('star') || term.includes('bestseller') || term.includes('⭐') || term.includes('rating') || term.includes('★')) {
        return <Star size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('blanket') || term.includes('thermal') || term.includes('fleece') || term.includes('warmth') || term.includes('temperature') || term.includes('cold')) {
        return <Thermometer size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('wind') || term.includes('breeze') || term.includes('air')) {
        return <Wind size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('waterproof') || term.includes('flysheet') || term.includes('rain') || term.includes('weatherproof')) {
        return <Umbrella size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('safe') || term.includes('verified') || term.includes('security') || term.includes('permit') || term.includes('certified')) {
        return <ShieldCheck size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('lantern') || term.includes('lamp') || term.includes('torch') || term.includes('light') || term.includes('flashlight')) {
        return <Lamp size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('telescope') || term.includes('sky')) {
        return <Telescope size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('pine') || term.includes('forest') || term.includes('jungle') || term.includes('nature') || term.includes('rainforest') || term.includes('tree')) {
        return <TreePine size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('pin') || term.includes('location') || term.includes('place') || term.includes('📍')) {
        return <MapPin size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('time') || term.includes('clock') || term.includes('hour') || term.includes('duration') || term.includes('schedule')) {
        return <Clock size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('user') || term.includes('person') || term.includes('adult') || term.includes('camper') || term.includes('guest') || term.includes('squad') || term.includes('people') || term.includes('👥') || term.includes('👤')) {
        return <Users size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }
    if (term.includes('calendar') || term.includes('date') || term.includes('batch') || term.includes('📅')) {
        return <Calendar size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
    }

    // Default Fallback
    return <CheckCircle2 size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
}
