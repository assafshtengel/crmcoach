
import React, { useState } from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Question, QuestionnaireTemplate } from '@/types/questionnaire';
import { Pencil, Save, X, Check } from 'lucide-react';
import { usePlayers } from '@/contexts/PlayersContext';

interface QuestionnaireAccordionProps {
  template: QuestionnaireTemplate;
}

const QuestionnaireAccordion: React.FC<QuestionnaireAccordionProps> = ({ template }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestions, setEditedQuestions] = useState<Question[]>(template.questions);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const { players } = usePlayers();

  const openQuestions = editedQuestions.filter(q => q.type === 'open');
  const closedQuestions = editedQuestions.filter(q => q.type === 'closed');

  const handleQuestionChange = (id: string, newText: string) => {
    setEditedQuestions(questions =>
      questions.map(q =>
        q.id === id ? { ...q, question_text: newText } : q
      )
    );
  };

  const handleSave = () => {
    // TODO: Implement save logic
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedQuestions(template.questions);
    setIsEditing(false);
  };

  const handleAssignQuestionnaire = () => {
    // TODO: Implement assignment logic
    console.log(`Assigning questionnaire ${template.id} to player ${selectedPlayerId}`);
  };

  return (
    <Card className="mb-4 overflow-hidden">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={template.id} className="border-0">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex-1 flex items-center justify-between pl-4">
              <span className="font-bold text-lg">{template.title}</span>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="mr-4"
                >
                  <Pencil className="h-4 w-4 ml-2" />
                  ערוך
                </Button>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6">
            <div className="space-y-6">
              {openQuestions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-md">שאלות פתוחות</h3>
                  <div className="space-y-4">
                    {openQuestions.map((question) => (
                      <div key={question.id} className="space-y-2">
                        {isEditing ? (
                          <Textarea
                            value={question.question_text}
                            onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                            className="w-full min-h-[100px]"
                            dir="rtl"
                          />
                        ) : (
                          <p className="text-right">{question.question_text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {closedQuestions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-md">שאלות סגורות</h3>
                  <div className="space-y-6">
                    {closedQuestions.map((question) => (
                      <div key={question.id} className="space-y-3">
                        {isEditing ? (
                          <Input
                            value={question.question_text}
                            onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                            className="w-full"
                            dir="rtl"
                          />
                        ) : (
                          <Label className="text-right block">{question.question_text}</Label>
                        )}
                        <div className="pr-2 pl-2">
                          <Slider
                            defaultValue={[5]}
                            max={10}
                            min={1}
                            step={1}
                            disabled={true}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 px-2">
                          <span>10</span>
                          <span>1</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 ml-2" />
                    בטל
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 ml-2" />
                    שמור שינויים
                  </Button>
                </div>
              )}

              {!isEditing && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-md mb-3">הקצאת שאלון לשחקן</h3>
                  <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 sm:items-center">
                    <div className="flex-1">
                      <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                        <SelectTrigger className="w-full" dir="rtl">
                          <SelectValue placeholder="בחר שחקן מתוך הרשימה" />
                        </SelectTrigger>
                        <SelectContent>
                          {players.length > 0 ? (
                            players.map((player) => (
                              <SelectItem key={player.id} value={player.id}>
                                {player.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-players" disabled>
                              אין שחקנים זמינים
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleAssignQuestionnaire}
                      disabled={!selectedPlayerId}
                      className="sm:mr-3 sm:flex-shrink-0"
                    >
                      <Check className="h-4 w-4 ml-2" />
                      שייך את השאלון לשחקן
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default QuestionnaireAccordion;
