'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Play, ArrowUpRight } from 'lucide-react';
import { InstagramIcon } from '../common/BrandIcons';

const INSTAGRAM_URL = 'https://www.instagram.com/aanandham.go/';
const HASHTAG = 'AanandhamTravels';
const img = (id, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

// Shown until the live Instagram feed is connected. These are photos of the valley — they are
// labelled as such and never presented as guests' posts.
const VALLEY_PHOTOS = [
  { id: 'v1', media_url: img('1784223042072-69cd9e864860', 1200), caption: 'Campfire under the snow peaks' },
  { id: 'v2', media_url: img('1612638039814-1a67ea727114'), caption: 'The Parvati at Kasol' },
  { id: 'v3', media_url: img('1646929589933-04399d5547b9'), caption: 'Night sky above the meadow' },
  { id: 'v4', media_url: img('1642323806011-1f932bbcdac0'), caption: 'Terraced fields near Tosh' },
  { id: 'v5', media_url: img('1643527311836-1b882311dbdb'), caption: 'Mist in the Pulga forest' },
  { id: 'v6', media_url: img('1749359669134-289058a33c63'), caption: 'Cooking on a wood fire' },
];

/** "Stories from the mountains" — live Instagram posts when connected, valley photos otherwise. */
export default function MountainStories() {
  // The mosaic is one large tile + four small ones
  const [feed, setFeed] = useState({ live: false, posts: VALLEY_PHOTOS.slice(0, 5) });

  useEffect(() => {
    fetch('/api/instagram')
      .then((res) => res.json())
      .then((data) => {
        // 'curated_local' is the API's built-in fallback — only switch when it's a real feed
        if (data?.source && data.source !== 'curated_local' && Array.isArray(data.posts) && data.posts.length >= 3) {
          setFeed({ live: true, posts: data.posts.slice(0, 5) });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="ah-section ah-section--dark" aria-labelledby="stories-title">
      <div className="ah-container">
        <div className="ah-section-head">
          <div>
            <span className="ah-eyebrow" style={{ color: '#F1B893' }}>#{HASHTAG}</span>
            <h2 id="stories-title" className="ah-h2" style={{ marginTop: 14, color: '#fff' }}>
              Stories from the mountains
            </h2>
            <p style={{ marginTop: 14, maxWidth: 520, color: 'var(--ah-on-dark-muted)', fontSize: 16, lineHeight: 1.6 }}>
              {feed.live
                ? 'Latest from @aanandham.go. Tag your trip with #AanandhamTravels to be featured.'
                : 'Moments from the Parvati Valley. Travelling with us? Tag your photos and reels with #AanandhamTravels to be featured here.'}
            </p>
          </div>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="ah-btn ah-btn--ghost-light">
            <InstagramIcon size={16} /> Follow @aanandham.go
          </a>
        </div>

        <ul className="ah-stories">
          {feed.posts.map((p, i) => {
            const isVideo = p.tag === 'REEL' || p.media_type === 'VIDEO';
            const label = p.caption || p.title || 'Photo from the Parvati Valley';
            // Images are decorative here: each tile shows its caption as visible text (and live links carry an aria-label)
            const tile = (
              <>
                {p.media_url && feed.live ? (
                  // Instagram/Behold CDN hosts aren't in next/image remotePatterns — use a plain lazy <img>
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.media_url} alt="" loading="lazy" decoding="async" />
                ) : p.media_url ? (
                  <Image src={p.media_url} alt="" fill sizes={i === 0 ? '(max-width: 760px) 100vw, 50vw' : '(max-width: 760px) 50vw, 25vw'} />
                ) : null}
                {isVideo ? <span className="ah-stories__play" aria-label="Reel"><Play size={16} fill="currentColor" aria-hidden="true" /></span> : null}
                <span className="ah-stories__caption">
                  {feed.live ? <InstagramIcon size={13} /> : null}
                  {label.length > 60 ? `${label.slice(0, 58)}…` : label}
                  {feed.live ? <ArrowUpRight size={13} aria-hidden="true" /> : null}
                </span>
              </>
            );
            return (
              <li key={p.id} className={i === 0 ? 'ah-stories__tile ah-stories__tile--lead' : 'ah-stories__tile'}>
                {feed.live && p.permalink ? (
                  <a href={p.permalink} target="_blank" rel="noopener noreferrer" aria-label={`Open on Instagram: ${label.slice(0, 80)}`}>
                    {tile}
                  </a>
                ) : (
                  <div>{tile}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
