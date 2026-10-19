import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen } from 'lucide-react';
import { getDestinationsByGroup } from '../../lib/destinationsData';

const img = (id, w = 1400) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Editorial destination stories — asymmetric split layouts, not another card grid. */
export default function ValleyEditorial() {
  const placesCount = getDestinationsByGroup('himalaya').length;

  return (
    <section className="ah-section" aria-labelledby="valley-title">
      <div className="ah-container" style={{ display: 'grid', gap: 'clamp(64px, 9vw, 120px)' }}>
        {/* ── Story 1: the valley ── */}
        <article className="ah-editorial">
          <div className="ah-editorial__media">
            <div className="ah-editorial__main">
              <Image
                src={img('1581791534721-e599df4417f7')}
                alt="The Parvati river running fast between pine forest and boulders"
                fill
                sizes="(max-width: 900px) 100vw, 55vw"
              />
            </div>
            <figure className="ah-editorial__inset">
              <div style={{ position: 'relative', aspectRatio: '4 / 3' }}>
                <Image
                  src={img('1675515642414-d99b23e2d95f', 700)}
                  alt="Steam rising from the hot springs at Manikaran beside the gurudwara"
                  fill
                  sizes="(max-width: 900px) 50vw, 22vw"
                />
              </div>
              <figcaption>Hot springs at Manikaran</figcaption>
            </figure>
          </div>

          <div className="ah-editorial__body">
            <span className="ah-eyebrow">Discover the Parvati Valley</span>
            <h2 id="valley-title" className="ah-h2" style={{ marginTop: 14 }}>
              Follow the river into the mountains.
            </h2>
            <p className="ah-lead" style={{ marginTop: 18, color: 'var(--ah-ink)' }}>
              From Bhuntar the Parvati river leads you up through pine forest to Kasol, past the steaming hot springs of
              Manikaran, and on to the end of the road at Barshaini — where Pulga, Kalga, Tosh and the Kheerganga trail
              begin.
            </p>
            <dl className="ah-editorial__stats">
              <div><dt>Altitude</dt><dd>1,500–4,000+ m</dd></div>
              <div><dt>Places to explore</dt><dd>{placesCount}</dd></div>
              <div><dt>Best seasons</dt><dd>Spring & autumn</dd></div>
            </dl>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
              <Link href="/destinations/parvati-valley" className="ah-btn ah-btn--forest">
                Explore Parvati Valley <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/blog/best-time-to-visit-kasol-parvati-valley" className="ah-btn ah-btn--ghost">
                <BookOpen size={16} aria-hidden="true" /> When to go
              </Link>
            </div>
          </div>
        </article>

        {/* ── Story 2: the upper valley ── */}
        <article className="ah-editorial ah-editorial--reverse" aria-labelledby="upper-valley-title">
          <div className="ah-editorial__media ah-editorial__media--pair">
            <div className="ah-editorial__tall">
              <Image
                src={img('1643527311836-1b882311dbdb', 900)}
                alt="Mist over the deodar forest above Pulga"
                fill
                sizes="(max-width: 900px) 50vw, 26vw"
              />
            </div>
            <div className="ah-editorial__tall ah-editorial__tall--offset">
              <Image
                src={img('1626255047415-fdb067552f9b', 900)}
                alt="A red-roofed wooden house among the trees in the Parvati Valley"
                fill
                sizes="(max-width: 900px) 50vw, 26vw"
              />
            </div>
          </div>

          <div className="ah-editorial__body">
            <span className="ah-eyebrow">Pulga · Kalga · Tosh</span>
            <h2 id="upper-valley-title" className="ah-h2" style={{ marginTop: 14 }}>
              The quiet end of the road.
            </h2>
            <p className="ah-lead" style={{ marginTop: 18, color: 'var(--ah-ink)' }}>
              Beyond Barshaini the cars stop. Pulga’s wooden lanes lead into an old deodar forest, Kalga’s orchards open
              onto meadows and dark skies, and Tosh looks straight up the valley at the snow. Three villages, an hour apart
              on foot — each with its own pace.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
              <Link href="/destinations/pulga" className="ah-btn ah-btn--forest">
                Explore Pulga <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/blog/kalga-vs-pulga-vs-tosh" className="ah-btn ah-btn--ghost">
                <BookOpen size={16} aria-hidden="true" /> Kalga vs Pulga vs Tosh
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
