
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface PlayerProfileGuardProps {
  children: React.ReactNode;
}

export const PlayerProfileGuard = ({ children }: PlayerProfileGuardProps) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { playerId } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          navigate("/player-auth");
          return;
        }

        if (!session) {
          navigate("/player-auth");
          return;
        }

        // Check if the user has access to this player profile
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) {
          navigate("/player-auth");
          return;
        }
        
        // Get player info associated with current user email
        const { data: playerData } = await supabase
          .from('players')
          .select('id')
          .eq('email', userData.user.email)
          .maybeSingle();
        
        // Check if coach (they have access to all player profiles)
        const { data: coachData } = await supabase
          .from('coaches')
          .select('id')
          .eq('email', userData.user.email)
          .maybeSingle();
        
        const isCoach = !!coachData;
        
        // Allow access if the user is the player or is a coach
        if (isCoach || (playerData && playerData.id === playerId)) {
          // Success - continue rendering
        } else {
          // Unauthorized - redirect to login
          toast({
            title: "גישה נדחתה",
            description: "אין לך הרשאות לצפות בדף זה",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          navigate("/player-auth");
          return;
        }
      } catch (error) {
        console.error("Fatal error checking auth status:", error);
        navigate("/player-auth");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast, playerId]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center">טוען...</div>;
  }

  return <>{children}</>;
};
