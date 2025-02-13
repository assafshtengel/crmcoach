
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarDays, Target, Clock } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  weeks: string;
  completed: boolean;
}

interface ActionPlanData {
  title: string;
  duration: number;
  category: string;
  successMetrics: string[];
  weeklyTasks: Task[];
  dailyRoutine: string[];
}

const getActionPlan = (categoryId: string, answers: Record<string, string>): ActionPlanData => {
  // כאן נוסיף לוגיקה שמייצרת תוכנית מותאמת אישית לפי הקטגוריה והתשובות
  const plans: Record<string, ActionPlanData> = {
    'dribbling': {
      title: "שיפור יכולת הדריבל והשליטה בכדור",
      duration: 60,
      category: "דריבל ושליטה בכדור",
      successMetrics: [
        "ביצוע מוצלח של 8/10 ניסיונות דריבל במסלול מכשולים",
        "שמירה על שליטה בכדור במהירות גבוהה לאורך 30 מטר",
        "ביצוע 3 תרגילי כדרור מתקדמים ברצף ללא איבוד שליטה"
      ],
      weeklyTasks: [
        {
          id: "w1",
          title: "תרגול בסיסי",
          description: "3 אימוני דריבל של 30 דקות עם דגש על שליטה במהירות נמוכה",
          weeks: "1-2",
          completed: false
        },
        {
          id: "w2",
          title: "שליטה במהירות",
          description: "2 אימוני ספרינט עם כדור ואימון אחד של תרגילי כדרור",
          weeks: "3-4",
          completed: false
        },
        {
          id: "w3",
          title: "דריבל תחת לחץ",
          description: "אימוני 1 על 1 ותרגול במצבי לחץ מול שחקן מגן",
          weeks: "5-6",
          completed: false
        }
      ],
      dailyRoutine: [
        "10 דקות תרגול כדרור במקום",
        "5 דקות תרגול שינויי כיוון",
        "15 דקות משחק עם הכדור ברגל חלשה"
      ]
    }
    // ניתן להוסיף תוכניות נוספות לקטגוריות אחרות
  };

  return plans[categoryId] || plans.dribbling;
};

const ActionPlan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { categoryId, answers } = location.state || {};
  const [tasks, setTasks] = useState<Task[]>(getActionPlan(categoryId, answers).weeklyTasks);

  const actionPlan = getActionPlan(categoryId, answers);
  const progress = (tasks.filter(task => task.completed).length / tasks.length) * 100;

  const toggleTask = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-6 space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-center text-gray-900">
                תוכנית הפעולה האישית שלך
              </h1>
              
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  <span className="font-medium">{actionPlan.duration} ימים</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="font-medium">{actionPlan.category}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">מדדי הצלחה</h2>
              <ul className="space-y-2">
                {actionPlan.successMetrics.map((metric, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>{metric}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">משימות שבועיות</h2>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">התקדמות</span>
                </div>
              </div>
              
              <Progress value={progress} className="h-2 mb-4" />

              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card key={task.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                      />
                      <div className="space-y-1">
                        <div className="font-semibold">{task.title}</div>
                        <div className="text-sm text-gray-600">{task.description}</div>
                        <div className="text-sm text-gray-500">שבועות {task.weeks}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">שגרה יומית מומלצת</h2>
              <ul className="space-y-2">
                {actionPlan.dailyRoutine.map((routine, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>{routine}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ActionPlan;
