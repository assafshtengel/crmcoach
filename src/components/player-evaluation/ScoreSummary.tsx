
import React, { useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { categories } from '@/types/playerEvaluation';
import { Brain, Dumbbell, Trophy, ChevronDown, ChevronUp, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface ScoreSummaryProps {
  scores: Record<string, number>;
  playerName: string;
  team: string;
  date: string;
  categoryAverages: Record<string, number>;
  totalScore: number;
}

interface CategoryScore {
  name: string;
  score: number;
  type: 'mental' | 'physical' | 'professional';
  id: string;
}

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

  const getFeedbackLevel = (score: number): 'high' | 'medium' | 'low' => {
    if (score >= 8) return 'high';
    if (score >= 6) return 'medium';
    return 'low';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">סיכום הערכת שחקן</h2>
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" />
          שמור כתמונה
        </Button>
      </div>

      <div ref={summaryRef} className="space-y-6 bg-white p-8 rounded-lg">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-gray-600">שם השחקן</p>
            <p className="font-medium">{playerName}</p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">קבוצה</p>
            <p className="font-medium">{team}</p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">תאריך הערכה</p>
            <p className="font-medium">{new Date(date).toLocaleDateString('he-IL')}</p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">ציון כולל</p>
            <p className={`font-bold text-2xl ${getScoreColor(totalScore)}`}>
              {totalScore.toFixed(1)}
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {['mental', 'physical', 'professional'].map((type) => (
            <motion.div 
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                {getCategoryIcon(type as 'mental' | 'physical' | 'professional')}
                <h4 className="font-semibold">
                  {type === 'mental' && 'יכולות מנטליות'}
                  {type === 'physical' && 'יכולות גופניות'}
                  {type === 'professional' && 'יכולות מקצועיות'}
                </h4>
              </div>
              
              <div className="space-y-4">
                {categories
                  .filter(cat => cat.type === type)
                  .map(cat => (
                    <Collapsible key={cat.id}>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{cat.name}</span>
                          <span className={`font-bold ${getScoreColor(categoryAverages[cat.id] || 0)}`}>
                            {(categoryAverages[cat.id] || 0).toFixed(1)}
                          </span>
                        </div>
                        <Progress 
                          value={(categoryAverages[cat.id] || 0) * 10} 
                          className="h-2"
                          style={{ 
                            backgroundColor: '#f3f4f6',
                            '--progress-background': getScoreColor(categoryAverages[cat.id] || 0)
                          } as React.CSSProperties}
                        />
                        <CollapsibleTrigger className="w-full flex items-center justify-between pt-2 text-sm text-gray-600 hover:text-gray-900">
                          <span>הצג פירוט שאלות ותשובות</span>
                          <ChevronDown className="w-4 h-4" />
                        </CollapsibleTrigger>
                      </div>
                      
                      <CollapsibleContent className="pt-2">
                        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                          {cat.questions.map((question, idx) => {
                            const score = scores[question.id] || 0;
                            const selectedOption = question.options.find(opt => opt.score === score);
                            return (
                              <div key={idx} className="space-y-1">
                                <p className="font-medium">{question.text}</p>
                                <p className="text-sm text-gray-600">
                                  תשובה: {selectedOption?.text || 'לא נענה'}
                                  <span className={`mr-2 font-medium ${getScoreColor(score)}`}>
                                    ({score}/10)
                                  </span>
                                </p>
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
