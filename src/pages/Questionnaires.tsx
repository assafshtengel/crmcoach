
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileQuestion, Search, User, Calendar } from 'lucide-react';
import { QuestionnaireViewer } from '@/components/questionnaires/QuestionnaireViewer';
import { QuestionnairesList } from '@/components/questionnaires/QuestionnairesList';
import { PlayerQuestionnaireResponse, Questionnaire } from '@/types/questionnaire';
import { mockQuestionnaires, mockResponses } from '@/components/questionnaires/mockData';

const Questionnaires = () => {
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // In a real application, these would be fetched from Supabase
  const { data: questionnaires } = useQuery({
    queryKey: ['questionnaires'],
    queryFn: async () => {
      // Replace with actual API call
      return mockQuestionnaires;
    },
  });

  const { data: responses } = useQuery({
    queryKey: ['questionnaire-responses'],
    queryFn: async () => {
      // Replace with actual API call
      return mockResponses;
    },
  });

  const selectedResponse = responses?.find(response => response.id === selectedResponseId) || null;
  const selectedQuestionnaire = selectedResponse 
    ? questionnaires?.find(q => q.id === selectedResponse.questionnaireId)
    : null;

  const filteredResponses = responses?.filter(response => {
    if (!searchTerm) return true;
    return response.playerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getResponsesByTab = (responses: PlayerQuestionnaireResponse[] | undefined) => {
    if (!responses) return [];
    if (activeTab === 'all') return responses;
    
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return responses.filter(response => {
      const responseDate = new Date(response.submittedAt);
      if (activeTab === 'week') {
        return responseDate >= oneWeekAgo;
      } else if (activeTab === 'month') {
        return responseDate >= oneMonthAgo;
      }
      return true;
    });
  };

  const displayedResponses = getResponsesByTab(filteredResponses);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <FileQuestion className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">שאלונים</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>תשובות שחקנים</span>
              </CardTitle>
              <CardDescription>
                כל התשובות לשאלונים ששחקניך מילאו
              </CardDescription>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-10 pr-4"
                  placeholder="חיפוש לפי שם שחקן..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">הכל</TabsTrigger>
                  <TabsTrigger value="week">שבוע אחרון</TabsTrigger>
                  <TabsTrigger value="month">חודש אחרון</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {displayedResponses?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      לא נמצאו תוצאות
                    </div>
                  ) : (
                    displayedResponses?.map((response) => {
                      const questionnaire = questionnaires?.find(q => q.id === response.questionnaireId);
                      return (
                        <Card 
                          key={response.id} 
                          className={`cursor-pointer transition-all hover:shadow-md ${selectedResponseId === response.id ? 'border-primary' : ''}`}
                          onClick={() => setSelectedResponseId(response.id)}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="font-medium">{questionnaire?.title || 'שאלון'}</div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <User className="h-3 w-3" />
                                <span>{response.playerName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(response.submittedAt).toLocaleDateString('he-IL')}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedResponse && selectedQuestionnaire ? (
            <QuestionnaireViewer 
              questionnaire={selectedQuestionnaire} 
              response={selectedResponse} 
            />
          ) : (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center h-full p-10">
                <FileQuestion className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">לא נבחר שאלון</h3>
                <p className="text-gray-500 text-center mb-6">
                  בחר בתשובה מהרשימה משמאל כדי לצפות בפרטים
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
                  <Button variant="outline" onClick={() => {}}>
                    כל השאלונים
                  </Button>
                  <Button variant="outline" onClick={() => {}}>
                    יצירת שאלון חדש
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questionnaires;
