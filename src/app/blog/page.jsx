import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';
import { BLOG_POSTS } from '@/lib/blogPosts';
import { Star, Sunrise, Flame, Tent, Footprints, Telescope, Leaf, MapPin, Clock } from 'lucide-react';

export const metadata = {
  title: 'Travel guides — Parvati Valley, Kasol & Munnar',
  description: 'Honest, practical guides to the Parvati Valley — the Kheerganga trek, choosing between Kalga, Pulga and Tosh, the best time to visit Kasol — plus camping and trekking in Munnar.',
  alternates: {
    canonical: 'https://www.aanandham.in/blog',
  },
  openGraph: {
    title: 'Travel guides — Parvati Valley, Kasol & Munnar',
    description: 'Honest, practical guides to the Parvati Valley — the Kheerganga trek, choosing between Kalga, Pulga and Tosh, the best time to visit Kasol — plus camping and trekking in Munnar.',
    url: 'https://www.aanandham.in/blog',
    siteName: 'Aanandham.go',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'Aanandham.go travel guides',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

const CATEGORY_ORDER = [
  'Trekking Guides',
  'Camping Guides',
  'Planning Guides',
  'Itineraries',
  'Comparison Guides',
  'Group Travel',
  'Safety & Trust',
];

const MARQUEE_ITEMS = [
  { icon: Star, label: 'FIELD GUIDES FROM THE CAMPSITE FLOOR', highlight: true },
  { icon: Sunrise, label: 'KOLUKKUMALAI SUNRISE TREK TIMINGS' },
  { icon: Tent, label: 'CAMPING PACKING LISTS & GEAR' },
  { icon: Flame, label: 'FARM-TO-CAMPFIRE DINING STORIES', highlight: true },
  { icon: Footprints, label: 'MEESAPULIMALA & PHANTOM HEAD TRAILS' },
  { icon: Telescope, label: 'GLAMPING COMPARISONS & STARGAZING SPOTS', highlight: true },
  { icon: Leaf, label: 'LEAVE-NO-TRACE ECO GUIDES' },
  { icon: Star, label: 'FIELD GUIDES FROM THE CAMPSITE FLOOR', highlight: true },
  { icon: Sunrise, label: 'KOLUKKUMALAI SUNRISE TREK TIMINGS' },
];

export default function BlogIndexPage() {
  const sorted = [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
  const featured = sorted[0];

  return (
    <div style={{ fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif', backgroundColor: '#F8F9F5', color: '#121613', minHeight: '100vh' }}>
      <SiteHeader transparentOnTop={false} activePage="blog" />
      <main id="main-content" style={{ fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif', backgroundColor: '#F8F9F5', color: '#121613', minHeight: '100vh' }}>
        {/* ── HERO: MATCHES CAMPS/ABOUT LANDING DESIGN ── */}
        <section style={{
          background: 'linear-gradient(180deg, #101E13 0%, #0D170F 100%)',
          color: '#FFFFFF',
          padding: 'clamp(115px, 12vw, 150px) clamp(20px, 4vw, 48px) clamp(44px, 6vw, 72px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Ambient Glow */}
          <div style={{
            position: 'absolute',
            top: '-120px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '700px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(213, 237, 85, 0.12) 0%, rgba(16, 30, 19, 0) 70%)',
            pointerEvents: 'none',
            filter: 'blur(60px)'
          }} />

          <div style={{ maxWidth: '1440px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
            <div style={{ maxWidth: '820px' }}>
              <div className="star-badge dark-section" style={{ background: 'rgba(213, 237, 85, 0.15)', color: '#D5ED55', border: '1px solid rgba(213, 237, 85, 0.3)', marginBottom: '16px' }}>
                <span className="star-icon">★</span> The Expedition Journal
              </div>

              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(32px, 5.5vw, 56px)',
                fontWeight: '800',
                letterSpacing: '-0.035em',
                lineHeight: 1.15,
                margin: '0 0 16px',
                color: '#FFFFFF'
              }}>
                Travel guides for <span style={{ color: '#F1B893' }}>the mountains</span>
              </h1>

              <p style={{
                fontSize: 'clamp(15px, 1.8vw, 17px)',
                color: '#A2B6A6',
                lineHeight: 1.7,
                margin: '0 0 28px'
              }}>
                Practical, honest guides to the Parvati Valley — the Kheerganga trek, choosing between Kalga, Pulga and Tosh, when to visit Kasol — plus our field guides to camping and trekking in Munnar.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <Link
                  href="/plan"
                  className="btn-lime"
                  style={{
                    padding: '13px 30px',
                    fontSize: '14.5px',
                    fontWeight: '900',
                    textDecoration: 'none',
                    boxShadow: '0 10px 30px rgba(213, 237, 85, 0.3)'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>Plan your trip →</span>
                </Link>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#A2B6A6', fontWeight: '700' }}>
                  <Clock size={15} /> {BLOG_POSTS.length} field guides · updated {new Date(sorted[0].date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── LIVE BASECAMP MARQUEE TICKER (MATCHES HOME/ABOUT) ── */}
        <div className="marquee-container" aria-hidden="true" style={{ background: '#0B150E', color: '#FFFFFF' }}>
          <div className="marquee-track">
            {MARQUEE_ITEMS.map((item, idx) => (
              <div key={idx} className="marquee-item" style={{ color: item.highlight ? '#E5A93B' : '#FFFFFF' }}>
                <item.icon size={16} strokeWidth={2.4} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── POSTS SECTION ── */}
        <section style={{ position: 'relative', padding: '60px clamp(20px, 4vw, 48px) 90px', maxWidth: '1100px', margin: '0 auto' }}>
          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="blog-card-link"
              style={{ marginBottom: '56px', borderRadius: '20px' }}
            >
              <div className="blog-card-media" style={{ height: '320px' }}>
                <img src={featured.image} alt={featured.imageAlt} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', top: '14px', left: '14px', background: '#D5ED55', color: '#121613', fontSize: '10.5px', fontWeight: '900', letterSpacing: '0.5px', textTransform: 'uppercase', padding: '5px 10px', borderRadius: '6px' }}>
                  Latest Field Guide
                </span>
              </div>
              <div style={{ padding: '26px 28px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                  {featured.category} · {featured.readMinutes} min read
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: '800', margin: '0 0 10px', color: '#121613', letterSpacing: '-0.01em', lineHeight: 1.15 }}>
                  {featured.title}
                </h2>
                <p style={{ fontSize: '14.5px', lineHeight: 1.65, color: '#59655D', margin: '0' }}>{featured.excerpt}</p>
              </div>
            </Link>
          )}

          <div className="blog-cards-grid">
            {sorted.slice(1).map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="blog-card-link"
              >
                <div className="blog-card-media" style={{ height: '190px' }}>
                  <img src={post.image} alt={post.imageAlt} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    {post.category} · {post.readMinutes} min read
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '800', margin: '0', color: '#121613', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
                    {post.title}
                  </h3>
                  <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: '#59655D', margin: '0' }}>{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ marginTop: '64px', borderTop: '1px solid rgba(18,22,19,0.1)', paddingTop: '36px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {CATEGORY_ORDER.map((cat) => (
              <span key={cat} style={{ fontSize: '11.5px', fontWeight: '800', color: '#59655D', background: '#FFFFFF', border: '1px solid rgba(18,22,19,0.1)', padding: '7px 14px', borderRadius: '999px' }}>
                {cat}
              </span>
            ))}
          </div>

          <div style={{ marginTop: '48px', background: '#121613', borderRadius: '20px', padding: '32px 36px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '18px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 6px' }}>
                Ready to book the real thing?
              </div>
              <p style={{ fontSize: '14px', color: '#A2B6A6', margin: '0' }}>Pick a campsite, lock your dates, and we handle the rest.</p>
            </div>
            <Link href="/camps" className="btn-lime" style={{ padding: '13px 28px', fontSize: '14px', fontWeight: '900', textDecoration: 'none', borderRadius: '999px' }}>
              Browse Camps →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}