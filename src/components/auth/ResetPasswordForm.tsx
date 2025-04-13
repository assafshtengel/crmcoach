import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface ResetPasswordFormProps {
  onBackToLoginClick: () => void;
}

export const ResetPasswordForm = ({ onBackToLoginClick }: ResetPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "נשלח מייל לאיפוס סיסמה",
        description: "בדוק את תיבת הדואר שלך",
      });
      
      onBackToLoginClick();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "שגיאה באיפוס סיסמה",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "שולח..." : "שלח מייל לאיפוס סיסמה"}
      </Button>
      <div className="text-center">
        <button
          type="button"
          onClick={onBackToLoginClick}
          className="text-primary hover:underline text-sm"
        >
          חזרה להתחברות
        </button>
      </div>
    </form>
  );
};
