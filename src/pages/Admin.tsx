
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { ArrowRight, LayoutDashboard, UserPlus } from 'lucide-react';

const ADMIN_PASSWORD = 'admin123'; // This should be moved to environment variables in production

const Admin = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: "התחברת בהצלחה",
        description: "ברוך הבא לממשק הניהול",
      });
    } else {
      toast({
        title: "שגיאה",
        description: "סיסמה שגויה",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-sage-50 py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <LayoutDashboard className="h-4 w-4" />
            </Button>
          </div>
          <Card className="p-6">
            <h1 className="text-2xl font-bold text-center mb-6">כניסת מנהל</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="הכנס סיסמה"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-right"
                />
              </div>
              <Button type="submit" className="w-full">
                כניסה
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-50 py-8 px-4">
      <div className="flex gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/dashboard")}
        >
          <LayoutDashboard className="h-4 w-4" />
        </Button>
      </div>
      <div className="mb-6">
        <Card className="p-4 mb-4">
          <Button 
            onClick={() => navigate('/admin/create-player-auth')}
            className="w-full flex items-center justify-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            יצירת משתמש Auth חדש לשחקן
          </Button>
        </Card>
      </div>
      <AdminDashboard />
    </div>
  );
};

export default Admin;
