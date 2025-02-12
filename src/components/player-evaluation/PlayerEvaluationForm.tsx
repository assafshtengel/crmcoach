
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
    const totalQuestions = shuffledQuestions.length;
    const answeredQuestions = Object.keys(formData.scores).length;
    
    if (answeredQuestions < totalQuestions) {
      toast({
        title: "לא ניתן לשמור",
        description: "יש לענות על כל השאלות",
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

      // חישוב ממוצעים לפי קטגוריות
      const categoryAverages: Record<string, number> = {};
      let totalScore = 0;
      let categoriesCount = 0;

      categories.forEach(category => {
        const categoryScores = category.questions
          .map(q => formData.scores[q.id])
          .filter(score => score !== undefined);

        if (categoryScores.length > 0) {
          const average = categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length;
          categoryAverages[category.id] = parseFloat(average.toFixed(2));
          totalScore += average;
          categoriesCount++;
        }
      });

      const finalTotalScore = parseFloat((totalScore / categoriesCount).toFixed(2));

      const { error } = await supabase.from('player_evaluations').insert({
        player_name: formData.playerName,
        age: parseInt(formData.age),
        team: formData.team,
        evaluation_date: formData.date,
        scores: formData.scores,
        category_averages: categoryAverages,
        total_score: finalTotalScore,
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
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-center mb-6">ברוך הבא לשאלון חקירת האלמנטים – הדרך שלך לשיפור אישי בכדורגל! ⚽💪</h2>
              <p className="mb-6">היי {formData.playerName},</p>
              <p className="mb-4">כאן לא מחפשים לתת לך ציונים כמו בבית הספר, ולא בודקים אותך כדי להעיר לך על דברים שאתה עושה לא טוב.</p>
              <p className="mb-6">המטרה של השאלון הזה היא לעזור לך להבין בדיוק איפה אתה עומד היום – מה החוזקות שלך ומה הנקודות שאתה יכול לשפר כדי להפוך לשחקן טוב יותר.</p>
              
              <h3 className="text-xl font-semibold mb-4">🔍 איך זה עובד?</h3>
              <ul className="list-disc list-inside mb-6">
                <li>יש 11 אלמנטים חשובים שכל שחקן כדורגל צריך להיות חזק בהם.</li>
                <li>לכל אלמנט יש 4 שאלות – תענה עליהן בכנות.</li>
                <li>לכל תשובה יש ניקוד מ-1 עד 10.</li>
                <li>בתום השאלון תקבל דוח אישי עם הציונים שלך והמלצות איך להשתפר.</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4">🛑 רגע לפני שמתחילים – חשוב לזכור!</h3>
              <ul className="list-none space-y-2 mb-6">
                <li className="flex items-center">✅ זה לא מבחן ואין פה תשובות "נכונות" או "לא נכונות".</li>
                <li className="flex items-center">✅ מילוי האמת בלבד יעזור לך באמת להשתפר!</li>
                <li className="flex items-center">✅ אנחנו לא פה כדי לשפוט אותך, אלא כדי לעזור לך.</li>
                <li className="flex items-center">✅ אם יש לך ציונים גבוהים בתחום מסוים – מעולה!</li>
                <li className="flex items-center">✅ אם יש תחום שקיבלת בו ניקוד נמוך – זה סימן טוב, כי עכשיו אתה יודע בדיוק על מה לעבוד!</li>
              </ul>

              <p className="text-center font-bold mb-6">🎯 אז אם המטרה שלך היא להפוך לשחקן טוב יותר – פשוט תהיה אמיתי עם עצמך, תענה בכנות, ותן לדוח להראות לך את הדרך קדימה.</p>
              
              <p className="text-center text-xl font-bold">💪 מוכן? לחץ על "המשך" ותתחיל! 🚀</p>
            </div>
          </div>
        );
      case 3:
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
            שלב {step} מתוך 3
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
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !isPersonalInfoComplete()}
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
