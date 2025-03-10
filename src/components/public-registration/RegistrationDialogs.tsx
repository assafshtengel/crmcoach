
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Home } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface RegistrationDialogsProps {
  showFeedbackDialog: boolean;
  setShowFeedbackDialog: (show: boolean) => void;
  feedbackMessage: { title: string; message: string; isError: boolean };
  showSuccessDialog: boolean;
  setShowSuccessDialog: (show: boolean) => void;
  coachName: string | undefined;
  handleCloseWindow: () => void;
  onFeedbackClose?: () => void;
  generatedPassword: string;
}

export const RegistrationDialogs = ({
  showFeedbackDialog,
  setShowFeedbackDialog,
  feedbackMessage,
  showSuccessDialog,
  setShowSuccessDialog,
  coachName,
  handleCloseWindow,
  onFeedbackClose,
  generatedPassword,
}: RegistrationDialogsProps) => {
  const { toast } = useToast();
  const [passwordCopied, setPasswordCopied] = useState(false);

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    setPasswordCopied(true);
    toast({
      title: "הסיסמה הועתקה",
      description: "הסיסמה הועתקה ללוח שלך",
    });
  };

  return (
    <>
      <Dialog
        open={showFeedbackDialog}
        onOpenChange={(open) => {
          if (!open && onFeedbackClose && !feedbackMessage.isError) {
            onFeedbackClose();
          }
          setShowFeedbackDialog(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{feedbackMessage.title}</DialogTitle>
            <DialogDescription>{feedbackMessage.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowFeedbackDialog(false)}>סגור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>נרשמת בהצלחה למערכת!</DialogTitle>
            <DialogDescription>
              נרשמת בהצלחה למערכת של המאמן {coachName}. שמור את הסיסמה הזמנית הבאה, תצטרך אותה כדי
              להתחבר למערכת בעתיד.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <div className="flex justify-between items-center">
              <div className="font-mono text-lg select-all">{generatedPassword}</div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyPassword}
                className="ml-2"
              >
                <Copy className="h-4 w-4 mr-2" />
                {passwordCopied ? "הועתק" : "העתק"}
              </Button>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleCloseWindow} className="w-full">
              סגור חלון
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2"
              onClick={() => window.location.href = '/'}
            >
              <Home className="h-4 w-4" />
              למעבר לדף הבית
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
