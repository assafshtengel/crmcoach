
import React from 'react';
import { GoalItem } from './GoalItem';
import { Goal } from '@/integrations/supabase/client';
import { Progress } from "@/components/ui/progress";

interface GoalsListProps {
  goals: Goal[];
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, status: 'new' | 'in-progress' | 'achieved') => Promise<void>;
  onEditGoal: (goal: Goal) => void;
}

export const GoalsList: React.FC<GoalsListProps> = ({ 
  goals, 
  onToggleComplete, 
  onDeleteGoal,
  onUpdateStatus,
  onEditGoal
}) => {
  const completedCount = goals.filter(goal => goal.completed).length;
  const achievedCount = goals.filter(goal => goal.status === 'achieved').length;
  const inProgressCount = goals.filter(goal => goal.status === 'in-progress').length;
  const newCount = goals.filter(goal => goal.status === 'new').length;
  
  const completionPercentage = goals.length > 0 
    ? Math.round((completedCount / goals.length) * 100) 
    : 0;
    
  const statusDistribution = goals.length > 0 
    ? [
        { label: 'חדש', count: newCount, color: 'bg-blue-400' },
        { label: 'בתהליך', count: inProgressCount, color: 'bg-yellow-400' },
        { label: 'הושג', count: achievedCount, color: 'bg-green-400' }
      ]
    : [];

  return (
    <div className="space-y-4">
      {goals.length > 0 ? (
        <>
          <div className="bg-white p-4 rounded-lg border mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">התקדמות כללית</span>
              <span className="text-sm">{completedCount} / {goals.length} הושלמו</span>
            </div>
            <Progress value={completionPercentage} className="h-2 mb-4" />
            
            <div className="grid grid-cols-3 gap-2 mt-4">
              {statusDistribution.map((status, index) => (
                <div key={index} className="text-center">
                  <div className={`h-2 rounded-full ${status.color} mb-1`}></div>
                  <div className="text-xs font-medium">{status.label}</div>
                  <div className="text-sm">{status.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {goals.map((goal) => (
              <GoalItem 
                key={goal.id} 
                goal={goal} 
                onToggleComplete={onToggleComplete}
                onDeleteGoal={onDeleteGoal}
                onUpdateStatus={onUpdateStatus}
                onEditGoal={onEditGoal}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border">
          <p>אין מטרות בקטגוריה זו</p>
          <p className="text-sm mt-2">הוסף את המטרה הראשונה שלך בקטגוריה זו</p>
        </div>
      )}
    </div>
  );
};
