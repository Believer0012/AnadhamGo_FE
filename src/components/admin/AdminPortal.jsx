"use client";
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { QrCode, X } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import MobileMarshalScanner from '@/components/admin/MobileMarshalScanner';
import { useAdminPortalState } from '@/components/admin/useAdminPortalState';

// Layout Submodules
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminAuthModal from '@/components/admin/AdminAuthModal';
import PropertyDetailInspector from '@/components/admin/PropertyDetailInspector';

// Tab Submodules
import AdminPropertiesTab from '@/components/admin/tabs/AdminPropertiesTab';
import AdminTestimonialsTab from '@/components/admin/tabs/AdminTestimonialsTab';
import AdminPaymentGatewayTab from '@/components/admin/tabs/AdminPaymentGatewayTab';
import AdminDestinationsCmsTab from '@/components/admin/tabs/cms/AdminDestinationsCmsTab';
import AdminBlogCmsTab from '@/components/admin/tabs/cms/AdminBlogCmsTab';
import AdminBrandStoryCmsTab from '@/components/admin/tabs/cms/AdminBrandStoryCmsTab';
import AdminServicesCmsTab from '@/components/admin/tabs/cms/AdminServicesCmsTab';
import AdminHotlinesCmsTab from '@/components/admin/tabs/cms/AdminHotlinesCmsTab';

// Modal Submodules
import PropertyEditModal from '@/components/admin/modals/PropertyEditModal';
import DeleteConfirmModal from '@/components/admin/modals/DeleteConfirmModal';

