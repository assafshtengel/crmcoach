
import React from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Questionnaire, PlayerQuestionnaireResponse, Question, QuestionnaireResponse } from '@/types/questionnaire';
import { FileQuestion, User, Calendar, Clock, CheckCircle, Circle } from 'lucide-react';

interface QuestionnaireViewerProps {
  questionnaire: Questionnaire;
  response: PlayerQuestionnaireResponse;
}

export const QuestionnaireViewer = ({ questionnaire, response }: QuestionnaireViewerProps) => {
  // Helper function to find a response for a specific question
  const findResponse = (questionId: string): QuestionnaireResponse | undefined => {
    return response.responses.find(r => r.questionId === questionId);
  };

  // Format date with Hebrew locale
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPP', { locale: he });
  };

  // Get answer text for closed questions (multiple choice)
  const getAnswerText = (question: Question, answerValue: number) => {
    if (question.type === 'closed' && question.options) {
      const option = question.options.find(opt => opt.value === answerValue);
      return option ? option.text : 'לא נבחרה תשובה';
    }
    return '';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-primary" />
            <CardTitle>{questionnaire.title}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {formatDate(response.submittedAt)}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <User className="h-4 w-4" />
          <span>{response.playerName}</span>
        </div>
      </CardHeader>
      
      <Separator />
      
      <ScrollArea className="h-[650px]">
        <CardContent className="pt-6">
          {questionnaire.description && (
            <div className="mb-6 text-gray-600 bg-gray-50 p-4 rounded-md">
              {questionnaire.description}
            </div>
          )}

          <div className="space-y-8">
            {questionnaire.questions.map((question) => {
              const questionResponse = findResponse(question.id);
              const hasResponse = !!questionResponse;
              
              return (
                <div key={question.id} className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-lg">{question.text}</h3>
                      {question.type === 'closed' && (
                        <Badge variant="secondary" className="text-xs">
                          שאלה סגורה
                        </Badge>
                      )}
                      {question.type === 'open' && (
                        <Badge variant="secondary" className="text-xs">
                          שאלה פתוחה
                        </Badge>
                      )}
                    </div>
                    
                    {questionResponse && (
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>נענה ב: {formatDate(questionResponse.answeredAt)}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-4 rounded-md border">
                    {hasResponse ? (
                      question.type === 'open' ? (
                        <div className="whitespace-pre-wrap text-gray-800">{questionResponse.answer as string}</div>
                      ) : (
                        <div className="space-y-2">
                          {question.options?.map((option) => (
                            <div 
                              key={option.id} 
                              className={`flex items-center gap-2 p-2 rounded-md ${
                                Number(questionResponse.answer) === option.value 
                                  ? 'bg-primary/10 text-primary' 
                                  : 'text-gray-600'
                              }`}
                            >
                              {Number(questionResponse.answer) === option.value ? (
                                <CheckCircle className="h-4 w-4 text-primary" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-300" />
                              )}
                              <span>{option.text}</span>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="text-gray-400 italic">לא התקבלה תשובה</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
};
