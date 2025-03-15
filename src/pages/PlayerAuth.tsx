
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function PlayerAuth() {
  const [playerId, setPlayerId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Check for access token in the URL
  useEffect(() => {
    const checkDirectAccess = async () => {
      try {
        // Check if we have a direct access token in the URL
        const searchParams = new URLSearchParams(location.search);
        const accessToken = searchParams.get('access');
        const directPlayerId = searchParams.get('player');
        
        if (accessToken && directPlayerId) {
          console.log("Found direct access token for player:", directPlayerId);
          
          // Verify the access token against the player
          const { data, error } = await supabase
            .from('player_access_tokens')
            .select('*')
            .eq('player_id', directPlayerId)
            .eq('token', accessToken)
            .eq('is_active', true)
            .single();
          
          if (error) {
            console.error("Error verifying access token:", error);
            toast({
              variant: "destructive",
              title: "קישור לא תקין",
              description: "הקישור שהשתמשת בו אינו תקף או שפג תוקפו",
            });
          } else if (data) {
            // Valid token, create a temporary player session
            const playerData = {
              id: directPlayerId,
              direct_access: true,
              access_token: accessToken
            };
            
            // Store in session storage for temporary access
            sessionStorage.setItem('playerDirectAccess', JSON.stringify(playerData));
            
            // Redirect to player view
            navigate(`/player/${directPlayerId}`);
            return;
          }
        }
        
        // Check if player is already authenticated
        const existingSession = localStorage.getItem('playerSession');
        if (existingSession) {
          try {
            const parsedSession = JSON.parse(existingSession);
            // Redirect to player profile
            navigate(`/player`);
            return;
          } catch (error) {
            // Invalid session data, remove it
            localStorage.removeItem('playerSession');
          }
        }
      } catch (error) {
        console.error("Error checking direct access:", error);
      } finally {
        setCheckingAccess(false);
      }
    };
    
    checkDirectAccess();
  }, [location, navigate, toast]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First we need to verify the player ID and password
      const { data, error } = await supabase
        .from('players')
        .select('id, full_name, email, password')
        .eq('id', playerId)
        .single();

      if (error || !data) {
        throw new Error("שחקן לא נמצא או פרטי הזיהוי שגויים");
      }

      // Verify password (basic comparison for now)
      if (!data.password || data.password !== password) {
        throw new Error("הסיסמה שהזנת שגויה");
      }

      // Create session for the player
      const playerData = {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
      };

      // Store player session in local or session storage based on "remember me"
      if (rememberMe) {
        localStorage.setItem('playerSession', JSON.stringify(playerData));
      } else {
        sessionStorage.setItem('playerSession', JSON.stringify(playerData));
        localStorage.removeItem('playerSession');
      }

      toast({
        title: "התחברות בוצעה בהצלחה",
        description: `ברוך הבא, ${data.full_name}`,
      });

      // Redirect to player profile
      navigate('/player');

    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בהתחברות",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/90 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl sm:text-2xl font-bold text-emerald-900">
              התחברות לשחקנים
            </CardTitle>
            <CardDescription className="mt-2 text-sm sm:text-base">
              הזן את פרטי הכניסה שלך כדי להתחבר
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="playerId">מזהה שחקן</Label>
                <Input
                  id="playerId"
                  dir="ltr"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">סיסמה</Label>
                <Input
                  id="password"
                  type="password"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="rememberMe" 
                  checked={rememberMe} 
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label htmlFor="rememberMe" className="text-sm">זכור אותי</Label>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "מתחבר..." : "התחבר"}
              </Button>
              <p className="text-sm text-center text-gray-500 mt-4">
                לא יודע את הפרטים שלך? צור קשר עם המאמן שלך כדי לקבל את פרטי הכניסה.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
