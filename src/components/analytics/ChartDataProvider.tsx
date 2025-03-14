import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ChartData {
  [key: string]: any[];
}

interface ChartDataContextType {
  chartData: ChartData;
  isLoading: boolean;
  error: string | null;
  dateRange: string;
  setDateRange: (range: string) => void;
  refreshData: () => Promise<void>;
}

const ChartDataContext = createContext<ChartDataContextType | undefined>(undefined);

interface ChartDataProviderProps {
  children: ReactNode;
  initialDateRange?: string;
}

export function ChartDataProvider({ 
  children, 
  initialDateRange = '30days' 
}: ChartDataProviderProps) {
  const [chartData, setChartData] = useState<ChartData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(initialDateRange);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Get start date based on dateRange
      const startDate = getStartDateForRange(dateRange);
      
      // Fetch data in parallel for better performance
      const [
        mentalStatesPromise,
        sessionDataPromise,
        gameDataPromise
      ] = await Promise.all([
        fetchMentalStatesData(user.id, startDate),
        fetchSessionsData(user.id, startDate),
        fetchGamesData(user.id, startDate)
      ]);
      
      setChartData({
        mentalStates: mentalStatesPromise,
        sessions: sessionDataPromise,
        games: gameDataPromise
      });
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError(err.message);
      toast({
        variant: 'destructive',
        title: 'שגיאה בטעינת נתוני גרפים',
        description: 'לא ניתן לטעון את הנתונים. אנא נסה שוב מאוחר יותר.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch data when component mounts or date range changes
  useEffect(() => {
    fetchData();
  }, [dateRange]);
  
  const value = {
    chartData,
    isLoading,
    error,
    dateRange,
    setDateRange,
    refreshData: fetchData
  };
  
  return (
    <ChartDataContext.Provider value={value}>
      {children}
    </ChartDataContext.Provider>
  );
}

export function useChartData() {
  const context = useContext(ChartDataContext);
  if (context === undefined) {
    throw new Error('useChartData must be used within a ChartDataProvider');
  }
  return context;
}

// Helper functions
function getStartDateForRange(timeRange: string): string {
  const now = new Date();
  switch (timeRange) {
    case '7days':
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return sevenDaysAgo.toISOString();
    case '30days':
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return thirtyDaysAgo.toISOString();
    case '90days':
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(now.getDate() - 90);
      return ninetyDaysAgo.toISOString();
    case 'season':
      const seasonStart = new Date();
      seasonStart.setMonth(7); // August (0-indexed)
      seasonStart.setDate(1);
      if (now.getMonth() < 7) {
        seasonStart.setFullYear(now.getFullYear() - 1);
      }
      return seasonStart.toISOString();
    default:
      const defaultDate = new Date();
      defaultDate.setDate(now.getDate() - 30);
      return defaultDate.toISOString();
  }
}

async function fetchMentalStatesData(userId: string, startDate: string) {
  // Fetch mental states data
  const { data, error } = await supabase
    .from('player_mental_states')
    .select('*')
    .eq('coach_id', userId)
    .gte('created_at', startDate)
    .order('created_at');
    
  if (error) throw error;
  
  // Process data for charting - group by date
  const processedData = processDataByDate(data, 'created_at', {
    feelingScore: 'feeling_score',
    motivationLevel: 'motivation_level',
    fatigueLevel: 'mental_fatigue_level'
  });
  
  return processedData;
}

async function fetchSessionsData(userId: string, startDate: string) {
  // Fetch sessions data
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('coach_id', userId)
    .gte('session_date', startDate.split('T')[0])
    .order('session_date');
    
  if (error) throw error;
  
  // Process data for charting - group by date
  const processedData = processDataByDate(data, 'session_date', {
    sessionCount: count => 1
  });
  
  return processedData;
}

async function fetchGamesData(userId: string, startDate: string) {
  // Fetch game data from player_meetings
  const { data, error } = await supabase
    .from('player_meetings')
    .select('*')
    .eq('coach_id', userId)
    .eq('meeting_type', 'game')
    .gte('meeting_date', startDate.split('T')[0])
    .order('meeting_date');
    
  if (error) throw error;
  
  // Process data for charting - group by date
  const processedData = processDataByDate(data, 'meeting_date', {
    gameCount: count => 1
  });
  
  return processedData;
}

function processDataByDate(data: any[], dateField: string, valueFields: { [key: string]: string | Function }) {
  const dateMap = new Map();
  
  // Group data by date
  data.forEach(item => {
    const date = new Date(item[dateField]);
    const dateStr = date.toISOString().split('T')[0];
    
    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, {
        date,
        dateStr,
        values: {}
      });
    }
    
    const entry = dateMap.get(dateStr);
    
    // Process each value field
    Object.entries(valueFields).forEach(([key, field]) => {
      if (typeof field === 'function') {
        // If field is a function, use it to calculate the value
        const value = field(item);
        entry.values[key] = (entry.values[key] || 0) + value;
      } else {
        // Otherwise, use the field name to get the value from the item
        entry.values[key] = (entry.values[key] || 0) + item[field];
      }
    });
  });
  
  // Convert map to array and sort by date
  const result = Array.from(dateMap.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(entry => ({
      name: entry.dateStr,
      ...entry.values
    }));
  
  return result;
}
