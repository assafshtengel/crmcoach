
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, Plus, Home } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { systemTemplates } from '@/data/systemTemplates';
import { PlayersProvider } from '@/contexts/PlayersContext';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import CreateQuestionnaireDialog from '@/components/questionnaires/CreateQuestionnaireDialog';
import { QuestionnaireTemplate } from '@/types/questionnaire';
import CompletedQuestionnairesList from '@/components/questionnaires/CompletedQuestionnairesList';

// Import the new component instead of QuestionnaireAccordion
import QuestionnaireTemplateStack from '@/components/questionnaires/QuestionnaireTemplateStack';

const QuestionnairesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('templates');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<QuestionnaireTemplate[]>([]);
  const { toast } = useToast();
  
  const hasCustomTemplates = customTemplates.length > 0;

  // Set up an auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          navigate('/auth');
        } else if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchCustomTemplates = async (userId: string) => {
    try {
      const { data: templates, error } = await supabase
        .from('questionnaire_templates')
        .select('*')
        .eq('coach_id', userId)
        .eq('is_system_template', false)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching templates:', error);
        throw error;
      }
      
      if (templates) {
        setCustomTemplates(templates);
      }
    } catch (error) {
      console.error('Error fetching custom templates:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת השאלונים",
        description: "אירעה שגיאה בעת טעינת השאלונים המותאמים אישית"
      });
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: "יש להתחבר תחילה",
            description: "על מנת לנהל שאלונים, יש להתחבר למערכת תחילה",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }
        
        setIsAuthenticated(true);
        
        // Fetch custom templates created by the coach
        await fetchCustomTemplates(session.user.id);
        
      } catch (error) {
        console.error('Error checking auth session:', error);
        toast({
          title: "שגיאה באימות",
          description: "אירעה שגיאה בעת בדיקת המשתמש המחובר",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [navigate, toast]);

  const handleTemplateCreated = (newTemplate: QuestionnaireTemplate) => {
    setCustomTemplates(prev => [newTemplate, ...prev]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render the full page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold">יש להתחבר למערכת תחילה</h1>
        <Button onClick={() => navigate('/auth')}>
          לדף התחברות
        </Button>
      </div>
    );
  }

  return (
    <PlayersProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">שאלונים</h1>
              <p className="text-gray-600">ניהול שאלונים למאמנים ושחקנים</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex items-center" 
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4 mr-2" />
                דף הבית
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center" 
                onClick={() => navigate('/dashboard-coach')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                חזרה לדשבורד
              </Button>
            </div>
          </div>

          <Tabs defaultValue="templates" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="templates">תבניות שאלונים</TabsTrigger>
              <TabsTrigger value="saved">שאלונים שמולאו</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="mt-0">
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">תבניות שאלונים מותאמות אישית</h2>
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center">
                    <Plus className="h-4 w-4 ml-2" />
                    צור שאלון מותאם
                  </Button>
                </div>

                {!hasCustomTemplates ? (
                  <Card className="bg-gray-50 border-dashed">
                    <CardContent className="text-center p-8">
                      <p className="text-gray-500">
                        אין לך עדיין תבניות שאלונים מותאמות אישית. צור גרסה מותאמת מאחת מתבניות המערכת למטה או צור שאלון חדש מאפס.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  // Replace the old QuestionnaireAccordion component with the new QuestionnaireTemplateStack component
                  <div className="grid grid-cols-1 gap-4">
                    <QuestionnaireTemplateStack 
                      templates={customTemplates}
                      onTemplateCreated={handleTemplateCreated}
                    />
                  </div>
                )}

                <Separator className="my-6" />

                <div>
                  <h2 className="text-xl font-semibold mb-4">תבניות שאלונים מובנות</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Replace the old QuestionnaireAccordion component with the new QuestionnaireTemplateStack component */}
                    <QuestionnaireTemplateStack 
                      templates={systemTemplates}
                      onTemplateCreated={handleTemplateCreated}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="saved" className="mt-0">
              <div>
                <h2 className="text-xl font-semibold mb-4">שאלונים שמולאו על ידי שחקנים</h2>
                <CompletedQuestionnairesList />
              </div>
            </TabsContent>
          </Tabs>

          <CreateQuestionnaireDialog 
            open={isCreateDialogOpen} 
            onOpenChange={setIsCreateDialogOpen} 
          />
        </div>
      </div>
    </PlayersProvider>
  );
};

export default QuestionnairesPage;
