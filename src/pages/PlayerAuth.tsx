
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
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
  const [initialLoading, setInitialLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showContactCoachDialog, setShowContactCoachDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const params = new URLSearchParams(location.search);
  const redirectPath = params.get('redirect');

  // Check if user is already logged in when component mounts
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Check if user is already authenticated and is a registered player
   */
  const checkAuthStatus = async () => {
    try {
      setInitialLoading(true);
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (user) {
        console.log("User already logged in:", user.id);
        const isValidPlayer = await validatePlayer(user.id);
        
        if (isValidPlayer) {
          const targetPath = redirectPath || '/player/profile-alt';
          if (location.pathname !== targetPath) {
            navigate(targetPath);
          }
        }
      }
    } catch (e) {
      console.error("Error checking auth state:", e);
    } finally {
      setInitialLoading(false);
    }
  };

  /**
   * Validate if a user ID exists in the players table
   */
  const validatePlayer = async (userId: string) => {
    try {
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('id, email, full_name')
        .eq('id', userId)
        .maybeSingle();

      if (playerError || !playerData) {
        console.error("Player validation error:", playerError);
        await handleLogout();
        toast({
          variant: "destructive",
          title: "שגיאת הרשאה",
          description: "המשתמש אינו רשום כשחקן במערכת.",
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Player validation error:", error);
      return false;
    }
  };

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Handle user login
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "שדות חסרים",
        description: "אנא מלא את כל השדות הנדרשים.",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        handleAuthError(authError);
        return;
      }

      if (!authData.user) {
        toast({
          variant: "destructive",
          title: "שגיאה בהתחברות",
          description: "לא ניתן למצוא את פרטי המשתמש.",
        });
        return;
      }

      const isValid = await validatePlayer(authData.user.id);
      
      if (isValid) {
        handleSuccessfulLogin();
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

  /**
   * Handle authentication errors
   */
  const handleAuthError = (error: any) => {
    console.error("Auth error:", error);
    
    let errorMessage = "אנא בדוק את הדוא״ל והסיסמה שלך.";
    
    if (error.message.includes("Invalid login credentials")) {
      errorMessage = "פרטי התחברות שגויים. אנא בדוק שוב את האימייל והסיסמה.";
    } else if (error.message.includes("Email not confirmed")) {
      errorMessage = "האימייל שלך טרם אומת. אנא בדוק את תיבת הדואר שלך.";
    }
    
    toast({
      variant: "destructive",
      title: "שגיאה בהתחברות",
      description: errorMessage,
    });
    
    setLoading(false);
  };

  /**
   * Handle successful login
   */
  const handleSuccessfulLogin = () => {
    toast({
      title: "התחברות הצליחה",
      description: "ברוך הבא! מיד תועבר לפרופיל השחקן",
    });

    const targetPath = redirectPath || '/player/profile-alt';
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-primary">
            כניסה לשחקנים
          </CardTitle>
          <CardDescription className="text-gray-600">
            התחבר כדי לגשת לפרופיל השחקן שלך
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">כתובת אימייל</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder="הזן את האימייל שלך"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 focus:ring-primary"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="font-medium">סיסמה</Label>
                <button
                  type="button"
                  onClick={() => setShowContactCoachDialog(true)}
                  className="text-xs text-primary hover:underline focus:outline-none"
                >
                  שכחת סיסמה?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="הזן את הסיסמה שלך"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 focus:ring-primary"
                  required
                  autoComplete="current-password"
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
              className="w-full mt-6 transition-colors"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> מתחבר...
                </>
              ) : "התחבר"}
            </Button>
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="text-sm text-primary hover:underline focus:outline-none"
              >
                כניסה למאמנים
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

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
