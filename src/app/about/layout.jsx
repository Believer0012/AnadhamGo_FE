export const metadata = {
  title: 'About Us',
  description: 'The story behind Aanandham.go. High-altitude ridge glamping, 4x4 sunrise expeditions, and certified mountain pathfinders in Munnar, Kerala.',
  alternates: {
    canonical: 'https://www.aanandham.in/about',
  },
  openGraph: {
    title: 'About Us',
    description: 'Meet certified pathfinders and explore high-altitude ridge camping across Munnar, Suryanelli, and Kerala Western Ghats.',
    url: 'https://www.aanandham.in/about',
    siteName: 'Aanandham.go',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'About Aanandham.go High-Altitude Camps & Team',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us',
    description: 'Meet certified pathfinders and explore high-altitude tea estate ridge stays in Kerala.',
    creator: '@aanandham_go',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&h=630&q=80'],
  }
};

export default function AboutLayout({ children }) {
  return children;
}
