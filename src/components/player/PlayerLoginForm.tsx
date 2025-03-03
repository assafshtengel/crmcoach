
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface PlayerLoginFormProps {
  playerId?: string;
}

const PlayerLoginForm = ({ playerId }: PlayerLoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First try to find the player by email to verify this is the correct player
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('id, email, password')
        .eq('email', email)
        .single();

      if (playerError || !playerData) {
        throw new Error('אימייל לא קיים במערכת');
      }

      // If a specific player ID was requested, check that the email matches
      if (playerId && playerData.id !== playerId) {
        throw new Error('אימייל לא מתאים לשחקן המבוקש');
      }

      // Verify password - ensure password exists and matches
      if (!playerData.password) {
        throw new Error('נדרשת הגדרת סיסמה לחשבון זה. אנא פנה למאמן');
      }
      
      if (playerData.password !== password) {
        throw new Error('סיסמה שגויה');
      }

      // Password is correct, set player session
      const playerSession = {
        playerId: playerData.id,
        email: playerData.email,
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('playerSession', JSON.stringify(playerSession));
      
      // Navigate to player profile if not already there
      if (window.location.pathname !== `/player/${playerData.id}`) {
        window.location.href = `/player/${playerData.id}`;
      } else {
        // Reload the page to apply the authentication
        window.location.reload();
      }
      
      toast({
        title: "התחברת בהצלחה!",
        description: "כעת תוכל לצפות בפרופיל השחקן שלך",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בהתחברות",
        description: error.message || "אירעה שגיאה בהתחברות",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-center">התחברות לפרופיל שחקן</CardTitle>
        <CardDescription className="text-center">
          הזן את האימייל והסיסמה שקיבלת מהמאמן שלך
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-right"
            />
          </div>
          
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-right"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "מתחבר..." : "התחבר"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PlayerLoginForm;
