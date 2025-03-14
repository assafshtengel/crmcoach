
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Users, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDistance } from 'date-fns';
import { he } from 'date-fns/locale';

interface PlayerWithMissingForm {
  id: string;
  name: string;
  missedDays: number;
  lastSubmission?: string;
}

export function MissingFormsAlert() {
  const [playersWithMissingForms, setPlayersWithMissingForms] = useState<PlayerWithMissingForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchMissingForms = async () => {
    setRefreshing(true);
    try {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'missing_form')
        .eq('is_read', false)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Extract unique players and their info
      const playersMap = new Map<string, PlayerWithMissingForm>();
      
      notifications.forEach(notification => {
        const meta = notification.meta;
        if (meta && meta.player_id && !playersMap.has(meta.player_id)) {
          playersMap.set(meta.player_id, {
            id: meta.player_id,
            name: meta.player_name,
            missedDays: meta.missed_days || 1,
            lastSubmission: meta.last_submission
          });
        }
      });
      
      setPlayersWithMissingForms(Array.from(playersMap.values()));
    } catch (error) {
      console.error('Error fetching missing forms:', error);
      toast({
        variant: 'destructive',
        title: 'שגיאה בטעינת נתונים',
        description: 'לא ניתן לטעון את נתוני השחקנים שלא מילאו טפסים'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMissingForms();
    
    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('missing-forms-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: 'type=eq.missing_form'
      }, () => {
        fetchMissingForms();
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
        body: { action: 'check_daily_forms' }
      });
      
      toast({
        title: 'בדיקה הושלמה',
        description: 'הנתונים יתעדכנו בקרוב'
      });
      
      // Give the database time to update before refreshing
      setTimeout(() => {
        fetchMissingForms();
      }, 2000);
    } catch (error) {
      console.error('Error running manual check:', error);
      toast({
        variant: 'destructive',
        title: 'שגיאה בהפעלת בדיקה',
        description: 'לא ניתן להפעיל בדיקה ידנית כעת'
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  // If no players with missing forms, show minimal card
  if (playersWithMissingForms.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Users className="h-5 w-5" />
            כל השחקנים מילאו את השאלונים היומיים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={runManualCheck}
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
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span>{playersWithMissingForms.length} שחקנים לא מילאו שאלון יומי</span>
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
            {playersWithMissingForms.map(player => (
              <div 
                key={player.id} 
                className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                    <AvatarImage src={`/api/avatar/${player.id}`} />
                  </Avatar>
                  <div>
                    <div className="font-medium">{player.name}</div>
                    {player.lastSubmission ? (
                      <div className="text-xs text-muted-foreground">
                        מילא לאחרונה: {formatDistance(new Date(player.lastSubmission), new Date(), { addSuffix: true, locale: he })}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        לא נמצא מילוי קודם
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant={player.missedDays > 2 ? "destructive" : "outline"}>
                  {player.missedDays} {player.missedDays === 1 ? "יום" : "ימים"}
                </Badge>
              </div>
            ))}
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
              בדוק שוב
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
