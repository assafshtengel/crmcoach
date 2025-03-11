
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, Activity } from "lucide-react";
import { format } from "date-fns";
import { MentalState } from "@/types/mentalState";

export default function MentalStateHistory() {
  const [mentalStates, setMentalStates] = useState<MentalState[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadMentalStates = async () => {
      try {
        setLoading(true);
        const playerSessionStr = localStorage.getItem('playerSession');
        
        if (!playerSessionStr) {
          navigate('/player-auth');
          return;
        }
        
        const playerSession = JSON.parse(playerSessionStr);
        
        const { data, error } = await supabase
          .from('player_mental_states')
          .select('*')
          .eq('player_id', playerSession.id)
          .order('created_at', { ascending: false })
          .limit(20);
          
        if (error) {
          throw error;
        }
        
        setMentalStates(data || []);
      } catch (error: any) {
        console.error('Error loading mental states:', error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת הנתונים",
          description: error.message || "אירעה שגיאה בטעינת היסטוריית המצב המנטלי"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadMentalStates();
  }, [navigate, toast]);

  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFeelingEmoji = (score: number) => {
    if (score <= 3) return "😟";
    if (score <= 6) return "😐";
    return "😄";
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate('/player/profile')}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-center">
            היסטוריית מצב מנטלי
          </h1>
          <Button variant="default" onClick={() => navigate('/player/daily-mental-state')}>
            טופס חדש
          </Button>
        </div>

        {mentalStates.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="pt-6 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">אין נתונים להצגה</h3>
              <p className="text-muted-foreground mb-4">
                עדיין לא מילאת טפסי מצב מנטלי יומי
              </p>
              <Button onClick={() => navigate('/player/daily-mental-state')}>
                מלא טופס חדש
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {mentalStates.map((state) => (
              <Card key={state.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5" />
                      {formatDate(state.created_at || '')}
                    </CardTitle>
                    <div className="flex items-center text-2xl">
                      {getFeelingEmoji(state.feeling_score)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>הרגשה כללית:</span>
                        <span className={getScoreColor(state.feeling_score)}>{state.feeling_score}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>מוטיבציה:</span>
                        <span className={getScoreColor(state.motivation_level)}>{state.motivation_level}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>עייפות מנטלית:</span>
                        <span className={getScoreColor(10 - state.mental_fatigue_level)}>{state.mental_fatigue_level}/10</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {state.improvement_focus && (
                        <div>
                          <span className="font-semibold block">מה רציתי לשפר:</span>
                          <p className="text-sm">{state.improvement_focus}</p>
                        </div>
                      )}
                      {state.has_concerns && state.concerns_details && (
                        <div>
                          <span className="font-semibold block">דברים שהדאיגו אותי:</span>
                          <p className="text-sm">{state.concerns_details}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
