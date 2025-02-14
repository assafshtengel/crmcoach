
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Next = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate(-1)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>חזור לעמוד הקודם</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <h1 className="text-2xl md:text-3xl font-bold">כלי ה-NEXT</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>מה זה NEXT?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                NEXT הוא כלי מנטאלי המסייע לספורטאים להתמודד עם רגעי לחץ ומצבים מאתגרים במשחק.
                הכלי מבוסס על ארבעה שלבים פשוטים שעוזרים לך לחזור למיקוד ולביצועים הטובים ביותר שלך.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ארבעת השלבים של NEXT</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex gap-2">
                  <span className="font-bold text-primary">N - Now</span>
                  <p>להיות בהווה, ברגע הנוכחי</p>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-primary">E - Emotions</span>
                  <p>זיהוי והכרה ברגשות שלך</p>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-primary">X - X-it</span>
                  <p>יציאה מהמצב המנטאלי הנוכחי</p>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-primary">T - Task</span>
                  <p>התמקדות במשימה הבאה</p>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>דוגמאות לשימוש</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>אחרי החטאה של זריקה חופשית</li>
                <li>לאחר טעות בהגנה</li>
                <li>כשהקהל מתחיל לצעוק נגדך</li>
                <li>ברגעי לחץ בסוף משחק צמוד</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Next;
