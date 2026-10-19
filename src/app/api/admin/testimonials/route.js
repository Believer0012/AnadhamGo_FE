import { NextResponse } from 'next/server';
import { getTestimonials, saveTestimonials, DEFAULT_TESTIMONIALS } from '@/lib/testimonials';
import { getAdminPayload } from '@/lib/authConfig';

// GET: full testimonial list (admin only)
export async function GET(request) {
    const session = getAdminPayload(request);
    if (!session) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ success: true, testimonials: getTestimonials() });
}

// POST: replace the whole testimonial list (admin only)
export async function POST(request) {
    const session = getAdminPayload(request);
    if (!session) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { testimonials } = body;

        if (!Array.isArray(testimonials) || testimonials.length > 100) {
            return NextResponse.json({ success: false, message: 'Invalid testimonial list' }, { status: 400 });
        }

        const sanitized = testimonials.map((t, idx) => ({
            id: String(t.id || `t-${Date.now()}-${idx}`).slice(0, 60),
            quote: String(t.quote || '').slice(0, 2000),
            author: String(t.author || t.name || 'Guest Camper').slice(0, 80),
            campBadge: String(t.campBadge || 'camp').slice(0, 40),
            batchDate: String(t.batchDate || t.role || '').slice(0, 80),
            avatar: String(t.avatar || '').slice(0, 500),
            active: t.active !== false
        }));

        saveTestimonials(sanitized);
        return NextResponse.json({ success: true, testimonials: sanitized, count: sanitized.length });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Failed to save testimonials' }, { status: 500 });
    }
}

// DELETE: reset to defaults (admin only)
export async function DELETE(request) {
    const session = getAdminPayload(request);
    if (!session) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    saveTestimonials(DEFAULT_TESTIMONIALS);
    return NextResponse.json({ success: true, testimonials: DEFAULT_TESTIMONIALS });
}