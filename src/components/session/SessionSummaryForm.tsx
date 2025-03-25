import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

import { SessionHeader } from "./summary-form/SessionHeader";
import { SummaryTab } from "./summary-form/SummaryTab";
import { FormActions } from "./summary-form/FormActions";
import { useTools } from "./summary-form/hooks/useTools";
import { formSchema, FormValues } from "./summary-form/schemaValidation";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench } from "lucide-react";

interface SessionSummaryFormProps {
  sessionId: string;
  playerName: string;
  sessionDate: string;
  playerId: string; 
  onSubmit: (data: FormValues & { tools_used: string[] }) => Promise<void>;
  onCancel: () => void;
  forceEnable?: boolean;
}

export function SessionSummaryForm({ 
  sessionId, 
  playerName, 
  sessionDate,
  playerId,
  onSubmit, 
  onCancel,
  forceEnable = false
}: SessionSummaryFormProps) {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const { tools, selectedTools, setSelectedTools, loading } = useTools();
  
  const form = useForm<FormValues>({
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

  const handleSubmit = async (data: FormValues) => {
    setIsSaving(true);
    try {
      console.log("Submitting form data with player ID:", playerId);
      console.log("Complete form data:", { ...data, tools_used: selectedTools, playerId });
      
      await onSubmit({ ...data, tools_used: selectedTools });
      console.log("Form submitted successfully");
      
      if (!forceEnable) {
        updateSessionSummaryStatus(sessionId, playerId);
      }
    } catch (error) {
      console.error("Error saving session summary:", error);
      toast.error("שגיאה בשמירת סיכום המפגש");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSessionSummaryStatus = async (sessionId: string, playerId: string) => {
    try {
      const { data: summaries, error: checkError } = await supabase
        .from('session_summaries')
        .select('id')
        .eq('session_id', sessionId)
        .eq('player_id', playerId);
      
      if (checkError) {
        console.error("Error checking session summary status:", checkError);
        return;
      }
      
      console.log("Session summaries status check:", summaries);
      
      if (summaries && summaries.length > 0) {
        if (window.dispatchEvent) {
          const event = new CustomEvent('sessionSummarized', { 
            detail: { sessionId, playerId }
          });
          window.dispatchEvent(event);
          console.log("Dispatched sessionSummarized event for session:", sessionId, "and player:", playerId);
        }
      }
    } catch (error) {
      console.error("Error updating session summary status:", error);
    }
  };

  const handleExportPDF = async () => {
    try {
      const currentFormValues = form.getValues();
      await handleSubmit(currentFormValues);
      
      toast.info("מכין PDF, אנא המתן...");
      
      setTimeout(async () => {
        const summaryElement = document.getElementById('session-summary-content');
        if (!summaryElement) {
          toast.error("לא ניתן למצוא את תוכן הסיכום");
          return;
        }
        
        const canvas = await html2canvas(summaryElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff"
        });
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        pdf.setProperties({
          title: `סיכום מפגש - ${playerName} - ${sessionDate}`,
          subject: 'סיכום מפגש אימון',
          creator: 'מערכת ניהול המאמן',
        });
        
        pdf.save(`סיכום_מפגש_${playerName}_${sessionDate.replace(/\//g, '-')}.pdf`);
      }, 500);
    } catch (error) {
      console.error("Error creating PDF:", error);
      toast.error("שגיאה ביצירת ה-PDF");
    }
  };

  const toggleTool = (toolId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setSelectedTools(prev => 
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const formRef = React.useRef<HTMLFormElement>(null);

  return (
    <Form {...form}>
      <SessionHeader playerName={playerName} sessionDate={sessionDate} />
      <ScrollArea className="h-[calc(100vh-280px)] px-1">
        <form 
          ref={formRef}
          onSubmit={form.handleSubmit(handleSubmit)} 
          className="space-y-6"
          id="session-summary-content"
        >
          <SummaryTab form={form} selectedTools={selectedTools} />
          
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-center mb-4 flex items-center justify-center">
              <Wrench className="mr-2 h-5 w-5 text-purple-500" />
              הכלים המנטליים שנבחרו למפגש
            </h3>
            
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <p className="text-muted-foreground text-sm">
                    בחר את הכלים בהם השתמשת במהלך המפגש
                  </p>
                </div>
                
                {loading ? (
                  <div className="text-center py-10">טוען...</div>
                ) : tools.length === 0 ? (
                  <div className="text-center py-10 border rounded-md">
                    <p className="text-muted-foreground mb-2">טרם הוגדרו כלים במערכת</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tools.map((tool) => (
                      <div 
                        key={tool.id} 
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${
                          selectedTools.includes(tool.id) 
                            ? 'bg-purple-50 border-purple-200' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={(e) => toggleTool(tool.id, e)}
                      >
                        <div className="flex items-start">
                          <Checkbox
                            checked={selectedTools.includes(tool.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTools(prev => [...prev, tool.id]);
                              } else {
                                setSelectedTools(prev => prev.filter(id => id !== tool.id));
                              }
                            }}
                            className="mr-2 mt-1"
                            id={`tool-${tool.id}`}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1">
                            <label 
                              htmlFor={`tool-${tool.id}`} 
                              className="font-medium cursor-pointer flex-1"
                              onClick={(e) => e.stopPropagation()}
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
          </div>
        </form>
      </ScrollArea>
      <FormActions
        onSubmit={form.handleSubmit(handleSubmit)}
        onExportPDF={handleExportPDF}
        isSaving={isSaving}
        navigateAfterSave={true}
      />
    </Form>
  );
}
