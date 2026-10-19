// SEO metadata for /services — lives in layout so client page can use 'use client'
export const metadata = {
  title: 'Services & Studio — Aanandham × OpenZen',
  description: 'High-altitude mountain sanctuaries, 4x4 sunrise safaris, and production software engineering. OpenZen tech division and Aanandham creative studio under one roof.',
  keywords: [
    'Aanandham services', 'OpenZen', 'Aanandham Studio', 'Kolukkumalai sunrise 4x4 jeep safari',
    'Munnar camping packages', 'custom software development Kerala', 'Next.js agency India',
    'hospitality PMS', 'Suryanelli glamping dome', 'Meesapulimala trek permit', 'drone cinematography Kerala'
  ],
  alternates: {
    canonical: 'https://www.aanandham.in/services'
  },
  openGraph: {
    title: 'Services & Studio — Aanandham × OpenZen',
    description: 'High-altitude mountain sanctuaries, 4x4 sunrise safaris, and production software engineering. Explore our full ecosystem.',
    url: 'https://www.aanandham.in/services',
    siteName: 'Aanandham.go',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Aanandham × OpenZen — Services & Studio'
      }
    ],
    locale: 'en_IN',
    type: 'website'
  }
};

export default function ServicesLayout({ children }) {
  return children;
}