
import React, { useCallback, useState, useEffect, memo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartDataPoint {
  name: string;
  [key: string]: any;
}

interface OptimizedChartProps {
  data: ChartDataPoint[];
  title: string;
  type?: 'line' | 'bar';
  dataKeys: { key: string; color: string; name: string }[];
  isLoading?: boolean;
  height?: number;
  className?: string;
}

function OptimizedChartBase({
  data,
  title,
  type = 'line',
  dataKeys,
  isLoading = false,
  height = 300,
  className = '',
}: OptimizedChartProps) {
  // Memoize data to prevent unnecessary re-renders
  const memoizedData = useCallback(() => data, [JSON.stringify(data)]);
  
  // Local loading state to ensure smooth transition
  const [localLoading, setLocalLoading] = useState(isLoading);
  
  useEffect(() => {
    if (!isLoading && localLoading) {
      // Add small delay for a smoother transition from loading to loaded
      const timer = setTimeout(() => setLocalLoading(false), 100);
      return () => clearTimeout(timer);
    } else if (isLoading && !localLoading) {
      setLocalLoading(true);
    }
  }, [isLoading, localLoading]);

  const renderCustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-lg">
          <p className="font-bold text-gray-700 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={`tooltip-${index}`} className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-gray-700">{entry.name}: </span>
              <span className="font-semibold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`rounded-xl overflow-hidden ${className}`}>
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <CardTitle className="text-lg font-medium text-gray-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {localLoading ? (
          <div className="w-full flex items-center justify-center" style={{ height: `${height}px` }}>
            <Skeleton className="w-full h-full rounded-md opacity-50" />
          </div>
        ) : (
          <div className="w-full" style={{ height: `${height}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              {type === 'line' ? (
                <LineChart data={memoizedData()} style={{ direction: 'ltr' }} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" tick={{ fill: '#666' }} axisLine={{ stroke: '#ccc' }} />
                  <YAxis tick={{ fill: '#666' }} axisLine={{ stroke: '#ccc' }} />
                  <Tooltip content={renderCustomTooltip} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px' }}
                    formatter={(value) => <span className="text-gray-700">{value}</span>}
                  />
                  {dataKeys.map((dataKey) => (
                    <Line
                      key={dataKey.key}
                      type="monotone"
                      dataKey={dataKey.key}
                      name={dataKey.name}
                      stroke={dataKey.color}
                      strokeWidth={2}
                      dot={{ r: 4, fill: dataKey.color, stroke: 'white', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: dataKey.color, stroke: 'white', strokeWidth: 2 }}
                      isAnimationActive={false} // Disable animation for better performance
                    />
                  ))}
                </LineChart>
              ) : (
                <BarChart data={memoizedData()} style={{ direction: 'ltr' }} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" tick={{ fill: '#666' }} axisLine={{ stroke: '#ccc' }} />
                  <YAxis tick={{ fill: '#666' }} axisLine={{ stroke: '#ccc' }} />
                  <Tooltip content={renderCustomTooltip} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px' }}
                    formatter={(value) => <span className="text-gray-700">{value}</span>} 
                  />
                  {dataKeys.map((dataKey) => (
                    <Bar
                      key={dataKey.key}
                      dataKey={dataKey.key}
                      name={dataKey.name}
                      fill={dataKey.color}
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={false} // Disable animation for better performance
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Memo the component to prevent unnecessary re-renders
export const OptimizedChart = memo(OptimizedChartBase);
