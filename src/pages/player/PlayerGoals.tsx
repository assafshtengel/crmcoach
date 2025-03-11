
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isAfter } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowRight,
  Calendar as CalendarIcon,
  Plus,
  Target,
  Flag,
  TrendingUp,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  CheckCircle,
} from "lucide-react";

// Schema for creating a new goal
const goalFormSchema = z.object({
  title: z.string().min(2, { message: "שם המטרה חייב להכיל לפחות 2 תווים" }),
  description: z.string().min(5, { message: "תיאור המטרה חייב להכיל לפחות 5 תווים" }),
  target_date: z.date({ required_error: "נא לבחור תאריך יעד" }),
  success_criteria: z.string().min(5, { message: "קריטריון להצלחה חייב להכיל לפחות 5 תווים" }),
});

// Schema for milestone steps
const milestoneSchema = z.object({
  title: z.string().min(2, { message: "כותרת השלב חייבת להכיל לפחות 2 תווים" }),
  description: z.string().optional(),
  due_date: z.date().optional(),
  is_completed: z.boolean().default(false),
});

// Types for our components
type Goal = {
  id: string;
  title: string;
  description: string;
  target_date: string;
  success_criteria: string;
  player_id: string;
  coach_id: string;
  created_at: string;
  progress: number;
};

type Milestone = {
  id: string;
  goal_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  is_completed: boolean;
  created_at: string;
};

