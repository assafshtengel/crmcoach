
import React, { useState, useEffect } from 'react';
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Target, Clock, ListChecks } from "lucide-react";
import { supabase, Goal } from "@/integrations/supabase/client";
import { CategorySelector } from "@/components/goals/CategorySelector";
import { GoalForm } from "@/components/goals/GoalForm";
import { GoalsList } from "@/components/goals/GoalsList";

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState<Omit<Goal, 'id' | 'created_at'>>({
    title: '',
    description: '',
    due_date: '',
    success_criteria: '',
    completed: false,
    type: 'long-term',
    user_id: '',
    category: 'physical',
    status: 'new'
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('long-term');
  const [activeCategory, setActiveCategory] = useState<'physical' | 'mental' | 'academic'>('physical');
  const [userId, setUserId] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  useEffect(() => {
    // Get the current user and fetch goals
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchGoals(user.id);
      } else {
        // For demo purposes, use a fixed ID if not authenticated
        const demoId = '00000000-0000-0000-0000-000000000000';
        setUserId(demoId);
        fetchGoals(demoId);
      }
    };
    
    getUser();
  }, []);

  const fetchGoals = async (uid: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', uid)
        .order('due_date', { ascending: true });

      if (error) {
        throw error;
      }

      // Ensure all goals have the required fields
      const processedGoals = (data || []).map(goal => ({
        ...goal,
        category: goal.category || 'physical',
        status: goal.status || 'new'
      })) as Goal[];

      setGoals(processedGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewGoal(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type: 'long-term' | 'short-term' | 'immediate') => {
    setNewGoal(prev => ({ ...prev, type }));
    setActiveTab(type);
  };

  const handleSubmit = async (goalData: Omit<Goal, 'id' | 'created_at'>) => {
    if (!userId) {
      toast.error('משתמש לא מחובר');
      return;
    }
    
    try {
      const goalWithUserId = {
        ...goalData,
        user_id: userId,
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
        setNewGoal({
          title: '',
          description: '',
          due_date: '',
          success_criteria: '',
          completed: false,
          type: goalData.type,
          user_id: '',
          category: goalData.category,
          status: 'new'
        });
        toast.success('המטרה נוספה בהצלחה');
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

  const toggleGoalCompletion = async (id: string, completed: boolean) => {
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

  const deleteGoal = async (id: string) => {
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

  const updateGoalStatus = async (id: string, status: 'new' | 'in-progress' | 'achieved') => {
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

  const getGoalsByType = (type: string) => {
    return goals.filter(goal => goal.type === type && goal.category === activeCategory);
  };

  const getTabLabel = (type: string) => {
    switch (type) {
      case 'long-term':
        return 'מטרות ארוכות טווח';
      case 'short-term':
        return 'מטרות קצרות טווח';
      case 'immediate':
        return 'פעילויות מיידיות';
      default:
        return '';
    }
  };

  const getTabIcon = (type: string) => {
    switch (type) {
      case 'long-term':
        return <Target className="h-4 w-4 ml-2" />;
      case 'short-term':
        return <Clock className="h-4 w-4 ml-2" />;
      case 'immediate':
        return <ListChecks className="h-4 w-4 ml-2" />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-center">מטרות</h1>
          <p className="text-gray-500 text-center">
            הגדר מטרות וצעדים נדרשים להשגתן בטווחי זמן וקטגוריות שונים
          </p>
        </div>

        <CategorySelector 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />

        <Tabs defaultValue="long-term" value={activeTab} onValueChange={(value) => setActiveTab(value as 'long-term' | 'short-term' | 'immediate')}>
          <TabsList className="w-full mb-8 flex justify-center">
            <TabsTrigger value="long-term" onClick={() => handleTypeChange('long-term')} className="flex items-center">
              {getTabIcon('long-term')}
              {getTabLabel('long-term')}
            </TabsTrigger>
            <TabsTrigger value="short-term" onClick={() => handleTypeChange('short-term')} className="flex items-center">
              {getTabIcon('short-term')}
              {getTabLabel('short-term')}
            </TabsTrigger>
            <TabsTrigger value="immediate" onClick={() => handleTypeChange('immediate')} className="flex items-center">
              {getTabIcon('immediate')}
              {getTabLabel('immediate')}
            </TabsTrigger>
          </TabsList>

          {['long-term', 'short-term', 'immediate'].map((type) => (
            <TabsContent key={type} value={type} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{getTabLabel(type)}</span>
                    <span className="text-sm font-normal">
                      {getGoalsByType(type).filter(g => g.completed).length} / {getGoalsByType(type).length} הושלמו
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {type === 'long-term' && 'מטרות לטווח של 3 שנים קדימה'}
                    {type === 'short-term' && 'מטרות לטווח של 3 חודשים קדימה'}
                    {type === 'immediate' && 'משימות לביצוע מיידי'}
                  </CardDescription>
                  <Progress 
                    value={
                      getGoalsByType(type).length > 0 
                      ? Math.round((getGoalsByType(type).filter(g => g.completed).length / getGoalsByType(type).length) * 100)
                      : 0
                    } 
                    className="h-2" 
                  />
                </CardHeader>
                <CardContent>
                  <GoalForm 
                    onSubmit={handleSubmit} 
                    category={activeCategory}
                    initialGoal={{
                      ...newGoal,
                      id: '',
                      type: type as 'long-term' | 'short-term' | 'immediate'
                    }}
                  />

                  <div className="mt-8">
                    <GoalsList 
                      goals={getGoalsByType(type)} 
                      onToggleComplete={toggleGoalCompletion}
                      onDeleteGoal={deleteGoal}
                      onUpdateStatus={updateGoalStatus}
                      onEditGoal={setEditingGoal}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Goals;
