
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successful, setSuccessful] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) throw error;
      
      setSuccessful(true);
      toast.success('נשלח אליך מייל לאיפוס הסיסמה');
    } catch (error: any) {
      toast.error(error.message || 'שגיאה בתהליך איפוס הסיסמה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">שחזור סיסמה</CardTitle>
        </CardHeader>
        <CardContent>
          {!successful ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "שולח..." : "שלח לי קישור לאיפוס הסיסמה"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-green-600">קישור לאיפוס הסיסמה נשלח לאימייל שהזנת.</p>
              <p>בדוק את תיבת הדואר הנכנס שלך והשתמש בקישור שקיבלת כדי לאפס את הסיסמה.</p>
            </div>
          )}
          <div className="text-center mt-6">
            <Link to="/auth" className="text-sm text-blue-600 hover:underline">
              חזור למסך ההתחברות
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
