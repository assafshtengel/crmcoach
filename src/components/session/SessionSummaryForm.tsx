
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
import { Input } from "@/components/ui/input";

interface Tool {
  id: string;
  name: string;
  description: string;
}

const formSchema = z.object({
  summary_text: z.string().min(1, "נדרש למלא סיכום"),
  achieved_goals: z.string(),
  future_goals: z.string(),
  additional_notes: z.string().optional(),
  progress_rating: z.number().min(1).max(5),
  next_session_focus: z.string(),
  tools_notes: z.record(z.string(), z.string()).optional(),
});

interface SessionSummaryFormProps {
  sessionId: string;
  playerName: string;
  sessionDate: string;
  onSubmit: (data: z.infer<typeof formSchema>, selectedTools: Array<{id: string, name: string, note: string}>) => Promise<void>;
  onCancel: () => void;
}

export function SessionSummaryForm({ sessionId, playerName, sessionDate, onSubmit, onCancel }: SessionSummaryFormProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedToolIds, setSelectedToolIds] = useState<Record<string, boolean>>({});
  const [toolNotes, setToolNotes] = useState<Record<string, string>>({});
  const [isLoadingTools, setIsLoadingTools] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      summary_text: "",
      achieved_goals: "",
      future_goals: "",
      additional_notes: "",
      progress_rating: 3,
      next_session_focus: "",
      tools_notes: {},
    }
  });

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const { data, error } = await supabase
          .from('mental_tools')
          .select('id, name, description');
          
        if (error) {
          console.error('Error fetching tools:', error);
          return;
        }
        
        setTools(data || []);
      } catch (error) {
        console.error('Error fetching tools:', error);
      } finally {
        setIsLoadingTools(false);
      }
    };
    
    fetchTools();
  }, []);

  const handleToolSelection = (toolId: string, checked: boolean) => {
    setSelectedToolIds(prev => ({
      ...prev,
      [toolId]: checked
    }));
    
    // Clear notes for unselected tools
    if (!checked && toolNotes[toolId]) {
      const updatedNotes = { ...toolNotes };
      delete updatedNotes[toolId];
      setToolNotes(updatedNotes);
    }
  };

  const handleToolNote = (toolId: string, note: string) => {
    setToolNotes(prev => ({
      ...prev,
      [toolId]: note
    }));
  };

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    // Prepare the selected tools with their notes
    const selectedTools = Object.entries(selectedToolIds)
      .filter(([_, isSelected]) => isSelected)
      .map(([toolId]) => {
        const tool = tools.find(t => t.id === toolId);
        return {
          id: toolId,
          name: tool?.name || "",
          note: toolNotes[toolId] || ""
        };
      });

    await onSubmit(data, selectedTools);
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

          <div className="space-y-4">
            <FormLabel>כלים מנטליים בשימוש</FormLabel>
            {isLoadingTools ? (
              <p className="text-sm text-gray-500">טוען כלים...</p>
            ) : tools.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-md text-center">
                <p className="text-gray-500">לא נמצאו כלים מנטליים</p>
                <Button 
                  variant="link" 
                  type="button" 
                  onClick={() => window.open('/mental-tools', '_blank')}
                  className="mt-2"
                >
                  הוסף כלים חדשים
                </Button>
              </div>
            ) : (
              <div className="space-y-3 p-4 bg-gray-50 rounded-md">
                {tools.map(tool => (
                  <div key={tool.id} className="space-y-2">
                    <div className="flex items-start">
                      <Checkbox 
                        id={`tool-${tool.id}`}
                        checked={!!selectedToolIds[tool.id]}
                        onCheckedChange={(checked) => handleToolSelection(tool.id, !!checked)}
                        className="mt-1 ml-2"
                      />
                      <div className="space-y-1">
                        <label 
                          htmlFor={`tool-${tool.id}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {tool.name}
                        </label>
                        <p className="text-xs text-gray-500">{tool.description}</p>
                      </div>
                    </div>
                    
                    {selectedToolIds[tool.id] && (
                      <div className="pr-6">
                        <Input
                          placeholder="הוסף הערה לכלי זה..."
                          value={toolNotes[tool.id] || ''}
                          onChange={(e) => handleToolNote(tool.id, e.target.value)}
                          className="text-sm h-8"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

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
