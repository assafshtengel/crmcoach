
import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    if (score >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card className="p-4">
      <h4 className="text-lg font-medium mb-4">{category.name}</h4>
      <div className="space-y-6">
        {category.questions.map((question) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <Label className="text-sm">{question.text}</Label>
            <div className={`flex gap-2 ${isMobile ? 'flex-wrap justify-center' : ''}`}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <motion.button
                  key={score}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateScore(question.id, score)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 
                    ${scores[question.id] === score 
                      ? `${getScoreColor(score)} text-white scale-110` 
                      : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                >
                  {score}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};
