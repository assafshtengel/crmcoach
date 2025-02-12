
import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Category } from '@/types/playerEvaluation';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface CategorySectionProps {
  category: Category;
  scores: Record<string, number>;
  updateScore: (questionId: string, score: number) => void;
}

export const CategorySection = ({ category, scores, updateScore }: CategorySectionProps) => {
  const isMobile = useIsMobile();

  const calculateProgress = () => {
    const totalQuestions = category.questions.length;
    const answeredQuestions = category.questions.filter(q => scores[q.id]).length;
    return (answeredQuestions / totalQuestions) * 100;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-50">
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h4 className="text-xl font-semibold">{category.name}</h4>
          <div className="flex items-center gap-2">
            <Progress value={calculateProgress()} className="h-2" />
            <span className="text-sm text-gray-500">
              {Math.round(calculateProgress())}%
            </span>
          </div>
        </div>

        <div className="space-y-8">
          {category.questions.map((question, qIndex) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: qIndex * 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                  <span className="text-primary font-medium">{qIndex + 1}</span>
                </div>
                <Label className="text-base font-medium leading-tight">
                  {question.text}
                </Label>
              </div>

              <RadioGroup
                value={scores[question.id]?.toString()}
                onValueChange={(value) => updateScore(question.id, parseInt(value))}
                className="grid gap-3 pt-2"
              >
                {question.options.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Label
                      htmlFor={`${question.id}-${option.score}`}
                      className={`flex items-center p-4 rounded-lg border-2 transition-all cursor-pointer
                        ${scores[question.id]?.toString() === option.score.toString() 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                      <RadioGroupItem
                        value={option.score.toString()}
                        id={`${question.id}-${option.score}`}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{option.text}</span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm
                          ${scores[question.id]?.toString() === option.score.toString()
                            ? getScoreColor(option.score)
                            : 'bg-gray-200'}`}
                        >
                          {option.score}
                        </div>
                      </div>
                    </Label>
                  </motion.div>
                ))}
              </RadioGroup>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
};
