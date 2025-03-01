
import React from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { LogOut, Settings, Share2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import NotificationsDropdown from './NotificationsDropdown';
import { Calendar as CalendarComponent } from '@/components/calendar/Calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  type: string;
}

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
  };
}

interface DashboardHeaderProps {
  coachName: string;
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: (userId: string) => Promise<void>;
  calendarEvents: CalendarEvent[];
  handleEventClick: (eventId: string) => void;
  handleAddEvent: (eventData: Omit<CalendarEvent, 'id'>) => Promise<void>;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  coachName,
  notifications,
  unreadCount,
  fetchNotifications,
  calendarEvents,
  handleEventClick,
  handleAddEvent
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
      toast({
        title: "התנתקת בהצלחה",
        description: "להתראות!"
      });
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בהתנתקות",
        description: "אנא נסה שוב"
      });
    }
  };

  return (
    <header className="w-full bg-[#2C3E50] text-white py-6 mb-8 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-white/90" />
            </div>
            <div>
              <h1 className="text-2xl font-bold animate-fade-in">
                {coachName ? (
                  <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text">
                    ברוך הבא, {coachName}
                  </span>
                ) : (
                  'ברוך הבא'
                )}
              </h1>
              <p className="text-white/70 text-sm">{format(new Date(), 'EEEE, dd MMMM yyyy', { locale: he })}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <CalendarComponent events={calendarEvents} onEventClick={handleEventClick} onEventAdd={handleAddEvent} />
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10"
              onClick={() => navigate('/registration-links')}
            >
              <Share2 className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">לינקי הרשמה</span>
            </Button>
            
            <NotificationsDropdown 
              notifications={notifications}
              unreadCount={unreadCount}
              fetchNotifications={fetchNotifications}
            />
            
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10" 
              onClick={() => navigate('/profile-coach')}
            >
              <Settings className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">פרופיל</span>
            </Button>
            
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setIsLogoutDialogOpen(true)}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח שברצונך להתנתק?</AlertDialogTitle>
            <AlertDialogDescription>
              לאחר ההתנתקות תצטרך להתחבר מחדש כדי לגשת למערכת
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="sm:ml-2">ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>התנתק</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
};

export default DashboardHeader;
