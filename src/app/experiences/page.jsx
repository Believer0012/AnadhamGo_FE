import React, { Suspense } from 'react';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';
import { StayCardSkeleton } from '@/components/common/StayCard';
import ExperiencesDiscoveryClient from './ExperiencesDiscoveryClient';
import { REAL_EXPERIENCES } from '@/lib/experiences';

export const metadata = {
  title: 'Experiences — treks, walks & nights under the stars in the Parvati Valley',
  description:
    'Kheerganga trek, Pulga forest walks, village walks in Tosh, stargazing in Kalga and Himachali cooking in Kasol — guided experiences in the Parvati Valley.',
  alternates: { canonical: 'https://www.aanandham.in/experiences' },
  // Keep out of search results until real (non-sample) experiences exist
  ...(REAL_EXPERIENCES.length === 0 ? { robots: { index: false, follow: true } } : {}),
};

function Fallback() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 270px), 1fr))', gap: 20, marginTop: 120 }}>
      {Array.from({ length: 8 }, (_, i) => <StayCardSkeleton key={i} />)}
    </div>
  );
}

export default function ExperiencesPage() {
  return (
    <>
      <SiteHeader activePage="experiences" />
      <main id="main-content">
        <section className="ah-section--dark" style={{ padding: 'calc(var(--ah-header-h) + 56px) 0 48px' }}>
          <div className="ah-container">
            <span className="ah-eyebrow" style={{ color: '#F1B893' }}>Experiences</span>
            <h1 className="ah-h1" style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', margin: '16px 0', maxWidth: '16ch' }}>
              Do more than just visit.
            </h1>
            <p style={{ color: 'var(--ah-on-dark-muted)', fontSize: 17, lineHeight: 1.6, maxWidth: 560 }}>
              Treks, forest walks, village life, food and nights under the stars — with people who know the valley.
            </p>
          </div>
        </section>
        <div className="ah-section" style={{ paddingTop: 36 }}>
          <div className="ah-container">
            <Suspense fallback={<Fallback />}>
              <ExperiencesDiscoveryClient />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
