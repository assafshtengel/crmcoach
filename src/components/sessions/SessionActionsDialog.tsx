
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, FileEdit, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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

interface SessionActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: {
    id: string;
    session_date: string;
    session_time: string;
    notes?: string;
    location?: string;
    reminder_sent?: boolean;
    player: {
      full_name: string;
      id?: string;
    };
    meeting_type?: 'in_person' | 'zoom';
  } | null;
  onSessionUpdated: () => void;
}

export function SessionActionsDialog({ 
  open, 
  onOpenChange,
  session,
  onSessionUpdated
}: SessionActionsDialogProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    session_date: session?.session_date || '',
    session_time: session?.session_time || '',
    location: session?.location || '',
    notes: session?.notes || '',
    meeting_type: session?.meeting_type || 'in_person'
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Update form data when session changes
  React.useEffect(() => {
    if (session) {
      setFormData({
        session_date: session.session_date || '',
        session_time: session.session_time || '',
        location: session.location || '',
        notes: session.notes || '',
        meeting_type: session.meeting_type || 'in_person'
      });
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateSession = async () => {
    if (!session) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          session_date: formData.session_date,
          session_time: formData.session_time,
          location: formData.location,
          notes: formData.notes,
          meeting_type: formData.meeting_type
        })
        .eq('id', session.id);

      if (error) throw error;

      toast.success("המפגש עודכן בהצלחה");
      onSessionUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating session:', error);
      toast.error("שגיאה בעדכון המפגש");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!session) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', session.id);

      if (error) throw error;

      toast.success("המפגש נמחק בהצלחה");
      onSessionUpdated();
      setIsDeleteDialogOpen(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error("שגיאה במחיקת המפגש");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToSummary = () => {
    if (session) {
      navigate('/edit-session', { 
        state: { 
          sessionId: session.id,
          needsSummary: true 
        } 
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>עריכת מפגש</DialogTitle>
            <DialogDescription>
              {session ? `מפגש עם ${session.player.full_name}` : 'טוען...'}
            </DialogDescription>
          </DialogHeader>
          
          {session && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="session_date">תאריך</Label>
                <Input
                  id="session_date"
                  name="session_date"
                  type="date"
                  value={formData.session_date}
                  onChange={handleInputChange}
                  dir="ltr"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="session_time">שעה</Label>
                <Input
                  id="session_time"
                  name="session_time"
                  type="time"
                  value={formData.session_time}
                  onChange={handleInputChange}
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label>סוג מפגש</Label>
                <RadioGroup 
                  value={formData.meeting_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, meeting_type: value as 'in_person' | 'zoom' }))}
                  className="flex space-x-4 rtl:space-x-reverse"
                >
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="in_person" id="in_person" />
                    <Label htmlFor="in_person" className="cursor-pointer">פרונטלי</Label>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="zoom" id="zoom" />
                    <Label htmlFor="zoom" className="cursor-pointer">זום</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">
                  {formData.meeting_type === 'in_person' ? 'מיקום' : 'קישור לזום'}
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder={formData.meeting_type === 'in_person' ? 'הכנס מיקום' : 'הכנס קישור לזום'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">הערות</Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="הערות למפגש"
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="secondary"
              onClick={handleGoToSummary}
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              <FileText className="h-4 w-4 mr-2" />
              סכם מפגש
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              מחק מפגש
            </Button>
            <Button 
              onClick={handleUpdateSession}
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              <FileEdit className="h-4 w-4 mr-2" />
              שמור שינויים
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת מפגש</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק את המפגש? פעולה זו לא ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSession} className="bg-destructive text-destructive-foreground">
              {isLoading ? 'מוחק...' : 'כן, מחק מפגש'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
