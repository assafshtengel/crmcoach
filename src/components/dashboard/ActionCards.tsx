
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  BarChart2, 
  FileText, 
  Target, 
  ClipboardCheck, 
  BookOpen, 
  Eye,
  Folder
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export const ActionCards: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card 
        className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#9b59b6] cursor-pointer"
        onClick={() => navigate('/new-player')}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">הוספת שחקן חדש</CardTitle>
          <UserPlus className="h-5 w-5 text-[#9b59b6]" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-3">צור כרטיס שחקן חדש במערכת</p>
          <Button 
            variant="default" 
            className="w-full bg-[#9b59b6] hover:bg-[#8e44ad]"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            הוסף שחקן חדש
          </Button>
        </CardContent>
      </Card>

      <Card 
        className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#e74c3c] cursor-pointer"
        onClick={() => navigate('/reports')}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">דוחות וסטטיסטיקה</CardTitle>
          <BarChart2 className="h-5 w-5 text-[#e74c3c]" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-3">צפה בנתונים סטטיסטיים מפורטים</p>
          <Button 
            variant="default" 
            className="w-full bg-[#e74c3c] hover:bg-[#c0392b]"
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            צפה בדוחות
          </Button>
        </CardContent>
      </Card>

      <Card 
        className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#9b87f5] cursor-pointer"
        onClick={() => navigate('/all-meeting-summaries')}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">סיכומי מפגשים</CardTitle>
          <FileText className="h-5 w-5 text-[#9b87f5]" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-3">צפה בסיכומי כל המפגשים, עם אפשרות סינון לפי שחקן</p>
          <Button 
            variant="default" 
            className="w-full bg-[#9b87f5] hover:bg-[#8a68f9]"
          >
            <Eye className="h-4 w-4 mr-2" />
            צפה בכל הסיכומים
          </Button>
        </CardContent>
      </Card>

      <Card 
        className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#27ae60] cursor-pointer"
        onClick={() => navigate('/game-prep')}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">הכנה למשחק</CardTitle>
          <Target className="h-5 w-5 text-[#27ae60]" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-3">מלא טופס הכנה למשחק עבור השחקנים</p>
          <Button 
            variant="default" 
            className="w-full bg-[#27ae60] hover:bg-[#219653]"
          >
            <Target className="h-4 w-4 mr-2" />
            מלא טופס הכנה
          </Button>
        </CardContent>
      </Card>

      <Card 
        className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#f39c12] cursor-pointer"
        onClick={() => navigate('/player-evaluation')}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">הערכת שחקן</CardTitle>
          <ClipboardCheck className="h-5 w-5 text-[#f39c12]" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-3">מלא טופס הערכת שחקן מקיף</p>
          <Button 
            variant="default" 
            className="w-full bg-[#f39c12] hover:bg-[#e67e22]"
          >
            <ClipboardCheck className="h-4 w-4 mr-2" />
            הערך שחקן
          </Button>
        </CardContent>
      </Card>

      <Card 
        className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#3498DB] cursor-pointer"
        onClick={() => navigate('/mental-library')}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">הספרייה המנטאלית</CardTitle>
          <BookOpen className="h-5 w-5 text-[#3498DB]" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-3">רשימת ספרים מומלצים בתחום הפסיכולוגיה של הספורט</p>
          <Button 
            variant="default" 
            className="w-full bg-[#3498DB] hover:bg-[#2980b9]"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            צפה בספרייה
          </Button>
        </CardContent>
      </Card>

      <Card 
        className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#8e44ad] cursor-pointer"
        onClick={() => navigate('/game-summary')}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">סיכומי משחק</CardTitle>
          <FileText className="h-5 w-5 text-[#8e44ad]" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-3">צפה וצור סיכומי משחק אישיים עבור השחקנים</p>
          <Button 
            variant="default" 
            className="w-full bg-[#8e44ad] hover:bg-[#6c3483]"
          >
            <FileText className="h-4 w-4 mr-2" />
            מלא טופס סיכום משחק
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">תיקי שחקנים</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            צפו בתיק שחקן מרוכז הכולל מטרות, דיווחי מצב מנטלי, סיכומי אימונים ומשחקים.
          </p>
          <Link to="/players-list">
            <Button className="w-full" variant="outline">
              <Folder className="mr-2 h-4 w-4" />
              צפייה בתיקי שחקנים
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
