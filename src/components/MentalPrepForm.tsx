import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { questions } from '@/constants/mentalPrepConstants';
import { FormData } from '@/types/mentalPrep';
import { PersonalInfoStep } from './mental-prep/PersonalInfoStep';
import { GameDetailsStep } from './mental-prep/GameDetailsStep';
import { MentalStatesStep } from './mental-prep/MentalStatesStep';
import { GameGoalsStep } from './mental-prep/GameGoalsStep';
import { QuestionsStep } from './mental-prep/QuestionsStep';

export const MentalPrepForm = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    matchDate: '',
    opposingTeam: '',
    gameType: '',
    selectedStates: [],
    selectedGoals: [],
    answers: {},
  });

  const [selectedQuestions] = useState(() => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
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
      const emailData = {
        to: 'socr.co.il@gmail.com',
        subject: `דוח הכנה מנטלית - ${formData.fullName}`,
        body: JSON.stringify(formData, null, 2),
      };

      toast({
        title: "הדוח נשלח בהצלחה!",
        description: "הדוח נשלח למייל ונשמר במכשיר שלך.",
      });

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
        return <PersonalInfoStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <GameDetailsStep formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <MentalStatesStep formData={formData} handleStateSelection={handleStateSelection} />;
      case 4:
        return <GameGoalsStep formData={formData} updateFormData={updateFormData} />;
      case 5:
        return (
          <QuestionsStep
            formData={formData}
            selectedQuestions={selectedQuestions}
            updateFormData={updateFormData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <div className="space-y-6">
        {renderStep()}
        <div className="flex justify-between mt-6">
          {step > 1 && (
            <Button onClick={() => setStep(step - 1)} variant="outline">
              הקודם
            </Button>
          )}
          {step < 5 ? (
            <Button onClick={() => setStep(step + 1)} className="mr-auto">
              הבא
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="mr-auto">
              שלח
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
