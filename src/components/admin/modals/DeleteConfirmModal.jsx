"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertCircle } from 'lucide-react';
import { H2_STYLE } from '../AdminSharedStyles';

export default function DeleteConfirmModal({
    deleteConfirmDialog,
    setDeleteConfirmDialog
}) {
    if (!deleteConfirmDialog?.isOpen) return null;

    const closeDeleteConfirm = () => {
        setDeleteConfirmDialog(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, zIndex: 100020, background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                <motion.div
                    initial={{ scale: 0.95, y: 12, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: 12, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '20px',
                        border: '1px solid rgba(18, 22, 19, 0.1)',
                        padding: '24px 28px',
                        maxWidth: '440px',
                        width: '100%',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
                        position: 'relative'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: '#FEE2E2',
                            color: '#DC2626',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <Trash2 size={20} strokeWidth={2.2} />
                        </div>
                        <div>
                            <h3 style={H2_STYLE}>
                                {deleteConfirmDialog.title}
                            </h3>
                            <div style={{ fontSize: '12.5px', color: '#59655D', marginTop: '2px' }}>
                                Permanent Action Required
                            </div>
                        </div>
                    </div>

                    <p style={{ fontSize: '13.5px', color: '#3A443E', lineHeight: 1.55, margin: '0 0 16px' }}>
                        {deleteConfirmDialog.subtitle || deleteConfirmDialog.message || 'Are you sure you want to proceed with this deletion?'}
                    </p>

                    {deleteConfirmDialog.itemDetails && (
                        <div style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            background: '#F8F9F5',
                            border: '1px solid rgba(18, 22, 19, 0.08)',
                            marginBottom: '20px'
                        }}>
                            <div style={{ fontWeight: '800', color: '#121613', fontSize: '13px', marginBottom: '4px' }}>
                                {deleteConfirmDialog.itemDetails.title || deleteConfirmDialog.itemDetails.Name || 'Selected Item'}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: '#59655D',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {deleteConfirmDialog.itemDetails.subtext || deleteConfirmDialog.itemDetails.Region || ''}
                                </span>
                                {deleteConfirmDialog.itemDetails.amount && (
                                    <span style={{ fontWeight: '800', color: '#121613', fontSize: '13px', marginLeft: '8px' }}>
                                        {deleteConfirmDialog.itemDetails.amount}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={closeDeleteConfirm}
                            style={{
                                padding: '10px 18px',
                                borderRadius: '10px',
                                background: '#F1F3EC',
                                border: '1px solid rgba(18, 22, 19, 0.1)',
                                color: '#121613',
                                fontSize: '12.5px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const action = deleteConfirmDialog.onConfirm || deleteConfirmDialog.confirmAction;
                                if (typeof action === 'function') action();
                                closeDeleteConfirm();
                            }}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '10px',
                                background: '#DC2626',
                                border: '1px solid #B91C1C',
                                color: '#FFFFFF',
                                fontSize: '12.5px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <span>{deleteConfirmDialog.confirmText || 'Delete Record'}</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
