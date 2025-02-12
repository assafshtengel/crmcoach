import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain, Dumbbell, Trophy } from 'lucide-react';
import { categories } from '@/types/playerEvaluation';
import type { EvaluationFormData } from '@/types/playerEvaluation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { CategorySection } from './CategorySection';
import { ScoreSummary } from './ScoreSummary';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export const PlayerEvaluationForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<EvaluationFormData>({
    playerName: '',
    age: '',
    team: '',
    date: new Date().toISOString().split('T')[0],
    scores: {}
  });

  const updateFormData = (field: keyof EvaluationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateScore = (questionId: string, score: number) => {
    setFormData(prev => ({
      ...prev,
      scores: { ...prev.scores, [questionId]: score }
    }));
  };

  const isPersonalInfoComplete = () => {
    return formData.playerName && formData.age && formData.team && formData.date;
  };

  const hasMinimumScores = () => {
    const totalQuestions = categories.reduce((acc, cat) => acc + cat.questions.length, 0);
    const answeredQuestions = Object.keys(formData.scores).length;
    return answeredQuestions >= totalQuestions * 0.8; // 80% של השאלות חייבות להיות מענות
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
        return (
          <div className="space-y-6">
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-8">
                <section className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">יכולות מנטליות</h3>
                  </div>
                  {categories
                    .filter(cat => cat.type === 'mental')
                    .map(category => (
                      <CategorySection
                        key={category.id}
                        category={category}
                        scores={formData.scores}
                        updateScore={updateScore}
                      />
                    ))}
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">יכולות גופניות</h3>
                  </div>
                  {categories
                    .filter(cat => cat.type === 'physical')
                    .map(category => (
                      <CategorySection
                        key={category.id}
                        category={category}
                        scores={formData.scores}
                        updateScore={updateScore}
                      />
                    ))}
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">יכולות מקצועיות</h3>
                  </div>
                  {categories
                    .filter(cat => cat.type === 'professional')
                    .map(category => (
                      <CategorySection
                        key={category.id}
                        category={category}
                        scores={formData.scores}
                        updateScore={updateScore}
                      />
                    ))}
                </section>
              </div>
            </ScrollArea>
            
            <div className="pt-6 border-t">
              <ScoreSummary scores={formData.scores} />
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
            >
              שלח הערכה
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
