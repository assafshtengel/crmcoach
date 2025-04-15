
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook to check for session expiration
 * @param checkIntervalMs - How often to check for expiration (in milliseconds)
 * @param redirectPath - Where to redirect after logout (default: /player-auth)
 */
export const useSessionExpiry = (
  checkIntervalMs: number = 60000,
  redirectPath: string = '/player-auth'
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const intervalRef = useRef<number | null>(null);

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      toast({
        variant: "destructive",
        title: "פג תוקף החיבור",
        description: "פג תוקף החיבור שלך. אנא התחבר מחדש.",
      });
      
      // Navigate to login page
      navigate(redirectPath);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const checkSessionValidity = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      
      if (!session) {
        // No active session found
        return;
      }
      
      // Check if session has expired
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const expiryTimestamp = expiresAt * 1000; // Convert to milliseconds
        const currentTimestamp = Date.now();
        
        if (currentTimestamp >= expiryTimestamp) {
          console.log("Session expired at:", new Date(expiryTimestamp));
          console.log("Current time:", new Date(currentTimestamp));
          
          // Session has expired, log user out
          await handleLogout();
        }
      }
    } catch (error) {
      console.error("Error checking session validity:", error);
    }
  };

  // Start checking for session expiry
  const startSessionExpiryChecker = () => {
    // Run an initial check
    checkSessionValidity();
    
    // Set up the interval
    intervalRef.current = window.setInterval(checkSessionValidity, checkIntervalMs);
    
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  };

  useEffect(() => {
    const cleanup = startSessionExpiryChecker();
    return cleanup;
  }, []);

  // Return functions that might be useful to the component
  return {
    checkSessionValidity,
    handleLogout
  };
};
