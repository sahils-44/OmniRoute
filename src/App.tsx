import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
import { ForgotPasswordPage } from './routes/pages/ForgotPasswordPage';
import { UnauthorizedPage } from './routes/pages/UnauthorizedPage';
import { NotFoundPage } from './routes/pages/NotFoundPage';
import { AuthenticationGuard } from './routes/guards/AuthenticationGuard';
import { RoleGuard } from './routes/guards/RoleGuard';

const RoleRedirect: React.FC = () => {
  const { currentUser } = useApp();
  switch (currentUser.role) {
    case 'restaurant_owner':
    case 'hotel_owner':
      return <Navigate to="/hotel/dashboard" replace />;
    case 'vendor':
      return <Navigate to="/vendor/dashboard" replace />;
    case 'delivery_partner':
      return <Navigate to="/delivery/dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'customer':
    default:
      return <Navigate to="/customer/dashboard" replace />;
  }
};

const MainLayout: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

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
        <Outlet />
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
      <BrowserRouter>
        <Routes>
          {/* Public Authentication & Error Routes */}
          <Route path="/login" element={<AuthPage defaultMode="login" />} />
          <Route path="/register" element={<AuthPage defaultMode="signup" />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Legacy & Shortcut Redirects */}
          <Route path="/restaurant/*" element={<Navigate to="/hotel/dashboard" replace />} />

          {/* Protected Routes Hierarchy */}
          <Route element={<AuthenticationGuard />}>
            <Route element={<MainLayout />}>
              {/* Intelligent Root Role Dispatcher */}
              <Route path="/" element={<RoleRedirect />} />

              {/* 1. Customer Routes */}
              <Route element={<RoleGuard allowedRoles={['customer']} />}>
                <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />
                <Route path="/customer/*" element={<CustomerDashboard />} />
              </Route>

              {/* 2. Hotel Owner Routes */}
              <Route element={<RoleGuard allowedRoles={['restaurant_owner', 'hotel_owner']} />}>
                <Route path="/hotel" element={<Navigate to="/hotel/dashboard" replace />} />
                <Route path="/hotel/*" element={<RestaurantDashboard />} />
              </Route>

              {/* 3. Local Street Vendor Routes */}
              <Route element={<RoleGuard allowedRoles={['vendor']} />}>
                <Route path="/vendor" element={<Navigate to="/vendor/dashboard" replace />} />
                <Route path="/vendor/*" element={<VendorDashboard />} />
              </Route>

              {/* 4. Delivery Partner Routes */}
              <Route element={<RoleGuard allowedRoles={['delivery_partner']} />}>
                <Route path="/delivery" element={<Navigate to="/delivery/dashboard" replace />} />
                <Route path="/delivery/*" element={<DeliveryPartnerDashboard />} />
              </Route>

              {/* 5. Administration Routes */}
              <Route element={<RoleGuard allowedRoles={['admin']} />}>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
              </Route>
            </Route>
          </Route>

          {/* 404 Route Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
