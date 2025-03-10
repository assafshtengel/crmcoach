
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
import { CheckCircle, Copy, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface SuccessDialogProps {
  showSuccessDialog: boolean;
  setShowSuccessDialog: (show: boolean) => void;
  coachName: string | undefined;
  handleCloseWindow: () => void;
  generatedPassword?: string;
}

export const SuccessDialog = ({
  showSuccessDialog,
  setShowSuccessDialog,
  coachName,
  handleCloseWindow,
  generatedPassword,
}: SuccessDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const copyPassword = () => {
    if (!generatedPassword) return;
    
    navigator.clipboard.writeText(generatedPassword)
      .then(() => {
        toast({
          title: "הסיסמה הועתקה",
          description: "הסיסמה הועתקה ללוח",
        });
      })
      .catch((err) => {
        console.error("Failed to copy password:", err);
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: "לא ניתן להעתיק את הסיסמה",
        });
      });
  };

  const handleGoHome = () => {
    setShowSuccessDialog(false);
    navigate('/');
  };

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
            
            {generatedPassword && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                <p className="font-medium text-base mb-2">הסיסמה שלך לכניסה למערכת:</p>
                <div className="flex items-center justify-between bg-white p-2 rounded border">
                  <code className="text-sm font-mono">{generatedPassword}</code>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={copyPassword}
                    title="העתק סיסמה"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  שמור את הסיסמה במקום בטוח. תזדקק לה יחד עם כתובת האימייל שלך כדי להתחבר למערכת.
                </p>
              </div>
            )}
            
            <p className="mt-4 text-sm text-gray-500">המאמן יצור איתך קשר בהקדם.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
          <AlertDialogAction 
            onClick={handleCloseWindow}
            className="bg-green-500 hover:bg-green-600 text-white order-1 sm:order-2"
          >
            סיום
          </AlertDialogAction>
          <Button 
            variant="outline" 
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 order-2 sm:order-1"
          >
            <Home className="h-4 w-4" />
            <span>מעבר לדף הבית</span>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
