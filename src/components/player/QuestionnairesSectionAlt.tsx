
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { FileText, Calendar, User, ArrowRight } from "lucide-react";
import { AssignedQuestionnaire } from '@/types/questionnaire';

interface QuestionnairesSectionAltProps {
  playerId: string;
}

const QuestionnairesSectionAlt: React.FC<QuestionnairesSectionAltProps> = ({ playerId }) => {
  const [questionnaires, setQuestionnaires] = useState<AssignedQuestionnaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestionnaires();
  }, [playerId]);

  const fetchQuestionnaires = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('assigned_questionnaires')
        .select(`
          *,
          coach:coach_id(full_name),
          questionnaire:questionnaire_id(title, type, questions)
        `)
        .eq('player_id', playerId)
        .eq('status', 'pending')
        .order('assigned_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error("Error fetching questionnaires:", error);
        toast({
          title: "שגיאה בטעינת השאלונים",
          description: "לא ניתן לטעון את השאלונים כעת",
          variant: "destructive",
        });
      } else {
        setQuestionnaires(data || []);
      }
    } catch (err) {
      console.error("Exception fetching questionnaires:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-10 w-full animate-pulse bg-gray-200 rounded"></div>
        <div className="h-32 w-full animate-pulse bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (questionnaires.length === 0) {
    return (
      <div className="my-4">
        <h3 className="text-lg font-semibold mb-2">שאלונים לענות</h3>
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            אין שאלונים ממתינים כרגע
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="my-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">שאלונים לענות</h3>
        <Link to="/player/questionnaires">
          <Button variant="ghost" size="sm" className="text-xs">
            הצג הכל
          </Button>
        </Link>
      </div>
      <Separator className="my-2" />
      <div className="grid grid-cols-1 gap-3 mt-3">
        {questionnaires.map((questionnaire) => (
          <Card key={questionnaire.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-1 text-primary" />
                    {questionnaire.questionnaire?.title || "שאלון"}
                  </div>
                  {questionnaire.coach && (
                    <div className="text-sm text-gray-500 flex items-center">
                      <User className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      {questionnaire.coach.full_name}
                    </div>
                  )}
                  <div className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                    {format(new Date(questionnaire.assigned_at), 'dd/MM/yyyy')}
                  </div>
                </div>
                <Link to={`/player/questionnaire/${questionnaire.id}`}>
                  <Button size="sm" className="h-8">
                    ענה עכשיו
                    <ArrowRight className="ms-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuestionnairesSectionAlt;
