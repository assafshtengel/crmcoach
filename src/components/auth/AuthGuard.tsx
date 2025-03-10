
import { useState, useEffect, ReactNode } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface AuthGuardProps {
  children: ReactNode;
  playerOnly?: boolean;
}

export const AuthGuard = ({ children, playerOnly = false }: AuthGuardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { playerId } = useParams<{ playerId: string }>();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Public routes - always allow access without any authentication
        if (
          location.pathname.includes('/register/') || 
          location.pathname === '/player-auth'
        ) {
          console.log("Public route - bypassing all auth checks");
          setIsLoading(false);
          return;
        }

        // Player-only routes - check player authentication
        if (playerOnly) {
          const playerSession = localStorage.getItem('playerSession');
          
          if (!playerSession) {
            console.log("No player session found, redirecting to player login");
            navigate("/player-auth");
            return;
          }
          
          try {
            const playerData = JSON.parse(playerSession);
            
            // Verify player credentials directly in the database, without requiring coach authentication
            const { data, error } = await supabase
              .from('players')
              .select('id, email, password')
              .eq('email', playerData.email)
              .eq('password', playerData.password)
              .single();
              
            if (error || !data) {
              console.log("Invalid player session, redirecting to player login", error);
              localStorage.removeItem('playerSession');
              navigate("/player-auth");
              return;
            }
            
            // Make sure the session ID matches the database ID
            if (data.id !== playerData.id) {
              console.log("Player ID mismatch, redirecting to player login");
              localStorage.removeItem('playerSession');
              navigate("/player-auth");
              return;
            }
          } catch (err) {
            console.error("Error parsing player session:", err);
            localStorage.removeItem('playerSession');
            navigate("/player-auth");
            return;
          }
          
          setIsLoading(false);
          return;
        }
        
        // Route for viewing a specific player's profile - allow access for both
        // the player themselves or the coach who manages this player
        if (playerId && location.pathname.includes('/player-profile/')) {
          // First check for player session (player viewing their own profile)
          const playerSession = localStorage.getItem('playerSession');
          
          if (playerSession) {
            const playerData = JSON.parse(playerSession);
            
            if (playerData.id === playerId) {
              setIsLoading(false);
              return;
            }
          }

          // If no valid player session, check for coach auth
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error || !user) {
            console.log("No authenticated user found, redirecting to auth");
            navigate("/auth");
            return;
          }
          
          setIsLoading(false);
          return;
        }
        
        // For all other coach routes, require Supabase authentication
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.log("No authenticated Supabase user found, redirecting to auth");
          navigate("/auth");
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Authentication check failed:", error);
        navigate("/auth");
      }
    };

    checkAuth();
  }, [navigate, playerId, playerOnly, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};
