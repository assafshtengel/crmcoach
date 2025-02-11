
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormData } from '@/types/mentalPrep';
import { pressureLevels } from '@/constants/mentalPrepConstants';

interface QuestionsStepProps {
  formData: FormData;
  selectedQuestions: string[];
  updateFormData: (field: string, value: any) => void;
}

export const QuestionsStep = ({ formData, selectedQuestions, updateFormData }: QuestionsStepProps) => {
  const mandatoryQuestion = 'מה המילה שתשתמש בה על מנת להחזיר לעצמך את הביטחון ברגע שהוא יירד?';
  const allQuestions = [
    mandatoryQuestion,
    ...selectedQuestions.filter(q => q !== mandatoryQuestion)
  ];

  return (
    <div className="form-step space-y-4">
      <h2 className="text-2xl font-bold mb-6">שאלות פתוחות</h2>

      <div className="space-y-4 mb-6">
        <div className="space-y-2 relative">
          <Label>רמת הלחץ שאתה מרגיש כעת לפני המשחק</Label>
          <Select
            value={formData.currentPressure || ''}
            onValueChange={(value) => updateFormData('currentPressure', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר רמת לחץ" />
            </SelectTrigger>
            <SelectContent position="item-aligned" className="z-50 bg-white">
              {pressureLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 relative">
          <Label>רמת הלחץ האופטימלית עבורך לפני משחק</Label>
          <p className="text-sm text-gray-500 mb-2">
            (כל שחקן צריך שיהיה לו את הלחץ המתאים עבורו על מנת להגיע בצורה אופטימלית למשחק וכל שחקן חייב לדעת על פי משחקי העבר מה הלחץ המתאים עבורו)
          </p>
          <Select
            value={formData.optimalPressure || ''}
            onValueChange={(value) => updateFormData('optimalPressure', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר רמת לחץ אופטימלית" />
            </SelectTrigger>
            <SelectContent position="item-aligned" className="z-50 bg-white">
              {pressureLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {allQuestions.map((question, index) => (
        <div key={index} className="space-y-2">
          <Label>{question}</Label>
          <Textarea
            value={formData.answers[question] || ''}
            onChange={(e) => {
              updateFormData('answers', {
                ...formData.answers,
                [question]: e.target.value,
              });
            }}
            className="input-field"
            rows={3}
          />
        </div>
      ))}
    </div>
  );
};

