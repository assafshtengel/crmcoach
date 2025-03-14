
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

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {localLoading ? (
          <div className="w-full" style={{ height: `${height}px` }}>
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <div className="w-full" style={{ height: `${height}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              {type === 'line' ? (
                <LineChart data={memoizedData()} style={{ direction: 'ltr' }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {dataKeys.map((dataKey) => (
                    <Line
                      key={dataKey.key}
                      type="monotone"
                      dataKey={dataKey.key}
                      name={dataKey.name}
                      stroke={dataKey.color}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={false} // Disable animation for better performance
                    />
                  ))}
                </LineChart>
              ) : (
                <BarChart data={memoizedData()} style={{ direction: 'ltr' }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {dataKeys.map((dataKey) => (
                    <Bar
                      key={dataKey.key}
                      dataKey={dataKey.key}
                      name={dataKey.name}
                      fill={dataKey.color}
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
