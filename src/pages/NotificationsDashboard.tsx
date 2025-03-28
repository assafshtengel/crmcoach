
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Bell, Check, Send } from "lucide-react";
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
  read: boolean;
}

const NotificationsDashboard = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState<Record<string, boolean>>({});
  const [isMarkingRead, setIsMarkingRead] = useState<Record<string, boolean>>({});
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      // Fetch notifications
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
        read: notification.read || false
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

  // Add this new effect to mark all notifications as read when the notification popup opens
  useEffect(() => {
    if (showNotifications && notifications.length > 0) {
      const unreadNotifications = notifications.filter(notification => !notification.read);
      
      if (unreadNotifications.length > 0) {
        // Update the UI state immediately
        setNotifications(prev => 
          prev.map(notification => 
            !notification.read ? { ...notification, read: true } : notification
          )
        );
        
        // Update the database in the background
        const updateNotifications = async () => {
          const unreadIds = unreadNotifications.map(notification => notification.id);
          
          try {
            const { error } = await supabase
              .from("notifications_log")
              .update({ read: true })
              .in('id', unreadIds);
              
            if (error) {
              console.error('Error marking notifications as read:', error);
              // Revert UI state if database update fails
              fetchData();
            }
          } catch (error) {
            console.error('Error marking notifications as read:', error);
            fetchData();
          }
        };
        
        updateNotifications();
      }
    }
  }, [showNotifications]);

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

  const handleMarkAsRead = async (notification: Notification) => {
    if (isMarkingRead[notification.id] || notification.read) return;
    
    setIsMarkingRead(prev => ({ ...prev, [notification.id]: true }));
    
    try {
      const { error } = await supabase
        .from("notifications_log")
        .update({ read: true })
        .eq('id', notification.id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id 
            ? { ...n, read: true } 
            : n
        )
      );

      toast({
        title: "✅ ההתראה סומנה כנקראה",
        description: "ההתראה סומנה כנקראה בהצלחה",
      });

    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        variant: "destructive",
        title: "⚠️ שגיאה בסימון ההתראה כנקראה",
        description: "אנא נסה שוב",
      });
    } finally {
      setIsMarkingRead(prev => ({ ...prev, [notification.id]: false }));
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

  const unreadCount = notifications.filter(n => !n.read).length;

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
            תזכורות שנשלחו
            {unreadCount > 0 && (
              <span className="text-sm font-normal bg-red-500 text-white px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <div className="w-10" />
        </div>

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
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-4 w-4" />
                {showNotifications ? 'הסתר התראות' : 'הצג את כל ההתראות'}
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>תאריך ושעה</TableHead>
                <TableHead>שם השחקן</TableHead>
                <TableHead>טלפון</TableHead>
                <TableHead>תוכן ההודעה</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id} className={notification.read ? "bg-gray-50" : ""}>
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
                  <TableCell>
                    <Button
                      variant={notification.read ? "ghost" : "outline"}
                      size="sm"
                      onClick={() => handleMarkAsRead(notification)}
                      disabled={isMarkingRead[notification.id] || notification.read}
                      className={`gap-2 ${notification.read ? "text-green-600" : ""}`}
                    >
                      <Check className="h-4 w-4" />
                      {isMarkingRead[notification.id] ? 'מסמן...' : notification.read ? 'נקרא' : 'סמן כנקרא'}
                    </Button>
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
