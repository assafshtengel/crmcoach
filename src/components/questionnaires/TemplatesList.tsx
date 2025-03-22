
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Edit, Copy, Send, Trash2 } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuestionnaireTemplate } from '@/types/questionnaire';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface TemplatesListProps {
  templates: QuestionnaireTemplate[];
  systemTemplates: QuestionnaireTemplate[];
  onEditTemplate: (template: QuestionnaireTemplate) => void;
  onDeleteTemplate: (templateId: string) => Promise<void>;
  onCreateFromSystem: (systemTemplate: QuestionnaireTemplate) => void;
  onAssignTemplate: (template: QuestionnaireTemplate) => void;
}

const TemplatesList: React.FC<TemplatesListProps> = ({
  templates,
  systemTemplates,
  onEditTemplate,
  onDeleteTemplate,
  onCreateFromSystem,
  onAssignTemplate
}) => {
  const { toast } = useToast();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (templateId: string) => {
    setTemplateToDelete(templateId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;
    
    try {
      setIsDeleting(true);
      await onDeleteTemplate(templateToDelete);
      toast({
        title: "נמחק בהצלחה",
        description: "השאלון נמחק בהצלחה"
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        variant: "destructive",
        title: "שגיאה במחיקת השאלון",
        description: "אירעה שגיאה בעת מחיקת השאלון. נסה שנית."
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setTemplateToDelete(null);
    }
  };

  const getTemplateTypeBadge = (type: string) => {
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

  const renderSystemTemplateCard = (template: QuestionnaireTemplate) => {
    // Check if the coach already has a custom version of this system template
    const hasCustomVersion = templates.some(t => t.parent_template_id === template.id);
    
    return (
      <Card key={template.id} className="bg-white hover:bg-gray-50 transition-all duration-300">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-medium">{template.title}</CardTitle>
              <p className="text-sm text-gray-500">תבנית מערכת</p>
            </div>
            {getTemplateTypeBadge(template.type)}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm">
            <span className="font-semibold">מספר שאלות: </span>
            {template.questions.length}
          </p>
          <p className="text-sm">
            <span className="font-semibold">סוג: </span>
            {template.questions.filter(q => q.type === 'open').length} שאלות פתוחות, {template.questions.filter(q => q.type === 'closed').length} שאלות דירוג
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="ghost" 
            className="w-full flex justify-center items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={() => onCreateFromSystem(template)}
            disabled={hasCustomVersion}
          >
            <Copy className="h-4 w-4 mr-2" />
            {hasCustomVersion ? 'כבר יש לך גרסה מותאמת' : 'צור גרסה מותאמת אישית'}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderCoachTemplateCard = (template: QuestionnaireTemplate) => {
    const systemTemplate = systemTemplates.find(t => t.id === template.parent_template_id);
    
    return (
      <Card key={template.id} className="bg-white hover:bg-gray-50 transition-all duration-300 border-blue-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-medium">{template.title}</CardTitle>
              <p className="text-sm text-gray-500">
                עודכן: {format(new Date(template.updated_at), 'dd MMMM yyyy', { locale: he })}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              {getTemplateTypeBadge(template.type)}
              <Badge variant="outline" className="border-blue-500 text-blue-600">גרסה מותאמת אישית</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm">
            <span className="font-semibold">מספר שאלות: </span>
            {template.questions.length}
          </p>
          <p className="text-sm">
            <span className="font-semibold">סוג: </span>
            {template.questions.filter(q => q.type === 'open').length} שאלות פתוחות, {template.questions.filter(q => q.type === 'closed').length} שאלות דירוג
          </p>
          {systemTemplate && (
            <p className="text-sm">
              <span className="font-semibold">מבוסס על: </span>
              {systemTemplate.title}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <div className="w-full flex justify-between items-center">
            <Button 
              variant="ghost" 
              className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              onClick={() => onEditTemplate(template)}
            >
              <Edit className="h-4 w-4 mr-2" />
              ערוך
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">פעולות נוספות</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onAssignTemplate(template)}>
                  <Send className="h-4 w-4 mr-2" />
                  שלח לשחקן
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600" 
                  onClick={() => handleDeleteClick(template.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  מחק שאלון
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">תבניות שאלונים מותאמות אישית</h2>
          {templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => renderCoachTemplateCard(template))}
            </div>
          ) : (
            <Card className="bg-gray-50 border-dashed">
              <CardContent className="text-center p-8">
                <p className="text-gray-500">
                  אין לך עדיין תבניות שאלונים מותאמות אישית. צור גרסה מותאמת מאחת מתבניות המערכת למטה.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">תבניות שאלונים מובנות</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemTemplates.map(template => renderSystemTemplateCard(template))}
          </div>
        </div>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח שברצונך למחוק שאלון זה?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את תבנית השאלון המותאמת האישית שלך ולא ניתן יהיה לשחזר אותה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
              {isDeleting ? 'מוחק...' : 'מחק'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TemplatesList;
