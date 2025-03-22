
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Users, Calendar, FileText, Video, CheckSquare, BookOpen, Award, FileQuestion } from 'lucide-react';

const DashboardCoach = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-right">לוח בקרה מאמן</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* אבחון */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Activity className="h-10 w-10 text-primary" />
              <h2 className="text-2xl font-bold">אבחון</h2>
            </div>
            <p className="text-gray-600 mb-6">הוסף אבחונים לשחקנים שלך כדי לעקוב אחרי ההתקדמות שלהם</p>
            <Button onClick={() => navigate('/player-evaluation')} className="w-full">
              לאבחון
            </Button>
          </CardContent>
        </Card>

        {/* שחקנים */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Users className="h-10 w-10 text-primary" />
              <h2 className="text-2xl font-bold">שחקנים</h2>
            </div>
            <p className="text-gray-600 mb-6">נהל את השחקנים שלך, ספריית סרטונים והערות</p>
            <Button onClick={() => navigate('/players-list')} className="w-full">
              לשחקנים
            </Button>
          </CardContent>
        </Card>

        {/* פגישות */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Calendar className="h-10 w-10 text-primary" />
              <h2 className="text-2xl font-bold">פגישות</h2>
            </div>
            <p className="text-gray-600 mb-6">נהל את הפגישות שלך, תזמן פגישות חדשות ומעקב</p>
            <Button onClick={() => navigate('/sessions-list')} className="w-full">
              לפגישות
            </Button>
          </CardContent>
        </Card>

        {/* סיכומי פגישות */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <FileText className="h-10 w-10 text-primary" />
              <h2 className="text-2xl font-bold">סיכומי פגישות</h2>
            </div>
            <p className="text-gray-600 mb-6">צפה בסיכומי פגישות מנטליות עם שחקנים</p>
            <Button onClick={() => navigate('/all-meeting-summaries')} className="w-full">
              לסיכומים
            </Button>
          </CardContent>
        </Card>

        {/* ספריית וידאו */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Video className="h-10 w-10 text-primary" />
              <h2 className="text-2xl font-bold">ספריית וידאו</h2>
            </div>
            <p className="text-gray-600 mb-6">נהל את ספריית הסרטונים שלך לשחקנים</p>
            <Button onClick={() => navigate('/tool-management')} className="w-full">
              לספרייה
            </Button>
          </CardContent>
        </Card>

        {/* רישום שחקנים */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <CheckSquare className="h-10 w-10 text-primary" />
              <h2 className="text-2xl font-bold">רישום שחקנים</h2>
            </div>
            <p className="text-gray-600 mb-6">צור קישורים לרישום שחקנים חדשים</p>
            <Button onClick={() => navigate('/registration-links')} className="w-full">
              לרישום
            </Button>
          </CardContent>
        </Card>

        {/* ספרייה מנטלית */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <BookOpen className="h-10 w-10 text-primary" />
              <h2 className="text-2xl font-bold">ספרייה מנטלית</h2>
            </div>
            <p className="text-gray-600 mb-6">גישה לכלים ומקורות מנטליים לאימון</p>
            <Button onClick={() => navigate('/mental-library')} className="w-full">
              לספרייה
            </Button>
          </CardContent>
        </Card>

        {/* אבחון במשחק */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Award className="h-10 w-10 text-primary" />
              <h2 className="text-2xl font-bold">אבחון במשחק</h2>
            </div>
            <p className="text-gray-600 mb-6">אבחון מנטלי והתנהגותי של שחקן במהלך משחק</p>
            <Button 
              onClick={() => navigate('/players-list', { state: { showGameEvaluation: true } })} 
              className="w-full"
            >
              לאבחון במשחק
            </Button>
          </CardContent>
        </Card>

        {/* שאלונים */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <FileQuestion className="h-10 w-10 text-primary" />
              <h2 className="text-2xl font-bold">שאלונים</h2>
            </div>
            <p className="text-gray-600 mb-6">צפייה בשאלונים שמולאו על ידי השחקנים</p>
            <Button onClick={() => navigate('/questionnaires')} className="w-full">
              לשאלונים
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardCoach;
