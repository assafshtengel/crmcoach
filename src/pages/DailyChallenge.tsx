import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Award, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Textarea } from "@/components/ui/textarea";
import { 
  Flame,
  Target,
  TrendingUp,
  Pencil
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
}

interface DailyChallengeData {
  id?: string;
  user_id: string;
  goal_category: string;
  custom_goal?: string;
  daily_tasks: Task[];
  weekly_tasks: Task[];
  current_day: number;
  streak_count: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const generateTasksForGoal = (category: string, customGoal?: string): { daily: Task[], weekly: Task[] } => {
  // כאן נוכל להתאים את המשימות לפי הקטגוריה והמטרה המותאמת אישית
  const defaultTasks = {
    daily: [
      {
        id: 'd1',
        title: "תרגול 15 דקות של בעיטות מדויקות",
        completed: false,
      },
      {
        id: 'd2',
        title: "צפייה בסרטון וידאו של שחקן מצטיין",
        completed: false,
      },
      {
        id: 'd3',
        title: "כתיבת משפט מוטיבציה אישי",
        completed: false,
      },
      {
        id: 'd4',
        title: "5 דקות של נשימות לשיפור הריכוז",
        completed: false,
      }
    ],
    weekly: [
      {
        id: 'w1',
        title: "משחק עם שחקן מנוסה",
        description: "שחק עם שחקן מנוסה יותר ונסה ללמוד ממנו",
        completed: false,
      },
      {
        id: 'w2',
        title: "אימוני כוח",
        description: "בצע 3 אימוני כוח כדי לשפר יציבות על המגרש",
        completed: false,
      },
      {
        id: 'w3',
        title: "תיעוד וניתוח משחקים",
        description: "תיעד את המשחקים שלך וצפה בהם",
        completed: false,
      }
    ]
  };

  // בעתיד נוכל להתאים את המשימות לפי הקטגוריה
  return defaultTasks;
};

const DailyChallenge = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { categoryId, customGoal } = location.state || {};

  // אם אין קטגוריה, נחזיר לדף הקודם
  useEffect(() => {
    if (!categoryId) {
      toast({
        title: "שגיאה",
        description: "לא נבחרה קטגוריה",
        variant: "destructive"
      });
      navigate(-1);
    }
  }, [categoryId, navigate, toast]);

  const [notes, setNotes] = useState("");

