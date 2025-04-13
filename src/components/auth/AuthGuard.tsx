
import { useState, useEffect, ReactNode, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import PlayerRegistration from "../player/PlayerRegistration";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    // Prevent repeated auth checks
    if (authCheckedRef.current) return;
    
    const checkAuth = async () => {
      try {
        console.log(`Checking auth for route - playerOnly: ${playerOnly}, coachOnly: ${coachOnly}`);
        
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
            console.log("Found authenticated user for player route:", user.id);
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
        
        // Check access to coach routes or general auth routes
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.log("No authenticated Supabase user found - redirecting to auth");
          navigate("/auth");
          return;
        }

        console.log(`User authenticated: ${user.id}, checking if coach access needed: ${coachOnly}`);
        
        // Check if coach-only route requires additional role verification
        if (coachOnly) {
          // המתנה לפני הבדיקה - נותן זמן למידע לעדכן כראוי
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // הורדנו את הבדיקה המוקדמת מטבלת user_roles ובמקום זה נבדוק ישירות בטבלת coaches
          // זה עדיף כי הטבלה הזו יכולה להיות יותר מעודכנת ומדויקת
          const { data: coachData, error: coachError } = await supabase
            .from('coaches')
            .select('id')
            .eq('id', user.id)
            .single();
            
          if (coachError || !coachData) {
            console.log("User does not have coach record:", coachError?.message);
            toast({
              title: "הרשאות חסרות",
              description: "אין לך הרשאה לגשת לעמודי מאמן",
              variant: "destructive"
            });
            navigate("/auth");
            return;
          }
          
          console.log("Coach record confirmed:", coachData.id);
          
          // כעת נבדוק גם את הרשאות המשתמש בטבלת user_roles כגיבוי
          const { data: roles, error: rolesError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
          
          if (!roles || roles.role !== 'coach') {
            console.log("Adding coach role for user:", user.id);
            
            // אם אין רשומה בטבלת user_roles, ניצור אחת
            const { error: insertError } = await supabase
              .from('user_roles')
              .insert({ id: user.id, role: 'coach' });
              
            if (insertError) {
              console.error("Error adding coach role:", insertError);
              // לא נחסום - כל עוד יש רשומת מאמן, נאפשר גישה
            }
          }
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
  }, [navigate, playerId, playerOnly, coachOnly, location.pathname, location.search, toast]);

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
