
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Edit } from "lucide-react";
import { toast } from "sonner";
import { GameSummary } from "@/types/gameSummary";
import { format } from "date-fns";

export default function GameSummaryDetails() {
  const [summary, setSummary] = useState<GameSummary | null>(null);
  const [playerName, setPlayerName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { summaryId } = useParams<{ summaryId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGameSummary = async () => {
      if (!summaryId) return;

      try {
        const { data, error } = await supabase
          .from("game_summaries")
          .select("*")
          .eq("id", summaryId)
          .single();

        if (error) {
          throw error;
        }

        setSummary(data);

        // Fetch player name
        if (data.player_id) {
          const { data: playerData, error: playerError } = await supabase
            .from("players")
            .select("full_name")
            .eq("id", data.player_id)
            .single();

          if (playerError) {
            console.error("Error fetching player:", playerError);
          } else {
            setPlayerName(playerData.full_name);
          }
        }
      } catch (error: any) {
        console.error("Error fetching game summary:", error);
        toast.error(`שגיאה בטעינת סיכום המשחק: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchGameSummary();
  }, [summaryId]);

  const handleEditClick = () => {
    if (summary) {
      navigate(`/edit-game-summary/${summary.id}`);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : summary ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/player-game-summaries/${summary.player_id}`)}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                חזרה לרשימת סיכומים
              </Button>
              <h1 className="text-3xl font-bold">
                פרטי סיכום משחק - {playerName}
              </h1>
              <Button onClick={handleEditClick}>
                <Edit className="h-4 w-4 mr-2" />
                ערוך סיכום
              </Button>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>
                    סיכום משחק
                    {summary.opponent_team && ` מול ${summary.opponent_team}`}
                  </span>
                  <span className="text-base text-muted-foreground">
                    {summary.game_date
                      ? format(new Date(summary.game_date), "dd/MM/yyyy")
                      : format(new Date(summary.created_at || ""), "dd/MM/yyyy")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">ביצוע כללי</h3>
                      <div className="flex items-center">
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden w-full max-w-md">
                          <div
                            className="absolute top-0 left-0 h-full bg-primary rounded-full"
                            style={{
                              width: `${(summary.performance_rating / 10) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-right ml-4 min-w-12 text-lg font-semibold">
                          {summary.performance_rating}/10
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">רמת ריכוז</h3>
                      <div className="flex items-center">
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden w-full max-w-md">
                          <div
                            className="absolute top-0 left-0 h-full bg-primary rounded-full"
                            style={{
                              width: `${(summary.concentration_level / 10) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-right ml-4 min-w-12 text-lg font-semibold">
                          {summary.concentration_level}/10
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">רמת עייפות</h3>
                      <div className="flex items-center">
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden w-full max-w-md">
                          <div
                            className="absolute top-0 left-0 h-full bg-amber-500 rounded-full"
                            style={{
                              width: `${(summary.fatigue_level / 10) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-right ml-4 min-w-12 text-lg font-semibold">
                          {summary.fatigue_level}/10
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        האם השגת את המטרות?
                      </h3>
                      <span
                        className={`px-4 py-2 rounded-md inline-block ${
                          summary.goals_met
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {summary.goals_met ? "כן" : "לא"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        הנקודה החזקה ביותר
                      </h3>
                      <div className="p-4 bg-muted/30 rounded-md">
                        {summary.strongest_point}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        נקודות לשיפור
                      </h3>
                      <div className="p-4 bg-muted/30 rounded-md">
                        {summary.improvement_notes}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">סיכום משחק לא נמצא</h2>
            <p className="text-muted-foreground mt-2">
              סיכום המשחק המבוקש אינו קיים או שאין לך גישה אליו
            </p>
            <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
              חזרה
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
