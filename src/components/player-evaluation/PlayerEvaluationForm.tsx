
import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { categories } from '@/types/playerEvaluation';
import type { EvaluationFormData } from '@/types/playerEvaluation';
import { useToast } from '@/hooks/use-toast';
import { CategorySection } from './CategorySection';
import { ScoreSummary } from './ScoreSummary';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PlayerEvaluationForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [formData, setFormData] = useState<EvaluationFormData>({
    playerName: '',
    age: '',
    team: '',
    date: new Date().toISOString().split('T')[0],
    scores: {}
  });

  // ערבוב כל השאלות מכל הקטגוריות
  const shuffledQuestions = useMemo(() => {
    const allQuestions = categories.flatMap(category => 
      category.questions.map(question => ({
        ...question,
        categoryId: category.id
      }))
    );
    
    // פישר-ייטס ערבוב
    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }
    
    return allQuestions;
  }, []);

  const updateFormData = (field: keyof EvaluationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateScore = (questionId: string, score: number) => {
    setFormData(prev => ({
      ...prev,
      scores: { ...prev.scores, [questionId]: score }
    }));
    
    // מעבר אוטומטי לשאלה הבאה אחרי בחירת תשובה
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300);
    }
  };

  const isPersonalInfoComplete = () => {
    return formData.playerName && formData.age && formData.team && formData.date;
  };

  const hasMinimumScores = () => {
    const totalQuestions = shuffledQuestions.length;
    const answeredQuestions = Object.keys(formData.scores).length;
    return answeredQuestions >= totalQuestions * 0.8;
  };

  const handleSubmit = async () => {
    if (!hasMinimumScores()) {
      toast({
        title: "לא ניתן לשמור",
        description: "יש לענות על לפחות 80% מהשאלות",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "שגיאה",
          description: "יש להתחבר למערכת כדי לשמור הערכת שחקן",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      const { error } = await supabase.from('player_evaluations').insert({
        player_name: formData.playerName,
        age: parseInt(formData.age),
        team: formData.team,
        evaluation_date: formData.date,
        scores: formData.scores,
        user_id: session.user.id
      });

      if (error) throw error;

      toast({
        title: "ההערכה נשמרה בהצלחה!",
        description: "הנתונים נשמרו במערכת",
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת ההערכה",
        variant: "destructive",
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="playerName">שם השחקן</Label>
                <Input
                  id="playerName"
                  value={formData.playerName}
                  onChange={(e) => updateFormData('playerName', e.target.value)}
                  placeholder="הכנס את שם השחקן"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">גיל</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateFormData('age', e.target.value)}
                  placeholder="הכנס את גיל השחקן"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team">קבוצה</Label>
                <Input
                  id="team"
                  value={formData.team}
                  onChange={(e) => updateFormData('team', e.target.value)}
                  placeholder="הכנס את שם הקבוצה"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">תאריך הערכה</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateFormData('date', e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 2:
        const currentQuestion = shuffledQuestions[currentQuestionIndex];
        const currentCategory = categories.find(cat => cat.id === currentQuestion.categoryId);
        
        if (!currentCategory) return null;

        return (
          <div className="space-y-6">
            <CategorySection
              category={{
                ...currentCategory,
                questions: [currentQuestion]
              }}
              scores={formData.scores}
              updateScore={updateScore}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={shuffledQuestions.length}
            />
            
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronRight className="ml-2 h-4 w-4" />
                שאלה קודמת
              </Button>
              <Button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(shuffledQuestions.length - 1, prev + 1))}
                disabled={currentQuestionIndex === shuffledQuestions.length - 1}
              >
                שאלה הבאה
                <ChevronLeft className="mr-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h1 className="text-2xl font-bold">טופס הערכת שחקן</h1>
          <div className="text-sm text-gray-500">
            שלב {step} מתוך 2
          </div>
        </div>

        {renderStep()}

        <div className="flex justify-between pt-4 border-t">
          {step > 1 && (
            <Button
              onClick={() => setStep(step - 1)}
              variant="outline"
            >
              חזור
            </Button>
          )}
          {step < 2 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!isPersonalInfoComplete()}
              className="mr-auto"
            >
              המשך
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="mr-auto"
              disabled={!hasMinimumScores()}
            >
              שלח הערכה
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
