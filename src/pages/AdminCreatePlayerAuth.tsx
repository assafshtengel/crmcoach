
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, LayoutDashboard, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const AdminCreatePlayerAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Email validation function
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format
    if (!isValidEmail(email)) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "כתובת האימייל אינה תקינה",
      });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "הסיסמה חייבת להכיל לפחות 6 תווים",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-player-auth", {
        body: {
          email,
          password
        },
      });

      if (error) {
        console.error('Error creating auth user:', error);
        throw new Error(error.message || 'שגיאה ביצירת משתמש');
      }

      if (!data || !data.id) {
        throw new Error('לא התקבל מזהה משתמש מהשרת');
      }

      // Success response
      toast({
        title: "המשתמש נוצר בהצלחה!",
        description: `מזהה משתמש: ${data.id}`,
      });

      // Reset form
      setEmail('');
      setPassword('');
      
    } catch (error: any) {
      console.error('Error creating auth user:', error);
      toast({
        variant: "destructive",
        title: "אירעה שגיאה ביצירת המשתמש",
        description: error.message || "נסה שנית מאוחר יותר",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to generate a random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4" dir="rtl">
      <div className="max-w-md mx-auto">
        <div className="flex gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            title="חזור לדף הקודם"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/dashboard-coach")}
            title="חזור לדשבורד"
          >
            <LayoutDashboard className="h-4 w-4" />
          </Button>
        </div>

        <Card className="p-6 shadow-md">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-center">יצירת משתמש Auth חדש לשחקן</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">דוא״ל</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="הכנס כתובת דוא״ל"
                required
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={generateRandomPassword}
                  className="text-xs"
                >
                  צור סיסמה אקראית
                </Button>
                <Label htmlFor="password">סיסמה זמנית</Label>
              </div>
              <Input
                id="password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="הכנס סיסמה זמנית"
                required
                className="text-right"
              />
              <p className="text-xs text-gray-500 mt-1">הסיסמה חייבת להכיל לפחות 6 תווים</p>
            </div>

            <Button 
              type="submit" 
              className="w-full mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'מעבד...' : 'צור משתמש'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminCreatePlayerAuth;
