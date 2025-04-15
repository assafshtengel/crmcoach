
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook to check for session expiration
 * @param checkIntervalMs - How often to check for expiration (in milliseconds)
 * @param redirectPath - Where to redirect after logout (default: /player-auth)
 * @param showExpiryToast - Whether to show a toast when session expires (default: true)
 */
export const useSessionExpiry = (
  checkIntervalMs: number = 60000,
  redirectPath: string = '/player-auth',
  showExpiryToast: boolean = true
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const intervalRef = useRef<number | null>(null);

  /**
   * Comprehensive logout function that:
   * 1. Clears any local state
   * 2. Signs out the user from Supabase
   * 3. Navigates to the specified redirect path
   * 4. Optionally shows a toast message
   * @param message - Optional message to show in toast
   * @param title - Optional title for the toast
   * @param variant - Toast variant (default: default)
   */
  const handleLogout = async (
    message?: string, 
    title: string = "התנתקות מהמערכת", 
    variant: "default" | "destructive" = "default"
  ) => {
    try {
      // Clear any app state stored in localStorage
      // This is a general cleanup - specific apps may need to clear additional keys
      localStorage.removeItem('supabase.auth.token');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Show toast if a message is provided
      if (message) {
        toast({
          variant,
          title,
          description: message,
        });
      }
      
      // Navigate to login page
      navigate(redirectPath);
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בהתנתקות",
        description: "אירעה שגיאה בתהליך ההתנתקות. אנא נסה שוב.",
      });
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
          if (showExpiryToast) {
            await handleLogout(
              "פג תוקף החיבור שלך. אנא התחבר מחדש.",
              "פג תוקף החיבור",
              "destructive"
            );
          } else {
            await handleLogout();
          }
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
