
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { GameSummaryList } from "@/components/game-summary/GameSummaryList";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlayerGameSummaryView() {
  const [playerData, setPlayerData] = useState<{id: string, full_name: string} | null>(null);
  const { playerId } = useParams<{playerId: string}>();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getPlayerData = async () => {
      if (!playerId) return;

      try {
        const { data, error } = await supabase
          .from('players')
          .select('id, full_name')
          .eq('id', playerId)
          .single();

        if (error) {
          throw error;
        }

        setPlayerData(data);
      } catch (error: any) {
        console.error("Error fetching player data:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת נתוני שחקן",
          description: error.message || "אירעה שגיאה. אנא נסה שוב מאוחר יותר.",
        });
      }
    };

    getPlayerData();
  }, [playerId, toast]);

  if (!playerData) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-8">
          <Button variant="outline" onClick={() => navigate(`/player-profile/${playerId}`)}>
            <ArrowRight className="mr-2 h-4 w-4" /> חזרה לפרופיל שחקן
          </Button>
        </div>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <Button variant="outline" onClick={() => navigate(`/player-profile/${playerId}`)}>
          <ArrowRight className="mr-2 h-4 w-4" /> חזרה לפרופיל שחקן
        </Button>
        <h1 className="text-3xl font-bold">סיכומי משחק - {playerData.full_name}</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>היסטוריית סיכומי משחק</CardTitle>
        </CardHeader>
        <CardContent>
          <GameSummaryList playerId={playerData.id} coachView={true} />
        </CardContent>
      </Card>
    </div>
  );
}
