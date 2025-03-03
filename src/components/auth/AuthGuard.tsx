
import { useState, useEffect, ReactNode } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
        // Check if this is a player route
        if (playerOnly) {
          const playerSession = localStorage.getItem('playerSession');
          
          if (!playerSession) {
            console.log("No player session found, redirecting to player login");
            navigate("/player-auth");
            return;
          }
          
          setIsLoading(false);
          return;
        }
        
        // Handle player profile page with ID parameter
        if (playerId && window.location.pathname.includes('/player-profile/')) {
          const playerSession = localStorage.getItem('playerSession');
          
          if (playerSession) {
            const playerData = JSON.parse(playerSession);
            
            if (playerData.id === playerId) {
              setIsLoading(false);
              return;
            } else {
              console.log("Player trying to access unauthorized profile");
              localStorage.removeItem('playerSession');
              navigate("/player-auth");
              return;
            }
          }
        }
        
        // For coach routes, check Supabase auth
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.log("No authenticated Supabase user found");
          navigate("/auth");
          return;
        }

        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (roleError) {
          console.error("Error fetching user role:", roleError);
          navigate("/auth");
          return;
        }

        if (!roleData || roleData.role !== 'coach') {
          console.log("User is not a coach, redirecting to login");
          await supabase.auth.signOut();
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
