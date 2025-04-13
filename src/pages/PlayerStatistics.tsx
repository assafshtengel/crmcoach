import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const PlayerStatistics = () => {
  const [newPlayersCount, setNewPlayersCount] = useState(0);
  const [totalSessionsCount, setTotalSessionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        console.error('No active session found.');
        return;
      }

      const coachId = session.session.user.id;

      // Fetch count of new players registered in the last 30 days
      const { data: newPlayers, error: newPlayersError } = await supabase
        .from('players')
        .select('*', { count: 'exact' })
        .eq('coach_id', coachId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (newPlayersError) {
        console.error('Error fetching new players:', newPlayersError);
        throw new Error('Failed to fetch new players.');
      }

      setNewPlayersCount(newPlayers ? newPlayers.length : 0);

      // Fetch total count of sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('*', { count: 'exact' })
        .eq('coach_id', coachId);

      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
        throw new Error('Failed to fetch sessions.');
      }

      setTotalSessionsCount(sessions ? sessions.length : 0);

    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת הנתונים הסטטיסטיים",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">סטטיסטיקות</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>שחקנים חדשים (30 ימים אחרונים)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>טוען...</div>
            ) : (
              <div className="text-3xl font-bold">{newPlayersCount}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>סה"כ מפגשים</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>טוען...</div>
            ) : (
              <div className="text-3xl font-bold">{totalSessionsCount}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlayerStatistics;
