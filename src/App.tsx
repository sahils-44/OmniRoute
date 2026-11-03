import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { RestaurantDashboard } from './components/restaurant/RestaurantDashboard';
import { VendorDashboard } from './components/vendor/VendorDashboard';
import { DeliveryPartnerDashboard } from './components/delivery/DeliveryPartnerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { NotificationToast } from './components/common/NotificationToast';
import { InvoiceModal } from './components/common/InvoiceModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { AuthPage } from './components/auth/AuthPage';
import { LoadingScreen } from './components/auth/LoadingScreen';
import { Compass, ShieldCheck, Heart, Terminal } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, firebaseUser, authLoading, isGuestDemo, loginDemoRole } = useApp();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // 1. Maintain login session automatically with loading screen
  if (authLoading) {
    return <LoadingScreen />;
  }

  // 2. If user is null and not in demo mode, show AuthPage
  if (!firebaseUser && !isGuestDemo) {
    return (
      <AuthPage
        onDemoLogin={role => loginDemoRole(role)}
        onSuccess={() => {}}
      />
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex flex-col selection:bg-gold-500/30 selection:text-gold-200">
      {/* 1 KM Proximity Alert Overlay Banner */}
      <NotificationToast />

      {/* A4 Tax Printable Invoice Modal */}
      <InvoiceModal />

      {/* Main Glass Navbar */}
      <Navbar onOpenCart={() => setIsCartOpen(true)} />

      {/* Primary Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pt-6">
        {currentUser.role === 'customer' && <CustomerDashboard />}
        {currentUser.role === 'restaurant_owner' && <RestaurantDashboard />}
        {currentUser.role === 'vendor' && <VendorDashboard />}
        {currentUser.role === 'delivery_partner' && <DeliveryPartnerDashboard />}
        {currentUser.role === 'admin' && <AdminDashboard />}
      </main>

      {/* Standalone Cart Drawer for Global Access */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={() => {}}
      />

      {/* Commercial SaaS Footer */}
      <footer className="mt-auto border-t border-white/10 bg-charcoal-900/60 py-8 px-4 lg:px-8 text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-display font-extrabold text-white text-sm">
              Omni<span className="gold-gradient-text">Route</span>™
            </span>
            <span>• Enterprise Smart Delivery & Multi-Vendor Fleet System</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px] text-slate-500 font-mono">
            <span>TSP 2-Opt Dynamic Routing</span>
            <span>•</span>
            <span>1-KM Radar Geofence</span>
            <span>•</span>
            <span>Three.js Realtime WebGL</span>
            <span>•</span>
            <span className="text-emerald-400">99.99% Uptime</span>
          </div>

          <div className="text-right text-[11px]">
            Commercial Client Build v2.4.0 • Ready for Production
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
