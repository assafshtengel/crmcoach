
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SessionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SessionFormDialog: React.FC<SessionFormDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();

  const handleNavigateToSessionForm = () => {
    onOpenChange(false);
    navigate("/new-session");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">הוספת מפגש חדש</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <p className="text-gray-600 text-center">
            לחץ על הכפתור למטה כדי להוסיף מפגש חדש במערכת
          </p>
          <Button
            variant="green"
            className="w-full"
            onClick={handleNavigateToSessionForm}
          >
            המשך להוספת מפגש
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
