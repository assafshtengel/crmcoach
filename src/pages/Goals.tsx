import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowRight, Target, Clock, CheckCircle } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { supabase } from '@/lib/supabase';
import { cn } from "@/lib/utils";

const goalSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().optional(),
  dueDate: z.date({
    required_error: "A date of completion is required.",
  }),
});

type GoalFormValues = z.infer<typeof goalSchema>;

const Goals = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: new Date(),
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    control,
  } = form;

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('dueDate', { ascending: true });

      if (error) {
        console.error("Error fetching goals:", error);
      } else {
        setGoals(data || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const onSubmit = async (data: GoalFormValues) => {
    try {
      const { error } = await supabase
        .from('goals')
        .insert([
          {
            title: data.title,
            description: data.description,
            dueDate: data.dueDate.toISOString(),
            isCompleted: false,
          },
        ]);

      if (error) {
        console.error("Error adding goal:", error);
      } else {
        reset();
        fetchGoals();
      }
    } catch (error) {
      console.error("Unexpected error adding goal:", error);
    }
  };

  const toggleComplete = async (id: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ isCompleted: !isCompleted })
        .eq('id', id);

      if (error) {
        console.error("Error updating goal:", error);
      } else {
        fetchGoals();
      }
    } catch (error) {
      console.error("Unexpected error updating goal:", error);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting goal:", error);
      } else {
        fetchGoals();
      }
    } catch (error) {
      console.error("Unexpected error deleting goal:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="outline"
          size="icon"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              הגדרת מטרות
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              הגדר את המטרות שלך כדי להישאר ממוקד ובעל מוטיבציה.
            </p>
          </div>

          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  הוסף מטרה חדשה
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="title">כותרת</Label>
                      <Input
                        type="text"
                        id="title"
                        placeholder="הכנס כותרת"
                        {...register("title")}
                      />
                      {errors.title && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.title.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="description">תיאור</Label>
                      <Textarea
                        id="description"
                        placeholder="הכנס תיאור"
                        {...register("description")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dueDate">תאריך יעד</Label>
                      <DatePicker
                        {...{
                          id: "dueDate",
                          control,
                          name: "dueDate",
                          onChange: () => { },
                        }}
                      />
                      {errors.dueDate && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.dueDate.message}
                        </p>
                      )}
                    </div>
                    <Button type="submit">הוסף מטרה</Button>
                  </form>
                </dd>
              </div>

              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  רשימת מטרות
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {loading ? (
                    <p>טוען מטרות...</p>
                  ) : goals.length === 0 ? (
                    <p>אין מטרות כרגע.</p>
                  ) : (
                    <ul className="list-none space-y-4">
                      {goals.map((goal) => (
                        <li
                          key={goal.id}
                          className="border rounded-md p-4 flex items-center justify-between"
                        >
                          <div>
                            <h4
                              className={cn(
                                "font-semibold",
                                goal.isCompleted ? "line-through text-gray-500" : ""
                              )}
                            >
                              {goal.title}
                            </h4>
                            <p className="text-gray-500">{goal.description}</p>
                            <p className="text-gray-400">
                              תאריך יעד:{" "}
                              {new Date(goal.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                toggleComplete(goal.id, goal.isCompleted)
                              }
                            >
                              {goal.isCompleted ? (
                                <Clock className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => deleteGoal(goal.id)}
                            >
                              <Target className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;
