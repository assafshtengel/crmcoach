
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface UpdatePasswordFormProps {
  onSuccessCallback: () => void;
}

export const UpdatePasswordForm = ({ onSuccessCallback }: UpdatePasswordFormProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "שגיאה באימות סיסמה",
        description: "הסיסמאות אינן תואמות",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "סיסמה קצרה מדי",
        description: "הסיסמה חייבת להכיל לפחות 6 תווים",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast({
        title: "סיסמה עודכנה בהצלחה",
        description: "הסיסמה שלך עודכנה, מיד תועבר לדף הראשי",
      });
      
      // מעבר לדף הראשי לאחר עדכון הסיסמה בהצלחה
      setTimeout(() => {
        onSuccessCallback();
      }, 1500);
    } catch (error: any) {
      console.error("Update password error:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בעדכון הסיסמה",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdatePassword} className="space-y-4">
      <div>
        <Input
          type="password"
          placeholder="סיסמה חדשה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="mb-3"
        />
        <Input
          type="password"
          placeholder="אימות סיסמה"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "מעדכן..." : "עדכן סיסמה"}
      </Button>
    </form>
  );
};
