
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import QuestionnaireViewDialog from './QuestionnaireViewDialog';

interface CompletedQuestionnaire {
  id: string;
  player_id: string;
  questionnaire_id: string;
  answers: any;
  submitted_at: string;
  coach_id: string;
  status: string;
  player_name: string;
  questionnaire_title: string;
  template_type: string;
}

const CompletedQuestionnairesList = () => {
  const [completedQuestionnaires, setCompletedQuestionnaires] = useState<CompletedQuestionnaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<CompletedQuestionnaire | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCompletedQuestionnaires = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          return;
        }

        // Updated query to correctly fetch player name and questionnaire details
        const { data, error } = await supabase
          .from('questionnaire_answers')
          .select(`
            id,
            player_id,
            questionnaire_id,
            answers,
            submitted_at,
            coach_id,
            status,
            players:player_id(
              full_name
            ),
            questionnaire:questionnaire_id(
              title,
              type
            )
          `)
          .eq('coach_id', session.user.id)
          .eq('status', 'answered')
          .order('submitted_at', { ascending: false });

        if (error) {
          console.error('Error fetching completed questionnaires:', error);
          throw error;
        }

        // Transform data to include player name and questionnaire title
        const enhancedData = data.map(item => ({
          ...item,
          player_name: item.players?.full_name || 'Unknown Player',
          questionnaire_title: item.questionnaire?.title || 'Unknown Title',
          template_type: item.questionnaire?.type || 'Unknown Type'
        }));

        setCompletedQuestionnaires(enhancedData);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "שגיאה בטעינת השאלונים",
          description: "אירעה שגיאה בעת טעינת השאלונים שמולאו",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletedQuestionnaires();
  }, [toast]);

  const handleViewQuestionnaire = (questionnaire: CompletedQuestionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setIsViewDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (completedQuestionnaires.length === 0) {
    return (
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="text-center p-8">
          <p className="text-gray-500">
            אין עדיין שאלונים שמולאו על ידי שחקנים.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם השחקן</TableHead>
                <TableHead>כותרת השאלון</TableHead>
                <TableHead>סוג השאלון</TableHead>
                <TableHead>תאריך הגשה</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedQuestionnaires.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.player_name}</TableCell>
                  <TableCell>{item.questionnaire_title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {item.template_type === 'custom' ? 'מותאם אישית' : 
                       item.template_type === 'day_opening' ? 'פתיחת יום' :
                       item.template_type === 'day_summary' ? 'סיכום יום' :
                       item.template_type === 'post_game' ? 'אחרי משחק' :
                       item.template_type === 'mental_prep' ? 'מוכנות מנטלית' :
                       item.template_type === 'personal_goals' ? 'מטרות אישיות' :
                       item.template_type === 'motivation' ? 'מוטיבציה ולחץ' :
                       item.template_type === 'season_end' ? 'סיום עונה' :
                       item.template_type === 'team_communication' ? 'תקשורת קבוצתית' :
                       item.template_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(item.submitted_at).toLocaleDateString('he-IL')}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewQuestionnaire(item)}
                      className="flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      צפה בתשובות
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedQuestionnaire && (
        <QuestionnaireViewDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          questionnaire={selectedQuestionnaire}
        />
      )}
    </div>
  );
};

export default CompletedQuestionnairesList;
