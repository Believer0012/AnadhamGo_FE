/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(), geolocation=(), accelerometer=(self "https://api.razorpay.com" "https://checkout.razorpay.com" "https://*.razorpay.com"), gyroscope=(self "https://api.razorpay.com" "https://checkout.razorpay.com" "https://*.razorpay.com")',
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin-allow-popups',
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self';",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.razorpay.com https://*.hcaptcha.com https://*.px-cloud.net https://cdnjs.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live https://*.vercel.live https://va.vercel-scripts.com https://*.vercel-scripts.com;",
      "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://vercel.live;",
      "img-src 'self' data: blob: https://*.razorpay.com https://*.hcaptcha.com https://images.unsplash.com https://*.unsplash.com https://*.supabase.co https://encrypted-tbn0.gstatic.com https://*.gstatic.com https://*.googleusercontent.com https://aanandham.in https://*.aanandham.in https://www.google-analytics.com https://www.googletagmanager.com https://vercel.live https://vercel.com https://assets.vercel.com;",
      "font-src 'self' data: https://cdnjs.cloudflare.com https://assets.vercel.com;",
      "connect-src 'self' https://aanandham-pms.onrender.com https://*.onrender.com https://pms.aanandham.in https://api.razorpay.com https://*.razorpay.com https://checkout.razorpay.com https://lumberjack.razorpay.com https://*.px-cloud.net https://*.hcaptcha.com https://*.supabase.co https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://vercel.live https://*.vercel.live wss://*.vercel.live https://va.vercel-scripts.com https://*.vercel-scripts.com https://*.vercel-insights.com https://vitals.vercel-insights.com;",
      "frame-src 'self' https://aanandham-pms.onrender.com https://*.onrender.com https://pms.aanandham.in https://api.razorpay.com https://*.razorpay.com https://checkout.razorpay.com https://*.hcaptcha.com https://hcaptcha.com https://*.cardinalcommerce.com https://*.juspay.in https://vercel.live https://*.vercel.live;",
      "frame-ancestors 'none';",
      "form-action 'self' https://wa.me https://api.whatsapp.com;",
      "base-uri 'self';",
      "object-src 'none';",
    ].join(' ').replace(/\s{2,}/g, ' ').trim(),
  },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: '*.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/hotels',
        destination: '/camps',
        permanent: true,
      },
      {
        source: '/places',
        destination: '/camps',
        permanent: true,
      },
      {
        source: '/stories/munnar-tent-stay',
        destination: '/camps/pkg-suryanelli',
        permanent: true,
      },
      {
        source: '/stories/vagamon-glamping',
        destination: '/camps/pkg-vagamon-glamp',
        permanent: true,
      },
      {
        source: '/stories/wayanad-camping-guide',
        destination: '/camps/pkg-wayanad-forest',
        permanent: true,
      },
      {
        source: '/stories/strangers-camp',
        destination: '/camps/pkg-meesapulimala',
        permanent: true,
      },
      {
        source: '/stories/solo-trekking-safety',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/stories',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/stories/:slug*',
        destination: '/camps',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Cache static images, fonts and icons aggressively
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:file(logo\\.png|logo-dark\\.png|logo-white\\.png|favicon.*|android-chrome.*|apple-touch-icon.*|site\\.webmanifest)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Apply security headers across all application routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
