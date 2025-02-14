
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const MentalTools = () => {
  const navigate = useNavigate();

  const tools = [
    {
      name: "NEXT",
      description: "כלי לשיפור המיקוד והריכוז במשחק. מתמקד בהכנה המנטלית לנקודה הבאה.",
      learned: "14.2.25",
      key_points: [
        "מחיאת כף מיד אחרי סיום נקודה",
        "מיקוד בנקודה הבאה",
        "שחרור המתח מהנקודה הקודמת"
      ]
    },
    // יתווספו כלים נוספים בהמשך הליווי
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            כלים מנטליים
          </h1>
          <div className="w-9" /> {/* Spacer for alignment */}
        </div>

        <div className="grid gap-6">
          {tools.map((tool, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl text-primary">{tool.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{tool.description}</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">תאריך לימוד: {tool.learned}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">נקודות מפתח:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {tool.key_points.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MentalTools;
