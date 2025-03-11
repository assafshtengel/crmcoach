
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameSummaryForm } from "@/components/game-summary/GameSummaryForm";
import { GameSummaryList } from "@/components/game-summary/GameSummaryList";
import { Layout } from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";

export default function GameSummary() {
  const [playerData, setPlayerData] = useState<{id: string, coach_id?: string, full_name?: string} | null>(null);
  const [activeTab, setActiveTab] = useState<string>("new");
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentPlayer = async () => {
      try {
        // Check if user is a player
        const playerSessionStr = localStorage.getItem('playerSession');

        if (playerSessionStr) {
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
            return;
          } catch (error) {
            console.error("Error parsing player session:", error);
          }
        }
        
        // If not a player, check if user is a coach
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("No authenticated user found");
        }

        // For a coach, we should get the player ID from the URL or parameters
        // This is a placeholder and should be adjusted based on your app's routing
        const urlParams = new URLSearchParams(window.location.search);
        const playerId = urlParams.get('playerId');

        if (!playerId) {
          throw new Error("No player ID provided");
        }

        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select('id, coach_id, full_name')
          .eq('id', playerId)
          .single();

        if (playerError || !playerData) {
          throw new Error("Player data not found");
        }

        setPlayerData(playerData);
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
  }, [toast]);

  const handleSummarySubmitted = () => {
    setActiveTab("history");
  };

  if (!playerData) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">סיכום משחק אישי</h1>
        
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
    </Layout>
  );
}
