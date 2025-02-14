import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, LogOut, ArrowRight, Video, Target, Calendar, BookOpen, Play, Check, Trash2, Instagram, Facebook, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface DashboardCard {
  id: string;
  card_title: string;
  card_content: string;
  card_type: string;
  card_order: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);
  const [evaluationResults, setEvaluationResults] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteCode, setDeleteCode] = useState("");
  const [cards, setCards] = useState<DashboardCard[]>([]);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<{ title: string; content: string }>({
    title: "",
    content: "",
  });

  const SECURITY_CODE = "1976";

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_cards')
        .select('*')
        .order('card_order', { ascending: true });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast({
        title: "שגיאה בטעינת הכרטיסיות",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive"
      });
    }
  };

  const handleEditStart = (card: DashboardCard) => {
    setEditingCard(card.id);
    setEditedContent({
      title: card.card_title,
      content: card.card_content,
    });
  };

  const handleEditSave = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from('dashboard_cards')
        .update({
          card_title: editedContent.title,
          card_content: editedContent.content,
        })
        .eq('id', cardId);

      if (error) throw error;

      setCards(cards.map(card => 
        card.id === cardId 
          ? { ...card, card_title: editedContent.title, card_content: editedContent.content }
          : card
      ));
      
      setEditingCard(null);
      toast({
        title: "שינויים נשמרו",
        description: "הכרטיסייה עודכנה בהצלחה"
      });
    } catch (error) {
      console.error('Error saving card:', error);
      toast({
        title: "שגיאה בשמירת השינויים",
        description: "אנא נסה שוב",
        variant: "destructive"
      });
    }
  };

  const handleEditCancel = () => {
    setEditingCard(null);
    setEditedContent({ title: "", content: "" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };
  const fetchEvaluationResults = async () => {
    try {
      const {
        data: session
      } = await supabase.auth.getSession();
      if (!session.session) return;
      const {
        data,
        error
      } = await supabase.from('player_evaluations').select('*').eq('user_id', session.session.user.id).order('created_at', {
        ascending: false
      }).limit(1);
      if (error) {
        console.error('Error fetching evaluation:', error);
        return;
      }
      if (data && data.length > 0) {
        setEvaluationResults(data[0]);
      } else {
        setEvaluationResults(null);
      }
    } catch (error) {
      console.error('Error in fetchEvaluationResults:', error);
      setEvaluationResults(null);
    }
  };
  useEffect(() => {
    fetchEvaluationResults();
  }, []);
  const handleDeleteEvaluation = async () => {
    try {
      if (deleteCode !== SECURITY_CODE) {
        toast({
          title: "קוד שגוי",
          description: "הקוד שהוזן אינו נכון",
          variant: "destructive"
        });
        return;
      }
      const {
        data: session
      } = await supabase.auth.getSession();
      if (!session.session) return;
      const {
        error
      } = await supabase.from('player_evaluations').delete().eq('user_id', session.session.user.id);
      if (error) {
        console.error('Error deleting evaluation:', error);
        toast({
          title: "שגיאה במחיקת ההערכה",
          description: "אנא נסה שוב מאוחר יותר",
          variant: "destructive"
        });
        return;
      }
      setEvaluationResults(null);
      setShowDeleteDialog(false);
      setDeleteCode("");
      toast({
        title: "ההערכה נמחקה בהצלחה",
        description: "תוכל למלא הערכה חדשה בכל עת"
      });
    } catch (error) {
      console.error('Error in handleDeleteEvaluation:', error);
      toast({
        title: "שגיאה במחיקת ההערכה",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive"
      });
    }
  };
  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };
  const getProgressColor = (score: number): string => {
    if (score >= 8) return 'bg-green-600';
    if (score >= 6) return 'bg-yellow-600';
    return 'bg-red-600';
  };
  const nextMeeting = "מפגש אישי עם אסף (30 דקות) - במהלך השבוע של 16.2-21.2, מועד מדויק ייקבע בהמשך";
  const playerName = "אורי";
  const weeklyProgress = 75;
  const videos = [{
    id: "video1",
    title: "הפסיכולוגיה של הביצוע – פרק 42: חוק ה-1%",
    url: "https://www.youtube.com/watch?v=3vt10U_ssc8&t=150s",
    date: "זמין לצפייה",
    isLocked: false
  }, {
    id: "video2",
    title: "חוק ה-1% - חלק ב'",
    url: "https://www.youtube.com/watch?v=example2",
    date: "ייפתח לצפייה ביום שלישי 18.2.25",
    isLocked: true
  }];
  const handleWatchedToggle = (videoId: string) => {
    setWatchedVideos(prev => prev.includes(videoId) ? prev.filter(id => id !== videoId) : [...prev, videoId]);
  };
  const goals = ["יישום הנקסט - הטמעת החשיבה כל הזמן של להיות מוכן לנקודה הבאה כל הזמן", "יישום הנקסט על ידי מחיאת כף ומיד חשיבה על ביצוע הפעולה הבאה"];
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>חזור לעמוד הקודם</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent animate-fade-in">
            ברוך הבא, נהוראי! 🏆
          </h1>
          <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive hover:text-white" onClick={() => setShowLogoutDialog(true)}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {cards.map((card) => (
            <Card key={card.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                {editingCard === card.id ? (
                  <Input
                    value={editedContent.title}
                    onChange={(e) => setEditedContent({ ...editedContent, title: e.target.value })}
                    className="font-bold"
                  />
                ) : (
                  <CardTitle className="text-xl">{card.card_title}</CardTitle>
                )}
                <div className="flex gap-2">
                  {editingCard === card.id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditSave(card.id)}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleEditCancel}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditStart(card)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {editingCard === card.id ? (
                  <Textarea
                    value={editedContent.content}
                    onChange={(e) => setEditedContent({ ...editedContent, content: e.target.value })}
                    className="min-h-[100px]"
                  />
                ) : (
                  <div className="space-y-2">
                    <p className="text-gray-600">{card.card_content}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent className="bg-white/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle>אתה בטוח שברצונך להתנתק?</AlertDialogTitle>
              <AlertDialogDescription>
                לאחר ההתנתקות תצטרך להתחבר מחדש כדי לגשת למערכת
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>לא</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>כן, התנתק</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>מחיקת הערכת אלמנטים</DialogTitle>
              <DialogDescription>
                להמשך המחיקה, אנא הזן את קוד האבטחה
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input type="password" placeholder="הזן קוד אבטחה" value={deleteCode} onChange={e => setDeleteCode(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
              setShowDeleteDialog(false);
              setDeleteCode("");
            }}>
                ביטול
              </Button>
              <Button variant="destructive" onClick={handleDeleteEvaluation}>
                מחק הערכה
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;
