import React from 'react';
import CampsDirectoryClient from './CampsDirectoryClient';
import { INITIAL_ALL_CAMPS } from '@/lib/campsData';

export const metadata = {
  title: 'Wilderness Campsites & Tent Stays in Kerala',
  description:
    'Explore verified high-altitude campsites in Munnar, Suryanelli, Vagamon & Wayanad with 4x4 sunrise treks & campfire BBQ. Book with Aanandham.go.',
  keywords: [
    'Kerala Campsites',
    'Munnar Tent Stays',
    'Suryanelli Camping',
    'Vagamon Pine Glamping',
    'Wayanad Forest Camps',
    'Kolukkumalai Tent Booking',
    'High-Altitude Ridge Pods Kerala',
    'Safe Campsites for Couples'
  ],
  alternates: {
    canonical: 'https://www.aanandham.in/camps',
  },
  openGraph: {
    title: 'Wilderness Campsites & Tent Stays in Kerala',
    description:
      'Explore verified high-altitude campsites in Munnar, Suryanelli, Vagamon & Wayanad with 4x4 sunrise treks & campfire BBQ.',
    url: 'https://www.aanandham.in/camps',
    siteName: 'Aanandham.go',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'Aanandham.go High-Altitude Campsites Directory',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wilderness Campsites & Tent Stays in Kerala',
    description: 'Explore verified high-altitude campgrounds in Munnar, Suryanelli, Vagamon and Wayanad.',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&h=630&q=80'],
  },
};

export default function CampsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Aanandham.go Verified Kerala Wilderness Campsites',
    description: 'Verified high-altitude camping, tent stays, and ridge dome glamping sites in Kerala.',
    itemListElement: INITIAL_ALL_CAMPS.map((camp, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Campground',
        name: camp.title,
        url: `https://aanandham.in/camps/${camp.id}`,
        image: camp.image,
        description: camp.description,
        address: {
          '@type': 'PostalAddress',
          addressLocality: camp.region || 'Munnar',
          addressRegion: 'Kerala',
          addressCountry: 'IN',
        },
        priceRange: `₹${camp.price}`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CampsDirectoryClient initialCamps={INITIAL_ALL_CAMPS} />
    </>
  );
}
