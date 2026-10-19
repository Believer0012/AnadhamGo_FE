'use client';

import React from 'react';
import { Check } from 'lucide-react';

/**
 * Flipkart-style Dark Green Sticker "Verified Stay" Badge
 * Features a circular white tick on rich emerald gradient with tactile sticker styling.
 */
export default function VerifiedStayBadge({ 
    size = 'sm', 
    text = 'Verified Stay', 
    iconOnly = false,
    style = {},
    className = ''
}) {
    const isMd = size === 'md';
    const isLg = size === 'lg';

    const padding = iconOnly
        ? (isLg ? '3.5px 6px' : isMd ? '3px 5px' : '2px 4.5px')
        : (isLg ? '4px 10px 4px 7px' : isMd ? '3px 9px 3px 6px' : '2.5px 8px 2.5px 5.5px');
    const fontSize = isLg ? '12px' : isMd ? '11px' : '10px';
    const iconWrapperSize = isLg ? '15px' : isMd ? '13px' : '11.5px';
    const checkIconSize = isLg ? 10.5 : isMd ? 9 : 8;

    return (
        <span
            className={`verified-stay-sticker ${className}`}
            title="Verified Stay"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: isLg ? '6px' : '4.5px',
                background: 'linear-gradient(135deg, #065F46 0%, #064E3B 100%)',
                color: '#FFFFFF',
                padding,
                borderRadius: '4px',
                fontSize,
                fontWeight: '800',
                letterSpacing: '0.25px',
                boxShadow: '0 2px 5px rgba(6, 78, 59, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                lineHeight: 1.2,
                verticalAlign: 'middle',
                userSelect: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                ...style
            }}
        >
            <span
                style={{
                    width: iconWrapperSize,
                    height: iconWrapperSize,
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}
            >
                <Check size={checkIconSize} strokeWidth={3.8} color="#064E3B" />
            </span>
            {!iconOnly && (
                <span style={{ fontStyle: 'italic', fontWeight: '900', letterSpacing: '0.2px' }}>
                    {text}
                </span>
            )}
        </span>
    );
}
