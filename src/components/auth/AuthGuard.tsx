
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
        // בדיקה אם זה נתיב שחקן
        if (playerOnly) {
          // First, check with Supabase auth
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          
          if (authError || !user) {
            console.log("No authenticated Supabase user found for player route");
            
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
              const { data, error } = await supabase
                .from('players')
                .select('id')
                .eq('id', playerData.id)
                .maybeSingle();
                
              if (error || !data) {
                console.log("Invalid player session, redirecting to player login");
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
          } else {
            // We have a valid authenticated user, check if they have a player record
            setNeedsPlayerRegistration(true);
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
        }
        
        // בדיקת גישה לנתיבי מאמן
        if (coachOnly) {
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error || !user) {
            console.log("No authenticated Supabase user found");
            navigate("/auth");
            return;
          }

          // המשך הטיפול בנתיבי מאמן
        }
        
        // טיפול בדף פרופיל שחקן עם פרמטר ID
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
        
        // בנתיבי מאמן, בדיקת אימות Supabase
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.log("No authenticated Supabase user found");
          navigate("/auth");
          return;
        }

        // כאשר מאמן מתחבר מעבר ישיר לדשבורד מאמן במידה ומנסה להיכנס לעמוד הראשי
        if (location.pathname === '/') {
          navigate('/dashboard-coach');
          return;
        }

        // מאחר שאנחנו מאפשרים למאמנים להתחבר מיד לאחר הרשמה, לא נבדוק הרשאות באופן מחמיר
        setIsLoading(false);
      } catch (error) {
        console.error("Authentication check failed:", error);
        navigate("/auth");
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
