
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormData } from '@/types/mentalPrep';
import { pressureLevels, mandatoryQuestions, allQuestions } from '@/constants/mentalPrepConstants';
import { Card } from '@/components/ui/card';
import { Brain, AlignLeft } from 'lucide-react';

interface QuestionsStepProps {
  formData: FormData;
  selectedQuestions: string[];
  updateFormData: (field: string, value: any) => void;
}

export const QuestionsStep = ({ formData, selectedQuestions, updateFormData }: QuestionsStepProps) => {
  // הוסף את השאלות הקבועות ועוד 6 שאלות רנדומליות
  const displayQuestions = [
    mandatoryQuestions[0],
    ...selectedQuestions
  ];

  return (
    <div className="form-step space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">שאלות הכנה מנטלית</h2>
      </div>

      <div className="space-y-6">
        {/* שאלות לחץ */}
        <Card className="p-6 bg-primary/5 border-primary/10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <AlignLeft className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">רמות לחץ</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>רמת הלחץ שאתה מרגיש כעת לפני המשחק</Label>
                <Select
                  value={formData.currentPressure || ''}
                  onValueChange={(value) => updateFormData('currentPressure', value)}
                >
                  <SelectTrigger className="bg-white">
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

              <div className="space-y-2">
                <Label>רמת הלחץ האופטימלית עבורך לפני משחק</Label>
                <p className="text-sm text-gray-500 mb-2">
                  כל שחקן צריך שיהיה לו את הלחץ המתאים עבורו על מנת להגיע בצורה אופטימלית למשחק
                </p>
                <Select
                  value={formData.optimalPressure || ''}
                  onValueChange={(value) => updateFormData('optimalPressure', value)}
                >
                  <SelectTrigger className="bg-white">
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
          </div>
        </Card>

        {/* שאלות פתוחות */}
        <div className="grid gap-4">
          {displayQuestions.map((question, index) => (
            <Card 
              key={index} 
              className={`p-6 transition-all duration-300 hover:shadow-md ${
                index === 0 ? 'border-primary/20 bg-primary/5' : 'border-gray-100'
              }`}
            >
              <div className="space-y-3">
                <Label className="text-base font-medium">{question}</Label>
                <Textarea
                  value={formData.answers[question] || ''}
                  onChange={(e) => {
                    updateFormData('answers', {
                      ...formData.answers,
                      [question]: e.target.value,
                    });
                  }}
                  className="min-h-[100px] bg-white"
                  placeholder="הקלד את תשובתך כאן..."
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
