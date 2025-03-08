
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Bell, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/calendar/Calendar';
import { NotificationsDropdown } from './NotificationsDropdown';
import { CalendarEvent, Notification } from '@/types/dashboard';

interface DashboardHeaderProps {
  coachName: string;
  profilePicture: string | null;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string, e?: React.MouseEvent) => void;
  calendarEvents: CalendarEvent[];
  onEventClick: (eventId: string) => void;
  onEventAdd: (eventData: any) => Promise<void>;
  onLogoutClick: () => void;
}

export function DashboardHeader({
  coachName,
  profilePicture,
  notifications,
  unreadCount,
  markAsRead,
  calendarEvents,
  onEventClick,
  onEventAdd,
  onLogoutClick
}: DashboardHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-[#2C3E50] text-white py-6 mb-8 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center overflow-hidden">
              {profilePicture ? (
                <Avatar className="w-12 h-12">
                  <AvatarImage src={profilePicture} alt={coachName} />
                  <AvatarFallback>{coachName.charAt(0)}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-700">
                    {coachName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold animate-fade-in">
                <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text">
                  ברוך הבא, {coachName || 'מאמן'}
                </span>
              </h1>
              <p className="text-white/70 text-sm">
                {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: he })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Calendar 
              events={calendarEvents} 
              onEventClick={onEventClick} 
              onEventAdd={onEventAdd} 
            />
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
              markAsRead={markAsRead} 
            />
            
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10"
              onClick={onLogoutClick}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
