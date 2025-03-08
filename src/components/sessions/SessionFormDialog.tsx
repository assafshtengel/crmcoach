
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/calendar/Calendar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SessionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSessionAdd?: (sessionData: {
    player_id: string;
    session_date: string;
    session_time: string;
    location?: string;
    notes?: string;
  }) => Promise<void>;
}

export function SessionFormDialog({ 
  open, 
  onOpenChange,
  onSessionAdd
}: SessionFormDialogProps) {
  const [events, setEvents] = React.useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = React.useState<string | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Here you would typically fetch events
    // For now, let's just set loading to false
    setLoading(false);
  }, []);

  const handleEventClick = (eventId: string) => {
    // Handle event click if needed
    console.log('Event clicked:', eventId);
  };

  const handleAddEvent = async (eventData: any) => {
    try {
      // Extract the required fields from the eventData
      if (!eventData.extendedProps?.player_id) {
        toast.error('נא לבחור שחקן לפני הוספת אירוע');
        return;
      }
      
      const sessionData = {
        player_id: eventData.extendedProps.player_id,
        session_date: eventData.start.split('T')[0],
        session_time: eventData.start.split('T')[1],
        location: eventData.extendedProps.location || '',
        notes: eventData.extendedProps.notes || ''
      };
      
      console.log('Extracted session data:', sessionData);
      
      if (onSessionAdd) {
        await onSessionAdd(sessionData);
        onOpenChange(false); // Close the dialog after successful submission
      }
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
        </DialogHeader>
        <div className="py-4">
          {loading ? (
            <div className="text-center py-4">טוען...</div>
          ) : (
            <Calendar
              events={events}
              onEventClick={handleEventClick}
              onEventAdd={handleAddEvent}
              selectedPlayerId={selectedPlayerId}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
