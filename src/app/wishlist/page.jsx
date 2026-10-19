import React from 'react';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';
import WishlistClient from './WishlistClient';

export const metadata = {
  title: 'Your wishlist',
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return (
    <>
      <SiteHeader activePage="wishlist" />
      <main id="main-content">
        <section className="ah-section--dark" style={{ padding: 'calc(var(--ah-header-h) + 56px) 0 48px' }}>
          <div className="ah-container">
            <span className="ah-eyebrow" style={{ color: '#F1B893' }}>Wishlist</span>
            <h1 className="ah-h1" style={{ fontSize: 'clamp(36px, 5vw, 60px)', margin: '16px 0 12px' }}>
              Your mountain shortlist
            </h1>
            <p style={{ color: 'var(--ah-on-dark-muted)', fontSize: 17, maxWidth: 520 }}>
              Saved on this device. Trip planning with your saved places is coming soon.
            </p>
          </div>
        </section>
        <div className="ah-section" style={{ paddingTop: 48 }}>
          <div className="ah-container">
            <WishlistClient />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
