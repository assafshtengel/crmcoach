
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Star, 
  Calendar,
  Target,
  Clock,
  Flame,
  Trophy,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
}

interface DailyChallengeState {
  currentDay: number;
  totalDays: number;
  dailyTasks: Task[];
  weeklyTasks: Task[];
  streakCount: number;
}

const DailyChallenge = () => {
  const { toast } = useToast();
  const [state, setState] = useState<DailyChallengeState>({
    currentDay: 1,
    totalDays: 30,
    streakCount: 0,
    dailyTasks: [
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
    weeklyTasks: [
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
  });

  const toggleDailyTask = (taskId: string) => {
    setState(prev => ({
      ...prev,
      dailyTasks: prev.dailyTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const toggleWeeklyTask = (taskId: string) => {
    setState(prev => ({
      ...prev,
      weeklyTasks: prev.weeklyTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const dailyProgress = (state.dailyTasks.filter(t => t.completed).length / state.dailyTasks.length) * 100;
  const weeklyProgress = (state.weeklyTasks.filter(t => t.completed).length / state.weeklyTasks.length) * 100;
  const totalProgress = ((state.currentDay - 1) / state.totalDays) * 100;

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
            <div className="flex items-center justify-center gap-2 text-primary">
              <Flame className="w-5 h-5" />
              <span className="font-medium">רצף של {state.streakCount} ימים!</span>
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
                  {state.currentDay}/{state.totalDays} ימים הושלמו
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
                    {state.dailyTasks.filter(t => t.completed).length}/{state.dailyTasks.length}
                  </div>
                </div>
                <Progress value={dailyProgress} className="h-2" />
                <div className="space-y-3">
                  {state.dailyTasks.map((task) => (
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
                    {state.weeklyTasks.filter(t => t.completed).length}/{state.weeklyTasks.length}
                  </div>
                </div>
                <Progress value={weeklyProgress} className="h-2" />
                <div className="space-y-3">
                  {state.weeklyTasks.map((task) => (
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

          {/* תגי הישגים */}
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                תגי הישגים
              </h2>
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-2 p-2 rounded-full bg-primary/10">
                  <Star className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">7 ימים ראשונים</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-full bg-gray-100">
                  <CheckCircle2 className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">14 ימים רצופים</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-full bg-gray-100">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">30 ימים של מחויבות</span>
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
