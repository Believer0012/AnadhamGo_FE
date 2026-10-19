import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mountain, Trees, Tent, Footprints, Telescope, Leaf, Heart, Users, Flame, Laptop, Camera, Landmark } from 'lucide-react';
import { TRIP_CATEGORIES } from '../../lib/stays';

const ICONS = { Mountain, Trees, Tent, Footprints, Telescope, Leaf, Heart, Users, Flame, Laptop, Camera, Landmark };

/** "Find your kind of trip" — visual category tiles linking into filtered stay discovery. */
export default function TripCategories() {
  return (
    <section className="ah-section" style={{ paddingTop: 0 }} aria-labelledby="categories-title">
      <div className="ah-container">
        <div className="ah-section-head">
          <div>
            <span className="ah-eyebrow">Travel your way</span>
            <h2 id="categories-title" className="ah-h2" style={{ marginTop: 14 }}>
              What kind of trip is this?
            </h2>
          </div>
        </div>
        <ul className="ah-cats" style={{ listStyle: 'none' }}>
          {TRIP_CATEGORIES.map((c) => {
            const Icon = ICONS[c.icon] || Mountain;
            return (
              <li key={c.value} style={{ display: 'flex' }}>
                <Link href={`/stays?category=${c.value}`} className="ah-cat" style={{ flex: 1 }}>
                  <Image src={c.image} alt="" fill sizes="(max-width: 700px) 42vw, (max-width: 1100px) 25vw, 16vw" />
                  <span className="ah-cat__inner">
                    <span className="ah-cat__icon">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <strong>{c.label}</strong>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
