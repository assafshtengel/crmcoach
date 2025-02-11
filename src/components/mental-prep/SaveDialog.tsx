
import React from 'react';
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

interface SaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SaveDialog = ({ open, onOpenChange }: SaveDialogProps) => {
  const handleYes = () => {
    window.open('https://chatgpt.com/g/g-678dbc160ba48191aa5eff1f083a51b4-tknvn-48-sh-vt-lpny-mshkhq', '_blank');
    onOpenChange(false);
  };

  const handleNo = () => {
    window.location.href = '/';
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>האם תרצה לקבל סדר יום מומלץ לפני המשחק?</AlertDialogTitle>
          <AlertDialogDescription>
            נוכל לספק לך סדר יום מותאם אישית שיעזור לך להתכונן למשחק בצורה מיטבית.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleNo}>לא, תודה</AlertDialogCancel>
          <AlertDialogAction onClick={handleYes}>כן, אשמח</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
