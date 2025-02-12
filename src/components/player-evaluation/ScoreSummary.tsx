
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { categories } from '@/types/playerEvaluation';

interface ScoreSummaryProps {
  scores: Record<string, number>;
}

interface CategoryScore {
  name: string;
  score: number;
  type: 'mental' | 'physical' | 'professional';
}

export const ScoreSummary = ({ scores }: ScoreSummaryProps) => {
  const calculateCategoryScore = (categoryId: string): number => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return 0;

    const categoryScores = category.questions
      .map(q => scores[q.id] || 0)
      .filter(score => score > 0);

    if (categoryScores.length === 0) return 0;
    return Math.round(categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length);
  };

  const categoryScores: CategoryScore[] = categories.map(category => ({
    name: category.name,
    score: calculateCategoryScore(category.id),
    type: category.type
  }));

  const getScoreColor = (score: number): string => {
    if (score >= 8) return '#8B5CF6'; // Vivid Purple
    if (score >= 6) return '#F97316'; // Bright Orange
    return '#ea384c'; // Red
  };

  const getFeedback = (score: number): string => {
    if (score >= 8) return 'מצוין';
    if (score >= 6) return 'טוב';
    if (score >= 4) return 'טעון שיפור';
    return 'חלש';
  };

  const getTotalScore = (): number => {
    const validScores = categoryScores.filter(cat => cat.score > 0);
    if (validScores.length === 0) return 0;
    return Math.round(validScores.reduce((acc, cat) => acc + cat.score, 0) / validScores.length);
  };

  const totalScore = getTotalScore();

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold">ציון כולל: {totalScore}/10</h3>
        <Progress value={totalScore * 10} className="h-3" 
          style={{ 
            backgroundColor: '#f3f4f6',
            '--progress-background': getScoreColor(totalScore)
          } as React.CSSProperties} 
        />
        <p className="text-sm text-gray-600">
          הערכה כללית: <span className="font-medium">{getFeedback(totalScore)}</span>
        </p>
      </div>

      <div className="grid gap-4">
        <div className="space-y-4">
          <h4 className="font-semibold">יכולות מנטליות</h4>
          {categoryScores
            .filter(cat => cat.type === 'mental')
            .map(cat => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{cat.name}</span>
                  <span>{cat.score}/10</span>
                </div>
                <Progress value={cat.score * 10} className="h-2"
                  style={{ 
                    backgroundColor: '#f3f4f6',
                    '--progress-background': getScoreColor(cat.score)
                  } as React.CSSProperties}
                />
              </div>
            ))}
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">יכולות גופניות</h4>
          {categoryScores
            .filter(cat => cat.type === 'physical')
            .map(cat => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{cat.name}</span>
                  <span>{cat.score}/10</span>
                </div>
                <Progress value={cat.score * 10} className="h-2"
                  style={{ 
                    backgroundColor: '#f3f4f6',
                    '--progress-background': getScoreColor(cat.score)
                  } as React.CSSProperties}
                />
              </div>
            ))}
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">יכולות מקצועיות</h4>
          {categoryScores
            .filter(cat => cat.type === 'professional')
            .map(cat => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{cat.name}</span>
                  <span>{cat.score}/10</span>
                </div>
                <Progress value={cat.score * 10} className="h-2"
                  style={{ 
                    backgroundColor: '#f3f4f6',
                    '--progress-background': getScoreColor(cat.score)
                  } as React.CSSProperties}
                />
              </div>
            ))}
        </div>
      </div>
    </Card>
  );
};
