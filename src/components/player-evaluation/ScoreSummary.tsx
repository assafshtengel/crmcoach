
import React, { useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { categories } from '@/types/playerEvaluation';
import { Brain, Dumbbell, Trophy, ChevronDown, ChevronUp, Printer, Award, Clock, User, Users } from 'lucide-react';
import html2canvas from 'html2canvas';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import type { CategoryAverage } from '@/types/evaluation/interfaces';

interface ScoreSummaryProps {
  scores: Record<string, number>;
  playerName: string;
  team: string;
  date: string;
  categoryAverages: Record<string, number>;
  totalScore: number;
}

const getFeedbackForCategory = (categoryId: string, score: number): CategoryAverage['feedback'] => {
  const feedbacks: Record<string, CategoryAverage['feedback']> = {
    'pressure': {
      strengths: score >= 8 ? ['יכולת מצוינת להתמודד עם לחץ', 'שליטה עצמית גבוהה במצבים מאתגרים'] : [],
      improvements: score >= 6 && score < 8 ? ['שיפור היכולת לקבל החלטות תחת לחץ', 'עבודה על מיקוד במשחק'] : [],
      recommendations: score < 6 ? ['תרגול סיטואציות לחץ באימונים', 'עבודה עם פסיכולוג ספורט'] : []
    },
    'motivation': {
      strengths: score >= 8 ? ['מוטיבציה גבוהה מאוד', 'יכולת התאוששות מעולה מכישלונות'] : [],
      improvements: score >= 6 && score < 8 ? ['חיזוק היכולת להתמודד עם אתגרים', 'שיפור העקביות במוטיבציה'] : [],
      recommendations: score < 6 ? ['הצבת יעדים קצרי טווח', 'עבודה על חשיבה חיובית'] : []
    },
    // ... המשך ההגדרות לכל הקטגוריות
  };
  
  return feedbacks[categoryId] || {
    strengths: [],
    improvements: [],
    recommendations: []
  };
};

const getFeedbackSection = (feedback: CategoryAverage['feedback']) => {
  if (feedback.strengths.length > 0) {
    return (
      <div className="mt-2 space-y-1">
        {feedback.strengths.map((strength, idx) => (
          <p key={idx} className="text-green-600 text-sm">✓ {strength}</p>
        ))}
      </div>
    );
  }
  if (feedback.improvements.length > 0) {
    return (
      <div className="mt-2 space-y-1">
        {feedback.improvements.map((improvement, idx) => (
          <p key={idx} className="text-orange-600 text-sm">⚡ {improvement}</p>
        ))}
      </div>
    );
  }
  if (feedback.recommendations.length > 0) {
    return (
      <div className="mt-2 space-y-1">
        {feedback.recommendations.map((recommendation, idx) => (
          <p key={idx} className="text-red-600 text-sm">↗ {recommendation}</p>
        ))}
      </div>
    );
  }
  return null;
};

export const ScoreSummary = ({ 
  scores, 
  playerName, 
  team, 
  date,
  categoryAverages,
  totalScore
}: ScoreSummaryProps) => {
  const { toast } = useToast();
  const summaryRef = useRef<HTMLDivElement>(null);

  const handlePrint = async () => {
    if (summaryRef.current) {
      try {
        const canvas = await html2canvas(summaryRef.current, {
          scale: 2,
          logging: false,
          useCORS: true
        });
        
        const image = canvas.toDataURL("image/png", 1.0);
        const link = document.createElement('a');
        link.download = `הערכת_שחקן_${playerName}_${new Date().toLocaleDateString('he-IL')}.png`;
        link.href = image;
        link.click();
        
        toast({
          title: "הדוח נשמר בהצלחה",
          description: "הדוח נשמר כתמונה במחשב שלך",
        });
      } catch (error) {
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בשמירת הדוח",
          variant: "destructive",
        });
      }
    }
  };

  const getCategoryIcon = (type: 'mental' | 'physical' | 'professional') => {
    switch (type) {
      case 'mental':
        return <Brain className="w-5 h-5" />;
      case 'physical':
        return <Dumbbell className="w-5 h-5" />;
      case 'professional':
        return <Trophy className="w-5 h-5" />;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'text-purple-600';
    if (score >= 6) return 'text-orange-500';
    return 'text-red-500';
  };

  const getOverallFeedback = (score: number): string => {
    if (score >= 8) {
      return "מצוין! אתה מציג יכולות גבוהות במרבית התחומים. המשך לעבוד על שימור ושיפור היכולות שלך.";
    } else if (score >= 6) {
      return "טוב! יש לך בסיס חזק עם מספר תחומים לשיפור. התמקד בחיזוק הנקודות החלשות תוך שמירה על החוזקות.";
    }
    return "יש מקום לשיפור משמעותי. מומלץ לעבוד באופן מובנה על כל אחד מהתחומים שקיבלו ציון נמוך.";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          סיכום הערכת שחקן
        </h2>
        <Button 
          onClick={handlePrint} 
          className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-all duration-300"
        >
          <Printer className="w-4 h-4" />
          שמור כתמונה
        </Button>
      </motion.div>

      <div ref={summaryRef} className="space-y-8 bg-gradient-to-b from-white to-gray-50 p-8 rounded-xl shadow-xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 border-2 border-primary/20 bg-gradient-to-br from-white to-primary/5">
            <div className="flex items-center gap-6 mb-6">
              <div className="p-4 rounded-full bg-primary/10">
                <Award className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">הערכה כללית</h3>
                <p className={`text-4xl font-bold ${getScoreColor(totalScore)}`}>
                  {totalScore.toFixed(1)}
                </p>
              </div>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              {getOverallFeedback(totalScore)}
            </p>
          </Card>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 bg-white/50 p-6 rounded-xl border border-gray-100">
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-5 h-5" />
              <p>שם השחקן</p>
            </div>
            <p className="font-medium text-lg">{playerName}</p>
          </motion.div>
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-5 h-5" />
              <p>קבוצה</p>
            </div>
            <p className="font-medium text-lg">{team}</p>
          </motion.div>
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <p>תאריך הערכה</p>
            </div>
            <p className="font-medium text-lg">{new Date(date).toLocaleDateString('he-IL')}</p>
          </motion.div>
        </div>

        <div className="grid gap-8">
          {['mental', 'physical', 'professional'].map((type, typeIndex) => (
            <motion.div 
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: typeIndex * 0.2 }}
              className="space-y-6 bg-white p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  {getCategoryIcon(type as 'mental' | 'physical' | 'professional')}
                </div>
                <h4 className="text-xl font-bold">
                  {type === 'mental' && 'יכולות מנטליות'}
                  {type === 'physical' && 'יכולות גופניות'}
                  {type === 'professional' && 'יכולות מקצועיות'}
                </h4>
              </div>
              
              <div className="space-y-6">
                {categories
                  .filter(cat => cat.type === type)
                  .map(cat => (
                    <Collapsible key={cat.id}>
                      <div className="space-y-4 bg-gray-50 p-4 rounded-lg hover:bg-gray-50/80 transition-colors duration-200">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-lg">{cat.name}</span>
                          <span className={`font-bold text-xl ${getScoreColor(categoryAverages[cat.id] || 0)}`}>
                            {(categoryAverages[cat.id] || 0).toFixed(1)}
                          </span>
                        </div>
                        <Progress 
                          value={(categoryAverages[cat.id] || 0) * 10} 
                          className="h-3 rounded-full"
                          style={{ 
                            backgroundColor: '#f3f4f6',
                            '--progress-background': getScoreColor(categoryAverages[cat.id] || 0)
                          } as React.CSSProperties}
                        />
                        {getFeedbackSection(getFeedbackForCategory(cat.id, categoryAverages[cat.id] || 0))}
                        <CollapsibleTrigger className="w-full flex items-center justify-between pt-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200">
                          <span className="font-medium">הצג פירוט שאלות ותשובות</span>
                          <ChevronDown className="w-4 h-4" />
                        </CollapsibleTrigger>
                      </div>
                      
                      <CollapsibleContent className="pt-4">
                        <div className="bg-white p-6 rounded-lg space-y-6 shadow-inner">
                          {cat.questions.map((question, idx) => {
                            const score = scores[question.id] || 0;
                            const selectedOption = question.options.find(opt => opt.score === score);
                            return (
                              <div key={idx} className="space-y-2 pb-4 border-b last:border-0">
                                <p className="font-medium text-gray-800">{question.text}</p>
                                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                  <p className="text-sm text-gray-600">
                                    תשובה: {selectedOption?.text || 'לא נענה'}
                                  </p>
                                  <span className={`font-medium ${getScoreColor(score)} px-3 py-1 rounded-full bg-gray-100`}>
                                    {score}/10
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
