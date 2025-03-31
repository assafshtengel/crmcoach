
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

/**
 * Component that redirects coaches to /index when they access the root path
 * Other users (players, guests) will continue to see the normal root content
 */
export const CoachRedirect = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [isCoach, setIsCoach] = useState(false);

  useEffect(() => {
    const checkIfCoach = async () => {
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if user exists in coaches table
          const { data: coachData, error: coachError } = await supabase
            .from('coaches')
            .select('id')
            .eq('id', user.id)
            .single();
            
          if (!coachError && coachData) {
            setIsCoach(true);
          }
        }
      } catch (error) {
        console.error("Error checking if user is coach:", error);
      } finally {
        setLoading(false);
      }
    };

    checkIfCoach();
  }, []);

  // While checking, show nothing (or could add a loading spinner here)
  if (loading) {
    return null;
  }

  // If user is a coach, redirect to /index, otherwise show normal content
  return isCoach ? <Navigate to="/index" replace /> : <>{children}</>;
};
