import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { currentUser } = useApp();

  // Normalize hotel_owner and restaurant_owner equivalence
  const effectiveUserRole: UserRole =
    currentUser.role === 'hotel_owner' ? 'restaurant_owner' : currentUser.role;

  const isAllowed = allowedRoles.some(role => {
    const effectiveAllowed: UserRole = role === 'hotel_owner' ? 'restaurant_owner' : role;
    return effectiveAllowed === effectiveUserRole;
  });

  if (!isAllowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
