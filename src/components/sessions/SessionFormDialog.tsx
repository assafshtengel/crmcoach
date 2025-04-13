
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/calendar/Calendar';
import { supabase } from '@/integrations/supabase/client';
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
  onSessionAdd
}: SessionFormDialogProps) {
  const [events, setEvents] = React.useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [meetingType, setMeetingType] = useState<'in_person' | 'zoom'>('in_person');

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
      
      // Make sure all required fields exist and are formatted correctly
      const sessionData = {
        player_id: eventData.extendedProps.player_id,
        session_date: eventData.start.split('T')[0],
        session_time: eventData.start.split('T')[1].substring(0, 5), // Ensure HH:MM format
        location: eventData.extendedProps.location || '',
        notes: eventData.extendedProps.notes || '',
        meeting_type: meetingType
      };
      
      console.log('Sending session data to parent:', sessionData);
      
      if (onSessionAdd) {
        try {
          await onSessionAdd(sessionData);
          toast.success('המפגש נשמר בהצלחה');
          onOpenChange(false); // Close the dialog after successful submission
        } catch (error) {
          console.error('Error in onSessionAdd:', error);
          toast.error('אירעה שגיאה בשמירת המפגש');
        }
      }
    } catch (error) {
      console.error('Error processing event data:', error);
      toast.error('אירעה שגיאה בעיבוד נתוני המפגש');
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
