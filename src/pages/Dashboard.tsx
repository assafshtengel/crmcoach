import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Gamepad, Search, LogOut, ArrowRight, FileText, ChartLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp } from "lucide-react";

interface EvaluationSummary {
  id: string;
  total_score: number | null;
  player_name: string;
  evaluation_date: string;
  category_averages?: Record<string, number> | null;
}

interface CategoryName {
  id: string;
  name: string;
}

const categoryNames: CategoryName[] = [
  { id: 'pressure', name: 'לחץ' },
  { id: 'motivation', name: 'מוטיבציה' },
  { id: 'aggressiveness', name: 'אגרסיביות' },
  { id: 'energy', name: 'אנרגיה' },
  { id: 'one-on-one-defense', name: 'הגנה אישית' },
  { id: 'scoring', name: 'בעיטה לשער' },
  { id: 'decision-making', name: 'קבלת החלטות' },
  { id: 'self-confidence', name: 'ביטחון עצמי' },
  { id: 'initiative', name: 'יוזמה' },
  { id: 'self-control', name: 'שליטה עצמית' },
  { id: 'clear-goals', name: 'מטרות ברורות' }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [recentEvaluations, setRecentEvaluations] = useState<EvaluationSummary[]>([]);
  const [openEvaluation, setOpenEvaluation] = useState<number | null>(null);

  useEffect(() => {
    fetchRecentEvaluations();
  }, []);

  const fetchRecentEvaluations = async () => {
    const { data, error } = await supabase
      .from('player_evaluations')
      .select('id, total_score, player_name, evaluation_date, category_averages')
      .order('created_at', { ascending: false })
      .limit(3);

    if (!error && data) {
      setRecentEvaluations(data as EvaluationSummary[]);
    }
  };

  const handleDeleteEvaluation = async (id: string) => {
    const { error } = await supabase
      .from('player_evaluations')
      .delete()
      .eq('id', id);

    if (!error) {
      setRecentEvaluations(prev => prev.filter(evaluation => evaluation.id !== id));
      setShowDeleteDialog(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getScoreColor = (score: number | null): string => {
    if (!score) return 'text-gray-400';
    if (score >= 8) return 'text-purple-600';
    if (score >= 6) return 'text-orange-500';
    return 'text-red-500';
  };

  const getProgressColor = (score: number | null): string => {
    if (!score) return 'bg-gray-200';
    if (score >= 8) return 'bg-purple-600';
    if (score >= 6) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatScore = (score: number | null): string => {
    if (score === null) return 'אין ציון';
    return score.toFixed(1);
  };

  const getProgressValue = (score: number | null): number => {
    if (score === null) return 0;
    return score * 10;
  };

  const cards = [
    {
      title: "טרום משחק",
      icon: Gamepad,
      description: "הכנה מנטלית לקראת המשחק",
      path: "/form"
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
      path: "/player-evaluation"
    },
    {
      title: "דוחות טרום משחק",
      icon: FileText,
      description: "צפייה בכל הדוחות שהוזנו למערכת",
      path: "/reports"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
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
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent animate-fade-in">
            💡 אלוף לא נולד – הוא נבנה. הנתונים שלך, ההתקדמות שלך, ההצלחה שלך! 💡
          </h1>
          <Button 
            variant="outline" 
            size="icon"
            className="text-destructive hover:bg-destructive hover:text-white"
            onClick={() => setShowLogoutDialog(true)}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {recentEvaluations.length > 0 && (
          <Card className="mb-8 bg-gradient-to-br from-white to-purple-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <ChartLine className="h-6 w-6 text-primary" />
                  הערכות אלמנטים אחרונות
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80"
                  onClick={() => navigate('/player-evaluation')}
                >
                  הערכה חדשה
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvaluations.map((evaluation, index) => (
                  <Collapsible
                    key={evaluation.id}
                    open={openEvaluation === index}
                    onOpenChange={() => setOpenEvaluation(openEvaluation === index ? null : index)}
                  >
                    <div className="bg-white p-4 rounded-lg shadow-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{evaluation.player_name}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(evaluation.evaluation_date).toLocaleDateString('he-IL')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`font-bold text-xl ${getScoreColor(evaluation.total_score)}`}>
                            {formatScore(evaluation.total_score)}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteDialog(evaluation.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              {openEvaluation === index ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                      <Progress
                        value={getProgressValue(evaluation.total_score)}
                        className={`h-2 rounded-full ${getProgressColor(evaluation.total_score)}`}
                      />
                      <CollapsibleContent>
                        <div className="mt-4 space-y-3 pt-3 border-t">
                          {categoryNames.map((category) => {
                            const score = evaluation.category_averages?.[category.id] ?? null;
                            return (
                              <div key={category.id} className="flex items-center justify-between">
                                <span className="text-sm font-medium">{category.name}</span>
                                <div className="flex items-center gap-3 flex-1 max-w-[200px]">
                                  <Progress
                                    value={getProgressValue(score)}
                                    className={`h-2 rounded-full ${getProgressColor(score)}`}
                                  />
                                  <span className={`text-sm font-medium w-12 text-left ${getScoreColor(score)}`}>
                                    {formatScore(score)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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

        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent>
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

        <AlertDialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>האם אתה בטוח שברצונך למחוק הערכה זו?</AlertDialogTitle>
              <AlertDialogDescription>
                פעולה זו תמחק לצמיתות את כל הנתונים של הערכה זו ולא ניתן יהיה לשחזר אותם
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ביטול</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={() => showDeleteDialog && handleDeleteEvaluation(showDeleteDialog)}
              >
                מחק הערכה
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Dashboard;
