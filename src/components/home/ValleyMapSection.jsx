import React from 'react';
import ValleyMap from '../map/ValleyMap';

/** Homepage "explore the valley" interactive map. */
export default function ValleyMapSection({ camps }) {
  return (
    <section className="ah-section" style={{ paddingTop: 0 }} aria-labelledby="map-title">
      <div className="ah-container">
        <div className="ah-section-head">
          <div>
            <span className="ah-eyebrow">Explore the map</span>
            <h2 id="map-title" className="ah-h2" style={{ marginTop: 14 }}>
              The valley, village by village
            </h2>
            <p className="ah-lead" style={{ marginTop: 14 }}>
              Tap a place to see what’s there — stays, experiences and upcoming events.
            </p>
          </div>
        </div>
        <ValleyMap camps={camps} />
      </div>
    </section>
  );
}
