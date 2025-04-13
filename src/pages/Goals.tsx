import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Check, Clock, Flag, Plus, Target, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Goals = () => {
  const [shortTermGoals, setShortTermGoals] = useState<any[]>([]);
  const [longTermGoals, setLongTermGoals] = useState<any[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [newMetric, setNewMetric] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const shortTerm = data.filter(goal => goal.type === 'short-term');
        const longTerm = data.filter(goal => goal.type === 'long-term');
        setShortTermGoals(shortTerm);
        setLongTermGoals(longTerm);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (type: string) => {
    if (!newGoal.trim() || !newMetric.trim()) {
      toast.error('Please fill in both goal and metric fields.');
      return;
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data, error } = await supabase
        .from('goals')
        .insert([
          {
            goal: newGoal,
            metric: newMetric,
            deadline: deadline ? deadline.toISOString() : null,
            type: type,
            user_id: session.session.user.id,
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        if (type === 'short-term') {
          setShortTermGoals([...data, ...shortTermGoals]);
        } else {
          setLongTermGoals([...data, ...longTermGoals]);
        }
        setNewGoal('');
        setNewMetric('');
        setDeadline(undefined);
        toast.success('Goal added successfully!');
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('Failed to add goal. Please try again.');
    }
  };

  const deleteGoal = async (id: string, type: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      if (type === 'short-term') {
        setShortTermGoals(shortTermGoals.filter(goal => goal.id !== id));
      } else {
        setLongTermGoals(longTermGoals.filter(goal => goal.id !== id));
      }
      toast.success('Goal deleted successfully!');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal. Please try again.');
    }
  };

  const completeGoal = async (id: string, type: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ completed: !completed })
        .eq('id', id);

      if (error) {
        throw error;
      }

      if (type === 'short-term') {
        setShortTermGoals(
          shortTermGoals.map(goal =>
            goal.id === id ? { ...goal, completed: !completed } : goal
          )
        );
      } else {
        setLongTermGoals(
          longTermGoals.map(goal =>
            goal.id === id ? { ...goal, completed: !completed } : goal
          )
        );
      }
      toast.success(`Goal ${completed ? 'unmarked' : 'marked'} as complete!`);
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            קבע את המטרות שלך – והתחל לכבוש!
          </h1>
          <p className="text-gray-600">
            מה החלום שלך? כאן תוכל לתכנן את הדרך להגשים אותו, צעד אחר צעד.
          </p>
        </div>

        <Tabs defaultValue="short-term" className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="short-term" className="flex-1">
              מטרות קצרות טווח
            </TabsTrigger>
            <TabsTrigger value="long-term" className="flex-1">
              מטרות ארוכות טווח
            </TabsTrigger>
          </TabsList>

          <TabsContent value="short-term" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>הוספת מטרה קצרת טווח</CardTitle>
                <CardDescription>
                  מה תרצה להשיג בשבוע הקרוב?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="short-term-goal">המטרה שלי</Label>
                  <Input
                    id="short-term-goal"
                    placeholder="לדוגמה: לשפר את הבעיטות שלי"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="short-term-metric">איך אדע שהשגתי אותה?</Label>
                  <Textarea
                    id="short-term-metric"
                    placeholder="לדוגמה: אצליח לפגוע במטרה מ-8 מתוך 10 בעיטות"
                    value={newMetric}
                    onChange={(e) => setNewMetric(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>דדליין (אופציונלי)</Label>
                  <DatePicker onSelect={setDeadline} />
                </div>
                <Button onClick={() => addGoal('short-term')} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  הוספת מטרה
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>רשימת מטרות קצרות טווח</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>טוען מטרות...</p>
                ) : shortTermGoals.length === 0 ? (
                  <p>אין מטרות קצרות טווח כרגע. הוסף כמה!</p>
                ) : (
                  <div className="space-y-3">
                    {shortTermGoals.map(goal => (
                      <Card key={goal.id} className="shadow-sm">
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <h3 className="text-lg font-semibold">{goal.goal}</h3>
                            <p className="text-sm text-gray-500">{goal.metric}</p>
                            {goal.deadline && (
                              <p className="text-xs text-gray-400">
                                דדליין: {new Date(goal.deadline).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2 rtl:space-x-reverse">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => deleteGoal(goal.id, 'short-term')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => completeGoal(goal.id, 'short-term', goal.completed)}
                            >
                              {goal.completed ? (
                                <Clock className="w-4 h-4 text-green-500" />
                              ) : (
                                <Check className="w-4 h-4 text-gray-500" />
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="long-term" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>הוספת מטרה ארוכת טווח</CardTitle>
                <CardDescription>
                  מה תרצה להשיג בעוד שנה? חמש שנים?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="long-term-goal">המטרה שלי</Label>
                  <Input
                    id="long-term-goal"
                    placeholder="לדוגמה: להפוך לשחקן הרכב בקבוצה"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="long-term-metric">איך אדע שהשגתי אותה?</Label>
                  <Textarea
                    id="long-term-metric"
                    placeholder="לדוגמה: אשחק לפחות 70% מהמשחקים"
                    value={newMetric}
                    onChange={(e) => setNewMetric(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>דדליין (אופציונלי)</Label>
                  <DatePicker onSelect={setDeadline} />
                </div>
                <Button onClick={() => addGoal('long-term')} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  הוספת מטרה
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>רשימת מטרות ארוכות טווח</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>טוען מטרות...</p>
                ) : longTermGoals.length === 0 ? (
                  <p>אין מטרות ארוכות טווח כרגע. הוסף כמה!</p>
                ) : (
                  <div className="space-y-3">
                    {longTermGoals.map(goal => (
                      <Card key={goal.id} className="shadow-sm">
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <h3 className="text-lg font-semibold">{goal.goal}</h3>
                            <p className="text-sm text-gray-500">{goal.metric}</p>
                            {goal.deadline && (
                              <p className="text-xs text-gray-400">
                                דדליין: {new Date(goal.deadline).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2 rtl:space-x-reverse">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => deleteGoal(goal.id, 'long-term')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => completeGoal(goal.id, 'long-term', goal.completed)}
                            >
                              {goal.completed ? (
                                <Clock className="w-4 h-4 text-green-500" />
                              ) : (
                                <Check className="w-4 h-4 text-gray-500" />
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <Button onClick={() => navigate('/daily-challenge')} className="w-full">
          <Target className="w-4 h-4 mr-2" />
          בוא נתחיל באתגר היומי!
        </Button>
      </div>
    </div>
  );
};

export default Goals;
