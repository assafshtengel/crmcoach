
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronDown, ChevronUp, RefreshCw, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, isAfter, isBefore } from 'date-fns';
import { he } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface UpcomingGame {
  id: string;
  playerId: string;
  playerName: string;
  date: string;
  sentReminder: boolean;
}

export function UpcomingGamesAlert() {
  const [upcomingGames, setUpcomingGames] = useState<UpcomingGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUpcomingGames = async () => {
    setRefreshing(true);
    try {
      const today = new Date();
      const next7Days = addDays(today, 7);
      
      // Format dates for database query
      const todayFormatted = format(today, 'yyyy-MM-dd');
      const next7DaysFormatted = format(next7Days, 'yyyy-MM-dd');
      
      // Get all upcoming games in the next 7 days
      const { data, error } = await supabase
        .from('player_meetings')
        .select(`
          id,
          player_id,
          meeting_date,
          players(full_name)
        `)
        .eq('meeting_type', 'game')
        .gte('meeting_date', todayFormatted)
        .lte('meeting_date', next7DaysFormatted)
        .order('meeting_date');

      if (error) throw error;
      
      // Check which games have already had reminders sent
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications_log')
        .select('message_content, session_id')
        .ilike('message_content', '%תזכורת למשחק%')
        .is('error_message', null);
        
      if (notificationsError) throw notificationsError;
      
      // Extract game IDs from notification messages
      const gameIdsWithReminders = new Set(
        notificationsData
          .filter(n => n.session_id)
          .map(n => n.session_id)
      );
      
      // Format the games data
      const formattedGames = data.map(game => ({
        id: game.id,
        playerId: game.player_id,
        playerName: game.players?.full_name || 'Unknown Player',
        date: game.meeting_date,
        sentReminder: gameIdsWithReminders.has(game.id)
      }));
      
      setUpcomingGames(formattedGames);
    } catch (error) {
      console.error('Error fetching upcoming games:', error);
      toast({
        variant: 'destructive',
        title: 'שגיאה בטעינת נתונים',
        description: 'לא ניתן לטעון את נתוני המשחקים הקרובים'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUpcomingGames();
    
    // Set up real-time subscription for new game meetings
    const channel = supabase
      .channel('upcoming-games-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'player_meetings',
        filter: 'meeting_type=eq.game'
      }, () => {
        fetchUpcomingGames();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const runManualCheck = async () => {
    try {
      setRefreshing(true);
      await supabase.functions.invoke('automated-notifications', {
        body: { action: 'send_game_reminders' }
      });
      
      toast({
        title: 'תזכורות נשלחו',
        description: 'תזכורות למשחקים נשלחו בהצלחה'
      });
      
      // Give the database time to update before refreshing
      setTimeout(() => {
        fetchUpcomingGames();
      }, 2000);
    } catch (error) {
      console.error('Error sending game reminders:', error);
      toast({
        variant: 'destructive',
        title: 'שגיאה בשליחת תזכורות',
        description: 'לא ניתן לשלוח תזכורות למשחקים כעת'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const sendManualReminder = async (gameId: string, playerId: string, playerName: string) => {
    setSendingReminder(gameId);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      // Create a message for the player
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: userData.user.id,
          recipient_id: playerId,
          content: `שלום ${playerName}, זוהי תזכורת למשחק הקרוב. אנא מלא את שאלון ההכנה למשחק בקישור הבא: /player/game-preparation/${gameId}`,
          is_read: false
        });

      if (messageError) throw messageError;
      
      // Log the notification
      await supabase.from('notifications_log').insert({
        coach_id: userData.user.id,
        message_content: `תזכורת למשחק נשלחה ל${playerName}`,
        status: 'Sent',
        session_id: gameId
      });
      
      toast({
        title: 'תזכורת נשלחה',
        description: `תזכורת נשלחה ל${playerName} בהצלחה`
      });
      
      // Refresh the list to show the reminder as sent
      fetchUpcomingGames();
    } catch (error) {
      console.error('Error sending manual reminder:', error);
      toast({
        variant: 'destructive',
        title: 'שגיאה בשליחת תזכורת',
        description: 'לא ניתן לשלוח תזכורת כעת'
      });
    } finally {
      setSendingReminder(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  // If no upcoming games, show minimal card
  if (upcomingGames.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <Calendar className="h-5 w-5" />
            אין משחקים בשבוע הקרוב
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={fetchUpcomingGames}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              רענן
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <span>{upcomingGames.length} משחקים בשבוע הקרוב</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      {expanded && (
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {upcomingGames.map(game => {
              const gameDate = new Date(game.date);
              const today = new Date();
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);
              
              // Check if the game is today or tomorrow
              const isToday = 
                gameDate.getDate() === today.getDate() && 
                gameDate.getMonth() === today.getMonth() && 
                gameDate.getFullYear() === today.getFullYear();
                
              const isTomorrow = 
                gameDate.getDate() === tomorrow.getDate() && 
                gameDate.getMonth() === tomorrow.getMonth() && 
                gameDate.getFullYear() === tomorrow.getFullYear();
              
              return (
                <div 
                  key={game.id} 
                  className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full">
                      {format(new Date(game.date), 'dd', { locale: he })}
                    </div>
                    <div>
                      <div className="font-medium">
                        {game.playerName}
                        {isToday && (
                          <Badge variant="destructive" className="ml-2">היום</Badge>
                        )}
                        {isTomorrow && (
                          <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-200">מחר</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(game.date), 'EEEE, dd/MM/yyyy', { locale: he })}
                      </div>
                    </div>
                  </div>
                  {game.sentReminder ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      נשלחה תזכורת
                    </Badge>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => sendManualReminder(game.id, game.playerId, game.playerName)}
                      disabled={sendingReminder === game.id}
                    >
                      {sendingReminder === game.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      שלח תזכורת
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={runManualCheck}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              שלח תזכורות אוטומטיות
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
