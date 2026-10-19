import React from 'react';
import CampsDirectoryClient from '../CampsDirectoryClient';
import { INITIAL_ALL_CAMPS } from '@/lib/campsData';

export const metadata = {
  title: 'Top Camps in Munnar (2026) · Best Camp Stays & Tent Glamping | Aanandham.go',
  description:
    'Looking for the best camps in Munnar? Discover top-rated camp stays & ridge glamping across Suryanelli & Kolukkumalai. 4x4 sunrise safari, campfire BBQ & verified luxury tents from ₹1,899.',
  keywords: [
    'best camps in munnar',
    'top camps in munnar',
    'top camp stays in munnar',
    'best camp stays in munnar',
    'best camping in munnar',
    'top 10 camps in munnar',
    'top rated camps in munnar',
    'munnar camping',
    'suryanelli tent stays',
    'kolukkumalai sunrise 4x4 trek',
    'tiger rock camping munnar',
    'meesapulimala basecamp',
    'phantom head ridge glamping',
    'munnar ridge glamping tents',
    'safe couples camping munnar'
  ],
  alternates: {
    canonical: 'https://www.aanandham.in/camps/munnar',
  },
  openGraph: {
    title: 'Top Camps in Munnar (2026) · Best Camp Stays & Ridge Glamping',
    description:
      'Discover the top camps in Munnar. Verified high-altitude campsites in Suryanelli & Kolukkumalai with 4x4 sunrise treks, campfire BBQ & luxury ridge glamping.',
    url: 'https://www.aanandham.in/camps/munnar',
    siteName: 'Aanandham.go',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'Top Camps in Munnar - Best Camp Stays & Tent Glamping',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Top Camps in Munnar · Best Camp Stays',
    description: 'Explore the highest-rated campsites and ridge glamping stays in Munnar & Suryanelli.',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&h=630&q=80'],
  },
};

export default function MunnarCampsPage() {
  const munnarCamps = INITIAL_ALL_CAMPS.filter(c => c.region === 'Munnar' || c.region === 'Suryanelli');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aanandham.in';

  // 1. Google Structured Data: Breadcrumbs
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
        name: 'Top Camps in Munnar',
        item: `${siteUrl}/camps/munnar`,
      },
    ],
  };

  // 2. Google Structured Data: Top Camps ItemList for Carousel / Rich Snippet Ranking
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top Camps in Munnar & Best Camp Stays',
    description: 'Ranked list of verified high-altitude campsites and luxury glamping stays in Munnar.',
    itemListElement: munnarCamps.map((camp, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'LodgingBusiness',
        name: camp.title || camp.name,
        description: camp.description || 'Verified campsite in Munnar with 4x4 safari, campfire BBQ and mountain vistas.',
        url: `${siteUrl}/camps/${camp.id}`,
        image: camp.image ? (camp.image.startsWith('http') ? camp.image : `${siteUrl}${camp.image}`) : undefined,
        priceRange: `₹${camp.price || 1899} - ₹${camp.originalPrice || 4500}`,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: (camp.rating || 4.9).toString(),
          reviewCount: (camp.reviewsCount || 120).toString(),
          bestRating: '5',
          worstRating: '1'
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Munnar',
          addressRegion: 'Kerala',
          addressCountry: 'IN'
        }
      }
    }))
  };

  // 3. Google FAQ Structured Data (FAQ Rich Accordions in SERP)
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Which are the best camps in Munnar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The top-rated camps in Munnar are Kolukkumalai Sunrise Ridge Glamp (7,900 FT), Suryanelli Valley Camping, Meesapulimala Summit Basecamp, and Tentvilla Luxury Glamp. All feature gated perimeters, en-suite or modern washrooms with hot water, 4x4 sunrise safari, and campfire BBQ dinners.'
        }
      },
      {
        '@type': 'Question',
        name: 'How much does a camp stay in Munnar cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Verified camp stays in Munnar start from ₹1,899 to ₹3,899 per person. Most packages include overnight tent/glamp stay, evening campfire with live barbecue, dinner, mountain breakfast, and guided sunrise treks.'
        }
      },
      {
        '@type': 'Question',
        name: 'Which is the top camp for Kolukkumalai sunrise safari?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Kolukkumalai Sunrise Ridge Glamp and Suryanelli Valley Basecamp are the top-rated camps for sunrise access, offering direct 4:30 AM 4x4 Jeep convoy departures to Tiger Rock (7,900 FT) above the cloud bed.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is camping in Munnar safe for couples and solo female travelers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Aanandham verified campsites have private gated perimeters, dedicated male and female coordinators on-site 24/7, zero-tolerance safety protocols, and modern western washrooms with hot water.'
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <CampsDirectoryClient
        initialCamps={munnarCamps}
        initialRegion="Munnar"
        heroBadge="★ TOP 5 VERIFIED CAMPS IN MUNNAR"
        heroTitle={<>Top Camps in Munnar: <span style={{ color: '#D5ED55' }}>Best Camp Stays & Ridge Glamping</span></>}
        heroSubtitle="Ranked #1 for high-altitude wilderness stays. Perched high above rolling cloud beds in Suryanelli, Kolukkumalai & Vattavada (6,000–7,900 FT). Enjoy private 4x4 sunrise summit convoys, starlit campfire barbecues, and premium ridge glamping tents."
      />
    </>
  );
}
