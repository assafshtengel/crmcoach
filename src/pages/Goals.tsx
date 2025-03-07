
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
import { supabase } from "@/integrations/supabase/client";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  success_criteria: string | null;
  completed: boolean;
  type: 'long-term' | 'short-term' | 'immediate';
  user_id: string;
}

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState<Omit<Goal, 'id' | 'user_id' | 'created_at'>>({
    title: '',
    description: '',
    due_date: '',
    success_criteria: '',
    completed: false,
    type: 'long-term'
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('long-term');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        setGoals(data as Goal[]);
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([{
          ...newGoal,
          due_date: newGoal.due_date || new Date().toISOString()
        }])
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
          type: newGoal.type
        });
        toast.success('המטרה נוספה בהצלחה');
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('שגיאה בהוספת המטרה');
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

  const getCompletionPercentage = (type: string) => {
    const filteredGoals = goals.filter(goal => goal.type === type);
    if (filteredGoals.length === 0) return 0;
    
    const completedGoals = filteredGoals.filter(goal => goal.completed).length;
    return Math.round((completedGoals / filteredGoals.length) * 100);
  };

  const getGoalsByType = (type: string) => {
    return goals.filter(goal => goal.type === type);
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
            הגדר מטרות וצעדים נדרשים להשגתן בטווחי זמן שונים
          </p>
        </div>

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
                  <Progress value={getCompletionPercentage(type)} className="h-2" />
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-slate-50">
                    <h3 className="font-semibold mb-4">הוספת מטרה חדשה</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">כותרת המטרה</Label>
                        <Input
                          id="title"
                          name="title"
                          value={newGoal.title}
                          onChange={handleInputChange}
                          placeholder="הכנס כותרת למטרה"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="due_date">תאריך יעד</Label>
                        <Input
                          id="due_date"
                          name="due_date"
                          type="date"
                          value={newGoal.due_date ? new Date(newGoal.due_date).toISOString().split('T')[0] : ''}
                          onChange={handleInputChange}
                          required={type !== 'immediate'}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">תיאור המטרה</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={newGoal.description || ''}
                        onChange={handleInputChange}
                        placeholder="פרט את המטרה"
                        className="min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="success_criteria">מדד הצלחה</Label>
                      <Input
                        id="success_criteria"
                        name="success_criteria"
                        value={newGoal.success_criteria || ''}
                        onChange={handleInputChange}
                        placeholder="כיצד תדע שהשגת את המטרה?"
                      />
                    </div>
                    <Button type="submit" className="w-full">הוספת מטרה</Button>
                  </form>

                  <div className="space-y-4">
                    {loading ? (
                      <p className="text-center py-4">טוען מטרות...</p>
                    ) : getGoalsByType(type).length === 0 ? (
                      <p className="text-center py-4 text-gray-500">לא הוגדרו מטרות. הוסף את המטרה הראשונה שלך!</p>
                    ) : (
                      getGoalsByType(type).map((goal) => (
                        <Card key={goal.id} className={`border-2 ${goal.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <Checkbox 
                                  id={`completed-${goal.id}`}
                                  checked={goal.completed}
                                  onCheckedChange={() => toggleGoalCompletion(goal.id, goal.completed)}
                                />
                                <CardTitle className={`text-lg ${goal.completed ? 'line-through text-gray-500' : ''}`}>
                                  {goal.title}
                                </CardTitle>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500 h-8 px-2"
                                onClick={() => deleteGoal(goal.id)}
                              >
                                מחיקה
                              </Button>
                            </div>
                            {goal.due_date && (
                              <CardDescription>
                                תאריך יעד: {new Date(goal.due_date).toLocaleDateString('he-IL')}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0">
                            {goal.description && (
                              <p className="text-sm mb-2">{goal.description}</p>
                            )}
                            {goal.success_criteria && (
                              <div className="text-sm text-gray-600">
                                <span className="font-semibold">מדד הצלחה:</span> {goal.success_criteria}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
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
