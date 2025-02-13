
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CalendarDays, 
  Target, 
  Clock, 
  Download, 
  Printer,
  TrendingUp,
  Brain,
  Target as TargetIcon,
  Timer,
  BarChart
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

const generateActionPlan = (categoryId: string = '', answers: any = {}): ActionPlanData => {
  const specificGoal = answers?.specificGoal || 'שיפור יכולות כדורגל';
  const successMetric = answers?.successMetric || 'שיפור ביצועים ב-20%';
  const timeframe = answers?.timeframe || '30';
  const mainChallenge = answers?.mainChallenge || 'קושי טכני';

  const duration = parseInt(timeframe);
  const weeks = duration / 7;
  const weekPairs = Math.ceil(weeks / 2);

  const generateProgressiveTasks = (): Task[] => {
    const tasks: Task[] = [];
    const basicWeeks = Math.floor(weekPairs / 3);
    
    tasks.push({
      id: "w1",
      title: "שלב ראשון - בניית בסיס",
      description: `תרגול ממוקד להתמודדות עם ${mainChallenge} - 3 אימונים בשבוע של 30 דקות`,
      weeks: `1-${basicWeeks * 2}`,
      completed: false
    });

    tasks.push({
      id: "w2",
      title: "שלב שני - העלאת רמה",
      description: `תרגול מתקדם של ${specificGoal} עם דגש על ${successMetric}`,
      weeks: `${basicWeeks * 2 + 1}-${basicWeeks * 4}`,
      completed: false
    });

    tasks.push({
      id: "w3",
      title: "שלב שלישי - יישום במשחק",
      description: "תרגול במצבי משחק אמיתיים ותחת לחץ",
      weeks: `${basicWeeks * 4 + 1}-${weeks}`,
      completed: false
    });

    return tasks;
  };

  const generateDailyRoutine = (): string[] => {
    const routines = [
      `10 דקות תרגול ${specificGoal}`,
      `15 דקות עבודה על ${mainChallenge}`,
      "5 דקות מתיחות וחימום ממוקד"
    ];
    return routines;
  };

  const generateSuccessMetrics = (): string[] => {
    return [
      successMetric, // המדד העיקרי שהשחקן הגדיר
      `שיפור ב-20% בהתמודדות עם ${mainChallenge}`,
      "הצלחה ביישום במשחקים רשמיים"
    ];
  };

  return {
    title: specificGoal,
    duration: duration,
    category: categoryId || 'כללי',
    successMetrics: generateSuccessMetrics(),
    weeklyTasks: generateProgressiveTasks(),
    dailyRoutine: generateDailyRoutine()
  };
};

const ActionPlan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { categoryId, answers } = location.state || {};
  const [actionPlan] = useState<ActionPlanData>(() => generateActionPlan(categoryId, answers));
  const [tasks, setTasks] = useState<Task[]>(actionPlan.weeklyTasks);

  const progress = (tasks.filter(task => task.completed).length / tasks.length) * 100;

  // העברנו את הגדרת metricProgress לתוך הקומפוננטה
  const metricsData = [
    { 
      progress: 40, 
      color: "bg-blue-500", 
      textColor: "text-blue-700", 
      icon: TrendingUp,
      indicatorColor: "bg-blue-500" 
    },
    { 
      progress: 65, 
      color: "bg-green-500", 
      textColor: "text-green-700", 
      icon: Timer,
      indicatorColor: "bg-green-500"
    },
    { 
      progress: 30, 
      color: "bg-yellow-500", 
      textColor: "text-yellow-700", 
      icon: Brain,
      indicatorColor: "bg-yellow-500"
    },
    { 
      progress: 85, 
      color: "bg-purple-500", 
      textColor: "text-purple-700", 
      icon: TargetIcon,
      indicatorColor: "bg-purple-500"
    }
  ];

  const toggleTask = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDownload = async () => {
    const element = document.getElementById("action-plan-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("תוכנית-פעולה.pdf");

      toast({
        title: "התוכנית הורדה בהצלחה",
        description: "תוכל למצוא את הקובץ בתיקיית ההורדות שלך",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "שגיאה בהורדת התוכנית",
        description: "אנא נסה שנית",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-end gap-2 print:hidden">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            הדפסה
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            הורדה
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card id="action-plan-content" className="p-6 space-y-6">
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
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BarChart className="w-6 h-6 text-primary" />
                מדדי הצלחה
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {actionPlan.successMetrics.map((metric, index) => {
                  const { progress: metricProgressValue, color, textColor, icon: Icon, indicatorColor } = metricsData[index];
                  return (
                    <Card key={index} className="p-4 transition-all hover:shadow-lg">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
                            <Icon className={`w-5 h-5 ${textColor}`} />
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${textColor}`}>{metric}</p>
                            <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                              <span>{metricProgressValue}% הושלם</span>
                              <span>{Math.round(actionPlan.duration * metricProgressValue / 100)}/{actionPlan.duration} ימים</span>
                            </div>
                          </div>
                        </div>
                        <Progress 
                          value={metricProgressValue} 
                          className={`h-2 [&>[role=progressbar]]:${indicatorColor}`}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
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
