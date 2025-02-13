
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const positions = [
  { value: "goalkeeper", label: "שוער" },
  { value: "defender", label: "בלם" },
  { value: "fullback", label: "מגן" },
  { value: "midfielder", label: "קשר" },
  { value: "winger", label: "מקשר אגף" },
  { value: "striker", label: "חלוץ" },
];

const PlayerForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    position: "",
    jerseyNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "שגיאה",
        description: "יש להתחבר מחדש",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const { error } = await supabase
      .from("player_details")
      .insert({
        id: user.id,
        full_name: formData.fullName,
        position: formData.position,
        jersey_number: parseInt(formData.jerseyNumber),
      });

    if (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הפרטים",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "הפרטים נשמרו בהצלחה",
      description: "בוא נמשיך לשלב הבא",
    });
    // TODO: Navigate to next step once implemented
    navigate("/contract");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="outline"
          size="icon"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                  בוא נתחיל! מי אתה בתור שחקן מקצועני בגיל 24?
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  מלא את הפרטים שלך כפי שהיית רוצה לראות אותם בחוזה המקצועני הראשון שלך
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">שם מלא</Label>
                    <Input
                      id="fullName"
                      placeholder="השם שיופיע בחוזה שלך"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">עמדה במגרש</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) =>
                        setFormData({ ...formData, position: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר את העמדה שלך" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        {positions.map((position) => (
                          <SelectItem key={position.value} value={position.value}>
                            {position.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jerseyNumber">מספר חולצה</Label>
                    <Input
                      id="jerseyNumber"
                      type="number"
                      min="1"
                      max="99"
                      placeholder="המספר שילווה את הקריירה שלך"
                      value={formData.jerseyNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, jerseyNumber: e.target.value })
                      }
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    size="lg"
                  >
                    המשך לחוזה העתיד
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Image Section */}
          <div className="hidden md:block">
            <img
              src="/placeholder.svg"
              alt="שחקן כדורגל מקצועי"
              className="w-full h-full object-cover rounded-xl shadow-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerForm;
