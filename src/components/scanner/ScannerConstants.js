import { Tent, Sunrise, Mountain, Trees, Leaf, Home, ChefHat } from 'lucide-react';

export const CAMP_GLYPHS = {
    '⛺': Tent,
    '🏕️': Tent,
    '🌄': Sunrise,
    '⛰️': Mountain,
    '🌲': Trees,
    '🌿': Leaf,
    '🏡': Home,
    '🛏': Home,
    '👨‍🍳': ChefHat
};

export function StationGlyph({ icon, size = 16, color }) {
    const Ico = (icon && CAMP_GLYPHS[icon]) || Tent;
    return <Ico size={size} color={color} />;
}

export const AANANDHAM_CAMPS = [
    { id: 'all', name: 'All Camp Sanctuaries', region: 'Enterprise Overview', icon: Tent },
    { id: 'pkg-kolukkumalai', name: 'Kolukkumalai Sunrise 4x4', region: 'Munnar (7,900 FT)', icon: Sunrise },
    { id: 'pkg-meesapulimala', name: 'Meesapulimala High Altitude', region: 'Silent Valley (8,600 FT)', icon: Mountain },
    { id: 'pkg-suryanelli', name: 'Suryanelli Valley Glamp', region: 'Munnar', icon: Tent },
    { id: 'pkg-mini-mexico', name: 'Mini Mexico Vattavada', region: 'Vattavada / Munnar (6,200 FT)', icon: Home },
    { id: 'pkg-wildlink', name: 'Camp Wildlink Vattavada', region: 'Pazhathottam / Munnar (7,000 FT)', icon: Trees },
    { id: 'pkg-vagamon-pine', name: 'Vagamon Pine Forest', region: 'Vagamon', icon: Trees },
    { id: 'pkg-wayanad', name: 'Wayanad 900 Kandi Rainforest', region: 'Wayanad', icon: Leaf }
];

export function getCleanWhatsAppPhone(phone) {
    if (!phone) return '';
    let digits = String(phone).replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 11) {
        digits = digits.slice(1);
    }
    if (digits.length === 10) {
        digits = `91${digits}`;
    }
    return digits;
}
