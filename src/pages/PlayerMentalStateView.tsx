
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, Activity } from "lucide-react";
import { format } from "date-fns";
import { MentalState } from "@/types/mentalState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PlayerMentalStateView() {
  const { playerId } = useParams<{ playerId: string }>();
  const [mentalStates, setMentalStates] = useState<MentalState[]>([]);
  const [playerInfo, setPlayerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load player info
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single();
          
        if (playerError) {
          throw playerError;
        }
        
        setPlayerInfo(playerData);
        
        // Load mental states
        const { data: statesData, error: statesError } = await supabase
          .from('player_mental_states')
          .select('*')
          .eq('player_id', playerId)
          .order('created_at', { ascending: false });
          
        if (statesError) {
          throw statesError;
        }
        
        setMentalStates(statesData || []);
      } catch (error: any) {
        console.error('Error loading data:', error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת הנתונים",
          description: error.message || "אירעה שגיאה בטעינת נתוני המצב המנטלי"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (playerId) {
      loadData();
    }
  }, [playerId, toast]);

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

  const getWeekStates = () => {
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return mentalStates.filter(state => {
      const stateDate = new Date(state.created_at || '');
      return stateDate >= oneWeekAgo && stateDate <= now;
    });
  };

  const getMonthStates = () => {
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    return mentalStates.filter(state => {
      const stateDate = new Date(state.created_at || '');
      return stateDate >= oneMonthAgo && stateDate <= now;
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => navigate(`/player-profile/${playerId}`)}>
            <ArrowRight className="h-4 w-4 mr-2" />
            חזרה לפרופיל שחקן
          </Button>
          <h1 className="text-3xl font-bold">מצב מנטלי: {playerInfo?.full_name}</h1>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>

        {mentalStates.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="pt-6 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">אין נתונים להצגה</h3>
              <p className="text-muted-foreground mb-4">
                שחקן זה טרם מילא טפסי מצב מנטלי יומי
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="shadow-lg mb-6">
              <CardHeader>
                <CardTitle>סיכום מצב מנטלי</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-2">הרגשה כללית</h3>
                    <div className="text-3xl font-bold">
                      {getFeelingEmoji(mentalStates[0].feeling_score)} {mentalStates[0].feeling_score}/10
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      עדכון אחרון: {formatDate(mentalStates[0].created_at || '')}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-2">מוטיבציה</h3>
                    <div className="text-3xl font-bold">
                      {mentalStates[0].motivation_level}/10
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {mentalStates[0].motivation_level >= 7 ? "מוטיבציה גבוהה" : 
                       mentalStates[0].motivation_level >= 4 ? "מוטיבציה בינונית" : 
                       "מוטיבציה נמוכה"}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-2">עייפות מנטלית</h3>
                    <div className="text-3xl font-bold">
                      {mentalStates[0].mental_fatigue_level}/10
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {mentalStates[0].mental_fatigue_level >= 7 ? "עייפות גבוהה" : 
                       mentalStates[0].mental_fatigue_level >= 4 ? "עייפות בינונית" : 
                       "עייפות נמוכה"}
                    </p>
                  </div>
                </div>

                {mentalStates[0].improvement_focus && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-2">מה רוצה לשפר היום</h3>
                    <p>{mentalStates[0].improvement_focus}</p>
                  </div>
                )}

                {mentalStates[0].has_concerns && mentalStates[0].concerns_details && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-2">דברים שמדאיגים</h3>
                    <p>{mentalStates[0].concerns_details}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">כל ההיסטוריה</TabsTrigger>
                <TabsTrigger value="week">שבוע אחרון</TabsTrigger>
                <TabsTrigger value="month">חודש אחרון</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {mentalStates.map((state) => (
                  <Card key={state.id} className="shadow-md">
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
                              <span className="font-semibold block">מה רצה לשפר:</span>
                              <p className="text-sm">{state.improvement_focus}</p>
                            </div>
                          )}
                          {state.has_concerns && state.concerns_details && (
                            <div>
                              <span className="font-semibold block">דברים שהדאיגו:</span>
                              <p className="text-sm">{state.concerns_details}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="week" className="space-y-4">
                {getWeekStates().length > 0 ? getWeekStates().map((state) => (
                  <Card key={state.id} className="shadow-md">
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
                              <span className="font-semibold block">מה רצה לשפר:</span>
                              <p className="text-sm">{state.improvement_focus}</p>
                            </div>
                          )}
                          {state.has_concerns && state.concerns_details && (
                            <div>
                              <span className="font-semibold block">דברים שהדאיגו:</span>
                              <p className="text-sm">{state.concerns_details}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <Card>
                    <CardContent className="py-6 text-center">
                      <p className="text-muted-foreground">אין נתונים לשבוע האחרון</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="month" className="space-y-4">
                {getMonthStates().length > 0 ? getMonthStates().map((state) => (
                  <Card key={state.id} className="shadow-md">
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
                              <span className="font-semibold block">מה רצה לשפר:</span>
                              <p className="text-sm">{state.improvement_focus}</p>
                            </div>
                          )}
                          {state.has_concerns && state.concerns_details && (
                            <div>
                              <span className="font-semibold block">דברים שהדאיגו:</span>
                              <p className="text-sm">{state.concerns_details}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <Card>
                    <CardContent className="py-6 text-center">
                      <p className="text-muted-foreground">אין נתונים לחודש האחרון</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
}
