
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Register the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      
      if (authData.user) {
        // Add the coach profile
        const { error: profileError } = await supabase
          .from('coaches')
          .insert([
            {
              id: authData.user.id,
              email: email,
              full_name: fullName,
            }
          ]);

        if (profileError) throw profileError;
        
        toast.success('נרשמת בהצלחה!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'שגיאה בהרשמה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">הרשמה למערכת</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                שם מלא
              </label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="הכנס את שמך המלא"
              />
            </div>
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
                placeholder="בחר סיסמה"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "נרשם..." : "הרשם"}
            </Button>
            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">כבר יש לך חשבון? </span>
              <Link to="/auth" className="text-sm text-blue-600 hover:underline">
                התחבר עכשיו
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
