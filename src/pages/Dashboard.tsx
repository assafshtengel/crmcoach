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
  const [cards, setCards] = useState<DashboardCard[]>([]);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<{ title: string; content: string }>({
    title: "",
    content: "",
  });

  useEffect(() => {
    const initializeCards = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth");
          return;
        }

        const { data: existingCards } = await supabase
          .from('dashboard_cards')
          .select('*')
          .eq('user_id', session.user.id);

        if (!existingCards || existingCards.length === 0) {
          const initialCards = [
            {
              card_title: 'ברוך הבא',
              card_content: 'ברוך הבא למערכת הניהול שלך. כאן תוכל לעקוב אחר ההתקדמות שלך ולנהל את המשימות שלך.',
              card_type: 'welcome',
              card_order: 1,
              user_id: session.user.id
            },
            {
              card_title: 'המשימות הבאות שלך',
              card_content: 'צפה בכל המשימות המתוכננות שלך וסמן אותן כמושלמות כשאתה מסיים.',
              card_type: 'tasks',
              card_order: 2,
              user_id: session.user.id
            },
            {
              card_title: 'סטטיסטיקות',
              card_content: 'עקוב אחר ההתקדמות שלך וצפה בנתונים סטטיסטיים על הביצועים שלך.',
              card_type: 'stats',
              card_order: 3,
              user_id: session.user.id
            }
          ];

          const { data: newCards, error } = await supabase
            .from('dashboard_cards')
            .insert(initialCards)
            .select();

          if (error) throw error;
          setCards(newCards);
          
          toast({
            title: "ברוך הבא!",
            description: "הכרטיסיות הראשוניות נוצרו בהצלחה"
          });
        } else {
          setCards(existingCards);
        }
      } catch (error) {
        console.error('Error initializing cards:', error);
        toast({
          title: "שגיאה בטעינת הכרטיסיות",
          description: "אנא נסה שוב מאוחר יותר",
          variant: "destructive"
        });
      }
    };

    initializeCards();
  }, [navigate, toast]);

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
      </div>
    </div>
  );
};

export default Dashboard;
