import { NextResponse } from 'next/server';
import { getAdminPayload, getClientIp } from '@/lib/authConfig';
import { checkRateLimit } from '@/lib/redis';
import { getAllCamps } from '@/lib/campsData';
import { prisma, isPrismaConfigured } from '@/lib/prisma';
import { recordWalMutation, logCrash } from '@/lib/auditLedger';
import { getPmsBaseUrl } from '@/lib/pmsClient';

// In-memory override cache for admin-saved camps fallback
let campsOverride = null;

// ── GET: Public read of the camps catalog (Edge-cached, rate-limited, DB fallback) ──
export async function GET(request) {
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(`ratelimit:camps_read:${ip}`, 240, 60);
    if (!rateLimit.allowed) {
        return NextResponse.json({ success: false, message: 'Too many requests. Please wait.' }, { status: 429 });
    }

    const cacheHeaders = {
        'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, s-maxage=120',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=120'
    };

    // 1. Query OpenPMS properties API for live rates & availability
    const pmsUrl = getPmsBaseUrl();
    try {
        const pmsRes = await fetch(`${pmsUrl}/api/properties`, {
            headers: { 'X-PMS-Tenant-Id': process.env.NEXT_PUBLIC_PMS_TENANT_ID || 't-aanandham-hq' },
            cache: 'no-store',
            signal: AbortSignal.timeout(2500)
        });
        if (pmsRes.ok) {
            const pmsData = await pmsRes.json();
            const pmsProps = pmsData.properties || pmsData.data || pmsData.camps;
            if (Array.isArray(pmsProps) && pmsProps.length > 0) {
                const base = getAllCamps();
                const merged = pmsProps.map(pmsItem => {
                    const matchingBase = base.find(b => b.id === pmsItem.id || (b.title || b.name || '').toLowerCase() === (pmsItem.title || pmsItem.name || '').toLowerCase());
                    const rawRooms = (Array.isArray(pmsItem.rooms) && pmsItem.rooms.length > 0)
                        ? pmsItem.rooms
                        : (Array.isArray(pmsItem.roomTypes) && pmsItem.roomTypes.length > 0)
                            ? pmsItem.roomTypes
                            : null;

                    return {
                        ...(matchingBase || {}),
                        ...pmsItem,
                        id: pmsItem.id,
                        title: pmsItem.name || pmsItem.title || matchingBase?.title || 'Wilderness Camp',
                        shortTitle: pmsItem.shortTitle || matchingBase?.shortTitle || pmsItem.name || pmsItem.title,
                        name: pmsItem.name || pmsItem.title || matchingBase?.title,
                        price: Number(pmsItem.price || pmsItem.basePrice || matchingBase?.price || 1499),
                        basePrice: Number(pmsItem.price || pmsItem.basePrice || matchingBase?.price || 1499),
                        originalPrice: pmsItem.originalPrice || matchingBase?.originalPrice || (Math.round(Number(pmsItem.price || pmsItem.basePrice || 1499) * 1.3)),
                        region: pmsItem.region || pmsItem.location?.split(',')[0] || matchingBase?.region || 'Munnar',
                        location: pmsItem.location || matchingBase?.location || 'Kerala, India',
                        altitude: pmsItem.altitude || matchingBase?.altitude || '6,500 FT',
                        description: pmsItem.description || matchingBase?.description || 'Authentic mountain sanctuary glamping experience curated by certified camp staff.',
                        highlights: Array.isArray(pmsItem.highlights) && pmsItem.highlights.length > 0
                            ? pmsItem.highlights
                            : (matchingBase?.highlights || ['Panoramic Sunrise View', 'Campfire & BBQ', 'Staff Guide Support', 'Solar Powered Stay']),
                        image: (matchingBase?.image && !matchingBase.image.includes('unsplash.com')) ? matchingBase.image : (pmsItem.image || matchingBase?.image),
                        gallery: (matchingBase?.gallery && matchingBase.gallery.length > 0 && !matchingBase.gallery[0].includes('unsplash.com')) ? matchingBase.gallery : (pmsItem.gallery || matchingBase?.gallery),
                        isAvailable: pmsItem.isAvailable !== undefined ? pmsItem.isAvailable : (matchingBase?.isAvailable !== false),
                        rooms: rawRooms ? rawRooms.map(rt => ({
                            id: rt.id,
                            name: rt.name,
                            price: Number(rt.price ?? rt.basePrice ?? pmsItem.price ?? 0),
                            basePrice: Number(rt.price ?? rt.basePrice ?? pmsItem.price ?? 0),
                            capacity: rt.capacity || '2 Adults',
                            totalUnits: Number(rt.totalUnits) || 8,
                            features: Array.isArray(rt.features) && rt.features.length > 0
                                ? rt.features
                                : (Array.isArray(rt.amenities) && rt.amenities.length > 0
                                    ? rt.amenities
                                    : (typeof rt.description === 'string' && rt.description
                                        ? rt.description.split(',').map(s => s.trim()).filter(Boolean)
                                        : ['Mountain View', 'Bedding', 'Campfire Access'])),
                            image: rt.image || (Array.isArray(rt.images) && rt.images[0]) || pmsItem.image
                        })) : (matchingBase?.rooms || [])
                    };
                });

                // Include any newly added camps from base catalog that aren't yet in OpenPMS microservice
                const pmsIds = new Set(pmsProps.map(p => p.id));
                const missingFromPms = base.filter(b => !pmsIds.has(b.id));
                const completeCatalog = [...merged, ...missingFromPms];

                campsOverride = completeCatalog;
                return NextResponse.json(completeCatalog, { headers: { 'Cache-Control': 'no-store' } });
            }
        }
    } catch (e) {
        // Fallback to direct DB query
    }

    // 2. Query shared PostgreSQL database directly for live Property & RoomType models (PMS master tables)
    if (isPrismaConfigured && prisma) {
        try {
            const rawDbProps = await prisma.$queryRawUnsafe(`
                SELECT p.id, p.title, p."shortTitle", p.slug, p.category, p.region, p.location, 
                       p.altitude, p."basePrice", p.rating, p.image, p.gallery, p.description, 
                       p.inclusions, p.exclusions, p.amenities, p."isActive",
                       COALESCE(
                           json_agg(
                               json_build_object(
                                   'id', rt.id, 
                                   'name', rt.name, 
                                   'price', rt."basePrice", 
                                   'basePrice', rt."basePrice", 
                                   'capacity', rt.capacity, 
                                   'totalUnits', rt."totalUnits", 
                                   'description', rt.description,
                                   'images', rt.images
                               )
                           ) FILTER (WHERE rt.id IS NOT NULL), '[]'::json
                       ) as rooms
                FROM "Property" p
                LEFT JOIN "RoomType" rt ON rt."propertyId" = p.id
                WHERE p."isActive" = true
                GROUP BY p.id
            `);

            if (Array.isArray(rawDbProps) && rawDbProps.length > 0) {
                const base = getAllCamps();
                const dbCatalog = rawDbProps.map(p => {
                    const matchingBase = base.find(b => b.id === p.id || (b.title || b.name || '').toLowerCase() === (p.title || '').toLowerCase());
                    const dbRooms = Array.isArray(p.rooms) && p.rooms.length > 0 ? p.rooms.map(r => ({
                        id: r.id,
                        name: r.name,
                        price: Number(r.price ?? r.basePrice ?? p.basePrice ?? 0),
                        basePrice: Number(r.price ?? r.basePrice ?? p.basePrice ?? 0),
                        capacity: typeof r.capacity === 'number' ? `${r.capacity} Adults` : (r.capacity || '2 Adults'),
                        totalUnits: Number(r.totalUnits) || 8,
                        features: typeof r.description === 'string' ? r.description.split(',').map(s => s.trim()).filter(Boolean) : (matchingBase?.rooms?.[0]?.features || ['Mountain View', 'Bedding']),
                        image: (Array.isArray(r.images) && r.images[0]) || (matchingBase?.rooms?.[0]?.image) || p.image
                    })) : (matchingBase?.rooms || []);

                    return {
                        ...(matchingBase || {}),
                        id: p.id,
                        title: p.title || matchingBase?.title || 'Wilderness Camp',
                        shortTitle: p.shortTitle || matchingBase?.shortTitle || p.title,
                        name: p.title,
                        price: Number(p.basePrice || matchingBase?.price || 1499),
                        basePrice: Number(p.basePrice || matchingBase?.price || 1499),
                        originalPrice: Math.round(Number(p.basePrice || 1499) * 1.3),
                        region: p.region || matchingBase?.region || 'Munnar',
                        location: p.location || matchingBase?.location || 'Kerala, India',
                        altitude: p.altitude || matchingBase?.altitude || '6,500 FT',
                        description: p.description || matchingBase?.description,
                        image: p.image || matchingBase?.image,
                        gallery: p.gallery || matchingBase?.gallery,
                        isAvailable: p.isActive !== false,
                        rooms: dbRooms
                    };
                });

                campsOverride = dbCatalog;
                return NextResponse.json(dbCatalog, { headers: { 'Cache-Control': 'no-store' } });
            }
        } catch (dbErr) {
            console.error('Error reading live Property/RoomType from DB:', dbErr);
        }

        try {
            const record = await prisma.campOverride.findUnique({
                where: { id: 'camps_catalog_v1' }
            });
            if (record && Array.isArray(record.data) && record.data.length > 0) {
                return NextResponse.json(record.data, { headers: cacheHeaders });
            }
        } catch (err) {
            console.error('Error reading camps from Prisma:', err);
        }
    }
    const camps = campsOverride || getAllCamps();
    return NextResponse.json(camps, { headers: cacheHeaders });
}

