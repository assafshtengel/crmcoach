
import { useState, useEffect, ReactNode } from "react";
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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If this is a player route
        if (playerOnly) {
          // First, check with Supabase auth
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.log("Auth error:", authError);
            // Check for legacy player session as fallback
            handleLegacyPlayerAuth();
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
            
            // Redirect from original profile page to alternative profile page
            if (location.pathname === "/player/profile") {
              navigate("/player/profile-alt");
              return;
            }

            // Players shouldn't access coach routes
            if (coachOnly) {
              navigate("/player/questionnaires");
              return;
            }
            
            setIsLoading(false);
            return;
          } else {
            console.log("No authenticated Supabase user found for player route");
            // No Supabase auth, check legacy player session
            handleLegacyPlayerAuth();
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

          // Coach route handling continues here
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

        // Since we allow coaches to log in immediately after registration, no strict permission check
        setIsLoading(false);
      } catch (error) {
        console.error("Authentication check failed:", error);
        navigate("/auth");
      }
    };

    const handleLegacyPlayerAuth = () => {
      // Fallback to legacy player session
      const playerSession = localStorage.getItem('playerSession');
      if (!playerSession) {
        console.log("No player session found, redirecting to player login");
        // Save the current path for redirect after login
        const currentPath = location.pathname + location.search;
        navigate(`/player-auth?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }
      
      // Legacy player session handling
      try {
        const playerData = JSON.parse(playerSession);
        // Verify player ID exists and proceed
        if (playerData && playerData.id) {
          console.log("Using legacy player session with ID:", playerData.id);
          setIsLoading(false);
          return;
        } else {
          console.log("Invalid player session, redirecting to player login");
          localStorage.removeItem('playerSession');
          navigate("/player-auth");
        }
      } catch (err) {
        console.error("Error parsing player session:", err);
        localStorage.removeItem('playerSession');
        navigate("/player-auth");
      }
    };

    checkAuth();
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
