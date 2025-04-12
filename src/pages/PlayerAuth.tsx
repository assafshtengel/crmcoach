
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

const PlayerAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showContactCoachDialog, setShowContactCoachDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Handle redirect parameter if exists
  const params = new URLSearchParams(location.search);
  const redirectPath = params.get('redirect');

  // Check if user is already logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (user) {
          // If there's a redirect path, navigate there
          if (redirectPath) {
            navigate(redirectPath);
          } else {
            navigate('/player/profile-alt');
          }
        }
      } catch (e) {
        console.error("Error checking auth state:", e);
      }
    };
    
    checkLoggedIn();
  }, [navigate, redirectPath]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use Supabase auth to sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error("Auth error:", authError);
        toast({
          variant: "destructive",
          title: "שגיאה בהתחברות",
          description: "אנא בדוק את הדוא״ל והסיסמה שלך.",
        });
        setLoading(false);
        return;
      }

      if (authData.user) {
        // Check if this user exists in the players table
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select('id, email, full_name')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (playerError || !playerData) {
          console.error("Player lookup error:", playerError);
          toast({
            variant: "destructive",
            title: "שגיאה בהתחברות",
            description: "משתמש לא נמצא במערכת כשחקן.",
          });
          
          // Sign out since this user is not a player
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // Login successful
        toast({
          title: "התחברות הצליחה",
          description: "מיד תועבר לפרופיל השחקן",
        });

        // Navigate to redirect path or default profile view
        if (redirectPath) {
          navigate(redirectPath);
        } else {
          navigate('/player/profile-alt');
        }
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            כניסה לשחקנים
          </CardTitle>
          <CardDescription>
            התחבר כדי לגשת לפרופיל השחקן שלך
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  type={showPassword ? "text" : "password"}
                  placeholder="הזן את הסיסמה שלך"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? 
                    <EyeOff size={18} aria-label="הסתר סיסמה" /> : 
                    <Eye size={18} aria-label="הצג סיסמה" />
                  }
                </button>
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
                onClick={() => setShowContactCoachDialog(true)}
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
        </CardContent>
      </Card>

      {/* Contact Coach Dialog */}
      <Dialog open={showContactCoachDialog} onOpenChange={setShowContactCoachDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">שכחת סיסמה</DialogTitle>
            <DialogDescription className="text-center">
              נא לפנות למאמן האישי שלך
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 text-center">
            <p className="text-gray-700">
              איפוס סיסמה זמין רק באמצעות המאמן האישי שלך.
              <br />
              אנא צור קשר עם המאמן האישי שלך לקבלת סיסמה חדשה.
            </p>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setShowContactCoachDialog(false)}>הבנתי</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlayerAuth;
