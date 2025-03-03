
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const PlayerAuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Check if player is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Get player info
        const { data: playerData } = await supabase
          .from('players')
          .select('id')
          .eq('email', session.user.email)
          .maybeSingle();
          
        if (playerData) {
          navigate(`/dashboard/player-profile/${playerData.id}`);
        }
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Get player info
        const { data: playerData } = await supabase
          .from('players')
          .select('id')
          .eq('email', data.user.email)
          .maybeSingle();
          
        if (playerData) {
          toast({
            title: "התחברות בוצעה בהצלחה",
            description: "ברוך הבא למערכת האימון האישית",
          });
          
          navigate(`/dashboard/player-profile/${playerData.id}`);
        } else {
          toast({
            variant: "destructive",
            title: "שגיאה בהתחברות",
            description: "המשתמש אינו מוגדר כשחקן במערכת",
          });
          await supabase.auth.signOut();
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "שגיאה בהתחברות",
        description: error.message || "אירעה שגיאה בהתחברות, אנא נסה שנית",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card className="backdrop-blur-sm bg-white/90">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-emerald-900">
              התחברות לאזור האישי
            </CardTitle>
            <CardDescription>
              התחבר עם הפרטים שקיבלת מהמאמן האישי שלך
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  אימייל
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="הזן את כתובת האימייל שלך"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium">
                  סיסמה
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="הזן את הסיסמה שלך"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "מתחבר..." : "התחברות"}
              </Button>
              
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">שים לב</span>
                </div>
                <p className="text-xs mt-1 text-amber-700">
                  אם שכחת את פרטי הכניסה, אנא פנה למאמן האישי שלך לקבלת עזרה.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlayerAuthPage;
