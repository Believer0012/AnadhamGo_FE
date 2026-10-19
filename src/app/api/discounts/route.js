import { NextResponse } from 'next/server';
import { getDiscounts } from '@/lib/discounts';
import { checkRateLimit } from '@/lib/redis';
import { getClientIp } from '@/lib/authConfig';

export async function GET(request) {
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(`ratelimit:discounts_public:${ip}`, 120, 60);
    if (!rateLimit.allowed) {
        return NextResponse.json({ success: false, message: 'Rate limit exceeded' }, { status: 429 });
    }

    // Return all live campaigns (active, not expired). Guest-count / campsite
    // scoping is applied client-side by applyDiscounts per booking.
    const all = getDiscounts();
    const now = Date.now();
    const active = (Array.isArray(all) ? all : []).filter(d => d.active !== false && !(d.expiresAt && now > new Date(d.expiresAt).getTime()));

    const res = NextResponse.json({
        success: true,
        discounts: active,
        count: active.length
    });
    res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res;
}