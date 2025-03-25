import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, FileText, Microscope, LineChart, Star, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResearchModal } from "./ResearchModal";
import { EditResearchModal } from "./EditResearchModal";
import { toast } from "sonner";

interface Study {
  id: number;
  title: string;
  institution: string;
  abstract: string;
  field: string;
  hasRating?: boolean;
  rating?: number;
  iconType: "brain" | "chart" | "microscope" | "document";
  fullContent: React.ReactNode;
}

const recentStudies: Study[] = [{
  id: 1,
  title: "השפעת האימון המנטלי על ביצועי ספורטאים מקצועיים",
  institution: "בוצע באוניברסיטת תל אביב",
  abstract: "המחקר מצא שאימון מנטלי של 20 דקות ביום משפר ביצועים בכ-35% אצל ספורטאים תחרותיים.",
  field: "פסיכולוגיה ספורטיבית",
  hasRating: true,
  rating: 5,
  iconType: "brain",
  fullContent: (
    <>
      <h2 className="text-xl font-bold mb-4">רקע</h2>
      <p>אימון מנטלי הוא טכניקה שמשתמשת בדמיון ובחשיבה מכוונת כדי לשפר ביצועים פיזיים. מחקר זה בחן את ההשפעה של אימון מנטלי יומי על ביצועי ספורטאים תחרותיים במגוון ענפי ספורט.</p>
      
      <h2 className="text-xl font-bold my-4">שיטה</h2>
      <p>המחקר עקב אחר 120 ספורטאים בגילאי 18-35 לאורך תקופה של 12 שבועות. המשתתפים חולקו לשתי קבוצות:</p>
      <ul className="list-disc list-inside my-2 space-y-1">
        <li>קבוצת ניסוי: ביצעה 20 דקות אימון מנטלי מובנה מדי יום</li>
        <li>קבוצת ביקורת: המשיכה באימונים רגילים ללא התערבות מנטלית</li>
      </ul>
      
      <h2 className="text-xl font-bold my-4">תוצאות</h2>
      <p>לאחר 12 שבועות, קבוצת הניסוי הראתה שיפור משמעותי במדדים הבאים:</p>
      <ul className="list-disc list-inside my-2 space-y-1">
        <li>שיפור ממוצע של 35% בדיוק הביצועים</li>
        <li>ירידה של 28% ברמות חרדת ביצוע</li>
        <li>שיפור של 42% ביכולת לשמור על ריכוז בזמן לחץ</li>
      </ul>
      
      <h2 className="text-xl font-bold my-4">מסקנות</h2>
      <p>ממצאי המחקר מדגישים את החשיבות של שילוב אימון מנטלי בתכנית האימונים של ספורטאים תחרותיים. האימון המנטלי מאפשר לספורטאים לדמיין ולחוות ביצועים מוצלחים לפני ביצועם בפועל, מה שמחזק את הקשרים העצביים הדרושים לביצוע אופטימלי.</p>
      
      <p className="mt-4">מומלץ לשלב אימון מנטלי של 15-20 דקות מדי יום בשגרת האימונים של ספורטאים בכל הרמות, עם דגש מיוחד לפני תחרויות חשובות.</p>
    </>
  )
}, {
  id: 2,
  title: "חוסן נפשי ותפקוד תחת לחץ בקרב שחקני נוער",
  institution: "המכון למדעי הספורט",
  abstract: "השוואה בין תוכניות חוסן נפשי שונות והשפעתן על יכולת השחקנים להתמודד עם מצבי לחץ.",
  field: "חוסן נפשי",
  hasRating: false,
  iconType: "chart",
  fullContent: (
    <>
      <h2 className="text-xl font-bold mb-4">מטרת המחקר</h2>
      <p>מחקר זה בחן את האפקטיביות של שלוש תוכניות חוסן נפשי שונות בקרב שחקני כדורגל בגילאי 14-18, במטרה לזהות אילו שיטות יעילות ביותר לפיתוח חוסן נפשי והתמודדות עם לחץ תחרותי.</p>
      
      <h2 className="text-xl font-bold my-4">שיטות התערבות</h2>
      <p>המחקר השווה בין שלוש גישות:</p>
      <ul className="list-disc list-inside my-2 space-y-1">
        <li><strong>תכנית A:</strong> מיינדפולנס ומדיטציה - 15 דקות יומיות</li>
        <li><strong>תכנית B:</strong> שיחות קבוצתיות וסימולציות מצבי לחץ - פעמיים בשבוע</li>
        <li><strong>תכנית C:</strong> הצבת מטרות וטכניקות שליטה בנשימה - שילוב יומי</li>
      </ul>
      
      <h2 className="text-xl font-bold my-4">תוצאות עיקריות</h2>
      <p>לאחר 16 שבועות של התערבות, התוצאות הראו:</p>
      <ul className="list-disc list-inside my-2 space-y-2">
        <li>תכנית C הניבה את התוצאות הטובות ביותר במדדי חוסן ויכולת התמודדות עם לחץ</li>
        <li>שחקנים בכל התכניות הראו שיפור ברמת החוסן הנפשי בהשוואה לקבוצת הביקורת</li>
        <li>שחקנים בתכנית B הראו שיפור משמעותי ביכולת לתקשר במצבי לחץ</li>
      </ul>
      
      <h2 className="text-xl font-bold my-4">המלצות יישומיות</h2>
      <p>על בסיס התוצאות, המחקר ממליץ:</p>
      <ol className="list-decimal list-inside my-2 space-y-1">
        <li>לשלב הצבת מטרות יומיות ממוקדות כחלק אינטגרלי מאימוני נוער</li>
        <li>ללמד טכניקות שליטה בנשימה ולתרגל אותן באופן קבוע</li>
        <li>לקיים סימולציות מצבי לחץ מתוכננות במהלך אימונים</li>
        <li>להקדיש זמן לשיחות קבוצתיות על התמודדות עם אתגרים מנטליים</li>
      </ol>
    </>
  )
}, {
  id: 3,
  title: "טכניקות ויזואליזציה מתקדמות וביצועים אתלטיים",
  institution: "האוניברסיטה העברית בירושלים",
  abstract: "מחקר המנתח את הקשר בין איכות הויזואליזציה של ספורטאים לבין דיוק הביצוע בפועל.",
  field: "נוירולוגיה",
  hasRating: true,
  rating: 4,
  iconType: "brain",
  fullContent: (
    <>
      <h2 className="text-xl font-bold mb-4">מבוא לויזואליזציה בספורט</h2>
      <p>ויזואליזציה היא טכניקה פסיכולוגית המאפשרת לספורטאים לדמיין את עצמם מבצעים פעולות ספציפיות בהצלחה. מחקר זה בחן את הקשר בין חדות הדימוי המנטלי (איכות הויזואליזציה) לבין דיוק הביצוע בפועל.</p>
      
      <h2 className="text-xl font-bold my-4">מתודולוגיה</h2>
      <p>המחקר כלל 75 ספורטאים מקצועיים מענפי ספורט המצריכים דיוק גבוה (קליעה למטרה, גולף, קשתות). המשתתפים חולקו לשלוש קבוצות:</p>
      <ul className="list-disc list-inside my-2 space-y-1">
        <li>ויזואליזציה סטנדרטית (20 דקות יומיות)</li>
        <li>ויזואליזציה מתקדמת עם משוב נוירולוגי (20 דקות יומיות)</li>
        <li>קבוצת ביקורת (ללא ויזואליזציה)</li>
      </ul>
      
      <h2 className="text-xl font-bold my-4">טכניקות ויזואליזציה מתקדמות</h2>
      <p>במסגרת המחקר פותחו טכניקות ויזואליזציה מתקדמות הכוללות:</p>
      <ul className="list-disc list-inside my-2 space-y-1">
        <li>שילוב מכוון של כל החושים בתהליך הדמיון</li>
        <li>דמיון מנקודת מבט פנימית וחיצונית לסירוגין</li>
        <li>ויזואליזציה של תיקון טעויות בזמן אמת</li>
        <li>שילוב רגשות חיוביים בתהליך הדמיון</li>
      </ul>
      
      <h2 className="text-xl font-bold my-4">ממצאים מרכזיים</h2>
      <p>הממצאים הראו כי:</p>
      <ul className="list-disc list-inside my-2 space-y-1">
        <li>קבוצת הויזואליזציה המתקדמת הציגה שיפור של 31% בדיוק הביצועים</li>
        <li>נמצא מתאם ישיר בין יכולת לדמיין בחדות גבוהה לבין דיוק בביצוע</li>
        <li>אזורי המוח האחראים על תכנון מוטורי הראו פעילות מוגברת גם בזמן הויזואליזציה</li>
      </ul>
      
      <h2 className="text-xl font-bold my-4">מסקנות והמלצות</h2>
      <p>המחקר מצביע על כך שפיתוח יכולת ויזואליזציה עשירה וחדה היא מיומנות שניתן ללמוד ולשפר. מומלץ לשלב אימוני ויזואליזציה מתקדמים בתכנית האימונים של ספורטאים, במיוחד בענפים הדורשים דיוק גבוה.</p>
    </>
  )
}, {
  id: 4,
  title: "השפעת תזונה על יכולת קוגניטיבית בזמן תחרויות",
  institution: "מכון ויצמן למדע",
  abstract: "בחינת הקשר בין תזונה עשירה באומגה 3 ותפקוד מנטלי במצבי עומס גופני ונפשי.",
  field: "תזונה וקוגניציה",
  hasRating: true,
  rating: 5,
  iconType: "microscope",
  fullContent: (
    <>
      <h2 className="text-xl font-bold mb-4">רקע מדעי</h2>
      <p>תזונה נכונה משפיעה לא רק על תפקוד פיזי אלא גם על תפקוד קוגניטיבי, במיוחד במצבי מאמץ ולחץ. מחקר זה התמקד בהשפעה של צריכת אומגה 3 על יכולות מנטליות של ספורטאים במהלך ולאחר מאמץ גופני אינטנסיבי.</p>
      
      <h2 className="text-xl font-bold my-4">מערך המחקר</h2>
      <p>90 ספורטאים תחרותיים השתתפו במחקר כפול-סמיות שנמשך 16 שבועות. המשתתפים חולקו באופן אקראי לשלוש קבוצות:</p>
      <ul className="list-disc list-inside my-2 space-y-1">
        <li>קבוצה 1: קיבלה תוסף אומגה 3 בריכוז גבוה (3 גרם ליום)</li>
        <li>קבוצה 2: קיבלה תוסף אומגה 3 בריכוז בינוני (1.5 גרם ליום)</li>
        <li>קבוצה 3: קיבלה פלסבו</li>
      </ul>
      
      <h2 className="text-xl font-bold my-4">מדדים</h2>
      <p>הספורטאים נבדקו במגוון מדדים קוגניטיביים לפני ואחרי מאמץ גופני:</p>
      <ul className="list-disc list-inside my-2 space-y-1">
        <li>זמן תגובה למטלות החלטה מורכבות</li>
        <li>יכולת ריכוז לאורך זמן</li>
        <li>זיכרון עבודה במצבי עומס</li>
        <li>יכולת קבלת החלטות תחת לחץ</li>
        <li>מדדי דם של מרקרים דלקתיים</li>
      </ul>
      
      <h2 className="text-xl font-bold my-4">תוצאות עיקריות</h2>
      <p>לאחר 16 שבועות:</p>
      <ul className="list-disc list-inside my-2 space-y-1">
        <li>קבוצה 1 (ריכוז גבוה) הציגה שיפור של 27% במדדי הקוגניציה לאחר מאמץ</li>
        <li>קבוצה 2 הציגה שיפור של 18%</li>
        <li>נמצאה ירידה משמעותית במרקרים דלקתיים בקבוצות 1 ו-2</li>
        <li>זמן התאוששות קוגניטיבית לאחר מאמץ היה קצר יותר בקבוצות הניסוי</li>
      </ul>
      
      <h2 className="text-xl font-bold my-4">המלצות תזונתיות</h2>
      <p>על בסיס הממצאים, המחקר ממליץ על:</p>
      <ul className="list-disc list-inside my-2 space-y-1">
        <li>צריכה יומית של 2-3 גרם אומגה 3 לספורטאים תחרותיים</li>
        <li>העדפת מקורות טבעיים כמו דגים שמנים, אגוזים וזרעי פשתן</li>
        <li>תזמון צריכת אומגה 3 כ-3-4 שעות לפני פעילות אינטנסיבית</li>
        <li>שילוב עם נוגדי חמצון טבעיים להגברת ההשפעה החיובית</li>
      </ul>
    </>
  )
}, {
  id: 5,
  title: "השפעת האזנה למוזיקה לפני תחרות על רמת החרדה",
  institution: "האקדמיה למוזיקה ולמחול בירושלים",
  abstract: "ניתוח השפעת סוגי מוזיקה שונים על רמות מתח וחרדה לפני תחרויות ספורט.",
  field: "פסיכולוגיה",
  hasRating: true,
  rating: 4,
  iconType: "chart",
  fullContent: (
    <>
      <h2 className="text-xl font-bold mb-4">מטרת המחקר</h2>
      <p>מחקר זה בחן את ההשפעה של האזנה לסוגי מוזיקה שונים לפני תחרות על רמות החרדה, הריכוז והביצועים של ספורטאים תחרותיים.</p>
      
      <h2 className="text-xl font-bold my-4">מתודולוגיה</h2>
      <p>המחקר כלל 105 ספורטאים מקצועיים ממגוון ענפי ספורט. המשתתפים חולקו לארבע קבוצות וקיבלו הנחיות האזנה ספציפיות:</p>
      <ul className="list-disc list-inside my-2 space-y-1">
        <li>קבוצה 1: האזנה למוזיקה מעוררת בקצב מהיר</li>
        <li>קבוצה 2: האזנה למוזיקה מרגיעה בקצב איטי</li>
        <li>קבוצה 3: האזנה למוזיקה מועדפת אישית</li>
        <li>קבוצה 4: ללא מוזיקה (ביקורת)</li>
      </ul>
      <p>ההאזנה התבצעה במשך 15 דקות, 30-45 דקות לפני תחרות. המדדים שנבדקו כללו מדדי חרדה פסיכולוגיים ופיזיולוגיים, רמת ריכוז והערכת ביצועים.</p>
      
      <h2 className="text-xl font-bold my-4">ממצאים עיקריים</h2>
      <h3 className="text-lg font-semibold mt-3 mb-1">השפעה על מדדים פיזיולוגיים:</h3>
      <ul className="list-disc list-inside my-2 space-y-1">
        <li>קבוצה 2 (מוזיקה מרגיעה): ירידה של 23% ברמת הקורטיזול</li>
        <li>קבוצה 1 (מוזיקה מעוררת): עלייה מתונה בקצב הלב ורמת עוררות אופטימלית</li>
        <li>כל קבוצות המוזיקה: ירידה בלחץ הדם הסיסטולי בהשוואה לקבוצת הביקורת</li>
      </ul>
      
      <h3 className="text-lg font-semibold mt-3 mb-1">השפעה על מדדים פסיכולוגיים:</h3>
      <ul className="list-disc list-inside my-2 space-y-1">
        <li>קבוצה 3 (מוזיקה אישית): הראתה את הירידה המשמעותית ביותר במדדי החרדה הסובייקטיביים</li>
        <li>קבוצה 1: דיווחה על רמות מוטיבציה וביטחון גבוהות יותר</li>
      </ul>
      
      <h2 className="text-xl font-bold my-4">המלצות יישומיות</h2>
      <p>בהתבסס על הממצאים, המחקר ממליץ על:</p>
      <ol className="list-decimal list-inside my-2 space-y-1">
        <li>התאמה אישית של המוזיקה בהתאם לאפיוני הספורטאי והענף</li>
        <li>ספורטאים הנוטים לחרדת ביצוע - מומלצת מוזיקה מרגיעה (60-80 פעימות לדקה)</li>
        <li>ספורטאים הזקוקים לעוררות - מומלצת מוזיקה קצבית (120-140 פעימות לדקה)</li>
        <li>יצירת פלייליסטים ייעודיים לפי שלבי התחרות: התארגנות, חימום, רגע לפני</li>
      </ol>
      
      <p className="italic mt-4">הערה: פלייליסט אישי שנבנה בהתאם להעדפות הספורטאי ולמצב הרוח המיטבי עבורו נמצא כאפקטיבי ביותר בהפחתת חרדה ושיפור ביצועים.</p>
    </>
  )
}, {
  id: 6,
  title: "הקשר בין שעות שינה ויכולת קבלת החלטות בספורט",
  institution: "אוניברסיטת בן גוריון",
  abstract: "מחקר רחב היקף הבוחן את הקשר בין איכות וכמות השינה לבין דיוק בקבלת החלטות במשחק.",
  field: "נוירולוגיה",
  hasRating: true,
  rating: 5,
  iconType: "brain",
  fullContent: (
    <>
      <h2 className="text-xl font-bold mb-4">מבוא וחשיבות המחקר</h2>
      <p>איכות וכמות השינה נחשבות למרכיבים חיוניים בביצועי ספורט, אך ההשפעה הספציפית שלהן על תהליכי קבלת החלטות בזמן אמת במשחק עדיין לא נחקרה מספיק. מחקר זה בחן את הקשר בין דפוסי שינה ליכולת קבלת החלטות מהירה ומדויקת בקרב שחקני כדורגל מקצועיים.</p>
      
      <h2 className="text-xl font-bold my-4">שיטת המחקר</h2>
      <p>48 שחקני כדורגל מליגות מקצועיות השתתפו במחקר לאורך עונה שלמה. הנתונים שנאספו כללו:</p>
      <ul className="list-disc list-inside my-2 space-y-1">
        <li>ניטור שינה מלא באמצעות מכשור מתקדם (משך שינה, איכות שינה, שלבי שינה עמוקה)</li>
        <li>מדדי ביצוע במשחקים (באמצעות מערכות ניתוח וידאו)</li>
        <li>מבחני סימולציה לבחינת קבלת החלטות במצבים משחקיים</li>
        <li>מדדי זמן תגובה וקשב (לפני ואחרי משחקים)</li>
      </ul>
      
      <h2 className="text-xl font-bold my-4">ממצאים מרכזיים</h2>
      <h3 className="text-lg font-semibold mt-3 mb-1">כמות שינה:</h3>
      <ul className="list-disc list-inside my-2 space-y-1">
        <li>ירידה של שעה בשינה הובילה לירידה של 14% בדיוק קבלת החלטות</li>
        <li>זמן התגובה האט ב-17% כאשר נרשמו פחות מ-7 שעות שינה</li>
        <li>ספורטאים עם 8+ שעות שינה הציגו ביצועים טובים ב-29% במבחני קבלת החלטות</li>
      </ul>
      
      <h3 className="text-lg font-semibold mt-3 mb-1">איכות שינה:</h3>
      <ul className="list-disc list-inside my-2 space-y-1">
        <li>שינה עמוקה (שלב N3) נמצאה קריטית לשיפור קבלת החלטות</li>
        <li>שינה מקוטעת (יותר מ-4 הפרעות בלילה) הובילה לירידה של 23% בביצועים קוגניטיביים</li>
        <li>שחקנים עם יחס גבוה של שינת REM הציגו יצירתיות טקטית משופרת</li>
      </ul>
      
      <h2 className="text-xl font-bold my-4">פרוטוקול שינה מיטבי</h2>
      <p>בהתבסס על הממצאים, פותח פרוטוקול שינה מיטבי לספורטאים:</p>
      <ol className="list-decimal list-inside my-2 space-y-1">
        <li>8-9 שעות שינה בלילה (תלוי בגיל ומאפיינים אישיים)</li>
        <li>שגרת שינה קבועה עם זמני שינה והתעוררות עקביים</li>
        <li>הגבלת חשיפה למסכים בשעתיים שלפני השינה</li>
        <li>טמפרטורת חדר אופטימלית (18-19 מעלות צלזיוס)</li>
        <li>נוהל הרגעה לפני השינה (מדיטציה, נשימות עמוקות)</li>
      </ol>
      
      <h2 className="text-xl font-bold my-4">מסקנות והשלכות</h2>
      <p>המחקר מדגיש את החשיבות הקריטית של שינה איכותית בשיפור יכולת קבלת החלטות בזמן אמת. מומלץ לשלב ניטור שינה כחלק ממערך האימון של ספורטאים תחרותיים ולהתאים אישית את פרוטוקול השינה לכל ספורטאי.</p>
      
      <p className="mt-4">יישום נכון של אסטרטגיות שינה נמצא כמשפר את ביצועי הספורטאים בטווח הקצר, ועשוי להפחית פציעות ולהאריך קריירות ספורטיביות בטווח הארוך.</p>
    </>
  )
}];

