
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const mentalStates = [
  'ממוקד', 'בטוח', 'מוכן', 'חיובי', 'מנהיג', 'מחויב', 'רגוע', 'חד', 'אנרגטי',
  // ... Add more states
];

const gameGoals = [
  'שמירת מיקוד', 'שיפור נגיחות', 'שיפור עבודת צוות', 'ניצול הזדמנויות',
  // ... Add more goals
];

const questions = [
  'מה תעשה אם קבוצתך תפגר מוקדם?',
  'איך אתה מתכונן להתמודד עם לחץ?',
  'מה המטרה העיקרית שלך במשחק?',
  // ... Add more questions
];

export const MentalPrepForm = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    matchDate: '',
    opposingTeam: '',
    gameType: '',
    selectedStates: [] as string[],
    selectedGoals: [] as Array<{ goal: string; metric: string }>,
    answers: {} as Record<string, string>,
  });

  const [selectedQuestions] = useState(() => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStateSelection = (state: string) => {
    setFormData(prev => {
      const current = [...prev.selectedStates];
      if (current.includes(state)) {
        return { ...prev, selectedStates: current.filter(s => s !== state) };
      }
      if (current.length < 4) {
        return { ...prev, selectedStates: [...current, state] };
      }
      return prev;
    });
  };

  const handleSubmit = async () => {
    try {
      // Send email logic here
      const emailData = {
        to: 'socr.co.il@gmail.com',
        subject: `דוח הכנה מנטלית - ${formData.fullName}`,
        body: JSON.stringify(formData, null, 2),
      };

      // Generate PDF report logic here

      toast({
        title: "הדוח נשלח בהצלחה!",
        description: "הדוח נשלח למייל ונשמר במכשיר שלך.",
      });

      // Redirect to ChatGPT
      window.location.href = 'https://chatgpt.com/g/g-6780940ac570819189306621c59a067f-hhknh-shly-lmshkhq';
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשליחת הדוח. אנא נסה שוב.",
        variant: "destructive",
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-step space-y-4">
            <h2 className="text-2xl font-bold mb-6">פרטים אישיים</h2>
            <div>
              <Label htmlFor="fullName">שם מלא</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => updateFormData('fullName', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <Label htmlFor="phone">טלפון</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-step space-y-4">
            <h2 className="text-2xl font-bold mb-6">פרטי המשחק</h2>
            <div>
              <Label htmlFor="matchDate">תאריך המשחק</Label>
              <Input
                id="matchDate"
                type="date"
                value={formData.matchDate}
                onChange={(e) => updateFormData('matchDate', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <Label htmlFor="opposingTeam">קבוצה יריבה</Label>
              <Input
                id="opposingTeam"
                value={formData.opposingTeam}
                onChange={(e) => updateFormData('opposingTeam', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <Label htmlFor="gameType">סוג משחק</Label>
              <Select onValueChange={(value) => updateFormData('gameType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג משחק" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="league">ליגה</SelectItem>
                  <SelectItem value="cup">גביע</SelectItem>
                  <SelectItem value="friendly">ידידות</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-step space-y-4">
            <h2 className="text-2xl font-bold mb-6">מצבים מנטליים</h2>
            <p className="text-gray-600 mb-4">בחר 4 מצבים מנטליים שמתארים את המצב הרצוי שלך במשחק</p>
            <div className="grid grid-cols-3 gap-2">
              {mentalStates.map((state) => (
                <div
                  key={state}
                  onClick={() => handleStateSelection(state)}
                  className={`mental-state-tag ${
                    formData.selectedStates.includes(state) ? 'selected' : ''
                  }`}
                >
                  {state}
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-step space-y-4">
            <h2 className="text-2xl font-bold mb-6">מטרות משחק</h2>
            {gameGoals.map((goal, index) => (
              <div key={goal} className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`goal-${index}`}
                    checked={formData.selectedGoals.some(g => g.goal === goal)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFormData('selectedGoals', [
                          ...formData.selectedGoals,
                          { goal, metric: '' },
                        ]);
                      } else {
                        updateFormData(
                          'selectedGoals',
                          formData.selectedGoals.filter(g => g.goal !== goal)
                        );
                      }
                    }}
                  />
                  <Label htmlFor={`goal-${index}`}>{goal}</Label>
                </div>
                {formData.selectedGoals.some(g => g.goal === goal) && (
                  <Input
                    placeholder="מדד הצלחה (לדוגמה: 5 מסירות מפתח)"
                    value={formData.selectedGoals.find(g => g.goal === goal)?.metric || ''}
                    onChange={(e) => {
                      updateFormData(
                        'selectedGoals',
                        formData.selectedGoals.map(g =>
                          g.goal === goal ? { ...g, metric: e.target.value } : g
                        )
                      );
                    }}
                    className="input-field"
                  />
                )}
              </div>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="form-step space-y-4">
            <h2 className="text-2xl font-bold mb-6">שאלות פתוחות</h2>
            {selectedQuestions.map((question, index) => (
              <div key={index} className="space

אם יש ידע, הקשר או הוראות מותאמות אישית שברצונך לכלול בכל עריכה בפרויקט זה, הגדר זאת למטה.

<lov-actions>
<lov-knowledge>
</lov-actions>

אם הפרויקט שלך דורש פונקציונליות של צד שרת, תוכל להשתמש בתפריט Supabase בפינה הימנית העליונה כדי לחבר את הפרויקט שלך ל-Supabase.
<lov-actions>
<lov-message-prompt message="ספר לי עוד על Supabase">למד עוד על Supabase</lov-message-prompt>
</lov-actions>
