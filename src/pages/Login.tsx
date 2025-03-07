
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('התחברת בהצלחה!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">התחברות למערכת</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                אימייל
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="הכנס את האימייל שלך"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                סיסמה
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="הכנס את הסיסמה שלך"
              />
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                שכחת סיסמה?
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "מתחבר..." : "התחבר"}
            </Button>
            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">אין לך חשבון? </span>
              <Link to="/register" className="text-sm text-blue-600 hover:underline">
                הרשם עכשיו
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
