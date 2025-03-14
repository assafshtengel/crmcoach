
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

        // Player routes - check player authentication
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
            
            // Verify player credentials directly in the database
            // This check is completely independent of coach authentication
            const { data, error } = await supabase
              .from('players')
              .select('id, email, full_name')
              .eq('email', playerData.email.toLowerCase())
              .eq('id', playerData.id)
              .single();
              
            if (error || !data) {
              console.error("Invalid player session, redirecting to player login", error);
              localStorage.removeItem('playerSession');
              navigate("/player-auth");
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
        
        // From here on, we're dealing with coach routes only
        
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
