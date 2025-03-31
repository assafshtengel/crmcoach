
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HomeRedirectPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HomeRedirectPopup({ open, onOpenChange }: HomeRedirectPopupProps) {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/index');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>דף הבית האישי שלך</DialogTitle>
          <DialogDescription>
            ברוך הבא למערכת! כעת תוכל לגשת לדף הבית האישי שלך.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center mt-4">
          <Button type="button" onClick={handleRedirect} className="w-full">
            למעבר לדף הבית האישי שלך תלחץ כאן
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
