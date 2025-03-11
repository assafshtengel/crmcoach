
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, User, Calendar, PenTool, Video, Activity } from "lucide-react";

export default function PlayerProfileView() {
  const [playerData, setPlayerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        const playerSessionStr = localStorage.getItem('playerSession');
        
        if (!playerSessionStr) {
          navigate('/player-auth');
          return;
        }
        
        const playerSession = JSON.parse(playerSessionStr);
        
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerSession.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        setPlayerData(data);
      } catch (error: any) {
        console.error('Error loading player data:', error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת פרופיל",
          description: error.message || "אירעה שגיאה בטעינת נתוני השחקן"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadPlayerData();
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem('playerSession');
    navigate('/player-auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">לא נמצאו נתוני שחקן</h2>
          <Button onClick={() => navigate('/player-auth')} className="mt-4">
            חזרה לדף התחברות
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-center">
            שלום, {playerData.full_name}
          </h1>
          <div className="w-9"></div> {/* Spacer for alignment */}
        </div>

        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              פרטי שחקן
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">שם מלא</p>
                <p className="font-medium">{playerData.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">אימייל</p>
                <p className="font-medium">{playerData.email}</p>
              </div>
              {playerData.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">טלפון</p>
                  <p className="font-medium">{playerData.phone}</p>
                </div>
              )}
              {playerData.birthdate && (
                <div>
                  <p className="text-sm text-muted-foreground">תאריך לידה</p>
                  <p className="font-medium">{playerData.birthdate}</p>
                </div>
              )}
              {playerData.club && (
                <div>
                  <p className="text-sm text-muted-foreground">מועדון</p>
                  <p className="font-medium">{playerData.club}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5" />
                סיכומי משחק
              </CardTitle>
              <CardDescription>
                סיכומי ביצועים אישיים במשחקים
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate('/player/game-summary')}>
                צפה והוסף סיכומי משחק
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Video className="h-5 w-5" />
                סרטוני אימון
              </CardTitle>
              <CardDescription>
                צפה בסרטוני אימון והנחיות מהמאמן
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                צפה בסרטונים
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional sections can be added here */}
      </div>
    </div>
  );
}
