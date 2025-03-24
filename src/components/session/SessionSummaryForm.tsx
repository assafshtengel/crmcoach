
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
import { ToolsTab } from "./summary-form/ToolsTab";
import { useTools } from "./summary-form/hooks/useTools";
import { formSchema, FormValues } from "./summary-form/schemaValidation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState("summary");
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
      
      // Pass the player_id explicitly to onSubmit
      await onSubmit({ ...data, tools_used: selectedTools });
      console.log("Form submitted successfully");
      
      // If the session is being force-enabled (summarizing an upcoming session),
      // we don't need to update the session status since it's not started yet
      if (!forceEnable) {
        // Update the session status in the frontend
        updateSessionSummaryStatus(sessionId, playerId);
      }
      
    } catch (error) {
      console.error("Error saving session summary:", error);
      toast.error("שגיאה בשמירת סיכום המפגש");
    } finally {
      setIsSaving(false);
    }
  };

  // Function to update the session status after summary is created
  const updateSessionSummaryStatus = async (sessionId: string, playerId: string) => {
    try {
      // Check if the summary exists (for verification)
      const { data: summaries, error: checkError } = await supabase
        .from('session_summaries')
        .select('id')
        .eq('session_id', sessionId)
        .eq('player_id', playerId); // Verify filtering by player_id
      
      if (checkError) {
        console.error("Error checking session summary status:", checkError);
        return;
      }
      
      console.log("Session summaries status check:", summaries);
      
      // If summary exists, the session was successfully summarized
      if (summaries && summaries.length > 0) {
        // Force a refresh of the parent component by causing sessions state update
        if (window.dispatchEvent) {
          // Create a custom event to notify that a session was summarized
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
      // First save the form data
      const currentFormValues = form.getValues();
      await handleSubmit(currentFormValues);
      
      toast.info("מכין PDF, אנא המתן...");
      
      // Wait for any state updates to complete
      setTimeout(async () => {
        const summaryElement = document.getElementById('session-summary-content');
        if (!summaryElement) {
          toast.error("לא ניתן למצוא את תוכן הסיכום");
          return;
        }
        
        // Create canvas from the summary element
        const canvas = await html2canvas(summaryElement, {
          scale: 2, // Higher quality
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff"
        });
        
        // Create PDF
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // Add content to PDF
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        // Add metadata
        pdf.setProperties({
          title: `סיכום מפגש - ${playerName} - ${sessionDate}`,
          subject: 'סיכום מפגש אימון',
          creator: 'מערכת ניהול המאמן',
        });
        
        // Save PDF
        pdf.save(`סיכום_מפגש_${playerName}_${sessionDate.replace(/\//g, '-')}.pdf`);
        
      }, 500);
    } catch (error) {
      console.error("Error creating PDF:", error);
      toast.error("שגיאה ביצירת ה-PDF");
    }
  };

  const formRef = React.useRef<HTMLFormElement>(null);

  return (
    <Form {...form}>
      <SessionHeader playerName={playerName} sessionDate={sessionDate} />
      <ScrollArea className="h-[calc(100vh-280px)] px-1">
        <form 
          ref={formRef}
          onSubmit={form.handleSubmit(handleSubmit)} 
          className="space-y-4"
          id="session-summary-content"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="mb-2">
              <TabsTrigger value="summary">סיכום מפגש</TabsTrigger>
              <TabsTrigger value="tools">כלים מנטליים</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <SummaryTab form={form} />
            </TabsContent>
            
            <TabsContent value="tools">
              <ToolsTab 
                tools={tools} 
                selectedTools={selectedTools} 
                setSelectedTools={setSelectedTools}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </form>
      </ScrollArea>
      <FormActions
        onSubmit={form.handleSubmit(handleSubmit)}
        onExportPDF={handleExportPDF}
        isSaving={isSaving}
      />
    </Form>
  );
}
