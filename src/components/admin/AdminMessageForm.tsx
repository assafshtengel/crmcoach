
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const MAX_MESSAGE_LENGTH = 500;

export const AdminMessageForm = () => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא הזן הודעה לפני השליחה",
        variant: "destructive",
      });
      return;
    }
    
    if (message.length > MAX_MESSAGE_LENGTH) {
      toast({
        title: "שגיאה",
        description: `ההודעה חורגת מהמגבלה של ${MAX_MESSAGE_LENGTH} תווים`,
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get current user's email
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("משתמש לא מחובר");
      }
      
      // Save the message to the database
      const { error: dbError } = await supabase
        .from('admin_messages')
        .insert({
          user_id: user.id,
          message
        });
        
      if (dbError) throw dbError;
      
      console.log("Sending message via Edge Function to:", user.email);
      
      // Send the message via email
      const response = await supabase.functions.invoke('send-admin-message', {
        body: {
          message,
          userEmail: user.email
        },
      });
      
      if (response.error) {
        console.error("Edge function error:", response.error);
        throw new Error(response.error.message || "שגיאה בשליחת ההודעה");
      }
      
      toast({
        title: "הודעתך נשלחה בהצלחה",
        description: "הודעתך נשלחה למנהלי האתר בהצלחה!",
      });
      
      setMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "שגיאה בשליחת ההודעה",
        description: error.message || "אירעה שגיאה בשליחת ההודעה. נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="bg-white shadow-md">
      <CardHeader className="bg-primary/10 py-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Send className="h-5 w-5" />
          שליחת הודעה למנהלי האתר
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <label htmlFor="admin-message">כתוב את הודעתך כאן:</label>
              <span className={message.length > MAX_MESSAGE_LENGTH ? "text-destructive font-medium" : ""}>
                {message.length}/{MAX_MESSAGE_LENGTH}
              </span>
            </div>
            <Textarea
              id="admin-message"
              placeholder="הודעה למנהלי האתר (מקסימום 500 תווים)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] bg-white/80"
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <Button 
            type="submit" 
            className="flex items-center gap-2" 
            disabled={isSubmitting || !message.trim() || message.length > MAX_MESSAGE_LENGTH}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-primary border-r-transparent rounded-full" />
                שולח...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                שלח הודעה
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
