
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { SecurityCodeDialog } from "./SecurityCodeDialog";

interface LoginFormProps {
  onSignUpClick: () => void;
  onForgotPasswordClick: () => void;
}

export const LoginForm = ({ onForgotPasswordClick }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get redirect URL from query parameters if it exists
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get('redirect');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        
        if (error.message.includes("Invalid login credentials")) {
          toast({
            variant: "destructive",
            title: "שגיאת התחברות",
            description: "האימייל או הסיסמה שגויים",
          });
        } else {
          toast({
            variant: "destructive",
            title: "שגיאת התחברות",
            description: "שגיאת התחברות. נסה שוב או פנה לתמיכה.",
          });
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log("User authenticated:", data.user);
        
        toast({
          title: "התחברות בוצעה בהצלחה",
          description: "ברוך הבא למערכת",
        });

        // Navigate to redirect URL if available, otherwise to default page
        if (redirectTo) {
          navigate(decodeURIComponent(redirectTo));
        } else {
          navigate('/dashboard-coach');
        }
      }

    } catch (error: any) {
      console.error("Unexpected error during login:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בהתחברות",
        description: "שגיאת התחברות. נסה שוב או פנה לתמיכה.",
      });
      setLoading(false);
    }
  };

  const handleSecurityDialogSuccess = () => {
    setShowSecurityDialog(false);
    navigate('/signup-coach');
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          dir="rtl"
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          dir="rtl"
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "מתחבר..." : "התחבר"}
      </Button>
      <div className="flex flex-col space-y-2 text-center text-sm">
        <button
          type="button"
          onClick={onForgotPasswordClick}
          className="text-primary hover:underline"
        >
          שכחת סיסמה?
        </button>
        <button
          type="button"
          onClick={() => setShowSecurityDialog(true)}
          className="text-primary hover:underline"
        >
          אין לך חשבון? הירשם עכשיו
        </button>
      </div>
      
      {/* Security Code Dialog */}
      <SecurityCodeDialog 
        open={showSecurityDialog} 
        onClose={() => setShowSecurityDialog(false)} 
        onSuccess={handleSecurityDialogSuccess}
      />
    </form>
  );
};
