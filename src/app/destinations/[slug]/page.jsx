import React from 'react';
import { notFound } from 'next/navigation';
import DestinationDetailClient from './DestinationDetailClient';
import { getAllDestinationSlugs, getDestinationBySlug, getCampsForDestination } from '@/lib/destinationsData';
import { getAllCamps } from '@/lib/campsData';

// Demo destinations are never statically generated; when the demo flag is off
// at build time this also blocks them from being rendered on-demand, so a
// direct visit to a gated slug 404s instead of silently rendering.
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllDestinationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const destination = getDestinationBySlug(slug);

  if (!destination) {
    return {
      title: 'Destination Not Found | Aanandham.go',
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aanandham.in';
  const title = destination.area ? `${destination.name} — ${destination.area}` : destination.name;
  const description = destination.shortDesc;

  return {
    title,
    description,
    robots: destination.status === 'demo' ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: `${siteUrl}/destinations/${destination.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/destinations/${destination.slug}`,
      siteName: 'Aanandham.go',
      images: [{ url: destination.heroImage, width: 1200, height: 630, alt: destination.name }],
      locale: 'en_IN',
      type: 'website',
    },
  };
}

export default async function DestinationDetailPage({ params }) {
  const { slug } = await params;
  const destination = getDestinationBySlug(slug);

  if (!destination) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aanandham.in';
  // Seed list for the static render; the client re-syncs with admin-managed camps
  const camps = getCampsForDestination(destination, getAllCamps());

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TouristDestination',
        '@id': `${siteUrl}/destinations/${destination.slug}#destination`,
        name: destination.name,
        description: destination.shortDesc,
        image: destination.heroImage,
        url: `${siteUrl}/destinations/${destination.slug}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Destinations', item: `${siteUrl}/destinations` },
          { '@type': 'ListItem', position: 3, name: destination.name, item: `${siteUrl}/destinations/${destination.slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DestinationDetailClient destination={destination} camps={camps} />
    </>
  );
}
