
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, FileText, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface Questionnaire {
  id: string;
  title: string;
  created_at: string;
  player_name: string;
  type: string;
  questions_count: number;
}

interface QuestionnaireDetails {
  id: string;
  title: string;
  created_at: string;
  player_name: string;
  type: string;
  questions: Question[];
}

interface Question {
  id: string;
  question_text: string;
  answer: string;
  type: 'open' | 'closed';
}

const QuestionnairesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<QuestionnaireDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchQuestionnaires();
  }, []);

  const fetchQuestionnaires = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      // This is a placeholder for the actual data structure
      // You would need to adjust this based on your database schema
      const { data, error } = await supabase
        .from('questionnaires')
        .select(`
          id,
          title,
          created_at,
          type,
          player:players(full_name),
          questions:questionnaire_questions(count)
        `)
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Format the data for rendering
      const formattedData = data?.map(item => ({
        id: item.id,
        title: item.title,
        created_at: item.created_at,
        player_name: item.player?.full_name || 'לא ידוע',
        type: item.type,
        questions_count: item.questions?.[0]?.count || 0
      })) || [];

      setQuestionnaires(formattedData);
    } catch (error) {
      console.error('Error fetching questionnaires:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת השאלונים",
        description: "אנא נסה שוב מאוחר יותר"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewQuestionnaire = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      // This is a placeholder for the actual data structure
      // You would need to adjust this based on your database schema
      const { data, error } = await supabase
        .from('questionnaires')
        .select(`
          id,
          title,
          created_at,
          type,
          player:players(full_name),
          questions:questionnaire_questions(
            id,
            question_text,
            answer,
            type
          )
        `)
        .eq('id', id)
        .eq('coach_id', user.id)
        .single();

      if (error) throw error;

      const questionnaireDetails: QuestionnaireDetails = {
        id: data.id,
        title: data.title,
        created_at: data.created_at,
        player_name: data.player?.full_name || 'לא ידוע',
        type: data.type,
        questions: data.questions || []
      };

      setSelectedQuestionnaire(questionnaireDetails);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching questionnaire details:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת השאלון",
        description: "אנא נסה שוב מאוחר יותר"
      });
    }
  };

  const getQuestionnaireTypeBadge = (type: string) => {
    switch (type) {
      case 'mental_prep':
        return <Badge className="bg-blue-500">הכנה מנטלית</Badge>;
      case 'game_evaluation':
        return <Badge className="bg-purple-500">הערכת משחק</Badge>;
      case 'general':
        return <Badge className="bg-green-500">כללי</Badge>;
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
                {format(new Date(questionnaire.created_at), 'dd MMMM yyyy', { locale: he })}
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
            {questionnaire.questions_count}
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="ghost" 
            className="w-full flex justify-center items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={() => handleViewQuestionnaire(questionnaire.id)}
          >
            <Eye className="h-4 w-4 mr-2" />
            צפה בשאלון
          </Button>
        </CardFooter>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">שאלונים</h1>
            <p className="text-gray-600">צפה בשאלונים שמולאו על ידי השחקנים</p>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center" 
            onClick={() => navigate('/dashboard-coach')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            חזרה לדשבורד
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">כל השאלונים ({questionnaires.length})</TabsTrigger>
            <TabsTrigger value="mental_prep">הכנה מנטלית ({questionnaires.filter(q => q.type === 'mental_prep').length})</TabsTrigger>
            <TabsTrigger value="game_evaluation">הערכת משחק ({questionnaires.filter(q => q.type === 'game_evaluation').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {questionnaires.length > 0 ? (
                questionnaires.map(questionnaire => renderQuestionnaireCard(questionnaire))
              ) : (
                <div className="col-span-3 text-center p-10 bg-white rounded-lg shadow">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="text-xl font-medium text-gray-800">אין שאלונים זמינים</h3>
                  <p className="text-gray-500 mt-2">לא נמצאו שאלונים במערכת</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="mental_prep" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {questionnaires.filter(q => q.type === 'mental_prep').length > 0 ? (
                questionnaires
                  .filter(q => q.type === 'mental_prep')
                  .map(questionnaire => renderQuestionnaireCard(questionnaire))
              ) : (
                <div className="col-span-3 text-center p-10 bg-white rounded-lg shadow">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="text-xl font-medium text-gray-800">אין שאלוני הכנה מנטלית</h3>
                  <p className="text-gray-500 mt-2">לא נמצאו שאלוני הכנה מנטלית במערכת</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="game_evaluation" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {questionnaires.filter(q => q.type === 'game_evaluation').length > 0 ? (
                questionnaires
                  .filter(q => q.type === 'game_evaluation')
                  .map(questionnaire => renderQuestionnaireCard(questionnaire))
              ) : (
                <div className="col-span-3 text-center p-10 bg-white rounded-lg shadow">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="text-xl font-medium text-gray-800">אין שאלוני הערכת משחק</h3>
                  <p className="text-gray-500 mt-2">לא נמצאו שאלוני הערכת משחק במערכת</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
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
                    {format(new Date(selectedQuestionnaire.created_at), 'dd MMMM yyyy', { locale: he })}
                  </p>
                </div>
                {getQuestionnaireTypeBadge(selectedQuestionnaire.type)}
              </div>

              <Separator className="my-4" />

              <ScrollArea className="h-[50vh] pr-4">
                <div className="space-y-6">
                  {selectedQuestionnaire.questions.map((question, index) => (
                    <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">
                          שאלה {index + 1}: {question.question_text}
                        </h3>
                        <Badge className={`${question.type === 'open' ? 'bg-blue-500' : 'bg-green-500'}`}>
                          {question.type === 'open' ? 'שאלה פתוחה' : 'שאלה סגורה'}
                        </Badge>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-gray-700">{question.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionnairesPage;
