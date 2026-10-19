import { NextResponse } from 'next/server';
import { getTestimonials, getActiveTestimonials } from '@/lib/testimonials';
import { getClientIp } from '@/lib/authConfig';
import { checkRateLimit } from '@/lib/redis';
import { getPmsBaseUrl } from '@/lib/pmsClient';

// GET: public active testimonials (synced with OpenPMS)
export async function GET(request) {
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(`ratelimit:testimonials_public:${ip}`, 120, 60);
    if (!rateLimit.allowed) {
        return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 });
    }

    // Try live sync from OpenPMS first
    const pmsUrl = getPmsBaseUrl();
    try {
        const pmsRes = await fetch(`${pmsUrl}/api/testimonials`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(2000)
        });
        if (pmsRes.ok) {
            const pmsData = await pmsRes.json();
            if (pmsData.success && Array.isArray(pmsData.testimonials) && pmsData.testimonials.length > 0) {
                const res = NextResponse.json({ success: true, testimonials: pmsData.testimonials });
                res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
                return res;
            }
        }
    } catch {
        // Fallback to local verified reviews
    }

    const res = NextResponse.json({ success: true, testimonials: getActiveTestimonials(getTestimonials()) });
    res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res;
}