
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">הרישום הושלם בהצלחה!</DialogTitle>
        </DialogHeader>
        <div className="text-center py-4">
          <p className="mb-4">
            תודה שנרשמת לאימון. המאמן {coachName} יצור איתך קשר בקרוב.
          </p>
          <Button onClick={handleCloseWindow} className="mt-2">
            סגור חלון
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
