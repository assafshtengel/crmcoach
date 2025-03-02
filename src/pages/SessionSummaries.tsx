
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';

interface SessionSummary {
  id: string;
  created_at: string;
  summary_text: string;
  achieved_goals: string[];
  future_goals: string[];
  progress_rating: number;
  next_session_focus: string;
  additional_notes?: string;
  session: {
    session_date: string;
    player: {
      id: string;
      full_name: string;
    };
  };
}

const SessionSummaries = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [summaries, setSummaries] = useState<SessionSummary[]>([]);
  const [players, setPlayers] = useState<{ id: string; full_name: string }[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('all');
  const [openSummaryId, setOpenSummaryId] = useState<string | null>(null);
  const [currentSummary, setCurrentSummary] = useState<SessionSummary | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(location.search);
    const summaryId = params.get('id');
    const playerId = params.get('player');
    
    if (playerId) {
      setSelectedPlayer(playerId);
    }
    
    if (summaryId) {
      setOpenSummaryId(summaryId);
    }
  }, [location]);

  const fetchSummaries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const query = supabase
      .from('session_summaries')
      .select(`
        *,
        session:sessions (
          session_date,
          player:players (
            id,
            full_name
          )
        )
      `)
      .eq('coach_id', user.id)
      .order('created_at', { ascending: false });

    if (selectedPlayer !== 'all') {
      query.eq('sessions.player_id', selectedPlayer);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching summaries:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת הסיכומים",
        description: "אנא נסה שוב מאוחר יותר"
      });
      return;
    }
    setSummaries(data);

    // If a specific summary ID was requested, open that summary
    if (openSummaryId) {
      const targetSummary = data.find(summary => summary.id === openSummaryId);
      if (targetSummary) {
        setCurrentSummary(targetSummary);
        setIsDialogOpen(true);
      } else {
        toast({
          variant: "destructive",
          title: "סיכום לא נמצא",
          description: "הסיכום המבוקש לא נמצא"
        });
        // Clear the ID param from URL without full page refresh
        const newUrl = window.location.pathname;
        window.history.pushState({}, '', newUrl);
      }
    }
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
  }, [selectedPlayer, openSummaryId]);

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setCurrentSummary(null);
    // Clear the ID param from URL without full page refresh
    const newUrl = window.location.pathname;
    if (selectedPlayer !== 'all') {
      newUrl + `?player=${selectedPlayer}`;
    }
    window.history.pushState({}, '', newUrl);
  };

  const openSummaryDialog = (summary: SessionSummary) => {
    setCurrentSummary(summary);
    setIsDialogOpen(true);
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summaries.map(summary => (
            <Card key={summary.id} className="bg-white/90 hover:bg-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-100">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="text-right w-full">
                    <CardTitle className="text-lg font-medium text-[#6E59A5]">
                      {summary.session.player.full_name}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {format(new Date(summary.session.session_date), 'dd/MM/yyyy', { locale: he })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mr-2">
                    <FileText className="h-5 w-5 text-[#9b87f5]" />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => openSummaryDialog(summary)}
                    >
                      <Eye className="h-4 w-4 text-[#7E69AB] hover:text-[#6E59A5]" />
                    </Button>
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

        {/* Summary dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-screen">
            {currentSummary && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between mb-4 text-right">
                    <span className="text-[#6E59A5]">סיכום מפגש - {currentSummary.session.player.full_name}</span>
                    <span className="text-sm font-normal text-gray-500">
                      {format(new Date(currentSummary.session.session_date), 'dd/MM/yyyy', { locale: he })}
                    </span>
                  </DialogTitle>
                </DialogHeader>
                {renderSummaryDetails(currentSummary)}
                <div className="flex items-center justify-between pt-4 border-t mt-4">
                  <div className="text-gray-600 text-right w-full">
                    דירוג התקדמות: <span className="font-semibold text-[#6E59A5]">{currentSummary.progress_rating}/5</span>
                  </div>
                  <DialogClose asChild onClick={handleDialogClose}>
                    <Button variant="outline">סגור</Button>
                  </DialogClose>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SessionSummaries;
