
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { GameSummary } from "@/types/gameSummary";

export default function PlayerGameSummaryView() {
  const [playerData, setPlayerData] = useState<{id: string, full_name: string} | null>(null);
  const [gameSummaries, setGameSummaries] = useState<GameSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { playerId } = useParams<{playerId: string}>();
  const navigate = useNavigate();

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
        
        // Fetch game summaries
        const { data: summariesData, error: summariesError } = await supabase
          .from("game_summaries")
          .select("*")
          .eq("player_id", playerId)
          .order("created_at", { ascending: false });
          
        if (summariesError) {
          throw summariesError;
        }
        
        setGameSummaries(summariesData || []);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error(`שגיאה בטעינת נתונים: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    getPlayerData();
  }, [playerId]);

  if (loading) {
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

  if (!playerData) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-8">
          <Button variant="outline" onClick={() => navigate(`/players-list`)}>
            <ArrowRight className="mr-2 h-4 w-4" /> חזרה לרשימת שחקנים
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">שחקן לא נמצא</h2>
          <p className="text-muted-foreground mt-2">לא ניתן למצוא את פרטי השחקן המבוקש</p>
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
        <div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => toast.info("ייצוא טבלה יהיה זמין בקרוב")}
          >
            <FileSpreadsheet className="h-4 w-4" />
            ייצא לאקסל
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>היסטוריית סיכומי משחק</CardTitle>
        </CardHeader>
        <CardContent>
          {gameSummaries.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">אין סיכומי משחק</h3>
              <p className="text-muted-foreground mt-1">
                סיכומי משחק שתשמור יופיעו כאן
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>סיכומי משחק עבור {playerData.full_name}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>תאריך משחק</TableHead>
                    <TableHead>יריב</TableHead>
                    <TableHead>ביצוע</TableHead>
                    <TableHead>ריכוז</TableHead>
                    <TableHead>עייפות</TableHead>
                    <TableHead>נקודה חזקה</TableHead>
                    <TableHead>לשיפור</TableHead>
                    <TableHead>מטרות הושגו</TableHead>
                    <TableHead>פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gameSummaries.map((summary) => (
                    <TableRow key={summary.id}>
                      <TableCell>
                        {summary.game_date 
                          ? format(new Date(summary.game_date), "dd/MM/yyyy")
                          : format(new Date(summary.created_at || ''), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{summary.opponent_team || "לא צוין"}</TableCell>
                      <TableCell className="text-center">
                        <span className="inline-block min-w-8 px-2 py-1 bg-primary/10 rounded-md">
                          {summary.performance_rating}/10
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-block min-w-8 px-2 py-1 bg-primary/10 rounded-md">
                          {summary.concentration_level}/10
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-block min-w-8 px-2 py-1 bg-amber-500/10 rounded-md">
                          {summary.fatigue_level}/10
                        </span>
                      </TableCell>
                      <TableCell className="max-w-40 truncate">
                        {summary.strongest_point}
                      </TableCell>
                      <TableCell className="max-w-40 truncate">
                        {summary.improvement_notes}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-md text-xs ${
                          summary.goals_met 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {summary.goals_met ? 'כן' : 'לא'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/game-summary-details/${summary.id}`)}
                        >
                          פרטים
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
