
import React from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistance } from 'date-fns';
import { he } from 'date-fns/locale';
import { Notification } from '@/types/dashboard';

interface NotificationsDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string, e?: React.MouseEvent) => void;
}

export function NotificationsDropdown({
  notifications,
  unreadCount,
  markAsRead
}: NotificationsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative text-white hover:bg-white/10">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#E74C3C] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
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
                  className={`relative w-full text-right px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 ml-3">
                      <p className={`text-sm ${!notification.is_read ? 'font-semibold' : ''}`}>
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistance(new Date(notification.created_at), new Date(), {
                          addSuffix: true,
                          locale: he
                        })}
                      </span>
                    </div>
                    {!notification.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-green-500"
                        onClick={(e) => markAsRead(notification.id, e)}
                      >
                        <Check className="h-3 w-3" />
                        <span className="sr-only">Mark as read</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-gray-500 dark:text-gray-400">
              <p>אין התראות חדשות</p>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