// ── POST: Bulk-sync camps catalog (admin only, validated, persists to DB) ──
export async function POST(request) {
    const ip = getClientIp(request);

    const rateLimit = await checkRateLimit(`ratelimit:admin_camps_write:${ip}`, 10, 60);
    if (!rateLimit.allowed) {
        return NextResponse.json({ success: false, message: 'Too many requests. Please wait.' }, { status: 429 });
    }

    if (!getAdminPayload(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        if (!Array.isArray(body)) {
            return NextResponse.json({ success: false, message: 'Expected an array of camps.' }, { status: 400 });
        }
        if (body.length > 100) {
            return NextResponse.json({ success: false, message: 'Camps catalog too large.' }, { status: 400 });
        }

        // Validate every record — reject anything malformed (no partial trust)
        const valid = [];
        for (const camp of body) {
            if (!camp || typeof camp !== 'object') continue;
            const id = String(camp.id || '').trim();
            const title = String(camp.title || '').trim();
            if (!id || id.length > 80 || !title || title.length > 200) {
                return NextResponse.json({ success: false, message: 'Invalid camp record in payload.' }, { status: 400 });
            }
            valid.push(camp);
        }

        campsOverride = valid;

        if (isPrismaConfigured && prisma) {
            try {
                await prisma.campOverride.upsert({
                    where: { id: 'camps_catalog_v1' },
                    create: { id: 'camps_catalog_v1', data: valid },
                    update: { data: valid }
                });
            } catch (dbErr) {
                console.error('Error saving camps to Prisma DB:', dbErr);
            }
        }

        // 2-Way Sync: Forward update to OpenPMS microservice
        const pmsUrl = getPmsBaseUrl();
        try {
            fetch(`${pmsUrl}/api/properties`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-PMS-Tenant-Id': process.env.NEXT_PUBLIC_PMS_TENANT_ID || 't-aanandham-hq',
                    'Authorization': `Bearer ${process.env.PMS_INTERNAL_TOKEN || 'pms_int_aanandham_hq_j4j0yrc1valjk3ajy30chh'}`
                },
                body: JSON.stringify({ properties: valid }),
                signal: AbortSignal.timeout(3000)
            }).catch(() => {});
        } catch (pmsSyncErr) {}

        recordWalMutation({
            entityType: 'CAMPSITE',
            entityId: 'camps_catalog_v1',
            action: 'UPDATE',
            previousState: null,
            newState: { totalCamps: valid.length, campIds: valid.map(c => c.id) },
            actor: getAdminPayload(request)?.campName || 'Admin Coordinator (Master HQ)',
            details: `Synchronized campsite catalog: ${valid.length} camps published (2-way sync active)`,
            request
        });

        return NextResponse.json({ success: true, totalCount: valid.length });
    } catch (err) {
        console.error('Error saving camps:', err);
        logCrash({ source: 'ADMIN_CAMPS', route: 'POST /api/admin/camps', error: err, request });
        return NextResponse.json({ success: false, message: 'Internal server error while saving camps' }, { status: 500 });
    }
}