
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Calendar, User, BookOpen, Trophy, Home, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface PlayerDetails {
  full_name: string;
  team?: string;
  position?: string;
  notes?: string;
}

interface UpcomingSession {
  id: string;
  session_date: string;
  session_time: string;
  notes?: string;
}

const DashboardPlayer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [playerDetails, setPlayerDetails] = useState<PlayerDetails | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [evaluationCount, setEvaluationCount] = useState(0);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/auth');
          return;
        }

        // קבלת פרטי השחקן
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select('*')
          .eq('id', user.id)
          .single();

        if (playerError) throw playerError;
        if (playerData) setPlayerDetails(playerData);

        // קבלת מפגשים קרובים
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('sessions')
          .select('*')
          .eq('player_id', user.id)
          .gte('session_date', new Date().toISOString().split('T')[0])
          .order('session_date', { ascending: true })
          .order('session_time', { ascending: true })
          .limit(5);

        if (sessionsError) throw sessionsError;
        if (sessionsData) setUpcomingSessions(sessionsData);

        // קבלת מספר ההערכות
        const { count, error: evaluationsError } = await supabase
          .from('player_evaluations')
          .select('*', { count: 'exact', head: true })
          .eq('id', user.id);

        if (evaluationsError) throw evaluationsError;
        if (count !== null) setEvaluationCount(count);

      } catch (error: any) {
        console.error('Error fetching player data:', error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת הנתונים",
          description: "אנא נסה שוב מאוחר יותר"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="w-full bg-[#1A1F2C] dark:bg-gray-800 text-white py-6 mb-8 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold">שלום, {playerDetails?.full_name}</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="text-white hover:text-white/80"
                onClick={() => navigate('/')}
              >
                <Home className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:text-white/80"
                onClick={() => navigate('/profile')}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* פרטי שחקן */}
          <Card className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                פרטי שחקן
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>קבוצה:</strong> {playerDetails?.team || 'לא צוין'}</p>
                <p><strong>עמדה:</strong> {playerDetails?.position || 'לא צוין'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {playerDetails?.notes || 'אין הערות נוספות'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* מפגשים קרובים */}
          <Card className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                מפגשים קרובים
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="border-b pb-2 last:border-0">
                      <p className="font-semibold">
                        {format(new Date(session.session_date), 'dd/MM/yyyy', { locale: he })}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {session.session_time.substring(0, 5)}
                      </p>
                      {session.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {session.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">אין מפגשים קרובים</p>
              )}
            </CardContent>
          </Card>

          {/* הערכות */}
          <Card className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                הערכות והתקדמות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>מספר הערכות שבוצעו: {evaluationCount}</p>
                <Button 
                  className="w-full"
                  onClick={() => navigate('/evaluations')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  צפה בהערכות
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardPlayer;
