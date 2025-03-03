
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { ExclamationTriangleIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PlayerAuthPage = () => {
  const [email, setEmail] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !playerId) {
      setError("יש למלא את כל השדות");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // בדיקה אם השחקן קיים בבסיס הנתונים
      const { data: player, error: playerError } = await supabase
        .from("players")
        .select("id, email")
        .eq("email", email)
        .eq("id", playerId)
        .single();

      if (playerError || !player) {
        setError("פרטי הכניסה שגויים. אנא בדוק את האימייל ואת קוד השחקן שלך.");
        setLoading(false);
        return;
      }

      // יצירת או כניסה לחשבון השחקן
      // אנחנו משתמשים במנגנון של supabase auth עם סיסמה חד פעמית (מיילים)
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // מוסיף מידע לחשבון המשתמש כדי שנוכל לדעת שזה שחקן
          data: {
            player_id: playerId,
            role: 'player'
          }
        }
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        toast({
          title: "קישור התחברות נשלח",
          description: "בדוק את תיבת הדואר האלקטרוני שלך וכנס לקישור שנשלח אליך",
        });
      }
    } catch (err) {
      console.error("Error during player login:", err);
      setError("אירעה שגיאה בתהליך ההתחברות");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        <Card className="backdrop-blur-sm bg-white/90">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-emerald-900">
              כניסת שחקן
            </CardTitle>
            <CardDescription>
              הכנס את האימייל וקוד השחקן שניתן לך כדי להתחבר לאזור האישי
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  אימייל
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="הכנס את האימייל שלך"
                  className="w-full"
                  dir="ltr"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="playerId" className="block text-sm font-medium text-gray-700">
                  קוד שחקן
                </label>
                <Input
                  id="playerId"
                  type="text"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  placeholder="הכנס את קוד השחקן שלך"
                  className="w-full"
                  dir="ltr"
                />
              </div>
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "מתחבר..." : "התחבר"}
                </Button>
              </div>
              
              <div className="text-center mt-4">
                <Button
                  variant="link"
                  onClick={() => navigate("/auth")}
                  className="text-sm"
                >
                  כניסת מאמן
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlayerAuthPage;
