
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Clock, MapPin, FileText, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Session {
  id: string;
  session_date: string;
  session_time: string;
  notes?: string;
  has_started: boolean;
  player: {
    full_name: string;
  };
  location?: string;
}

interface EditSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session | null;
  onSessionUpdated?: () => void;
}

export function EditSessionDialog({ 
  open, 
  onOpenChange,
  session,
  onSessionUpdated
}: EditSessionDialogProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    session?.session_date ? new Date(session.session_date) : undefined
  );
  const [time, setTime] = React.useState(session?.session_time || '');
  const [location, setLocation] = React.useState(session?.location || '');
  const [notes, setNotes] = React.useState(session?.notes || '');
  const [isSaving, setIsSaving] = React.useState(false);
  const navigate = useNavigate();

  // Update state when session changes
  React.useEffect(() => {
    if (session) {
      setDate(session.session_date ? new Date(session.session_date) : undefined);
      setTime(session.session_time || '');
      setLocation(session.location || '');
      setNotes(session.notes || '');
    }
  }, [session]);

  const handleSaveChanges = async () => {
    if (!session?.id || !date) {
      toast.error('חסרים פרטים לשמירת המפגש');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Format the date to ISO format (YYYY-MM-DD)
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Update the session in Supabase
      const { error } = await supabase
        .from('sessions')
        .update({
          session_date: formattedDate,
          session_time: time,
          location: location,
          notes: notes
        })
        .eq('id', session.id);
      
      if (error) throw error;
      
      toast.success('המפגש עודכן בהצלחה');
      
      // Close the dialog and notify parent component
      onOpenChange(false);
      
      // Call the callback function to refresh the sessions list
      if (onSessionUpdated) {
        onSessionUpdated();
      }
    } catch (error: any) {
      console.error('Error updating session:', error);
      toast.error(`שגיאה בעדכון המפגש: ${error.message || 'אנא נסה שנית'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSummarizeSession = () => {
    if (session?.id) {
      navigate('/edit-session', { state: { sessionId: session.id, needsSummary: true } });
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto" side="right">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            עריכת מפגש
          </SheetTitle>
          <SheetDescription>
            {session?.player?.full_name && (
              <div className="text-lg font-medium mt-1">
                מפגש עם {session.player.full_name}
              </div>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="date">תאריך</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-right font-normal",
                    !date && "text-muted-foreground"
                  )}
                  id="date"
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy") : <span>בחר תאריך</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time">שעה</Label>
            <div className="relative">
              <Clock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">מיקום</Label>
            <div className="relative">
              <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="מיקום המפגש"
                className="pr-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הערות לגבי המפגש"
              rows={3}
            />
          </div>
          
          <div className="flex flex-col gap-3 pt-2">
            <Button 
              className="w-full"
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  שומר שינויים...
                </>
              ) : (
                'שמור שינויים'
              )}
            </Button>
            
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={handleSummarizeSession}
            >
              <FileText className="ml-2 h-4 w-4" />
              סכם מפגש
            </Button>
            
            <Button 
              variant="destructive" 
              className="w-full"
              type="button"
            >
              <Trash2 className="ml-2 h-4 w-4" />
              מחק מפגש
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
