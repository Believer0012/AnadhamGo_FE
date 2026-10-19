"use client";
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useMarshalScannerState } from '@/components/scanner/useMarshalScannerState';
import ScannerAuthLockScreen from '@/components/scanner/ScannerAuthLockScreen';
import ScannerTopBar from '@/components/scanner/ScannerTopBar';
import ScannerCameraView from '@/components/scanner/ScannerCameraView';
import ScannerRosterView from '@/components/scanner/ScannerRosterView';
import ScannerKitchenView from '@/components/scanner/ScannerKitchenView';
import ScannerCheckInModal from '@/components/scanner/ScannerCheckInModal';
import { ScannerEmailTestPassModal, ScannerManualLookupModal } from '@/components/scanner/ScannerModals';

export default function MobileMarshalScanner({ onBackToAdmin, forcedScope = null }) {
    const scannerState = useMarshalScannerState({ onBackToAdmin, forcedScope });
    const {
        isAuthLocked,
        activeTab,
        scannedBooking,
        renderToast
    } = scannerState;

    // 1. If Station Lock Screen is active, render Auth Gatekeeper
    if (!scannerState.isAuthenticated) {
        return (
            <ErrorBoundary title="Host Security Console Glitch">
                <ScannerAuthLockScreen state={scannerState} onBackToAdmin={onBackToAdmin} />
            </ErrorBoundary>
        );
    }

    // 2. Main Authenticated Scanner Console
    return (
        <ErrorBoundary title="Camp Staff Scanner Console Error">
            <div style={{
                minHeight: '100vh',
                background: '#060E08',
                color: '#FFFFFF',
                fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflowX: 'hidden'
            }}>
                {/* Floating Toast Notification */}
                {renderToast && renderToast()}

                {/* Top Navigation & App Bar */}
                <ScannerTopBar state={scannerState} onBackToAdmin={onBackToAdmin} />

                {/* Main Content Area */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'scanner' && (
                            <ScannerCameraView key="scanner-camera" state={scannerState} />
                        )}
                        {activeTab === 'roster' && (
                            <ScannerRosterView key="scanner-roster" state={scannerState} />
                        )}
                        {activeTab === 'kitchen' && (
                            <ScannerKitchenView key="scanner-kitchen" state={scannerState} />
                        )}
                    </AnimatePresence>
                </main>

                {/* Check-In / Boarding Pass Settlement Modal */}
                {scannedBooking && (
                    <ScannerCheckInModal state={scannerState} />
                )}

                {/* Simulation / Diagnostic Modals */}
                <ScannerEmailTestPassModal state={scannerState} />
                <ScannerManualLookupModal state={scannerState} />
            </div>
        </ErrorBoundary>
    );
}
