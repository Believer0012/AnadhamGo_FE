import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';
import { BLOG_POSTS, getBlogPost, getAllBlogSlugs } from '@/lib/blogPosts';
import { Clock, CalendarDays, MapPin, ArrowRight } from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aanandham.in';

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.keywords,
    alternates: {
      canonical: `${siteUrl}/blog/${post.slug}`,
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: `${siteUrl}/blog/${post.slug}`,
      siteName: 'Aanandham.go',
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.imageAlt,
        },
      ],
      locale: 'en_IN',
      type: 'article',
      publishedTime: post.date,
      authors: ['Aanandham.go'],
      tags: post.keywords.slice(0, 6),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.metaDescription,
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    image: post.image,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'Aanandham.go', url: siteUrl },
    publisher: { '@type': 'Organization', name: 'Aanandham.go', logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.png` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/blog/${post.slug}` },
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${siteUrl}/blog/${post.slug}` },
    ],
  };

  const related = [...BLOG_POSTS]
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 3);

  return (
    <div style={{ fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif', backgroundColor: '#F8F9F5', color: '#121613', minHeight: '100vh' }}>
      <SiteHeader transparentOnTop={false} activePage="blog" />
      <main id="main-content" style={{ fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif', backgroundColor: '#F8F9F5', color: '#121613', minHeight: '100vh' }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

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
            <div style={{ maxWidth: '860px' }}>
              <div className="star-badge dark-section" style={{ background: 'rgba(213, 237, 85, 0.15)', color: '#D5ED55', border: '1px solid rgba(213, 237, 85, 0.3)', marginBottom: '16px' }}>
                <span className="star-icon">★</span> Field Guide · {post.category}
              </div>

              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(30px, 4.5vw, 48px)',
                fontWeight: '800',
                letterSpacing: '-0.035em',
                lineHeight: 1.12,
                margin: '0 0 16px',
                color: '#FFFFFF'
              }}>
                {post.title}
              </h1>

              <p style={{
                fontSize: 'clamp(15px, 1.8vw, 17px)',
                color: '#A2B6A6',
                lineHeight: 1.7,
                margin: '0 0 24px'
              }}>
                {post.excerpt}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#A2B6A6', fontWeight: '700' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                  <CalendarDays size={15} color="#D5ED55" />
                  {new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                  <Clock size={15} color="#D5ED55" />
                  {post.readMinutes} min read
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                  <MapPin size={15} color="#D5ED55" />
                  {post.region === 'himalaya' ? 'Parvati Valley, Himachal' : 'Munnar, Kerala'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── ARTICLE BODY ── */}
        <section style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(40px, 6vw, 64px) clamp(20px, 4vw, 48px) 0' }}>
          <div style={{ position: 'relative', height: 'clamp(260px, 40vw, 440px)', overflow: 'hidden', borderRadius: '20px', marginBottom: '40px' }}>
            <img src={post.image} alt={post.imageAlt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {post.sections.map((sec, i) => (
            <div key={i} style={{ marginBottom: '36px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(21px, 2.6vw, 27px)', fontWeight: '800', margin: '0 0 14px', color: '#121613', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                {sec.h2}
              </h2>
              {(sec.paragraphs || []).map((p, j) => (
                <p key={j} style={{ fontSize: '15.5px', lineHeight: 1.75, color: '#2A312C', margin: '0 0 16px' }}>
                  {p}
                </p>
              ))}
              {sec.lists && (
                <ul style={{ margin: '0 0 16px', paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sec.lists.map((li, k) => (
                    <li key={k} style={{ fontSize: '15px', lineHeight: 1.6, color: '#2A312C' }}>{li}</li>
                  ))}
                </ul>
              )}
              {sec.internalLinks && (
                <div style={{ background: '#FFFFFF', border: '1px solid rgba(18,22,19,0.1)', borderRadius: '14px', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '18px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#166534', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {post.region === 'himalaya' ? 'Related' : 'Related Camps'}
                  </div>
                  {sec.internalLinks.map((link, k) => (
                    <Link key={k} href={link.href} style={{ color: '#166534', fontWeight: '800', fontSize: '14.5px', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                      {link.text} →
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {post.faq.length > 0 && (
            <div style={{ background: '#FFFFFF', border: '1px solid rgba(18,22,19,0.1)', borderRadius: '20px', padding: '28px 30px', marginBottom: '48px' }}>
              <div className="star-badge" style={{ marginBottom: '12px' }}>
                <span className="star-icon">?</span> Reader Questions
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '800', margin: '0 0 18px', color: '#121613' }}>
                Frequently Asked Questions
              </h2>
              {post.faq.map((f, i) => (
                <div key={i} style={{ padding: '16px 0', borderBottom: i < post.faq.length - 1 ? '1px solid rgba(18,22,19,0.08)' : 'none' }}>
                  <h3 style={{ fontSize: '15.5px', fontWeight: '800', color: '#121613', margin: '0 0 8px' }}>{f.q}</h3>
                  <p style={{ fontSize: '14.5px', lineHeight: 1.7, color: '#59655D', margin: '0' }}>{f.a}</p>
                </div>
              ))}
            </div>
          )}

          <div style={{ background: '#121613', borderRadius: '20px', padding: '30px 34px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '70px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 4px' }}>
                Ready to book this trip?
              </div>
              <p style={{ fontSize: '13.5px', color: '#A2B6A6', margin: '0' }}>
                {post.region === 'himalaya'
                  ? 'Build a day-by-day plan for the valley and send it to us to book.'
                  : 'Verified camps, real coordinators, no-surprise pricing.'}
              </p>
            </div>
            {post.region === 'himalaya' ? (
              <Link href="/plan" className="btn-lime" style={{ padding: '13px 28px', fontSize: '14px', fontWeight: '900', textDecoration: 'none', borderRadius: '999px' }}>
                Plan this trip →
              </Link>
            ) : (
              <Link href="/camps" className="btn-lime" style={{ padding: '13px 28px', fontSize: '14px', fontWeight: '900', textDecoration: 'none', borderRadius: '999px' }}>
                Browse Camps →
              </Link>
            )}
          </div>
        </section>

        {/* ── MORE FIELD GUIDES ── */}
        <section style={{ padding: '0 clamp(20px, 4vw, 48px) 90px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: '800', margin: '0', color: '#121613', letterSpacing: '-0.02em' }}>
              More <span style={{ color: '#e5a93b' }}>Field Guides</span>
            </h2>
            <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: '800', color: '#166534', textDecoration: 'none' }}>
              View all guides <ArrowRight size={15} />
            </Link>
          </div>

          <div className="blog-cards-grid">
            {related.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="blog-card-link">
                <div className="blog-card-media" style={{ height: '190px' }}>
                  <img src={p.image} alt={p.imageAlt} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    {p.category} · {p.readMinutes} min read
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '800', margin: '0', color: '#121613', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: '#59655D', margin: '0' }}>{p.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}