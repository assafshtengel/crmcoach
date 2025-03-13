
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameSummaryForm } from "@/components/game-summary/GameSummaryForm";
import { GameSummaryList } from "@/components/game-summary/GameSummaryList";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";

export default function PlayerGameSummary() {
  const [playerData, setPlayerData] = useState<{id: string, coach_id?: string, full_name?: string} | null>(null);
  const [activeTab, setActiveTab] = useState<string>("new");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentPlayer = async () => {
      try {
        const playerSessionStr = localStorage.getItem('playerSession');

        if (!playerSessionStr) {
          navigate("/player-auth");
          return;
        }

        try {
          const playerSession = JSON.parse(playerSessionStr);
          const { data, error } = await supabase
            .from('players')
            .select('id, coach_id, full_name')
            .eq('id', playerSession.id)
            .single();

          if (error || !data) {
            throw new Error("Player data not found");
          }

          setPlayerData(data);
        } catch (error) {
          console.error("Error parsing player session:", error);
          navigate("/player-auth");
        }
      } catch (error: any) {
        console.error("Error getting player data:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת נתוני שחקן",
          description: error.message || "אירעה שגיאה. אנא נסה שוב מאוחר יותר.",
        });
      }
    };

    getCurrentPlayer();
  }, [toast, navigate]);

  const handleSummarySubmitted = () => {
    toast({
      title: "סיכום המשחק נשמר בהצלחה",
      description: "הנתונים נשמרו במערכת",
    });
    setActiveTab("history");
  };

  if (!playerData) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" onClick={() => navigate("/player/profile")}>
            <ArrowRight className="mr-2 h-4 w-4" /> חזרה לפרופיל
          </Button>
          <h1 className="text-3xl font-bold">סיכום משחק אישי</h1>
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
        <Button variant="outline" onClick={() => navigate("/player/profile")}>
          <ArrowRight className="mr-2 h-4 w-4" /> חזרה לפרופיל
        </Button>
        <h1 className="text-3xl font-bold">סיכום משחק אישי</h1>
      </div>
      
      {playerData && (
        <Tabs defaultValue="new" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="new">סיכום משחק חדש</TabsTrigger>
            <TabsTrigger value="history">היסטוריה</TabsTrigger>
          </TabsList>
          
          <TabsContent value="new">
            <GameSummaryForm 
              playerData={playerData} 
              onSuccess={handleSummarySubmitted} 
            />
          </TabsContent>
          
          <TabsContent value="history">
            {playerData.id && (
              <GameSummaryList playerId={playerData.id} />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
