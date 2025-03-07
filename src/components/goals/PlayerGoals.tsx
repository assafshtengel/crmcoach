
import React, { useState, useEffect } from 'react';
import { CategorySelector } from './CategorySelector';
import { GoalForm } from './GoalForm';
import { GoalsList } from './GoalsList';
import { Goal, supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PlayerGoalsProps {
  playerId: string;
}

export const PlayerGoals: React.FC<PlayerGoalsProps> = ({ playerId }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'physical' | 'mental' | 'academic'>('physical');
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  useEffect(() => {
    if (playerId) {
      fetchGoals(playerId);
    }
  }, [playerId]);

  const fetchGoals = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

      if (error) {
        throw error;
      }

      // Map the data and ensure status field is set
      const mappedGoals = (data || []).map(goal => ({
        ...goal,
        status: goal.status || 'new',
        category: goal.category || 'physical'
      })) as Goal[];

      setGoals(mappedGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('שגיאה בטעינת המטרות');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (newGoal: Omit<Goal, 'id' | 'created_at'>) => {
    try {
      const goalWithUserId = {
        ...newGoal,
        user_id: playerId,
      };
      
      const { data, error } = await supabase
        .from('goals')
        .insert([goalWithUserId])
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        setGoals(prev => [...prev, data[0] as Goal]);
        toast.success('המטרה נוספה בהצלחה');
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('שגיאה בהוספת המטרה');
    }
  };

  const handleUpdateGoal = async (updatedGoal: Omit<Goal, 'id' | 'created_at'>) => {
    if (!editingGoal) return;

    try {
      const { error } = await supabase
        .from('goals')
        .update({
          title: updatedGoal.title,
          description: updatedGoal.description,
          due_date: updatedGoal.due_date,
          success_criteria: updatedGoal.success_criteria,
          type: updatedGoal.type,
          category: updatedGoal.category,
          status: updatedGoal.status,
        })
        .eq('id', editingGoal.id);

      if (error) {
        throw error;
      }

      setGoals(prev => 
        prev.map(goal => 
          goal.id === editingGoal.id 
            ? { ...goal, ...updatedGoal } 
            : goal
        )
      );
      
      toast.success('המטרה עודכנה בהצלחה');
      setEditingGoal(null);
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('שגיאה בעדכון המטרה');
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ completed: !completed })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setGoals(prev => 
        prev.map(goal => 
          goal.id === id ? { ...goal, completed: !completed } : goal
        )
      );
      
      toast.success(completed ? 'המטרה סומנה כלא הושלמה' : 'המטרה סומנה כהושלמה');
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('שגיאה בעדכון המטרה');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setGoals(prev => prev.filter(goal => goal.id !== id));
      toast.success('המטרה נמחקה בהצלחה');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('שגיאה במחיקת המטרה');
    }
  };

  const handleUpdateStatus = async (id: string, status: 'new' | 'in-progress' | 'achieved') => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ status })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setGoals(prev => 
        prev.map(goal => 
          goal.id === id ? { ...goal, status } : goal
        )
      );
      
      toast.success('סטטוס המטרה עודכן');
    } catch (error) {
      console.error('Error updating goal status:', error);
      toast.error('שגיאה בעדכון סטטוס המטרה');
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
  };

  const filteredGoals = goals.filter(goal => goal.category === activeCategory);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">המטרות שלי</h2>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>מטרה חדשה</span>
        </Button>
      </div>

      <CategorySelector 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />

      {showForm && (
        <GoalForm 
          onSubmit={handleAddGoal} 
          category={activeCategory}
          onCancel={() => setShowForm(false)}
        />
      )}

      <GoalsList 
        goals={filteredGoals} 
        onToggleComplete={handleToggleComplete}
        onDeleteGoal={handleDeleteGoal}
        onUpdateStatus={handleUpdateStatus}
        onEditGoal={handleEditGoal}
      />

      <Dialog open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>עריכת מטרה</DialogTitle>
            <DialogDescription>
              ערוך את פרטי המטרה שלך
            </DialogDescription>
          </DialogHeader>
          {editingGoal && (
            <GoalForm 
              onSubmit={handleUpdateGoal} 
              initialGoal={editingGoal}
              category={editingGoal.category as 'physical' | 'mental' | 'academic' || activeCategory}
              isEditing={true}
              onCancel={() => setEditingGoal(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
