
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface PrivateRouteProps {
  children: React.ReactNode;
  playerOnly?: boolean;
  coachOnly?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  playerOnly = false, 
  coachOnly = false 
}) => {
  const { isAuthenticated, isLoading, isPlayer, isCoach } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">טוען...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Save current location to redirect after login
    const redirectPath = encodeURIComponent(location.pathname + location.search);
    
    // Redirect to the appropriate auth page based on the expected role
    if (playerOnly) {
      return <Navigate to={`/player-auth?redirect=${redirectPath}`} replace />;
    }
    return <Navigate to={`/auth?redirect=${redirectPath}`} replace />;
  }

  // Role-based access checks
  if (playerOnly && !isPlayer) {
    return <Navigate to="/auth" replace />;
  }

  if (coachOnly && !isCoach) {
    return <Navigate to="/player-auth" replace />;
  }

  // User is authenticated and has the correct role
  return <>{children}</>;
};

export default PrivateRoute;
