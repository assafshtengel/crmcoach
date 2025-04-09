
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
import { Check, Search, Send, User } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

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
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (open) {
      loadPlayers();
      setSelectedPlayer(''); // Reset selected player when dialog opens
      setSearchQuery('');
    }
  }, [open]);

  const loadPlayers = async () => {
    try {
      setIsLoading(true);
      
      // Get the current user's session to get the coach's ID
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }
      
      const coachId = session.user.id;
      console.log('Loading players for coach:', coachId);
      
      const { data, error } = await supabase
        .from('players')
        .select('id, full_name')
        .eq('coach_id', coachId)
        .order('full_name');

      if (error) throw error;
      
      console.log('Loaded players:', data?.length || 0);
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
        title: "השאלון שויך בהצלחה!",
        description: "השאלון נשלח לשחקן בהצלחה",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning questionnaire:', error);
      // Show error toast if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPlayers = searchQuery 
    ? players.filter(player => player.full_name.includes(searchQuery)) 
    : players;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right text-xl font-bold">שייך שאלון לשחקן</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="player" className="text-right block text-base font-medium">בחר שחקן</Label>
            {isLoading ? (
              <div className="flex items-center justify-center p-6">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                <span className="mr-2">טוען רשימת שחקנים...</span>
              </div>
            ) : (
              <div className="relative">
                <Select
                  value={selectedPlayer}
                  onValueChange={setSelectedPlayer}
                >
                  <SelectTrigger className="w-full h-12 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary text-right">
                    <SelectValue placeholder="הקלד או בחר שחקן מהרשימה" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80 bg-white" position="popper">
                    <div className="sticky top-0 p-2 bg-white border-b">
                      <div className="relative">
                        <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="חיפוש שחקן..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-2 pr-9 h-10 text-right w-full"
                        />
                      </div>
                    </div>
                    {filteredPlayers.length > 0 ? (
                      filteredPlayers.map((player) => (
                        <SelectItem key={player.id} value={player.id} className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <span>{player.full_name}</span>
                            <User size={16} className="text-gray-500" />
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-3 text-center text-sm text-gray-500">
                        {searchQuery ? "לא נמצאו שחקנים תואמים" : "לא נמצאו שחקנים"}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {template && (
            <div className="space-y-3">
              <Label className="text-right block text-base font-medium">פרטי השאלון</Label>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="font-medium text-base text-right">{template.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2 justify-end">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {template.questions.length} שאלות
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {template.questions.filter(q => q.type === 'open').length} פתוחות
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {template.questions.filter(q => q.type === 'closed').length} דירוג
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:justify-between mt-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              ביטול
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedPlayer}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  שולח...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 ml-2" />
                  שלח שאלון
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignQuestionnaireDialog;
