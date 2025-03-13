
import { useState, useEffect } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  message: string;
  type: string;
  timestamp: string;
  is_read: boolean;
  meta?: {
    summary_id?: string;
    player_id?: string;
    player_name?: string;
    game_date?: string;
    opponent_team?: string;
  };
}

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user?.id) {
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("coach_id", userData.user.id)
        .order("timestamp", { ascending: false })
        .limit(10);
        
      if (error) {
        console.error("Error fetching notifications:", error);
        return;
      }
      
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error("Error in notification system:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, (payload) => {
        // Check if notification is for current coach
        const { new: newNotification } = payload;
        const { data: userData } = supabase.auth.getUser();
        if (userData?.user?.id === newNotification.coach_id) {
          setNotifications(prev => [newNotification, ...prev].slice(0, 10));
          setUnreadCount(prev => prev + 1);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);
        
      if (error) {
        console.error("Error marking notification as read:", error);
        return;
      }
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  
  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === 'game_summary' && notification.meta?.player_id) {
      navigate(`/game-summary/${notification.meta.player_id}`);
    }
    
    setIsOpen(false);
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      if (unreadIds.length === 0) return;
      
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", unreadIds);
        
      if (error) {
        console.error("Error marking all notifications as read:", error);
        return;
      }
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      
      toast({
        title: "כל ההתראות סומנו כנקראו",
        description: "הפעולה בוצעה בהצלחה",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // מניעת התפשטות האירוע לתדות המכיל
    
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);
        
      if (error) {
        console.error("Error deleting notification:", error);
        toast({
          variant: "destructive",
          title: "שגיאה במחיקת התראה",
          description: "אנא נסה שוב מאוחר יותר",
        });
        return;
      }
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // עדכון ספירת ההתראות שלא נקראו אם ההתראה שנמחקה לא נקראה
      const wasUnread = notifications.find(n => n.id === notificationId)?.is_read === false;
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast({
        title: "ההתראה נמחקה",
        description: "ההתראה נמחקה בהצלחה",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  if (isLoading) {
    return <div className="h-9 w-9 flex items-center justify-center"><Bell size={20} /></div>;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setIsOpen(true)}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">התראות</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7 flex items-center gap-1"
              onClick={markAllAsRead}
            >
              <Check size={12} />
              סמן הכל כנקרא
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              אין התראות חדשות
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b hover:bg-gray-50 transition-colors ${
                  !notification.is_read ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <span 
                    className="text-sm cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {notification.message}
                  </span>
                  <div className="flex items-center gap-1">
                    {!notification.is_read && (
                      <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-500 hover:text-red-500"
                      onClick={(e) => deleteNotification(notification.id, e)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(notification.timestamp).toLocaleString('he-IL')}
                </div>
                {!notification.is_read && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 h-6 text-xs w-full"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <Check size={12} className="mr-1" />
                    סמן כנקרא
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
        <div className="p-3 border-t text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => navigate("/notifications")}
          >
            צפה בכל ההתראות
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