const renderStudyIcon = (iconType: string) => {
  switch (iconType) {
    case "brain":
      return <Brain className="h-16 w-16 text-blue-400" />;
    case "chart":
      return <LineChart className="h-16 w-16 text-purple-400" />;
    case "microscope":
      return <Microscope className="h-16 w-16 text-green-400" />;
    default:
      return <FileText className="h-16 w-16 text-gray-400" />;
  }
};

export const MentalLibrary: React.FC = () => {
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudy, setEditingStudy] = useState<Study | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [studies, setStudies] = useState<Study[]>(recentStudies);

  const handleOpenModal = (study: Study) => {
    setSelectedStudy(study);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleEditClick = (study: Study, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the read modal
    setEditingStudy(study);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingStudy(null);
  };

  const handleSaveStudy = (updatedStudy: Study) => {
    const updatedStudies = studies.map(study => 
      study.id === updatedStudy.id ? updatedStudy : study
    );
    setStudies(updatedStudies);
    toast.success("המחקר עודכן בהצלחה");
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-4 mb-8">
        <h1 className="text-3xl font-bold text-center">מחקרים אחרונים בארכיון המנטאלי</h1>
        <p className="text-gray-600 text-center max-w-2xl mx-auto">כאן תמצאו את כל המחקרים האחרונים בעולם המנטאלי שהתפרסמו</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studies.map(study => (
          <Card 
            key={study.id} 
            className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200 relative"
            onClick={() => handleOpenModal(study)}
          >
            <div className="absolute top-4 right-4 z-10">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-gray-100"
                onClick={(e) => handleEditClick(study, e)}
              >
                <Pencil className="h-4 w-4 text-gray-500" />
                <span className="sr-only">ערוך מחקר</span>
              </Button>
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold">{study.title}</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {study.institution}
                  </CardDescription>
                </div>
                <Badge className="bg-primary/10 text-primary font-normal">
                  {study.field}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-col space-y-4">
                <div className="w-full h-40 bg-gray-50 rounded-md overflow-hidden flex items-center justify-center mb-2">
                  {renderStudyIcon(study.iconType)}
                </div>
                <p className="text-gray-700 text-sm">{study.abstract}</p>
                {study.hasRating && (
                  <div className="flex items-center">
                    {Array.from({ length: study.rating || 0 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                    {Array.from({ length: 5 - (study.rating || 0) }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-gray-300" />
                    ))}
                    <span className="text-sm text-gray-500 mr-1">{study.rating}/5</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-2 border-t">
              <Button className="w-full gap-2">
                קראו עוד
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <ResearchModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        study={selectedStudy}
      />

      <EditResearchModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        study={editingStudy}
        onSave={handleSaveStudy}
      />
    </div>
  );
};
