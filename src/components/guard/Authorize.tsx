// src/components/guard/Authorize.tsx
import React from 'react';
import { useAuthStore, type AdminRole } from '../../store/authStore';

interface AuthorizeProps {
  allowedRoles: AdminRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode; // Optional UI to show if unauthorized
}

/**
 * Layer C: Component Level RBAC Guard
 * Wraps UI elements (buttons, forms, links) and checks if the current 
 * logged-in user has the required role to view/interact with them.
 */
export const Authorize: React.FC<AuthorizeProps> = ({ allowedRoles, children, fallback = null }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  const hasPermission = allowedRoles.includes(user.role);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};