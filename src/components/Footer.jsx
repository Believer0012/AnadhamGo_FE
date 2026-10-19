"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, ArrowUpRight } from 'lucide-react';
import { waLink } from '../lib/whatsapp';
import { WhatsAppIcon, InstagramIcon, YouTubeIcon, FacebookIcon, LinkedInIcon } from './common/BrandIcons';

const COLUMNS = [
    {
        title: 'Explore',
        links: [
            { label: 'Destinations', href: '/destinations' },
            { label: 'Stays', href: '/stays' },
            { label: 'Experiences', href: '/experiences' },
            { label: 'Events', href: '/events' },
            { label: 'Workation', href: '/workation' },
            { label: 'Trip planner', href: '/plan' },
            { label: 'Wishlist', href: '/wishlist' },
        ],
    },
    {
        title: 'Parvati Valley',
        links: [
            { label: 'Pulga', href: '/destinations/pulga' },
            { label: 'Kasol', href: '/destinations/kasol' },
            { label: 'Kalga', href: '/destinations/kalga' },
            { label: 'Tosh', href: '/destinations/tosh' },
            { label: 'Kheerganga', href: '/destinations/kheerganga' },
        ],
    },
    {
        title: 'Munnar, Kerala',
        links: [
            { label: 'Munnar & Suryanelli camps', href: '/camps/munnar' },
            { label: 'All Kerala camps', href: '/camps' },
            { label: 'Vagamon', href: '/destinations/vagamon' },
            { label: 'Wayanad', href: '/destinations/wayanad' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About us', href: '/about' },
            { label: 'Travel guides', href: '/blog' },
            { label: 'Services', href: '/services' },
            { label: 'Contact', href: '/contact' },
        ],
    },
];

const SOCIALS = [
    { name: 'Instagram', Icon: InstagramIcon, href: 'https://instagram.com/aanandham.go' },
    { name: 'YouTube', Icon: YouTubeIcon, href: 'https://youtube.com/@aanandhamgo' },
    { name: 'Facebook', Icon: FacebookIcon, href: 'https://facebook.com/aanandham.go' },
    { name: 'LinkedIn', Icon: LinkedInIcon, href: 'https://linkedin.com/company/aanandhamgo' },
];

export default function Footer() {
    const [emailCopied, setEmailCopied] = useState(false);
    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '919074858014';
    const formattedPhone = adminPhone.length === 12 && adminPhone.startsWith('91')
        ? `+91 ${adminPhone.slice(2, 7)} ${adminPhone.slice(7)}`
        : `+${adminPhone}`;

    return (
        <footer className="ah-footer">
            <div className="ah-container">
                {/* ── CTA band ── */}
                <div className="ah-footer__cta">
                    <div>
                        <p className="ah-eyebrow" style={{ color: '#F1B893' }}>Your mountain escape</p>
                        <h2 className="ah-footer__cta-title">Where to next?</h2>
                    </div>
                    <div className="ah-footer__cta-actions">
                        <Link href="/plan" className="ah-btn ah-btn--primary">Plan my trip</Link>
                        <a href={waLink('Hi Aanandham! I would like help planning a trip.')} target="_blank" rel="noopener noreferrer" className="ah-btn ah-btn--ghost-light">
                            <WhatsAppIcon size={17} /> Chat with us
                        </a>
                    </div>
                </div>

                <div className="ah-footer__grid">
                    {/* Brand + contact */}
                    <div className="ah-footer__brand">
                        <Link href="/" className="ah-brand" aria-label="Aanandham.go home">
                            <img src="/logo.png" alt="" width="40" height="40" loading="lazy" decoding="async" />
                            <span>Aanandham<em>.go</em></span>
                        </Link>
                        <p>Discover the Parvati Valley — villages, stays and experiences in Pulga, Kasol, Kalga and Tosh — plus verified camps in Munnar, Kerala.</p>

                        <ul className="ah-footer__contact">
                            <li>
                                <a
                                    href="mailto:bookings@aanandham.in"
                                    onClick={() => {
                                        if (navigator.clipboard) {
                                            navigator.clipboard.writeText('bookings@aanandham.in').catch(() => {});
                                            setEmailCopied(true);
                                            setTimeout(() => setEmailCopied(false), 3000);
                                        }
                                    }}
                                >
                                    <Mail size={15} aria-hidden="true" />
                                    <span>{emailCopied ? 'Email copied ✓' : 'bookings@aanandham.in'}</span>
                                </a>
                            </li>
                            <li>
                                <a href={`tel:+${adminPhone}`}>
                                    <Phone size={15} aria-hidden="true" />
                                    <span>{formattedPhone}</span>
                                </a>
                            </li>
                            <li>
                                <a href={waLink('Hi Aanandham Team!')} target="_blank" rel="noopener noreferrer">
                                    <WhatsAppIcon size={15} />
                                    <span>WhatsApp, 24/7</span>
                                </a>
                            </li>
                        </ul>

                        <div className="ah-footer__socials">
                            {SOCIALS.map(({ name, Icon, href }) => (
                                <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Aanandham.go on ${name}`}>
                                    <Icon size={16} color="#FFFFFF" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {COLUMNS.map((col) => (
                        <nav key={col.title} aria-label={col.title} className="ah-footer__col">
                            <p className="ah-footer__heading">{col.title}</p>
                            <ul>
                                {col.links.map((l) => (
                                    <li key={l.href}>
                                        <Link href={l.href}>{l.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                {/* Brand watermark (existing interactive letters) */}
                <div className="watermark-brand" aria-hidden="true">
                    {'aanandham.go'.split('').map((char, i) => (
                        <span key={i} className={`watermark-char ${char === '.' ? 'dot-char' : ''}`}>{char}</span>
                    ))}
                </div>

                <div className="ah-footer__bottom">
                    <p>© {new Date().getFullYear()} Aanandham.go. Made for mountain people.</p>
                    <div>
                        <a href="https://instagram.com/aanandham.go" target="_blank" rel="noopener noreferrer">
                            #AanandhamTravels <ArrowUpRight size={13} aria-hidden="true" />
                        </a>
                        {/* Staff access kept, but no longer promoted to every visitor */}
                        <Link href="/admin" rel="nofollow">Staff</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
