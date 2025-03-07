
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Goal } from '@/integrations/supabase/client';

interface GoalFormProps {
  onSubmit: (goal: Omit<Goal, 'id' | 'created_at'>) => Promise<void>;
  initialGoal?: Goal;
  category: 'physical' | 'mental' | 'academic';
  isEditing?: boolean;
  onCancel?: () => void;
}

export const GoalForm: React.FC<GoalFormProps> = ({ 
  onSubmit, 
  initialGoal, 
  category,
  isEditing = false,
  onCancel
}) => {
  const [formState, setFormState] = useState<Omit<Goal, 'id' | 'created_at'>>({
    title: '',
    description: '',
    due_date: '',
    success_criteria: '',
    completed: false,
    type: 'short-term',
    user_id: '',
    category: category,
    status: 'new'
  });

  useEffect(() => {
    if (initialGoal) {
      setFormState({
        title: initialGoal.title,
        description: initialGoal.description,
        due_date: initialGoal.due_date ? new Date(initialGoal.due_date).toISOString().split('T')[0] : '',
        success_criteria: initialGoal.success_criteria,
        completed: initialGoal.completed,
        type: initialGoal.type,
        user_id: initialGoal.user_id,
        category: initialGoal.category || category,
        status: initialGoal.status || 'new'
      });
    } else {
      setFormState(prev => ({
        ...prev,
        category: category
      }));
    }
  }, [initialGoal, category]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formState);
    if (!isEditing) {
      setFormState({
        title: '',
        description: '',
        due_date: '',
        success_criteria: '',
        completed: false,
        type: 'short-term',
        user_id: '',
        category: category,
        status: 'new'
      });
    }
  };

  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {isEditing ? 'עריכת מטרה' : 'הוספת מטרה חדשה'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">כותרת המטרה</Label>
            <Input
              id="title"
              name="title"
              value={formState.title}
              onChange={handleChange}
              placeholder="הכנס כותרת למטרה"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">תאריך יעד</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                value={formState.due_date}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">טווח זמן</Label>
              <Select 
                name="type" 
                value={formState.type} 
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר טווח זמן" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long-term">ארוך טווח</SelectItem>
                  <SelectItem value="short-term">קצר טווח</SelectItem>
                  <SelectItem value="immediate">מיידי</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">תיאור המטרה</Label>
            <Textarea
              id="description"
              name="description"
              value={formState.description || ''}
              onChange={handleChange}
              placeholder="פרט את המטרה"
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="success_criteria">מדד הצלחה</Label>
            <Input
              id="success_criteria"
              name="success_criteria"
              value={formState.success_criteria || ''}
              onChange={handleChange}
              placeholder="כיצד תדע שהשגת את המטרה?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">סטטוס</Label>
            <Select 
              name="status" 
              value={formState.status} 
              onValueChange={(value) => handleSelectChange('status', value as 'new' | 'in-progress' | 'achieved')}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">חדש</SelectItem>
                <SelectItem value="in-progress">בתהליך</SelectItem>
                <SelectItem value="achieved">הושג</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {isEditing && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                ביטול
              </Button>
            )}
            <Button type="submit">
              {isEditing ? 'עדכון מטרה' : 'הוספת מטרה'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
