import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/auth.types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  // Si es true, los admins también pueden entrar aunque no estén en allowedRoles
  adminCanAccess?: boolean;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  adminCanAccess = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si adminCanAccess es true y el usuario es admin, permitir acceso
  if (adminCanAccess && user?.role === 'admin') {
    return <>{children}</>;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
