
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuestionnaireTemplate, Questionnaire } from '@/types/questionnaire';
import TemplatesList from '@/components/questionnaires/TemplatesList';
import EditQuestionnaireDialog from '@/components/questionnaires/EditQuestionnaireDialog';
import AssignQuestionnaireDialog from '@/components/questionnaires/AssignQuestionnaireDialog';
import CompletedQuestionnairesList from '@/components/questionnaires/CompletedQuestionnairesList';
import {
  getSystemTemplates,
  getCoachTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getQuestionnaires,
  createQuestionnaire,
  deleteQuestionnaire,
  insertDefaultSystemTemplates
} from '@/services/questionnaireService';

const QuestionnairesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('templates');
  const [systemTemplates, setSystemTemplates] = useState<QuestionnaireTemplate[]>([]);
  const [coachTemplates, setCoachTemplates] = useState<QuestionnaireTemplate[]>([]);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<QuestionnaireTemplate | null>(null);
  const [isNewTemplate, setIsNewTemplate] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [templateToAssign, setTemplateToAssign] = useState<QuestionnaireTemplate | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
        return data.session.user.id;
      }
      return null;
    };

    const initializeData = async () => {
      try {
        setIsLoading(true);
        const currentUserId = await checkSession();
        
        if (!currentUserId) {
          toast({
            variant: "destructive",
            title: "לא מחובר",
            description: "יש להתחבר למערכת כדי לצפות בשאלונים"
          });
          navigate('/auth');
          return;
        }

        // Insert default system templates if they don't exist
        await insertDefaultSystemTemplates(currentUserId);

        // Load data
        const [systemTemplatesData, coachTemplatesData, questionnairesData] = await Promise.all([
          getSystemTemplates(),
          getCoachTemplates(),
          getQuestionnaires()
        ]);

        setSystemTemplates(systemTemplatesData);
        setCoachTemplates(coachTemplatesData);
        setQuestionnaires(questionnairesData);
      } catch (error) {
        console.error('Error loading questionnaires data:', error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת נתונים",
          description: "אירעה שגיאה בעת טעינת השאלונים. נסה שוב מאוחר יותר."
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [navigate, toast]);

  const handleEditTemplate = (template: QuestionnaireTemplate) => {
    setSelectedTemplate(template);
    setIsNewTemplate(false);
    setEditDialogOpen(true);
  };

  const handleCreateFromSystem = (systemTemplate: QuestionnaireTemplate) => {
    setSelectedTemplate({
      ...systemTemplate,
      id: '',
      title: `עותק אישי: ${systemTemplate.title}`,
      is_system_template: false,
      parent_template_id: systemTemplate.id,
      coach_id: userId || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setIsNewTemplate(true);
    setEditDialogOpen(true);
  };

  const handleSaveTemplate = async (templateData: Partial<QuestionnaireTemplate>) => {
    try {
      if (isNewTemplate) {
        if (!userId) throw new Error("User not authenticated");
        
        const newTemplate = await createTemplate({
          title: templateData.title || '',
          type: templateData.type || '',
          questions: templateData.questions || [],
          is_system_template: false,
          coach_id: userId,
          parent_template_id: selectedTemplate?.parent_template_id
        });
        
        if (newTemplate) {
          setCoachTemplates([...coachTemplates, newTemplate]);
        }
      } else if (templateData.id) {
        const updatedTemplate = await updateTemplate(templateData.id, {
          title: templateData.title,
          questions: templateData.questions
        });
        
        if (updatedTemplate) {
          setCoachTemplates(coachTemplates.map(t => 
            t.id === updatedTemplate.id ? updatedTemplate : t
          ));
        }
      }
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
      setCoachTemplates(coachTemplates.filter(t => t.id !== templateId));
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  };

  const handleAssignTemplate = (template: QuestionnaireTemplate) => {
    setTemplateToAssign(template);
    setAssignDialogOpen(true);
  };

  const handleAssignQuestionnaire = async (templateId: string, playerId: string) => {
    try {
      if (!userId) throw new Error("User not authenticated");
      
      const template = [...systemTemplates, ...coachTemplates].find(t => t.id === templateId);
      if (!template) throw new Error("Template not found");
      
      const newQuestionnaire = await createQuestionnaire({
        coach_id: userId,
        player_id: playerId,
        template_id: templateId,
        title: template.title,
        type: template.type,
        questions: template.questions,
        is_completed: false
      });
      
      if (newQuestionnaire) {
        // Don't need to update the questionnaires list since it would only display completed ones
        toast({
          title: "השאלון נשלח בהצלחה",
          description: "השאלון נשלח לשחקן"
        });
      }
    } catch (error) {
      console.error('Error assigning questionnaire:', error);
      throw error;
    }
  };

  const handleDeleteQuestionnaire = async (id: string) => {
    try {
      await deleteQuestionnaire(id);
      setQuestionnaires(questionnaires.filter(q => q.id !== id));
    } catch (error) {
      console.error('Error deleting questionnaire:', error);
      throw error;
    }
  };

  const completedQuestionnaires = questionnaires.filter(q => q.is_completed);

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
            <p className="text-gray-600">ניהול שאלונים למאמנים ושחקנים</p>
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

        <Tabs defaultValue="templates" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="templates">תבניות שאלונים</TabsTrigger>
            <TabsTrigger value="completed">שאלונים שמולאו ({completedQuestionnaires.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-0">
            <TemplatesList 
              templates={coachTemplates}
              systemTemplates={systemTemplates}
              onEditTemplate={handleEditTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onCreateFromSystem={handleCreateFromSystem}
              onAssignTemplate={handleAssignTemplate}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            <CompletedQuestionnairesList 
              questionnaires={completedQuestionnaires}
              onDelete={handleDeleteQuestionnaire}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Template Dialog */}
      <EditQuestionnaireDialog 
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        template={selectedTemplate}
        onSave={handleSaveTemplate}
        isNewTemplate={isNewTemplate}
      />

      {/* Assign Questionnaire Dialog */}
      <AssignQuestionnaireDialog 
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        template={templateToAssign}
        onAssign={handleAssignQuestionnaire}
      />
    </div>
  );
};

export default QuestionnairesPage;
