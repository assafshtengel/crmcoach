
import { useState, useEffect, ReactNode } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import PlayerRegistration from "../player/PlayerRegistration";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
  const { isAuthenticated, user, isPlayer, isCoach } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // בדיקה אם זה נתיב שחקן
        if (playerOnly) {
          if (!isAuthenticated) {
            console.log("No authenticated user found for player route");
            
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
          } else if (!isPlayer && isCoach) {
            // Someone is authenticated but as coach, not player
            toast({
              title: "הרשאות שגויות",
              description: "אתה מחובר כמאמן, לא כשחקן. אנא התחבר כשחקן.",
              variant: "destructive",
            });
            navigate("/player-auth");
            return;
          } else if (isAuthenticated && user) {
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
        }
        
        // בדיקת גישה לנתיבי מאמן
        if (coachOnly) {
          if (!isAuthenticated) {
            console.log("No authenticated user found");
            navigate("/auth");
            return;
          } else if (!isCoach && isPlayer) {
            // Someone is authenticated but as player, not coach
            toast({
              title: "הרשאות שגויות",
              description: "אתה מחובר כשחקן, לא כמאמן. אנא התחבר כמאמן.",
              variant: "destructive",
            });
            navigate("/auth");
            return;
          }
        }
        
        // טיפול בדף פרופיל שחקן עם פרמטר ID
        if (playerId && window.location.pathname.includes('/player-profile/')) {
          const playerSession = localStorage.getItem('playerSession');
          
          if (playerSession) {
            const playerData = JSON.parse(playerSession);
            
            if (playerData.id === playerId) {
              return;
            } else {
              console.log("Player trying to access unauthorized profile");
              localStorage.removeItem('playerSession');
              navigate("/player-auth");
              return;
            }
          }
        }
        
        // כאשר מאמן מתחבר מעבר ישיר לדשבורד מאמן במידה ומנסה להיכנס לעמוד הראשי
        if (location.pathname === '/' && isCoach && isAuthenticated) {
          navigate('/dashboard-coach');
          return;
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, playerId, playerOnly, coachOnly, location.pathname, location.search, isAuthenticated, isPlayer, isCoach, user, toast]);

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
