
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Bell, Check, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Session {
  id: string;
  session_date: string;
  session_time: string;
  reminder_sent: boolean;
  players: {
    full_name: string;
    phone: string;
  };
}

interface Notification {
  id: string;
  sent_at: string;
  message_content: string;
  status: "Sent" | "Pending" | "Failed";
  error_message?: string;
  player_name?: string;
  player_phone?: string;
  session_id: string;
}

interface PlayerNotification {
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

const NotificationsDashboard = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [playerNotifications, setPlayerNotifications] = useState<PlayerNotification[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState<Record<string, boolean>>({});
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      // Fetch notifications log
      const { data: notificationsData, error: notificationsError } = await supabase
        .from("notifications_log")
        .select(`
          *,
          sessions:session_id (
            players:player_id (
              full_name,
              phone
            )
          )
        `)
        .order('sent_at', { ascending: false });

      if (notificationsError) throw notificationsError;

      // Fetch player notifications
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        const { data: playerNotificationsData, error: playerNotificationsError } = await supabase
          .from("notifications")
          .select('*')
          .eq('coach_id', userData.user.id)
          .order('timestamp', { ascending: false });
          
        if (playerNotificationsError) throw playerNotificationsError;
        setPlayerNotifications(playerNotificationsData || []);
      }

      // Fetch upcoming sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("sessions")
        .select(`
          *,
          players:player_id (
            full_name,
            phone
          )
        `)
        .eq('reminder_sent', false)
        .gte('session_date', new Date().toISOString().split('T')[0]);

      if (sessionsError) throw sessionsError;

      const formattedNotifications = notificationsData.map(notification => ({
        ...notification,
        player_name: notification.sessions?.players?.full_name || 'לא ידוע',
        player_phone: notification.sessions?.players?.phone || 'לא ידוע',
      }));

