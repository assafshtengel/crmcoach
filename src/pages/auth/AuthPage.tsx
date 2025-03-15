
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type AuthMode = "login" | "signup" | "reset-password" | "update-password";

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // בדיקה אם המשתמש כבר מחובר, ואם כן - הפנייה ישירה לדף הבית
    const checkExistingSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user) {
          console.log("User already authenticated, redirecting to dashboard");
          navigate("/dashboard-coach");
          return;
        }
        
        // If "remember me" is enabled but no session, try to refresh the session
        if (localStorage.getItem('coachRememberMe') === 'true') {
          const { data: refreshData } = await supabase.auth.refreshSession();
          
          if (refreshData.session?.user) {
            console.log("Session refreshed successfully, redirecting to dashboard");
            navigate("/dashboard-coach");
            return;
          }
        }
        
        // בדיקה אם יש פרגמנט האש שעשוי להכיל access_token
        const handleAuthRedirect = async () => {
          // פרגמנט האש עשוי להכיל מידע אימות מאיפוס סיסמה
          const hashFragment = window.location.hash;
          const searchParams = new URLSearchParams(location.search);
          const actionType = searchParams.get("type");

          console.log("Hash fragment:", hashFragment);
          console.log("Action type from URL:", actionType);
          
          if (hashFragment && hashFragment.includes("access_token")) {
            console.log("Hash fragment with token detected, processing auth recovery");
            
            // סופאבייס יטפל אוטומטית בהאש
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error("Error processing auth hash:", error);
              toast({
                variant: "destructive",
                title: "שגיאה באימות",
                description: "אירעה שגיאה בתהליך האימות, נא לנסות שוב",
              });
            } else if (session) {
              if (actionType === "recovery" || hashFragment.includes("type=recovery")) {
                // אם זה איפוס סיסמה, נציג את טופס עדכון הסיסמה
                console.log("Recovery mode detected");
                setMode("update-password");
              } else {
                // אחרת, נניח שזו התחברות רגילה ונעביר לדף הבית
                console.log("User authenticated successfully, redirecting to dashboard");
                navigate("/dashboard-coach");
                return;
              }
            }
          }
          
          // בדיקה אם יש type=recovery ב-URL (פרמטר שאילתה מסורתי)
          if (actionType === "recovery") {
            console.log("Recovery mode from query param detected");
            setMode("update-password");
          }
        };
        
        await handleAuthRedirect();
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setLoading(false);
      }
    };

    checkExistingSession();
  }, [navigate, location, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:py-12 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/90 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl sm:text-2xl font-bold text-emerald-900">
              {mode === "login" && "התחברות כמאמן"}
              {mode === "signup" && "הרשמה כמאמן"}
              {mode === "reset-password" && "איפוס סיסמה"}
              {mode === "update-password" && "עדכון סיסמה חדשה"}
            </CardTitle>
            <CardDescription className="mt-2 text-sm sm:text-base">
              {mode === "login" && "התחבר כדי להמשיך לאזור האישי שלך"}
              {mode === "signup" && "צור חשבון חדש כמאמן"}
              {mode === "reset-password" && "הזן את כתובת המייל שלך לאיפוס הסיסמה"}
              {mode === "update-password" && "הזן סיסמה חדשה לחשבון שלך"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === "login" && <LoginForm onSignUpClick={() => setMode("signup")} onForgotPasswordClick={() => setMode("reset-password")} />}
            {mode === "signup" && <SignUpForm onLoginClick={() => setMode("login")} />}
            {mode === "reset-password" && <ResetPasswordForm onBackToLoginClick={() => setMode("login")} />}
            {mode === "update-password" && <UpdatePasswordForm onSuccessCallback={() => navigate("/dashboard-coach")} />}
            
            <div className="mt-6 pt-6 border-t border-gray-200 text-center space-y-3">
              <Button 
                variant="link" 
                onClick={() => navigate('/player-auth')}
                className="text-sm text-primary hover:underline"
              >
                כניסה לשחקנים
              </Button>
              
              <div>
                <Button 
                  variant="link" 
                  onClick={() => navigate('/signup-coach')}
                  className="text-sm text-primary hover:underline"
                >
                  הרשמה כמאמן חדש (דף מלא)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
