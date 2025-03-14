
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileDown, Send } from 'lucide-react';
import { DateRangeSelector } from '@/components/analytics/DateRangeSelector';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PlayerReportPDFProps {
  playerId: string;
  playerName: string;
  sendToPlayer?: boolean;
}

export function PlayerReportPDF({
  playerId,
  playerName,
  sendToPlayer = false
}: PlayerReportPDFProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [dateRange, setDateRange] = useState('30days');
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const response = await supabase.functions.invoke('generate-player-pdf', {
        body: { playerId, timeRange: dateRange }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate PDF');
      }
      
      // Convert base64 to Blob
      const base64Response = response.data.pdfBase64;
      const base64Data = base64Response.split(',')[1];
      const binaryString = window.atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = response.data.fileName || `${playerName}_report.pdf`;
      link.click();
      
      toast({
        title: "הדוח נוצר בהצלחה",
        description: "הדוח הורד למחשב שלך",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "שגיאה ביצירת הדוח",
        description: error.message || "לא ניתן ליצור את הדוח כעת. אנא נסה שוב מאוחר יותר."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendPDFToPlayer = async () => {
    setIsSending(true);
    
    try {
      // First generate the PDF
      const response = await supabase.functions.invoke('generate-player-pdf', {
        body: { playerId, timeRange: dateRange }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate PDF');
      }
      
      // Then send a message to the player with the PDF
      const { data: coachData } = await supabase.auth.getUser();
      
      if (!coachData?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      // Create a message for the player with the PDF data
      const { error: messageError } = await supabase.from('messages').insert({
        sender_id: coachData.user.id,
        recipient_id: playerId,
        content: `שלום ${playerName}, מצורף דוח ביצועים עבורך. אנא פתח את הקובץ המצורף.`,
        has_attachment: true,
        attachment_type: 'pdf',
        attachment_data: response.data.pdfBase64,
        attachment_name: response.data.fileName || `${playerName}_report.pdf`
      });
      
      if (messageError) {
        throw new Error(messageError.message || 'Failed to send message to player');
      }
      
      toast({
        title: "הדוח נשלח בהצלחה",
        description: `הדוח נשלח ל${playerName}`,
      });
      
      // Close the dialog
      setShowDialog(false);
    } catch (error) {
      console.error("Error sending PDF:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בשליחת הדוח",
        description: error.message || "לא ניתן לשלוח את הדוח כעת. אנא נסה שוב מאוחר יותר."
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            onClick={() => setShowDialog(true)}
            className="flex gap-2 items-center"
          >
            <FileDown className="h-4 w-4" />
            ייצוא דוח PDF
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ייצוא דוח שחקן</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-lg">ייצוא דוח עבור: <span className="font-bold">{playerName}</span></p>
              <p className="text-sm text-muted-foreground">בחר טווח תאריכים לדוח:</p>
            </div>
            
            <DateRangeSelector
              value={dateRange}
              onChange={(value) => setDateRange(value)}
            />
            
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={generatePDF} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    מייצר דוח...
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    הורד דוח PDF
                  </>
                )}
              </Button>
              
              {sendToPlayer && (
                <Button 
                  onClick={sendPDFToPlayer} 
                  disabled={isSending}
                  variant="secondary"
                  className="w-full"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      שולח דוח...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      שלח דוח לשחקן
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
