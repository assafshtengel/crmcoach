
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const MAX_MESSAGE_LENGTH = 500;

export const AdminMessageForm = () => {
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const generateMailtoLink = () => {
    const emailSubject = encodeURIComponent("פנייה מתוך מערכת CASSABOOM");
    const emailBody = encodeURIComponent(message);
    return `mailto:socr.co.il@gmail.com?subject=${emailSubject}&body=${emailBody}`;
  };
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card className="bg-white shadow-md">
        <CollapsibleTrigger asChild>
          <CardHeader className="bg-primary/10 py-4 cursor-pointer hover:bg-primary/15 transition-colors flex flex-row justify-between items-center">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5" />
              שליחת משוב למפתחי האתר
            </CardTitle>
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-4">
              ניתן להשתמש בטופס זה כדי לשלוח לנו רעיונות, בעיות או הצעות – ההודעה תיפתח באאוטלוק ותישלח ישירות לצוות הפיתוח
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <label htmlFor="admin-message">כתוב את הודעתך כאן:</label>
                <span className={message.length > MAX_MESSAGE_LENGTH ? "text-destructive font-medium" : ""}>
                  {message.length}/{MAX_MESSAGE_LENGTH}
                </span>
              </div>
              <Textarea
                id="admin-message"
                placeholder="הודעת משוב (מקסימום 500 תווים)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px] bg-white/80"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <a 
              href={generateMailtoLink()} 
              className="inline-flex"
            >
              <Button 
                type="button" 
                className="flex items-center gap-2" 
                disabled={!message.trim() || message.length > MAX_MESSAGE_LENGTH}
              >
                <Mail className="h-4 w-4" />
                שלח באמצעות Outlook
              </Button>
            </a>
          </CardFooter>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
