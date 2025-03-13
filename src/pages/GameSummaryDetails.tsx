
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, Users, Target, Brain, Battery, Dumbbell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { GameSummary } from "@/types/gameSummary";

export default function GameSummaryDetails() {
  const { playerId } = useParams<{ playerId: string }>();
  const [summaries, setSummaries] = useState<GameSummary[]>([]);
  const [playerName, setPlayerName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGameSummaries = async () => {
      if (!playerId) return;

      try {
        setIsLoading(true);
        
        // Fetch player name
        const { data: playerData, error: playerError } = await supabase
          .from("players")
          .select("full_name")
          .eq("id", playerId)
          .single();
        
        if (playerError) {
          console.error("Error fetching player data:", playerError);
          throw new Error("Could not fetch player data");
        }
        
        setPlayerName(playerData?.full_name || "");
        
        // Fetch game summaries
        const { data: summariesData, error: summariesError } = await supabase
          .from("game_summaries")
          .select("*")
          .eq("player_id", playerId)
          .order("created_at", { ascending: false });
        
        if (summariesError) {
          console.error("Error fetching game summaries:", summariesError);
          throw new Error("Could not fetch game summaries");
        }
        
        setSummaries(summariesData || []);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת סיכומי המשחק",
          description: error.message || "אירעה שגיאה. אנא נסה שוב מאוחר יותר.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameSummaries();
  }, [playerId, toast]);

  const getColorForRating = (rating: number) => {
    if (rating <= 3) return "text-red-500";
    if (rating <= 6) return "text-amber-500";
    return "text-green-500";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center">
          <Button variant="outline" onClick={() => navigate(-1)} className="mr-4">
            <ArrowRight className="mr-2 h-4 w-4" /> חזרה
          </Button>
          <h1 className="text-3xl font-bold">טוען סיכומי משחק</h1>
        </div>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-8">
        <Button variant="outline" onClick={() => navigate(-1)} className="mr-4">
          <ArrowRight className="mr-2 h-4 w-4" /> חזרה
        </Button>
        <h1 className="text-3xl font-bold">סיכומי המשחק של {playerName}</h1>
      </div>

      {summaries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-xl text-gray-500">אין סיכומי משחק עדיין</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {summaries.map((summary) => (
            <Card key={summary.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 py-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center text-xl">
                    <Calendar className="mr-2 h-5 w-5 text-primary" />
                    {summary.game_date ? format(new Date(summary.game_date), "dd/MM/yyyy") : "תאריך לא ידוע"}
                    {summary.opponent_team && (
                      <span className="mr-2 flex items-center">
                        <Users className="mr-1 h-4 w-4 text-gray-500" />
                        נגד {summary.opponent_team}
                      </span>
                    )}
                  </CardTitle>
                  <div className="text-sm text-gray-500">
                    {summary.created_at && format(new Date(summary.created_at), "dd/MM/yyyy HH:mm")}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 mb-2 flex items-center">
                      <Target className="mr-1 h-4 w-4" /> דירוג ביצועים
                    </span>
                    <span className={`text-3xl font-bold ${getColorForRating(summary.performance_rating || 0)}`}>
                      {summary.performance_rating}/10
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 mb-2 flex items-center">
                      <Brain className="mr-1 h-4 w-4" /> רמת ריכוז
                    </span>
                    <span className={`text-3xl font-bold ${getColorForRating(summary.concentration_level || 0)}`}>
                      {summary.concentration_level}/10
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 mb-2 flex items-center">
                      <Battery className="mr-1 h-4 w-4" /> רמת עייפות
                    </span>
                    <span className={`text-3xl font-bold ${getColorForRating(10 - (summary.fatigue_level || 0))}`}>
                      {summary.fatigue_level}/10
                    </span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <Target className="mr-2 h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">האם הושגו המטרות?</h3>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    {summary.goals_met ? (
                      <span className="text-green-500 font-medium">כן ✓</span>
                    ) : (
                      <span className="text-red-500 font-medium">לא ✗</span>
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <Dumbbell className="mr-2 h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">הנקודה החזקה ביותר במשחק</h3>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    {summary.strongest_point}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <Target className="mr-2 h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">מה אני רוצה לשפר למשחק הבא?</h3>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    {summary.improvement_notes}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