export function AdminPortalInner({ initialTab = 'overview' }) {
    const admin = useAdminPortalState(initialTab);
    const {
        isAuthenticated, passcode, setPasscode, passcodeError, rememberMe, setRememberMe, handleLogin,
        activeTab, setActiveTab, activePropertyDetailId, setActivePropertyDetailId,
        properties, testimonials,
        isSidebarCollapsed, setIsSidebarCollapsed,
        isMobileSidebarOpen, setIsMobileSidebarOpen, isMobile, scannerOverlayOpen, setScannerOverlayOpen,
        handleLogout,
        // Property Inspector & Modals state
        isPropertyModalOpen, setIsPropertyModalOpen, editingProperty, setEditingProperty, propertyForm, setPropertyForm,
        imageUrlInput, setImageUrlInput, handleSaveProperty,
        isAddRoomModalOpen, setIsAddRoomModalOpen, editingRoom, setEditingRoom, roomForm, setRoomForm, handleSaveRoom, handleDeleteRoom, handleUploadPhoto,
        deleteConfirmDialog, setDeleteConfirmDialog,
        // Tab specific
        propertyFilterRegion, setPropertyFilterRegion,
        setTestimonials, handleSaveTestimonials, testimonialsSaving, handleResetDefaultTestimonials, handleQuickAddRandomTestimonial,
        fetchBookings, isOnlineMode
    } = admin;

    const currentDetailProperty = properties.find(p => p.id === activePropertyDetailId) || null;

    const openPropertyModal = (prop = null) => {
        if (prop) {
            setEditingProperty(prop);
            setPropertyForm({ ...prop });
        } else {
            setEditingProperty(null);
            setPropertyForm({
                title: '',
                region: 'Munnar',
                category: 'Summit Trek & Glamp',
                tag: 'Bestseller',
                location: 'Munnar, Kerala',
                altitude: '7,900 FT',
                price: 2499,
                originalPrice: 3200,
                duration: '2 Days / 1 Night',
                difficulty: 'Moderate Offroad',
                image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80',
                gallery: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80'],
                description: '',
                highlights: '4x4 Jeep Safari, Campfire BBQ',
                inclusions: 'Stay, Meals, Safari',
                exclusions: 'Personal transport'
            });
        }
        setIsPropertyModalOpen(true);
    };

    const openAddRoomModal = () => {
        setEditingRoom(null);
        setRoomForm({
            name: '',
            capacity: '2 Adults',
            price: 2499,
            totalUnits: 8,
            image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=600&q=80',
            features: 'Private Deck, King Bed, Mountain View'
        });
        setIsAddRoomModalOpen(true);
    };

    const openEditRoomModal = (room) => {
        setEditingRoom(room);
        setRoomForm({
            name: room.name || '',
            capacity: room.capacity || '2 Adults',
            price: room.price || 2499,
            totalUnits: room.totalUnits || 8,
            image: room.image || '',
            features: Array.isArray(room.features) ? room.features.join(', ') : (room.features || '')
        });
        setIsAddRoomModalOpen(true);
    };

    if (!isAuthenticated) {
        return (
            <AdminAuthModal
                passcode={passcode}
                setPasscode={setPasscode}
                passcodeError={passcodeError}
                rememberMe={rememberMe}
                setRememberMe={setRememberMe}
                handleLogin={handleLogin}
            />
        );
    }

    // ─────────────────────────────────────────────────────────────
    // DEDICATED PROPERTY INSPECTOR VIEW
    // ─────────────────────────────────────────────────────────────
    if (activePropertyDetailId && currentDetailProperty) {
        return (
            <PropertyDetailInspector
                currentDetailProperty={currentDetailProperty}
                setActivePropertyDetailId={setActivePropertyDetailId}
                openAddRoomModal={openAddRoomModal}
                openEditRoomModal={openEditRoomModal}
                handleDeleteRoom={handleDeleteRoom}
                openPropertyModal={openPropertyModal}
                isAddRoomModalOpen={isAddRoomModalOpen}
                setIsAddRoomModalOpen={setIsAddRoomModalOpen}
                editingRoom={editingRoom}
                roomForm={roomForm}
                setRoomForm={setRoomForm}
                handleSaveRoom={handleSaveRoom}
                handleUploadPhoto={handleUploadPhoto}
            />
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9F5', position: 'relative' }}>
            {/* Sidebar Navigation */}
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isSidebarCollapsed={isSidebarCollapsed}
                setIsSidebarCollapsed={setIsSidebarCollapsed}
                isMobileSidebarOpen={isMobileSidebarOpen}
                setIsMobileSidebarOpen={setIsMobileSidebarOpen}
                isMobile={isMobile}
                handleLogout={handleLogout}
                setScannerOverlayOpen={setScannerOverlayOpen}
                fetchBookings={fetchBookings}
            />

            {/* Main Content Area */}
            <main className="no-scrollbar admin-scroll-container" style={{
                flex: 1,
                minWidth: 0,
                width: '100%',
                padding: isMobile ? '16px 12px' : '32px 42px',
                marginLeft: isMobile ? 0 : (isSidebarCollapsed ? '80px' : '315px'),
                transition: 'margin-left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '26px'
            }}>
                <AdminHeader
                    activeTab={activeTab}
                    isMobile={isMobile}
                    isMobileSidebarOpen={isMobileSidebarOpen}
                    setIsMobileSidebarOpen={setIsMobileSidebarOpen}
                    setScannerOverlayOpen={setScannerOverlayOpen}
                    fetchBookings={fetchBookings}
                    isOnlineMode={isOnlineMode}
                />

                {/* Active CMS Tab Views */}
                {(activeTab === 'properties' || activeTab === 'overview') && (
                    <AdminPropertiesTab
                        properties={properties}
                        propertyFilterRegion={propertyFilterRegion}
                        setPropertyFilterRegion={setPropertyFilterRegion}
                        openPropertyModal={openPropertyModal}
                        setActivePropertyDetailId={setActivePropertyDetailId}
                    />
                )}

                {(activeTab === 'cms' || activeTab === 'destinations') && (
                    <AdminDestinationsCmsTab />
                )}

                {activeTab === 'blog' && (
                    <AdminBlogCmsTab />
                )}

                {activeTab === 'about' && (
                    <AdminBrandStoryCmsTab />
                )}

                {activeTab === 'services' && (
                    <AdminServicesCmsTab />
                )}

                {activeTab === 'contact' && (
                    <AdminHotlinesCmsTab />
                )}

                {activeTab === 'testimonials' && (
                    <AdminTestimonialsTab
                        testimonials={testimonials}
                        setTestimonials={setTestimonials}
                        handleSaveTestimonials={handleSaveTestimonials}
                        testimonialsSaving={testimonialsSaving}
                        handleResetDefaultTestimonials={handleResetDefaultTestimonials}
                        handleQuickAddRandomTestimonial={handleQuickAddRandomTestimonial}
                    />
                )}

                {activeTab === 'payments' && (
                    <AdminPaymentGatewayTab />
                )}
            </main>

            {/* Modals & Dialogs */}
            <PropertyEditModal
                isPropertyModalOpen={isPropertyModalOpen}
                setIsPropertyModalOpen={setIsPropertyModalOpen}
                editingProperty={editingProperty}
                propertyForm={propertyForm}
                setPropertyForm={setPropertyForm}
                imageUrlInput={imageUrlInput}
                setImageUrlInput={setImageUrlInput}
                handleSaveProperty={handleSaveProperty}
                handleUploadPhoto={handleUploadPhoto}
                handleRemovePhoto={(idx) => {
                    const current = Array.isArray(propertyForm?.gallery) ? propertyForm.gallery : [];
                    const next = [...current];
                    next.splice(idx, 1);
                    setPropertyForm(prev => ({ ...prev, gallery: next }));
                }}
            />

            <DeleteConfirmModal
                deleteConfirmDialog={deleteConfirmDialog}
                setDeleteConfirmDialog={setDeleteConfirmDialog}
            />

            {/* Mobile / Desktop Live QR Scanner Overlay */}
            {scannerOverlayOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 100030,
                    background: '#0B150E',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        padding: '12px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        background: '#121613'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <QrCode size={17} color="#D5ED55" />
                            <span style={{ fontSize: '13px', fontWeight: '800', color: '#F5F7F4' }}>Basecamp QR Scanner</span>
                        </div>
                        <button
                            onClick={() => setScannerOverlayOpen(false)}
                            aria-label="Close QR Scanner"
                            title="Close QR Scanner"
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.22)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={18} color="#F5F7F4" />
                        </button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                        <MobileMarshalScanner onBackToAdmin={() => setScannerOverlayOpen(false)} embedded />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminPortal({ initialTab = 'overview' }) {
    return (
        <ErrorBoundary
            title="CMS Command Station Glitch"
            description="The content management dashboard encountered an unexpected state. Click retry to recover session state."
        >
            <AdminPortalInner initialTab={initialTab} />
        </ErrorBoundary>
    );
}
