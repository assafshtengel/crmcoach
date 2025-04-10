
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Search, UserRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Questionnaire, PlayerData } from '@/types/questionnaire';

interface AssignCustomQuestionnaireDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionnaireId?: string;
  questionnaireName?: string;
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
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerData[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch players when dialog opens
  useEffect(() => {
    if (open) {
      fetchPlayers();
      // Reset states
      setSelectedPlayerId('');
      setSearchQuery('');
    }
  }, [open]);

  // Filter players based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPlayers(players);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = players.filter(player => 
        player.full_name.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredPlayers(filtered);
    }
  }, [searchQuery, players]);

  const fetchPlayers = async () => {
    try {
      setIsLoading(true);
      
      // Get the current user's auth session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        toast({
          title: "יש להתחבר תחילה",
          description: "עליך להתחבר למערכת כדי לשייך שאלונים",
          variant: "destructive",
        });
        onOpenChange(false);
        return;
      }
      
      // Fetch players that belong to the current coach
      const { data, error } = await supabase
        .from('players')
        .select('id, full_name, email, profile_image, sport_field, club, year_group')
        .eq('coach_id', session.user.id)
        .order('full_name');
      
      if (error) {
        throw error;
      }
      
      setPlayers(data || []);
      setFilteredPlayers(data || []);
      
    } catch (error) {
      console.error('Error fetching players:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת השחקנים",
        description: "אירעה שגיאה בעת טעינת רשימת השחקנים"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPlayerId) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "יש לבחור שחקן מהרשימה"
      });
      return;
    }

    if (!questionnaireId) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "שאלון לא נבחר"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Get the current user's auth session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        toast({
          title: "יש להתחבר תחילה",
          description: "עליך להתחבר למערכת כדי לשייך שאלונים",
          variant: "destructive",
        });
        return;
      }

      // Create a new assignment record
      const { data, error } = await supabase
        .from('assigned_questionnaires')
        .insert({
          coach_id: session.user.id,
          player_id: selectedPlayerId,
          questionnaire_id: questionnaireId,
          status: 'pending',
          template_id: questionnaireId // Using questionnaire ID as template_id for tracking purposes
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "השאלון שויך בהצלחה!",
        description: "השאלון נשלח לשחקן"
      });
      
      // Reset and close the dialog
      setSelectedPlayerId('');
      onOpenChange(false);
      
      // Callback if provided
      if (onAssigned) {
        onAssigned();
      }
      
    } catch (error) {
      console.error('Error assigning questionnaire:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בשיוך השאלון",
        description: "אירעה שגיאה בעת שיוך השאלון לשחקן. נסה שנית."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl">שייך שאלון לשחקן</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {questionnaireId && questionnaireName && (
            <div className="text-center p-2 bg-muted rounded-md">
              <p className="text-md font-medium">שאלון: {questionnaireName}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="player-search">חיפוש שחקנים</Label>
            <div className="relative">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="player-search"
                className="pl-10"
                placeholder="חפש לפי שם..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="player-select">בחר שחקן</Label>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : filteredPlayers.length > 0 ? (
              <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger id="player-select">
                  <SelectValue placeholder="בחר שחקן..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredPlayers.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      <div className="flex items-center">
                        <UserRound className="h-4 w-4 ml-2 text-muted-foreground" />
                        <span>{player.full_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-center p-4 border border-dashed rounded-md">
                <p className="text-muted-foreground">לא נמצאו שחקנים</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !selectedPlayerId}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                שולח...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 ml-2" />
                שלח שאלון
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignCustomQuestionnaireDialog;
