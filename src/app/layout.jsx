import './globals.css';
import './design-system.css';
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import SmoothScroll from '@/components/SmoothScroll';
import GlobalActionHub from '@/components/common/GlobalActionHub';
import PmsAnalyticsTracker from '@/components/common/PmsAnalyticsTracker';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SEO_KEYWORDS, SITE_RATING } from '@/lib/seoKeywords';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aanandham.in';

// Site-wide positioning: Himalaya-first discovery (Pulga, Kasol, Parvati Valley),
// with the live Munnar camps kept as a secondary, still-true signal.
const SITE_TITLE = 'Aanandham.go — Discover Pulga, Kasol & the Parvati Valley';
const SITE_DESCRIPTION =
  'Plan your Himalayan escape to Pulga, Kasol, Kalga, Tosh and Kheerganga — village guides, treks and mountain stays in the Parvati Valley, plus verified camping in Munnar, Kerala.';
const SITE_OG_IMAGE = 'https://images.unsplash.com/photo-1546180801-a9b3dd6ad440?auto=format&fit=crop&w=1200&h=630&q=80';
const SITE_OG_ALT = 'The Parvati river flowing through deodar forest beneath snow-capped Himalayan peaks';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#0B150E',
  colorScheme: 'light dark',
};

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_TITLE,
    template: '%s | Aanandham.go'
  },
  description: SITE_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  authors: [{ name: 'Aanandham.go' }],
  creator: 'Aanandham.go',
  publisher: 'Aanandham.go',
  alternates: {
    canonical: 'https://www.aanandham.in',
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: siteUrl,
    siteName: 'Aanandham.go',
    images: [
      {
        url: SITE_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_OG_ALT,
      },
      {
        url: `${siteUrl}/logo.png`,
        width: 512,
        height: 512,
        alt: 'Aanandham.go Wilderness Camps Logo',
      }
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    creator: '@aanandham_go',
    images: [
      SITE_OG_IMAGE,
      `${siteUrl}/logo.png`
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=2' },
      { url: '/favicon-16x16.png?v=2', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png?v=2', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png?v=2' },
      { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png?v=2' },
    ],
  },
  manifest: '/site.webmanifest?v=2',
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? {
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  } : {}),
};

const SITE_PHONE = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ? `+${process.env.NEXT_PUBLIC_ADMIN_WHATSAPP}` : '+919074858014';
const SAME_AS = [
  'https://www.instagram.com/aanandham.go',
  'https://www.facebook.com/aanandham.go',
  'https://twitter.com/aanandham_go',
  'https://www.linkedin.com/company/aanandhamgo'
];

// Brand entity: a travel platform serving the Parvati Valley (primary) and Munnar.
// No street address here — the only physical site with a verified address is the Munnar basecamp below.
const organizationLd = {
  '@type': 'TravelAgency',
  '@id': `${siteUrl}/#organization`,
  name: 'Aanandham.go',
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  image: SITE_OG_IMAGE,
  description: SITE_DESCRIPTION,
  telephone: SITE_PHONE,
  email: 'bookings@aanandham.in',
  sameAs: SAME_AS,
  areaServed: [
    {
      '@type': 'Place',
      name: 'Parvati Valley, Himachal Pradesh',
      url: `${siteUrl}/destinations/parvati-valley`,
      geo: { '@type': 'GeoCoordinates', latitude: 32.02, longitude: 77.38 }
    },
    { '@type': 'Place', name: 'Pulga, Himachal Pradesh', url: `${siteUrl}/destinations/pulga` },
    { '@type': 'Place', name: 'Kasol, Himachal Pradesh', url: `${siteUrl}/destinations/kasol` },
    { '@type': 'Place', name: 'Munnar, Kerala', url: `${siteUrl}/destinations/munnar` }
  ]
};


// The Munnar basecamp, unchanged apart from its @id: the review rating belongs to this physical site.
const munnarCampgroundLd = {
  '@type': 'Campground',
  name: 'Aanandham.go Wilderness Camps — Munnar',
  image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80',
  logo: `${siteUrl}/logo.png`,
  '@id': `${siteUrl}/#munnar-basecamp`,
  url: `${siteUrl}/destinations/munnar`,
  parentOrganization: { '@id': `${siteUrl}/#organization` },
  telephone: SITE_PHONE,
  email: 'bookings@aanandham.in',
  priceRange: '₹₹',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Kolukkumalai Road, Suryanelli',
    addressLocality: 'Munnar',
    addressRegion: 'Kerala',
    postalCode: '685618',
    addressCountry: 'IN'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 10.0889,
    longitude: 77.0595
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ],
      opens: '06:00',
      closes: '22:00'
    }
  ],
  sameAs: SAME_AS,
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: '4x4 Offroad Mountain Jeep Transfers', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Private Campfire & Live BBQ Platter', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Weatherproof Alpine Dome Tents', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Kolukkumalai Sunrise Guided Ridge Hike', value: true },
    { '@type': 'LocationFeatureSpecification', name: '24/7 Forest Guide & First-Aid Support', value: true }
  ],
  aggregateRating: SITE_RATING,
  additionalType: 'https://schema.org/TouristAttraction'
};

const jsonLd = {
  '@context': 'https://schema.org',
  // The WebSite entity is emitted by the homepage (page.jsx) and references #organization
  '@graph': [organizationLd, munnarCampgroundLd]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${plusJakarta.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
        <link rel="manifest" href="/site.webmanifest?v=2" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Autofill extensions (Edge, LastPass, etc.) inject `fdprocessedid` on buttons/inputs
            before hydration, causing attribute-mismatch warnings. Strip it as soon as it appears. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var A='fdprocessedid';new MutationObserver(function(m){for(var i=0;i<m.length;i++){if(m[i].attributeName===A)m[i].target.removeAttribute(A);}}).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:[A]});})();`,
          }}
        />
      </head>
      <body style={{ fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif', backgroundColor: '#F8FAF9', color: '#202522' }}>
        <SmoothScroll />
        {children}
        <GlobalActionHub />
        <PmsAnalyticsTracker />
        <Analytics />
        <SpeedInsights />

        {/* Google Analytics 4 (GA4) with Non-Blocking Script */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-D7B74EEL0Z'}`}
        />
        <Script
          id="google-analytics-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G-D7B74EEL0Z'}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </body>
    </html>
  );
}

