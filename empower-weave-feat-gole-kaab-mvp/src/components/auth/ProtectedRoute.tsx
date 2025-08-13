import React from 'react';
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role: requiredRole }) => {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};