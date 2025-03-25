
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Brain, Microscope, LineChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Study {
  id: number;
  title: string;
  institution: string;
  abstract: string;
  studyUrl: string;
  field: string;
  hasRating?: boolean;
  rating?: number;
  iconType: "brain" | "chart" | "microscope" | "document";
}

const recentStudies: Study[] = [{
  id: 1,
  title: "השפעת האימון המנטלי על ביצועי ספורטאים מקצועיים",
  institution: "בוצע באוניברסיטת תל אביב",
  abstract: "המחקר מצא שאימון מנטלי של 20 דקות ביום משפר ביצועים בכ-35% אצל ספורטאים תחרותיים.",
  studyUrl: "https://www.tau.ac.il/research/mentaltraining",
  field: "פסיכולוגיה ספורטיבית",
  hasRating: true,
  rating: 5,
  iconType: "brain"
}, {
  id: 2,
  title: "חוסן נפשי ותפקוד תחת לחץ בקרב שחקני נוער",
  institution: "המכון למדעי הספורט",
  abstract: "השוואה בין תוכניות חוסן נפשי שונות והשפעתן על יכולת השחקנים להתמודד עם מצבי לחץ.",
  studyUrl: "https://www.wingate.org.il/research/mental",
  field: "חוסן נפשי",
  hasRating: false,
  iconType: "chart"
}, {
  id: 3,
  title: "טכניקות ויזואליזציה מתקדמות וביצועים אתלטיים",
  institution: "האוניברסיטה העברית בירושלים",
  abstract: "מחקר המנתח את הקשר בין איכות הויזואליזציה של ספורטאים לבין דיוק הביצוע בפועל.",
  studyUrl: "https://www.huji.ac.il/research/visualization",
  field: "נוירולוגיה",
  hasRating: true,
  rating: 4,
  iconType: "brain"
}, {
  id: 4,
  title: "השפעת תזונה על יכולת קוגניטיבית בזמן תחרויות",
  institution: "מכון ויצמן למדע",
  abstract: "בחינת הקשר בין תזונה עשירה באומגה 3 ותפקוד מנטלי במצבי עומס גופני ונפשי.",
  studyUrl: "https://www.weizmann.ac.il/research/nutrition",
  field: "תזונה וקוגניציה",
  hasRating: true,
  rating: 5,
  iconType: "microscope"
}, {
  id: 5,
  title: "השפעת האזנה למוזיקה לפני תחרות על רמת החרדה",
  institution: "האקדמיה למוזיקה ולמחול בירושלים",
  abstract: "ניתוח השפעת סוגי מוזיקה שונים על רמות מתח וחרדה לפני תחרויות ספורט.",
  studyUrl: "https://www.jamd.ac.il/research/music-anxiety",
  field: "פסיכולוגיה",
  hasRating: true,
  rating: 4,
  iconType: "chart"
}, {
  id: 6,
  title: "הקשר בין שעות שינה ויכולת קבלת החלטות בספורט",
  institution: "אוניברסיטת בן גוריון",
  abstract: "מחקר רחב היקף הבוחן את הקשר בין איכות וכמות השינה לבין דיוק בקבלת החלטות במשחק.",
  studyUrl: "https://www.bgu.ac.il/research/sleep-performance",
  field: "נוירולוגיה",
  hasRating: true,
  rating: 5,
  iconType: "brain"
}];

const renderStudyIcon = (iconType: string) => {
  switch (iconType) {
    case "brain":
      return <Brain className="h-16 w-16 text-blue-400" />;
    case "chart":
      return <LineChart className="h-16 w-16 text-purple-400" />;
    case "microscope":
      return <Microscope className="h-16 w-16 text-green-400" />;
    default:
      return <FileText className="h-16 w-16 text-gray-400" />;
  }
};

export const MentalLibrary: React.FC = () => {
  return <div className="container py-8">
      <div className="flex flex-col space-y-4 mb-8">
        <h1 className="text-3xl font-bold text-center">מחקרים אחרונים בארכיון המנטאלי</h1>
        <p className="text-gray-600 text-center max-w-2xl mx-auto">כאן תמצאו את כל המחקרים האחרונים בעולם המנטאלי שהתפרסמו</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentStudies.map(study => (
          <Card key={study.id} className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold">{study.title}</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {study.institution}
                  </CardDescription>
                </div>
                <Badge className="bg-primary/10 text-primary font-normal">
                  {study.field}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-col space-y-4">
                <div className="w-full h-40 bg-gray-50 rounded-md overflow-hidden flex items-center justify-center mb-2">
                  {renderStudyIcon(study.iconType)}
                </div>
                <p className="text-gray-700 text-sm">{study.abstract}</p>
                {study.hasRating && (
                  <div className="flex items-center">
                    {Array.from({ length: study.rating || 0 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                    {Array.from({ length: 5 - (study.rating || 0) }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-gray-300" />
                    ))}
                    <span className="text-sm text-gray-500 mr-1">{study.rating}/5</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-2 border-t">
              <Button className="w-full gap-2 bg-green-600 hover:bg-green-700" 
                onClick={() => window.open(study.studyUrl, '_blank')}>
                <FileText className="h-4 w-4" />
                קראו את המחקר
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>;
};

import { Star } from 'lucide-react';
