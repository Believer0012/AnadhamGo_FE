export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aanandham.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/destinations', '/destinations/*', '/stays', '/plan', '/events', '/workation', '/llms.txt', '/llms-full.txt'],
        disallow: ['/admin', '/api/', '/login', '/signup', '/pass/', '/wishlist'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended'],
        allow: ['/', '/camps', '/camps/*', '/destinations', '/destinations/*', '/stays', '/plan', '/events', '/workation', '/about', '/contact', '/llms.txt', '/llms-full.txt'],
        disallow: ['/admin', '/api/', '/login', '/signup', '/pass/', '/wishlist'],
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
