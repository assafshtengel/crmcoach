
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Notebook, Search, Plus, ChevronDown, 
  CalendarIcon, CheckCircle, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";

type TrainingSummary = {
  id: string;
  player_id: string;
  coach_id: string;
  title: string;
  created_at: string;
  training_date: string;
  training_goal: string;
  challenges: string;
  key_insights: string;
  follow_up_tasks: string;
  category: string;
  shared_with_player: boolean;
  media_urls?: string[];
};

const PlayerTrainingSummary = () => {
  const [playerData, setPlayerData] = useState<any>(null);
  const [trainingSummaries, setTrainingSummaries] = useState<TrainingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const navigate = useNavigate();

  // New summary form state
  const [newSummary, setNewSummary] = useState<Omit<TrainingSummary, 'id' | 'created_at' | 'player_id' | 'coach_id'>>({
    title: "",
    training_date: format(new Date(), 'yyyy-MM-dd'),
    training_goal: "",
    challenges: "",
    key_insights: "",
    follow_up_tasks: "",
    category: "focus",
    shared_with_player: false,
    media_urls: [],
  });

  const categories = [
    { value: "focus", label: "פוקוס וריכוז" },
    { value: "pressure", label: "עבודה תחת לחץ" },
    { value: "decision_making", label: "קבלת החלטות" },
    { value: "confidence", label: "ביטחון עצמי" },
    { value: "motivation", label: "מוטיבציה" },
    { value: "relaxation", label: "הרפיה" },
    { value: "visualization", label: "הדמיה" },
    { value: "other", label: "אחר" },
  ];

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        const playerSessionStr = localStorage.getItem('playerSession');
        
        if (!playerSessionStr) {
          navigate('/player-auth');
          return;
        }
        
        const playerSession = JSON.parse(playerSessionStr);
        
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerSession.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        setPlayerData(data);
        await loadTrainingSummaries(data.id);
      } catch (error: any) {
        console.error('Error loading player data:', error);
        toast.error(error.message || "אירעה שגיאה בטעינת נתוני השחקן");
      } finally {
        setLoading(false);
      }
    };
    
    loadPlayerData();
  }, [navigate]);

  const loadTrainingSummaries = async (playerId: string) => {
    try {
      const { data, error } = await supabase
        .from('training_summaries')
        .select('*')
        .eq('player_id', playerId)
        .order('training_date', { ascending: false });

      if (error) throw error;
      
      setTrainingSummaries(data || []);
    } catch (error: any) {
      console.error('Error loading training summaries:', error);
      toast.error(error.message || "אירעה שגיאה בטעינת סיכומי האימונים");
    }
  };

  const handleAddSummary = async () => {
    if (!playerData?.id) {
      toast.error("לא ניתן למצוא את פרטי השחקן");
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('training_summaries')
        .insert({
          player_id: playerData.id,
          coach_id: playerData.coach_id,
          title: newSummary.title,
          training_date: newSummary.training_date,
          training_goal: newSummary.training_goal,
          challenges: newSummary.challenges,
          key_insights: newSummary.key_insights,
          follow_up_tasks: newSummary.follow_up_tasks,
          category: newSummary.category,
          shared_with_player: newSummary.shared_with_player,
          media_urls: newSummary.media_urls,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("סיכום האימון נוסף בהצלחה");
      setTrainingSummaries(prev => [data as TrainingSummary, ...prev]);
      setShowAddDialog(false);
      resetNewSummaryForm();
    } catch (error: any) {
      console.error('Error adding training summary:', error);
      toast.error(error.message || "אירעה שגיאה בהוספת סיכום האימון");
    } finally {
      setLoading(false);
    }
  };

  const toggleShareWithPlayer = async (summaryId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('training_summaries')
        .update({ shared_with_player: !currentStatus })
        .eq('id', summaryId);

      if (error) throw error;
      
      setTrainingSummaries(prev => 
        prev.map(summary => 
          summary.id === summaryId 
            ? { ...summary, shared_with_player: !currentStatus } 
            : summary
        )
      );
      
      toast.success(currentStatus 
        ? "הסיכום הוסר משיתוף עם השחקן" 
        : "הסיכום שותף עם השחקן בהצלחה"
      );
    } catch (error: any) {
      console.error('Error toggling share status:', error);
      toast.error(error.message || "אירעה שגיאה בעדכון סטטוס השיתוף");
    }
  };

  const resetNewSummaryForm = () => {
    setNewSummary({
      title: "",
      training_date: format(new Date(), 'yyyy-MM-dd'),
      training_goal: "",
      challenges: "",
      key_insights: "",
      follow_up_tasks: "",
      category: "focus",
      shared_with_player: false,
      media_urls: [],
    });
  };

  const filteredSummaries = trainingSummaries.filter(summary => {
    const matchesSearch = summary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            summary.training_goal.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            summary.key_insights.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || summary.category === selectedCategory;
    
    const matchesDate = !dateFilter || summary.training_date === format(dateFilter, 'yyyy-MM-dd');
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  const handleDateSelect = (date: Date | undefined) => {
    setDateFilter(date);
    setIsDatePickerOpen(false);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setDateFilter(undefined);
  };

  const handleBackToProfile = () => {
    navigate('/player-profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">לא נמצאו נתוני שחקן</h2>
          <Button onClick={() => navigate('/player-auth')} className="mt-4">
            חזרה לדף התחברות
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" onClick={handleBackToProfile}>
            חזרה לפרופיל
          </Button>
          <h1 className="text-3xl font-bold text-center flex items-center gap-2">
            <Notebook className="h-8 w-8" />
            סיכומי אימונים
          </h1>
          <div className="w-28"></div> {/* Spacer for alignment */}
        </div>

        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle>חיפוש וסינון</CardTitle>
            <CardDescription>
              מצא סיכומים לפי מילות מפתח, קטגוריה או תאריך
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="חפש סיכומים..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="בחר קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הקטגוריות</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-right"
                      onClick={() => setIsDatePickerOpen(true)}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {dateFilter ? format(dateFilter, 'dd/MM/yyyy') : 'בחר תאריך'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFilter}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Button 
                  variant="ghost" 
                  onClick={clearFilters}
                >
                  נקה
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              {filteredSummaries.length} סיכומי אימון נמצאו
            </span>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  הוסף סיכום חדש
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>הוספת סיכום אימון חדש</DialogTitle>
                  <DialogDescription>
                    מלא את הפרטים הבאים כדי ליצור סיכום אימון חדש לשחקן.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">שם האימון</Label>
                      <Input
                        id="title"
                        value={newSummary.title}
                        onChange={(e) => setNewSummary({...newSummary, title: e.target.value})}
                        placeholder="הזן את שם האימון"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">קטגוריה</Label>
                      <Select 
                        value={newSummary.category} 
                        onValueChange={(value) => setNewSummary({...newSummary, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="בחר קטגוריה" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="training_date">תאריך האימון</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-right"
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {newSummary.training_date ? format(new Date(newSummary.training_date), 'dd/MM/yyyy') : 'בחר תאריך'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newSummary.training_date ? new Date(newSummary.training_date) : undefined}
                          onSelect={(date) => date && setNewSummary({...newSummary, training_date: format(date, 'yyyy-MM-dd')})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="training_goal">מטרת האימון</Label>
                    <Textarea
                      id="training_goal"
                      value={newSummary.training_goal}
                      onChange={(e) => setNewSummary({...newSummary, training_goal: e.target.value})}
                      placeholder="תאר את מטרת האימון המנטלי"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="challenges">אתגרים שעלו</Label>
                    <Textarea
                      id="challenges"
                      value={newSummary.challenges}
                      onChange={(e) => setNewSummary({...newSummary, challenges: e.target.value})}
                      placeholder="תאר את האתגרים שעלו במהלך האימון"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="key_insights">תובנות עיקריות</Label>
                    <Textarea
                      id="key_insights"
                      value={newSummary.key_insights}
                      onChange={(e) => setNewSummary({...newSummary, key_insights: e.target.value})}
                      placeholder="תובנות והצלחות מרכזיות מהאימון"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="follow_up_tasks">משימות להמשך</Label>
                    <Textarea
                      id="follow_up_tasks"
                      value={newSummary.follow_up_tasks}
                      onChange={(e) => setNewSummary({...newSummary, follow_up_tasks: e.target.value})}
                      placeholder="משימות ויעדים לאימונים הבאים"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>הוספת קובצי מדיה</Label>
                    <div className="flex justify-center p-6 border-2 border-dashed rounded-md">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2 text-sm text-gray-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-medium text-emerald-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 hover:text-emerald-500">
                            <span>העלה קבצים</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
                          </label>
                          <p className="pr-1">או גרור לכאן</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          תומך בתמונות, סרטונים, והקלטות אודיו
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <Label htmlFor="share" className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        id="share"
                        checked={newSummary.shared_with_player}
                        onChange={(e) => setNewSummary({...newSummary, shared_with_player: e.target.checked})}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      שתף את הסיכום עם השחקן
                    </Label>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    ביטול
                  </Button>
                  <Button type="button" onClick={handleAddSummary}>
                    שמור סיכום
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>

        {filteredSummaries.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="flex flex-col items-center justify-center p-12">
              <Notebook className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium mb-2">אין סיכומי אימונים</h3>
              <p className="text-muted-foreground text-center mb-6">
                עדיין לא נרשמו סיכומי אימונים. התחל על ידי הוספת סיכום חדש.
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                הוסף סיכום ראשון
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredSummaries.map((summary) => (
              <Card key={summary.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{summary.title}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {summary.training_date ? format(new Date(summary.training_date), 'dd/MM/yyyy') : 'תאריך לא ידוע'}
                        <span className="mx-2">•</span>
                        {categories.find(c => c.value === summary.category)?.label || 'קטגוריה לא ידועה'}
                      </CardDescription>
                    </div>
                    <Button 
                      variant={summary.shared_with_player ? "default" : "outline"}
                      size="sm"
                      className="gap-2"
                      onClick={() => toggleShareWithPlayer(summary.id, summary.shared_with_player)}
                    >
                      {summary.shared_with_player ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          משותף
                        </>
                      ) : (
                        "שתף עם השחקן"
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="w-full mb-4">
                      <TabsTrigger value="summary" className="flex-1">סיכום</TabsTrigger>
                      <TabsTrigger value="details" className="flex-1">פרטים</TabsTrigger>
                      <TabsTrigger value="media" className="flex-1">מדיה</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="summary" className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="font-semibold">מטרת האימון:</h4>
                        <p className="text-sm">{summary.training_goal || 'לא צוין'}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="font-semibold">תובנות עיקריות:</h4>
                        <p className="text-sm">{summary.key_insights || 'לא צוין'}</p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="details" className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="font-semibold">אתגרים שעלו:</h4>
                        <p className="text-sm">{summary.challenges || 'לא צוין'}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="font-semibold">משימות להמשך:</h4>
                        <p className="text-sm">{summary.follow_up_tasks || 'לא צוין'}</p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="media">
                      {summary.media_urls && summary.media_urls.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                          {summary.media_urls.map((url, index) => (
                            <div key={index} className="border rounded-md p-2">
                              <p className="text-sm">{url}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          אין קבצי מדיה לסיכום זה
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  נוצר בתאריך: {format(new Date(summary.created_at), 'dd/MM/yyyy HH:mm')}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerTrainingSummary;
