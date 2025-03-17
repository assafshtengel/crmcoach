
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart2 } from 'lucide-react';
import { DashboardStats } from './types';

interface SessionsChartProps {
  stats: DashboardStats;
}

export const SessionsChart: React.FC<SessionsChartProps> = ({ stats }) => {
  const getMonthlySessionsData = () => {
    return [{
      name: 'לפני חודשיים',
      מפגשים: stats.twoMonthsAgoSessions,
      fill: '#9CA3AF'
    }, {
      name: 'חודש קודם',
      מפגשים: stats.lastMonthSessions,
      fill: '#F59E0B'
    }, {
      name: 'החודש (בוצעו)',
      מפגשים: stats.currentMonthPastSessions,
      fill: '#10B981'
    }, {
      name: 'החודש (מתוכננים)',
      מפגשים: stats.currentMonthFutureSessions,
      fill: '#3B82F6'
    }];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">סיכום מפגשים חודשי</CardTitle>
          <BarChart2 className="h-5 w-5 text-[#9b87f5]" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getMonthlySessionsData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="מפגשים" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
