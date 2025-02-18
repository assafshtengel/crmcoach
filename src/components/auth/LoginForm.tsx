
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check for email confirmation error
        if (error.message.includes("Email not confirmed")) {
          toast({
            variant: "destructive",
            title: "המייל לא אומת",
            description: "אנא בדוק את תיבת הדואר שלך ולחץ על קישור האימות שנשלח אליך",
          });
          return;
        }
        throw error;
      }

      navigate("/"); // Changed from "/index" to "/"
    } catch (error: any) {
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
