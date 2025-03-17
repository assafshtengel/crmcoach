
import React from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, Bell, Share2, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Notification } from './types';
import { Check } from 'lucide-react';

interface DashboardHeaderProps {
  coachName: string;
  profilePicture: string | null;
  unreadCount: number;
  notifications: Notification[];
  onMarkAsRead: (notificationId: string, e?: React.MouseEvent) => Promise<void>;
  onLogoutClick: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  coachName,
  profilePicture,
  unreadCount,
  notifications,
  onMarkAsRead,
  onLogoutClick
}) => {
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
                <Users className="h-6 w-6 text-white/90" />
              )}
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
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10"
              onClick={() => navigate('/registration-links')}
            >
              <Share2 className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">לינקי הרשמה</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative text-white hover:bg-white/10">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && 
                    <span className="absolute -top-1 -right-1 bg-[#E74C3C] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  }
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-2 border-b dark:border-gray-700">
                  <h3 className="font-semibold text-lg px-2 py-1 dark:text-white">התראות</h3>
                </div>
                <ScrollArea className="h-[400px]">
                  {notifications.length > 0 ? (
                    <div className="py-2">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`relative w-full text-right px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <p className="text-sm text-gray-900 dark:text-gray-100">{notification.message}</p>
                            {!notification.is_read && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 ml-2 text-green-600 hover:text-green-700 hover:bg-green-50" 
                                onClick={e => onMarkAsRead(notification.id, e)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                      אין התראות חדשות
                    </div>
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
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
              onClick={onLogoutClick}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
