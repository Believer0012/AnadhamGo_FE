"use client";
import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintPassButton() {
    return (
        <button
            type="button"
            onClick={() => window.print()}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#D5ED55',
                color: '#121613',
                fontSize: '12.5px',
                fontWeight: '900',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            }}
        >
            <Printer size={15} />
            <span>Save PDF / Print Pass</span>
        </button>
    );
}
