import React from 'react';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';
import TripPlanner from '@/components/planner/TripPlanner';

export const metadata = {
  title: 'Trip planner — build your Parvati Valley itinerary',
  description:
    'Plan a 2, 3, 5 or 7-day trip to Kasol, Pulga, Kalga, Tosh and Kheerganga. Choose who you’re travelling with and what you love — get a day-by-day route with stays, experiences and an estimate.',
  alternates: { canonical: 'https://www.aanandham.in/plan' },
};

export default function PlanPage() {
  return (
    <>
      <SiteHeader activePage="plan" />
      <main id="main-content">
        <section className="ah-section--dark" style={{ padding: 'calc(var(--ah-header-h) + 56px) 0 48px' }}>
          <div className="ah-container">
            <span className="ah-eyebrow" style={{ color: '#F1B893' }}>Trip planner</span>
            <h1 className="ah-h1" style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', margin: '16px 0', maxWidth: '15ch' }}>
              Build your mountain escape.
            </h1>
            <p style={{ color: 'var(--ah-on-dark-muted)', fontSize: 17, lineHeight: 1.6, maxWidth: 560 }}>
              Tell us how long, who’s coming and what you’re into. Your plan updates as you go — share the link or send
              it to us to book.
            </p>
          </div>
        </section>
        <div className="ah-section" style={{ paddingTop: 40 }}>
          <div className="ah-container">
            <TripPlanner syncUrl />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
