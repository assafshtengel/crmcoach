
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';

const MentalResearch = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">מחקרים מנטאליים עדכניים</h1>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2" 
              onClick={() => navigate("/dashboard-coach")}
            >
              <ArrowRight className="h-4 w-4" />
              חזרה לדף הבית
            </Button>
          </div>
          <p className="text-muted-foreground">
            מחקרים פורצי דרך שיעזרו לכם להבין את עולם המנטאליות לעומק
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="border rounded-lg p-4 hover:shadow-md transition-all">
            <h2 className="font-semibold text-lg mb-2">חשיבות האימון המנטאלי בספורט מקצועי</h2>
            <p className="text-sm text-gray-600 mb-3">סקירה של מחקרים עדכניים המדגישים את השפעת האימון המנטאלי על ביצועי ספורטאים.</p>
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                קרא עוד
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-all">
            <h2 className="font-semibold text-lg mb-2">טכניקות דמיון מודרך - סקירת מחקרים</h2>
            <p className="text-sm text-gray-600 mb-3">מחקרים חדשים על יעילות טכניקות דמיון מודרך לשיפור ביצועים בספורט תחרותי.</p>
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                קרא עוד
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4 hover:shadow-md transition-all">
            <h2 className="font-semibold text-lg mb-2">השפעת לחץ מנטאלי על ביצועים אתלטיים</h2>
            <p className="text-sm text-gray-600 mb-3">ניתוח מחקרים על הקשר בין לחץ נפשי וביצועים אתלטיים, עם דגש על טכניקות התמודדות.</p>
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                קרא עוד
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentalResearch;
