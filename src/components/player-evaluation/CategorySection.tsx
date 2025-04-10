
import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Category } from '@/types/playerEvaluation';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface CategorySectionProps {
  category: Category;
  scores: Record<string, number>;
  updateScore: (questionId: string, score: number) => void;
  currentQuestionIndex: number;
  totalQuestions: number;
}

export const CategorySection = ({ 
  category, 
  scores, 
  updateScore,
  currentQuestionIndex,
  totalQuestions
}: CategorySectionProps) => {
  const calculateProgress = () => {
    return (Object.keys(scores).length / totalQuestions) * 100;
  };

  const getOptionColor = (isSelected: boolean) => {
    return isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
  };

  // בדיקת תקינות - אם אין שאלות
  if (!category.questions || !category.questions.length || !category.questions[0]) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">לא נמצאו שאלות</div>
      </Card>
    );
  }

  const currentQuestion = category.questions[0];
  
  // ערבוב התשובות
  const shuffledOptions = React.useMemo(() => {
    const options = [...currentQuestion.options];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  }, [currentQuestion.id]);

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-50">
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              שאלה {currentQuestionIndex + 1} מתוך {totalQuestions}
            </div>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>

        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <Label className="text-lg font-medium leading-tight block">
              {currentQuestion.text}
            </Label>

            <RadioGroup
              value={scores[currentQuestion.id]?.toString()}
              onValueChange={(value) => updateScore(currentQuestion.id, parseInt(value))}
              className="grid gap-3 pt-2"
            >
              {shuffledOptions.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Label
                    htmlFor={`${currentQuestion.id}-${index}`}
                    className={`flex items-center p-4 rounded-lg border-2 transition-all cursor-pointer
                      ${getOptionColor(scores[currentQuestion.id]?.toString() === option.score.toString())}`}
                  >
                    <RadioGroupItem
                      value={option.score.toString()}
                      id={`${currentQuestion.id}-${index}`}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{option.text}</span>
                    </div>
                  </Label>
                </motion.div>
              ))}
            </RadioGroup>
          </div>
        </motion.div>
      </div>
    </Card>
  );
};
