
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
  { value: "winger", label: "כנף" },
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

  const getPositionLabel = (value: string) => {
    return positions.find(pos => pos.value === value)?.label || "";
  };

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

          {/* Contract Preview Section */}
          <div className="hidden md:block">
            <div className="bg-white p-8 rounded-xl shadow-xl border-2 border-gray-100 min-h-[600px] relative">
              {/* Logo and Header */}
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">FC</span>
                </div>
              </div>

              {/* Contract Title */}
              <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
                {formData.fullName ? 
                  `החוזה המקצועני הראשון של ${formData.fullName}` :
                  "החוזה המקצועני הראשון"
                }
              </h1>

              {/* Contract Body */}
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p>
                  {formData.fullName ? 
                    `אנו שמחים להודיע כי ${formData.fullName} קיבל חוזה מקצועני בקבוצה.` :
                    "אנו שמחים להודיע כי _________ קיבל חוזה מקצועני בקבוצה."
                  }
                </p>
                <p>
                  {formData.position && formData.jerseyNumber ? 
                    `השחקן ישחק בעמדת ${getPositionLabel(formData.position)}, עם מספר ${formData.jerseyNumber}, ויציג יכולות יוצאות דופן על המגרש.` :
                    "השחקן ישחק בעמדת ______, עם מספר __, ויציג יכולות יוצאות דופן על המגרש."
                  }
                </p>
                <p>חזונו להפוך לשחקן בכיר נמצא כעת בתהליך רשמי!</p>
              </div>

              {/* Signature Section */}
              <div className="absolute bottom-8 right-8 left-8">
                <div className="border-t-2 border-gray-200 pt-6">
                  <p className="font-semibold mb-2">
                    {formData.fullName || "_________"} - השחקן המקצועני
                  </p>
                  <p className="text-sm text-gray-600">
                    "אני חותם על החוזה הזה ומתחייב להפוך אותו למציאות!"
                  </p>
                </div>
              </div>

              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <div className="transform rotate-45 text-6xl font-bold text-gray-300">
                  OFFICIAL
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerForm;
