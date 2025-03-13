
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { GameSummary } from "@/types/gameSummary";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export interface GameSummaryListProps {
  playerId: string;
  coachView?: boolean;
}

export function GameSummaryList({ playerId, coachView }: GameSummaryListProps) {
  const [summaries, setSummaries] = useState<GameSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGameSummaries = async () => {
      try {
        const { data, error } = await supabase
          .from("game_summaries")
          .select("*")
          .eq("player_id", playerId)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setSummaries(data || []);
      } catch (error: any) {
        console.error("Error fetching game summaries:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת סיכומי משחק",
          description: error.message || "אירעה שגיאה. אנא נסה שוב מאוחר יותר.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameSummaries();
  }, [playerId, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">אין סיכומי משחק</h3>
        <p className="text-muted-foreground mt-1">סיכומי משחק שתשמור יופיעו כאן</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {summaries.map((summary) => (
        <Card key={summary.id} className="overflow-hidden">
          <CardHeader className="bg-muted/40 pb-2">
            <CardTitle className="text-lg">
              סיכום משחק 
              {summary.opponent_team && ` מול ${summary.opponent_team}`}
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>
                {summary.game_date 
                  ? `תאריך המשחק: ${format(new Date(summary.game_date), "dd/MM/yyyy")}`
                  : `תאריך הסיכום: ${format(new Date(summary.created_at || ''), "dd/MM/yyyy")}`
                }
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="mb-4">
                  <h4 className="font-semibold mb-1">ביצוע כללי:</h4>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary rounded-full"
                      style={{ width: `${(summary.performance_rating / 10) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm mt-1">{summary.performance_rating}/10</div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-1">רמת ריכוז:</h4>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary rounded-full"
                      style={{ width: `${(summary.concentration_level / 10) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm mt-1">{summary.concentration_level}/10</div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-1">רמת עייפות:</h4>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-amber-500 rounded-full"
                      style={{ width: `${(summary.fatigue_level / 10) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm mt-1">{summary.fatigue_level}/10</div>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">האם השגת את המטרות?</h4>
                  <span className={`px-2 py-1 rounded-md text-xs ${summary.goals_met ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {summary.goals_met ? 'כן' : 'לא'}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <h4 className="font-semibold mb-1">הנקודה החזקה ביותר:</h4>
                  <p className="text-sm bg-muted/30 p-2 rounded-md">{summary.strongest_point}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">נקודות לשיפור:</h4>
                  <p className="text-sm bg-muted/30 p-2 rounded-md">{summary.improvement_notes}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
