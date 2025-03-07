
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Goal } from '@/integrations/supabase/client';
import { Pencil, Trash, Trophy, Clock, Circle } from 'lucide-react';

interface GoalItemProps {
  goal: Goal;
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, status: 'new' | 'in-progress' | 'achieved') => Promise<void>;
  onEditGoal: (goal: Goal) => void;
}

export const GoalItem: React.FC<GoalItemProps> = ({ 
  goal, 
  onToggleComplete, 
  onDeleteGoal,
  onUpdateStatus,
  onEditGoal
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDeleteGoal(goal.id);
    setIsDeleting(false);
  };

  const getStatusIcon = () => {
    switch (goal.status) {
      case 'new':
        return <Circle className="h-4 w-4 text-blue-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'achieved':
        return <Trophy className="h-4 w-4 text-green-500" />;
      default:
        return <Circle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusLabel = () => {
    switch (goal.status) {
      case 'new':
        return 'חדש';
      case 'in-progress':
        return 'בתהליך';
      case 'achieved':
        return 'הושג';
      default:
        return 'חדש';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  return (
    <Card className={`border-2 ${goal.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-2">
            <div>
              <Checkbox 
                id={`completed-${goal.id}`}
                checked={goal.completed}
                onCheckedChange={() => onToggleComplete(goal.id, goal.completed)}
              />
            </div>
            <div>
              <div className={`text-lg font-semibold ${goal.completed ? 'line-through text-gray-500' : ''}`}>
                {goal.title}
              </div>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="flex items-center gap-1">
                  {getStatusIcon()}
                  <span>{getStatusLabel()}</span>
                </Badge>
                {goal.due_date && (
                  <Badge variant="outline" className="text-xs">
                    יעד: {formatDate(goal.due_date)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => onEditGoal(goal)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-red-500"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4">
        {goal.description && (
          <p className="text-sm mb-2">{goal.description}</p>
        )}
        {goal.success_criteria && (
          <div className="text-sm bg-gray-50 p-2 rounded-md mt-2">
            <span className="font-semibold">מדד הצלחה:</span> {goal.success_criteria}
          </div>
        )}
        <div className="flex mt-3 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={`text-xs h-7 ${goal.status === 'new' ? 'bg-blue-50' : ''}`}
            onClick={() => onUpdateStatus(goal.id, 'new')}
          >
            <Circle className="h-3 w-3 mr-1" />
            חדש
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={`text-xs h-7 ${goal.status === 'in-progress' ? 'bg-yellow-50' : ''}`}
            onClick={() => onUpdateStatus(goal.id, 'in-progress')}
          >
            <Clock className="h-3 w-3 mr-1" />
            בתהליך
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={`text-xs h-7 ${goal.status === 'achieved' ? 'bg-green-50' : ''}`}
            onClick={() => onUpdateStatus(goal.id, 'achieved')}
          >
            <Trophy className="h-3 w-3 mr-1" />
            הושג
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
