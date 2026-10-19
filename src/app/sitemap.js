import { INITIAL_ALL_CAMPS } from '@/lib/campsData';
import { getAllBlogSlugs } from '@/lib/blogPosts';
import { getVisibleDestinations } from '@/lib/destinationsData';

export default function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aanandham.in';
  const currentDate = new Date().toISOString();

  // Primary Money Pages & Core Landing Routes
  const staticRoutes = [
    {
      url: `${siteUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/camps`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${siteUrl}/camps/munnar`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/camps/wayanad`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/events`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${siteUrl}/workation`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/plan`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/stays`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/destinations`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Dynamic Campsite Detail Booking Pages (High Priority)
  const campRoutes = INITIAL_ALL_CAMPS.map((camp) => ({
    url: `${siteUrl}/camps/${camp.id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // Blog posts — the long-tail keyword engine (weekly crawl, mid priority)
  const blogRoutes = getAllBlogSlugs().map((slug) => ({
    url: `${siteUrl}/blog/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Destination hub pages: live + Parvati Valley (primary focus) rank highest. Demo destinations are excluded —
  // getVisibleDestinations() only includes them when the demo flag is on)
  const destinationRoutes = getVisibleDestinations().map((destination) => ({
    url: `${siteUrl}/destinations/${destination.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: destination.status === 'live' || destination.group === 'himalaya' ? 0.85 : 0.5,
  }));

  // Note: /login, /signup, /admin are omitted from sitemap to prevent crawl budget dilution
  return [...staticRoutes, ...campRoutes, ...blogRoutes, ...destinationRoutes];
}
