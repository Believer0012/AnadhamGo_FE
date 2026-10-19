'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Footprints, Trees, Tent, Telescope, Droplets, Home, Coffee, UtensilsCrossed, Camera, Music, Leaf } from 'lucide-react';
import { THINGS_TO_DO, getExperiences } from '../../lib/experiences';

const ICONS = { Footprints, Trees, Tent, Telescope, Droplets, Home, Coffee, UtensilsCrossed, Camera, Music, Leaf };

/** Editorial "Things to do in the mountains": one feature activity + a compact activity index. */
export default function ThingsToDo() {
  const experiences = useMemo(() => getExperiences(), []);
  const countFor = (key) => experiences.filter((e) => e.activity === key).length;
  const hrefFor = (t) => (countFor(t.key) > 0 ? `/experiences?activity=${t.key}` : t.fallbackHref);

  const [feature, ...rest] = THINGS_TO_DO;

  return (
    <section className="ah-section" aria-labelledby="todo-title">
      <div className="ah-container">
        <div className="ah-section-head">
          <div>
            <span className="ah-eyebrow">Things to do</span>
            <h2 id="todo-title" className="ah-h2" style={{ marginTop: 14 }}>
              Things to do in the mountains
            </h2>
          </div>
        </div>

        <div className="ah-todo">
          <Link href={hrefFor(feature)} className="ah-todo__feature">
            <Image src={feature.image} alt="Trail sign on the forest path to Kheerganga" fill sizes="(max-width: 900px) 100vw, 45vw" />
            <span className="ah-todo__feature-body">
              <span className="ah-eyebrow" style={{ color: '#F1B893' }}>Start here</span>
              <strong>{feature.label}</strong>
              <span>{feature.blurb}</span>
              <span className="ah-todo__cta">
                {countFor(feature.key) > 0 ? `${countFor(feature.key)} guided ${countFor(feature.key) === 1 ? 'trek' : 'treks'}` : 'Read the guide'}
                <ArrowRight size={16} aria-hidden="true" />
              </span>
            </span>
          </Link>

          <ul className="ah-todo__list">
            {rest.map((t) => {
              const Icon = ICONS[t.icon] || Leaf;
              const n = countFor(t.key);
              return (
                <li key={t.key}>
                  <Link href={hrefFor(t)} className="ah-todo__item">
                    <span className="ah-todo__icon"><Icon size={18} aria-hidden="true" /></span>
                    <span style={{ minWidth: 0 }}>
                      <strong>
                        {t.label}
                        {n > 0 ? <em>{n} {n === 1 ? 'experience' : 'experiences'}</em> : null}
                      </strong>
                      <small>{t.blurb}</small>
                    </span>
                    <ArrowUpRight size={16} aria-hidden="true" className="ah-todo__arrow" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
