
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar, Clock, Check, BarChart2 } from 'lucide-react';
import { DashboardStats as StatsType } from '@/types/dashboard';

interface DashboardStatsProps {
  stats: StatsType;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      label: 'שחקנים',
      value: stats.totalPlayers,
      icon: <Users className="h-8 w-8 text-blue-500" />,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      label: 'מפגשים מתוכננים',
      value: stats.upcomingSessions,
      icon: <Calendar className="h-8 w-8 text-indigo-500" />,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      label: 'מפגשים החודש (בוצעו)',
      value: stats.currentMonthPastSessions,
      icon: <Check className="h-8 w-8 text-green-500" />,
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      label: 'מפגשים החודש (מתוכננים)',
      value: stats.currentMonthFutureSessions,
      icon: <Clock className="h-8 w-8 text-amber-500" />,
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      label: 'סה״כ תזכורות',
      value: stats.totalReminders,
      icon: <BarChart2 className="h-8 w-8 text-purple-500" />,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className={`border shadow-sm ${stat.color}`}>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium">{stat.label}</h3>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </div>
            <div className="p-2 rounded-full bg-white shadow-sm">
              {stat.icon}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
