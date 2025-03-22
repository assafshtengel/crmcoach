
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

interface Question {
  id: string;
  question_text: string;
  answer: string;
  type: 'open' | 'closed';
  rating?: number; // For closed questions
}

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
      title: "שאלון 8: תקשורת קבוצתית ואינטראקציה",
      created_at: "2023-10-21T11:00:00Z",
      player_name: "ערן זהבי",
      type: "team_communication",
      questions_count: 6
    }
  ];

  // Sample detailed questionnaire data with the specific questions provided
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
          question_text: "מהם שלושת הדברים החשובים ביותר שאתה רוצה להשיג באימון היום?",
          answer: "1. לשפר את דיוק הקליעה מחצי מרחק. 2. לעבוד על תרגילי מסירות במהירות. 3. להתמקד בתקשורת טובה יותר עם חברי הקבוצה.",
          type: "open"
        },
        {
          id: "1-2",
          question_text: "מה יכול לעזור לך להשיג את מטרותיך היום?",
          answer: "התמקדות ברגעי מפתח, ניצול מלא של זמן האימון, ובקשת משוב מהמאמן על המיומנויות הספציפיות שאני רוצה לשפר.",
          type: "open"
        },
        {
          id: "1-3",
          question_text: "מה יכול להפריע לך במהלך האימון וכיצד תתגבר על כך?",
          answer: "עייפות מהמשחק אתמול יכולה להפריע. אתגבר על זה עם התחממות טובה, שתייה מספקת ומיקוד מנטלי על המטרות העיקריות.",
          type: "open"
        },
        {
          id: "1-4",
          question_text: "רמת אנרגיה פיזית (1-10)",
          answer: "7",
          type: "closed",
          rating: 7
        },
        {
          id: "1-5",
          question_text: "רמת מוכנות מנטלית (1-10)",
          answer: "8",
          type: "closed",
          rating: 8
        },
        {
          id: "1-6",
          question_text: "מידת המיקוד במטרות היום (1-10)",
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
          question_text: "מהם ההישגים העיקריים שלך היום?",
          answer: "שיפרתי את אחוזי הקליעה בתרגולים, הייתי יותר פעיל בתקשורת עם חברי הקבוצה, והצלחתי להתגבר על העייפות בחלק השני של האימון.",
          type: "open"
        },
        {
          id: "2-2",
          question_text: "האם היה משהו ספציפי שגילית או למדת על עצמך היום?",
          answer: "גיליתי שכשאני מתמקד בשיפור מיומנות אחת ספציפית בכל אימון, ההתקדמות שלי מהירה יותר. היום התמקדתי בקליעות מחצי מרחק וראיתי שיפור ניכר.",
          type: "open"
        },
        {
          id: "2-3",
          question_text: "אילו דברים תרצה לשפר באימון מחר?",
          answer: "מחר ארצה להתמקד בעבודת רגליים בהגנה, ובמיוחד במעברים מהירים בין התקפה להגנה. גם אשים דגש על החלטות מהירות יותר במסירות.",
          type: "open"
        },
        {
          id: "2-4",
          question_text: "שביעות רצון מהמאמץ (1-10)",
          answer: "8",
          type: "closed",
          rating: 8
        },
        {
          id: "2-5",
          question_text: "שביעות רצון מהגישה (1-10)",
          answer: "9",
          type: "closed",
          rating: 9
        },
        {
          id: "2-6",
          question_text: "תחושת התקדמות לעבר המטרות (1-10)",
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
          question_text: "מהן הפעולות הטובות ביותר שביצעת במשחק?",
          answer: "המסירות המדויקות למרכז השדה, היכולת לפתוח את המשחק לאגפים והשתתפות במספר מהלכים שהובילו לגולים.",
          type: "open"
        },
        {
          id: "3-2",
          question_text: "אילו פעולות תרצה לבצע טוב יותר בפעם הבאה?",
          answer: "אצטרך לשפר את היציבות בקבלת הכדור תחת לחץ, ואת ההתמודדות עם הכפילות של היריב. גם ארצה להגביר את הנוכחות שלי בדקות הסיום.",
          type: "open"
        },
        {
          id: "3-3",
          question_text: "מה למדת מהמשחק שתיקח איתך הלאה?",
          answer: "למדתי שהתקשורת עם עמיתי לקו הקדמי חיונית במיוחד כשהיריב משחק בשיטה מסוימת. גם הבנתי שאני צריך להיות יותר גמיש טקטית כשמשתנה מערך היריב.",
          type: "open"
        },
        {
          id: "3-4",
          question_text: "שביעות רצון מהביצוע הכללי (1-10)",
          answer: "7",
          type: "closed",
          rating: 7
        },
        {
          id: "3-5",
          question_text: "מוכנות מנטלית לפני ובמהלך המשחק (1-10)",
          answer: "8",
          type: "closed",
          rating: 8
        },
        {
          id: "3-6",
          question_text: "רמת הביטחון במהלך המשחק (1-10)",
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
          question_text: "מהן המחשבות העיקריות שלך לפני המשחק?",
          answer: "אני מתמקד בתפקיד הספציפי שלי במשחק הקרוב, חושב על יריבים ישירים שאתמודד איתם ומדמיין סיטואציות מוצלחות מהמשחקים האחרונים.",
          type: "open"
        },
        {
          id: "4-2",
          question_text: "אילו תרחישים חיוביים דמיינת כהכנה?",
          answer: "דמיינתי תרחישי התקפה מהירה, זיהוי מצבים שבהם אני הופך ממגן לתוקף, ומספר מצבים של ביצוע מוצלח של בעיטות חופשיות.",
          type: "open"
        },
        {
          id: "4-3",
          question_text: "מה אתה עושה כדי להרגיע את עצמך?",
          answer: "משתמש בטכניקות נשימה מיוחדות, שומע מוזיקה מרגיעה, ומבצע מדיטציה קצרה של 5-10 דקות. גם שיחה קצרה עם חבר קרוב או בן משפחה עוזרת.",
          type: "open"
        },
        {
          id: "4-4",
          question_text: "מוכנות פיזית (1-10)",
          answer: "9",
          type: "closed",
          rating: 9
        },
        {
          id: "4-5",
          question_text: "מוכנות מנטלית (1-10)",
          answer: "8",
          type: "closed",
          rating: 8
        },
        {
          id: "4-6",
          question_text: "רמת הלחץ (1-10)",
          answer: "6",
          type: "closed",
          rating: 6
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
          question_text: "אילו מטרות אישיות השגת השבוע?",
          answer: "הגעתי ליעד של 85% דיוק בקליעות חופשיות, שיפרתי את ההספק בתרגילי סיבולת, והפחתתי את מספר איבודי הכדור במשחקים.",
          type: "open"
        },
        {
          id: "5-2",
          question_text: "אילו אתגרים חווית?",
          answer: "התמודדתי עם עייפות מצטברת בגלל לוח המשחקים הצפוף, וחוויתי קושי בשמירה על ריכוז באימונים שלאחר המשחקים. גם הסתגלות לתפקיד החדש הייתה מאתגרת.",
          type: "open"
        },
        {
          id: "5-3",
          question_text: "אילו מטרות תרצה להציב לשבוע הבא?",
          answer: "לשפר את יכולת ההחלטה המהירה במצבי לחץ, לעבוד על דיוק בזריקות מטווח בינוני, ולהגביר את היעילות בהגנה על שחקנים גבוהים.",
          type: "open"
        },
        {
          id: "5-4",
          question_text: "שביעות רצון מההתקדמות (1-10)",
          answer: "8",
          type: "closed",
          rating: 8
        },
        {
          id: "5-5",
          question_text: "רמת מוטיבציה (1-10)",
          answer: "9",
          type: "closed",
          rating: 9
        },
        {
          id: "5-6",
          question_text: "נאמנות לתוכנית האישית (1-10)",
          answer: "7",
          type: "closed",
          rating: 7
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
          question_text: "מה נותן לך הכי הרבה מוטיבציה?",
          answer: "הרצון להשתפר כל יום, התחרותיות מול עצמי והשאיפה להגיע לרמות הגבוהות ביותר. גם המשוב החיובי מהמאמנים ותמיכת המשפחה מהווים מקור מוטיבציה חזק.",
          type: "open"
        },
        {
          id: "6-2",
          question_text: "כיצד אתה מתמודד עם לחץ ותסכול?",
          answer: "משתמש בתרגילי נשימה עמוקה, ממקד את עצמי בתהליך ולא בתוצאה, ומנסה לפרק אתגרים גדולים למשימות קטנות יותר. שיחות עם הפסיכולוג הספורטיבי עוזרות מאוד.",
          type: "open"
        },
        {
          id: "6-3",
          question_text: "מה יכול לשפר את ההתמודדות שלך עם לחץ?",
          answer: "תרגול נוסף של סיטואציות לחץ באימונים, למידה של טכניקות מדיטציה נוספות, וניהול זמן טוב יותר כדי לא להגיע למצבי לחץ מיותרים לפני משחקים.",
          type: "open"
        },
        {
          id: "6-4",
          question_text: "רמת מוטיבציה נוכחית (1-10)",
          answer: "9",
          type: "closed",
          rating: 9
        },
        {
          id: "6-5",
          question_text: "התמודדות עם לחץ (1-10)",
          answer: "7",
          type: "closed",
          rating: 7
        },
        {
          id: "6-6",
          question_text: "תדירות שבה לחץ פוגע בביצועים (1-10)",
          answer: "4",
          type: "closed",
          rating: 4
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
          question_text: "מהם רגעי השיא שלך בעונה?",
          answer: "הגול המכריע בדרבי, ההופעה בגביע המדינה עם שני שערים ובישול, והמשחק מול האלופה שבו הובלתי את המהפך עם כל המשפחה ביציע.",
          type: "open"
        },
        {
          id: "7-2",
          question_text: "אילו מטרות לא הושגו ולמה?",
          answer: "לא הגעתי ליעד של 15 שערים בליגה (הגעתי ל-12), בעיקר בגלל הפציעה באמצע העונה. גם המטרה לשפר את היכולת האווירית לא הושגה במלואה בגלל פחות זמן אימון ייעודי.",
          type: "open"
        },
        {
          id: "7-3",
          question_text: "מה תעשה אחרת בעונה הבאה?",
          answer: "אקדיש יותר זמן לאימוני מניעת פציעות ולחיזוק שרירי הליבה. אתמקד יותר בהכנה מנטלית לפני משחקים חשובים, ואבקש יותר משוב ספציפי מהמאמנים על היבטים טקטיים.",
          type: "open"
        },
        {
          id: "7-4",
          question_text: "שביעות רצון מהאימונים (1-10)",
          answer: "8",
          type: "closed",
          rating: 8
        },
        {
          id: "7-5",
          question_text: "שביעות רצון מההתפתחות האישית (1-10)",
          answer: "7",
          type: "closed",
          rating: 7
        },
        {
          id: "7-6",
          question_text: "מוטיבציה לקראת העונה הבאה (1-10)",
          answer: "10",
          type: "closed",
          rating: 10
        }
      ]
    },
    {
      id: "8",
      title: "שאלון 8: תקשורת קבוצתית ואינטראקציה",
      created_at: "2023-10-21T11:00:00Z",
      player_name: "ערן זהבי",
      type: "team_communication",
      questions: [
        {
          id: "8-1",
          question_text: "כיצד היית מתאר את התקשורת עם חברי הקבוצה?",
          answer: "התקשורת בדרך כלל טובה, במיוחד במגרש. יש כבוד הדדי ופתיחות לשמוע דעות שונות. לפעמים בעת לחץ התקשורת הופכת פחות יעילה, במיוחד במשחקי חוץ קשים.",
          type: "open"
        },
        {
          id: "8-2",
          question_text: "מה עובד טוב ומה פחות עם צוות האימון?",
          answer: "המשוב הטכני והטקטי מהמאמנים מצוין ומדויק. לעומת זאת, לפעמים חסרה תקשורת ברורה לגבי ציפיות ארוכות טווח וההתקדמות האישית ביחס למטרות הקבוצתיות.",
          type: "open"
        },
        {
          id: "8-3",
          question_text: "איך אפשר לשפר את התקשורת הכללית?",
          answer: "יותר פגישות אישיות קצרות עם המאמנים, שיחות קבוצתיות פתוחות לאחר אירועים משמעותיים (ולא רק אחרי הפסדים), ומערכת משוב פשוטה וקבועה יותר.",
          type: "open"
        },
        {
          id: "8-4",
          question_text: "תקשורת פתוחה עם חברי הקבוצה (1-10)",
          answer: "8",
          type: "closed",
          rating: 8
        },
        {
          id: "8-5",
          question_text: "הבנה של הדרישות מהצוות (1-10)",
          answer: "7",
          type: "closed",
          rating: 7
        },
        {
          id: "8-6",
          question_text: "נוחות לפנות לצוות או לשחקנים (1-10)",
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
