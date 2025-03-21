
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface SecurityCodeDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SecurityCodeDialog({ 
  open, 
  onClose, 
  onSuccess 
}: SecurityCodeDialogProps) {
  const [securityCode, setSecurityCode] = useState("");
  const [error, setError] = useState(false);
  const { toast } = useToast();
  
  const ADMIN_CODE = "1976";
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (securityCode === ADMIN_CODE) {
      setError(false);
      toast({
        title: "קוד אבטחה נכון",
        description: "הינך מועבר לדף ההרשמה",
      });
      onSuccess();
    } else {
      setError(true);
      toast({
        variant: "destructive",
        title: "קוד אבטחה שגוי",
        description: "אנא נסה שוב או פנה למנהל המערכת",
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">קוד אבטחה</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-center text-sm text-muted-foreground">
              הרשמת מאמנים חדשים דורשת קוד אבטחה.
              <br />אנא הזן את הקוד שקיבלת ממנהל המערכת
            </p>
            
            <Input
              type="password"
              placeholder="הזן קוד אבטחה"
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              className={error ? "border-red-500" : ""}
              required
            />
            
            {error && (
              <p className="text-sm text-red-500 text-center">
                קוד אבטחה שגוי, אנא נסה שוב
              </p>
            )}
          </div>
          
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit">
              אישור
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
