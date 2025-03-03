
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type AuthMode = "login" | "signup" | "reset-password";

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const navigate = useNavigate();

  return <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card className="backdrop-blur-sm bg-white/90">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-emerald-900">
              {mode === "login" && "התחברות כמאמן"}
              {mode === "signup" && "הרשמה כמאמן"}
              {mode === "reset-password" && "איפוס סיסמה"}
            </CardTitle>
            <CardDescription>
              {mode === "login" && "התחבר כדי להמשיך לאזור האישי שלך"}
              {mode === "signup" && "צור חשבון חדש כמאמן"}
              {mode === "reset-password" && "הזן את כתובת המייל שלך לאיפוס הסיסמה"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === "login" && <LoginForm onSignUpClick={() => setMode("signup")} onForgotPasswordClick={() => setMode("reset-password")} />}
            {mode === "signup" && <SignUpForm onLoginClick={() => setMode("login")} />}
            {mode === "reset-password" && <ResetPasswordForm onBackToLoginClick={() => setMode("login")} />}
            
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <Button 
                variant="link" 
                onClick={() => navigate('/player-auth')}
                className="text-sm text-primary hover:underline"
              >
                כניסה לשחקנים
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};

export default AuthPage;
