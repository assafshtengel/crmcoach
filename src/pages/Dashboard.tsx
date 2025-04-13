import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { LogOut, ArrowRight, LayoutDashboard, Home } from "lucide-react";

const Dashboard = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };
    getUserEmail();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "התנתקות נכשלה",
        description: "אירעה שגיאה במהלך ההתנתקות. אנא נסה שוב.",
      });
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="transition-transform hover:scale-105"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/")}
              className="transition-transform hover:scale-105"
            >
              <Home className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/dashboard-coach")}
              className="transition-transform hover:scale-105"
            >
              <LayoutDashboard className="h-4 w-4" />
            </Button>
          </div>
          <h1 className="text-3xl font-semibold text-gray-800">
            ברוך הבא, {userEmail || "אורח"}!
          </h1>
          <Button 
            variant="outline" 
            size="icon"
            className="text-destructive hover:bg-destructive hover:text-white transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>ניהול שחקנים</CardTitle>
            </CardHeader>
            <CardContent>
              <p>הוספה, עריכה ומחיקה של שחקנים</p>
              <Button onClick={() => navigate("/players")} className="mt-4">
                לניהול שחקנים
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ניהול שאלונים</CardTitle>
            </CardHeader>
            <CardContent>
              <p>יצירה, עריכה ושליחה של שאלונים</p>
              <Button onClick={() => navigate("/questionnaires")} className="mt-4">
                לניהול שאלונים
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ניהול כלי אימון</CardTitle>
            </CardHeader>
            <CardContent>
              <p>הוספה, עריכה ומחיקה של כלי אימון</p>
              <Button onClick={() => navigate("/tools")} className="mt-4">
                לניהול כלי אימון
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ניהול קישורי רישום</CardTitle>
            </CardHeader>
            <CardContent>
              <p>יצירה וניהול של קישורי רישום לשחקנים</p>
              <Button onClick={() => navigate("/registration-links")} className="mt-4">
                לניהול קישורי רישום
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ניהול סרטונים</CardTitle>
            </CardHeader>
            <CardContent>
              <p>העלאה וארגון של סרטוני אימון</p>
              <Button onClick={() => navigate("/auto-video-management")} className="mt-4">
                לניהול סרטונים
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>דוחות</CardTitle>
            </CardHeader>
            <CardContent>
              <p>צפייה בדוחות התקדמות של שחקנים</p>
              <Button onClick={() => navigate("/reports")} className="mt-4">
                לצפייה בדוחות
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
