import { NextResponse } from 'next/server';

// ── FALLBACK AUTHENTIC DISPATCHES (Used when no external API key is set) ──
const FALLBACK_DISPATCHES = [
    {
        id: 'post-1',
        title: 'Kolukkumalai Sunrise 4x4',
        subtitle: '7,130 FT Golden Cloud Bed',
        location: 'Kolukkumalai Peak',
        media_url: '/images/high-altitude-4x4-convoy.jpg',
        permalink: 'https://www.instagram.com/aanandham.go/',
        tag: '7,130 FT · KOLUKKUMALAI',
        caption: 'Chasing the first rays of dawn at 7,130 FT above the rolling sea of clouds in Kolukkumalai. 🚙🌅'
    },
    {
        id: 'post-2',
        title: 'Milky Way Ridge Camping',
        subtitle: 'Zero-Light-Pollution Sky',
        location: 'Suryanelli Basecamp',
        media_url: '/images/stargazing-night-skies.jpg',
        permalink: 'https://www.instagram.com/aanandham.go/',
        tag: 'STARLIT RIDGE',
        caption: 'Billions of stars right outside your tent dome. Pure high-altitude night magic with zero city lights. ✨⛺'
    },
    {
        id: 'post-3',
        title: 'Live in High-Altitude Ridge Tent',
        subtitle: 'Grassy Ridge Alpine Stay',
        location: 'Suryanelli Valley',
        media_url: '/images/high-altitude-ridge-tent.jpg',
        permalink: 'https://www.instagram.com/aanandham.go/',
        tag: 'RIDGE TENT',
        caption: 'Alpine tents pitched high on the grassy ridges overlooking misty Western Ghats peaks. 🏔️🌿'
    },
    {
        id: 'post-4',
        title: 'Sunrise Cloud Bed Ridge Trek',
        subtitle: 'Golden Horizon Trail Walk',
        location: 'Phantom Hill, Munnar',
        media_url: '/images/sunrise-cloud-treks.jpg',
        permalink: 'https://www.instagram.com/aanandham.go/',
        tag: 'SUNRISE CLOUD BED',
        caption: 'Standing on the ridge with the morning clouds floating beneath your feet. An unforgettable feeling. 🌄🚶‍♂️'
    },
    {
        id: 'post-5',
        title: 'Munnar Misty Valley & Tea Hills',
        subtitle: 'Cascading Green Slopes',
        location: 'Munnar Hills',
        media_url: '/images/munnar-mist-valley-wide.jpg',
        permalink: 'https://www.instagram.com/aanandham.go/',
        tag: 'TEA HIGHLANDS',
        caption: 'Misty mornings across endless emerald tea slopes. Breathe in the crisp Western Ghats air. 🍃🍵'
    },
    {
        id: 'post-6',
        title: 'Acoustic Campfire & Live BBQ',
        subtitle: 'Warm Embers & Spiced Tea',
        location: 'Basecamp Circle',
        media_url: '/images/acoustic-campfires-bbq.jpg',
        permalink: 'https://www.instagram.com/aanandham.go/',
        tag: 'CAMPFIRE BBQ',
        caption: 'Warm crackling fires, smoking hot barbecue, and acoustic jams under cold 10°C night breezes. 🔥🍢'
    }
];

export async function GET() {
    try {
        const beholdFeedId = process.env.INSTAGRAM_BEHOLD_FEED_ID;
        const metaToken = process.env.INSTAGRAM_ACCESS_TOKEN;

        // 1. If user configured free Behold.so Feed ID
        if (beholdFeedId) {
            try {
                const res = await fetch(`https://feeds.behold.so/${beholdFeedId}`, {
                    next: { revalidate: 3600 } // Cache for 1 hour
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        const posts = data.slice(0, 6).map((post, idx) => ({
                            id: post.id || `behold-${idx}`,
                            title: post.caption ? post.caption.slice(0, 30) + '...' : 'Wilderness Dispatch',
                            subtitle: '@aanandham.go',
                            location: 'Western Ghats',
                            media_url: post.sizes?.medium?.mediaUrl || post.mediaUrl || post.thumbnailUrl,
                            permalink: post.permalink || 'https://www.instagram.com/aanandham.go/',
                            tag: 'LIVE DISPATCH',
                            caption: post.caption || ''
                        }));
                        return NextResponse.json({ success: true, source: 'behold', posts });
                    }
                }
            } catch (err) {
                console.warn('[Instagram API] Behold fetch error, falling back to local dispatches:', err.message);
            }
        }

        // 2. If user configured official Meta Instagram Graph API Token (100% Free)
        if (metaToken) {
            try {
                const res = await fetch(
                    `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${metaToken}`,
                    { next: { revalidate: 3600 } }
                );
                if (res.ok) {
                    const data = await res.json();
                    if (data?.data?.length > 0) {
                        const posts = data.data.slice(0, 6).map((post, idx) => ({
                            id: post.id || `meta-${idx}`,
                            title: post.caption ? post.caption.split('\n')[0].slice(0, 32) : 'Wilderness Dispatch',
                            subtitle: '@aanandham.go',
                            location: 'Western Ghats',
                            media_url: post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url,
                            permalink: post.permalink || 'https://www.instagram.com/aanandham.go/',
                            tag: post.media_type === 'VIDEO' ? 'REEL' : 'PHOTO',
                            caption: post.caption || ''
                        }));
                        return NextResponse.json({ success: true, source: 'meta_graph', posts });
                    }
                }
            } catch (err) {
                console.warn('[Instagram API] Meta Graph fetch error, falling back to local dispatches:', err.message);
            }
        }

        // 3. Seamless Fallback to Curated High-Res Munnar Dispatches
        return NextResponse.json({
            success: true,
            source: 'curated_local',
            posts: FALLBACK_DISPATCHES
        });
    } catch (error) {
        console.error('[Instagram API] Error:', error);
        return NextResponse.json({
            success: true,
            source: 'fallback',
            posts: FALLBACK_DISPATCHES
        });
    }
}
