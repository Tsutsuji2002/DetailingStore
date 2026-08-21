import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppStore';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, redirectTo = '/login' }) => {
  const { isAuthenticated, user } = useAppSelector(s => s.auth);

  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    // Admin can access everything, staff can access staff+user, customer can access user
    const roleHierarchy: Record<UserRole, UserRole[]> = {
      admin: ['admin', 'staff', 'customer'],
      staff: ['staff', 'customer'],
      customer: ['customer'],
    };
    const allowedRoles: UserRole[] = user ? roleHierarchy[user.role] : [];
    const hasAccess = roles.some(r => allowedRoles.includes(r));
    if (!hasAccess) return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
