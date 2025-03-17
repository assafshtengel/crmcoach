
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  User, FileText, Calendar, Target, BarChart4, 
  CheckCircle, Download, Users
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";

interface PlayerInfo {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  birthdate: string | null;
  profile_image: string | null;
  club: string | null;
  city: string | null;
  sport_field: string | null;
  coach_id: string | null;
  coach_name?: string;
}

interface MentalState {
  id: string;
  created_at: string;
  feeling_score: number;
  motivation_level: number;
  mental_fatigue_level: number;
  has_concerns: boolean;
  concerns_details: string | null;
  improvement_focus: string | null;
}

interface Goal {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  success_criteria: string | null;
  completed: boolean;
  type: string;
  created_at: string | null;
}

interface SessionSummary {
  id: string;
  session_date: string;
  summary_text: string;
  progress_rating: number | null;
  achieved_goals: string[] | null;
  future_goals: string[] | null;
  tools_used: any | null; 
}

interface GameSummary {
  id: string;
  created_at: string;
  performance_rating: number | null;
  concentration_level: number | null;
  fatigue_level: number | null;
  goals_met: boolean | null;
  strongest_point: string | null;
  improvement_notes: string | null;
}

const PlayerFile = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [mentalStates, setMentalStates] = useState<MentalState[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sessionSummaries, setSessionSummaries] = useState<SessionSummary[]>([]);
  const [gameSummaries, setGameSummaries] = useState<GameSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!playerId) return;
    
    const fetchPlayerData = async () => {
      setLoading(true);
      try {
        // Fetch basic player info
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single();

        if (playerError) throw playerError;
        
        let coachName = "";
        if (playerData.coach_id) {
          const { data: coachData } = await supabase
            .from('coaches')
            .select('full_name')
            .eq('id', playerData.coach_id)
            .single();
          
          if (coachData) {
            coachName = coachData.full_name;
          }
        }

        setPlayerInfo({ ...playerData, coach_name: coachName });

        // Fetch mental states
        const { data: mentalData, error: mentalError } = await supabase
          .from('player_mental_states')
          .select('*')
          .eq('player_id', playerId)
          .order('created_at', { ascending: false });

        if (!mentalError && mentalData) {
          setMentalStates(mentalData);
        }

        // Fetch goals
        const { data: goalsData, error: goalsError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', playerId)
          .order('created_at', { ascending: false });

        if (!goalsError && goalsData) {
          setGoals(goalsData);
        }

        // Fetch session summaries
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('sessions')
          .select(`
            id,
            session_date,
            session_summaries (
              id,
              summary_text,
              progress_rating,
              achieved_goals,
              future_goals,
              tools_used
            )
          `)
          .eq('player_id', playerId)
          .order('session_date', { ascending: false });

        if (!sessionsError && sessionsData) {
          const summaries = sessionsData
            .filter(session => session.session_summaries && session.session_summaries.length > 0)
            .map(session => ({
              id: session.session_summaries[0].id,
              session_date: session.session_date,
              summary_text: session.session_summaries[0].summary_text,
              progress_rating: session.session_summaries[0].progress_rating,
              achieved_goals: session.session_summaries[0].achieved_goals,
              future_goals: session.session_summaries[0].future_goals,
              tools_used: session.session_summaries[0].tools_used
            }));
          
          setSessionSummaries(summaries);
        }

        // Fetch game summaries
        const { data: gameData, error: gameError } = await supabase
          .from('game_summaries')
          .select('*')
          .eq('player_id', playerId)
          .order('created_at', { ascending: false });

        if (!gameError && gameData) {
          setGameSummaries(gameData);
        }

      } catch (error) {
        console.error('Error fetching player data:', error);
        toast.error('שגיאה בטעינת נתוני השחקן');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerId]);

  const exportToPDF = async () => {
    try {
      toast.info('מייצא לקובץ PDF...', { duration: 3000 });
      const element = document.getElementById('player-file-content');
      if (!element) return;
      
      const canvas = await html2canvas(element, { scale: 1 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${playerInfo?.full_name || 'player'}_file.pdf`);
      
      toast.success('הייצוא ל-PDF הושלם בהצלחה');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('שגיאה בייצוא ל-PDF');
    }
  };

  const exportToExcel = () => {
    try {
      toast.info('מייצא לקובץ Excel...', { duration: 3000 });
      
      const playerWorkbook = XLSX.utils.book_new();
      
      // Player info sheet
      const playerInfoData = [
        ['שם מלא', playerInfo?.full_name || ''],
        ['אימייל', playerInfo?.email || ''],
        ['טלפון', playerInfo?.phone || ''],
        ['תאריך לידה', playerInfo?.birthdate || ''],
        ['מועדון', playerInfo?.club || ''],
        ['עיר', playerInfo?.city || ''],
        ['תחום ספורט', playerInfo?.sport_field || ''],
        ['מאמן', playerInfo?.coach_name || '']
      ];
      
      const playerInfoSheet = XLSX.utils.aoa_to_sheet(playerInfoData);
      XLSX.utils.book_append_sheet(playerWorkbook, playerInfoSheet, 'פרטי שחקן');
      
      // Goals sheet
      const goalsData = goals.map(goal => [
        goal.title,
        goal.description || '',
        goal.due_date ? new Date(goal.due_date).toLocaleDateString('he-IL') : '',
        goal.success_criteria || '',
        goal.completed ? 'כן' : 'לא',
        goal.type === 'long-term' ? 'ארוך טווח' : 
          goal.type === 'short-term' ? 'קצר טווח' : 'מיידי'
      ]);
      
      if (goalsData.length > 0) {
        goalsData.unshift(['כותרת', 'תיאור', 'תאריך יעד', 'מדד הצלחה', 'הושלם', 'סוג']);
        const goalsSheet = XLSX.utils.aoa_to_sheet(goalsData);
        XLSX.utils.book_append_sheet(playerWorkbook, goalsSheet, 'מטרות');
      }
      
      // Mental states sheet
      const mentalStatesData = mentalStates.map(state => [
        new Date(state.created_at).toLocaleDateString('he-IL'),
        state.feeling_score,
        state.motivation_level,
        state.mental_fatigue_level,
        state.has_concerns ? 'כן' : 'לא',
        state.concerns_details || '',
        state.improvement_focus || ''
      ]);
      
      if (mentalStatesData.length > 0) {
        mentalStatesData.unshift(['תאריך', 'ציון הרגשה', 'רמת מוטיבציה', 'רמת עייפות מנטלית', 'יש חששות', 'פירוט חששות', 'מיקוד לשיפור']);
        const mentalSheet = XLSX.utils.aoa_to_sheet(mentalStatesData);
        XLSX.utils.book_append_sheet(playerWorkbook, mentalSheet, 'מצב מנטלי');
      }
      
      // Session summaries sheet
      const sessionData = sessionSummaries.map(session => [
        new Date(session.session_date).toLocaleDateString('he-IL'),
        session.summary_text,
        session.progress_rating || '',
        (session.achieved_goals || []).join(', '),
        (session.future_goals || []).join(', ')
      ]);
      
      if (sessionData.length > 0) {
        sessionData.unshift(['תאריך', 'סיכום', 'דירוג התקדמות', 'מטרות שהושגו', 'מטרות עתידיות']);
        const sessionSheet = XLSX.utils.aoa_to_sheet(sessionData);
        XLSX.utils.book_append_sheet(playerWorkbook, sessionSheet, 'סיכומי אימון');
      }
      
      // Game summaries sheet
      const gameData = gameSummaries.map(game => [
        new Date(game.created_at).toLocaleDateString('he-IL'),
        game.performance_rating || '',
        game.concentration_level || '',
        game.fatigue_level || '',
        game.goals_met ? 'כן' : 'לא',
        game.strongest_point || '',
        game.improvement_notes || ''
      ]);
      
      if (gameData.length > 0) {
        gameData.unshift(['תאריך', 'דירוג ביצועים', 'רמת ריכוז', 'רמת עייפות', 'מטרות הושגו', 'נקודה חזקה', 'הערות לשיפור']);
        const gameSheet = XLSX.utils.aoa_to_sheet(gameData);
        XLSX.utils.book_append_sheet(playerWorkbook, gameSheet, 'סיכומי משחק');
      }
      
      // Write the workbook and save
      XLSX.writeFile(playerWorkbook, `${playerInfo?.full_name || 'player'}_file.xlsx`);
      toast.success('הייצוא ל-Excel הושלם בהצלחה');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('שגיאה בייצוא ל-Excel');
    }
  };

  const getProgressColor = (value: number) => {
    if (value < 35) return 'bg-red-500';
    if (value < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const calculateCompletedGoalsPercentage = (type: string = 'all') => {
    if (goals.length === 0) return 0;
    
    const filteredGoals = type === 'all' 
      ? goals 
      : goals.filter(goal => goal.type === type);
    
    if (filteredGoals.length === 0) return 0;
    
    const completedCount = filteredGoals.filter(goal => goal.completed).length;
    return Math.round((completedCount / filteredGoals.length) * 100);
  };

  const calculateAverageScore = (property: 'feeling_score' | 'motivation_level' | 'mental_fatigue_level') => {
    if (mentalStates.length === 0) return 0;
    const sum = mentalStates.reduce((acc, state) => acc + state[property], 0);
    return Math.round(sum / mentalStates.length);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!playerInfo) {
    return (
      <Layout>
        <div className="container py-8 text-center">
          <h2 className="text-2xl font-bold">השחקן לא נמצא</h2>
          <p className="mt-4 text-gray-500">לא ניתן למצוא את פרטי השחקן המבוקש</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            {playerInfo.profile_image ? (
              <img 
                src={playerInfo.profile_image} 
                alt={playerInfo.full_name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-primary"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{playerInfo.full_name}</h1>
              <p className="text-muted-foreground">{playerInfo.sport_field || 'ספורטאי/ת'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToPDF} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              ייצוא ל-PDF
            </Button>
            <Button onClick={exportToExcel} variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              ייצוא ל-Excel
            </Button>
          </div>
        </div>

        <div id="player-file-content">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
              <TabsTrigger value="overview" className="flex gap-2 items-center">
                <Users className="h-4 w-4" />
                <span className="hidden md:inline">סקירה כללית</span>
                <span className="md:hidden">סקירה</span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex gap-2 items-center">
                <Target className="h-4 w-4" />
                <span>מטרות</span>
              </TabsTrigger>
              <TabsTrigger value="mental" className="flex gap-2 items-center">
                <BarChart4 className="h-4 w-4" />
                <span>מצב מנטלי</span>
              </TabsTrigger>
              <TabsTrigger value="sessions" className="flex gap-2 items-center">
                <Calendar className="h-4 w-4" />
                <span className="hidden md:inline">סיכומי אימונים</span>
                <span className="md:hidden">אימונים</span>
              </TabsTrigger>
              <TabsTrigger value="games" className="flex gap-2 items-center">
                <CheckCircle className="h-4 w-4" />
                <span className="hidden md:inline">סיכומי משחקים</span>
                <span className="md:hidden">משחקים</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>פרטי שחקן</CardTitle>
                  <CardDescription>מידע בסיסי על השחקן</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">שם מלא</p>
                        <p className="text-base">{playerInfo.full_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">אימייל</p>
                        <p className="text-base">{playerInfo.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">טלפון</p>
                        <p className="text-base">{playerInfo.phone || 'לא הוזן'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">תאריך לידה</p>
                        <p className="text-base">{playerInfo.birthdate || 'לא הוזן'}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">מועדון</p>
                        <p className="text-base">{playerInfo.club || 'לא הוזן'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">עיר</p>
                        <p className="text-base">{playerInfo.city || 'לא הוזן'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">תחום ספורט</p>
                        <p className="text-base">{playerInfo.sport_field || 'לא הוזן'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">מאמן</p>
                        <p className="text-base">{playerInfo.coach_name || 'לא משויך'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">מצב מנטלי</CardTitle>
                    <CardDescription>סיכום נתוני מצב מנטלי</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">הרגשה כללית</span>
                          <span className="text-sm font-medium">{calculateAverageScore('feeling_score')}%</span>
                        </div>
                        <Progress 
                          value={calculateAverageScore('feeling_score')} 
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">מוטיבציה</span>
                          <span className="text-sm font-medium">{calculateAverageScore('motivation_level')}%</span>
                        </div>
                        <Progress 
                          value={calculateAverageScore('motivation_level')} 
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">עייפות מנטלית</span>
                          <span className="text-sm font-medium">{calculateAverageScore('mental_fatigue_level')}%</span>
                        </div>
                        <Progress 
                          value={calculateAverageScore('mental_fatigue_level')} 
                          className="h-2"
                        />
                      </div>
                      {mentalStates.length > 0 && (
                        <div className="pt-2">
                          <p className="text-sm text-muted-foreground">דיווח אחרון: {new Date(mentalStates[0].created_at).toLocaleDateString('he-IL')}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">מטרות</CardTitle>
                    <CardDescription>סטטוס השלמת מטרות</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">כל המטרות</span>
                          <span className="text-sm font-medium">{calculateCompletedGoalsPercentage('all')}%</span>
                        </div>
                        <Progress 
                          value={calculateCompletedGoalsPercentage('all')} 
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">ארוכות טווח</span>
                          <span className="text-sm font-medium">{calculateCompletedGoalsPercentage('long-term')}%</span>
                        </div>
                        <Progress 
                          value={calculateCompletedGoalsPercentage('long-term')} 
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">קצרות טווח</span>
                          <span className="text-sm font-medium">{calculateCompletedGoalsPercentage('short-term')}%</span>
                        </div>
                        <Progress 
                          value={calculateCompletedGoalsPercentage('short-term')} 
                          className="h-2"
                        />
                      </div>
                      <div className="text-sm pt-2">
                        <p>סה"כ מטרות: {goals.length}</p>
                        <p>מטרות שהושלמו: {goals.filter(goal => goal.completed).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">פעילויות</CardTitle>
                    <CardDescription>סיכום אימונים ומשחקים</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">אימונים מתועדים</span>
                          <span className="text-xl font-semibold">{sessionSummaries.length}</span>
                        </div>
                        <Separator className="my-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">משחקים מתועדים</span>
                          <span className="text-xl font-semibold">{gameSummaries.length}</span>
                        </div>
                        <Separator className="my-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">דיווחי מצב מנטלי</span>
                          <span className="text-xl font-semibold">{mentalStates.length}</span>
                        </div>
                        <Separator className="my-2" />
                      </div>
                      {sessionSummaries.length > 0 && (
                        <div className="pt-2">
                          <p className="text-sm text-muted-foreground">
                            אימון אחרון: {new Date(sessionSummaries[0].session_date).toLocaleDateString('he-IL')}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {sessionSummaries.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>סיכום אימון אחרון</CardTitle>
                    <CardDescription>
                      {new Date(sessionSummaries[0].session_date).toLocaleDateString('he-IL')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="whitespace-pre-line">{sessionSummaries[0].summary_text}</p>
                      {sessionSummaries[0].progress_rating && (
                        <div>
                          <p className="font-medium mb-1">דירוג התקדמות: {sessionSummaries[0].progress_rating}/10</p>
                          <Progress 
                            value={sessionSummaries[0].progress_rating * 10} 
                            className="h-2"
                          />
                        </div>
                      )}
                      {sessionSummaries[0].achieved_goals && sessionSummaries[0].achieved_goals.length > 0 && (
                        <div>
                          <p className="font-medium">מטרות שהושגו:</p>
                          <ul className="list-disc list-inside">
                            {sessionSummaries[0].achieved_goals.map((goal, index) => (
                              <li key={index} className="text-sm">{goal}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="goals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>מטרות</span>
                    <span className="text-sm font-normal">
                      {goals.filter(g => g.completed).length} / {goals.length} הושלמו
                    </span>
                  </CardTitle>
                  <CardDescription>כל המטרות של השחקן</CardDescription>
                </CardHeader>
                <CardContent>
                  {goals.length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-2 text-lg font-semibold">אין מטרות</h3>
                      <p className="text-sm text-muted-foreground">לא הוגדרו מטרות עבור שחקן זה</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {['long-term', 'short-term', 'immediate'].map((type) => {
                        const filteredGoals = goals.filter(goal => goal.type === type);
                        if (filteredGoals.length === 0) return null;
                        
                        return (
                          <div key={type} className="space-y-4">
                            <h3 className="font-medium text-lg">
                              {type === 'long-term' ? 'מטרות ארוכות טווח' : 
                               type === 'short-term' ? 'מטרות קצרות טווח' : 
                               'מטרות מיידיות'}
                            </h3>
                            <div className="space-y-3">
                              {filteredGoals.map((goal) => (
                                <Card key={goal.id} className={`border-2 ${goal.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                                  <CardHeader className="py-3">
                                    <CardTitle className={`text-lg ${goal.completed ? 'line-through text-gray-500' : ''}`}>
                                      {goal.title}
                                    </CardTitle>
                                    {goal.due_date && (
                                      <CardDescription>
                                        תאריך יעד: {new Date(goal.due_date).toLocaleDateString('he-IL')}
                                      </CardDescription>
                                    )}
                                  </CardHeader>
                                  <CardContent className="py-0">
                                    {goal.description && (
                                      <p className="text-sm mb-2">{goal.description}</p>
                                    )}
                                    {goal.success_criteria && (
                                      <div className="text-sm text-gray-600">
                                        <span className="font-semibold">מדד הצלחה:</span> {goal.success_criteria}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mental" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>היסטוריית מצב מנטלי</CardTitle>
                  <CardDescription>מעקב אחר התקדמות ושינויים במצב המנטלי</CardDescription>
                </CardHeader>
                <CardContent>
                  {mentalStates.length === 0 ? (
                    <div className="text-center py-8">
                      <BarChart4 className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-2 text-lg font-semibold">אין נתונים</h3>
                      <p className="text-sm text-muted-foreground">לא נמצאו דיווחי מצב מנטלי עבור שחקן זה</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>תאריך</TableHead>
                            <TableHead>הרגשה כללית</TableHead>
                            <TableHead>מוטיבציה</TableHead>
                            <TableHead>עייפות מנטלית</TableHead>
                            <TableHead>חששות</TableHead>
                            <TableHead>מיקוד לשיפור</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mentalStates.map((state) => (
                            <TableRow key={state.id}>
                              <TableCell className="font-medium">
                                {new Date(state.created_at).toLocaleDateString('he-IL')}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress 
                                    value={state.feeling_score} 
                                    className={`h-2 w-16 ${getProgressColor(state.feeling_score)}`}
                                  />
                                  <span>{state.feeling_score}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress 
                                    value={state.motivation_level} 
                                    className={`h-2 w-16 ${getProgressColor(state.motivation_level)}`}
                                  />
                                  <span>{state.motivation_level}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress 
                                    value={state.mental_fatigue_level} 
                                    className={`h-2 w-16 ${state.mental_fatigue_level > 65 ? 'bg-red-500' : state.mental_fatigue_level > 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                  />
                                  <span>{state.mental_fatigue_level}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {state.has_concerns ? (
                                  <span className="text-sm">{state.concerns_details || 'יש'}</span>
                                ) : (
                                  <span className="text-sm text-gray-500">אין</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">
                                  {state.improvement_focus || '-'}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>סיכומי אימונים</CardTitle>
                  <CardDescription>תיעוד אימונים ומעקב התקדמות</CardDescription>
                </CardHeader>
                <CardContent>
                  {sessionSummaries.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-2 text-lg font-semibold">אין סיכומי אימונים</h3>
                      <p className="text-sm text-muted-foreground">לא נמצאו סיכומי אימונים עבור שחקן זה</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {sessionSummaries.map((session) => (
                        <Card key={session.id} className="shadow-sm">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-lg">אימון {new Date(session.session_date).toLocaleDateString('he-IL')}</CardTitle>
                              {session.progress_rating && (
                                <div className="text-sm bg-gray-100 px-2 py-1 rounded-md">
                                  התקדמות: {session.progress_rating}/10
                                </div>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">סיכום האימון:</h4>
                                <p className="text-sm whitespace-pre-line">{session.summary_text}</p>
                              </div>
                              
                              {session.achieved_goals && session.achieved_goals.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-1">מטרות שהושגו:</h4>
                                  <ul className="list-disc list-inside">
                                    {session.achieved_goals.map((goal, index) => (
                                      <li key={index} className="text-sm">{goal}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {session.future_goals && session.future_goals.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-1">מטרות להמשך:</h4>
                                  <ul className="list-disc list-inside">
                                    {session.future_goals.map((goal, index) => (
                                      <li key={index} className="text-sm">{goal}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {session.tools_used && session.tools_used.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-1">כלים בשימוש:</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {session.tools_used.map((tool: any, index: number) => (
                                      <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
                                        {tool.name || tool}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="games" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>סיכומי משחקים</CardTitle>
                  <CardDescription>תיעוד ביצועים והערות ממשחקים</CardDescription>
                </CardHeader>
                <CardContent>
                  {gameSummaries.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-2 text-lg font-semibold">אין סיכומי משחקים</h3>
                      <p className="text-sm text-muted-foreground">לא נמצאו סיכומי משחקים עבור שחקן זה</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {gameSummaries.map((game) => (
                        <Card key={game.id} className="shadow-sm">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-lg">
                                משחק {new Date(game.created_at).toLocaleDateString('he-IL')}
                              </CardTitle>
                              {game.performance_rating && (
                                <div className="text-sm bg-gray-100 px-2 py-1 rounded-md">
                                  ביצוע: {game.performance_rating}/10
                                </div>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground">רמת ריכוז:</h4>
                                  {game.concentration_level && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <Progress 
                                        value={game.concentration_level} 
                                        className={`h-2 w-32 ${getProgressColor(game.concentration_level)}`}
                                      />
                                      <span className="text-sm">{game.concentration_level}%</span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground">רמת עייפות:</h4>
                                  {game.fatigue_level && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <Progress 
                                        value={game.fatigue_level} 
                                        className={`h-2 w-32 ${game.fatigue_level > 65 ? 'bg-red-500' : game.fatigue_level > 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                      />
                                      <span className="text-sm">{game.fatigue_level}%</span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground">מטרות הושגו:</h4>
                                  <p className="text-sm">
                                    {game.goals_met === true ? 'כן' : game.goals_met === false ? 'לא' : 'לא צוין'}
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-3">
                                {game.strongest_point && (
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">נקודה חזקה:</h4>
                                    <p className="text-sm">{game.strongest_point}</p>
                                  </div>
                                )}
                                {game.improvement_notes && (
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">הערות לשיפור:</h4>
                                    <p className="text-sm whitespace-pre-line">{game.improvement_notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default PlayerFile;