  const { data: challenge, isLoading } = useQuery({
    queryKey: ['dailyChallenge'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: existingChallenge, error: fetchError } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching challenge:', fetchError);
        throw fetchError;
      }

      if (existingChallenge) {
        return {
          ...existingChallenge,
          daily_tasks: (existingChallenge.daily_tasks as unknown as Task[]) || [],
          weekly_tasks: (existingChallenge.weekly_tasks as unknown as Task[]) || []
        } as DailyChallengeData;
      }

      const tasks = generateTasksForGoal(categoryId, customGoal);
      const newChallenge = {
        user_id: user.id,
        goal_category: categoryId,
        custom_goal: customGoal,
        daily_tasks: JSON.parse(JSON.stringify(tasks.daily)),
        weekly_tasks: JSON.parse(JSON.stringify(tasks.weekly)),
        current_day: 1,
        streak_count: 0,
        notes: ""
      };

      const { data, error } = await supabase
        .from('daily_challenges')
        .insert(newChallenge)
        .select()
        .single();

      if (error) {
        console.error('Error creating challenge:', error);
        throw error;
      }

      return {
        ...data,
        daily_tasks: (data.daily_tasks as unknown as Task[]) || [],
        weekly_tasks: (data.weekly_tasks as unknown as Task[]) || []
      } as DailyChallengeData;
    },
    enabled: !!categoryId // רק אם יש קטגוריה נריץ את השאילתה
  });

  const updateChallenge = useMutation({
    mutationFn: async (updatedData: Partial<DailyChallengeData>) => {
      if (!challenge?.id) return;
      
      const dataToUpdate = {
        ...updatedData,
        daily_tasks: updatedData.daily_tasks ? JSON.parse(JSON.stringify(updatedData.daily_tasks)) : undefined,
        weekly_tasks: updatedData.weekly_tasks ? JSON.parse(JSON.stringify(updatedData.weekly_tasks)) : undefined
      };

      const { data, error } = await supabase
        .from('daily_challenges')
        .update(dataToUpdate)
        .eq('id', challenge.id)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        daily_tasks: (data.daily_tasks as unknown as Task[]) || [],
        weekly_tasks: (data.weekly_tasks as unknown as Task[]) || []
      } as DailyChallengeData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyChallenge'] });
      toast({
        title: "ההתקדמות נשמרה",
        description: "המשך כך!",
      });
    },
  });

  useEffect(() => {
    if (challenge?.notes) {
      setNotes(challenge.notes);
    }
  }, [challenge?.notes]);

  const toggleDailyTask = (taskId: string) => {
    if (!challenge?.daily_tasks) return;
    
    const updatedTasks = (challenge.daily_tasks as Task[]).map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    updateChallenge.mutate({ daily_tasks: updatedTasks });
  };

  const toggleWeeklyTask = (taskId: string) => {
    if (!challenge?.weekly_tasks) return;

    const updatedTasks = (challenge.weekly_tasks as Task[]).map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    updateChallenge.mutate({ weekly_tasks: updatedTasks });
  };

  const saveNotes = () => {
    updateChallenge.mutate({ notes });
  };

  if (isLoading) {
    return <div>טוען...</div>;
  }

  const dailyProgress = challenge?.daily_tasks ? 
    ((challenge.daily_tasks as Task[]).filter(t => t.completed).length / (challenge.daily_tasks as Task[]).length) * 100 : 0;
  const weeklyProgress = challenge?.weekly_tasks ?
    ((challenge.weekly_tasks as Task[]).filter(t => t.completed).length / (challenge.weekly_tasks as Task[]).length) * 100 : 0;
  const totalProgress = ((challenge?.current_day || 1) - 1) / 30 * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              שיפור קטן בכל יום – השינוי הגדול מתחיל כאן!
            </h1>
            {challenge?.custom_goal && (
              <div className="text-xl text-primary font-medium">
                המטרה שלך: {challenge.custom_goal}
              </div>
            )}
            <div className="flex items-center justify-center gap-2 text-primary">
              <Flame className="w-5 h-5" />
              <span className="font-medium">רצף של {challenge?.streak_count || 0} ימים!</span>
            </div>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  התקדמות כללית
                </h2>
                <div className="text-sm text-gray-600">
                  {challenge?.current_day || 1}/30 ימים הושלמו
                </div>
              </div>
              <Progress value={totalProgress} className="h-2" />
            </div>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* משימות יומיות */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    משימות יומיות
                  </h2>
                  <div className="text-sm text-gray-600">
                    {(challenge?.daily_tasks as Task[])?.filter(t => t.completed).length || 0}/
                    {(challenge?.daily_tasks as Task[])?.length || 0}
                  </div>
                </div>
                <Progress value={dailyProgress} className="h-2" />
                <div className="space-y-3">
                  {(challenge?.daily_tasks as Task[])?.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-white shadow-sm">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleDailyTask(task.id)}
                      />
                      <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* משימות שבועיות */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    משימות שבועיות
                  </h2>
                  <div className="text-sm text-gray-600">
                    {(challenge?.weekly_tasks as Task[])?.filter(t => t.completed).length || 0}/
                    {(challenge?.weekly_tasks as Task[])?.length || 0}
                  </div>
                </div>
                <Progress value={weeklyProgress} className="h-2" />
                <div className="space-y-3">
                  {(challenge?.weekly_tasks as Task[])?.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-white shadow-sm">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleWeeklyTask(task.id)}
                      />
                      <div className={`flex-1 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                        <div className="font-medium">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* הערות */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-primary" />
                  הערות אישיות
                </h2>
                <Button onClick={saveNotes} size="sm">שמור הערות</Button>
              </div>
              <Textarea
                placeholder="רשום כאן את המחשבות והתובנות שלך..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </Card>

          {/* תגי הישגים */}
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                תגי הישגים
              </h2>
              <div className="flex gap-4 flex-wrap">
                <div className={`flex items-center gap-2 p-2 rounded-full ${
                  (challenge?.streak_count || 0) >= 7 ? 'bg-primary/10' : 'bg-gray-100'
                }`}>
                  <Star className={`w-5 h-5 ${
                    (challenge?.streak_count || 0) >= 7 ? 'text-primary' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    (challenge?.streak_count || 0) >= 7 ? '' : 'text-gray-500'
                  }`}>7 ימים ראשונים</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded-full ${
                  (challenge?.streak_count || 0) >= 14 ? 'bg-primary/10' : 'bg-gray-100'
                }`}>
                  <CheckCircle2 className={`w-5 h-5 ${
                    (challenge?.streak_count || 0) >= 14 ? 'text-primary' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    (challenge?.streak_count || 0) >= 14 ? '' : 'text-gray-500'
                  }`}>14 ימים רצופים</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded-full ${
                  (challenge?.streak_count || 0) >= 30 ? 'bg-primary/10' : 'bg-gray-100'
                }`}>
                  <Clock className={`w-5 h-5 ${
                    (challenge?.streak_count || 0) >= 30 ? 'text-primary' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    (challenge?.streak_count || 0) >= 30 ? '' : 'text-gray-500'
                  }`}>30 ימים של מחויבות</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DailyChallenge;
