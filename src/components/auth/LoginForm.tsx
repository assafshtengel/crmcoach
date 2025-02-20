
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface LoginFormProps {
  onSignUpClick: () => void;
  onForgotPasswordClick: () => void;
}

export const LoginForm = ({ onSignUpClick, onForgotPasswordClick }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
        } else if (error.message.includes("Email not confirmed")) {
          toast({
            variant: "destructive",
            title: "המייל לא אומת",
            description: "אנא בדוק את תיבת הדואר שלך ולחץ על קישור האימות שנשלח אליך",
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
        
        // בדיקת תפקיד המשתמש - שימו לב שהשתנה מ-id ל-user_id
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        console.log("Role query result:", { roleData, roleError });

        if (roleError) {
          console.error("Error fetching user role:", roleError);
          toast({
            variant: "destructive",
            title: "שגיאה",
            description: "לא ניתן לאמת את ההרשאות שלך. אנא נסה שוב.",
          });
          return;
        }

        console.log("User role data:", roleData);

        if (roleData?.role === 'coach') {
          console.log("User is a coach, navigating to home");
          navigate('/');
        } else {
          console.log("User is not a coach, showing error");
          toast({
            variant: "destructive",
            title: "גישה נדחתה",
            description: "ממשק זה מיועד למאמנים בלבד",
          });
          await supabase.auth.signOut();
        }
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
          onClick={onSignUpClick}
          className="text-primary hover:underline"
        >
          אין לך חשבון? הירשם עכשיו
        </button>
      </div>
    </form>
  );
};
