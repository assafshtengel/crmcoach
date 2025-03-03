
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { CalendarClock, Flag, Save, Target, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const GamePreparationPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("game-details");
  const [confidenceLevel, setConfidenceLevel] = useState(70);
  const [isReminder, setIsReminder] = useState(false);

  const handleSave = () => {
    toast({
      title: "נשמר בהצלחה",
      description: "תכנית ההכנה למשחק נשמרה בהצלחה",
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">הכנה למשחק</h1>
          <p className="text-gray-600 mt-2">
            תכנון והכנה מנטלית לקראת המשחק הבא
          </p>
        </div>
        <Link to="/player-dashboard">
          <Button variant="outline">חזרה לדשבורד</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">טופס הכנה למשחק</CardTitle>
              <CardDescription>מלא את הפרטים הבאים להכנה מיטבית</CardDescription>
            </div>
            <Badge className="bg-blue-100 text-blue-800 text-sm">משחק ליגה</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-4 gap-2">
              <TabsTrigger value="game-details" className="flex gap-1 items-center">
                <CalendarClock className="h-4 w-4" />
                פרטי המשחק
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex gap-1 items-center">
                <Target className="h-4 w-4" />
                מטרות
              </TabsTrigger>
              <TabsTrigger value="mental-state" className="flex gap-1 items-center">
                <Users className="h-4 w-4" />
                מצב מנטלי
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex gap-1 items-center">
                <Flag className="h-4 w-4" />
                סיכום
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="game-details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="opponent">קבוצה יריבה</Label>
                  <Input id="opponent" placeholder="שם הקבוצה" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gameDate">תאריך ושעת המשחק</Label>
                  <Input id="gameDate" type="datetime-local" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">מיקום המשחק</Label>
                  <Input id="location" placeholder="אצטדיון / מגרש" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gameType">סוג המשחק</Label>
                  <RadioGroup defaultValue="league">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="league" id="league" />
                      <Label htmlFor="league">ליגה</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cup" id="cup" />
                      <Label htmlFor="cup">גביע</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="friendly" id="friendly" />
                      <Label htmlFor="friendly">ידידות</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="notes">הערות כלליות לגבי המשחק</Label>
                <Textarea id="notes" placeholder="רשום הערות כלליות לגבי המשחק..." />
              </div>
            </TabsContent>
            
            <TabsContent value="goals" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamGoal">מטרה קבוצתית</Label>
                  <Input id="teamGoal" placeholder="מה המטרה הקבוצתית למשחק זה?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personalGoal">מטרה אישית</Label>
                  <Input id="personalGoal" placeholder="מה המטרה האישית שלך למשחק זה?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mentalGoal">מטרה מנטלית</Label>
                  <Input id="mentalGoal" placeholder="על איזה אספקט מנטלי תרצה להתמקד?" />
                </div>
                
                <div className="space-y-2">
                  <Label>רמת אמון בהשגת המטרות</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[confidenceLevel]}
                      onValueChange={(values) => setConfidenceLevel(values[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{confidenceLevel}%</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="mental-state" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentState">המצב המנטלי הנוכחי שלי</Label>
                  <Textarea id="currentState" placeholder="תאר את המצב המנטלי הנוכחי שלך..." />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="challenges">אתגרים צפויים</Label>
                  <Textarea id="challenges" placeholder="אילו אתגרים מנטליים אתה צופה במשחק זה?" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tools">כלים מנטליים לשימוש</Label>
                  <Textarea id="tools" placeholder="אילו כלים מנטליים תרצה ליישם במשחק זה?" />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="summary" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="summary">סיכום ההכנה</Label>
                  <Textarea id="summary" placeholder="סכם את ההכנה שלך למשחק..." className="min-h-[150px]" />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="reminder" 
                    checked={isReminder}
                    onCheckedChange={setIsReminder}
                  />
                  <Label htmlFor="reminder">שלח לי תזכורת לפני המשחק</Label>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  שמור הכנה
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">משחקים קודמים</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">מכבי חיפה נגד הפועל ב"ש</CardTitle>
                <Badge>10.2.2025</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">ניצחון 2-0</span>
                </div>
                <Button variant="ghost" size="sm">צפה</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">בית"ר ירושלים נגד מכבי חיפה</CardTitle>
                <Badge>28.1.2025</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span className="text-yellow-600 font-medium">תיקו 1-1</span>
                </div>
                <Button variant="ghost" size="sm">צפה</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GamePreparationPage;
