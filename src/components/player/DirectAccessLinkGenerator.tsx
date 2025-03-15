
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Link } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface DirectAccessLinkGeneratorProps {
  playerId: string;
  playerName: string;
}

export const DirectAccessLinkGenerator = ({ playerId, playerName }: DirectAccessLinkGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [accessLink, setAccessLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateRandomToken = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 20; i++) {
      token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
  };

  const generateAccessLink = async () => {
    setIsGenerating(true);
    try {
      // Generate a random token
      const token = generateRandomToken();
      
      // Check if there's an existing token for this player
      const { data: existingTokens, error: fetchError } = await supabase
        .from('player_access_tokens')
        .select('*')
        .eq('player_id', playerId);
      
      if (fetchError) throw fetchError;
      
      // Deactivate existing tokens
      if (existingTokens && existingTokens.length > 0) {
        const { error: updateError } = await supabase
          .from('player_access_tokens')
          .update({ is_active: false })
          .eq('player_id', playerId);
          
        if (updateError) throw updateError;
      }
      
      // Insert new token
      const { error: insertError } = await supabase
        .from('player_access_tokens')
        .insert({
          player_id: playerId,
          token,
          is_active: true,
          created_at: new Date().toISOString()
        });
        
      if (insertError) throw insertError;
      
      // Generate the link - using the absolute URL format
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/player/${playerId}?access=${token}`;
      setAccessLink(link);
      
    } catch (error) {
      console.error('Error generating access link:', error);
      toast.error('שגיאה ביצירת קישור גישה');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!accessLink) return;
    
    navigator.clipboard.writeText(accessLink)
      .then(() => {
        setCopied(true);
        toast.success('הקישור הועתק ללוח');
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.error('שגיאה בהעתקת הקישור');
      });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">קישור גישה ישיר עבור {playerName}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={generateAccessLink}
          disabled={isGenerating}
        >
          {isGenerating ? 'מייצר...' : 'צור קישור גישה חדש'}
        </Button>
      </div>
      
      {accessLink && (
        <div className="flex items-center gap-2">
          <Input 
            value={accessLink} 
            readOnly 
            className="text-xs font-mono"
            dir="ltr"
          />
          <Button 
            size="icon"
            variant="outline"
            onClick={copyToClipboard}
            className="flex-shrink-0"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      )}
      
      <p className="text-xs text-gray-500">
        הקישור מאפשר גישה ישירה ללא צורך בהתחברות או סיסמה.
      </p>
    </div>
  );
};
