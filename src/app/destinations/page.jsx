import React from 'react';
import DestinationsDirectoryClient from './DestinationsDirectoryClient';
import { getVisibleDestinations } from '@/lib/destinationsData';

export const metadata = {
  title: 'Destinations — Pulga, Kasol & the Parvati Valley',
  description:
    'Explore Pulga, Kasol, Kalga, Tosh, Kheerganga and the Parvati Valley in Himachal, plus the Munnar camps you can book with Aanandham.go today.',
  alternates: {
    canonical: 'https://www.aanandham.in/destinations',
  },
  openGraph: {
    title: 'Destinations — Pulga, Kasol & the Parvati Valley',
    description: 'Villages, trails and river towns across the Parvati Valley, plus Munnar camps open to book today.',
    url: 'https://www.aanandham.in/destinations',
    siteName: 'Aanandham.go',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function DestinationsPage() {
  const destinations = getVisibleDestinations();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Aanandham.go Destinations',
    itemListElement: destinations.map((d, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'TouristDestination',
        name: d.name,
        url: `https://www.aanandham.in/destinations/${d.slug}`,
        image: d.heroImage,
        description: d.shortDesc,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DestinationsDirectoryClient destinations={destinations} />
    </>
  );
}
