import React from 'react';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';
import EventsClient from './EventsClient';

export const metadata = {
  title: 'Events — music nights, stargazing & weekend camps',
  description: 'Upcoming music nights, full-moon stargazing, weekend camps, treks and retreats in the Parvati Valley and Munnar.',
  alternates: { canonical: 'https://www.aanandham.in/events' },
};

export default function EventsPage() {
  return (
    <>
      <SiteHeader activePage="events" />
      <main id="main-content">
        <section className="ah-section--dark" style={{ padding: 'calc(var(--ah-header-h) + 56px) 0 48px' }}>
          <div className="ah-container">
            <span className="ah-eyebrow" style={{ color: '#F1B893' }}>Events</span>
            <h1 className="ah-h1" style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', margin: '16px 0', maxWidth: '16ch' }}>
              Nights worth staying up for.
            </h1>
            <p style={{ color: 'var(--ah-on-dark-muted)', fontSize: 17, lineHeight: 1.6, maxWidth: 560 }}>
              Music around the fire, full-moon skies, weekend camps and slow retreats — join in, or come alone and leave
              with friends.
            </p>
          </div>
        </section>
        <div className="ah-section" style={{ paddingTop: 40 }}>
          <div className="ah-container">
            <EventsClient />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
