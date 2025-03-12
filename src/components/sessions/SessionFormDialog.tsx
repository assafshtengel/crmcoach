import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar } from '@/components/calendar/Calendar';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SessionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSessionAdd?: (sessionData: {
    player_id: string;
    session_date: string;
    session_time: string;
    location?: string;
    notes?: string;
    meeting_type: 'in_person' | 'zoom';
  }) => Promise<void>;
}

export function SessionFormDialog({ 
  open, 
  onOpenChange,
}: SessionFormDialogProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [meetingType, setMeetingType] = useState<'in_person' | 'zoom'>('in_person');
  const [players, setPlayers] = useState<Array<{id: string, full_name: string}>>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('id, full_name')
          .eq('coach_id', user.id);

        if (playersError) throw playersError;
        setPlayers(playersData || []);

        await fetchSessions(user.id);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('שגיאה בטעינת נתונים');
      } finally {
        setLoading(false);
      }
    }

    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchSessions = async (coachId: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select(`
          *,
          players (full_name)
        `)
        .eq('coach_id', coachId)
        .gte('session_date', today.toISOString().split('T')[0]);

      if (sessionsError) throw sessionsError;

      const formattedEvents = (sessionsData || []).map(session => ({
        id: session.id,
        title: session.players?.full_name || 'מפגש',
        start: `${session.session_date}T${session.session_time}:00`,
        extendedProps: {
          playerName: session.players?.full_name || 'מפגש',
          player_id: session.player_id,
          location: session.location,
          reminderSent: session.reminder_sent,
          notes: session.notes,
          eventType: 'meeting'
        }
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('שגיאה בטעינת המפגשים');
    }
  };

  const handleEventClick = (eventId: string) => {
    console.log('Event clicked:', eventId);
  };

  const handleAddEvent = async (eventData: any) => {
    try {
      if (!eventData.extendedProps?.player_id) {
        toast.error('נא לבחור שחקן לפני הוספת מפגש');
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('משתמש לא מחובר');
        return;
      }

      const sessionData = {
        player_id: eventData.extendedProps.player_id,
        coach_id: user.id,
        session_date: eventData.start.split('T')[0],
        session_time: eventData.start.split('T')[1].substring(0, 5),
        location: eventData.extendedProps.location || '',
        notes: eventData.extendedProps.notes || '',
        reminder_sent: false,
        meeting_type: meetingType
      };
      
      console.log('Creating new session:', sessionData);
      
      const { data, error } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('Session creation error:', error);
        throw error;
      }

      await fetchSessions(user.id);
      
      toast.success('המפגש נוצר בהצלחה');
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error processing event data:', error);
      toast.error('אירעה שגיאה בשמירת המפגש');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh]">
        <DialogHeader>
          <DialogTitle>הוסף מפגש חדש</DialogTitle>
          <DialogDescription>
            בחר סוג מפגש, תאריך, שעה ומלא את הפרטים הנדרשים
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-full pr-4">
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="block text-sm font-medium">סוג מפגש</Label>
              <RadioGroup 
                value={meetingType} 
                onValueChange={(value) => setMeetingType(value as 'in_person' | 'zoom')}
                className="flex space-x-4 rtl:space-x-reverse"
              >
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="in_person" id="in_person" />
                  <Label htmlFor="in_person" className="cursor-pointer">פרונטלי</Label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="zoom" id="zoom" />
                  <Label htmlFor="zoom" className="cursor-pointer">זום</Label>
                </div>
              </RadioGroup>
            </div>
            
            {!loading && (
              <Calendar
                events={events}
                onEventClick={handleEventClick}
                onEventAdd={handleAddEvent}
                selectedPlayerId={selectedPlayerId}
                players={players}
                setSelectedPlayerId={setSelectedPlayerId}
              />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
