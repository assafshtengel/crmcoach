
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
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
          .maybeSingle();

        console.log("Role data:", roleData); // בדיקת נתוני התפקיד

        if (roleError) {
          console.error("Error fetching user role:", roleError);
          return;
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
        const isCoach = roleData?.role === 'coach';
        
        console.log("Is coach?", isCoach); // בדיקת תפקיד המשתמש
        console.log("Current path:", location.pathname); // בדיקת הנתיב הנוכחי

        if (location.pathname === '/auth') {
          if (isCoach) {
            console.log("Navigating coach to home");
            navigate('/');
          } else {
            console.log("Navigating player to dashboard");
            navigate('/dashboard-player');
          }
          return;
        }

        // אם המשתמש הוא מאמן אבל נמצא בדף של שחקן, ננתב אותו לדף המאמן
        if (isCoach && location.pathname.includes('dashboard-player')) {
          console.log("Coach on player page, redirecting to coach dashboard");
          navigate('/');
          return;
        }

        // אם המשתמש הוא שחקן אבל נמצא בדף של מאמן, ננתב אותו לדף השחקן
        if (!isCoach && location.pathname === '/') {
          console.log("Player on coach page, redirecting to player dashboard");
          navigate('/dashboard-player');
          return;
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
