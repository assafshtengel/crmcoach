
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormData } from '@/types/mentalPrep';

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FormData;
  previewRef: React.RefObject<HTMLDivElement>;
  onDownload: () => void;
}

export const PreviewContent = ({ formData, previewRef }: { formData: FormData; previewRef: React.RefObject<HTMLDivElement> }) => (
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

export const PreviewDialog = ({ open, onOpenChange, formData, previewRef, onDownload }: PreviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>תצוגה מקדימה של הדוח</DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto">
          <PreviewContent formData={formData} previewRef={previewRef} />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>סגור</Button>
          <Button onClick={onDownload}>שמור כתמונה</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
