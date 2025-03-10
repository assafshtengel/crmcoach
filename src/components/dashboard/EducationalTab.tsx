
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GraduationCap, Book, Lightbulb } from "lucide-react";

interface ResearchArticle {
  id: number;
  title: string;
  author: string;
  summary: string;
  category: string;
  readingTime: string;
}

const researchArticles: ResearchArticle[] = [
  {
    id: 1,
    title: "השפעת אימון מנטלי על ביצועים ספורטיביים",
    author: "ד״ר שרה כהן",
    summary: "מחקר זה מדגים כיצד אימון מנטלי משפר משמעותית את הביצועים הספורטיביים. המחקר עקב אחר 100 ספורטאים במשך שנה ומצא שיפור של 40% בביצועים אצל אלו שהתאמנו מנטלית באופן קבוע.",
    category: "פסיכולוגיה ספורטיבית",
    readingTime: "7 דקות"
  },
  {
    id: 2,
    title: "טכניקות דמיון מודרך בספורט תחרותי",
    author: "פרופ׳ דן לוי",
    summary: "סקירה מקיפה של השימוש בדמיון מודרך בקרב ספורטאי עילית. המחקר מציג כיצד שימוש בדמיון מודרך לפני תחרויות משפר את הביטחון העצמי ומפחית חרדת ביצוע.",
    category: "טכניקות מנטליות",
    readingTime: "10 דקות"
  },
  {
    id: 3,
    title: "חוסן מנטלי: המפתח להצלחה ארוכת טווח",
    author: "ד״ר רונית אבן",
    summary: "מחקר ארוך טווח שבחן את הקשר בין חוסן מנטלי והצלחה בקריירה ספורטיבית. המחקר מצביע על חשיבות פיתוח החוסן המנטלי כבר בגיל צעיר.",
    category: "חוסן מנטלי",
    readingTime: "12 דקות"
  }
];

export const EducationalTab = () => {
  return (
    <ScrollArea className="h-[600px] w-full rounded-md">
      <div className="space-y-8 p-4">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <GraduationCap className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-primary">הכרטיסייה החינוכית</h2>
            <p className="text-gray-500">מאמרים ומחקרים בנושא אימון מנטלי</p>
          </div>
        </div>

        <div className="grid gap-6">
          {researchArticles.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{article.title}</CardTitle>
                    <CardDescription>
                      מאת: {article.author}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Book className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">{article.readingTime}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-500">
                      {article.category}
                    </span>
                  </div>
                  <p className="text-gray-600">{article.summary}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};
