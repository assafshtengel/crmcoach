
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
        // Always allow access to public registration routes without any checks
        if (location.pathname.includes('/register/')) {
          console.log("Public registration page - bypassing all auth checks");
          setIsLoading(false);
          return;
        }

        // בדיקה אם זה נתיב שחקן
        if (playerOnly) {
          const playerSession = localStorage.getItem('playerSession');
          
          if (!playerSession) {
            console.log("No player session found, redirecting to player login");
            navigate("/player-auth");
            return;
          }
          
          // אימות מפגש שחקן - בדיקה אם השחקן קיים במסד הנתונים
          try {
            const playerData = JSON.parse(playerSession);
            const { data, error } = await supabase
              .from('players')
              .select('id, email, password')
              .eq('id', playerData.id)
              .eq('email', playerData.email)
              .eq('password', playerData.password)
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
          
          setIsLoading(false);
          return;
        }
        
        // טיפול בדף פרופיל שחקן עם פרמטר ID
        if (playerId && window.location.pathname.includes('/player-profile/')) {
          // First check for player session
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
            console.log("No authenticated user found");
            navigate("/auth");
            return;
          }
        }
        
        // בנתיבי מאמן, בדיקת אימות Supabase
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.log("No authenticated Supabase user found");
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
