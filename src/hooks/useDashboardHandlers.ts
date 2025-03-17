
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useDashboardHandlers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

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

  const handleEventClick = (eventId: string) => {
    navigate('/edit-session', { state: { sessionId: eventId } });
  };

  const handleViewSummary = async (playerId: string, playerName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive", 
          title: "שגיאה",
          description: "לא נמצא משתמש מחובר"
        });
        return;
      }

      const { data: summaries, error } = await supabase
        .from('session_summaries')
        .select(`
          id,
          session:sessions (
            player:players!inner (
              id,
              full_name
            )
          )
        `)
        .eq('coach_id', user.id)
        .eq('sessions.player_id', playerId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching summary:', error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת הסיכום",
          description: "לא ניתן לטעון את הסיכום כרגע, אנא נסה שוב מאוחר יותר"
        });
        return;
      }

      if (summaries && summaries.length > 0) {
        navigate(`/session-summaries?id=${summaries[0].id}`);
      } else {
        toast({
          title: "אין סיכומים זמינים",
          description: `אין סיכומים זמינים עבור ${playerName}`,
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error in handleViewSummary:', error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אירעה שגיאה בניסיון לצפות בסיכום"
      });
    }
  };
  
  return {
    isLogoutDialogOpen,
    setIsLogoutDialogOpen,
    isSessionFormOpen,
    setIsSessionFormOpen,
    activeTab,
    setActiveTab,
    handleLogout,
    handleEventClick,
    handleViewSummary
  };
};
