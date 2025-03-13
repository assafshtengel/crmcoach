
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/lib/supabase";
import { Slider } from "@/components/ui/slider";
import { GameSummaryFormValues } from "@/types/gameSummary";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Save } from "lucide-react";

const formSchema = z.object({
  performance_rating: z.number().min(1).max(10),
  concentration_level: z.number().min(1).max(10),
  goals_met: z.boolean(),
  strongest_point: z.string().min(3, { message: "יש להזין לפחות 3 תווים" }),
  improvement_notes: z.string().min(3, { message: "יש להזין לפחות 3 תווים" }),
  fatigue_level: z.number().min(1).max(10),
  game_date: z.date().optional(),
  opponent_team: z.string().optional(),
});

interface GameSummaryFormProps {
  playerData?: {
    id: string;
    coach_id?: string;
  };
  onSuccess?: () => void;
}

export function GameSummaryForm({ playerData, onSuccess }: GameSummaryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const defaultValues: GameSummaryFormValues = {
    performance_rating: 5,
    concentration_level: 5,
    goals_met: false,
    strongest_point: "",
    improvement_notes: "",
    fatigue_level: 5,
    opponent_team: "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!playerData?.id) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא ניתן לשמור סיכום משחק ללא מזהה שחקן",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("game_summaries")
        .insert({
          player_id: playerData.id,
          coach_id: playerData.coach_id,
          performance_rating: values.performance_rating,
          concentration_level: values.concentration_level,
          goals_met: values.goals_met,
          strongest_point: values.strongest_point,
          improvement_notes: values.improvement_notes,
          fatigue_level: values.fatigue_level,
          game_date: values.game_date ? format(values.game_date, 'yyyy-MM-dd') : null,
          opponent_team: values.opponent_team || null,
        })
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "סיכום המשחק נשמר בהצלחה",
        description: "הנתונים נשמרו במערכת",
      });
      
      form.reset(defaultValues);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error submitting game summary:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בשמירת סיכום המשחק",
        description: error.message || "אירעה שגיאה. אנא נסה שוב מאוחר יותר.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">סיכום משחק אישי</CardTitle>
        <CardDescription>
          מלא את הטופס כדי לסכם את הביצועים שלך במשחק האחרון
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="game_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>תאריך המשחק</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-right font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>בחר תאריך</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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
                control={form.control}
                name="opponent_team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>קבוצה יריבה</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="שם הקבוצה היריבה" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="performance_rating"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>דירוג ביצועים כללי (1-10)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                        />
                        <div className="text-center font-bold text-lg">{field.value}</div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="concentration_level"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>רמת ריכוז (1-10)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                        />
                        <div className="text-center font-bold text-lg">{field.value}</div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="goals_met"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>האם השגתי את המטרות שלי?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      dir="rtl"
                      onValueChange={(value) => field.onChange(value === "true")}
                      defaultValue={field.value ? "true" : "false"}
                      className="flex flex-row space-x-8"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="true" id="goals-yes" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer" htmlFor="goals-yes">
                          כן
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="false" id="goals-no" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer" htmlFor="goals-no">
                          לא
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="strongest_point"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>הנקודה החזקה ביותר במשחק</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="תאר את החלק הטוב ביותר בביצועים שלך"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="improvement_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>מה אני רוצה לשפר למשחק הבא?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="תאר את התחומים שברצונך לשפר"
                      rows={3}
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
                <FormItem className="space-y-3">
                  <FormLabel>רמת עייפות לאחר המשחק (1-10)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                      <div className="text-center font-bold text-lg">{field.value}</div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" className="bg-primary font-bold" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "שומר..." : "שמור סיכום משחק"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
