
import { useState, useEffect, ReactNode, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface AuthGuardProps {
  children: ReactNode;
  playerOnly?: boolean;
  coachOnly?: boolean;
}

export const AuthGuard = ({ children, playerOnly = false, coachOnly = false }: AuthGuardProps) => {
  const [isLoading, setIsLoading] = useState(true);
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
              console.log("User authenticated but not found in players table");
              toast({
                title: "אינך רשום כשחקן",
                description: "יש להירשם תחילה כשחקן או להתחבר עם חשבון שחקן",
                variant: "destructive"
              });
              navigate("/player-auth");
              return;
            }
            
            console.log("Player record found:", playerData.id);
            
            // Optionally check user_roles for role=player
            const { data: roles, error: rolesError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('id', user.id)
              .maybeSingle();
              
            if (rolesError) {
              console.error("Error checking user role:", rolesError);
            }
            
            if (roles && roles.role !== 'player') {
              console.log("User does not have player role:", roles);
              toast({
                title: "הרשאות חסרות",
                description: "אין לך הרשאות גישה לאזור השחקנים",
                variant: "destructive"
              });
              navigate("/player-auth");
              return;
            }
            
            // If access to the coach section is attempted by a player
            if (coachOnly) {
              console.log("Player trying to access coach route");
              toast({
                title: "גישה מוגבלת",
                description: "אזור זה מיועד למאמנים בלבד",
                variant: "destructive"
              });
              navigate("/player/dashboard");
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
          // Check coaches table first
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
          
          // Also check user_roles as a backup
          const { data: roles, error: rolesError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
          
          if (!roles || roles.role !== 'coach') {
            // If no role record exists, create one since we already confirmed coach status
            console.log("Adding coach role for user:", user.id);
            
            const { error: insertError } = await supabase
              .from('user_roles')
              .insert({ id: user.id, role: 'coach' });
              
            if (insertError) {
              console.error("Error adding coach role:", insertError);
            }
          }
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
  }, [navigate, playerId, playerOnly, coachOnly, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};
