
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  onSignUpClick: () => void;
  onForgotPasswordClick: () => void;
}

export const LoginForm = ({ onForgotPasswordClick }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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
            description: error.message,
          });
        }
        return;
      }

      if (data.user) {
        console.log("User authenticated:", data.user);
        
        // Set persistent session based on remember me option
        if (rememberMe) {
          // This is already the default in Supabase, but we're being explicit
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
          
          localStorage.setItem('coachRememberMe', 'true');
        } else {
          localStorage.removeItem('coachRememberMe');
        }
        
        // המשתמש התחבר בהצלחה, מעבר ישיר לדף הבית
        navigate('/dashboard-coach');
        
        toast({
          title: "התחברות בוצעה בהצלחה",
          description: "ברוך הבא למערכת",
        });
      }

    } catch (error: any) {
      console.error("Unexpected error during login:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בהתחברות",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
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
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center space-x-2 space-x-reverse">
        <Checkbox 
          id="rememberMe" 
          checked={rememberMe} 
          onCheckedChange={(checked) => setRememberMe(checked === true)}
        />
        <Label htmlFor="rememberMe" className="text-sm">זכור אותי</Label>
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
          onClick={() => navigate('/signup-coach')}
          className="text-primary hover:underline"
        >
          אין לך חשבון? הירשם עכשיו
        </button>
      </div>
    </form>
  );
};
