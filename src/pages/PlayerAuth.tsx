
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock } from "lucide-react";
import { Label } from "@/components/ui/label";

type AuthMode = "login" | "reset-password";

const PlayerAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, check if this email belongs to a player
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('id, email, password')
        .eq('email', email)
        .maybeSingle();

      if (playerError) {
        console.error("Error checking player:", playerError);
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: "אירעה שגיאה בבדיקת פרטי השחקן",
        });
        setLoading(false);
        return;
      }

      if (!playerData) {
        toast({
          variant: "destructive",
          title: "שגיאה בהתחברות",
          description: "לא נמצא שחקן עם כתובת האימייל הזו",
        });
        setLoading(false);
        return;
      }

      // Verify password
      if (playerData.password !== password) {
        toast({
          variant: "destructive",
          title: "שגיאה בהתחברות",
          description: "הסיסמה שהוזנה אינה נכונה",
        });
        setLoading(false);
        return;
      }

      // Login successful
      toast({
        title: "התחברות הצליחה",
        description: "מיד תועבר לפרופיל השחקן",
      });

      // Store player session data
      localStorage.setItem('playerSession', JSON.stringify({
        id: playerData.id,
        email: playerData.email,
        password: playerData.password
      }));

      // Navigate to the player profile view
      navigate('/player/profile');
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בהתחברות",
        description: error.message || "אירעה שגיאה בהתחברות. אנא נסה שוב.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if email exists in players table
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('id, email')
        .eq('email', email)
        .maybeSingle();

      if (playerError) {
        throw new Error("שגיאה בבדיקת פרטי השחקן");
      }

      if (!playerData) {
        throw new Error("לא נמצא שחקן עם כתובת האימייל הזו");
      }

      // Generate a new random password
      const newPassword = Math.random().toString(36).slice(-10);

      // Update the player's password
      const { error: updateError } = await supabase
        .from('players')
        .update({ password: newPassword })
        .eq('id', playerData.id);

      if (updateError) {
        throw new Error("שגיאה בעדכון הסיסמה");
      }

      // For a real application, you would send an email with the new password
      // For now, we'll display it in the toast
      toast({
        title: "הסיסמה אופסה בהצלחה",
        description: `הסיסמה החדשה שלך היא: ${newPassword}`,
        duration: 10000, // Longer duration so user can see the password
      });

      setMode("login");
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        variant: "destructive",
        title: "שגיאה באיפוס הסיסמה",
        description: error.message || "אירעה שגיאה באיפוס הסיסמה. אנא נסה שוב.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {mode === "login" ? "כניסה לשחקנים" : "איפוס סיסמה"}
          </CardTitle>
          <CardDescription>
            {mode === "login" 
              ? "התחבר כדי לגשת לפרופיל השחקן שלך" 
              : "הזן את כתובת המייל שלך לאיפוס הסיסמה"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">כתובת אימייל</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="הזן את האימייל שלך"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">סיסמה</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="password"
                    type="password"
                    placeholder="הזן את הסיסמה שלך"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "מתחבר..." : "התחבר"}
              </Button>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode("reset-password")}
                  className="text-sm text-primary hover:underline"
                >
                  שכחת סיסמה?
                </button>
              </div>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="text-sm text-primary hover:underline"
                >
                  כניסה למאמנים
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">כתובת אימייל</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="הזן את האימייל שלך"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "שולח..." : "אפס סיסמה"}
              </Button>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-sm text-primary hover:underline"
                >
                  חזרה להתחברות
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerAuth;
