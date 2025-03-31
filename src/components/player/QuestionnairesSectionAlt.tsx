
import React, { useState, useEffect } from 'react';
import { Calendar, ClipboardList, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { AssignedQuestionnaire } from '@/types/questionnaire';
import { toast } from 'sonner';

interface QuestionnairesSectionAltProps {
  playerId: string;
}

const QuestionnairesSectionAlt: React.FC<QuestionnairesSectionAltProps> = ({ playerId }) => {
  const [questionnaires, setQuestionnaires] = useState<AssignedQuestionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignedQuestionnaires();
  }, [playerId]);

  const fetchAssignedQuestionnaires = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('assigned_questionnaires')
        .select(`
          *,
          coach:coaches (
            full_name
          ),
          questionnaire:questionnaires (
            title,
            type,
            questions
          )
        `)
        .eq('player_id', playerId)
        .eq('status', 'pending')
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      
      setQuestionnaires(data || []);
    } catch (err) {
      console.error('Error fetching assigned questionnaires:', err);
      toast.error("לא ניתן היה לטעון את השאלונים");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerQuestionnaire = (questionnaireId: string) => {
    navigate(`/player/questionnaire/${questionnaireId}`);
  };

  if (loading) {
    return (
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-[#F2FCE2]/50 to-[#E5DEFF]/50 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="h-5 w-5 text-primary" />
            שאלונים שהוקצו לי
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-5 w-1/2 mb-2" />
                <Skeleton className="h-5 w-1/3 mb-3" />
                <div className="flex justify-end">
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
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-[#F2FCE2]/50 to-[#E5DEFF]/50 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="h-5 w-5 text-primary" />
            שאלונים שהוקצו לי
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">אין שאלונים שהוקצו לך כרגע</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-[#F2FCE2]/50 to-[#E5DEFF]/50 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardList className="h-5 w-5 text-primary" />
          שאלונים שהוקצו לי
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          {questionnaires.map((questionnaire) => (
            <div 
              key={questionnaire.id} 
              className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all p-4"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{questionnaire.questionnaire?.title}</h3>
                  
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
                </div>
                
                <div className="flex items-start">
                  <Button 
                    onClick={() => handleAnswerQuestionnaire(questionnaire.id)}
                    className="gap-2"
                  >
                    <ClipboardList className="h-4 w-4" />
                    ענה עכשיו
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionnairesSectionAlt;
