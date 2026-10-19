'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Info } from 'lucide-react';
import ExperienceCard from '../common/ExperienceCard';
import Rail, { RailControls, useRail } from '../common/Rail';
import { THINGS_TO_DO, getExperiences } from '../../lib/experiences';

/** "Experiences you'll remember" — dark band with an activity-filtered rail. */
export default function ExperiencesSection() {
  const rail = useRail();
  const all = useMemo(() => getExperiences().filter((e) => e.group === 'himalaya'), []);
  const [activity, setActivity] = useState('all');

  const activities = THINGS_TO_DO.filter((t) => all.some((e) => e.activity === t.key));
  const list = activity === 'all' ? all : all.filter((e) => e.activity === activity);

  useEffect(() => {
    if (rail.ref.current) rail.ref.current.scrollLeft = 0;
  }, [activity, rail.ref]);

  if (all.length === 0) return null;

  return (
    <section id="experiences" className="ah-section ah-section--dark ah-exp-band" aria-labelledby="experiences-title">
      <div className="ah-container">
        <div className="ah-section-head">
          <div>
            <span className="ah-eyebrow" style={{ color: '#F1B893' }}>Experiences</span>
            <h2 id="experiences-title" className="ah-h2" style={{ marginTop: 14, color: '#fff' }}>
              Experiences you’ll remember
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link href="/experiences" className="ah-link-arrow" style={{ color: '#fff' }}>
              All experiences <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <RailControls rail={rail} label="experiences" />
          </div>
        </div>

        <div className="ah-chips ah-chips--scroll ah-chips--dark" role="group" aria-label="Activity" style={{ marginBottom: 24 }}>
          <button type="button" className="ah-chip" aria-pressed={activity === 'all'} onClick={() => setActivity('all')}>All</button>
          {activities.map((t) => (
            <button key={t.key} type="button" className="ah-chip" aria-pressed={activity === t.key} onClick={() => setActivity(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        <Rail rail={rail} label="Experiences">
          {list.map((e) => <ExperienceCard key={e.id} experience={e} />)}
        </Rail>

        {list.some((e) => e.isSample) ? (
          <p className="ah-sample-note" style={{ color: 'var(--ah-on-dark-muted)' }}>
            <Info size={14} aria-hidden="true" /> Experiences marked “Sample” are placeholder previews and can’t be booked yet.
          </p>
        ) : null}
      </div>
    </section>
  );
}
