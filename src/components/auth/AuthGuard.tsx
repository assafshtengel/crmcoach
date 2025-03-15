
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
            console.log("Player session found:", playerData);
            
            // Verify player session using Netlify function
            try {
              const response = await fetch(
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
              );
              
              const result = await response.json();
              
              // Check if verification was successful
              if (response.ok && result.data) {
                console.log("Player authenticated successfully via function");
                setIsLoading(false);
                return;
              } else {
                console.error("Function verification failed:", result.error);
                // Continue to fallback below
              }
            } catch (funcError) {
              console.error("Error calling verification function:", funcError);
              // Continue to fallback below
            }
            
            // Fallback to direct database check if function fails
            console.log("Attempting database verification");
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
          } catch (err) {
            console.error("Error parsing player session:", err);
            localStorage.removeItem('playerSession');
            navigate("/player-auth");
            return;
          }
        }
        
        // ========== COACH AUTHENTICATION SECTION ==========
        // Check for "Remember Me" preference from localStorage first
        const rememberMeEnabled = localStorage.getItem('coachRememberMe') === 'true';
        
        // For all coach routes, require Supabase authentication
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
