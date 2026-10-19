import React from 'react';
import CampsDirectoryClient from '../CampsDirectoryClient';
import { INITIAL_ALL_CAMPS } from '@/lib/campsData';

export const metadata = {
  title: 'Vagamon Pine Forest Glamping & Stays',
  description:
    'Book secluded pine valley dome glamping & offroad jeep camping in Vagamon, Kerala. Private stream treks & live campfire BBQ with Aanandham.go.',
  keywords: [
    'Vagamon Camping',
    'Vagamon Pine Forest Glamping',
    'Vagamon Dome Stays',
    'Vagamon Offroad Camp',
    'Vagamon Weekend Stays',
    'Couples Glamping Vagamon'
  ],
  alternates: {
    canonical: 'https://www.aanandham.in/camps/vagamon',
  },
  openGraph: {
    title: 'Vagamon Pine Forest Glamping & Stays',
    description:
      'Book secluded pine valley dome glamping & offroad jeep camping in Vagamon, Kerala with Aanandham.go.',
    url: 'https://www.aanandham.in/camps/vagamon',
    siteName: 'Aanandham.go',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'Vagamon Pine Forest Glamping & Mountain Dome Stays',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vagamon Pine Forest Glamping & Stays',
    description: 'Book secluded pine valley dome glamping in Vagamon, Kerala.',
    images: ['https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&h=630&q=80'],
  },
};

export default function VagamonCampsPage() {
  const vagamonCamps = INITIAL_ALL_CAMPS.filter(c => c.region === 'Vagamon');
  const displayCamps = vagamonCamps.length > 0 ? vagamonCamps : INITIAL_ALL_CAMPS;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aanandham.in';

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Camps',
        item: `${siteUrl}/camps`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Vagamon',
        item: `${siteUrl}/camps/vagamon`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CampsDirectoryClient
        initialCamps={displayCamps}
        initialRegion={vagamonCamps.length > 0 ? 'Vagamon' : 'All'}
        heroBadge="★ SECLUDED PINE VALLEY"
        heroTitle={<>Vagamon Pine Forest <span style={{ color: '#D5ED55' }}>Glamping & Stays</span></>}
        heroSubtitle="Tucked away in the whispering pine groves of Vagamon (3,800 FT). Enjoy misty valley walks, private stream trails, and cozy alpine campfire nights."
      />
    </>
  );
}
