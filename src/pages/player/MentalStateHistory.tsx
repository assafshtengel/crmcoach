
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, parseISO, subDays } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MentalState {
  id: string;
  player_id: string;
  feeling_score: number;
  motivation_level: number;
  mental_fatigue_level: number;
  has_concerns: boolean;
  concerns_details?: string;
  improvement_focus?: string;
  created_at: string;
}

const MentalStateHistory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mentalStates, setMentalStates] = useState<MentalState[]>([]);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");

  useEffect(() => {
    const fetchMentalStates = async () => {
      try {
        const playerSessionStr = localStorage.getItem('playerSession');
        
        if (!playerSessionStr) {
          navigate('/player-auth');
          return;
        }
        
        const playerSession = JSON.parse(playerSessionStr);

        // Get cutoff date based on selected time range
        let cutoffDate = new Date();
        if (timeRange === "week") {
          cutoffDate = subDays(new Date(), 7);
        } else if (timeRange === "month") {
          cutoffDate = subDays(new Date(), 30);
        } else {
          cutoffDate = subDays(new Date(), 365);
        }
        
        const { data, error } = await supabase
          .from('player_mental_states')
          .select('*')
          .eq('player_id', playerSession.id)
          .gte('created_at', cutoffDate.toISOString())
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        setMentalStates(data || []);
      } catch (error: any) {
        console.error('Error loading mental states:', error);
        toast.error(error.message || "אירעה שגיאה בטעינת הנתונים");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMentalStates();
  }, [navigate, timeRange]);

  const formatChartData = () => {
    return mentalStates.map((state) => ({
      date: format(parseISO(state.created_at), 'dd/MM', { locale: he }),
      הרגשה: state.feeling_score,
      מוטיבציה: state.motivation_level,
      "עייפות מנטלית": state.mental_fatigue_level,
    }));
  };

  // Get latest entries for each metric
  const getLatestAverages = () => {
    if (mentalStates.length === 0) return { feeling: 0, motivation: 0, fatigue: 0 };
    
    const recentStates = mentalStates.slice(-7); // Last 7 entries
    
    const feeling = recentStates.reduce((sum, state) => sum + state.feeling_score, 0) / recentStates.length;
    const motivation = recentStates.reduce((sum, state) => sum + state.motivation_level, 0) / recentStates.length;
    const fatigue = recentStates.reduce((sum, state) => sum + state.mental_fatigue_level, 0) / recentStates.length;
    
    return { feeling, motivation, fatigue };
  };

  const averages = getLatestAverages();

  const renderTopConcerns = () => {
    // Filter states with concerns
    const statesWithConcerns = mentalStates.filter(
      (state) => state.has_concerns && state.concerns_details && state.concerns_details.trim() !== ""
    );
    
    if (statesWithConcerns.length === 0) {
      return <p className="text-gray-500 text-center py-4">אין חששות שתועדו לאחרונה</p>;
    }
    
    // Sort by most recent first
    const sortedConcerns = [...statesWithConcerns].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // Take the 3 most recent
    return sortedConcerns.slice(0, 3).map((state) => (
      <div key={state.id} className="p-4 border-b last:border-0">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">
            {format(parseISO(state.created_at), 'dd/MM/yyyy', { locale: he })}
          </span>
        </div>
        <p className="text-sm">{state.concerns_details}</p>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/player/daily-mental-state')}
            className="ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">היסטוריית מצב מנטלי</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">ציון הרגשה ממוצע</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <span className="text-3xl font-bold">{averages.feeling.toFixed(1)}</span>
                <span className="text-sm text-gray-500">/10</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">מוטיבציה ממוצעת</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <span className="text-3xl font-bold">{averages.motivation.toFixed(1)}</span>
                <span className="text-sm text-gray-500">/10</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">עייפות מנטלית ממוצעת</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <span className="text-3xl font-bold">{averages.fatigue.toFixed(1)}</span>
                <span className="text-sm text-gray-500">/10</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span>מגמות לאורך זמן</span>
              <div className="flex bg-gray-100 rounded-lg overflow-hidden">
                <Button 
                  variant={timeRange === "week" ? "default" : "ghost"} 
                  onClick={() => setTimeRange("week")}
                  className="rounded-none px-3 py-1 h-auto text-sm"
                >
                  שבוע
                </Button>
                <Button 
                  variant={timeRange === "month" ? "default" : "ghost"} 
                  onClick={() => setTimeRange("month")}
                  className="rounded-none px-3 py-1 h-auto text-sm"
                >
                  חודש
                </Button>
                <Button 
                  variant={timeRange === "year" ? "default" : "ghost"} 
                  onClick={() => setTimeRange("year")}
                  className="rounded-none px-3 py-1 h-auto text-sm"
                >
                  שנה
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mentalStates.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">אין עדיין מספיק נתונים להצגת גרף</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/player/daily-mental-state')}
                >
                  מלא את השאלון היומי
                </Button>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={formatChartData()}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="הרגשה" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="מוטיבציה" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="עייפות מנטלית" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="concerns" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="concerns" className="flex-1">חששות ודאגות אחרונות</TabsTrigger>
            <TabsTrigger value="focus" className="flex-1">תחומי התמקדות</TabsTrigger>
          </TabsList>
          <TabsContent value="concerns">
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">חששות ודאגות אחרונות</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {renderTopConcerns()}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="focus">
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">תחומי התמקדות לשיפור</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {mentalStates
                  .filter(state => state.improvement_focus && state.improvement_focus.trim() !== "")
                  .slice(-3)
                  .reverse()
                  .map(state => (
                    <div key={state.id} className="p-4 border-b last:border-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">
                          {format(parseISO(state.created_at), 'dd/MM/yyyy', { locale: he })}
                        </span>
                      </div>
                      <p className="text-sm">{state.improvement_focus}</p>
                    </div>
                  ))}
                {mentalStates.filter(state => state.improvement_focus && state.improvement_focus.trim() !== "").length === 0 && (
                  <p className="text-gray-500 text-center py-4">אין תחומי התמקדות שתועדו לאחרונה</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MentalStateHistory;
