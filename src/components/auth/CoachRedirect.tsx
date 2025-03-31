import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface CoachRedirectProps {
  children: React.ReactNode;
}

export const CoachRedirect = ({ children }: CoachRedirectProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isCoach, setIsCoach] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkIfCoach = async () => {
      try {
        // Get the current logged-in user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if the user exists in the coaches table
          const { data: coachData, error } = await supabase
            .from('coaches')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();
          
          if (!error && coachData) {
            // User is a coach, set flag to redirect
            setIsCoach(true);
          }
        }
      } catch (error) {
        console.error("Error checking coach status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkIfCoach();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // If user is a coach, redirect to /index
  if (isCoach) {
    return <Navigate to="/index" replace />;
  }

  // Otherwise, render children (the original route content)
  return <>{children}</>;
};
