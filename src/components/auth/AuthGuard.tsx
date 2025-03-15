
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
        // Get the current path for easier reference
        const currentPath = location.pathname;
        console.log("Current path:", currentPath);

        // Public routes - always allow access without any authentication
        const publicRoutes = [
          '/auth',
          '/player-auth',
          '/signup-coach',
          '/register'
        ];
        
        // Check if current path is a public route or registration path
        if (publicRoutes.includes(currentPath) || currentPath.includes('/register/')) {
          console.log("Public route detected - bypassing all auth checks");
          setIsLoading(false);
          return;
        }

        // ========== PLAYER AUTHENTICATION SECTION ==========
        // If this is a player route (playerOnly flag or path starts with /player/)
        if (playerOnly || currentPath.startsWith('/player/') || currentPath === '/player') {
          console.log("Player route detected - checking player authentication");
          const playerSession = localStorage.getItem('playerSession');
          
          if (!playerSession) {
            console.log("No player session found, redirecting to player login");
            navigate("/player-auth");
            return;
          }
          
          try {
            const playerData = JSON.parse(playerSession);
            
            // Use a completely independent query for player authentication
            // This ensures it's not affected by coach authentication state
            const { data, error } = await fetch(
              `${window.location.origin}/.netlify/functions/verify-player-session`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  playerId: playerData.id,
                  playerEmail: playerData.email.toLowerCase(),
                }),
              }
            ).then(res => res.json());
            
            // Fallback to direct database check if function fails
            if (error || !data) {
              // Direct database verification as fallback
              const { data: playerDbData, error: playerDbError } = await supabase
                .from('players')
                .select('id, email, full_name')
                .ilike('email', playerData.email.toLowerCase())
                .eq('id', playerData.id)
                .single();
                
              if (playerDbError || !playerDbData) {
                console.error("Invalid player session, redirecting to player login", playerDbError);
                localStorage.removeItem('playerSession');
                navigate("/player-auth");
                return;
              }
              
              console.log("Player authenticated successfully (fallback)");
              setIsLoading(false);
              return;
            }
            
            console.log("Player authenticated successfully");
            setIsLoading(false);
            return;
          } catch (err) {
            console.error("Error parsing player session:", err);
            localStorage.removeItem('playerSession');
            navigate("/player-auth");
            return;
          }
        }
        
        // ========== COACH AUTHENTICATION SECTION ==========
        // This section is completely separate from player auth
        
        // Player profile view for coaches - allow access for coach
        if (playerId && currentPath.includes('/player-profile/')) {
          // Check for coach auth only
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error || !user) {
            console.log("No authenticated coach found, redirecting to auth");
            navigate("/auth");
            return;
          }
          
          console.log("Coach authenticated for viewing player profile");
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

        console.log("Coach authenticated successfully");
        setIsLoading(false);
      } catch (error) {
        console.error("Authentication check failed:", error);
        // Redirect based on the route type
        if (playerOnly || location.pathname.startsWith('/player/') || location.pathname === '/player') {
          navigate("/player-auth");
        } else {
          navigate("/auth");
        }
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
