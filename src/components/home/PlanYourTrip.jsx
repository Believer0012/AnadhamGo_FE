import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import TripPlanner from '../planner/TripPlanner';

/** Homepage wrapper for the trip planner. The full, shareable version lives at /plan. */
export default function PlanYourTrip() {
  return (
    <section id="plan" className="ah-section ah-section--alt" aria-labelledby="plan-title">
      <div className="ah-container">
        <div className="ah-section-head">
          <div>
            <span className="ah-eyebrow">Trip planner</span>
            <h2 id="plan-title" className="ah-h2" style={{ marginTop: 14 }}>
              Build your mountain escape
            </h2>
            <p className="ah-lead" style={{ marginTop: 14 }}>
              Pick your days, your people and what you love. We’ll lay out the route up the valley — where to sleep,
              what to do, and roughly what it costs.
            </p>
          </div>
          <Link href="/plan" className="ah-link-arrow">
            Open full planner <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <TripPlanner headingLevel="h3" />
      </div>
    </section>
  );
}
