
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsCards from '@/components/dashboard/StatsCards';
import UpcomingSessions from '@/components/dashboard/UpcomingSessions';
import ActionButtons from '@/components/dashboard/ActionButtons';
import SessionsChart from '@/components/dashboard/SessionsChart';
import { useDashboardData } from '@/hooks/useDashboardData';

const DashboardCoach = () => {
  const navigate = useNavigate();
  const {
    isLoading,
    stats,
    upcomingSessions,
    notifications,
    unreadCount,
    coachName,
    user,
    calendarEvents,
    fetchData,
    fetchNotifications,
    handleAddEvent
  } = useDashboardData();

  const handleEventClick = (eventId: string) => {
    const session = upcomingSessions.find(s => s.id === eventId);
    if (session) {
      navigate('/edit-session', { state: { sessionId: eventId } });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <DashboardHeader
        coachName={coachName}
        notifications={notifications}
        unreadCount={unreadCount}
        fetchNotifications={fetchNotifications}
        calendarEvents={calendarEvents}
        handleEventClick={handleEventClick}
        handleAddEvent={handleAddEvent}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <StatsCards stats={stats} />

        <UpcomingSessions
          upcomingSessions={upcomingSessions}
          fetchData={fetchData}
        />

        <ActionButtons />

        <SessionsChart stats={stats} />
      </div>
    </div>
  );
};

export default DashboardCoach;
