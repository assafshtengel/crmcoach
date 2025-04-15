
import { useEffect } from 'react';
import { useSessionExpiry } from '@/hooks/useSessionExpiry';

/**
 * Component to add session expiration checking to any page
 * Just include this component once at the app level to enable session checking
 */
export const SessionExpirationCheck: React.FC = () => {
  const { checkSessionValidity } = useSessionExpiry();

  useEffect(() => {
    // Perform an initial check when component mounts
    checkSessionValidity();
  }, []);

  // This component doesn't render anything
  return null;
};
