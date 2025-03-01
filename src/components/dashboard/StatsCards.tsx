
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Bell } from 'lucide-react';

interface DashboardStats {
  totalPlayers: number;
  upcomingSessions: number;
  currentMonthPastSessions: number;
  currentMonthFutureSessions: number;
  lastMonthSessions: number;
  twoMonthsAgoSessions: number;
  totalReminders: number;
}

interface StatsCardsProps {
  stats: DashboardStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#27AE60]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">שחקנים פעילים</CardTitle>
          <Users className="h-5 w-5 text-[#27AE60]" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#2C3E50]">{stats.totalPlayers}</div>
          <p className="text-sm text-gray-500">רשומים במערכת</p>
        </CardContent>
      </Card>

      <Card className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#3498DB]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">מפגשים קרובים</CardTitle>
          <Calendar className="h-5 w-5 text-[#3498DB]" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#2C3E50]">{stats.upcomingSessions}</div>
          <p className="text-sm text-gray-500">בשבוע הקרוב ({stats.upcomingSessions} מפגשים)</p>
        </CardContent>
      </Card>

      <Card className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#F1C40F]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">תזכורות שנשלחו</CardTitle>
          <Bell className="h-5 w-5 text-[#F1C40F]" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#2C3E50]">{stats.totalReminders}</div>
          <p className="text-sm text-gray-500">סה״כ תזכורות</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
