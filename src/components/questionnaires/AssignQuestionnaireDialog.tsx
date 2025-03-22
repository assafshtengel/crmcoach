
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { QuestionnaireTemplate } from '@/types/questionnaire';
import { supabase } from '@/lib/supabase';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Player {
  id: string;
  full_name: string;
}

interface AssignQuestionnaireDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: QuestionnaireTemplate | null;
  onAssign: (templateId: string, playerId: string) => Promise<void>;
}

const AssignQuestionnaireDialog: React.FC<AssignQuestionnaireDialogProps> = ({
  open,
  onOpenChange,
  template,
  onAssign
}) => {
  const { toast } = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadPlayers();
    }
  }, [open]);

  const loadPlayers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('players')
        .select('id, full_name')
        .order('full_name');

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error loading players:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת שחקנים",
        description: "אירעה שגיאה בעת טעינת רשימת השחקנים. נסה שוב."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPlayer) {
      toast({
        variant: "destructive",
        title: "בחר שחקן",
        description: "יש לבחור שחקן כדי לשלוח את השאלון"
      });
      return;
    }

    if (!template) return;

    try {
      setIsSubmitting(true);
      await onAssign(template.id, selectedPlayer);
      
      toast({
        title: "השאלון נשלח בהצלחה",
        description: "השאלון נשלח לשחקן בהצלחה"
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning questionnaire:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בשליחת השאלון",
        description: "אירעה שגיאה בעת שליחת השאלון. נסה שנית."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>שליחת שאלון לשחקן</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="player">בחר שחקן</Label>
            {isLoading ? (
              <div className="text-center p-4">טוען רשימת שחקנים...</div>
            ) : (
              <Select
                value={selectedPlayer}
                onValueChange={setSelectedPlayer}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר שחקן" />
                </SelectTrigger>
                <SelectContent>
                  {players.length > 0 ? (
                    players.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.full_name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-center text-sm text-gray-500">
                      לא נמצאו שחקנים
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {template && (
            <div className="space-y-2">
              <Label>פרטי השאלון</Label>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="font-medium">{template.title}</p>
                <p className="text-sm text-gray-600">
                  {template.questions.length} שאלות ({template.questions.filter(q => q.type === 'open').length} פתוחות, {template.questions.filter(q => q.type === 'closed').length} דירוג)
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedPlayer}
          >
            {isSubmitting ? 'שולח...' : 'שלח שאלון'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignQuestionnaireDialog;
