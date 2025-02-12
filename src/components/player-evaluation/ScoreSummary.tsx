
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { categories } from '@/types/playerEvaluation';
import { Brain, Dumbbell, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ScoreSummaryProps {
  scores: Record<string, number>;
}

interface CategoryScore {
  name: string;
  score: number;
  type: 'mental' | 'physical' | 'professional';
  id: string;
}

interface FeedbackByCategory {
  [key: string]: {
    high: {
      message: string;
      improvements: string[];
    };
    medium: {
      message: string;
      improvements: string[];
    };
    low: {
      message: string;
      improvements: string[];
    };
  };
}

const feedbackData: FeedbackByCategory = {
  'self-confidence': {
    high: {
      message: "הביטחון העצמי שלך הוא נכס משמעותי במשחק",
      improvements: [
        "המשך לקחת אחריות ומנהיגות במצבים מאתגרים",
        "שתף את הביטחון שלך עם שחקנים צעירים",
        "אתגר את עצמך במצבים חדשים כדי להמשיך להתפתח"
      ]
    },
    medium: {
      message: "אתה מראה סימני ביטחון טובים, אך יש מקום לשיפור",
      improvements: [
        "תרגל קבלת החלטות מהירות במשחק",
        "התמקד בהצלחות קטנות ובנה מהן",
        "הצב לעצמך יעדים קטנים וברי השגה"
      ]
    },
    low: {
      message: "יש צורך בחיזוק הביטחון העצמי שלך",
      improvements: [
        "עבוד עם מאמן מנטלי על בניית ביטחון",
        "התחל מתרגילים פשוטים והתקדם בהדרגה",
        "תעד הצלחות קטנות ביומן אישי"
      ]
    }
  },
  'concentration': {
    high: {
      message: "יכולת הריכוז שלך מרשימה ומהווה יתרון משמעותי",
      improvements: [
        "למד טכניקות מתקדמות של מדיטציה",
        "תרגל משחק תחת לחץ מוגבר",
        "שתף אחרים בטכניקות הריכוז שלך"
      ]
    },
    medium: {
      message: "הריכוז שלך טוב, אך יש מקום לשיפור בעקביות",
      improvements: [
        "תרגל תרגילי נשימה לפני משחקים",
        "צור רוטינה קבועה לפני כל משחק",
        "הגדר נקודות מפתח במשחק לבדיקת ריכוז"
      ]
    },
    low: {
      message: "נדרשת עבודה על שיפור יכולת הריכוז",
      improvements: [
        "התחל תרגול מדיטציה יומי",
        "צור סביבת אימון שקטה ורגועה",
        "עבוד על משימות קצרות וממוקדות"
      ]
    }
  },
  'aggression': {
    high: {
      message: "האגרסיביות החיובית שלך היא נכס לקבוצה",
      improvements: [
        "פתח יכולת להעביר אנרגיה חיובית לקבוצה",
        "למד לנצל את האגרסיביות בזמנים קריטיים",
        "שמור על איזון בין אגרסיביות לשליטה"
      ]
    },
    medium: {
      message: "אתה מראה סימני אגרסיביות טובים, אך נדרשת עקביות",
      improvements: [
        "עבוד על זיהוי רגעים לתעל אגרסיביות",
        "פתח יכולת לשלוט ברמת האגרסיביות",
        "תרגל משחק פיזי חוקי"
      ]
    },
    low: {
      message: "יש מקום לשיפור ברמת האגרסיביות החיובית",
      improvements: [
        "התחל באימוני כוח וביטחון",
        "למד מצבים המצריכים אגרסיביות",
        "עבוד על הביטחון בדו-קרבות"
      ]
    }
  },
  'fitness': {
    high: {
      message: "הכושר הגופני שלך מצוין ומהווה יתרון משמעותי",
      improvements: [
        "המשך לאתגר את עצמך עם אימונים מתקדמים",
        "שלב אלמנטים של כוח מתפרץ",
        "עבוד על שיפור היכולת האירובית"
      ]
    },
    medium: {
      message: "רמת הכושר שלך טובה, אך יש מקום לשיפור",
      improvements: [
        "הוסף אימוני אינטרוולים",
        "שפר את התזונה לפני ואחרי אימונים",
        "הגבר את תדירות האימונים בהדרגה"
      ]
    },
    low: {
      message: "יש צורך בשיפור משמעותי ברמת הכושר",
      improvements: [
        "התחל תכנית כושר בסיסית",
        "עבוד על סיבולת לב-ריאה",
        "שלב אימוני כוח קלים"
      ]
    }
  },
  'speed': {
    high: {
      message: "המהירות שלך היא נכס משמעותי במשחק",
      improvements: [
        "פתח יכולת שינוי כיוון במהירות גבוהה",
        "עבוד על זינוקים מתפרצים",
        "שלב תרגילי זריזות מתקדמים"
      ]
    },
    medium: {
      message: "המהירות שלך טובה, אך יש מקום לשיפור",
      improvements: [
        "הוסף אימוני ספרינטים קצרים",
        "עבוד על טכניקת ריצה",
        "שפר את הזריזות בסיבובים"
      ]
    },
    low: {
      message: "נדרשת עבודה על שיפור המהירות",
      improvements: [
        "התחל עם תרגילי מהירות בסיסיים",
        "עבוד על טכניקת צעדים",
        "שפר את הקואורדינציה"
      ]
    }
  },
  'power': {
    high: {
      message: "הכוח המתפרץ שלך מרשים ומשמעותי",
      improvements: [
        "פתח יכולת ניצול כוח בזמנים קריטיים",
        "עבוד על שילוב כוח ומהירות",
        "הוסף תרגילי פליומטריקה מתקדמים"
      ]
    },
    medium: {
      message: "הכוח המתפרץ שלך טוב, אך יש מקום לשיפור",
      improvements: [
        "הוסף אימוני כוח מתפרץ",
        "עבוד על קפיצות וזינוקים",
        "שפר את היציבות בדו-קרבות"
      ]
    },
    low: {
      message: "יש לעבוד על שיפור הכוח המתפרץ",
      improvements: [
        "התחל תכנית אימוני כוח בסיסית",
        "עבוד על יציבות הליבה",
        "שלב תרגילי קפיצה פשוטים"
      ]
    }
  },
  'first-touch': {
    high: {
      message: "הנגיעה הראשונה שלך היא ברמה גבוהה מאוד",
      improvements: [
        "תרגל מצבים מורכבים של קבלת כדור",
        "עבוד על דיוק בהורדת כדורים גבוהים",
        "פתח יכולת קבלה תחת לחץ"
      ]
    },
    medium: {
      message: "הנגיעה הראשונה שלך טובה, אך דורשת שיפור",
      improvements: [
        "תרגל קבלות כדור מכל הכיוונים",
        "עבוד על שליטה במהירות גבוהה",
        "שפר את הדיוק בהורדת כדור"
      ]
    },
    low: {
      message: "יש לשפר משמעותית את הנגיעה הראשונה",
      improvements: [
        "התמקד בתרגילי שליטה בסיסיים",
        "עבוד על קבלת כדור נייח",
        "תרגל הורדת כדור במהירות נמוכה"
      ]
    }
  },
  'game-intelligence': {
    high: {
      message: "חוכמת המשחק שלך היא נכס משמעותי",
      improvements: [
        "למד מצבים טקטיים מתקדמים",
        "פתח יכולת קריאת משחק מוקדמת",
        "שתף את התובנות שלך עם חברי הקבוצה"
      ]
    },
    medium: {
      message: "חוכמת המשחק שלך טובה, אך דורשת פיתוח",
      improvements: [
        "צפה במשחקים מקצועיים וחקור החלטות",
        "תרגל מצבי משחק שונים",
        "עבוד על קבלת החלטות מהירה"
      ]
    },
    low: {
      message: "יש לפתח את חוכמת המשחק",
      improvements: [
        "למד את יסודות הטקטיקה",
        "צפה במשחקים עם מאמן",
        "תרגל מצבי משחק בסיסיים"
      ]
    }
  },
  'teamwork': {
    high: {
      message: "עבודת הצוות שלך מצוינת ותורמת לקבוצה",
      improvements: [
        "קח תפקיד מנהיגותי בקבוצה",
        "פתח יכולת הנעת שחקנים",
        "שפר את התקשורת במצבים מורכבים"
      ]
    },
    medium: {
      message: "עבודת הצוות שלך טובה, אך יש מקום לשיפור",
      improvements: [
        "הגבר את התקשורת המילולית במגרש",
        "למד לזהות צרכים של חברי הקבוצה",
        "פתח שיתוף פעולה במצבים שונים"
      ]
    },
    low: {
      message: "יש לשפר את עבודת הצוות",
      improvements: [
        "עבוד על תקשורת בסיסית במגרש",
        "השתתף באימוני קבוצה ייעודיים",
        "למד את תפקידי חבריך לקבוצה"
      ]
    }
  }
};

export const ScoreSummary = ({ scores }: ScoreSummaryProps) => {
  const calculateCategoryScore = (categoryId: string): number => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return 0;

    const categoryScores = category.questions
      .map(q => scores[q.id] || 0)
      .filter(score => score > 0);

    if (categoryScores.length === 0) return 0;
    return Math.round(categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length);
  };

  const categoryScores: CategoryScore[] = categories.map(category => ({
    name: category.name,
    score: calculateCategoryScore(category.id),
    type: category.type,
    id: category.id
  }));

  const getScoreColor = (score: number): string => {
    if (score >= 8) return '#8B5CF6'; // Vivid Purple
    if (score >= 5) return '#F97316'; // Bright Orange
    return '#ea384c'; // Red
  };

  const getFeedbackLevel = (score: number): 'high' | 'medium' | 'low' => {
    if (score >= 8) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  };

  const getCategoryIcon = (type: 'mental' | 'physical' | 'professional') => {
    switch (type) {
      case 'mental':
        return <Brain className="w-5 h-5" />;
      case 'physical':
        return <Dumbbell className="w-5 h-5" />;
      case 'professional':
        return <Trophy className="w-5 h-5" />;
    }
  };

  const getTotalScore = (): number => {
    const validScores = categoryScores.filter(cat => cat.score > 0);
    if (validScores.length === 0) return 0;
    return Math.round(validScores.reduce((acc, cat) => acc + cat.score, 0) / validScores.length);
  };

  const totalScore = getTotalScore();

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold">ציון כולל: {totalScore}/10</h3>
        <Progress value={totalScore * 10} className="h-3" 
          style={{ 
            backgroundColor: '#f3f4f6',
            '--progress-background': getScoreColor(totalScore)
          } as React.CSSProperties} 
        />
      </div>

      <div className="grid gap-6">
        {['mental', 'physical', 'professional'].map((type) => (
          <div key={type} className="space-y-4">
            <div className="flex items-center gap-2">
              {getCategoryIcon(type as 'mental' | 'physical' | 'professional')}
              <h4 className="font-semibold">
                {type === 'mental' && 'יכולות מנטליות'}
                {type === 'physical' && 'יכולות גופניות'}
                {type === 'professional' && 'יכולות מקצועיות'}
              </h4>
            </div>
            
            <div className="space-y-4">
              {categoryScores
                .filter(cat => cat.type === type)
                .map(cat => (
                  <Collapsible key={cat.id}>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{cat.name}</span>
                        <span className="text-sm font-medium">{cat.score}/10</span>
                      </div>
                      <Progress value={cat.score * 10} className="h-2"
                        style={{ 
                          backgroundColor: '#f3f4f6',
                          '--progress-background': getScoreColor(cat.score)
                        } as React.CSSProperties}
                      />
                      {cat.score > 0 && feedbackData[cat.id] && (
                        <CollapsibleTrigger className="w-full flex items-center justify-between pt-2 text-sm text-gray-600 hover:text-gray-900">
                          <span>הצג משוב מפורט</span>
                          <ChevronDown className="w-4 h-4" />
                        </CollapsibleTrigger>
                      )}
                    </div>
                    
                    {cat.score > 0 && feedbackData[cat.id] && (
                      <CollapsibleContent className="pt-2">
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
                          <p className="font-medium">
                            {feedbackData[cat.id][getFeedbackLevel(cat.score)].message}
                          </p>
                          <div className="space-y-2">
                            <p className="font-medium text-primary">נקודות לשיפור:</p>
                            <ul className="list-disc list-inside space-y-1 text-gray-600">
                              {feedbackData[cat.id][getFeedbackLevel(cat.score)].improvements.map((improvement, idx) => (
                                <li key={idx}>{improvement}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
