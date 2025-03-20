
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SessionSummary {
  id: string;
  created_at: string;
  summary_text: string;
  achieved_goals: string[];
  future_goals: string[];
  progress_rating: number;
  next_session_focus: string;
  additional_notes?: string;
  player_id?: string; // מזהה שחקן ישירות בסיכום
  session: {
    id: string;
    session_date: string;
    player_id: string;
    player: {
      full_name: string;
    } | null;
  };
}

const SessionSummaries = () => {
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState<SessionSummary[]>([]);
  const [players, setPlayers] = useState<{ id: string; full_name: string }[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummaries = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const query = supabase
      .from('session_summaries')
      .select(`
        *,
        session:sessions (
          id,
          session_date,
          player_id,
          player:players (
            full_name
          )
        )
      `)
      .eq('coach_id', user.id)
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching summaries:', error);
      return;
    }
    
    // Filter summaries based on the selected player
    let filteredSummaries = data as SessionSummary[];
    
    if (selectedPlayer !== 'all') {
      filteredSummaries = filteredSummaries.filter(
        summary => 
          // סינון מחמיר שמוודא שמזהה השחקן מתאים לשחקן שנבחר
          (summary.player_id === selectedPlayer) || 
          (summary.session && summary.session.player_id === selectedPlayer)
      );
    }
    
    // Create a Map to ensure unique sessions (by session ID)
    const uniqueSessions = new Map<string, SessionSummary>();
    filteredSummaries.forEach((summary: SessionSummary) => {
      // Add null check for session and player
      if (summary.session && summary.session.id) {
        uniqueSessions.set(summary.session.id, summary);
      }
    });
    
    setSummaries(Array.from(uniqueSessions.values()));
    setIsLoading(false);
  };

  const fetchPlayers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('players')
      .select('id, full_name')
      .eq('coach_id', user.id);

    if (error) {
      console.error('Error fetching players:', error);
      return;
    }
    setPlayers(data);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    fetchSummaries();
  }, [selectedPlayer]);

  const renderSummaryDetails = (summary: SessionSummary) => {
    return (
      <ScrollArea className="h-[calc(100vh-200px)] px-4">
        <div className="space-y-6 text-right">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#6E59A5]">סיכום המפגש</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{summary.summary_text}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#7E69AB]">מטרות שהושגו</h3>
            <ul className="list-disc list-inside space-y-1 mr-4">
              {summary.achieved_goals.map((goal, index) => (
                <li key={index} className="text-gray-700">{goal}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#9b87f5]">מטרות להמשך</h3>
            <ul className="list-disc list-inside space-y-1 mr-4">
              {summary.future_goals.map((goal, index) => (
                <li key={index} className="text-gray-700">{goal}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#D6BCFA]">פוקוס למפגש הבא</h3>
            <p className="text-gray-700">{summary.next_session_focus}</p>
          </div>

          {summary.additional_notes && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-[#8B5CF6]">הערות נוספות</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{summary.additional_notes}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2FCE2] to-[#E5DEFF]">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowRight className="h-5 w-5" />
              חזרה
            </Button>
            <h1 className="text-2xl font-bold text-[#6E59A5]">סיכומי מפגשים</h1>
          </div>
          <Select
            value={selectedPlayer}
            onValueChange={(value) => setSelectedPlayer(value)}
          >
            <SelectTrigger className="w-[200px] text-right">
              <SelectValue placeholder="בחר שחקן" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל השחקנים</SelectItem>
              {players.map(player => (
                <SelectItem key={player.id} value={player.id}>
                  {player.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : summaries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {summaries.map(summary => (
              <Card key={summary.id} className="bg-white/90 hover:bg-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-100">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="text-right w-full">
                      <CardTitle className="text-lg font-medium text-[#6E59A5]">
                        {summary.session?.player?.full_name || "שחקן לא ידוע"}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        {format(new Date(summary.session?.session_date || new Date()), 'dd/MM/yyyy', { locale: he })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mr-2">
                      <FileText className="h-5 w-5 text-[#9b87f5]" />
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4 text-[#7E69AB] hover:text-[#6E59A5]" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-screen">
                          <DialogHeader>
                            <DialogTitle className="flex items-center justify-between mb-4 text-right">
                              <span className="text-[#6E59A5]">סיכום מפגש - {summary.session?.player?.full_name || "שחקן לא ידוע"}</span>
                              <span className="text-sm font-normal text-gray-500">
                                {format(new Date(summary.session?.session_date || new Date()), 'dd/MM/yyyy', { locale: he })}
                              </span>
                            </DialogTitle>
                          </DialogHeader>
                          {renderSummaryDetails(summary)}
                          <div className="flex items-center justify-between pt-4 border-t mt-4">
                            <div className="text-gray-600 text-right w-full">
                              דירוג התקדמות: <span className="font-semibold text-[#6E59A5]">{summary.progress_rating}/5</span>
                            </div>
                            <DialogClose asChild>
                              <Button variant="outline">סגור</Button>
                            </DialogClose>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-right">
                    <div>
                      <h3 className="text-sm font-semibold mb-1 text-[#7E69AB]">סיכום המפגש</h3>
                      <p className="text-sm text-gray-600 line-clamp-3">{summary.summary_text}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 text-xs">
                        {format(new Date(summary.created_at), 'HH:mm dd/MM/yyyy', { locale: he })}
                      </span>
                      <span className="text-[#6E59A5]">דירוג התקדמות: {summary.progress_rating}/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/80 rounded-lg shadow">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">לא נמצאו סיכומי מפגשים</h3>
            <p className="text-gray-500">
              {selectedPlayer !== 'all' 
                ? 'אין סיכומי מפגשים לשחקן זה' 
                : 'לא נמצאו סיכומי מפגשים במערכת'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionSummaries;
