import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  User, 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MapPin,
  ChevronDown,
  ChevronUp,
  Filter,
  LogOut,
  Dumbbell,
  Users,
  Target,
  Flag,
  ListChecks
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Textarea } from "@/components/ui/textarea";

interface Player {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  birthdate: string;
  city: string;
  club: string;
  year_group: string;
  injuries: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  notes: string;
  sport_field: string;
  profile_image: string;
}

interface SessionSummary {
  id: string;
  summary_text: string;
  achieved_goals: string[] | null;
  future_goals: string[] | null;
  progress_rating: number | null;
  next_session_focus: string | null;
  additional_notes: string | null;
  tools_used: any | null;
}

interface Session {
  id: string;
  session_date: string;
  session_time: string;
  location: string | null;
  notes: string | null;
  coaches: {
    full_name: string;
  };
  has_summary: boolean;
  session_summary?: SessionSummary | null;
}

interface PhysicalWorkout {
  id: string;
  date: string;
  description: string;
  duration: string;
  workout_type: 'individual' | 'team';
  team_name?: string;
}

interface PlayerGoal {
  id: string;
  title: string;
  description: string;
  target_date: string;
  completed: boolean;
}

type TimeFilter = 'all' | 'upcoming' | 'past' | 'week' | 'month';

const PlayerProfileView = () => {
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [pastSessions, setPastSessions] = useState<Session[]>([]);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [workoutType, setWorkoutType] = useState<'individual' | 'team'>('individual');
  const [teamName, setTeamName] = useState('');
  const [physicalWorkouts, setPhysicalWorkouts] = useState<PhysicalWorkout[]>([]);
  const [allPhysicalWorkouts, setAllPhysicalWorkouts] = useState<PhysicalWorkout[]>([]);
  const [showAllWorkouts, setShowAllWorkouts] = useState(false);
  const [goals, setGoals] = useState<PlayerGoal[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        
        const playerSession = localStorage.getItem('playerSession');
        
        if (!playerSession) {
          throw new Error("אין פרטי התחברות לשחקן");
        }

        const playerData = JSON.parse(playerSession);
        const playerId = playerData.id;
        
        const { data: playerDetails, error: playerError } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single();

        if (playerError) throw playerError;
        if (!playerDetails) throw new Error("לא נמצאו פרטי שחקן");
        
        setPlayer(playerDetails);
        
        const mockWorkouts: PhysicalWorkout[] = [
          {
            id: '1',
            date: '2023-05-15',
            description: 'ריצה בפארק למשך 5 ק״מ',
            duration: '45 דקות',
            workout_type: 'individual'
          },
          {
            id: '2',
            date: '2023-05-10',
            description: 'אימון כוח - חזה וכתפיים',
            duration: '60 דקות',
            workout_type: 'individual'
          },
          {
            id: '3',
            date: '2023-05-08',
            description: 'אימון קבוצתי - תרגילי כדור',
            duration: '90 דקות',
            workout_type: 'team',
            team_name: 'שמשון תל אביב'
          },
          {
            id: '4',
            date: '2023-05-05',
            description: 'שחייה',
            duration: '30 דקות',
            workout_type: 'individual'
          },
          {
            id: '5',
            date: '2023-05-01',
            description: 'אימון קבוצתי - משחקון',
            duration: '120 דקות',
            workout_type: 'team',
            team_name: 'שמשון תל אביב'
          }
        ];
        
        setPhysicalWorkouts(mockWorkouts.slice(0, 3));
        setAllPhysicalWorkouts(mockWorkouts);
        
        const mockGoals: PlayerGoal[] = [
          {
            id: '1',
            title: 'שיפור סיבולת',
            description: 'לרוץ 5 קילומטרים ברצף ללא הפסקה',
            target_date: '2023-06-15',
            completed: false
          },
          {
            id: '2',
            title: 'עבודה על בעיטות',
            description: 'לתרגל 50 בעיטות לשער כל יום',
            target_date: '2023-07-01',
            completed: true
          },
          {
            id: '3',
            title: 'שיפור מהירות',
            description: 'להוריד 0.5 שניות בריצת 100 מטר',
            target_date: '2023-08-10',
            completed: false
          }
        ];
        
        setGoals(mockGoals);
        
        const now = new Date();
        const { data: upcomingSessionsData, error: upcomingSessionsError } = await supabase
          .from('sessions')
          .select(`
            *, 
            coaches(full_name),
            has_summary:session_summaries(id)
          `)
          .eq('player_id', playerId)
          .gte('session_date', now.toISOString().split('T')[0])
          .order('session_date', { ascending: true });
          
        if (upcomingSessionsError) throw upcomingSessionsError;
        
        const formattedUpcomingSessions = (upcomingSessionsData || []).map(session => ({
          ...session,
          has_summary: session.has_summary && session.has_summary.length > 0
        }));
        
        setUpcomingSessions(formattedUpcomingSessions);
        
        const { data: pastSessionsData, error: pastSessionsError } = await supabase
          .from('sessions')
          .select(`
            *, 
            coaches(full_name),
            has_summary:session_summaries(id),
            session_summary:session_summaries(
              id,
              summary_text,
              achieved_goals,
              future_goals,
              progress_rating,
              next_session_focus,
              additional_notes,
              tools_used
            )
          `)
          .eq('player_id', playerId)
          .lt('session_date', now.toISOString().split('T')[0])
          .order('session_date', { ascending: false });
          
        if (pastSessionsError) throw pastSessionsError;
        
        const formattedPastSessions = (pastSessionsData || []).map(session => {
          const hasSummary = session.has_summary && session.has_summary.length > 0;
          
          const summaryData = hasSummary && session.session_summary && session.session_summary.length > 0 
            ? session.session_summary[0] 
            : null;
          
          return {
            ...session,
            has_summary: hasSummary,
            session_summary: summaryData
          };
        });
        
        setPastSessions(formattedPastSessions);
        
      } catch (err: any) {
        console.error("Error fetching player data:", err);
        setError(err.message);
        toast.error("שגיאה בטעינת פרטי השחקן");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, []);

  const handleAddWorkout = () => {
    if (workoutDescription.trim() === '') {
      toast.error("אנא הכנס תיאור אימון");
      return;
    }
    
    if (workoutDuration.trim() === '') {
      toast.error("אנא הכנס משך אימון");
      return;
    }
    
    if (workoutType === 'team' && teamName.trim() === '') {
      toast.error("אנא הכנס שם קבוצה");
      return;
    }
    
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    const newWorkout: PhysicalWorkout = {
      id: Date.now().toString(),
      date: formattedDate,
      description: workoutDescription,
      duration: workoutDuration,
      workout_type: workoutType,
      ...(workoutType === 'team' && { team_name: teamName })
    };
    
    setPhysicalWorkouts(prev => [newWorkout, ...prev]);
    setAllPhysicalWorkouts(prev => [newWorkout, ...prev]);
    setWorkoutDescription('');
    setWorkoutDuration('');
    setWorkoutType('individual');
    setTeamName('');
    toast.success('האימון נשמר בהצלחה');
  };

  const handleDeleteWorkout = (id: string) => {
    setPhysicalWorkouts(prev => prev.filter(workout => workout.id !== id));
    setAllPhysicalWorkouts(prev => prev.filter(workout => workout.id !== id));
    toast.success('האימון נמחק בהצלחה');
  };

  const handleAddGoal = () => {
    if (newGoalTitle.trim() === '') {
      toast.error("אנא הכנס כותרת מטרה");
      return;
    }
    
    const newGoal: PlayerGoal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      description: newGoalDescription,
      target_date: newGoalDate || new Date().toISOString().split('T')[0],
      completed: false
    };
    
    setGoals(prev => [...prev, newGoal]);
    setNewGoalTitle('');
    setNewGoalDescription('');
    setNewGoalDate('');
    toast.success('המטרה נוספה בהצלחה');
  };

  const toggleGoalCompletion = (id: string) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === id 
          ? { ...goal, completed: !goal.completed }
          : goal
      )
    );
    
    toast.success('סטטוס המטרה עודכן בהצלחה');
  };
  
  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
    toast.success('המטרה נמחקה בהצלחה');
  };

  const toggleGoalExpanded = (goalId: string) => {
    if (expandedGoalId === goalId) {
      setExpandedGoalId(null);
    } else {
      setExpandedGoalId(goalId);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('playerSession');
    navigate('/player-auth');
    toast.success("התנתקת בהצלחה");
  };

  const toggleSession = (sessionId: string) => {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
    } else {
      setExpandedSessionId(sessionId);
    }
  };

  const navigateToGamePrep = () => {
    navigate('/game-prep');
  };

  const toggleShowAllWorkouts = () => {
    setShowAllWorkouts(!showAllWorkouts);
  };

  const filterSessionsByTime = (sessions: Session[], filter: TimeFilter): Session[] => {
    const now = new Date();
    
    switch (filter) {
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAhead = new Date();
        weekAhead.setDate(weekAhead.getDate() + 7);
        return sessions.filter(session => {
          const sessionDate = new Date(session.session_date);
          return sessionDate >= weekAgo && sessionDate <= weekAhead;
        });
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const monthAhead = new Date();
        monthAhead.setMonth(monthAhead.getMonth() + 1);
        return sessions.filter(session => {
          const sessionDate = new Date(session.session_date);
          return sessionDate >= monthAgo && sessionDate <= monthAhead;
        });
      case 'upcoming':
        return sessions.filter(session => new Date(session.session_date) >= now);
      case 'past':
        return sessions.filter(session => new Date(session.session_date) < now);
      case 'all':
      default:
        return sessions;
    }
  };

  const getFilteredUpcomingSessions = () => {
    return filterSessionsByTime(upcomingSessions, timeFilter);
  };

  const getFilteredPastSessions = () => {
    return filterSessionsByTime(pastSessions, timeFilter);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">שגיאה בטעינת פרטי השחקן</p>
          <p>{error || "לא נמצאו פרטים"}</p>
          <Button 
            onClick={() => navigate('/player-auth')}
            className="mt-4"
            variant="outline"
          >
            חזרה לדף ההתחברות
          </Button>
        </div>
      </div>
    );
  }

  const profileImageUrl = player.profile_image || 'https://via.placeholder.com/150';

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="w-full bg-[#1A1F2C] text-white py-6 mb-8 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">הפרופיל שלי</h1>
          <Button 
            variant="ghost" 
            onClick={handleLogout} 
            className="text-red-500 hover:bg-white/10 hover:text-red-400 px-2 py-1 h-auto text-sm"
          >
            <LogOut className="h-4 w-4 mr-1" />
            התנתק
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-12">
        <div className="flex mb-6 overflow-x-auto pb-2 justify-center gap-4">
          <Button
            variant={activeTab === 'physical' ? 'default' : 'outline'}
            className={`flex flex-col items-center px-6 py-4 h-auto min-w-[100px] ${
              activeTab === 'physical' ? 'bg-[#F2FCE2] text-green-700 hover:bg-[#F2FCE2]' : ''
            }`}
            onClick={() => setActiveTab('physical')}
          >
            <Dumbbell className="h-6 w-6 mb-2" />
            <span>אימונים פיזיים</span>
          </Button>
          <Button
            variant={activeTab === 'goals' ? 'default' : 'outline'}
            className={`flex flex-col items-center px-6 py-4 h-auto min-w-[100px] ${
              activeTab === 'goals' ? 'bg-[#F2FCE2] text-green-700 hover:bg-[#F2FCE2]' : ''
            }`}
            onClick={() => setActiveTab('goals')}
          >
            <Target className="h-6 w-6 mb-2" />
            <span>המטרות שלי</span>
          </Button>
          <Button
            variant={activeTab === 'profile' ? 'default' : 'outline'}
            className={`flex flex-col items-center px-6 py-4 h-auto min-w-[100px] ${
              activeTab === 'profile' ? 'bg-[#F2FCE2] text-green-700 hover:bg-[#F2FCE2]' : ''
            }`}
            onClick={() => setActiveTab('profile')}
          >
            <User className="h-6 w-6 mb-2" />
            <span>פרופיל</span>
          </Button>
          <Button
            variant={activeTab === 'upcoming' ? 'default' : 'outline'}
            className={`flex flex-col items-center px-6 py-4 h-auto min-w-[100px] ${
              activeTab === 'upcoming' ? 'bg-[#F2FCE2] text-green-700 hover:bg-[#F2FCE2]' : ''
            }`}
            onClick={() => setActiveTab('upcoming')}
          >
            <Calendar className="h-6 w-6 mb-2" />
            <span>מפגשים</span>
          </Button>
          <Button
            variant={activeTab === 'past' ? 'default' : 'outline'}
            className={`flex flex-col items-center px-6 py-4 h-auto min-w-[100px] ${
              activeTab === 'past' ? 'bg-[#F2FCE2] text-green-700 hover:bg-[#F2FCE2]' : ''
            }`}
            onClick={() => setActiveTab('past')}
          >
            <FileText className="h-6 w-6 mb-2" />
            <span>סיכומים</span>
          </Button>
          <Button
            variant={activeTab === 'gameprep' ? 'default' : 'outline'}
            className={`flex flex-col items-center px-6 py-4 h-auto min-w-[120px] ${
              activeTab === 'gameprep' ? 'bg-[#F2FCE2] text-green-700 hover:bg-[#F2FCE2]' : ''
            }`}
            onClick={() => {
              setActiveTab('gameprep');
              navigateToGamePrep();
            }}
          >
            <ListChecks className="h-6 w-6 mb-2" />
            <span>הכנה למשחק</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-3">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                <div className="w-24 h-24 relative shrink-0 rounded-full overflow-hidden">
                  <img 
                    src={profileImageUrl} 
                    alt={player.full_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/150?text=' + encodeURIComponent(player.full_name);
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{player.full_name}</h2>
                  <p className="text-gray-500">{player.sport_field || "לא צוין ענף ספורטיבי"}</p>
                  <p className="text-gray-700 mt-1">
                    {player.club && player.year_group ? (
                      <span>
                        {player.club} • {player.year_group}
                      </span>
                    ) : player.club ? (
                      <span>{player.club}</span>
                    ) : player.year_group ? (
                      <span>{player.year_group}</span>
                    ) : (
                      <span>לא צוין מועדון/קבוצת גיל</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {activeTab !== 'physical' && activeTab !== 'goals' && activeTab !== 'gameprep' && (
            <div className="lg:col-span-3 flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">
                {activeTab === 'upcoming' ? 'המפגשים הקרובים שלי' : 
                activeTab === 'past' ? 'סיכומי המפגשים הקודמים' : 
                activeTab === 'physical' ? 'האימונים הפיזיים שלי' : 
                activeTab === 'goals' ? 'המטרות שלי' : 'הפרופיל שלי'}
              </h3>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select 
                  value={timeFilter} 
                  onValueChange={(value) => setTimeFilter(value as TimeFilter)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="סנן לפי זמן" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל המפגשים</SelectItem>
                    <SelectItem value="upcoming">מפגשים עתידיים</SelectItem>
                    <SelectItem value="past">מפגשים קודמים</SelectItem>
                    <SelectItem value="week">שבוע אחרון/הבא</SelectItem>
                    <SelectItem value="month">חודש אחרון/הבא</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="lg:col-span-3">
            {activeTab === 'physical' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-primary" />
                    האימונים הפיזיים שלי
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">הוסף אימון פיזי חדש</h3>
                    
                    <div className="grid grid-cols-1 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          סוג האימון
                        </label>
                        <div className="flex gap-4">
                          <div 
                            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
                              workoutType === 'individual' 
                                ? 'bg-primary/10 border-primary' 
                                : 'border-gray-300 hover:border-primary/50'
                            }`}
                            onClick={() => setWorkoutType('individual')}
                          >
                            <Dumbbell className={`h-5 w-5 ${workoutType === 'individual' ? 'text-primary' : 'text-gray-500'}`} />
                            <span>אימון אישי</span>
                          </div>
                          <div 
                            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
                              workoutType === 'team' 
                                ? 'bg-primary/10 border-primary' 
                                : 'border-gray-300 hover:border-primary/50'
                            }`}
                            onClick={() => setWorkoutType('team')}
                          >
                            <Users className={`h-5 w-5 ${workoutType === 'team' ? 'text-primary' : 'text-gray-500'}`} />
                            <span>אימון קבוצתי</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="workout-description" className="block text-sm font-medium text-gray-700 mb-1">
                          תיאור האימון
                        </label>
                        <Textarea
                          id="workout-description"
                          placeholder="לדוגמה: ריצה בפארק, אימון כוח, שחייה"
                          value={workoutDescription}
                          onChange={(e) => setWorkoutDescription(e.target.value)}
                          className="h-24"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label htmlFor="workout-duration" className="block text-sm font-medium text-gray-700 mb-1">
                            משך האימון (דקות)
                          </label>
                          <input
                            id="workout-duration"
                            type="text"
                            placeholder="לדוגמה: 45 דקות"
                            value={workoutDuration}
                            onChange={(e) => setWorkoutDuration(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                        
                        {workoutType === 'team' && (
                          <div>
                            <label htmlFor="team-name" className="block text-sm font-medium text-gray-700 mb-1">
                              שם הקבוצה
                            </label>
                            <input
                              id="team-name"
                              type="text"
                              placeholder="שם הקבוצה"
                              value={teamName}
                              onChange={(e) => setTeamName(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <Button onClick={handleAddWorkout} className="mt-2">
                      הוסף אימון
                    </Button>
                  </div>

                  {allPhysicalWorkouts.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium mt-6 mb-4">האימונים האחרונים שלי</h3>
                        <Button 
                          variant="ghost" 
                          onClick={toggleShowAllWorkouts}
                          className="text-primary"
                        >
                          {showAllWorkouts ? 'הצג פחות' : 'הצג את כל האימונים'}
                        </Button>
                      </div>
                      
                      {(showAllWorkouts ? allPhysicalWorkouts : physicalWorkouts).map((workout) => (
                        <div key={workout.id} className="bg-white p-4 rounded-lg border flex justify-between items-start">
                          <div className="w-full">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="bg-blue-50">
                                {formatDate(workout.date)}
                              </Badge>
                              <Badge variant="outline">{workout.duration}</Badge>
                              {workout.workout_type === 'team' && (
                                <Badge variant="outline" className="bg-green-50 text-green-800">
                                  <Users className="h-3 w-3 mr-1" />
                                  אימון קבוצתי
                                </Badge>
                              )}
                              {workout.workout_type === 'individual' && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-800">
                                  <Dumbbell className="h-3 w-3 mr-1" />
                                  אימון אישי
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-700">{workout.description}</p>
                            {workout.team_name && (
                              <p className="text-gray-500 text-sm mt-1">קבוצה: {workout.team_name}</p>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:bg-red-50 shrink-0"
                            onClick={() => handleDeleteWorkout(workout.id)}
                          >
                            מחק
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>עדיין לא נרשמו אימונים פיזיים</p>
                      <p className="text-sm mt-2">הוסף את האימון הראשון שלך למעקב</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'goals' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    המטרות שלי
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">הוסף מטרה חדשה</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="goal-title" className="block text-sm font-medium text-gray-700 mb-1">
                          כותרת המטרה
                        </label>
                        <input
                          id="goal-title"
                          type="text"
                          placeholder="לדוגמה: שיפור סיבולת"
                          value={newGoalTitle}
                          onChange={(e) => setNewGoalTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="goal-date" className="block text-sm font-medium text-gray-700 mb-1">
                          תאריך יעד
                        </label>
                        <input
                          id="goal-date"
                          type="date"
                          value={newGoalDate}
                          onChange={(e) => setNewGoalDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="goal-description" className="block text-sm font-medium text-gray-700 mb-1">
                        תיאור המטרה
                      </label>
                      <Textarea
                        id="goal-description"
                        placeholder="פירוט על המטרה, איך תשיג אותה וכדומה"
                        value={newGoalDescription}
                        onChange={(e) => setNewGoalDescription(e.target.value)}
                        className="h-24"
                      />
                    </div>
                    <Button onClick={handleAddGoal}>
                      הוסף מטרה
                    </Button>
                  </div>

                  {goals.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium mt-6 mb-4">המטרות שלי</h3>
                      {goals.map((goal) => (
                        <div key={goal.id} className="bg-white p-4 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div 
                                className={`w-5 h-5 rounded-full flex items-center justify-center cursor-pointer border ${
                                  goal.completed 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-gray-300'
                                }`}
                                onClick={() => toggleGoalCompletion(goal.id)}
                              >
                                {goal.completed && <CheckCircle className="h-4 w-4" />}
                              </div>
                              <h4 className={`font-medium ${goal.completed ? 'line-through text-gray-500' : ''}`}>
                                {goal.title}
                              </h4>
                              {goal.target_date && (
                                <Badge variant="outline" className="bg-blue-50">
                                  {formatDate(goal.target_date)}
                                </Badge>
                              )}
                              {goal.completed && (
                                <Badge variant="outline" className="bg-green-50 text-green-800">
                                  הושלם
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => toggleGoalExpanded(goal.id)}
                              >
                                {expandedGoalId === goal.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500 hover:bg-red-50 h-8"
                                onClick={() => handleDeleteGoal(goal.id)}
                              >
                                מחק
                              </Button>
                            </div>
                          </div>
                          
                          {expandedGoalId === goal.id && goal.description && (
                            <div className="mt-3 pt-3 border-t text-gray-700 whitespace-pre-wrap">
                              {goal.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>עדיין לא נוספו מטרות</p>
                      <p className="text-sm mt-2">הוסף את המטרה הראשונה שלך</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfileView;
