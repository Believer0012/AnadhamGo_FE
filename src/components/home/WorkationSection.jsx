import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Wifi, Laptop, CalendarRange, Trees, Coffee, BatteryCharging, Users } from 'lucide-react';
import { WORKATION_FEATURES } from '../../lib/workation';

export const WORKATION_ICONS = { Wifi, Laptop, CalendarRange, Trees, Coffee, BatteryCharging, Users };
const IMAGE = 'https://images.unsplash.com/photo-1768593396351-6dfccd1d38fe?auto=format&fit=crop&w=2000&q=80';

/** "Work from the mountains" — full-bleed photographic band. */
export default function WorkationSection() {
  return (
    <section className="ah-workation" aria-labelledby="workation-title">
      <Image src={IMAGE} alt="" fill sizes="100vw" className="ah-workation__bg" />
      <div className="ah-container ah-workation__inner">
        <div className="ah-workation__panel">
          <span className="ah-eyebrow" style={{ color: '#F1B893' }}>Workation</span>
          <h2 id="workation-title" className="ah-h2" style={{ marginTop: 14, color: '#fff' }}>
            Work from the mountains.
          </h2>
          <p style={{ marginTop: 14, fontSize: 16.5, lineHeight: 1.65, color: 'var(--ah-on-dark-muted)', maxWidth: 480 }}>
            Swap the office view for the Parvati river. Stays with proper desks, reliable Wi-Fi and long-stay rates — and
            a forest walk at lunch.
          </p>
          <ul className="ah-workation__features">
            {WORKATION_FEATURES.map((f) => {
              const Icon = WORKATION_ICONS[f.icon];
              return (
                <li key={f.label}>
                  <Icon size={18} aria-hidden="true" />
                  {f.label}
                </li>
              );
            })}
          </ul>
          <Link href="/workation" className="ah-btn ah-btn--primary" style={{ marginTop: 28 }}>
            Explore workation <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
