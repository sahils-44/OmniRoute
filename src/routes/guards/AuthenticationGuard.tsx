import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LoadingScreen } from '../../components/auth/LoadingScreen';

export const AuthenticationGuard: React.FC = () => {
  const { currentUser, firebaseUser, authLoading, isGuestDemo } = useApp();
  const location = useLocation();

  if (authLoading) {
    return <LoadingScreen />;
  }

  // If unauthenticated and not in guest demo mode, redirect to /login
  if (!firebaseUser && !isGuestDemo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Validate account status: If account is suspended, block access
  if (currentUser?.status === 'suspended') {
    return <Navigate to="/unauthorized" state={{ suspended: true }} replace />;
  }

  return <Outlet />;
};
