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
        <AlertDialogHeader>
          <AlertDialogTitle>ההרשמה בוצעה בהצלחה!</AlertDialogTitle>
          <AlertDialogDescription>
            תודה שנרשמתם. הפרטים שלך נשלחו למאמן {coachName}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleCloseWindow}>סגור</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
