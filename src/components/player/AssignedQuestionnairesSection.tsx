
import React, { useState, useEffect } from 'react';
import { Calendar, ClipboardList, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { AssignedQuestionnaire } from '@/types/questionnaire';
import { toast } from '@/components/ui/use-toast';

interface AssignedQuestionnairesSectionProps {
  playerId: string;
}

export const AssignedQuestionnairesSection: React.FC<AssignedQuestionnairesSectionProps> = ({ playerId }) => {
  const [questionnaires, setQuestionnaires] = useState<AssignedQuestionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignedQuestionnaires();
  }, [playerId]);

  const fetchAssignedQuestionnaires = async () => {
    try {
      console.log("Fetching questionnaires for player ID:", playerId);
      setLoading(true);
      
      const { data, error } = await supabase
        .from('assigned_questionnaires')
        .select(`
          *,
          coach:coaches (
            full_name
          ),
          questionnaires:questionnaires!questionnaire_id (
            title,
            type,
            questions
          )
        `)
        .eq('player_id', playerId)
        .eq('status', 'pending')
        .order('assigned_at', { ascending: false });

      console.log("Fetched assigned questionnaires:", data);
      console.log("Query error (if any):", error);

      if (error) {
        console.error('Error details:', error);
        throw error;
      }
      
      setQuestionnaires(data || []);
    } catch (err) {
      console.error('Error fetching assigned questionnaires:', err);
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת השאלונים",
        description: "לא ניתן היה לטעון את השאלונים שהוקצו לך."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerQuestionnaire = (questionnaireId: string) => {
    navigate(`/player/questionnaire/${questionnaireId}`);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            שאלונים שהוקצו לי
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="flex flex-col gap-2 border rounded-lg p-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-5 w-1/3" />
                <div className="flex justify-end mt-2">
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questionnaires.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            שאלונים שהוקצו לי
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>אין שאלונים שהוקצו לך כרגע</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          שאלונים שהוקצו לי
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {questionnaires.map((questionnaire) => (
            <div key={questionnaire.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <h3 className="font-medium text-lg">{questionnaire.questionnaires?.title}</h3>
              
              <div className="mt-2 text-sm text-gray-500 space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>הוקצה על ידי: {questionnaire.coach?.full_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    הוקצה לפני {formatDistanceToNow(new Date(questionnaire.assigned_at), { 
                      addSuffix: false, 
                      locale: he 
                    })}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end mt-3">
                <Button 
                  onClick={() => handleAnswerQuestionnaire(questionnaire.id)}
                  className="gap-2"
                >
                  <ClipboardList className="h-4 w-4" />
                  ענה עכשיו
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
