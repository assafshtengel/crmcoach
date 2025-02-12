
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Gamepad, Search } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "טרום משחק",
      icon: Gamepad,
      description: "הכנה מנטלית לקראת המשחק",
      path: "/"
    },
    {
      title: "יעדים",
      icon: Target,
      description: "הגדרת יעדים קצרים וארוכי טווח",
      path: "/goals"
    },
    {
      title: "חקירת אלמנטים",
      icon: Search,
      description: "חקירה וניתוח של אלמנטים במשחק",
      path: "/elements"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">דשבורד</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Card 
              key={card.title}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(card.path)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{card.title}</CardTitle>
                  <card.icon className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
