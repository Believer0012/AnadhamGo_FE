"use client";
import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
].join(', ');

/**
 * Custom React hook to trap keyboard focus within an active modal dialog,
 * and restore focus to the triggering element when the modal is closed (WCAG 2.1 AA).
 * 
 * @param {boolean} isOpen - Whether the modal/dialog is currently active
 * @param {React.RefObject} containerRef - Ref attached to modal container DOM element
 * @param {object} options - Optional configuration
 * @param {boolean} options.autoFocus - Whether to focus first element on open (default: true)
 * @param {boolean} options.restoreFocus - Whether to restore previous focus on close (default: true)
 */
export function useFocusTrap(isOpen, containerRef, options = {}) {
    const { autoFocus = true, restoreFocus = true } = options;
    const previousFocusRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        // 1. Record the element that had focus right before opening modal
        if (typeof document !== 'undefined') {
            previousFocusRef.current = document.activeElement;
        }

        const container = containerRef.current;
        if (!container) return;

        // 2. Auto-focus first focusable element inside modal container
        const focusFirstElement = () => {
            const focusableElements = container.querySelectorAll(FOCUSABLE_SELECTOR);
            if (focusableElements.length > 0 && autoFocus) {
                // Focus the close button or first interactive control
                const target = focusableElements[0];
                target.focus();
            }
        };

        const timer = setTimeout(focusFirstElement, 60);

        // 3. Trap keyboard Tab and Shift+Tab navigation
        const handleKeyDown = (e) => {
            if (e.key !== 'Tab') return;

            const focusable = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
                el => !el.hasAttribute('disabled') && el.offsetParent !== null
            );

            if (focusable.length === 0) {
                e.preventDefault();
                return;
            }

            const firstElement = focusable[0];
            const lastElement = focusable[focusable.length - 1];

            if (e.shiftKey) {
                // Shift + Tab: if on first element, wrap around to last
                if (document.activeElement === firstElement || !container.contains(document.activeElement)) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab: if on last element, wrap around to first
                if (document.activeElement === lastElement || !container.contains(document.activeElement)) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);

        // 4. Cleanup & Restore Focus to trigger element on close
        return () => {
            clearTimeout(timer);
            container.removeEventListener('keydown', handleKeyDown);
            if (restoreFocus && previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
                setTimeout(() => {
                    try {
                        previousFocusRef.current?.focus();
                    } catch (e) {}
                }, 50);
            }
        };
    }, [isOpen, containerRef, autoFocus, restoreFocus]);
}
