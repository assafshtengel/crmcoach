
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText } from 'lucide-react';

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
      full_name: string;
    };
  };
}

const SessionSummaries = () => {
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState<SessionSummary[]>([]);
  const [players, setPlayers] = useState<{ id: string; full_name: string }[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('all');

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
      return;
    }
    setSummaries(data);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowRight className="h-5 w-5" />
              חזרה
            </Button>
            <h1 className="text-2xl font-bold text-[#2C3E50]">סיכומי מפגשים</h1>
          </div>
          <Select
            value={selectedPlayer}
            onValueChange={(value) => setSelectedPlayer(value)}
          >
            <SelectTrigger className="w-[200px]">
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
            <Card key={summary.id} className="bg-white/90 hover:bg-white transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-medium">
                      {summary.session.player.full_name}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {format(new Date(summary.session.session_date), 'dd/MM/yyyy', { locale: he })}
                    </p>
                  </div>
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-1">סיכום המפגש</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{summary.summary_text}</p>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>דירוג התקדמות: {summary.progress_rating}/5</span>
                    <span className="text-gray-500 text-xs">
                      {format(new Date(summary.created_at), 'HH:mm dd/MM/yyyy', { locale: he })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SessionSummaries;
