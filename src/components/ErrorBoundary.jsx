'use client';

import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('⚠️ [ErrorBoundary Caught Exception]:', error, errorInfo);
        if (this.props.onError) {
            try {
                this.props.onError(error, errorInfo);
            } catch (e) {}
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        if (this.props.onReset) {
            try {
                this.props.onReset();
            } catch (e) {}
        }
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return typeof this.props.fallback === 'function'
                    ? this.props.fallback(this.state.error, this.handleReset)
                    : this.props.fallback;
            }

            return (
                <div style={{
                    padding: '24px',
                    margin: '16px 0',
                    borderRadius: '16px',
                    background: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    color: '#991B1B',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.08)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '20px' }}>⚠️</span>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#991B1B' }}>
                            {this.props.title || 'Component Encountered a Minor Glitch'}
                        </h4>
                    </div>
                    <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#7F1D1D', lineHeight: 1.5 }}>
                        {this.props.description || 'An unexpected rendering state occurred. Your data is safe.'}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={this.handleReset}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '10px',
                                background: '#DC2626',
                                color: '#FFFFFF',
                                border: 'none',
                                fontWeight: '700',
                                fontSize: '12.5px',
                                cursor: 'pointer'
                            }}
                        >
                            ↻ Retry Component
                        </button>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '10px',
                                background: '#FFFFFF',
                                color: '#374151',
                                border: '1px solid #D1D5DB',
                                fontWeight: '700',
                                fontSize: '12.5px',
                                cursor: 'pointer'
                            }}
                        >
                            Refresh Window
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
