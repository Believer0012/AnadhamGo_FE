import React from 'react';
import MobileMarshalScanner from '@/components/scanner/MobileMarshalScanner';

export const metadata = {
  title: 'Marshal QR & Headcount Scanner | Aanandham.go',
  description: 'Mobile live camera QR pass scanner, camper headcount tracking, and balance settlement for basecamp marshals.',
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminScannerPage() {
  return <MobileMarshalScanner />;
}
