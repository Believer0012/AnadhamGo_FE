import { NextResponse } from 'next/server';
import { getDiscounts, saveDiscounts, DEFAULT_DISCOUNTS } from '@/lib/discounts';
import { getAdminPayload } from '@/lib/authConfig';

// GET: full discount list (admin only)
export async function GET(request) {
    const session = getAdminPayload(request);
    if (!session) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ success: true, discounts: getDiscounts() });
}

// POST: replace the whole discount campaign list (admin only)
export async function POST(request) {
    const session = getAdminPayload(request);
    if (!session) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { discounts } = body;

        if (!Array.isArray(discounts) || discounts.length > 50) {
            return NextResponse.json({ success: false, message: 'Invalid discount list' }, { status: 400 });
        }

        const sanitized = discounts.map((d, idx) => {
            const type = d.type === 'flat' ? 'flat' : 'percent';
            let value = Math.max(0, Math.min(type === 'percent' ? 90 : 50000, Number(d.value) || 0));
            return {
                id: String(d.id || `discount-${Date.now()}-${idx}`).slice(0, 60),
                name: String(d.name || 'Discount').slice(0, 80),
                type,
                value,
                minGuests: Math.max(0, Math.min(200, Number(d.minGuests) || 0)),
                scope: String(d.scope || 'all').slice(0, 60),
                active: d.active !== false,
                expiresAt: d.expiresAt || null,
                createdAt: d.createdAt || new Date().toISOString()
            };
        });

        saveDiscounts(sanitized);
        return NextResponse.json({ success: true, discounts: sanitized, count: sanitized.length });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Failed to save discounts' }, { status: 500 });
    }
}

// DELETE: reset to defaults (admin only)
export async function DELETE(request) {
    const session = getAdminPayload(request);
    if (!session) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    saveDiscounts(DEFAULT_DISCOUNTS);
    return NextResponse.json({ success: true, discounts: DEFAULT_DISCOUNTS });
}