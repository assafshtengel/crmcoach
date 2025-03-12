
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/calendar/Calendar';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormControl } from '@/components/ui/form';

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
  const [events, setEvents] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [meetingType, setMeetingType] = useState<'in_person' | 'zoom'>('in_person');
  const [players, setPlayers] = useState<Array<{id: string, full_name: string}>>([]);

  // Fetch players for the dropdown
  useEffect(() => {
    async function fetchPlayers() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('players')
          .select('id, full_name')
          .eq('coach_id', user.id);

        if (error) throw error;
        setPlayers(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching players:', error);
        toast.error('שגיאה בטעינת רשימת שחקנים');
        setLoading(false);
      }
    }

    fetchPlayers();
  }, [open]);

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

      // Make sure all required fields exist and are formatted correctly
      const sessionData = {
        player_id: eventData.extendedProps.player_id,
        coach_id: user.id,
        session_date: eventData.start.split('T')[0],
        session_time: eventData.start.split('T')[1].substring(0, 5), // Ensure HH:MM format
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

      if (error) throw error;

      toast.success('המפגש נוצר בהצלחה');
      onOpenChange(false);
    } catch (error) {
      console.error('Error processing event data:', error);
      toast.error('אירעה שגיאה בשמירת המפגש');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>הוסף מפגש חדש</DialogTitle>
          <DialogDescription>
            בחר תאריך, שעה ומלא את הפרטים הנדרשים
          </DialogDescription>
        </DialogHeader>
        
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
          
          <div className="flex justify-end">
            <Button 
              variant="default" 
              onClick={() => {
                // Open calendar view for creating the meeting
                setLoading(false);
              }}
              className="bg-primary text-white hover:bg-primary/90"
            >
              המשך
            </Button>
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
      </DialogContent>
    </Dialog>
  );
}
