
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormData } from '@/types/mentalPrep';

interface QuestionsStepProps {
  formData: FormData;
  selectedQuestions: string[];
  updateFormData: (field: string, value: any) => void;
}

export const QuestionsStep = ({ formData, selectedQuestions, updateFormData }: QuestionsStepProps) => {
  return (
    <div className="form-step space-y-4">
      <h2 className="text-2xl font-bold mb-6">שאלות פתוחות</h2>
      {selectedQuestions.map((question, index) => (
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
