
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
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
    // Check if there's a hash fragment that might contain access_token
    const handleHashFragment = async () => {
      try {
        setLoading(true);
        
        // Hash fragment might contain auth info from password reset
        const hashFragment = window.location.hash;
        if (hashFragment && hashFragment.includes("access_token")) {
          console.log("Hash fragment detected, processing auth recovery");
          
          // Supabase will automatically handle the hash
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Error processing auth hash:", error);
            toast({
              variant: "destructive",
              title: "שגיאה באימות",
              description: "אירעה שגיאה בתהליך האימות, נא לנסות שוב",
            });
          } else if (session) {
            console.log("User authenticated successfully");
            navigate("/dashboard-coach");
            return;
          }
        }
      } catch (error) {
        console.error("Error handling hash fragment:", error);
      } finally {
        setLoading(false);
      }
    };

    handleHashFragment();
  }, [navigate, toast]);

  // Check URL parameters for action type (if any)
  useEffect(() => {
    // Check if we have type=recovery in the URL (traditional query param)
    const queryParams = new URLSearchParams(location.search);
    const actionType = queryParams.get("type");
    
    if (actionType === "recovery") {
      setMode("update-password");
    }
  }, [location]);

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
