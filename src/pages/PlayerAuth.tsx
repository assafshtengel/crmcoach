
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const PlayerAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Check for direct access token in URL
  useEffect(() => {
    const accessToken = searchParams.get('access');
    const playerIdFromUrl = searchParams.get('player');
    
    if (accessToken && playerIdFromUrl) {
      verifyAccessToken(accessToken, playerIdFromUrl);
    }
  }, [searchParams]);
  
  const verifyAccessToken = async (token: string, playerIdFromUrl: string) => {
    setVerifyingToken(true);
    try {
      // Verify the token against the database
      const { data: tokenData, error: tokenError } = await supabase
        .from('player_access_tokens')
        .select('*, players:player_id(id, full_name, email)')
        .eq('token', token)
        .eq('player_id', playerIdFromUrl)
        .eq('is_active', true)
        .single();
      
      if (tokenError || !tokenData) {
        console.error("Invalid or expired token:", tokenError);
        toast.error('הקישור אינו תקף או שפג תוקפו');
        return;
      }
      
      // Token is valid, set up direct access session
      const playerData = {
        id: tokenData.player_id,
        full_name: tokenData.players?.full_name,
        email: tokenData.players?.email,
      };

      // Store player data in session storage for direct access
      sessionStorage.setItem('playerDirectAccess', JSON.stringify(playerData));
      
      // Redirect to the player profile
      toast.success('מועבר לפרופיל השחקן...');
      navigate(`/player/${playerData.id}`);
    } catch (error) {
      console.error("Error verifying token:", error);
      toast.error('שגיאה באימות הקישור');
    } finally {
      setVerifyingToken(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (email) {
        // Fetch player info from database based on email or ID
        const { data: playersByEmail, error: emailError } = await supabase
          .from("players")
          .select("id, full_name, email, password")
          .eq("email", email.toLowerCase())
          .single();

        if (emailError || !playersByEmail) {
          console.error("Player not found by email:", emailError);
          
          // If not found by email, try by ID as fallback
          const { data: playersById, error: idError } = await supabase
            .from("players")
            .select("id, full_name, email, password")
            .eq("id", email)
            .single();
            
          if (idError || !playersById) {
            toast.error("שם משתמש לא נמצא");
            setLoading(false);
            return;
          }
          
          // Found by ID
          if (playersById.password && password !== playersById.password) {
            toast.error("סיסמה שגויה");
            setLoading(false);
            return;
          }
          
          // Valid ID login
          const playerData = {
            id: playersById.id,
            full_name: playersById.full_name,
            email: playersById.email,
          };
          
          if (rememberMe) {
            localStorage.setItem("playerSession", JSON.stringify(playerData));
          } else {
            sessionStorage.setItem("playerSession", JSON.stringify(playerData));
          }
          
          toast.success("התחברת בהצלחה");
          navigate(`/player/${playersById.id}`);
          return;
        }
        
        // Email login validation
        if (playersByEmail.password && password !== playersByEmail.password) {
          toast.error("סיסמה שגויה");
          setLoading(false);
          return;
        }
        
        // Store player session
        const playerData = {
          id: playersByEmail.id,
          full_name: playersByEmail.full_name,
          email: playersByEmail.email,
        };
        
        // Store in localStorage or sessionStorage based on remember me
        if (rememberMe) {
          localStorage.setItem("playerSession", JSON.stringify(playerData));
        } else {
          sessionStorage.setItem("playerSession", JSON.stringify(playerData));
        }
        
        toast.success("התחברת בהצלחה");
        navigate(`/player/${playersByEmail.id}`);
        return;
      } else {
        toast.error("אנא הזן אימייל או מזהה שחקן");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("שגיאה בהתחברות");
    } finally {
      setLoading(false);
    }
  };

  if (verifyingToken) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg">מאמת את הקישור...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">כניסת שחקנים</CardTitle>
            <CardDescription>
              כניסה למערכת המנטליות לשחקנים
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">מזהה שחקן</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="הזן את האימייל או מזהה השחקן שלך"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">סיסמה (אם הוגדרה)</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="הזן את הסיסמה שלך (אם הוגדרה)"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary"
                />
                <Label htmlFor="rememberMe" className="mr-2">זכור אותי</Label>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    מתחבר...
                  </>
                ) : (
                  "התחבר"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              מאמנים? <a href="/auth" className="text-primary hover:underline">לחצו כאן להתחברות</a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PlayerAuth;
