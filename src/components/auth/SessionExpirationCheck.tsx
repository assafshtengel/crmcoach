
import { useEffect } from 'react';
import { useSessionExpiry } from '@/hooks/useSessionExpiry';

/**
 * Component to add session expiration checking to any page
 * Just include this component once at the app level to enable session checking
 */
export const SessionExpirationCheck: React.FC = () => {
  const { checkSessionValidity, handleLogout } = useSessionExpiry();

  useEffect(() => {
    // Perform an initial check when component mounts
    checkSessionValidity();

    // Make the handleLogout function globally available for reuse across the application
    if (typeof window !== 'undefined') {
      (window as any).playerLogout = handleLogout;
    }

    return () => {
      // Cleanup the global function reference when component unmounts
      if (typeof window !== 'undefined') {
        delete (window as any).playerLogout;
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
};
