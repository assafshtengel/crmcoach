
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";
import { TrainingSummary } from "@/types/trainingSummary";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form schema using zod
const formSchema = z.object({
  performance_rating: z.number().min(1).max(10),
  effort_level: z.number().min(1).max(10),
  techniques_practiced: z.string().min(3, { message: "חובה למלא אילו טכניקות תרגלת" }),
  achievements: z.string().min(3, { message: "חובה למלא הישגים באימון" }),
  improvement_areas: z.string().min(3, { message: "חובה למלא תחומים לשיפור" }),
  fatigue_level: z.number().min(1).max(10),
  notes: z.string().optional(),
});

export default function PlayerTrainingSummary() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  // Get player info from local storage
  const playerSessionStr = localStorage.getItem('playerSession');
  const playerSession = playerSessionStr ? JSON.parse(playerSessionStr) : null;
  const playerId = playerSession?.id;

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      performance_rating: 5,
      effort_level: 5,
      techniques_practiced: "",
      achievements: "",
      improvement_areas: "",
      fatigue_level: 5,
      notes: "",
    },
  });

  // Fetch training summaries
  const fetchTrainingSummaries = async () => {
    if (!playerId) return [];
    
    const { data, error } = await supabase
      .from("training_summaries")
      .select("*")
      .eq("player_id", playerId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as TrainingSummary[] || [];
  };

  const { data: summaries = [], isLoading, refetch } = useQuery({
    queryKey: ["training-summaries", playerId],
    queryFn: fetchTrainingSummaries,
    enabled: !!playerId,
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!playerId) {
      toast({
        title: "שגיאה",
        description: "נא להתחבר מחדש",
        variant: "destructive",
      });
      navigate("/player-auth");
      return;
    }

    setSubmitting(true);
    try {
      const trainingData = {
        player_id: playerId,
        performance_rating: values.performance_rating,
        effort_level: values.effort_level,
        techniques_practiced: values.techniques_practiced,
        achievements: values.achievements,
        improvement_areas: values.improvement_areas,
        fatigue_level: values.fatigue_level,
        notes: values.notes,
      };

      const { error } = await supabase
        .from("training_summaries")
        .insert(trainingData);

      if (error) throw error;

      toast({
        title: "סיכום אימון נשמר בהצלחה!",
        description: "הסיכום נוסף בהצלחה",
      });

      form.reset({
        performance_rating: 5,
        effort_level: 5,
        techniques_practiced: "",
        achievements: "",
        improvement_areas: "",
        fatigue_level: 5,
        notes: "",
      });

      // Refresh the list
      refetch();
    } catch (error: any) {
      console.error("Error submitting training summary:", error);
      toast({
        title: "שגיאה בשמירת הסיכום",
        description: error.message || "אירעה שגיאה בשמירת סיכום האימון",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Render training summaries
  const renderTrainingSummaries = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (summaries.length === 0) {
      return (
        <div className="text-center p-8 bg-muted/20 rounded-lg border border-dashed">
          <p className="text-muted-foreground">אין סיכומי אימונים להצגה</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {summaries.map((summary: TrainingSummary) => (
          <Card key={summary.id} className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">
                  סיכום אימון
                </CardTitle>
                <CardDescription>
                  {summary.created_at && format(new Date(summary.created_at), "dd/MM/yyyy")}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">דירוג ביצועים:</span>
                    <span className="font-medium">{summary.performance_rating}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">רמת מאמץ:</span>
                    <span className="font-medium">{summary.effort_level}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">רמת עייפות:</span>
                    <span className="font-medium">{summary.fatigue_level}/10</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1">טכניקות שתרגלתי:</h4>
                    <p className="text-sm bg-muted/30 p-2 rounded">{summary.techniques_practiced}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">הישגים באימון:</h4>
                    <p className="text-sm bg-muted/30 p-2 rounded">{summary.achievements}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">תחומים לשיפור:</h4>
                    <p className="text-sm bg-muted/30 p-2 rounded">{summary.improvement_areas}</p>
                  </div>
                  {summary.notes && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">הערות:</h4>
                      <p className="text-sm bg-muted/30 p-2 rounded">{summary.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/player/profile')} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            חזרה
          </Button>
          <h1 className="text-2xl font-bold">סיכומי אימון</h1>
        </div>

        <Tabs defaultValue="history">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">היסטוריית סיכומים</TabsTrigger>
            <TabsTrigger value="new">סיכום אימון חדש</TabsTrigger>
          </TabsList>
          
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>היסטוריית סיכומי אימון</CardTitle>
                <CardDescription>
                  צפייה בסיכומי האימונים הקודמים שלך
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderTrainingSummaries()}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="new" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>סיכום אימון חדש</CardTitle>
                <CardDescription>
                  מלא את הפרטים לסיכום האימון
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="performance_rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>דירוג ביצועים באימון (1-10)</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Slider
                                  min={1}
                                  max={10}
                                  step={1}
                                  defaultValue={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                />
                                <div className="flex justify-between">
                                  <span>חלש 1</span>
                                  <span className="font-medium">{field.value}</span>
                                  <span>10 מצוין</span>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="effort_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>רמת מאמץ באימון (1-10)</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Slider
                                  min={1}
                                  max={10}
                                  step={1}
                                  defaultValue={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                />
                                <div className="flex justify-between">
                                  <span>נמוך 1</span>
                                  <span className="font-medium">{field.value}</span>
                                  <span>10 גבוה</span>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="techniques_practiced"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>אילו טכניקות תרגלת באימון?</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="פרט את הטכניקות שתרגלת באימון היום" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="achievements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>הישגים באימון</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="מה היו ההישגים שלך באימון היום?" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="improvement_areas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>תחומים לשיפור</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="על אילו תחומים אתה צריך לעבוד יותר?" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fatigue_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>רמת עייפות אחרי האימון (1-10)</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                min={1}
                                max={10}
                                step={1}
                                defaultValue={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                              <div className="flex justify-between">
                                <span>רענן 1</span>
                                <span className="font-medium">{field.value}</span>
                                <span>10 מאוד עייף</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>הערות נוספות (אופציונלי)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="הערות נוספות לגבי האימון" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? "שומר..." : "שמור סיכום אימון"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
