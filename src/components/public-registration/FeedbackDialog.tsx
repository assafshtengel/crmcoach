
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";

interface FeedbackDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  message: string;
  isError: boolean;
  onClose?: () => void;
}

export const FeedbackDialog = ({
  open,
  setOpen,
  title,
  message,
  isError,
  onClose,
}: FeedbackDialogProps) => {
  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isError ? (
              <AlertCircle className="h-6 w-6 text-red-500" />
            ) : (
              <CheckCircle className="h-6 w-6 text-green-500" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button 
            onClick={handleClose}
            variant={isError ? "destructive" : "default"}
            className="w-full sm:w-auto"
          >
            {isError ? "נסה שוב" : "המשך"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