      setNotifications(formattedNotifications);
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת הנתונים",
        description: "אנא נסה שוב מאוחר יותר",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendReminder = async (session: Session) => {
    if (isSending[session.id]) return;
    
    setIsSending(prev => ({ ...prev, [session.id]: true }));
    
    try {
      const message = `שלום ${session.players.full_name}!\nתזכורת למפגש ב-${new Date(session.session_date).toLocaleDateString('he-IL')} בשעה ${session.session_time}`;
      
      const { data, error } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          session_id: session.id,
          phone_number: session.players.phone,
          message,
        },
      });

      if (error) throw error;

      toast({
        title: "✅ התזכורת נשלחה בהצלחה",
        description: `התזכורת נשלחה ל${session.players.full_name}`,
      });

      // Refresh data
      await fetchData();

    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        variant: "destructive",
        title: "⚠️ שגיאה בשליחת התזכורת",
        description: "אנא נסה שוב",
      });
    } finally {
      setIsSending(prev => ({ ...prev, [session.id]: false }));
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);
        
      if (error) {
        console.error("Error marking notification as read:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בסימון ההתראה כנקראה",
          description: "אנא נסה שוב",
        });
        return;
      }
      
      setPlayerNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      
      toast({
        title: "ההתראה סומנה כנקראה",
        description: "הפעולה בוצעה בהצלחה",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      const unreadIds = playerNotifications.filter(n => !n.is_read).map(n => n.id);
      
      if (unreadIds.length === 0) {
        toast({
          title: "אין התראות שלא נקראו",
          description: "כל ההתראות כבר סומנו כנקראו",
        });
        return;
      }
      
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", unreadIds);
        
      if (error) {
        console.error("Error marking all notifications as read:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בסימון ההתראות כנקראו",
          description: "אנא נסה שוב",
        });
        return;
      }
      
      setPlayerNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      
      toast({
        title: "כל ההתראות סומנו כנקראו",
        description: "הפעולה בוצעה בהצלחה",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };
  
  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);
        
      if (error) {
        console.error("Error deleting notification:", error);
        toast({
          variant: "destructive",
          title: "שגיאה במחיקת ההתראה",
          description: "אנא נסה שוב",
        });
        return;
      }
      
      setPlayerNotifications(prev => prev.filter(n => n.id !== notificationId));
      setSelectedNotification(null);
      
      toast({
        title: "ההתראה נמחקה",
        description: "ההתראה נמחקה בהצלחה",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };
  
  const deleteAllReadNotifications = async () => {
    try {
      const readIds = playerNotifications.filter(n => n.is_read).map(n => n.id);
      
      if (readIds.length === 0) {
        toast({
          title: "אין התראות נקראות",
          description: "אין התראות שניתן למחוק",
        });
        return;
      }
      
      const { error } = await supabase
        .from("notifications")
        .delete()
        .in("id", readIds);
        
      if (error) {
        console.error("Error deleting read notifications:", error);
        toast({
          variant: "destructive",
          title: "שגיאה במחיקת ההתראות",
          description: "אנא נסה שוב",
        });
        return;
      }
      
      setPlayerNotifications(prev => prev.filter(n => !n.is_read));
      
      toast({
        title: "כל ההתראות שנקראו נמחקו",
        description: "הפעולה בוצעה בהצלחה",
      });
    } catch (error) {
      console.error("Error deleting read notifications:", error);
    }
  };

  const handleNotificationClick = async (notification: PlayerNotification) => {
    await markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === 'game_summary' && notification.meta?.player_id) {
      navigate(`/game-summary/${notification.meta.player_id}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sent':
        return 'text-green-600 bg-green-50';
      case 'Pending':
        return 'text-orange-600 bg-orange-50';
      case 'Failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">טוען...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="transition-transform hover:scale-105"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent flex items-center gap-2">
            <Bell className="h-6 w-6" />
            ניהול התראות
          </h1>
          <div className="w-10" />
        </div>

        {/* Player Notifications */}
        {playerNotifications.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">התראות מהשחקנים</h2>
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Trash2 className="h-4 w-4" />
                      מחק התראות שנקראו
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>האם אתה בטוח שברצונך למחוק את כל ההתראות שנקראו?</AlertDialogTitle>
                      <AlertDialogDescription>
                        פעולה זו תמחק לצמיתות את כל ההתראות שסומנו כנקראו. לא ניתן לשחזר אותן.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ביטול</AlertDialogCancel>
                      <AlertDialogAction onClick={deleteAllReadNotifications}>כן, מחק את כל ההתראות</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="default" size="sm" className="gap-1" onClick={markAllAsRead}>
                  <Check className="h-4 w-4" />
                  סמן הכל כנקרא
                </Button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>תאריך ושעה</TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead>הודעה</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playerNotifications.map((notification) => (
                  <TableRow key={notification.id} className={!notification.is_read ? "bg-blue-50/50" : ""}>
                    <TableCell className="font-medium">
                      {new Date(notification.timestamp).toLocaleString('he-IL')}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${notification.is_read ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                        {notification.is_read ? 'נקרא' : 'לא נקרא'}
                      </span>
                    </TableCell>
                    <TableCell 
                      className="max-w-md truncate cursor-pointer hover:text-blue-600"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {notification.message}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {!notification.is_read && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => markAsRead(notification.id)}
                            className="flex items-center gap-1 h-8"
                          >
                            <Check className="h-3 w-3" />
                            סמן כנקרא
                          </Button>
                        )}
                        <AlertDialog open={selectedNotification === notification.id} onOpenChange={(open) => {
                          if (!open) setSelectedNotification(null);
                        }}>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => setSelectedNotification(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>האם אתה בטוח שברצונך למחוק את ההתראה?</AlertDialogTitle>
                              <AlertDialogDescription>
                                פעולה זו תמחק לצמיתות את ההתראה. לא ניתן לשחזר אותה.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setSelectedNotification(null)}>ביטול</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteNotification(notification.id)}>כן, מחק</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pending Reminders */}
        {sessions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">תזכורות ממתינות</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>תאריך</TableHead>
                  <TableHead>שעה</TableHead>
                  <TableHead>שם השחקן</TableHead>
                  <TableHead>טלפון</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{new Date(session.session_date).toLocaleDateString('he-IL')}</TableCell>
                    <TableCell>{session.session_time}</TableCell>
                    <TableCell>{session.players.full_name}</TableCell>
                    <TableCell dir="ltr">{session.players.phone}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendReminder(session)}
                        disabled={isSending[session.id]}
                        className="gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {isSending[session.id] ? 'שולח...' : 'שלח תזכורת'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Sent Notifications */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">היסטוריית תזכורות</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>תאריך ושעה</TableHead>
                <TableHead>שם השחקן</TableHead>
                <TableHead>טלפון</TableHead>
                <TableHead>תוכן ההודעה</TableHead>
                <TableHead>סטטוס</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell className="font-medium">
                    {new Date(notification.sent_at || '').toLocaleString('he-IL')}
                  </TableCell>
                  <TableCell>{notification.player_name}</TableCell>
                  <TableCell dir="ltr">{notification.player_phone}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {notification.message_content}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(notification.status)}`}>
                      {notification.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default NotificationsDashboard;
