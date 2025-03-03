
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Info, Star, Target, Video } from "lucide-react";
import { Link } from "react-router-dom";

const MentalToolsPage = () => {
  const mentalTools = [
    {
      id: 1,
      name: "NEXT",
      description: "כלי לפיתוח מיינדסט של מוכנות מנטלית לנקודה הבאה",
      level: "בסיסי",
      type: "התמודדות עם לחץ",
      videoUrl: "https://www.youtube.com/watch?v=example1",
      status: "נלמד",
    },
    {
      id: 2,
      name: "SCOUT",
      description: "טכניקת סקירה מוקדמת לצפייה במשחק ולמידת היריב",
      level: "מתקדם",
      type: "מיומנות ניתוח",
      videoUrl: "https://www.youtube.com/watch?v=example2",
      status: "נלמד",
    },
    {
      id: 3,
      name: "חוק ה-1%",
      description: "אימוץ גישה של שיפור מתמיד בצעדים קטנים",
      level: "בסיסי",
      type: "צמיחה אישית",
      videoUrl: "https://www.youtube.com/watch?v=3vt10U_ssc8",
      status: "נלמד",
    },
    {
      id: 4,
      name: "FLOW",
      description: "טכניקות להשגת מצב של זרימה והתמקדות מוחלטת במשחק",
      level: "מתקדם",
      type: "ביצועים אופטימליים",
      videoUrl: "https://www.youtube.com/watch?v=example4",
      status: "טרם נלמד",
    },
    {
      id: 5,
      name: "פרה-פרפורמנס",
      description: "שגרת הכנה מנטלית לפני משחק או אימון",
      level: "מתקדם",
      type: "הכנה מנטלית",
      videoUrl: "https://www.youtube.com/watch?v=example5",
      status: "טרם נלמד",
    },
  ];

  const getStatusColor = (status: string) => {
    if (status === "נלמד") return "bg-green-100 text-green-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getLevelColor = (level: string) => {
    if (level === "בסיסי") return "bg-blue-100 text-blue-800";
    return "bg-purple-100 text-purple-800";
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">כלים מנטליים</h1>
          <p className="text-gray-600 mt-2">
            רשימת הכלים המנטליים שלמדת במהלך המפגשים
          </p>
        </div>
        <Link to="/player-dashboard">
          <Button variant="outline">חזרה לדשבורד</Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {mentalTools.map((tool) => (
          <Card key={tool.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex gap-2 items-center">
                  <Badge className={getStatusColor(tool.status)}>{tool.status}</Badge>
                  <CardTitle className="text-xl">{tool.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Badge className={getLevelColor(tool.level)}>{tool.level}</Badge>
                  <Badge variant="outline">{tool.type}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{tool.description}</p>
              <div className="flex gap-2 mt-2">
                {tool.videoUrl && tool.status === "נלמד" && (
                  <Button size="sm" variant="outline" className="gap-1">
                    <Video className="h-4 w-4" />
                    סרטון הסבר
                  </Button>
                )}
                <Button size="sm" variant="outline" className="gap-1">
                  <Info className="h-4 w-4" />
                  פרטים נוספים
                </Button>
                {tool.status === "נלמד" && (
                  <Button size="sm" variant="outline" className="gap-1">
                    <BookOpen className="h-4 w-4" />
                    חומרי לימוד
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MentalToolsPage;
