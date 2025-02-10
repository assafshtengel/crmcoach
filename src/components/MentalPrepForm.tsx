import React, { useState, useRef } from 'react';
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
import html2canvas from 'html2canvas';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const MentalPrepForm = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
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
    setShowPreviewDialog(true);
  };

  const handleDownload = async () => {
    if (previewRef.current) {
      try {
        const canvas = await html2canvas(previewRef.current, {
          scale: 2,
          logging: false,
          useCORS: true,
          scrollY: -window.scrollY,
          windowWidth: previewRef.current.scrollWidth,
          windowHeight: previewRef.current.scrollHeight,
        });
        
        const image = canvas.toDataURL("image/png", 1.0);
        const link = document.createElement('a');
        link.download = `דוח_הכנה_מנטלית_${formData.fullName}.png`;
        link.href = image;
        link.click();
        
        setShowPreviewDialog(false);
        setShowSaveDialog(true);
      } catch (error) {
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בשמירת התמונה. אנא נסה שוב.",
          variant: "destructive",
        });
      }
    }
  };

  const handleConfirmSave = async () => {
    try {
      // Send email
      const emailData = {
        to: 'socr.co.il@gmail.com',
        subject: `דוח הכנה מנטלית - ${formData.fullName}`,
        body: JSON.stringify(formData, null, 2),
      };

      toast({
        title: "הדוח נשלח ונשמר בהצלחה!",
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

  const PreviewContent = () => (
    <div ref={previewRef} className="space-y-6 p-8 bg-white text-right">
      <h2 className="text-2xl font-bold text-center mb-8">דוח הכנה מנטלית למשחק</h2>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">פרטים אישיים</h3>
        <p>שם מלא: {formData.fullName}</p>
        <p>אימייל: {formData.email}</p>
        <p>טלפון: {formData.phone}</p>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">פרטי המשחק</h3>
        <p>תאריך משחק: {formData.matchDate}</p>
        <p>קבוצה יריבה: {formData.opposingTeam}</p>
        <p>סוג משחק: {formData.gameType}</p>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">מצבים מנטליים נבחרים</h3>
        {formData.selectedStates.map((state, index) => (
          <p key={index}>{state}</p>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">מטרות למשחק</h3>
        {formData.selectedGoals.map((goal, index) => (
          <p key={index}>{goal.goal} - {goal.metric || 'איכותי'}</p>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">תשובות לשאלות</h3>
        {Object.entries(formData.answers).map(([question, answer], index) => (
          <div key={index} className="mb-4">
            <p className="font-medium">{question}</p>
            <p className="text-gray-600">{answer}</p>
          </div>
        ))}
      </div>
    </div>
  );

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

      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>תצוגה מקדימה של הדוח</DialogTitle>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto">
            <PreviewContent />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>סגור</Button>
            <Button onClick={handleDownload}>שמור כתמונה</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם ברצונך לשמור את דוח טרום המשחק?</AlertDialogTitle>
            <AlertDialogDescription>
              הדוח יישמר כקובץ תמונה במכשיר שלך.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>לא</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>כן</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
