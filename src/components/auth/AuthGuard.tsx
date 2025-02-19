
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { AuthChangeEvent } from "@supabase/supabase-js";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          navigate("/auth");
          return;
        }

        if (!session) {
          navigate("/auth");
          return;
        }

        // בדיקת תפקיד המשתמש והפניה לדף המתאים
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();  // שימוש ב-maybeSingle במקום single

        if (roleError) {
          console.error("Error fetching user role:", roleError);
        }

        // Session exists but let's verify it's still valid
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error("Error refreshing session:", refreshError);
          // Clear any existing session data
          await supabase.auth.signOut();
          toast({
            title: "פג תוקף החיבור",
            description: "אנא התחבר מחדש",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        // נתב את המשתמש לדף המתאים לפי התפקיד שלו
        if (location.pathname === '/') {
          if (roleData?.role === 'coach') {
            navigate('/coach-dashboard');
          } else {
            // אם אין תפקיד או התפקיד הוא שחקן, ננתב לדף השחקן
            navigate('/dashboard-player');
          }
        }
      } catch (error) {
        console.error("Fatal error checking auth status:", error);
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      } else if (!session && event !== 'INITIAL_SESSION') {
        navigate("/auth");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, location]);

  if (loading) {
    return <div>טוען...</div>;
  }

  return <>{children}</>;
};
