import { useState, useEffect, ReactNode, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import PlayerRegistration from "../player/PlayerRegistration";

interface AuthGuardProps {
  children: ReactNode;
  playerOnly?: boolean;
  coachOnly?: boolean;
}

export const AuthGuard = ({ children, playerOnly = false, coachOnly = false }: AuthGuardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [needsPlayerRegistration, setNeedsPlayerRegistration] = useState(false);
  const navigate = useNavigate();
  const { playerId } = useParams<{ playerId: string }>();
  const location = useLocation();
  const authCheckedRef = useRef(false);

  useEffect(() => {
    // Prevent repeated auth checks
    if (authCheckedRef.current) return;
    
    const checkAuth = async () => {
      try {
        // If this is a player route
        if (playerOnly) {
          // First, check with Supabase auth
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.log("Auth error:", authError);
            navigate(`/player-auth?redirect=${encodeURIComponent(location.pathname + location.search)}`);
            return;
          }
          
          if (user) {
            console.log("Found authenticated user:", user.id);
            // Player is authenticated via Supabase, check if they have a player record
            const { data: playerData, error: playerError } = await supabase
              .from('players')
              .select('id')
              .eq('id', user.id)
              .maybeSingle();
              
            if (playerError) {
              console.error("Error checking player record:", playerError);
            }
            
            if (!playerData) {
              console.log("User authenticated but not found in players table - registration needed");
              setNeedsPlayerRegistration(true);
            } else {
              console.log("Player record found:", playerData.id);
            }
            
            // Modify redirect logic to use includes and check routes more flexibly
            const currentPath = location.pathname;
            const isProfileRoute = 
              currentPath === "/player/profile" || 
              currentPath === "/player/profile-alt";

            if (isProfileRoute && !currentPath.endsWith("-alt")) {
              navigate("/player/profile-alt");
              return;
            }

            // Players shouldn't access coach routes
            if (coachOnly) {
              navigate("/player/questionnaires");
              return;
            }
            
            // Mark auth as checked
            authCheckedRef.current = true;
            setIsLoading(false);
            return;
          } else {
            console.log("No authenticated Supabase user found for player route");
            navigate(`/player-auth?redirect=${encodeURIComponent(location.pathname + location.search)}`);
            return;
          }
        }
        
        // Check access to coach routes
        if (coachOnly) {
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error || !user) {
            console.log("No authenticated Supabase user found");
            navigate("/auth");
            return;
          }
          
          // Check if user has admin role (needed for admin-only pages)
          const { data: roles, error: rolesError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('id', user.id)
            .single();
            
          if (rolesError || !roles || roles.role !== 'coach') {
            console.log("User does not have sufficient permissions");
            navigate("/auth");
            return;
          }
        }
        
        // For coach routes, check Supabase authentication
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.log("No authenticated Supabase user found");
          navigate("/auth");
          return;
        }

        // When a coach logs in, direct to coach dashboard if trying to access the root path
        if (location.pathname === '/') {
          navigate('/dashboard-coach');
          return;
        }

        // Mark auth as checked
        authCheckedRef.current = true;
        setIsLoading(false);
      } catch (error) {
        console.error("Authentication check failed:", error);
        navigate("/auth");
      }
    };

    checkAuth();
    // Include location.pathname in dependencies to re-run check when route changes
  }, [navigate, playerId, playerOnly, coachOnly, location.pathname, location.search]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <>
      {needsPlayerRegistration && <PlayerRegistration />}
      {children}
    </>
  );
};
