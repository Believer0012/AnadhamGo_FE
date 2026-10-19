import { NextResponse } from 'next/server';
import { getAllCamps } from '@/lib/campsData';

// ── GET: GeoJSON FeatureCollection & Bounding-Box Viewport Search ──
// Endpoint: /api/camps/geojson?bbox=minLng,minLat,maxLng,maxLat
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const bboxParam = searchParams.get('bbox'); // minLng,minLat,maxLng,maxLat

    const camps = getAllCamps();
    let filteredCamps = camps;

    if (bboxParam) {
        const [minLng, minLat, maxLng, maxLat] = bboxParam.split(',').map(Number);
        
        if (!isNaN(minLng) && !isNaN(minLat) && !isNaN(maxLng) && !isNaN(maxLat)) {
            filteredCamps = camps.filter(camp => {
                const lat = camp.coordinates?.lat || 10.0889;
                const lng = camp.coordinates?.lng || 77.0595;
                return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
            });
        }
    }

    const geoJson = {
        type: 'FeatureCollection',
        features: filteredCamps.map(camp => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [
                    camp.coordinates?.lng || 77.0595,
                    camp.coordinates?.lat || 10.0889
                ]
            },
            properties: {
                id: camp.id,
                title: camp.title,
                region: camp.region || 'Munnar',
                altitude: camp.altitude || '7,900 FT',
                startingPrice: camp.startingPrice || 1899,
                rating: camp.rating || 4.9,
                reviewsCount: camp.reviewsCount || 120,
                image: camp.image,
                badge: camp.badge || 'Verified Sanctuary',
                slug: `/camps/${camp.id}`
            }
        }))
    };

    return NextResponse.json(geoJson, {
        headers: {
            'Content-Type': 'application/geo+json',
            'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
        }
    });
}
