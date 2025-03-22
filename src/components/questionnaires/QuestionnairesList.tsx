
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FileQuestion, AlertCircle } from 'lucide-react';
import type { Questionnaire } from '@/types/questionnaire';

interface QuestionnairesListProps {
  questionnaires: Questionnaire[];
  onSelectQuestionnaire: (questionnaire: Questionnaire) => void;
  selectedQuestionnaireId?: string;
}

export const QuestionnairesList = ({ 
  questionnaires, 
  onSelectQuestionnaire, 
  selectedQuestionnaireId 
}: QuestionnairesListProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileQuestion className="h-5 w-5" />
          <span>שאלונים זמינים</span>
        </CardTitle>
        <CardDescription>בחר שאלון לצפייה בפרטים</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {questionnaires.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8">
              <AlertCircle className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-gray-500">אין שאלונים זמינים כרגע</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questionnaires.map((questionnaire) => (
                <Card 
                  key={questionnaire.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedQuestionnaireId === questionnaire.id ? 'border-primary' : ''
                  }`}
                  onClick={() => onSelectQuestionnaire(questionnaire)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{questionnaire.title}</div>
                        <Badge variant={questionnaire.isActive ? 'default' : 'secondary'}>
                          {questionnaire.isActive ? 'פעיל' : 'לא פעיל'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {questionnaire.questions.length} שאלות
                      </div>
                      <div className="text-xs text-gray-400">
                        עדכון אחרון: {new Date(questionnaire.updatedAt).toLocaleDateString('he-IL')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
