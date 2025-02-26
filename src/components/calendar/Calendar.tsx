
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { he } from 'date-fns/locale';
import { format } from 'date-fns';

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
  };
}

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick: (eventId: string) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ events, onEventClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<'timeGridDay' | 'timeGridWeek' | 'dayGridMonth'>('dayGridMonth');

  const handleEventClick = (info: any) => {
    onEventClick(info.event.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button 
        variant="ghost" 
        className="flex items-center gap-2 text-white hover:bg-white/10"
        onClick={() => setIsOpen(true)}
      >
        <CalendarIcon className="h-5 w-5" />
        <span>לוח מפגשים</span>
      </Button>

      <DialogContent className="max-w-6xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">לוח מפגשים</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-2 mb-4">
          <Button
            variant={selectedView === 'timeGridDay' ? 'default' : 'outline'}
            onClick={() => setSelectedView('timeGridDay')}
          >
            יומי
          </Button>
          <Button
            variant={selectedView === 'timeGridWeek' ? 'default' : 'outline'}
            onClick={() => setSelectedView('timeGridWeek')}
          >
            שבועי
          </Button>
          <Button
            variant={selectedView === 'dayGridMonth' ? 'default' : 'outline'}
            onClick={() => setSelectedView('dayGridMonth')}
          >
            חודשי
          </Button>
        </div>

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
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
              },
              timeGridWeek: {
                titleFormat: { year: 'numeric', month: 'long' }
              },
              dayGridMonth: {
                titleFormat: { year: 'numeric', month: 'long' }
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
              <div className="p-1 text-sm">
                <div className="font-bold">{eventInfo.timeText}</div>
                <div>{eventInfo.event.extendedProps.playerName}</div>
                {eventInfo.event.extendedProps.location && (
                  <div className="text-xs text-gray-600">{eventInfo.event.extendedProps.location}</div>
                )}
              </div>
            )}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
