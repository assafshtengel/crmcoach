
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalPlayers: number;
  upcomingSessions: number;
  currentMonthPastSessions: number;
  currentMonthFutureSessions: number;
  lastMonthSessions: number;
  twoMonthsAgoSessions: number;
  totalReminders: number;
}

interface SessionsChartProps {
  stats: DashboardStats;
}

const SessionsChart: React.FC<SessionsChartProps> = ({ stats }) => {
  const getMonthlySessionsData = () => {
    return [
      {
        name: 'לפני חודשיים',
        מפגשים: stats.twoMonthsAgoSessions,
        fill: '#9CA3AF'
      }, 
      {
        name: 'חודש קודם',
        מפגשים: stats.lastMonthSessions,
        fill: '#F59E0B'
      }, 
      {
        name: 'החודש (בוצעו)',
        מפגשים: stats.currentMonthPastSessions,
        fill: '#10B981'
      }, 
      {
        name: 'החודש (מתוכננים)',
        מפגשים: stats.currentMonthFutureSessions,
        fill: '#3B82F6'
      }
    ];
  };

  return (
    <Card className="bg-white/90 shadow-lg">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-xl font-semibold text-[#2C3E50]">סטטיסטיקת מפגשים</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={getMonthlySessionsData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" stroke="#6B7280" />
            <YAxis stroke="#6B7280" tickCount={10} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="מפגשים" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SessionsChart;
