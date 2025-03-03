
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface PlayerGuardProps {
  children: React.ReactNode;
}

export const PlayerGuard = ({ children }: PlayerGuardProps) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

        // בדיקה אם המשתמש הוא שחקן (לפי המטא-דאטה)
        const isPlayer = session.user.user_metadata?.player_id;
        
        if (!isPlayer) {
          // אם המשתמש לא שחקן, נעביר אותו לדף המאמנים
          navigate("/");
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate("/player-auth");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return <div>טוען...</div>;
  }

  return <>{children}</>;
};
