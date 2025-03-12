
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Activity, Search, Plus, ChevronDown, 
  CalendarIcon, CheckCircle, Upload, 
  Video, Target, Zap
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
import { Slider } from "@/components/ui/slider";

type GameSummary = {
  id: string;
  player_id: string;
  coach_id: string;
  game_title: string;
  created_at: string;
  game_date: string;
  game_type: string;
  opponent: string;
  strengths: string;
  weaknesses: string;
  key_moments: string;
  feelings: string;
  coach_notes: string;
  performance_rating: number;
  concentration_level: number;
  fatigue_level: number;
  shared_with_player: boolean;
  video_url?: string;
};

const PlayerGameSummary = () => {
  const [playerData, setPlayerData] = useState<any>(null);
  const [gameSummaries, setGameSummaries] = useState<GameSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGameType, setSelectedGameType] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const navigate = useNavigate();

  // New summary form state
  const [newSummary, setNewSummary] = useState<Omit<GameSummary, 'id' | 'created_at' | 'player_id' | 'coach_id'>>({
    game_title: "",
    game_date: format(new Date(), 'yyyy-MM-dd'),
    game_type: "official",
    opponent: "",
    strengths: "",
    weaknesses: "",
    key_moments: "",
    feelings: "",
    coach_notes: "",
    performance_rating: 7,
    concentration_level: 7,
    fatigue_level: 5,
    shared_with_player: false,
    video_url: "",
  });

  const gameTypes = [
    { value: "official", label: "משחק רשמי" },
    { value: "friendly", label: "משחק ידידות" },
    { value: "training", label: "משחק אימון" },
    { value: "tournament", label: "טורניר" },
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
        await loadGameSummaries(data.id);
      } catch (error: any) {
        console.error('Error loading player data:', error);
        toast.error(error.message || "אירעה שגיאה בטעינת נתוני השחקן");
      } finally {
        setLoading(false);
      }
    };
    
    loadPlayerData();
  }, [navigate]);

  const loadGameSummaries = async (playerId: string) => {
    try {
      const { data, error } = await supabase
        .from('game_summaries')
        .select('*')
        .eq('player_id', playerId)
        .order('game_date', { ascending: false });

      if (error) throw error;
      
      setGameSummaries(data || []);
    } catch (error: any) {
      console.error('Error loading game summaries:', error);
      toast.error(error.message || "אירעה שגיאה בטעינת סיכומי המשחקים");
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
        .from('game_summaries')
        .insert({
          player_id: playerData.id,
          coach_id: playerData.coach_id,
          game_title: newSummary.game_title,
          game_date: newSummary.game_date,
          game_type: newSummary.game_type,
          opponent: newSummary.opponent,
          strengths: newSummary.strengths,
          weaknesses: newSummary.weaknesses,
          key_moments: newSummary.key_moments,
          feelings: newSummary.feelings,
          coach_notes: newSummary.coach_notes,
          performance_rating: newSummary.performance_rating,
          concentration_level: newSummary.concentration_level,
          fatigue_level: newSummary.fatigue_level,
          shared_with_player: newSummary.shared_with_player,
          video_url: newSummary.video_url
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("סיכום המשחק נוסף בהצלחה");
      setGameSummaries(prev => [data as GameSummary, ...prev]);
      setShowAddDialog(false);
      resetNewSummaryForm();
    } catch (error: any) {
      console.error('Error adding game summary:', error);
      toast.error(error.message || "אירעה שגיאה בהוספת סיכום המשחק");
    } finally {
      setLoading(false);
    }
  };

  const toggleShareWithPlayer = async (summaryId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('game_summaries')
        .update({ shared_with_player: !currentStatus })
        .eq('id', summaryId);

      if (error) throw error;
      
      setGameSummaries(prev => 
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
      game_title: "",
      game_date: format(new Date(), 'yyyy-MM-dd'),
      game_type: "official",
      opponent: "",
      strengths: "",
      weaknesses: "",
      key_moments: "",
      feelings: "",
      coach_notes: "",
      performance_rating: 7,
      concentration_level: 7,
      fatigue_level: 5,
      shared_with_player: false,
      video_url: "",
    });
  };

  const filteredSummaries = gameSummaries.filter(summary => {
    const matchesSearch = summary.game_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          summary.opponent.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          summary.coach_notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGameType = selectedGameType === 'all' || summary.game_type === selectedGameType;
    
    const matchesDate = !dateFilter || summary.game_date === format(dateFilter, 'yyyy-MM-dd');
    
    return matchesSearch && matchesGameType && matchesDate;
  });

  const handleDateSelect = (date: Date | undefined) => {
    setDateFilter(date);
    setIsDatePickerOpen(false);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGameType("all");
    setDateFilter(undefined);
  };

  const handleBackToProfile = () => {
    navigate('/player-profile');
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 8) return "text-green-500";
    if (rating >= 6) return "text-blue-500";
    if (rating >= 4) return "text-yellow-500";
    return "text-red-500";
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
            <Activity className="h-8 w-8" />
            סיכומי משחקים
          </h1>
          <div className="w-28"></div> {/* Spacer for alignment */}
        </div>

        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle>חיפוש וסינון</CardTitle>
            <CardDescription>
              מצא סיכומי משחקים לפי מילות מפתח, סוג משחק או תאריך
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="חפש משחקים..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9"
                />
              </div>

              <Select value={selectedGameType} onValueChange={setSelectedGameType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="בחר סוג משחק" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל סוגי המשחקים</SelectItem>
                  {gameTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
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
              {filteredSummaries.length} סיכומי משחק נמצאו
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
                  <DialogTitle>הוספת סיכום משחק חדש</DialogTitle>
                  <DialogDescription>
                    מלא את הפרטים הבאים כדי ליצור סיכום משחק חדש לשחקן.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="game_title">שם המשחק</Label>
                      <Input
                        id="game_title"
                        value={newSummary.game_title}
                        onChange={(e) => setNewSummary({...newSummary, game_title: e.target.value})}
                        placeholder="הזן את שם המשחק"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="opponent">יריב</Label>
                      <Input
                        id="opponent"
                        value={newSummary.opponent}
                        onChange={(e) => setNewSummary({...newSummary, opponent: e.target.value})}
                        placeholder="הזן את שם היריב"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="game_date">תאריך המשחק</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-right"
                          >
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {newSummary.game_date ? format(new Date(newSummary.game_date), 'dd/MM/yyyy') : 'בחר תאריך'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={newSummary.game_date ? new Date(newSummary.game_date) : undefined}
                            onSelect={(date) => date && setNewSummary({...newSummary, game_date: format(date, 'yyyy-MM-dd')})}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="game_type">סוג משחק</Label>
                      <Select 
                        value={newSummary.game_type} 
                        onValueChange={(value) => setNewSummary({...newSummary, game_type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="בחר סוג משחק" />
                        </SelectTrigger>
                        <SelectContent>
                          {gameTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="strengths">נקודות חוזק</Label>
                    <Textarea
                      id="strengths"
                      value={newSummary.strengths}
                      onChange={(e) => setNewSummary({...newSummary, strengths: e.target.value})}
                      placeholder="תאר את נקודות החוזק בביצועי השחקן"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weaknesses">נקודות לשיפור</Label>
                    <Textarea
                      id="weaknesses"
                      value={newSummary.weaknesses}
                      onChange={(e) => setNewSummary({...newSummary, weaknesses: e.target.value})}
                      placeholder="תאר את הנקודות לשיפור בביצועי השחקן"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="key_moments">רגעי מפתח</Label>
                    <Textarea
                      id="key_moments"
                      value={newSummary.key_moments}
                      onChange={(e) => setNewSummary({...newSummary, key_moments: e.target.value})}
                      placeholder="תאר רגעים חשובים במשחק שהשפיעו על הביצועים"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="feelings">תחושות השחקן</Label>
                    <Textarea
                      id="feelings"
                      value={newSummary.feelings}
                      onChange={(e) => setNewSummary({...newSummary, feelings: e.target.value})}
                      placeholder="תאר את תחושות השחקן לפני/במהלך/אחרי המשחק"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="coach_notes">הערות המאמן</Label>
                    <Textarea
                      id="coach_notes"
                      value={newSummary.coach_notes}
                      onChange={(e) => setNewSummary({...newSummary, coach_notes: e.target.value})}
                      placeholder="הערות והצעות שלך כמאמן"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="performance_rating">דירוג ביצועים כללי ({newSummary.performance_rating}/10)</Label>
                      <span className={getPerformanceColor(newSummary.performance_rating)}>
                        {newSummary.performance_rating}/10
                      </span>
                    </div>
                    <Slider
                      id="performance_rating"
                      defaultValue={[7]}
                      max={10}
                      step={1}
                      value={[newSummary.performance_rating]}
                      onValueChange={(value) => setNewSummary({...newSummary, performance_rating: value[0]})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="concentration_level">רמת ריכוז ({newSummary.concentration_level}/10)</Label>
                      <span className={getPerformanceColor(newSummary.concentration_level)}>
                        {newSummary.concentration_level}/10
                      </span>
                    </div>
                    <Slider
                      id="concentration_level"
                      defaultValue={[7]}
                      max={10}
                      step={1}
                      value={[newSummary.concentration_level]}
                      onValueChange={(value) => setNewSummary({...newSummary, concentration_level: value[0]})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="fatigue_level">רמת עייפות ({newSummary.fatigue_level}/10)</Label>
                      <span className={newSummary.fatigue_level > 7 ? "text-red-500" : 
                              newSummary.fatigue_level > 4 ? "text-yellow-500" : "text-green-500"}>
                        {newSummary.fatigue_level}/10
                      </span>
                    </div>
                    <Slider
                      id="fatigue_level"
                      defaultValue={[5]}
                      max={10}
                      step={1}
                      value={[newSummary.fatigue_level]}
                      onValueChange={(value) => setNewSummary({...newSummary, fatigue_level: value[0]})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="video_url">קישור לסרטון ניתוח (אופציונלי)</Label>
                    <Input
                      id="video_url"
                      value={newSummary.video_url}
                      onChange={(e) => setNewSummary({...newSummary, video_url: e.target.value})}
                      placeholder="הזן קישור לסרטון וידאו"
                    />
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
              <Activity className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium mb-2">אין סיכומי משחקים</h3>
              <p className="text-muted-foreground text-center mb-6">
                עדיין לא נרשמו סיכומי משחקים. התחל על ידי הוספת סיכום חדש.
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
                      <CardTitle className="text-xl">{summary.game_title}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {summary.game_date ? format(new Date(summary.game_date), 'dd/MM/yyyy') : 'תאריך לא ידוע'}
                        <span className="mx-2">•</span>
                        נגד {summary.opponent}
                        <span className="mx-2">•</span>
                        {gameTypes.find(t => t.value === summary.game_type)?.label || 'סוג משחק לא ידוע'}
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
                      {summary.video_url && (
                        <TabsTrigger value="video" className="flex-1">וידאו</TabsTrigger>
                      )}
                    </TabsList>
                    
                    <TabsContent value="summary" className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="flex flex-col items-center p-3 border rounded-md">
                          <div className="text-sm text-muted-foreground mb-1">ביצועים</div>
                          <div className={`text-2xl font-bold ${getPerformanceColor(summary.performance_rating)}`}>
                            {summary.performance_rating}/10
                          </div>
                        </div>
                        <div className="flex flex-col items-center p-3 border rounded-md">
                          <div className="text-sm text-muted-foreground mb-1">ריכוז</div>
                          <div className={`text-2xl font-bold ${getPerformanceColor(summary.concentration_level)}`}>
                            {summary.concentration_level}/10
                          </div>
                        </div>
                        <div className="flex flex-col items-center p-3 border rounded-md">
                          <div className="text-sm text-muted-foreground mb-1">עייפות</div>
                          <div className={`text-2xl font-bold ${
                            summary.fatigue_level > 7 ? "text-red-500" : 
                            summary.fatigue_level > 4 ? "text-yellow-500" : "text-green-500"
                          }`}>
                            {summary.fatigue_level}/10
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-green-500" />
                          <h4 className="font-semibold">נקודות חוזק:</h4>
                        </div>
                        <p className="text-sm">{summary.strengths || 'לא צוין'}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <h4 className="font-semibold">נקודות לשיפור:</h4>
                        </div>
                        <p className="text-sm">{summary.weaknesses || 'לא צוין'}</p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="details" className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="font-semibold">רגעי מפתח:</h4>
                        <p className="text-sm">{summary.key_moments || 'לא צוין'}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="font-semibold">תחושות השחקן:</h4>
                        <p className="text-sm">{summary.feelings || 'לא צוין'}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="font-semibold">הערות המאמן:</h4>
                        <p className="text-sm">{summary.coach_notes || 'לא צוין'}</p>
                      </div>
                    </TabsContent>
                    
                    {summary.video_url && (
                      <TabsContent value="video">
                        <div className="aspect-video relative rounded-md overflow-hidden bg-gray-100">
                          {summary.video_url.includes('youtube.com') || summary.video_url.includes('youtu.be') ? (
                            <iframe
                              className="absolute top-0 left-0 w-full h-full"
                              src={summary.video_url.replace('watch?v=', 'embed/')}
                              title="YouTube video player"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full p-4">
                              <Video className="h-12 w-12 text-gray-400 mb-2" />
                              <p className="text-center text-sm text-muted-foreground">
                                קישור לוידאו זמין: <a href={summary.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{summary.video_url}</a>
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    )}
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

export default PlayerGameSummary;
