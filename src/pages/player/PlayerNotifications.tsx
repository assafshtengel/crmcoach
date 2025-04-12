
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const PlayerNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('No authenticated user found', authError);
        toast({
          title: "שגיאה בטעינת התראות",
          description: "אנא התחבר מחדש כדי לצפות בהתראות שלך",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Get notifications for the authenticated user
      fetchNotificationsForPlayer(user.id);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "שגיאה בטעינת התראות",
        description: "לא ניתן לטעון את ההתראות, נסה שוב מאוחר יותר",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const fetchNotificationsForPlayer = async (playerId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('player_id', playerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setNotifications(data || []);
      console.log('Fetched notifications:', data);
    } catch (error) {
      console.error('Error fetching notifications for player:', error);
      toast({
        title: "שגיאה בטעינת התראות",
        description: "לא ניתן לטעון את ההתראות, נסה שוב מאוחר יותר",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
      
      toast({
        title: "ההתראה סומנה כנקראה",
        description: "סטטוס ההתראה עודכן בהצלחה"
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "שגיאה בעדכון סטטוס",
        description: "לא ניתן לסמן את ההתראה כנקראה",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      if (unreadNotifications.length === 0) {
        toast({
          title: "אין התראות חדשות",
          description: "כל ההתראות כבר סומנו כנקראות"
        });
        return;
      }

      // Get current authenticated user or from local storage
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "שגיאת התחברות",
          description: "אנא התחבר מחדש",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('player_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, is_read: true }))
      );
      
      toast({
        title: "כל ההתראות סומנו כנקראות",
        description: "סטטוס ההתראות עודכן בהצלחה"
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "שגיאה בעדכון סטטוס",
        description: "לא ניתן לסמן את כל ההתראות כנקראות",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'video_assigned':
        return <Bell className="h-5 w-5 text-blue-500" />;
      case 'session_reminder':
        return <Bell className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationType = (type: string) => {
    switch (type) {
      case 'video_assigned':
        return 'סרטון חדש';
      case 'session_reminder':
        return 'תזכורת פגישה';
      default:
        return 'התראה';
    }
  };

  return (
    <div className="min-h-screen bg-page pb-12">
      <header className="w-full bg-primary text-white py-6 mb-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">מרכז התראות</h1>
          <p className="text-sm opacity-80">צפייה בהתראות והודעות מהמאמן שלך</p>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">התראות</CardTitle>
            {notifications.some(n => !n.is_read) && (
              <Button 
                variant="ghost" 
                onClick={markAllAsRead}
                className="text-sm"
              >
                סמן הכל כנקרא
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 text-gray-500">אין התראות חדשות</p>
                <p className="text-sm text-gray-400">כל ההתראות שלך יופיעו כאן</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border rounded-lg flex items-start gap-3 transition-all ${
                      notification.is_read ? 'bg-white' : 'bg-blue-50 border-blue-100'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex gap-2 items-center">
                            <Badge variant="outline" className="font-normal">
                              {getNotificationType(notification.type)}
                            </Badge>
                            {!notification.is_read && (
                              <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                            )}
                          </div>
                          <p className="mt-1">{notification.message}</p>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                      {!notification.is_read && (
                        <div className="mt-2 flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
                            סמן כנקרא
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlayerNotifications;
