import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Check, X, Circle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const dailyChallengeSchema = z.object({
  challengeType: z.string().min(1, { message: "בחר סוג אתגר" }),
  challengeDescription: z.string().min(1, { message: "תאר את האתגר" }),
  successCriteria: z.string().min(1, { message: "הגדר קריטריונים להצלחה" }),
  isCompleted: z.boolean().default(false),
  reward: z.string().optional(),
  penalty: z.string().optional(),
  notes: z.string().optional(),
});

const habitSchema = z.object({
  habitName: z.string().min(1, { message: "הכנס שם להרגל" }),
  habitDescription: z.string().min(1, { message: "תאר את ההרגל" }),
  frequency: z.string().min(1, { message: "בחר תדירות" }),
  isCompleted: z.boolean().default(false),
  notes: z.string().optional(),
});

const DailyChallenge = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const challengeForm = useForm({
    resolver: zodResolver(dailyChallengeSchema),
    defaultValues: {
      challengeType: "",
      challengeDescription: "",
      successCriteria: "",
      isCompleted: false,
      reward: "",
      penalty: "",
      notes: "",
    },
  });

  const habitForm = useForm({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      habitName: "",
      habitDescription: "",
      frequency: "",
      isCompleted: false,
      notes: "",
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: challengesData, error: challengesError } = await supabase
        .from('daily_challenges')
        .select('*');

      if (challengesError) {
        throw challengesError;
      }

      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*');

      if (habitsError) {
        throw habitsError;
      }

      setChallenges(challengesData || []);
      setHabits(habitsData || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת הנתונים",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeSubmit = async (values: any) => {
    try {
      const { error } = await supabase
        .from('daily_challenges')
        .insert([values]);

      if (error) {
        throw error;
      }

      toast({
        title: "הצלחה",
        description: "האתגר היומי נוסף בהצלחה!",
      });
      challengeForm.reset();
      fetchData();
    } catch (error: any) {
      console.error("Error adding challenge:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת האתגר היומי",
        variant: "destructive",
      });
    }
  };

  const handleHabitSubmit = async (values: any) => {
    try {
      const { error } = await supabase
        .from('habits')
        .insert([values]);

      if (error) {
        throw error;
      }

      toast({
        title: "הצלחה",
        description: "ההרגל היומי נוסף בהצלחה!",
      });
      habitForm.reset();
      fetchData();
    } catch (error: any) {
      console.error("Error adding habit:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת ההרגל היומי",
        variant: "destructive",
      });
    }
  };

  const updateChallengeCompletion = async (id: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('daily_challenges')
        .update({ isCompleted: !isCompleted })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "הצלחה",
        description: "סטטוס האתגר היומי עודכן בהצלחה!",
      });
      fetchData();
    } catch (error: any) {
      console.error("Error updating challenge completion:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון סטטוס האתגר היומי",
        variant: "destructive",
      });
    }
  };

  const updateHabitCompletion = async (id: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('habits')
        .update({ isCompleted: !isCompleted })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "הצלחה",
        description: "סטטוס ההרגל היומי עודכן בהצלחה!",
      });
      fetchData();
    } catch (error: any) {
      console.error("Error updating habit completion:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון סטטוס ההרגל היומי",
        variant: "destructive",
      });
    }
  };

  const deleteChallenge = async (id: string) => {
    try {
      const { error } = await supabase
        .from('daily_challenges')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "הצלחה",
        description: "האתגר היומי נמחק בהצלחה!",
      });
      fetchData();
    } catch (error: any) {
      console.error("Error deleting challenge:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת האתגר היומי",
        variant: "destructive",
      });
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "הצלחה",
        description: "ההרגל היומי נמחק בהצלחה!",
      });
      fetchData();
    } catch (error: any) {
      console.error("Error deleting habit:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת ההרגל היומי",
        variant: "destructive",
      });
    }
  };

  const handleSelectChallenge = (id: string) => {
    setSelectedChallengeId(id);
    const challenge = challenges.find((c) => c.id === id);
    if (challenge) {
      challengeForm.setValue("challengeType", challenge.challengeType);
      challengeForm.setValue("challengeDescription", challenge.challengeDescription);
      challengeForm.setValue("successCriteria", challenge.successCriteria);
      challengeForm.setValue("isCompleted", challenge.isCompleted);
      challengeForm.setValue("reward", challenge.reward || "");
      challengeForm.setValue("penalty", challenge.penalty || "");
      challengeForm.setValue("notes", challenge.notes || "");
    }
  };

  const handleSelectHabit = (id: string) => {
    setSelectedHabitId(id);
    const habit = habits.find((h) => h.id === id);
    if (habit) {
      habitForm.setValue("habitName", habit.habitName);
      habitForm.setValue("habitDescription", habit.habitDescription);
      habitForm.setValue("frequency", habit.frequency);
      habitForm.setValue("isCompleted", habit.isCompleted);
      habitForm.setValue("notes", habit.notes || "");
    }
  };

  const handleUpdateChallenge = async (values: any) => {
    if (!selectedChallengeId) return;
    try {
      const { error } = await supabase
        .from('daily_challenges')
        .update(values)
        .eq('id', selectedChallengeId);

      if (error) {
        throw error;
      }

      toast({
        title: "הצלחה",
        description: "האתגר היומי עודכן בהצלחה!",
      });
      challengeForm.reset();
      fetchData();
      setSelectedChallengeId(null);
    } catch (error: any) {
      console.error("Error updating challenge:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון האתגר היומי",
        variant: "destructive",
      });
    }
  };

  const handleUpdateHabit = async (values: any) => {
    if (!selectedHabitId) return;
    try {
      const { error } = await supabase
        .from('habits')
        .update(values)
        .eq('id', selectedHabitId);

      if (error) {
        throw error;
      }

      toast({
        title: "הצלחה",
        description: "ההרגל היומי עודכן בהצלחה!",
      });
      habitForm.reset();
      fetchData();
      setSelectedHabitId(null);
    } catch (error: any) {
      console.error("Error updating habit:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון ההרגל היומי",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 py-6">
      <div className="container mx-auto px-4">
        <Button
          variant="outline"
          size="icon"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>

        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="challenges">אתגרים יומיים</TabsTrigger>
            <TabsTrigger value="habits">הרגלים יומיים</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>הוסף אתגר יומי</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={challengeForm.handleSubmit(handleChallengeSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="challengeType">סוג אתגר</Label>
                    <Input
                      id="challengeType"
                      placeholder="לדוגמה: אתגר פיזי, אתגר מנטלי"
                      {...challengeForm.register("challengeType")}
                    />
                    {challengeForm.formState.errors.challengeType && (
                      <p className="text-sm text-red-500">{challengeForm.formState.errors.challengeType.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="challengeDescription">תיאור אתגר</Label>
                    <Textarea
                      id="challengeDescription"
                      placeholder="תאר את האתגר היומי"
                      {...challengeForm.register("challengeDescription")}
                    />
                    {challengeForm.formState.errors.challengeDescription && (
                      <p className="text-sm text-red-500">{challengeForm.formState.errors.challengeDescription.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="successCriteria">קריטריונים להצלחה</Label>
                    <Textarea
                      id="successCriteria"
                      placeholder="הגדר איך תדע שהצלחת באתגר"
                      {...challengeForm.register("successCriteria")}
                    />
                    {challengeForm.formState.errors.successCriteria && (
                      <p className="text-sm text-red-500">{challengeForm.formState.errors.successCriteria.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="reward">פרס (אופציונלי)</Label>
                    <Input
                      id="reward"
                      placeholder="פרס לעצמך אם תצליח"
                      {...challengeForm.register("reward")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="penalty">עונש (אופציונלי)</Label>
                    <Input
                      id="penalty"
                      placeholder="עונש לעצמך אם לא תצליח"
                      {...challengeForm.register("penalty")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">הערות (אופציונלי)</Label>
                    <Textarea
                      id="notes"
                      placeholder="הערות נוספות"
                      {...challengeForm.register("notes")}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    הוסף אתגר
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6 shadow-md">
              <CardHeader>
                <CardTitle>עדכן אתגר יומי</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={challengeForm.handleSubmit(handleUpdateChallenge)} className="space-y-4">
                  <div>
                    <Label htmlFor="challengeType">סוג אתגר</Label>
                    <Input
                      id="challengeType"
                      placeholder="לדוגמה: אתגר פיזי, אתגר מנטלי"
                      {...challengeForm.register("challengeType")}
                    />
                    {challengeForm.formState.errors.challengeType && (
                      <p className="text-sm text-red-500">{challengeForm.formState.errors.challengeType.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="challengeDescription">תיאור אתגר</Label>
                    <Textarea
                      id="challengeDescription"
                      placeholder="תאר את האתגר היומי"
                      {...challengeForm.register("challengeDescription")}
                    />
                    {challengeForm.formState.errors.challengeDescription && (
                      <p className="text-sm text-red-500">{challengeForm.formState.errors.challengeDescription.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="successCriteria">קריטריונים להצלחה</Label>
                    <Textarea
                      id="successCriteria"
                      placeholder="הגדר איך תדע שהצלחת באתגר"
                      {...challengeForm.register("successCriteria")}
                    />
                    {challengeForm.formState.errors.successCriteria && (
                      <p className="text-sm text-red-500">{challengeForm.formState.errors.successCriteria.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="reward">פרס (אופציונלי)</Label>
                    <Input
                      id="reward"
                      placeholder="פרס לעצמך אם תצליח"
                      {...challengeForm.register("reward")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="penalty">עונש (אופציונלי)</Label>
                    <Input
                      id="penalty"
                      placeholder="עונש לעצמך אם לא תצליח"
                      {...challengeForm.register("penalty")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">הערות (אופציונלי)</Label>
                    <Textarea
                      id="notes"
                      placeholder="הערות נוספות"
                      {...challengeForm.register("notes")}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    עדכן אתגר
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6 shadow-md">
              <CardHeader>
                <CardTitle>רשימת אתגרים יומיים</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>טוען...</p>
                ) : (
                  <div className="space-y-4">
                    {challenges.map((challenge) => (
                      <div key={challenge.id} className="flex items-center justify-between border p-4 rounded-md">
                        <div>
                          <h3 className="text-lg font-semibold">{challenge.challengeType}</h3>
                          <p className="text-gray-600">{challenge.challengeDescription}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`challenge-${challenge.id}`}
                            defaultChecked={challenge.isCompleted}
                            onCheckedChange={() => updateChallengeCompletion(challenge.id, challenge.isCompleted)}
                          />
                          <Label htmlFor={`challenge-${challenge.id}`}>הושלם</Label>
                          <Button variant="outline" size="sm" onClick={() => handleSelectChallenge(challenge.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            ערוך
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteChallenge(challenge.id)}>
                            <X className="h-4 w-4 mr-2" />
                            מחק
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="habits">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>הוסף הרגל יומי</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={habitForm.handleSubmit(handleHabitSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="habitName">שם ההרגל</Label>
                    <Input
                      id="habitName"
                      placeholder="לדוגמה: מדיטציה, קריאה"
                      {...habitForm.register("habitName")}
                    />
                    {habitForm.formState.errors.habitName && (
                      <p className="text-sm text-red-500">{habitForm.formState.errors.habitName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="habitDescription">תיאור ההרגל</Label>
                    <Textarea
                      id="habitDescription"
                      placeholder="תאר את ההרגל היומי"
                      {...habitForm.register("habitDescription")}
                    />
                    {habitForm.formState.errors.habitDescription && (
                      <p className="text-sm text-red-500">{habitForm.formState.errors.habitDescription.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="frequency">תדירות</Label>
                    <Select
                      onValueChange={(value) => habitForm.setValue("frequency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר תדירות" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">יומי</SelectItem>
                        <SelectItem value="weekly">שבועי</SelectItem>
                        <SelectItem value="monthly">חודשי</SelectItem>
                      </SelectContent>
                    </Select>
                    {habitForm.formState.errors.frequency && (
                      <p className="text-sm text-red-500">{habitForm.formState.errors.frequency.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="notes">הערות (אופציונלי)</Label>
                    <Textarea
                      id="notes"
                      placeholder="הערות נוספות"
                      {...habitForm.register("notes")}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    הוסף הרגל
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6 shadow-md">
              <CardHeader>
                <CardTitle>עדכן הרגל יומי</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={habitForm.handleSubmit(handleUpdateHabit)} className="space-y-4">
                  <div>
                    <Label htmlFor="habitName">שם ההרגל</Label>
                    <Input
                      id="habitName"
                      placeholder="לדוגמה: מדיטציה, קריאה"
                      {...habitForm.register("habitName")}
                    />
                    {habitForm.formState.errors.habitName && (
                      <p className="text-sm text-red-500">{habitForm.formState.errors.habitName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="habitDescription">תיאור ההרגל</Label>
                    <Textarea
                      id="habitDescription"
                      placeholder="תאר את ההרגל היומי"
                      {...habitForm.register("habitDescription")}
                    />
                    {habitForm.formState.errors.habitDescription && (
                      <p className="text-sm text-red-500">{habitForm.formState.errors.habitDescription.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="frequency">תדירות</Label>
                    <Select
                      onValueChange={(value) => habitForm.setValue("frequency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר תדירות" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">יומי</SelectItem>
                        <SelectItem value="weekly">שבועי</SelectItem>
                        <SelectItem value="monthly">חודשי</SelectItem>
                      </SelectContent>
                    </Select>
                    {habitForm.formState.errors.frequency && (
                      <p className="text-sm text-red-500">{habitForm.formState.errors.frequency.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="notes">הערות (אופציונלי)</Label>
                    <Textarea
                      id="notes"
                      placeholder="הערות נוספות"
                      {...habitForm.register("notes")}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    עדכן הרגל
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6 shadow-md">
              <CardHeader>
                <CardTitle>רשימת הרגלים יומיים</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>טוען...</p>
                ) : (
                  <div className="space-y-4">
                    {habits.map((habit) => (
                      <div key={habit.id} className="flex items-center justify-between border p-4 rounded-md">
                        <div>
                          <h3 className="text-lg font-semibold">{habit.habitName}</h3>
                          <p className="text-gray-600">{habit.habitDescription}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`habit-${habit.id}`}
                            defaultChecked={habit.isCompleted}
                            onCheckedChange={() => updateHabitCompletion(habit.id, habit.isCompleted)}
                          />
                          <Label htmlFor={`habit-${habit.id}`}>הושלם</Label>
                          <Button variant="outline" size="sm" onClick={() => handleSelectHabit(habit.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            ערוך
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteHabit(habit.id)}>
                            <X className="h-4 w-4 mr-2" />
                            מחק
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DailyChallenge;
