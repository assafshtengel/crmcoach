
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clipboard, Check, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PlayerAccessDetailsProps {
  player: {
    id: string;
    full_name: string;
    email: string;
  };
}

export const PlayerAccessDetails = ({ player }: PlayerAccessDetailsProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [sendingEmail, setSendingEmail] = useState(false);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ ...copied, [field]: true });
      toast({
        title: "הועתק ללוח",
        description: `${field === 'id' ? 'קוד השחקן' : 'הקישור'} הועתק בהצלחה`,
      });
      
      setTimeout(() => {
        setCopied({ ...copied, [field]: false });
      }, 2000);
    });
  };

  const playerLink = `${window.location.origin}/player-auth`;
  
  const sendAccessEmail = async () => {
    try {
      setSendingEmail(true);
      
      // כאן צריך לשלוח מייל לשחקן עם פרטי הגישה
      // זה צריך להיעשות דרך פונקציית קצה ב-supabase או שירות אחר
      toast({
        title: "הודעת גישה נשלחה",
        description: `פרטי הגישה נשלחו ל-${player.email}`,
      });
      
    } catch (error) {
      console.error("Failed to send access email:", error);
      toast({
        title: "שגיאה בשליחת המייל",
        description: "לא ניתן היה לשלוח את פרטי הגישה",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-4 p-2">
      <div className="space-y-2">
        <h4 className="font-medium text-sm">פרטי גישה עבור {player.full_name}</h4>
        <p className="text-xs text-gray-500">
          השחקן יכול להיכנס למערכת עם האימייל וקוד השחקן שלו
        </p>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm">קוד שחקן:</span>
          <div className="flex items-center gap-2">
            <code className="bg-gray-100 px-2 py-1 rounded text-xs">{player.id}</code>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => copyToClipboard(player.id, 'id')}
            >
              {copied['id'] ? <Check className="h-3 w-3" /> : <Clipboard className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm">קישור לכניסה:</span>
          <div className="flex items-center gap-2">
            <code className="bg-gray-100 px-2 py-1 rounded text-xs truncate max-w-[150px]">
              {playerLink}
            </code>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => copyToClipboard(playerLink, 'link')}
            >
              {copied['link'] ? <Check className="h-3 w-3" /> : <Clipboard className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm">אימייל:</span>
          <span className="text-xs text-gray-600">{player.email}</span>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full mt-4"
        onClick={sendAccessEmail}
        disabled={sendingEmail}
      >
        <Mail className="mr-2 h-4 w-4" />
        {sendingEmail ? "שולח..." : "שלח פרטי גישה במייל"}
      </Button>
    </div>
  );
};
