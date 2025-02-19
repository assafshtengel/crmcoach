
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

        console.log("User role data:", roleData); // נוסיף לוג לבדיקת הרול

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
        
        console.log("Is user a coach?", isCoach); // נוסיף לוג לבדיקה האם המשתמש הוא מאמן
        console.log("Current location:", location.pathname); // נוסיף לוג למיקום הנוכחי

        const isOnCoachPage = location.pathname.includes('coach');
        const isOnPlayerPage = location.pathname.includes('player');

        // אם המשתמש הוא מאמן אבל נמצא בדף של שחקן, ננתב אותו לדף המאמן
        if (isCoach && isOnPlayerPage) {
          console.log("Redirecting coach to coach dashboard"); // נוסיף לוג להפניה
          navigate('/coach-dashboard');
          return;
        }

        // אם המשתמש הוא שחקן אבל נמצא בדף של מאמן, ננתב אותו לדף השחקן
        if (!isCoach && isOnCoachPage) {
          console.log("Redirecting player to player dashboard"); // נוסיף לוג להפניה
          navigate('/dashboard-player');
          return;
        }

        // אם המשתמש בדף הבית, ננתב אותו לדף המתאים
        if (location.pathname === '/') {
          console.log("Redirecting from home to appropriate dashboard"); // נוסיף לוג להפניה
          navigate(isCoach ? '/coach-dashboard' : '/dashboard-player');
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
