import React from 'react';
import MobileMarshalScanner from '@/components/scanner/MobileMarshalScanner';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata = {
  title: 'Basecamp Camper Check-In & QR Scanner',
  description: 'Mobile live camera QR pass scanner, camper headcount tracking, and balance settlement for basecamp hosts.',
  alternates: {
    canonical: 'https://www.aanandham.in/checkin',
  },
  robots: {
    index: false,
    follow: false
  }
};

export default function CheckinDirectPage() {
  return (
    <ErrorBoundary
      title="Scanner Console Glitch"
      description="The basecamp check-in scanner encountered an unexpected camera or network event. Tap retry to re-initialize."
    >
      <MobileMarshalScanner />
    </ErrorBoundary>
  );
}
