
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
import jsPDF from 'jspdf';

export const MentalPrepForm = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
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

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setR2L(true);

    // Add title
    doc.setFontSize(20);
    doc.text("דוח הכנה מנטלית למשחק", 105, 20, { align: 'center' });

    // Add player details
    doc.setFontSize(12);
    doc.text(`שם מלא: ${formData.fullName}`, 180, 40, { align: 'right' });
    doc.text(`אימייל: ${formData.email}`, 180, 50, { align: 'right' });
    doc.text(`טלפון: ${formData.phone}`, 180, 60, { align: 'right' });
    doc.text(`תאריך משחק: ${formData.matchDate}`, 180, 70, { align: 'right' });
    doc.text(`קבוצה יריבה: ${formData.opposingTeam}`, 180, 80, { align: 'right' });
    doc.text(`סוג משחק: ${formData.gameType}`, 180, 90, { align: 'right' });

    // Add mental states
    doc.text("מצבים מנטליים נבחרים:", 180, 110, { align: 'right' });
    formData.selectedStates.forEach((state, index) => {
      doc.text(`${state}`, 180, 120 + (index * 10), { align: 'right' });
    });

    // Add goals
    doc.text("מטרות למשחק:", 180, 160, { align: 'right' });
    formData.selectedGoals.forEach((goal, index) => {
      doc.text(`${goal.goal} - ${goal.metric || 'איכותי'}`, 180, 170 + (index * 10), { align: 'right' });
    });

    // Add answers to questions
    doc.text("תשובות לשאלות:", 180, 220, { align: 'right' });
    Object.entries(formData.answers).forEach(([question, answer], index) => {
      const yPos = 230 + (index * 20);
      if (yPos > 270) {
        doc.addPage();
        doc.text(question, 180, 20, { align: 'right', maxWidth: 170 });
        doc.text(answer, 180, 30, { align: 'right', maxWidth: 170 });
      } else {
        doc.text(question, 180, yPos, { align: 'right', maxWidth: 170 });
        doc.text(answer, 180, yPos + 10, { align: 'right', maxWidth: 170 });
      }
    });

    return doc;
  };

  const handleSubmit = async () => {
    setShowPreviewDialog(true);
  };

  const handleDownload = async () => {
    setShowPreviewDialog(false);
    setShowSaveDialog(true);
  };

  const handleConfirmSave = async () => {
    try {
      // Generate and save PDF
      const doc = generatePDF();
      doc.save(`דוח_הכנה_מנטלית_${formData.fullName}.pdf`);

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
    <div className="space-y-6 max-h-[80vh] overflow-y-auto p-4 text-right">
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
          <PreviewContent />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>סגור</Button>
            <Button onClick={handleDownload}>הורד PDF</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם ברצונך לשמור את דוח טרום המשחק?</AlertDialogTitle>
            <AlertDialogDescription>
              הדוח יישמר כקובץ PDF במכשיר שלך.
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

