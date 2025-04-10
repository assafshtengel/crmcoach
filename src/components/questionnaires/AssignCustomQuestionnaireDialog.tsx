
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Player } from '@/types/player';

interface AssignCustomQuestionnaireDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionnaireId: string;
  questionnaireName: string;
  onAssigned?: () => void;
}

const AssignCustomQuestionnaireDialog: React.FC<AssignCustomQuestionnaireDialogProps> = ({
  open,
  onOpenChange,
  questionnaireId,
  questionnaireName,
  onAssigned
}) => {
  const { toast } = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          toast({
            title: "לא מחובר",
            description: "עליך להיות מחובר כדי לשייך שאלונים.",
            variant: "destructive",
          });
          return;
        }

        const coachId = session.user.id;

        const { data: playersData, error } = await supabase
          .from('players')
          .select('*')
          .eq('coach_id', coachId);

        if (error) {
          console.error("שגיאה בטעינת שחקנים:", error);
          toast({
            title: "שגיאה",
            description: "שגיאה בטעינת רשימת השחקנים.",
            variant: "destructive",
          });
          return;
        }

        setPlayers(playersData);
      } catch (error) {
        console.error("שגיאה כללית:", error);
        toast({
          title: "שגיאה",
          description: "שגיאה כללית.",
          variant: "destructive",
          duration: 5000,
        });
      }
    };

    if (open) {
      fetchPlayers();
    }
  }, [open, toast]);

  const handleAssign = async () => {
    if (!selectedPlayerId) {
      toast({
        title: "שגיאה",
        description: "יש לבחור שחקן כדי לשייך את השאלון.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAssigning(true);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        toast({
          title: "לא מחובר",
          description: "עליך להיות מחובר כדי לשייך שאלונים.",
          variant: "destructive",
        });
        return;
      }

      const coachId = session.user.id;

      // Insert into assigned_questionnaires table
      const { data, error } = await supabase
        .from('assigned_questionnaires')
        .insert([
          {
            questionnaire_id: questionnaireId,
            player_id: selectedPlayerId,
            coach_id: coachId,
            status: 'pending',
          },
        ]);

      if (error) {
        console.error("שגיאה בשיוך השאלון:", error);
        toast({
          title: "שגיאה",
          description: "שגיאה בשיוך השאלון לשחקן.",
          variant: "destructive",
        });
        return;
      }

      // Single success toast
      toast({
        title: "שאלון שויך בהצלחה",
        description: `השאלון "${questionnaireName}" שויך לשחקן הנבחר`
      });

      // Close dialog and trigger callback
      onOpenChange(false);
      if (onAssigned) {
        onAssigned();
      }
    } catch (error) {
      console.error("שגיאה כללית:", error);
      toast({
        title: "שגיאה",
        description: "שגיאה כללית.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-y-auto max-h-[90vh]" dir="rtl">
        <DialogHeader>
          <DialogTitle>שיוך שאלון לשחקן</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="player-select">בחר שחקן:</Label>
            <Select
              value={selectedPlayerId}
              onValueChange={setSelectedPlayerId}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="בחר שחקן" />
              </SelectTrigger>
              <SelectContent>
                {players.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button type="button" onClick={handleAssign} disabled={isAssigning}>
            {isAssigning ? (
              <>משייך...</>
            ) : (
              <>
                שייך שאלון
                <Send className="h-4 w-4 mr-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignCustomQuestionnaireDialog;
