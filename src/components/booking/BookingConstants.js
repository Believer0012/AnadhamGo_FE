import { Flame, Truck, Camera, PersonStanding, Music2, Trees, Leaf, Beef, Clock } from 'lucide-react';
import { ADDON_CATALOG } from '@/lib/pricing';

export const ROW_GAP_10 = { display: 'flex', alignItems: 'center', gap: '10px' };

export function parseRoomCapacity(capacityStr) {
    if (!capacityStr) return 2;
    const match = String(capacityStr).match(/\d+/);
    return match ? Math.max(1, parseInt(match[0], 10)) : 2;
}

const ADDON_ICONS = {
    bbq: { icon: Flame, desc: 'Marinated paneer/chicken skewers grilled live over wood coals' },
    jeep: { icon: Truck, desc: 'Exclusive Mahindra 4x4 for your squad with summit sunrise stops' },
    drone: { icon: Camera, desc: 'Cinematic aerial 4K video clips edited for your Instagram reels' },
    yoga: { icon: PersonStanding, desc: 'Guided breathwork & stretching above cloud beds with local yogi' },
    guitar: { icon: Music2, desc: 'Live unplugged indie mountain tunes around the starlit fire' },
    'ad-forest-walk': { icon: Trees, desc: 'Guided walk through the shola forest' },
    'ad-lunch-veg': { icon: Leaf, desc: '' },
    'ad-lunch-nonveg': { icon: Beef, desc: '' },
    'ad-live-bbq': { icon: Flame, desc: '' },
    'ad-campfire-extra': { icon: Clock, desc: 'Keep the fire going a little longer' }
};

export const ADDONS_LIST = Object.values(ADDON_CATALOG).map(item => ({
    ...item,
    icon: ADDON_ICONS[item.id]?.icon || Flame,
    desc: ADDON_ICONS[item.id]?.desc || ''
}));
