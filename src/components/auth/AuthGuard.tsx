
import { useState, useEffect, ReactNode, cloneElement, isValidElement } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface AuthGuardProps {
  children: ReactNode;
  playerOnly?: boolean;
}

export const AuthGuard = ({ children, playerOnly = false }: AuthGuardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState<'coach' | 'player' | null>(null);
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

        // ========== PLAYER DIRECT ACCESS SECTION ==========
        // Check for direct access tokens when accessing a specific player's profile
        if (currentPath.startsWith('/player/') && playerId) {
          console.log("Player direct access path detected, checking for direct access token");
          
          // Check for player direct access tokens
          const directAccess = sessionStorage.getItem('playerDirectAccess');
          
          if (directAccess) {
            try {
              const directAccessData = JSON.parse(directAccess);
              
              // Verify this direct access is for the same player being accessed
              if (directAccessData.id === playerId) {
                console.log("Direct access valid for player:", playerId);
                setUserType('player');
                setIsLoading(false);
                return;
              } else {
                console.log("Direct access token is for different player, redirecting");
                sessionStorage.removeItem('playerDirectAccess');
                navigate("/player-auth");
                return;
              }
            } catch (err) {
              console.error("Error parsing direct access data:", err);
              sessionStorage.removeItem('playerDirectAccess');
            }
          }
        }

        // ========== PLAYER AUTHENTICATION SECTION ==========
        // If this is a player route (playerOnly flag or path starts with /player/)
        if (playerOnly || currentPath.startsWith('/player/') || currentPath === '/player') {
          console.log("Player route detected - checking player authentication");
          
          const playerSession = localStorage.getItem('playerSession') || sessionStorage.getItem('playerSession');
          
          if (!playerSession) {
            console.log("No player session found, redirecting to player login");
            navigate("/player-auth");
            return;
          }
          
          try {
            const playerData = JSON.parse(playerSession);
            console.log("Player session found:", playerData);
            
            // Verify player session using database check or serverless function
            try {
              // Call our serverless function to verify the player session
              const response = await fetch('/.netlify/functions/verify-player-session', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  playerId: playerData.id,
                  playerEmail: playerData.email,
                  userType: 'player'
                }),
              });
              
              const result = await response.json();
              
              if (!response.ok || !result.data) {
                console.error("Invalid player session, redirecting to player login", result.error);
                localStorage.removeItem('playerSession');
                sessionStorage.removeItem('playerSession');
                navigate("/player-auth");
                return;
              }
              
              // Additional check - if the current path specifies a playerId, make sure it matches the session
              if (playerId && playerData.id !== playerId) {
                console.log("Player trying to access another player's profile, redirecting");
                navigate(`/player/${playerData.id}`);
                return;
              }
              
              console.log("Player authenticated successfully");
              setUserType('player');
              setIsLoading(false);
              return;
            } catch (verifyError) {
              console.error("Error verifying player:", verifyError);
              
              // Fallback verification using direct Supabase query
              try {
                const { data: playerDbData, error: playerDbError } = await supabase
                  .from('players')
                  .select('id, email, full_name')
                  .eq('id', playerData.id)
                  .single();
                  
                if (playerDbError || !playerDbData) {
                  console.error("Invalid player session (fallback check), redirecting to player login", playerDbError);
                  localStorage.removeItem('playerSession');
                  sessionStorage.removeItem('playerSession');
                  navigate("/player-auth");
                  return;
                }
                
                // Additional check - if the current path specifies a playerId, make sure it matches the session
                if (playerId && playerData.id !== playerId) {
                  console.log("Player trying to access another player's profile, redirecting");
                  navigate(`/player/${playerData.id}`);
                  return;
                }
                
                console.log("Player authenticated successfully (fallback method)");
                setUserType('player');
                setIsLoading(false);
                return;
              } catch (fallbackError) {
                console.error("Error in fallback verification:", fallbackError);
                navigate("/player-auth");
                return;
              }
            }
          } catch (err) {
            console.error("Error parsing player session:", err);
            localStorage.removeItem('playerSession');
            sessionStorage.removeItem('playerSession');
            navigate("/player-auth");
            return;
          }
        }
        
        // ========== COACH AUTHENTICATION SECTION ==========
        // For all coach routes, require Supabase authentication
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.log("No authenticated Supabase user found, redirecting to auth");
          navigate("/auth");
          return;
        }

        console.log("Coach authenticated successfully");
        setUserType('coach');
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

  // Pass userType as a prop to children
  if (isValidElement(children)) {
    return cloneElement(children, { userType } as any);
  }

  return <>{children}</>;
};
