import React, { Suspense } from 'react';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';
import { StayCardSkeleton } from '@/components/common/StayCard';
import StaysDiscoveryClient from './StaysDiscoveryClient';

export const metadata = {
  title: 'Stays — cabins, camps & homestays in the Parvati Valley',
  description:
    'Find wooden cabins, riverside camps, glamping domes and village homestays in Pulga, Kasol, Kalga and Tosh — plus verified camps in Munnar, Kerala.',
  alternates: { canonical: 'https://www.aanandham.in/stays' },
};

function StaysFallback() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 270px), 1fr))', gap: 20, marginTop: 120 }}>
      {Array.from({ length: 8 }, (_, i) => <StayCardSkeleton key={i} />)}
    </div>
  );
}

export default function StaysPage() {
  return (
    <>
      <SiteHeader activePage="camps" />
      <main id="main-content">
        <section className="ah-section--dark" style={{ padding: 'calc(var(--ah-header-h) + 56px) 0 48px' }}>
          <div className="ah-container">
            <span className="ah-eyebrow" style={{ color: '#F1B893' }}>Stays</span>
            <h1 className="ah-h1" style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', margin: '16px 0', maxWidth: '15ch' }}>
              Sleep closer to the mountains.
            </h1>
            <p style={{ color: 'var(--ah-on-dark-muted)', fontSize: 17, lineHeight: 1.6, maxWidth: 560 }}>
              Wooden cabins in the deodars, riverside camps, glamping domes and village homestays across the Parvati
              Valley.
            </p>
          </div>
        </section>
        <div className="ah-section" style={{ paddingTop: 36 }}>
          <div className="ah-container">
            {/* Filters read the URL, so the list renders client-side inside this boundary */}
            <Suspense fallback={<StaysFallback />}>
              <StaysDiscoveryClient />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
