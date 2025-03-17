import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { GameSummary } from "@/types/gameSummary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface GameSummaryListProps {
  playerId: string;
  coachView?: boolean;
}

export function GameSummaryList({ playerId, coachView = false }: GameSummaryListProps) {
  const fetchSummaries = async (): Promise<GameSummary[]> => {
    const { data, error } = await supabase
      .from("game_summaries")
      .select("*")
      .eq("player_id", playerId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data.map((summary: any) => ({
      id: summary.id,
      player_id: summary.player_id,
      coach_id: summary.coach_id,
      created_at: summary.created_at,
      match_date: summary.game_date,
      opponent_name: summary.opponent_team,
      performance_rating: summary.performance_rating,
      concentration_level: summary.concentration_level,
      goals_met: summary.goals_met,
      strongest_point: summary.strongest_point,
      improvement_notes: summary.improvement_notes,
      fatigue_level: summary.fatigue_level
    }));
  };

  const { data: summaries, isLoading, error } = useQuery({
    queryKey: ["game-summaries", playerId],
    queryFn: fetchSummaries
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-destructive">
        שגיאה בטעינת נתונים: {(error as Error).message}
      </div>
    );
  }

  if (!summaries || summaries.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/20 rounded-lg border border-dashed">
        <p className="text-muted-foreground">אין סיכומי משחקים להצגה</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">סיכומי משחקים אחרונים</h3>
      {summaries.map((summary) => (
        <Card key={summary.id} className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">
                סיכום משחק
              </CardTitle>
              <CardDescription>
                {summary.created_at && format(new Date(summary.created_at), "dd/MM/yyyy")}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">דירוג ביצועים:</span>
                  <span className="font-medium">{summary.performance_rating}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">רמת ריכוז:</span>
                  <span className="font-medium">{summary.concentration_level}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">עמידה במטרות:</span>
                  <Badge variant={summary.goals_met ? "success" : "destructive"}>
                    {summary.goals_met ? "כן" : "לא"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">רמת עייפות:</span>
                  <span className="font-medium">{summary.fatigue_level}/10</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-1">הנקודה החזקה ביותר:</h4>
                  <p className="text-sm bg-muted/30 p-2 rounded">{summary.strongest_point}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">תחומים לשיפור:</h4>
                  <p className="text-sm bg-muted/30 p-2 rounded">{summary.improvement_notes}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
