import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock } from 'lucide-react';
// Only the (small) Parvati Valley guides module — keeps the full blog out of the homepage bundle
import { HIMALAYA_BLOG_POSTS } from '../../lib/blogPostsHimalaya';

/** "Read before you go" — editorial guide feature + compact list. */
export default function TravelGuides() {
  const [featured, ...rest] = HIMALAYA_BLOG_POSTS;
  if (!featured) return null;

  return (
    <section className="ah-section ah-section--alt" aria-labelledby="guides-title">
      <div className="ah-container">
        <div className="ah-section-head">
          <div>
            <span className="ah-eyebrow">Travel guides</span>
            <h2 id="guides-title" className="ah-h2" style={{ marginTop: 14 }}>
              Read before you go
            </h2>
          </div>
          <Link href="/blog" className="ah-link-arrow">
            All guides <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <div className="ah-guides">
          <Link href={`/blog/${featured.slug}`} className="ah-guide-feature">
            <span className="ah-guide-feature__media">
              <Image src={featured.image} alt={featured.imageAlt || ''} fill sizes="(max-width: 900px) 100vw, 55vw" />
            </span>
            <span className="ah-guide-feature__body">
              <span className="ah-guide__meta">
                {featured.category} · <Clock size={13} aria-hidden="true" /> {featured.readMinutes} min read
              </span>
              <strong className="ah-guide-feature__title">{featured.title}</strong>
              <span className="ah-guide-feature__excerpt">{featured.excerpt}</span>
              <span className="ah-link-arrow">Read the guide <ArrowRight size={15} aria-hidden="true" /></span>
            </span>
          </Link>

          <ul className="ah-guide-list">
            {rest.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="ah-guide-row">
                  <span className="ah-guide-row__img">
                    <Image src={post.image} alt="" fill sizes="140px" />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span className="ah-guide__meta">{post.category} · {post.readMinutes} min read</span>
                    <strong>{post.title}</strong>
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/plan" className="ah-guide-row ah-guide-row--cta">
                <span>
                  <span className="ah-guide__meta">Trip planner</span>
                  <strong>Know where you want to go? Build your day-by-day plan.</strong>
                </span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
