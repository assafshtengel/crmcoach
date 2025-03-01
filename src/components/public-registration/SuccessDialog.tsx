
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle } from "lucide-react";

interface SuccessDialogProps {
  showSuccessDialog: boolean;
  setShowSuccessDialog: (show: boolean) => void;
  coachName: string | undefined;
  handleCloseWindow: () => void;
}

export const SuccessDialog = ({
  showSuccessDialog,
  setShowSuccessDialog,
  coachName,
  handleCloseWindow,
}: SuccessDialogProps) => {
  return (
    <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <AlertDialogTitle className="text-2xl mb-2">ההרשמה בוצעה בהצלחה!</AlertDialogTitle>
          <AlertDialogDescription className="text-lg">
            <p>תודה שנרשמת!</p>
            <p className="mt-2">הפרטים שלך נשלחו למאמן {coachName}.</p>
            <p className="mt-4 text-sm text-gray-500">המאמן יצור איתך קשר בהקדם.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-center">
          <AlertDialogAction 
            onClick={handleCloseWindow}
            className="bg-green-500 hover:bg-green-600 text-white px-8"
          >
            סיום
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
