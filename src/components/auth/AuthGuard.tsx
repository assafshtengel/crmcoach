
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

        // בדיקת תפקיד המשתמש
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!roleData || roleData.role !== 'coach') {
          // נבדוק אם צריך ליצור את תפקיד המאמן
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert([{ 
              id: session.user.id,
              role: 'coach'
            }])
            .single();

          if (insertError) {
            console.error("Error creating coach role:", insertError);
            toast({
              variant: "destructive",
              title: "שגיאה",
              description: "לא ניתן ליצור הרשאת מאמן",
            });
            await supabase.auth.signOut();
            navigate("/auth");
            return;
          }
        }

        // נרענן את הסשן
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error("Error refreshing session:", refreshError);
          await supabase.auth.signOut();
          toast({
            title: "פג תוקף החיבור",
            description: "אנא התחבר מחדש",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        // אם המשתמש מחובר ונמצא בדף ההתחברות, נעביר אותו לדף הבית
        if (location.pathname === '/auth') {
          navigate('/');
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
