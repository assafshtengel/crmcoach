
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "@/lib/supabase";

import { SessionHeader } from "./summary-form/SessionHeader";
import { SummaryTab } from "./summary-form/SummaryTab";
import { ToolsTab } from "./summary-form/ToolsTab";
import { FormActions } from "./summary-form/FormActions";
import { useTools } from "./summary-form/hooks/useTools";
import { formSchema, FormValues } from "./summary-form/schemaValidation";

interface SessionSummaryFormProps {
  sessionId: string;
  playerName: string;
  sessionDate: string;
  onSubmit: (data: FormValues & { tools_used: string[] }) => Promise<void>;
  onCancel: () => void;
}

export function SessionSummaryForm({ 
  sessionId, 
  playerName, 
  sessionDate, 
  onSubmit, 
  onCancel 
}: SessionSummaryFormProps) {
  const { tools, selectedTools, setSelectedTools, loading } = useTools();
  const [isSaving, setIsSaving] = useState(false);
  
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
      console.log("Submitting form data:", { ...data, tools_used: selectedTools });
      await onSubmit({ ...data, tools_used: selectedTools });
      console.log("Form submitted successfully");
      toast.success("סיכום המפגש נשמר בהצלחה");
    } catch (error) {
      console.error("Error saving session summary:", error);
      toast.error("שגיאה בשמירת סיכום המפגש");
    } finally {
      setIsSaving(false);
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
        toast.success("PDF נוצר בהצלחה");
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
          <Tabs defaultValue="summary" dir="rtl" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="summary" className="flex-1">סיכום מפגש</TabsTrigger>
              <TabsTrigger value="tools" className="flex-1">כלים שהשתמשתי</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <SummaryTab form={form} />
            </TabsContent>
            
            <TabsContent value="tools" className="pt-4">
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
