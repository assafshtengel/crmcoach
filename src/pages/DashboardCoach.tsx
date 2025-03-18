
import React, { useState, useEffect } from 'react';
import { Layout } from "@/components/layout/Layout";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/calendar/Calendar';
import { AdminMessageForm } from '@/components/admin/AdminMessageForm';
import EducationalTab from '@/components/educational/EducationalTab';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ActionCards } from '@/components/dashboard/ActionCards';
import { SessionsTab } from '@/components/dashboard/SessionsTab';
import { SessionsChart } from '@/components/dashboard/SessionsChart';
import { SessionFormDialog } from '@/components/sessions/SessionFormDialog';
import { SessionSummaryListener } from '@/components/dashboard/SessionSummaryListener';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useDashboardHandlers } from '@/hooks/useDashboardHandlers';
import { useToast } from '@/hooks/use-toast';

const DashboardCoach = () => {
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  
  const {
    stats,
    notifications,
    unreadCount,
    upcomingSessions,
    pastSessionsToSummarize,
    summarizedSessions,
    calendarEvents,
    isLoading,
    coachName,
    profilePicture,
    fetchData,
    fetchNotifications,
    fetchCalendarEvents,
    fetchCoachInfo,
    markNotificationAsRead,
    sendSessionReminder,
    saveSessionSummary,
    addCalendarEvent,
    setPastSessionsToSummarize,
    setSummarizedSessions
  } = useDashboardData(user?.id);

  const {
    isLogoutDialogOpen,
    setIsLogoutDialogOpen,
    isSessionFormOpen,
    setIsSessionFormOpen,
    activeTab,
    setActiveTab,
    handleLogout,
    handleEventClick,
    handleViewSummary,
    navigate
  } = useDashboardHandlers();

  useEffect(() => {
    const initUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
    };
    initUser();
  }, []);

  useEffect(() => {
    const initializeDashboard = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await fetchCoachInfo(authUser.id);
        await fetchData(authUser.id);
        await fetchNotifications(authUser.id);
        await fetchCalendarEvents(authUser.id);

        const channel = supabase.channel('dashboard-changes').on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications'
        }, payload => {
          if (payload.eventType === 'INSERT') {
            toast({
              title: "📢 התראה חדשה",
              description: payload.new.message,
              duration: 5000
            });
            fetchNotifications(authUser.id);
          } else {
            fetchNotifications(authUser.id);
          }
        }).subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    };
    initializeDashboard();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>;
  }

  const handleSendReminder = async (sessionId: string) => {
    if (user?.id) {
      await sendSessionReminder(sessionId, user.id);
    }
  };

  const handleSaveSessionSummary = async (sessionId: string, data: any) => {
    if (user?.id) {
      await saveSessionSummary(sessionId, data, user.id);
    }
  };

  const handleAddEvent = async (eventData: any) => {
    if (user?.id) {
      await addCalendarEvent(eventData, user.id);
    }
  };

  return (
    <Layout>
      <div className="container py-6">
        <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>יציאה</AlertDialogTitle>
              <AlertDialogDescription>האם אתה בטוח שברצונך להתנתק?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ביטול</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>יציאה</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <SessionFormDialog open={isSessionFormOpen} onOpenChange={setIsSessionFormOpen} />

        <SessionSummaryListener 
          pastSessionsToSummarize={pastSessionsToSummarize}
          setPastSessionsToSummarize={setPastSessionsToSummarize}
          setSummarizedSessions={setSummarizedSessions}
        />

        <DashboardHeader 
          coachName={coachName}
          profilePicture={profilePicture}
          unreadCount={unreadCount}
          notifications={notifications}
          onMarkAsRead={markNotificationAsRead}
          onLogoutClick={() => setIsLogoutDialogOpen(true)}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Card className="bg-white/90 shadow-lg">
            <CardContent className="pt-6">
              <AdminMessageForm />
            </CardContent>
          </Card>

          <StatsCards 
            totalPlayers={stats.totalPlayers}
            upcomingSessions={stats.upcomingSessions} 
            totalReminders={stats.totalReminders}
            upcomingSessionsList={upcomingSessions}
            onNavigateEdit={(sessionId) => navigate('/edit-session', { state: { sessionId }})}
          />

          <ActionCards />

          <SessionsTab 
            pastSessionsToSummarize={pastSessionsToSummarize}
            summarizedSessions={summarizedSessions}
            upcomingSessions={upcomingSessions}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSaveSessionSummary={handleSaveSessionSummary}
            onSendReminder={handleSendReminder}
            onViewSummary={handleViewSummary}
          />

          <Card className="bg-white/90 shadow-lg">
            <CardContent className="pt-6">
              <EducationalTab />
            </CardContent>
          </Card>

          <SessionsChart stats={stats} />

          <Card className="bg-white/90 shadow-lg">
            <CardContent className="pt-6">
              <CalendarComponent 
                events={calendarEvents} 
                onEventClick={handleEventClick} 
                onEventAdd={handleAddEvent} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardCoach;
