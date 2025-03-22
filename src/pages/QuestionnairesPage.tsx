
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, FileText, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface Questionnaire {
  id: string;
  title: string;
  created_at: string;
  player_name: string;
  type: string;
  questions_count: number;
}

interface QuestionnaireDetails {
  id: string;
  title: string;
  created_at: string;
  player_name: string;
  type: string;
  questions: Question[];
}

interface Question {
  id: string;
  question_text: string;
  answer: string;
  type: 'open' | 'closed';
  rating?: number; // For closed questions
}

const QuestionnairesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<QuestionnaireDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setQuestionnaires(sampleQuestionnaires);
      setIsLoading(false);
    }, 800);
  }, []);

  const handleViewQuestionnaire = async (id: string) => {
    try {
      // Find the questionnaire in our sample data
      const questionnaire = sampleQuestionnairesDetails.find(q => q.id === id);
      
      if (questionnaire) {
        setSelectedQuestionnaire(questionnaire);
        setIsDialogOpen(true);
      } else {
        throw new Error("Questionnaire not found");
      }
    } catch (error) {
      console.error('Error fetching questionnaire details:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת השאלון",
        description: "אנא נסה שוב מאוחר יותר"
      });
    }
  };

  const getQuestionnaireTypeBadge = (type: string) => {
    switch (type) {
      case 'day_opening':
        return <Badge className="bg-blue-500">פתיחת יום</Badge>;
      case 'day_summary':
        return <Badge className="bg-green-500">סיכום יום</Badge>;
      case 'post_game':
        return <Badge className="bg-purple-500">אחרי משחק</Badge>;
      case 'mental_prep':
        return <Badge className="bg-yellow-500">מוכנות מנטלית</Badge>;
      case 'personal_goals':
        return <Badge className="bg-red-500">מטרות אישיות</Badge>;
      case 'motivation':
        return <Badge className="bg-indigo-500">מוטיבציה ולחץ</Badge>;
      case 'season_end':
        return <Badge className="bg-pink-500">סיום עונה</Badge>;
      case 'team_communication':
        return <Badge className="bg-orange-500">תקשורת קבוצתית</Badge>;
      default:
        return <Badge className="bg-gray-500">{type}</Badge>;
    }
  };

  const renderQuestionnaireCard = (questionnaire: Questionnaire) => {
    return (
      <Card key={questionnaire.id} className="bg-white hover:bg-gray-50 transition-all duration-300">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-medium">{questionnaire.title}</CardTitle>
              <p className="text-sm text-gray-500">
                {format(new Date(questionnaire.created_at), 'dd MMMM yyyy', { locale: he })}
              </p>
            </div>
            {getQuestionnaireTypeBadge(questionnaire.type)}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm">
            <span className="font-semibold">שחקן: </span>
            {questionnaire.player_name}
          </p>
          <p className="text-sm">
            <span className="font-semibold">מספר שאלות: </span>
            {questionnaire.questions_count}
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="ghost" 
            className="w-full flex justify-center items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={() => handleViewQuestionnaire(questionnaire.id)}
          >
            <Eye className="h-4 w-4 mr-2" />
            צפה בשאלון
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Sample data for questionnaires
  const sampleQuestionnaires: Questionnaire[] = [
    {
      id: "1",
      title: "שאלון 1: פתיחת יום",
      created_at: "2023-10-15T09:00:00Z",
      player_name: "דני אבדיה",
      type: "day_opening",
      questions_count: 6
    },
    {
      id: "2",
      title: "שאלון 2: סיכום יום",
      created_at: "2023-10-15T18:30:00Z",
      player_name: "דני אבדיה",
      type: "day_summary",
      questions_count: 6
    },
    {
      id: "3",
      title: "שאלון 3: אחרי משחק",
      created_at: "2023-10-16T22:00:00Z",
      player_name: "יוסי בניון",
      type: "post_game",
      questions_count: 6
    },
    {
      id: "4",
      title: "שאלון 4: מוכנות מנטלית לפני משחק",
      created_at: "2023-10-17T15:00:00Z",
      player_name: "טל בן חיים",
      type: "mental_prep",
      questions_count: 6
    },
    {
      id: "5",
      title: "שאלון 5: ניטור מטרות אישיות (שבועי)",
      created_at: "2023-10-18T10:00:00Z",
      player_name: "אלון מזרחי",
      type: "personal_goals",
      questions_count: 6
    },
    {
      id: "6",
      title: "שאלון 6: מוטיבציה ולחץ",
      created_at: "2023-10-19T14:00:00Z",
      player_name: "ליאור רפאלוב",
      type: "motivation",
      questions_count: 6
    },
    {
      id: "7",
      title: "שאלון 7: סיום עונה",
      created_at: "2023-10-20T16:00:00Z",
      player_name: "מאור בוזגלו",
      type: "season_end",
      questions_count: 6
    },
    {
      id: "8",
      title: "שאלון 8: תקשורת קבוצתית",
      created_at: "2023-10-21T11:00:00Z",
      player_name: "ערן זהבי",
      type: "team_communication",
      questions_count: 6
    }
  ];

  // Sample detailed questionnaire data
  const sampleQuestionnairesDetails: QuestionnaireDetails[] = [
    {
      id: "1",
      title: "שאלון 1: פתיחת יום",
      created_at: "2023-10-15T09:00:00Z",
      player_name: "דני אבדיה",
      type: "day_opening",
      questions: [
        {
          id: "1-1",
          question_text: "איך אתה מרגיש הבוקר?",
          answer: "אני מרגיש נמרץ ומוכן לאימון היום. ישנתי טוב אתמול.",
          type: "open"
        },
        {
          id: "1-2",
          question_text: "מה המטרות שלך להיום?",
          answer: "להתמקד בשיפור הקליעה מהחצי ולעבוד על התזמון בהגנה.",
          type: "open"
        },
        {
          id: "1-3",
          question_text: "איזה אתגר אתה צופה היום?",
          answer: "האימון המשולב עם הקבוצה הבכירה עלול להיות מאתגר מבחינה פיזית.",
          type: "open"
        },
        {
          id: "1-4",
          question_text: "דרג את רמת האנרגיה שלך (1-10)",
          answer: "8",
          type: "closed",
          rating: 8
        },
        {
          id: "1-5",
          question_text: "דרג את איכות השינה שלך אמש (1-10)",
          answer: "7",
          type: "closed",
          rating: 7
        },
        {
          id: "1-6",
          question_text: "דרג את המוטיבציה שלך להיום (1-10)",
          answer: "9",
          type: "closed",
          rating: 9
        }
      ]
    },
    {
      id: "2",
      title: "שאלון 2: סיכום יום",
      created_at: "2023-10-15T18:30:00Z",
      player_name: "דני אבדיה",
      type: "day_summary",
      questions: [
        {
          id: "2-1",
          question_text: "כיצד היה האימון היום?",
          answer: "האימון היה אינטנסיבי ומאתגר. הצלחתי להתקדם בקליעות החופשיות.",
          type: "open"
        },
        {
          id: "2-2",
          question_text: "האם השגת את המטרות שהצבת לעצמך בבוקר?",
          answer: "כן, ברובן. עבדתי על הקליעה כמתוכנן אבל יש עוד מקום לשיפור בהגנה.",
          type: "open"
        },
        {
          id: "2-3",
          question_text: "מה למדת היום?",
          answer: "למדתי טכניקה חדשה לשיפור הקפיצה בזריקה מרחוק.",
          type: "open"
        },
        {
          id: "2-4",
          question_text: "דרג את רמת המאמץ שלך באימון (1-10)",
          answer: "9",
          type: "closed",
          rating: 9
        },
        {
          id: "2-5",
          question_text: "דרג את שביעות הרצון שלך מהביצועים (1-10)",
          answer: "8",
          type: "closed",
          rating: 8
        },
        {
          id: "2-6",
          question_text: "דרג את רמת העייפות שלך כעת (1-10)",
          answer: "7",
          type: "closed",
          rating: 7
        }
      ]
    },
    {
      id: "3",
      title: "שאלון 3: אחרי משחק",
      created_at: "2023-10-16T22:00:00Z",
      player_name: "יוסי בניון",
      type: "post_game",
      questions: [
        {
          id: "3-1",
          question_text: "כיצד אתה מעריך את הביצוע שלך במשחק?",
          answer: "שיחקתי טוב יחסית, במיוחד במחצית השנייה. הייתי מעורב בשלושה מהלכים משמעותיים.",
          type: "open"
        },
        {
          id: "3-2",
          question_text: "מה היה הרגע הטוב ביותר עבורך?",
          answer: "המסירה המדויקת שהובילה לשער בדקה ה-78.",
          type: "open"
        },
        {
          id: "3-3",
          question_text: "מה היית משפר בביצוע שלך?",
          answer: "הייתי צריך להיות יותר אגרסיבי בהגנה במחצית הראשונה.",
          type: "open"
        },
        {
          id: "3-4",
          question_text: "דרג את הביצוע הכללי שלך (1-10)",
          answer: "7",
          type: "closed",
          rating: 7
        },
        {
          id: "3-5",
          question_text: "דרג את רמת המאמץ שלך במשחק (1-10)",
          answer: "9",
          type: "closed",
          rating: 9
        },
        {
          id: "3-6",
          question_text: "דרג את שביעות הרצון שלך מהתוצאה (1-10)",
          answer: "8",
          type: "closed",
          rating: 8
        }
      ]
    },
    {
      id: "4",
      title: "שאלון 4: מוכנות מנטלית לפני משחק",
      created_at: "2023-10-17T15:00:00Z",
      player_name: "טל בן חיים",
      type: "mental_prep",
      questions: [
        {
          id: "4-1",
          question_text: "כיצד אתה מתכונן מנטלית למשחק היום?",
          answer: "מדיטציה של 15 דקות ודמיון מודרך של סיטואציות במשחק.",
          type: "open"
        },
        {
          id: "4-2",
          question_text: "מהן המטרות האישיות שלך למשחק?",
          answer: "לשמור על ריכוז לאורך כל המשחק ולהוביל את הקבוצה בהתקפות.",
          type: "open"
        },
        {
          id: "4-3",
          question_text: "מהם החששות העיקריים שלך לקראת המשחק?",
          answer: "חשש מהכריזמה של השחקן המוביל בקבוצה היריבה והיכולת שלו לשבור את ההגנה שלנו.",
          type: "open"
        },
        {
          id: "4-4",
          question_text: "דרג את רמת הביטחון שלך (1-10)",
          answer: "8",
          type: "closed",
          rating: 8
        },
        {
          id: "4-5",
          question_text: "דרג את רמת החרדה שלך (1-10)",
          answer: "4",
          type: "closed",
          rating: 4
        },
        {
          id: "4-6",
          question_text: "דרג את המוכנות המנטלית הכללית שלך (1-10)",
          answer: "9",
          type: "closed",
          rating: 9
        }
      ]
    },
    {
      id: "5",
      title: "שאלון 5: ניטור מטרות אישיות (שבועי)",
      created_at: "2023-10-18T10:00:00Z",
      player_name: "אלון מזרחי",
      type: "personal_goals",
      questions: [
        {
          id: "5-1",
          question_text: "אילו מטרות הצבת לעצמך השבוע?",
          answer: "לשפר את דיוק הקליעות ל-45% לפחות ולהגביר את יכולת הקפיצה.",
          type: "open"
        },
        {
          id: "5-2",
          question_text: "האם הצלחת להשיג את המטרות? הסבר.",
          answer: "את מטרת הקליעה השגתי (47%), אך עדיין עובד על שיפור הקפיצה.",
          type: "open"
        },
        {
          id: "5-3",
          question_text: "איזה מטרות אתה מציב לשבוע הבא?",
          answer: "להמשיך בשיפור הקליעה ולהתמקד בשיפור הזריקות מהעונשין.",
          type: "open"
        },
        {
          id: "5-4",
          question_text: "דרג את שביעות רצונך מההתקדמות (1-10)",
          answer: "8",
          type: "closed",
          rating: 8
        },
        {
          id: "5-5",
          question_text: "דרג את הקושי בהשגת המטרות (1-10)",
          answer: "7",
          type: "closed",
          rating: 7
        },
        {
          id: "5-6",
          question_text: "דרג את המוטיבציה שלך להמשיך (1-10)",
          answer: "9",
          type: "closed",
          rating: 9
        }
      ]
    },
    {
      id: "6",
      title: "שאלון 6: מוטיבציה ולחץ",
      created_at: "2023-10-19T14:00:00Z",
      player_name: "ליאור רפאלוב",
      type: "motivation",
      questions: [
        {
          id: "6-1",
          question_text: "מה מניע אותך בתקופה זו?",
          answer: "הרצון להוכיח את עצמי כשחקן מוביל בקבוצה ולהגיע לנבחרת בעונה הבאה.",
          type: "open"
        },
        {
          id: "6-2",
          question_text: "אילו גורמי לחץ אתה חווה כעת?",
          answer: "לחץ מהתקשורת וציפיות גבוהות מהמאמן ומההנהלה.",
          type: "open"
        },
        {
          id: "6-3",
          question_text: "כיצד אתה מתמודד עם הלחץ?",
          answer: "משתמש בטכניקות נשימה ומיינדפולנס, ומתייעץ באופן קבוע עם הפסיכולוג הספורטיבי.",
          type: "open"
        },
        {
          id: "6-4",
          question_text: "דרג את רמת המוטיבציה שלך כעת (1-10)",
          answer: "9",
          type: "closed",
          rating: 9
        },
        {
          id: "6-5",
          question_text: "דרג את רמת הלחץ שאתה חש (1-10)",
          answer: "7",
          type: "closed",
          rating: 7
        },
        {
          id: "6-6",
          question_text: "דרג את היכולת שלך להתמודד עם הלחץ (1-10)",
          answer: "8",
          type: "closed",
          rating: 8
        }
      ]
    },
    {
      id: "7",
      title: "שאלון 7: סיום עונה",
      created_at: "2023-10-20T16:00:00Z",
      player_name: "מאור בוזגלו",
      type: "season_end",
      questions: [
        {
          id: "7-1",
          question_text: "כיצד אתה מסכם את העונה שלך?",
          answer: "עונה מוצלחת יחסית עם שיפור משמעותי בסטטיסטיקה האישית, למרות הפציעה באמצע העונה.",
          type: "open"
        },
        {
          id: "7-2",
          question_text: "מה היו ההישגים העיקריים שלך העונה?",
          answer: "הבקעתי 15 שערים, הייתי מעורב ב-10 בישולים, ונבחרתי לשחקן המצטיין פעמיים.",
          type: "open"
        },
        {
          id: "7-3",
          question_text: "מה היית רוצה לשפר לקראת העונה הבאה?",
          answer: "את היציבות הפיזית ואת היכולת שלי במשחקי חוץ.",
          type: "open"
        },
        {
          id: "7-4",
          question_text: "דרג את שביעות רצונך מהעונה (1-10)",
          answer: "8",
          type: "closed",
          rating: 8
        },
        {
          id: "7-5",
          question_text: "דרג את הביצועים שלך ביחס לציפיות (1-10)",
          answer: "7",
          type: "closed",
          rating: 7
        },
        {
          id: "7-6",
          question_text: "דרג את המוטיבציה שלך לעונה הבאה (1-10)",
          answer: "10",
          type: "closed",
          rating: 10
        }
      ]
    },
    {
      id: "8",
      title: "שאלון 8: תקשורת קבוצתית",
      created_at: "2023-10-21T11:00:00Z",
      player_name: "ערן זהבי",
      type: "team_communication",
      questions: [
        {
          id: "8-1",
          question_text: "איך אתה מעריך את התקשורת בקבוצה?",
          answer: "התקשורת טובה יחסית, אך יש מקום לשיפור בתקשורת בין ההגנה להתקפה במעברים מהירים.",
          type: "open"
        },
        {
          id: "8-2",
          question_text: "אילו אתגרי תקשורת קיימים בקבוצה לדעתך?",
          answer: "פערי שפה עם השחקנים הזרים ולעיתים חוסר בהירות בהוראות הטקטיות.",
          type: "open"
        },
        {
          id: "8-3",
          question_text: "כיצד ניתן לשפר את התקשורת?",
          answer: "פגישות קבוצתיות קצרות יותר אך תכופות יותר, ושימוש בויזואליזציה להבהרת הוראות טקטיות.",
          type: "open"
        },
        {
          id: "8-4",
          question_text: "דרג את איכות התקשורת במגרש (1-10)",
          answer: "7",
          type: "closed",
          rating: 7
        },
        {
          id: "8-5",
          question_text: "דרג את התקשורת מחוץ למגרש (1-10)",
          answer: "8",
          type: "closed",
          rating: 8
        },
        {
          id: "8-6",
          question_text: "דרג את השפעת התקשורת על ביצועי הקבוצה (1-10)",
          answer: "9",
          type: "closed",
          rating: 9
        }
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">שאלונים</h1>
            <p className="text-gray-600">צפה בשאלונים שמולאו על ידי השחקנים</p>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center" 
            onClick={() => navigate('/dashboard-coach')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            חזרה לדשבורד
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">כל השאלונים ({questionnaires.length})</TabsTrigger>
            <TabsTrigger value="day_opening">פתיחת יום ({questionnaires.filter(q => q.type === 'day_opening').length})</TabsTrigger>
            <TabsTrigger value="day_summary">סיכום יום ({questionnaires.filter(q => q.type === 'day_summary').length})</TabsTrigger>
            <TabsTrigger value="post_game">אחרי משחק ({questionnaires.filter(q => q.type === 'post_game').length})</TabsTrigger>
            <TabsTrigger value="mental_prep">מוכנות מנטלית ({questionnaires.filter(q => q.type === 'mental_prep').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {questionnaires.length > 0 ? (
                questionnaires.map(questionnaire => renderQuestionnaireCard(questionnaire))
              ) : (
                <div className="col-span-3 text-center p-10 bg-white rounded-lg shadow">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="text-xl font-medium text-gray-800">אין שאלונים זמינים</h3>
                  <p className="text-gray-500 mt-2">לא נמצאו שאלונים במערכת</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Render tab content for each type */}
          {['day_opening', 'day_summary', 'post_game', 'mental_prep', 'personal_goals', 'motivation', 'season_end', 'team_communication'].map(type => (
            <TabsContent key={type} value={type} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {questionnaires.filter(q => q.type === type).length > 0 ? (
                  questionnaires
                    .filter(q => q.type === type)
                    .map(questionnaire => renderQuestionnaireCard(questionnaire))
                ) : (
                  <div className="col-span-3 text-center p-10 bg-white rounded-lg shadow">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="text-xl font-medium text-gray-800">אין שאלונים זמינים</h3>
                    <p className="text-gray-500 mt-2">לא נמצאו שאלונים מסוג זה במערכת</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedQuestionnaire?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedQuestionnaire && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">שחקן: </span>
                    {selectedQuestionnaire.player_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">תאריך: </span>
                    {format(new Date(selectedQuestionnaire.created_at), 'dd MMMM yyyy', { locale: he })}
                  </p>
                </div>
                {getQuestionnaireTypeBadge(selectedQuestionnaire.type)}
              </div>

              <Separator className="my-4" />

              <ScrollArea className="h-[50vh] pr-4">
                <div className="space-y-6">
                  {/* Open questions first */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-3">שאלות פתוחות</h3>
                    {selectedQuestionnaire.questions
                      .filter(q => q.type === 'open')
                      .map((question, index) => (
                        <div key={question.id} className="bg-gray-50 p-4 rounded-lg mb-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-gray-900">
                              שאלה {index + 1}: {question.question_text}
                            </h3>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <p className="text-gray-700">{question.answer}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            תאריך מילוי: {format(new Date(selectedQuestionnaire.created_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                          </p>
                        </div>
                      ))}
                  </div>

                  {/* Closed questions second */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">שאלות סגורות (דירוג 1-10)</h3>
                    {selectedQuestionnaire.questions
                      .filter(q => q.type === 'closed')
                      .map((question, index) => (
                        <div key={question.id} className="bg-gray-50 p-4 rounded-lg mb-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-gray-900">
                              שאלה {index + 1}: {question.question_text}
                            </h3>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-4">
                                <div 
                                  className="bg-blue-600 h-4 rounded-full" 
                                  style={{ width: `${(question.rating || 0) * 10}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 font-bold">{question.rating}/10</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            תאריך מילוי: {format(new Date(selectedQuestionnaire.created_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionnairesPage;
