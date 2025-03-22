
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Eye, FileText, Trash2 } from 'lucide-react';
import { Questionnaire } from '@/types/questionnaire';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface CompletedQuestionnairesListProps {
  questionnaires: Questionnaire[];
  onDelete: (id: string) => Promise<void>;
}

const CompletedQuestionnairesList: React.FC<CompletedQuestionnairesListProps> = ({
  questionnaires,
  onDelete
}) => {
  const { toast } = useToast();
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [questionnaireToDelete, setQuestionnaireToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewQuestionnaire = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setQuestionnaireToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!questionnaireToDelete) return;

    try {
      setIsDeleting(true);
      await onDelete(questionnaireToDelete);
      toast({
        title: "שאלון נמחק בהצלחה",
        description: "השאלון נמחק מהמערכת בהצלחה"
      });
    } catch (error) {
      console.error('Error deleting questionnaire:', error);
      toast({
        variant: "destructive",
        title: "שגיאה במחיקת השאלון",
        description: "אירעה שגיאה בעת מחיקת השאלון"
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setQuestionnaireToDelete(null);
    }
  };

  const getQuestionnaireTypeBadge = (type: string) => {
    switch (type) {
      case 'day_opening':
        return <Badge className="bg-blue-500">פתיחת יום</Badge>;
      case 'day_summary':
        return <Badge className="bg-green-500">סיכום יום</Badge>;
      case 'post_game':
        return <Badge className="bg-purple-500">אחרי משחק</Badge>;
      case 'mental_prep':
        return <Badge className="bg-yellow-500">מוכנות מנטלית</Badge>;
      case 'personal_goals':
        return <Badge className="bg-red-500">מטרות אישיות</Badge>;
      case 'motivation':
        return <Badge className="bg-indigo-500">מוטיבציה ולחץ</Badge>;
      case 'season_end':
        return <Badge className="bg-pink-500">סיום עונה</Badge>;
      case 'team_communication':
        return <Badge className="bg-orange-500">תקשורת קבוצתית</Badge>;
      default:
        return <Badge className="bg-gray-500">{type}</Badge>;
    }
  };

  const renderQuestionnaireCard = (questionnaire: Questionnaire) => {
    return (
      <Card key={questionnaire.id} className="bg-white hover:bg-gray-50 transition-all duration-300">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-medium">{questionnaire.title}</CardTitle>
              <p className="text-sm text-gray-500">
                {questionnaire.completed_at && 
                  format(new Date(questionnaire.completed_at), 'dd MMMM yyyy', { locale: he })}
              </p>
            </div>
            {getQuestionnaireTypeBadge(questionnaire.type)}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm">
            <span className="font-semibold">שחקן: </span>
            {questionnaire.player_name}
          </p>
          <p className="text-sm">
            <span className="font-semibold">מספר שאלות: </span>
            {questionnaire.questions.length}
          </p>
        </CardContent>
        <CardFooter>
          <div className="w-full flex justify-between">
            <Button 
              variant="ghost" 
              className="flex justify-center items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              onClick={() => handleViewQuestionnaire(questionnaire)}
            >
              <Eye className="h-4 w-4 mr-2" />
              צפה בשאלון
            </Button>
            
            <Button
              variant="ghost"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleDeleteClick(questionnaire.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              מחק
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">שאלונים שמולאו</h2>

        {questionnaires.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {questionnaires.map(questionnaire => renderQuestionnaireCard(questionnaire))}
          </div>
        ) : (
          <div className="text-center p-10 bg-white rounded-lg shadow">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-xl font-medium text-gray-800">אין שאלונים זמינים</h3>
            <p className="text-gray-500 mt-2">לא נמצאו שאלונים במערכת</p>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedQuestionnaire?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedQuestionnaire && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">שחקן: </span>
                    {selectedQuestionnaire.player_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">תאריך: </span>
                    {selectedQuestionnaire.completed_at && 
                      format(new Date(selectedQuestionnaire.completed_at), 'dd MMMM yyyy', { locale: he })}
                  </p>
                </div>
                {getQuestionnaireTypeBadge(selectedQuestionnaire.type)}
              </div>

              <Separator className="my-4" />

              <ScrollArea className="h-[50vh] pr-4">
                <div className="space-y-6">
                  {/* Open questions first */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-3">שאלות פתוחות</h3>
                    {selectedQuestionnaire.questions
                      .filter(q => q.type === 'open')
                      .map((question, index) => {
                        const response = selectedQuestionnaire.responses?.[question.id];
                        return (
                          <div key={question.id} className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium text-gray-900">
                                שאלה {index + 1}: {question.question_text}
                              </h3>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <p className="text-gray-700">{response?.answer || 'לא ענה'}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              תאריך מילוי: {selectedQuestionnaire.completed_at && 
                                format(new Date(selectedQuestionnaire.completed_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                            </p>
                          </div>
                        );
                      })}
                  </div>

                  {/* Closed questions second */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">שאלות סגורות (דירוג 1-10)</h3>
                    {selectedQuestionnaire.questions
                      .filter(q => q.type === 'closed')
                      .map((question, index) => {
                        const response = selectedQuestionnaire.responses?.[question.id];
                        const rating = response?.rating || 0;
                        return (
                          <div key={question.id} className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium text-gray-900">
                                שאלה {index + 1}: {question.question_text}
                              </h3>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                  <div 
                                    className="bg-blue-600 h-4 rounded-full" 
                                    style={{ width: `${rating * 10}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 font-bold">{rating}/10</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              תאריך מילוי: {selectedQuestionnaire.completed_at && 
                                format(new Date(selectedQuestionnaire.completed_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח שברצונך למחוק שאלון זה?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את השאלון המלא ותשובותיו לצמיתות. לא ניתן יהיה לשחזר את המידע הזה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'מוחק...' : 'מחק'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CompletedQuestionnairesList;
