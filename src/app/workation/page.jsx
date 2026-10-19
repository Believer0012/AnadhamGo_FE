import React from 'react';
import Image from 'next/image';
import { Signal } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';
import { WhatsAppIcon } from '@/components/common/BrandIcons';
import { WORKATION_ICONS } from '@/components/home/WorkationSection';
import { CONNECTIVITY_NOTES, WORKATION_FEATURES } from '@/lib/workation';
import { waLink } from '@/lib/whatsapp';
import WorkationStays from './WorkationStays';

export const metadata = {
  title: 'Workation in the Parvati Valley — work from the mountains',
  description:
    'Work from Kasol and the Parvati Valley: stays with desks, reliable Wi-Fi, power backup and long-stay rates — plus honest advice on connectivity in the upper villages.',
  alternates: { canonical: 'https://www.aanandham.in/workation' },
};

const HERO = 'https://images.unsplash.com/photo-1769882199542-2de5bf54c486?auto=format&fit=crop&w=2000&q=80';

export default function WorkationPage() {
  return (
    <>
      <SiteHeader activePage="workation" />
      <main id="main-content">
        <section className="ah-dest-hero" aria-labelledby="workation-page-title">
          <Image src={HERO} alt="" fill priority sizes="100vw" />
          <div className="ah-container ah-dest-hero__content">
            <span className="ah-eyebrow" style={{ color: '#F1B893' }}>Workation</span>
            <h1 id="workation-page-title" className="ah-h1" style={{ fontSize: 'clamp(40px, 6.5vw, 84px)', marginTop: 14, maxWidth: '14ch' }}>
              Work from the mountains.
            </h1>
            <p style={{ marginTop: 14, maxWidth: 540, fontSize: 17, lineHeight: 1.6, color: 'var(--ah-on-dark-muted)' }}>
              Proper desks, reliable Wi-Fi and long-stay rates in the Parvati Valley — with the river outside the window.
            </p>
          </div>
        </section>

        <section className="ah-section" aria-labelledby="wf-title">
          <div className="ah-container">
            <span className="ah-eyebrow">What a workation stay includes</span>
            <h2 id="wf-title" className="ah-h2" style={{ marginTop: 14, marginBottom: 32, fontSize: 'clamp(26px, 3.2vw, 40px)' }}>
              Everything you need to actually get work done
            </h2>
            <ul className="ah-wf-grid">
              {WORKATION_FEATURES.map((f) => {
                const Icon = WORKATION_ICONS[f.icon];
                return (
                  <li key={f.label}>
                    <span className="ah-todo__icon"><Icon size={18} aria-hidden="true" /></span>
                    <strong>{f.label}</strong>
                    <small>{f.note}</small>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="ah-section ah-section--alt" aria-labelledby="ws-title">
          <div className="ah-container">
            <span className="ah-eyebrow">Where to stay</span>
            <h2 id="ws-title" className="ah-h2" style={{ marginTop: 14, marginBottom: 28, fontSize: 'clamp(26px, 3.2vw, 40px)' }}>
              Workation-ready stays
            </h2>
            <WorkationStays />
          </div>
        </section>

        <section className="ah-section" aria-labelledby="wc-title">
          <div className="ah-container ah-dest-intro">
            <div>
              <span className="ah-eyebrow">Before you book</span>
              <h2 id="wc-title" className="ah-h2" style={{ marginTop: 14, fontSize: 'clamp(26px, 3.2vw, 40px)' }}>
                An honest word on connectivity
              </h2>
              <dl style={{ display: 'grid', gap: 18, marginTop: 24 }}>
                {CONNECTIVITY_NOTES.map((n) => (
                  <div key={n.place}>
                    <dt style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                      <Signal size={16} color="var(--ah-pine)" aria-hidden="true" /> {n.place}
                    </dt>
                    <dd style={{ marginTop: 4, color: 'var(--ah-muted)', lineHeight: 1.6 }}>{n.text}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="ah-facts" style={{ padding: 24, display: 'grid', gap: 14, alignSelf: 'start' }}>
              <strong style={{ fontFamily: 'var(--ah-font-display)', fontSize: 22 }}>Staying a week or more?</strong>
              <p style={{ color: 'var(--ah-muted)', lineHeight: 1.6 }}>
                Tell us your dates, your work hours and what connection you need. We’ll match you with a stay and send
                long-stay rates.
              </p>
              <a
                href={waLink('Hi Aanandham! I am planning a workation in the Parvati Valley. Dates: ___ . I need: ___')}
                target="_blank"
                rel="noopener noreferrer"
                className="ah-btn ah-btn--primary"
              >
                <WhatsAppIcon size={17} /> Get long-stay rates
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
