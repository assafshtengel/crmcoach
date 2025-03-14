
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, LightbulbIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BeliefBreakingCard = () => {
  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 shadow-md hover:shadow-lg transition-shadow h-full border-amber-100">
      <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 py-4 border-b border-amber-200">
        <CardTitle className="text-xl font-semibold flex items-center gap-2 text-amber-800">
          <LightbulbIcon className="h-6 w-6 text-amber-500" />
          שחרור האמונות המגבילות
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex flex-col h-[calc(100%-4rem)] space-y-4">
        <p className="text-gray-700">
          שימוש בטופס זה יעזור לך לזהות ולשחרר אמונות מגבילות שעלולות למנוע ממך להגיע לביצועים אופטימליים.
        </p>
        
        <ul className="space-y-2 text-gray-700 text-sm">
          <li className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
            <span>זיהוי מחשבות שליליות אוטומטיות</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
            <span>ניתוח ההשפעה שלהן על הביצועים</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
            <span>פיתוח אסטרטגיות להתמודדות</span>
          </li>
        </ul>
        
        <div className="mt-auto pt-4">
          <Button 
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-white hover:from-amber-600 hover:to-orange-600 shadow-sm hover:shadow-md transition-all duration-300"
            onClick={() => window.open('https://belief-breaker.lovable.app/', '_blank')}
          >
            פתח טופס <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
