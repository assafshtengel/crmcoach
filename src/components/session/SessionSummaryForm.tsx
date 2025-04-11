import React, { useState, useRef } from "react";
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
import { AudioRecorder } from "./summary-form/AudioRecorder";
import { uploadAudio } from "@/lib/uploadAudio";

interface SessionSummaryFormProps {
  sessionId: string;
  playerName: string;
  sessionDate: string;
  playerId: string;
  onSubmit: (data: FormValues & {
    tools_used: string[];
    audio_url?: string;
  }) => Promise<void>;
  onCancel: () => void;
  forceEnable?: boolean;
  onClose?: () => void;
}

export function SessionSummaryForm({
  sessionId,
  playerName,
  sessionDate,
  playerId,
  onSubmit,
  onCancel,
  forceEnable = false,
  onClose
}: SessionSummaryFormProps) {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const {
    tools,
    selectedTools,
    setSelectedTools,
    loading
  } = useTools();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioSharingOption, setAudioSharingOption] = useState<string>("coach_only");
  console.log("SessionSummaryForm: Initialized with playerId", playerId, "and sessionId", sessionId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      summary_text: "",
      achieved_goals: "",
      future_goals: "",
      additional_notes: "",
      progress_rating: 3,
      next_session_focus: "",
      player_id: playerId
    }
  });

  const handleSubmit = async (data: FormValues) => {
    setIsSaving(true);
    console.log("Submitting form data:", data);
    console.log("Selected tools:", selectedTools);
    console.log("Has audio recording:", !!audioBlob, audioBlob ? `Size: ${audioBlob.size} bytes` : "");
    try {
      console.log("Submitting form data with player ID:", playerId);
      let audioUrl = undefined;
      if (audioBlob) {
        const timestamp = new Date().getTime();
        const fileName = `${playerId}_${sessionId}_${timestamp}.webm`;
        console.log("Preparing to upload audio recording:", fileName);
        toast.info("מעלה הקלטת קול...");
        try {
          audioUrl = await uploadAudio(audioBlob, fileName);
          console.log("Audio URL after upload:", audioUrl);
          if (audioUrl) {
            console.log("Updating session_summaries with audio URL:", audioUrl);
            const {
              data: updateData,
              error: updateError
            } = await supabase.from('session_summaries').update({
              audio_url: audioUrl
            }).eq('session_id', sessionId).eq('player_id', playerId);
            if (updateError) {
              console.error("Failed to update session summary with audio URL:", updateError);
              toast.error(`שגיאה בעדכון סיכום המפגש עם קישור להקלטה: ${updateError.message}`);
            } else {
              console.log("Audio URL successfully saved:", updateData);
              const {
                data: verifyData,
                error: verifyError
              } = await supabase.from('session_summaries').select('audio_url').eq('session_id', sessionId).eq('player_id', playerId).single();
              if (verifyError) {
                console.error("Error verifying saved audio URL:", verifyError);
              } else {
                console.log("Verified saved audio URL:", verifyData?.audio_url);
              }
            }
          }
        } catch (audioError) {
          console.error("Audio upload failed:", audioError);
          toast.error(`שגיאה בהעלאת הקלטת הקול: ${audioError.message}`);
        }
      }
      const completeFormData = {
        ...data,
        tools_used: selectedTools,
        audio_url: audioUrl
      };
      console.log("Complete form data to be submitted:", completeFormData);
      await onSubmit(completeFormData);
      console.log("Form submitted successfully");
      if (!forceEnable) {
        updateSessionSummaryStatus(sessionId, playerId);
      }
      if (audioUrl) {
        try {
          const {
            data: savedSummary,
            error
          } = await supabase.from('session_summaries').select('audio_url').eq('session_id', sessionId).eq('player_id', playerId).single();
          if (error) {
            console.error("Error verifying saved audio URL:", error);
          } else {
            console.log("Saved summary audio URL:", savedSummary?.audio_url);
            if (savedSummary?.audio_url !== audioUrl) {
              console.warn("Audio URL mismatch! Expected:", audioUrl, "Saved:", savedSummary?.audio_url);
              const {
                error: retryError
              } = await supabase.from('session_summaries').update({
                audio_url: audioUrl
              }).eq('session_id', sessionId).eq('player_id', playerId);
              if (retryError) {
                console.error("Error in retry update of audio URL:", retryError);
              } else {
                console.log("Successfully updated audio URL in retry attempt");
              }
            }
          }
        } catch (verifyError) {
          console.error("Error verifying audio URL in database:", verifyError);
        }
      }
    } catch (error) {
      console.error("Error saving session summary:", error);
      toast.error(`שגיאה בשמירת סיכום המפגש: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSessionSummaryStatus = async (sessionId: string, playerId: string) => {
    try {
      const {
        data: summaries,
        error: checkError
      } = await supabase.from('session_summaries').select('id').eq('session_id', sessionId).eq('player_id', playerId);
      if (checkError) {
        console.error("Error checking session summary status:", checkError);
        return;
      }
      console.log("Session summaries status check:", summaries);
      if (summaries && summaries.length > 0) {
        if (window.dispatchEvent) {
          const event = new CustomEvent('sessionSummarized', {
            detail: {
              sessionId,
              playerId
            }
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
          creator: 'מערכת ניהול המאמן'
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
    setSelectedTools(prev => prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]);
  };

  const handleAudioReady = (blob: Blob | null) => {
    setAudioBlob(blob);
    if (blob) {
      console.log("Audio recording ready, blob size:", blob.size, "bytes");
      console.log("Audio recording type:", blob.type);
      const audioURL = URL.createObjectURL(blob);
      console.log("Audio preview URL:", audioURL);
    } else {
      console.log("Audio recording cancelled or reset");
    }
  };

  const formRef = React.useRef<HTMLFormElement>(null);

  return <Form {...form}>
      <SessionHeader playerName={playerName} sessionDate={sessionDate} />
      <ScrollArea className="h-[calc(100vh-280px)] px-1">
        <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" id="session-summary-content">
          <SummaryTab form={form} selectedTools={selectedTools} />
          
          <div className="mt-6 mb-4">
            <AudioRecorder onAudioReady={handleAudioReady} />
          </div>
        </form>
      </ScrollArea>
      <FormActions 
        onSubmit={form.handleSubmit(handleSubmit)} 
        onExportPDF={handleExportPDF} 
        isSaving={isSaving} 
        navigateAfterSave={true}
        onClose={onClose}
      />
    </Form>;
}
