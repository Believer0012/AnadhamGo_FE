export const metadata = {
  title: 'Contact & Reservations',
  description: 'Connect with Aanandham.go coordinators. 24/7 WhatsApp concierge, instant booking reservations, and GPS directions to Suryanelli Ridge, Munnar.',
  alternates: {
    canonical: 'https://www.aanandham.in/contact',
  },
  openGraph: {
    title: 'Contact & Reservations',
    description: 'Instant WhatsApp booking support, trail coordinates, and direct camp reservations for Munnar & Western Ghats glamping.',
    url: 'https://www.aanandham.in/contact',
    siteName: 'Aanandham.go',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'Contact Aanandham.go Wilderness Basecamp Concierge',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact & Reservations',
    description: 'Instant WhatsApp booking support, trail coordinates, and campsite reservations.',
    creator: '@aanandham_go',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&h=630&q=80'],
  }
};

export default function ContactLayout({ children }) {
  return children;
}