export default function PlayerGoals() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isNewGoalDialogOpen, setIsNewGoalDialogOpen] = useState(false);
  const [isNewMilestoneDialogOpen, setIsNewMilestoneDialogOpen] = useState(false);
  const [playerData, setPlayerData] = useState<any>(null);

  // Form for creating a new goal
  const goalForm = useForm<z.infer<typeof goalFormSchema>>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: "",
      description: "",
      success_criteria: "",
    },
  });

  // Form for creating a new milestone
  const milestoneForm = useForm<z.infer<typeof milestoneSchema>>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: "",
      description: "",
      is_completed: false,
    },
  });

  // Fetch player data and goals when component mounts
  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/player-auth");
          return;
        }

        // Fetch player data
        const { data: playerData, error: playerError } = await supabase
          .from("players")
          .select("*")
          .eq("id", user.id)
          .single();

        if (playerError) {
          console.error("Error fetching player data:", playerError);
          return;
        }

        setPlayerData(playerData);

        // Fetch goals for this player
        fetchGoals(user.id);
      } catch (error) {
        console.error("Error in fetching player data:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת נתוני השחקן",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [navigate, toast]);

  // Fetch goals for a player
  const fetchGoals = async (playerId: string) => {
    try {
      const { data, error } = await supabase
        .from("player_goals")
        .select("*")
        .eq("player_id", playerId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Map data to Goal type with progress calculation
      const goalsWithProgress = await Promise.all(
        data.map(async (goal) => {
          // Fetch milestones for this goal to calculate progress
          const { data: goalMilestones, error: milestonesError } = await supabase
            .from("goal_milestones")
            .select("*")
            .eq("goal_id", goal.id);

          if (milestonesError) {
            console.error("Error fetching milestones:", milestonesError);
            return { ...goal, progress: 0 };
          }

          // Calculate progress based on completed milestones
          const progress = goalMilestones.length > 0
            ? (goalMilestones.filter(m => m.is_completed).length / goalMilestones.length) * 100
            : 0;

          return { ...goal, progress };
        })
      );

      setGoals(goalsWithProgress);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת המטרות",
        variant: "destructive",
      });
    }
  };

  // Fetch milestones for a specific goal
  const fetchMilestones = async (goalId: string) => {
    try {
      const { data, error } = await supabase
        .from("goal_milestones")
        .select("*")
        .eq("goal_id", goalId)
        .order("due_date", { ascending: true });

      if (error) {
        throw error;
      }

      setMilestones(data || []);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת אבני הדרך",
        variant: "destructive",
      });
    }
  };

  // Handle goal selection
  const handleGoalSelect = (goal: Goal) => {
    setSelectedGoal(goal);
    fetchMilestones(goal.id);
  };

  // Create a new goal
  const onCreateGoal = async (values: z.infer<typeof goalFormSchema>) => {
    try {
      if (!playerData) {
        toast({
          title: "שגיאה",
          description: "לא נמצאו נתוני שחקן",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.from("player_goals").insert({
        player_id: playerData.id,
        coach_id: playerData.coach_id,
        title: values.title,
        description: values.description,
        target_date: values.target_date.toISOString(),
        success_criteria: values.success_criteria,
      }).select();

      if (error) {
        throw error;
      }

      // Reset form and close dialog
      goalForm.reset();
      setIsNewGoalDialogOpen(false);

      // Refresh goals list
      fetchGoals(playerData.id);

      toast({
        title: "מטרה נוספה בהצלחה",
        description: "המטרה החדשה נוספה בהצלחה",
      });
    } catch (error) {
      console.error("Error creating goal:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת המטרה",
        variant: "destructive",
      });
    }
  };

  // Create a new milestone
  const onCreateMilestone = async (values: z.infer<typeof milestoneSchema>) => {
    try {
      if (!selectedGoal) {
        toast({
          title: "שגיאה",
          description: "לא נבחרה מטרה",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.from("goal_milestones").insert({
        goal_id: selectedGoal.id,
        title: values.title,
        description: values.description || null,
        due_date: values.due_date ? values.due_date.toISOString() : null,
        is_completed: values.is_completed,
      });

      if (error) {
        throw error;
      }

      // Reset form and close dialog
      milestoneForm.reset();
      setIsNewMilestoneDialogOpen(false);

      // Refresh milestones list
      fetchMilestones(selectedGoal.id);
      
      // Refresh goals to update progress
      if (playerData) {
        fetchGoals(playerData.id);
      }

      toast({
        title: "אבן דרך נוספה בהצלחה",
        description: "אבן הדרך החדשה נוספה בהצלחה",
      });
    } catch (error) {
      console.error("Error creating milestone:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת אבן הדרך",
        variant: "destructive",
      });
    }
  };

  // Toggle milestone completion status
  const toggleMilestoneCompletion = async (milestone: Milestone) => {
    try {
      const { data, error } = await supabase
        .from("goal_milestones")
        .update({ is_completed: !milestone.is_completed })
        .eq("id", milestone.id)
        .select();

      if (error) {
        throw error;
      }

      // Refresh milestones list
      if (selectedGoal) {
        fetchMilestones(selectedGoal.id);
        
        // Refresh goals to update progress
        if (playerData) {
          fetchGoals(playerData.id);
        }
      }

      toast({
        title: "עדכון סטטוס",
        description: `אבן הדרך ${milestone.is_completed ? "סומנה כלא הושלמה" : "סומנה כהושלמה"}`,
      });
    } catch (error) {
      console.error("Error toggling milestone completion:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון סטטוס אבן הדרך",
        variant: "destructive",
      });
    }
  };

  // Delete a milestone
  const deleteMilestone = async (milestoneId: string) => {
    try {
      const { error } = await supabase
        .from("goal_milestones")
        .delete()
        .eq("id", milestoneId);

      if (error) {
        throw error;
      }

      // Refresh milestones list
      if (selectedGoal) {
        fetchMilestones(selectedGoal.id);
        
        // Refresh goals to update progress
        if (playerData) {
          fetchGoals(playerData.id);
        }
      }

      toast({
        title: "אבן דרך נמחקה",
        description: "אבן הדרך נמחקה בהצלחה",
      });
    } catch (error) {
      console.error("Error deleting milestone:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת אבן הדרך",
        variant: "destructive",
      });
    }
  };

  // Delete a goal and its milestones
  const deleteGoal = async (goalId: string) => {
    try {
      // First delete all milestones for this goal
      const { error: milestonesError } = await supabase
        .from("goal_milestones")
        .delete()
        .eq("goal_id", goalId);

      if (milestonesError) {
        throw milestonesError;
      }

      // Then delete the goal itself
      const { error: goalError } = await supabase
        .from("player_goals")
        .delete()
        .eq("id", goalId);

      if (goalError) {
        throw goalError;
      }

      // Clear selected goal if it was deleted
      if (selectedGoal && selectedGoal.id === goalId) {
        setSelectedGoal(null);
        setMilestones([]);
      }

      // Refresh goals list
      if (playerData) {
        fetchGoals(playerData.id);
      }

      toast({
        title: "מטרה נמחקה",
        description: "המטרה וכל אבני הדרך שלה נמחקו בהצלחה",
      });
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת המטרה",
        variant: "destructive",
      });
    }
  };

  // Calculate days remaining until target date
  const calculateDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Check if a target date has passed
  const isDatePassed = (targetDate: string) => {
    return isAfter(new Date(), new Date(targetDate));
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <Button variant="outline" onClick={() => navigate("/player/profile")}>
          <ArrowRight className="mr-2 h-4 w-4" /> חזרה לפרופיל
        </Button>
        <h1 className="text-3xl font-bold">מטרות אימון</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar - Goals list */}
        <div className="md:col-span-1">
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">המטרות שלי</CardTitle>
                <CardDescription>
                  ניהול וצפייה במטרות האימון שלך
                </CardDescription>
              </div>
              <Dialog open={isNewGoalDialogOpen} onOpenChange={setIsNewGoalDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" /> מטרה חדשה
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>הוספת מטרת אימון חדשה</DialogTitle>
                    <DialogDescription>
                      הגדר מטרת אימון חדשה וצור אבני דרך להתקדמות
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...goalForm}>
                    <form onSubmit={goalForm.handleSubmit(onCreateGoal)} className="space-y-4">
                      <FormField
                        control={goalForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>שם המטרה</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="לדוגמה: שיפור דיוק מסירות" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={goalForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>תיאור המטרה</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="תאר את המטרה ואת החשיבות שלה"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={goalForm.control}
                        name="target_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>תאריך יעד</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className="w-full justify-start text-right"
                                  >
                                    {field.value ? (
                                      format(field.value, "dd/MM/yyyy")
                                    ) : (
                                      <span>בחר תאריך</span>
                                    )}
                                    <CalendarIcon className="mr-auto h-4 w-4" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={goalForm.control}
                        name="success_criteria"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>קריטריון להצלחה</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="כיצד תדע שהשגת את המטרה? לדוגמה: 80% דיוק מסירות ב-3 משחקים רצופים"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit">הוסף מטרה</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {goals.length > 0 ? (
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <Card
                      key={goal.id}
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        selectedGoal?.id === goal.id ? "border-primary ring-1 ring-primary" : ""
                      }`}
                      onClick={() => handleGoalSelect(goal)}
                    >
                      <CardHeader className="py-4 px-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{goal.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {goal.description}
                            </CardDescription>
                          </div>
                          <Target className={`h-5 w-5 ${isDatePassed(goal.target_date) ? 'text-red-500' : 'text-primary'}`} />
                        </div>
                      </CardHeader>
                      <CardContent className="py-0 px-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>התקדמות:</span>
                            <span>{Math.round(goal.progress)}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                              <Flag className="h-4 w-4 mr-1" />
                              <span>
                                {format(new Date(goal.target_date), "dd/MM/yyyy")}
                              </span>
                            </div>
                            <div>
                              {!isDatePassed(goal.target_date) ? (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                  {calculateDaysRemaining(goal.target_date)} ימים נותרו
                                </span>
                              ) : (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                  תאריך יעד חלף
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <Target className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">
                    לא נמצאו מטרות. הוסף מטרת אימון חדשה כדי להתחיל!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main content - Selected goal details */}
        <div className="md:col-span-2">
          {selectedGoal ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{selectedGoal.title}</CardTitle>
                      <CardDescription>
                        נוצר ב-{format(new Date(selectedGoal.created_at), "dd/MM/yyyy")}
                      </CardDescription>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => deleteGoal(selectedGoal.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> מחק מטרה
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <Target className="h-4 w-4 mr-1" /> תיאור המטרה
                        </h3>
                        <p className="text-gray-700">{selectedGoal.description}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <Flag className="h-4 w-4 mr-1" /> קריטריון להצלחה
                        </h3>
                        <p className="text-gray-700">{selectedGoal.success_criteria}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-md font-medium">התקדמות כוללת</h3>
                        <span className="font-medium">{Math.round(selectedGoal.progress)}%</span>
                      </div>
                      <Progress value={selectedGoal.progress} className="h-3" />
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-1" />
                        <div>
                          <div className="text-sm">תאריך יעד: {format(new Date(selectedGoal.target_date), "dd/MM/yyyy")}</div>
                          {!isDatePassed(selectedGoal.target_date) ? (
                            <div className="text-sm text-green-600">
                              {calculateDaysRemaining(selectedGoal.target_date)} ימים נותרו
                            </div>
                          ) : (
                            <div className="text-sm text-red-600">תאריך היעד חלף</div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {selectedGoal.progress >= 100 ? "הושלם" : "בתהליך"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">אבני דרך</h2>
                <Dialog open={isNewMilestoneDialogOpen} onOpenChange={setIsNewMilestoneDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" /> הוסף אבן דרך
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>הוספת אבן דרך חדשה</DialogTitle>
                      <DialogDescription>
                        הוסף שלב ביניים להתקדמות לקראת המטרה
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...milestoneForm}>
                      <form onSubmit={milestoneForm.handleSubmit(onCreateMilestone)} className="space-y-4">
                        <FormField
                          control={milestoneForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>כותרת</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="לדוגמה: תרגול 20 דקות ביום" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={milestoneForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>תיאור (אופציונלי)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="תאר את השלב בפירוט"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={milestoneForm.control}
                          name="due_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>תאריך יעד (אופציונלי)</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className="w-full justify-start text-right"
                                    >
                                      {field.value ? (
                                        format(field.value, "dd/MM/yyyy")
                                      ) : (
                                        <span>בחר תאריך</span>
                                      )}
                                      <CalendarIcon className="mr-auto h-4 w-4" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value || undefined}
                                    onSelect={field.onChange}
                                    initialFocus
                                    className="pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={milestoneForm.control}
                          name="is_completed"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rtl:space-x-reverse">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4"
                                />
                              </FormControl>
                              <FormLabel className="!mt-0">הושלם כבר</FormLabel>
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit">הוסף אבן דרך</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <Tabs defaultValue="daily" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="daily" className="flex-1">יומי</TabsTrigger>
                  <TabsTrigger value="weekly" className="flex-1">שבועי</TabsTrigger>
                  <TabsTrigger value="all" className="flex-1">כל אבני הדרך</TabsTrigger>
                </TabsList>

                <TabsContent value="daily" className="mt-4">
                  {milestones.filter(m => !m.due_date || calculateDaysRemaining(m.due_date) <= 1).length > 0 ? (
                    <div className="space-y-2">
                      {milestones
                        .filter(m => !m.due_date || calculateDaysRemaining(m.due_date) <= 1)
                        .map((milestone) => (
                          <MilestoneItem
                            key={milestone.id}
                            milestone={milestone}
                            onToggleCompletion={toggleMilestoneCompletion}
                            onDelete={deleteMilestone}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed rounded-lg">
                      <p className="text-gray-500">אין אבני דרך יומיות. הוסף אבני דרך לעקוב אחר התקדמות יומית!</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="weekly" className="mt-4">
                  {milestones.filter(m => m.due_date && calculateDaysRemaining(m.due_date) > 1 && calculateDaysRemaining(m.due_date) <= 7).length > 0 ? (
                    <div className="space-y-2">
                      {milestones
                        .filter(m => m.due_date && calculateDaysRemaining(m.due_date) > 1 && calculateDaysRemaining(m.due_date) <= 7)
                        .map((milestone) => (
                          <MilestoneItem
                            key={milestone.id}
                            milestone={milestone}
                            onToggleCompletion={toggleMilestoneCompletion}
                            onDelete={deleteMilestone}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed rounded-lg">
                      <p className="text-gray-500">אין אבני דרך שבועיות. הוסף אבני דרך לעקוב אחר התקדמות שבועית!</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="all" className="mt-4">
                  {milestones.length > 0 ? (
                    <div className="space-y-2">
                      {milestones.map((milestone) => (
                        <MilestoneItem
                          key={milestone.id}
                          milestone={milestone}
                          onToggleCompletion={toggleMilestoneCompletion}
                          onDelete={deleteMilestone}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed rounded-lg">
                      <p className="text-gray-500">אין אבני דרך. הוסף אבני דרך כדי לעקוב אחר התקדמות לקראת המטרה!</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <Card className="h-full flex flex-col justify-center items-center py-12">
              <Target className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">בחר מטרה מהרשימה</h3>
              <p className="text-gray-500 text-center max-w-md mb-6">
                בחר מטרת אימון מהרשימה כדי לראות את הפרטים שלה או להוסיף אבני דרך להתקדמות
              </p>
              <Dialog open={isNewGoalDialogOpen} onOpenChange={setIsNewGoalDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-1" /> הוסף מטרה חדשה
                  </Button>
                </DialogTrigger>
                {/* Dialog content is the same as above */}
              </Dialog>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Milestone item component
function MilestoneItem({
  milestone,
  onToggleCompletion,
  onDelete,
}: {
  milestone: Milestone;
  onToggleCompletion: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={`p-3 border rounded-lg flex items-start gap-3 ${milestone.is_completed ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
      <button
        className="mt-1 flex-shrink-0"
        onClick={() => onToggleCompletion(milestone)}
        title={milestone.is_completed ? "סמן כלא הושלם" : "סמן כהושלם"}
      >
        {milestone.is_completed ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
        )}
      </button>
      <div className="flex-grow">
        <h4 className={`font-medium ${milestone.is_completed ? 'line-through text-gray-500' : ''}`}>
          {milestone.title}
        </h4>
        {milestone.description && (
          <p className={`text-sm mt-1 ${milestone.is_completed ? 'text-gray-400' : 'text-gray-600'}`}>
            {milestone.description}
          </p>
        )}
        {milestone.due_date && (
          <div className="mt-2 text-xs flex items-center text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            <span>עד {format(new Date(milestone.due_date), "dd/MM/yyyy")}</span>
          </div>
        )}
      </div>
      <button
        className="text-gray-400 hover:text-red-500 flex-shrink-0"
        onClick={() => onDelete(milestone.id)}
        title="מחק אבן דרך"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
