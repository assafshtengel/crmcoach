
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";
import { he } from 'date-fns/locale';
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tool } from "@/types/tool";

const formSchema = z.object({
  summary_text: z.string().min(1, "נדרש למלא סיכום"),
  achieved_goals: z.string(),
  future_goals: z.string(),
  additional_notes: z.string().optional(),
  progress_rating: z.number().min(1).max(5),
  next_session_focus: z.string()
});

interface SessionSummaryFormProps {
  sessionId: string;
  playerName: string;
  sessionDate: string;
  onSubmit: (data: z.infer<typeof formSchema> & { tools_used: string[] }) => Promise<void>;
  onCancel: () => void;
}

export function SessionSummaryForm({ sessionId, playerName, sessionDate, onSubmit, onCancel }: SessionSummaryFormProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      summary_text: "",
      achieved_goals: "",
      future_goals: "",
      additional_notes: "",
      progress_rating: 3,
      next_session_focus: ""
    }
  });

  useEffect(() => {
    fetchTools();
  }, []);

  async function fetchTools() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coach_tools')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        setTools(data as Tool[]);
      }
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    await onSubmit({ ...data, tools_used: selectedTools });
  };

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev => 
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const formattedDate = format(new Date(sessionDate), 'dd/MM/yyyy', { locale: he });

  return (
    <Form {...form}>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold mb-2">{playerName}</h2>
        <p className="text-gray-600">{formattedDate}</p>
      </div>
      <ScrollArea className="h-[calc(100vh-280px)] px-1">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <Tabs defaultValue="summary" dir="rtl" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="summary" className="flex-1">סיכום מפגש</TabsTrigger>
              <TabsTrigger value="tools" className="flex-1">כלים שהשתמשתי</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="summary_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>סיכום המפגש</FormLabel>
                    <FormControl>
                      <Textarea placeholder="תאר את המפגש..." {...field} className="h-24 resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="achieved_goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>מטרות שהושגו</FormLabel>
                    <FormControl>
                      <Textarea placeholder="פרט את המטרות שהושגו במפגש..." {...field} className="h-20 resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="future_goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>מטרות להמשך</FormLabel>
                    <FormControl>
                      <Textarea placeholder="הגדר מטרות להמשך..." {...field} className="h-20 resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="progress_rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>דירוג התקדמות (1-5)</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value]}
                        onValueChange={([value]) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="next_session_focus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>מיקוד למפגש הבא</FormLabel>
                    <FormControl>
                      <Textarea placeholder="על מה נתמקד במפגש הבא..." {...field} className="h-20 resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additional_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>הערות נוספות</FormLabel>
                    <FormControl>
                      <Textarea placeholder="הערות נוספות..." {...field} className="h-20 resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            
            <TabsContent value="tools" className="pt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">בחר כלים שהשתמשת בהם במפגש זה</h3>
                    <p className="text-muted-foreground text-sm">
                      בחר את הכלים בהם השתמשת במהלך המפגש. אם חסר כלי ברשימה, תוכל להוסיף אותו ב
                      <Button 
                        variant="link" 
                        className="px-1 h-auto" 
                        asChild
                      >
                        <a href="/tool-management" target="_blank">ניהול כלים</a>
                      </Button>
                    </p>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-10">טוען...</div>
                  ) : tools.length === 0 ? (
                    <div className="text-center py-10 border rounded-md">
                      <p className="text-muted-foreground mb-2">טרם הוגדרו כלים במערכת</p>
                      <Button asChild>
                        <a href="/tool-management" target="_blank">הוסף כלים</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tools.map((tool) => (
                        <div 
                          key={tool.id} 
                          className={`p-3 border rounded-md cursor-pointer transition-colors ${
                            selectedTools.includes(tool.id) 
                              ? 'bg-primary/10 border-primary' 
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => toggleTool(tool.id)}
                        >
                          <div className="flex items-start">
                            <Checkbox
                              checked={selectedTools.includes(tool.id)}
                              onCheckedChange={() => toggleTool(tool.id)}
                              className="mr-2 mt-1"
                              id={`tool-${tool.id}`}
                            />
                            <div className="flex-1">
                              <label 
                                htmlFor={`tool-${tool.id}`} 
                                className="font-medium cursor-pointer flex-1"
                              >
                                {tool.name}
                              </label>
                              <p className="text-muted-foreground text-sm mt-1">
                                {tool.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </ScrollArea>
      <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-4 pt-4 border-t">
        <Button variant="outline" type="button" onClick={onCancel}>
          ביטול
        </Button>
        <Button type="submit" onClick={form.handleSubmit(handleSubmit)}>
          שמירת סיכום
        </Button>
      </div>
    </Form>
  );
}
