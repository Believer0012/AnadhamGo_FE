import React from 'react';
import MobileMarshalScanner from '@/components/scanner/MobileMarshalScanner';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata = {
  title: 'Camp Host Check-In & Scanner | Aanandham.go',
  description: 'Mobile QR pass verification, camper attendance, and headcount tracker.',
  robots: {
    index: false,
    follow: false
  }
};

export default function MarshalDirectPage() {
  return (
    <ErrorBoundary title="Scanner Station Error" description="The field scanner encountered an issue. Tap retry below to restart the camera scanner.">
      <MobileMarshalScanner />
    </ErrorBoundary>
  );
}
