import React from 'react';
import { INITIAL_ALL_CAMPS, getCampById, getAllCamps } from '../../../lib/campsData';
import CampPropertyDetailClient from './CampPropertyDetailClient';

export async function generateStaticParams() {
    return INITIAL_ALL_CAMPS.map(camp => ({
        id: camp.id
    }));
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    const camp = getCampById(id) || INITIAL_ALL_CAMPS.find(c => c.id === id);

    if (!camp) {
        return {
            title: 'Wilderness Sanctuary Not Found | Aanandham.go',
            description: 'The requested Kerala mountain campsite or offroad sanctuary was not found.',
            robots: { index: false, follow: false }
        };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aanandham.in';
    const ogImage = camp.image ? (camp.image.startsWith('http') ? camp.image : `${siteUrl}${camp.image}`) : `${siteUrl}/logo.png`;
    const cleanTitle = `${camp.shortTitle || camp.title} (${camp.altitude || 'Kerala'})`;
    const cleanDesc = `Book ${camp.shortTitle || camp.title} at ${camp.altitude || 'Western Ghats'} in ${camp.location}. 4x4 jeep safari, campfire BBQ & tent stays with Aanandham.go.`;

    return {
        title: cleanTitle,
        description: cleanDesc,
        alternates: {
            canonical: `${siteUrl}/camps/${camp.id}`
        },
        openGraph: {
            title: cleanTitle,
            description: cleanDesc,
            url: `${siteUrl}/camps/${camp.id}`,
            siteName: 'Aanandham.go',
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: camp.title
                }
            ],
            type: 'website'
        },
        twitter: {
            card: 'summary_large_image',
            title: cleanTitle,
            description: cleanDesc,
            images: [ogImage]
        }
    };
}

export default async function CampPropertyDetailPage({ params }) {
    const { id } = await params;
    const camp = getCampById(id) || INITIAL_ALL_CAMPS.find(c => c.id === id);
    const allCamps = getAllCamps();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aanandham.in';

    const campJsonLd = camp ? {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "LodgingBusiness",
                "@id": `${siteUrl}/camps/${camp.id}#lodging`,
                "name": camp.title,
                "description": camp.description,
                "image": camp.image ? (camp.image.startsWith('http') ? camp.image : `${siteUrl}${camp.image}`) : undefined,
                "url": `${siteUrl}/camps/${camp.id}`,
                "telephone": "+919074858014",
                "priceRange": `₹${camp.price || 1800}`,
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": camp.region || "Munnar",
                    "addressRegion": "Kerala",
                    "addressCountry": "IN"
                },
                "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": 10.0889,
                    "longitude": 77.0595
                },
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": (camp.rating || 4.95).toString(),
                    "reviewCount": (camp.reviewsCount || 120).toString(),
                    "bestRating": "5",
                    "worstRating": "1"
                },
                "offers": {
                    "@type": "Offer",
                    "price": camp.price || 1800,
                    "priceCurrency": "INR",
                    "priceValidUntil": "2027-12-31",
                    "availability": "https://schema.org/InStock",
                    "url": `${siteUrl}/camps/${camp.id}`
                }
            },
            {
                "@type": "BreadcrumbList",
                "@id": `${siteUrl}/camps/${camp.id}#breadcrumb`,
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": siteUrl
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Camps",
                        "item": `${siteUrl}/camps`
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": camp.shortTitle || camp.title,
                        "item": `${siteUrl}/camps/${camp.id}`
                    }
                ]
            }
        ]
    } : null;

    return (
        <>
            {campJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(campJsonLd) }}
                />
            )}
            <CampPropertyDetailClient campId={id} initialCamp={camp} initialAllCamps={allCamps} />
        </>
    );
}
