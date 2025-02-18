
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Notification {
  id: string;
  sent_at: string;
  message_content: string;
  status: "Sent" | "Pending" | "Failed";
  error_message?: string;
  player_name?: string;
  player_phone?: string;
}

const NotificationsDashboard = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
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

        if (error) throw error;

        const formattedData = data.map(notification => ({
          ...notification,
          player_name: notification.sessions?.players?.full_name || 'לא ידוע',
          player_phone: notification.sessions?.players?.phone || 'לא ידוע',
        }));

        setNotifications(formattedData);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

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
          </h1>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>

        {/* Notifications Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
