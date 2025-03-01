
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    await onSubmit({ ...data, tools_used: selectedTools });
  };

  return (
    <Form {...form}>
      <SessionHeader playerName={playerName} sessionDate={sessionDate} />
      <ScrollArea className="h-[calc(100vh-280px)] px-1">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
        onCancel={onCancel}
        onSubmit={form.handleSubmit(handleSubmit)}
      />
    </Form>
  );
}
