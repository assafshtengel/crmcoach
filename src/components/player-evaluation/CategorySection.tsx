
import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Category } from '@/types/playerEvaluation';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

interface CategorySectionProps {
  category: Category;
  scores: Record<string, number>;
  updateScore: (questionId: string, score: number) => void;
}

export const CategorySection = ({ category, scores, updateScore }: CategorySectionProps) => {
  const isMobile = useIsMobile();

  return (
    <Card className="p-6">
      <h4 className="text-xl font-semibold mb-6">{category.name}</h4>
      <div className="space-y-8">
        {category.questions.map((question) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Label className="text-base font-medium">{question.text}</Label>
            <RadioGroup
              value={scores[question.id]?.toString()}
              onValueChange={(value) => updateScore(question.id, parseInt(value))}
              className="grid gap-3"
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-4 space-x-reverse">
                  <RadioGroupItem
                    value={option.score.toString()}
                    id={`${question.id}-${option.score}`}
                    className="border-2"
                  />
                  <Label
                    htmlFor={`${question.id}-${option.score}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};
