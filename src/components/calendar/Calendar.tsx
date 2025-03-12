
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  location?: string;
  extendedProps: {
    playerName: string;
    location?: string;
    reminderSent: boolean;
    notes?: string;
    eventType?: 'meeting';
    player_id?: string; 
  };
}

interface SessionData {
  player_id: string;
  coach_id?: string;
  session_date: string;
  session_time: string;
  location?: string;
  notes?: string;
}

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick: (eventId: string) => void;
  onEventAdd?: (eventData: any) => Promise<void>;
  selectedPlayerId?: string;
  players?: Array<{id: string, full_name: string}>;
  setSelectedPlayerId?: React.Dispatch<React.SetStateAction<string | undefined>>;
}

interface EventFormData {
  title: string;
  date: string;
  time: string;
  notes?: string;
  player_id?: string;
  location?: string;
}

export const Calendar: React.FC<CalendarProps> = ({ events, onEventClick, onEventAdd, selectedPlayerId, players, setSelectedPlayerId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedView, setSelectedView] = useState<'timeGridDay' | 'timeGridWeek' | 'dayGridMonth'>('dayGridMonth');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<EventFormData>({
    defaultValues: {
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      notes: '',
      player_id: selectedPlayerId,
      location: ''
    }
  });

  React.useEffect(() => {
    if (selectedPlayerId) {
      form.setValue('player_id', selectedPlayerId);
    }
  }, [selectedPlayerId, form]);

  const handleEventClick = (info: any) => {
    const event = events.find(e => e.id === info.event.id);
    if (event) {
      setSelectedEvent(event);
    }
  };

  const closeDialog = () => {
    setSelectedEvent(null);
  };

  const handleEditClick = () => {
    if (selectedEvent) {
      onEventClick(selectedEvent.id);
      setSelectedEvent(null);
    }
  };

  const onAddEvent = async (data: EventFormData) => {
    if (!onEventAdd) return;
    
    if (!data.player_id && !selectedPlayerId) {
      toast.error('נא לבחור שחקן לפני הוספת מפגש');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const playerIdToUse = data.player_id || selectedPlayerId;
      
      console.log('Saving event with player_id:', playerIdToUse);
      
      const eventData = {
        title: data.title,
        start: `${data.date}T${data.time}:00`,
        extendedProps: {
          notes: data.notes,
          eventType: 'meeting',
          player_id: playerIdToUse,
          location: data.location,
          playerName: data.title
        }
      };
      
      console.log('Submitting event data:', eventData);
      
      await onEventAdd(eventData);
      
      setIsAddEventOpen(false);
      form.reset({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        notes: '',
        player_id: selectedPlayerId,
        location: ''
      });
      
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('אירעה שגיאה, אנא נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEventColor = () => {
    return '#1E3A8A'; // Dark blue for meetings
  };

  return (
    <>
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 text-white hover:bg-white/10"
          onClick={() => setIsOpen(true)}
        >
          <CalendarIcon className="h-5 w-5" />
          <span>לוח מפגשים</span>
        </Button>
        {onEventAdd && (
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-white hover:bg-white/10"
            onClick={() => setIsAddEventOpen(true)}
          >
            <Plus className="h-5 w-5" />
            <span>הוסף מפגש</span>
          </Button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">לוח מפגשים</DialogTitle>
            <DialogDescription>צפה במפגשים מתוכננים</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={selectedView}
              headerToolbar={{
                start: 'prev,next today',
                center: 'title',
                end: '',
              }}
              views={{
                timeGridDay: {
                  type: 'timeGrid',
                  duration: { days: 1 }
                },
                timeGridWeek: {
                  type: 'timeGrid',
                  duration: { weeks: 1 }
                },
                dayGridMonth: {
                  type: 'dayGrid',
                  duration: { months: 1 }
                }
              }}
              events={events}
              eventClick={handleEventClick}
              locale="he"
              direction="rtl"
              firstDay={0}
              allDaySlot={false}
              slotMinTime="07:00:00"
              slotMaxTime="22:00:00"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
              eventContent={(eventInfo) => (
                <div 
                  className="p-1 text-sm"
                  style={{ backgroundColor: getEventColor() }}
                >
                  <div className="font-bold text-white">{eventInfo.timeText}</div>
                  <div className="text-white">{eventInfo.event.extendedProps.playerName}</div>
                  {eventInfo.event.extendedProps.location && (
                    <div className="text-xs text-white/80">{eventInfo.event.extendedProps.location}</div>
                  )}
                </div>
              )}
            />
          </div>
        </DialogContent>
      </Dialog>

      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={closeDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>פרטי מפגש</DialogTitle>
              <DialogDescription>מידע מפורט על המפגש</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <h3 className="font-bold mb-1">כותרת</h3>
                <p className="text-lg">{selectedEvent.extendedProps.playerName}</p>
              </div>
              <div>
                <h3 className="font-bold mb-1">תאריך ושעה</h3>
                <p className="text-lg">{format(new Date(selectedEvent.start), 'dd/MM/yyyy HH:mm')}</p>
              </div>
              {selectedEvent.extendedProps.location && (
                <div>
                  <h3 className="font-bold mb-1">מיקום</h3>
                  <p className="text-lg">{selectedEvent.extendedProps.location}</p>
                </div>
              )}
              {selectedEvent.extendedProps.notes && (
                <div>
                  <h3 className="font-bold mb-1">הערות</h3>
                  <p className="text-lg whitespace-pre-wrap">{selectedEvent.extendedProps.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeDialog}>סגור</Button>
              <Button onClick={handleEditClick}>ערוך</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isAddEventOpen} onOpenChange={(open) => {
        if (!open) {
          form.reset({
            title: '',
            date: new Date().toISOString().split('T')[0],
            time: '12:00',
            notes: '',
            player_id: selectedPlayerId,
            location: ''
          });
        }
        setIsAddEventOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>הוספת מפגש חדש</DialogTitle>
            <DialogDescription>מלא את הפרטים להוספת מפגש חדש</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddEvent)} className="space-y-4">
              {players && setSelectedPlayerId && (
                <FormField
                  control={form.control}
                  name="player_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>שחקן</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedPlayerId(value);
                        }}
                        value={field.value || selectedPlayerId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="בחר שחקן" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {players.map((player) => (
                            <SelectItem key={player.id} value={player.id}>
                              {player.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>כותרת</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>תאריך</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} required />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שעה</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} required />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>מיקום</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="הוסף מיקום למפגש..." />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>הערות</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  form.reset();
                  setIsAddEventOpen(false);
                }}>
                  ביטול
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'שומר...' : 'שמור'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
