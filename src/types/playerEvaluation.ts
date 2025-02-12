
export interface Category {
  id: string;
  name: string;
  type: 'mental' | 'physical' | 'professional';
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
}

export interface QuestionOption {
  text: string;
  score: number;
}

export interface EvaluationFormData {
  playerName: string;
  age: string;
  team: string;
  date: string;
  scores: Record<string, number>;
}

export const categories: Category[] = [
  {
    id: 'self-confidence',
    name: 'ביטחון עצמי',
    type: 'mental',
    questions: [
      {
        id: 'sc-1',
        text: 'איך אני מרגיש לפני משחק חשוב?',
        options: [
          { text: 'בטוח בעצמי', score: 10 },
          { text: 'קצת לחוץ', score: 7 },
          { text: 'חושש מטעויות', score: 4 },
          { text: 'מפחד להיכשל', score: 1 }
        ]
      },
      {
        id: 'sc-2',
        text: 'איך אני מגיב אחרי טעות?',
        options: [
          { text: 'ממשיך לשחק כרגיל', score: 10 },
          { text: 'קצת מתעצבן, אבל מתגבר', score: 7 },
          { text: 'מתוסכל ולוקח לי זמן לחזור', score: 4 },
          { text: 'מאבד ביטחון ומפסיק לנסות', score: 1 }
        ]
      },
      {
        id: 'sc-3',
        text: 'כשאני משחק נגד יריב חזק...',
        options: [
          { text: 'אני משחק בביטחון', score: 10 },
          { text: 'מנסה, אבל לפעמים חושש', score: 7 },
          { text: 'מגן בלבד ולא יוזם', score: 4 },
          { text: 'נלחץ ומוותר', score: 1 }
        ]
      },
      {
        id: 'sc-4',
        text: 'כשאני מקבל ביקורת מהמאמן...',
        options: [
          { text: 'מקבל ולומד', score: 10 },
          { text: 'לפעמים נפגע', score: 7 },
          { text: 'מתקשה להשתפר מזה', score: 4 },
          { text: 'מושפע מאוד לרעה', score: 1 }
        ]
      }
    ]
  },
  {
    id: 'concentration',
    name: 'ריכוז וקבלת החלטות תחת לחץ',
    type: 'mental',
    questions: [
      {
        id: 'co-1',
        text: 'איך אני מגיב כשהכדור אצלי תחת לחץ?',
        options: [
          { text: 'רגוע ומוצא פתרון חכם', score: 10 },
          { text: 'לפעמים נלחץ', score: 7 },
          { text: 'מאבד כדורים בקלות', score: 4 },
          { text: 'מוסר בלי לחשוב', score: 1 }
        ]
      },
      {
        id: 'co-2',
        text: 'במהלך המשחק, עד כמה אני שם לב לתנועת השחקנים סביבי?',
        options: [
          { text: 'תמיד סורק ומודע למה שקורה', score: 10 },
          { text: 'מסתכל לפעמים, אבל מפספס', score: 7 },
          { text: 'לא מספיק מסתכל', score: 4 },
          { text: 'לא רואה מה קורה סביבי', score: 1 }
        ]
      },
      {
        id: 'co-3',
        text: 'איך אני מגיב כשאני עושה טעות חמורה?',
        options: [
          { text: 'ממשיך לשחק חכם', score: 10 },
          { text: 'קצת חושב על זה, אבל מתגבר', score: 7 },
          { text: 'מתקשה לשכוח וזה משפיע עליי', score: 4 },
          { text: 'מאבד ריכוז', score: 1 }
        ]
      },
      {
        id: 'co-4',
        text: 'איך אני מתפקד בדקות האחרונות של משחק צמוד?',
        options: [
          { text: 'רגוע ויודע מה לעשות', score: 10 },
          { text: 'מתרגש אבל בשליטה', score: 7 },
          { text: 'מבצע טעויות פשוטות מלחץ', score: 4 },
          { text: 'נלחץ מאוד ולא מתפקד', score: 1 }
        ]
      }
    ]
  },
  {
    id: 'aggression',
    name: 'אגרסיביות',
    type: 'mental',
    questions: [
      {
        id: 'ag-1',
        text: 'נלחם על כל כדור בנחישות',
        options: [
          { text: 'תמיד', score: 10 },
          { text: 'לרוב', score: 7 },
          { text: 'לפעמים', score: 4 },
          { text: 'נמנע ממאבקים', score: 1 }
        ]
      },
      {
        id: 'ag-2',
        text: 'מפגין רוח לחימה חיובית',
        options: [
          { text: 'באופן קבוע', score: 10 },
          { text: 'ברוב המשחקים', score: 7 },
          { text: 'תלוי במצב הרוח', score: 4 },
          { text: 'לעיתים רחוקות', score: 1 }
        ]
      },
      {
        id: 'ag-3',
        text: 'לא מוותר גם במצבים קשים',
        options: [
          { text: 'נלחם עד הסוף', score: 10 },
          { text: 'משתדל להמשיך', score: 7 },
          { text: 'מתייאש לפעמים', score: 4 },
          { text: 'מוותר בקלות', score: 1 }
        ]
      },
      {
        id: 'ag-4',
        text: 'משתמש בכוח באופן מבוקר וחוקי',
        options: [
          { text: 'תמיד בשליטה', score: 10 },
          { text: 'בדרך כלל', score: 7 },
          { text: 'לפעמים מאבד שליטה', score: 4 },
          { text: 'מתקשה לשלוט', score: 1 }
        ]
      }
    ]
  },
  {
    id: 'fitness',
    name: 'כושר גופני',
    type: 'physical',
    questions: [
      {
        id: 'fi-1',
        text: 'מסוגל לשמור על קצב גבוה לאורך כל המשחק',
        options: [
          { text: 'לאורך כל המשחק', score: 10 },
          { text: 'רוב המשחק', score: 7 },
          { text: 'עד החצי השני', score: 4 },
          { text: 'מתעייף מהר', score: 1 }
        ]
      },
      {
        id: 'fi-2',
        text: 'מתאושש במהירות לאחר מאמץ',
        options: [
          { text: 'התאוששות מהירה', score: 10 },
          { text: 'התאוששות סבירה', score: 7 },
          { text: 'לוקח זמן להתאושש', score: 4 },
          { text: 'התאוששות איטית מאוד', score: 1 }
        ]
      },
      {
        id: 'fi-3',
        text: 'שומר על יציבות בריצה ובמגע',
        options: [
          { text: 'יציב מאוד', score: 10 },
          { text: 'יציב ברוב המקרים', score: 7 },
          { text: 'לא תמיד יציב', score: 4 },
          { text: 'חסר יציבות', score: 1 }
        ]
      },
      {
        id: 'fi-4',
        text: 'מפגין סיבולת טובה באימונים ומשחקים',
        options: [
          { text: 'סיבולת מעולה', score: 10 },
          { text: 'סיבולת טובה', score: 7 },
          { text: 'סיבולת בינונית', score: 4 },
          { text: 'סיבולת נמוכה', score: 1 }
        ]
      }
    ]
  },
  {
    id: 'speed',
    name: 'מהירות',
    type: 'physical',
    questions: [
      {
        id: 'sp-1',
        text: 'מפגין מהירות טובה בריצה עם ובלי כדור',
        options: [
          { text: 'מהיר מאוד', score: 10 },
          { text: 'מהיר', score: 7 },
          { text: 'מהירות ממוצעת', score: 4 },
          { text: 'איטי', score: 1 }
        ]
      },
      {
        id: 'sp-2',
        text: 'מבצע שינויי כיוון במהירות',
        options: [
          { text: 'זריז מאוד', score: 10 },
          { text: 'זריז', score: 7 },
          { text: 'זריזות בינונית', score: 4 },
          { text: 'לא זריז', score: 1 }
        ]
      },
      {
        id: 'sp-3',
        text: 'מגיב מהר למצבים משתנים',
        options: [
          { text: 'תגובה מהירה מאוד', score: 10 },
          { text: 'תגובה טובה', score: 7 },
          { text: 'תגובה בינונית', score: 4 },
          { text: 'תגובה איטית', score: 1 }
        ]
      },
      {
        id: 'sp-4',
        text: 'שומר על מהירות גבוהה גם בסוף המשחק',
        options: [
          { text: 'שומר על מהירות', score: 10 },
          { text: 'יורד קצת במהירות', score: 7 },
          { text: 'מאט משמעותית', score: 4 },
          { text: 'מאוד איטי בסוף', score: 1 }
        ]
      }
    ]
  },
  {
    id: 'power',
    name: 'כוח מתפרץ',
    type: 'physical',
    questions: [
      {
        id: 'po-1',
        text: 'מפגין זינוק מהיר ופורץ בעוצמה',
        options: [
          { text: 'פריצה מהירה וחזקה', score: 10 },
          { text: 'פריצה טובה', score: 7 },
          { text: 'פריצה בינונית', score: 4 },
          { text: 'פריצה חלשה', score: 1 }
        ]
      },
      {
        id: 'po-2',
        text: 'חזק בהתמודדות אחד על אחד',
        options: [
          { text: 'חזק מאוד', score: 10 },
          { text: 'חזק', score: 7 },
          { text: 'כוח בינוני', score: 4 },
          { text: 'חלש', score: 1 }
        ]
      },
      {
        id: 'po-3',
        text: 'מנצח בדו-קרבות אוויריים',
        options: [
          { text: 'כמעט תמיד מנצח', score: 10 },
          { text: 'לרוב מנצח', score: 7 },
          { text: 'לפעמים מנצח', score: 4 },
          { text: 'נדיר שמנצח', score: 1 }
        ]
      },
      {
        id: 'po-4',
        text: 'בועט בעוצמה ובדיוק',
        options: [
          { text: 'בעיטות חזקות ומדויקות', score: 10 },
          { text: 'בעיטות טובות', score: 7 },
          { text: 'בעיטות בינוניות', score: 4 },
          { text: 'בעיטות חלשות', score: 1 }
        ]
      }
    ]
  },
  {
    id: 'first-touch',
    name: 'נגיעה ראשונה',
    type: 'professional',
    questions: [
      {
        id: 'ft-1',
        text: 'שולט היטב בכדור בקבלה ראשונה',
        options: [
          { text: 'שליטה מצוינת', score: 10 },
          { text: 'שליטה טובה', score: 7 },
          { text: 'שליטה בינונית', score: 4 },
          { text: 'שליטה חלשה', score: 1 }
        ]
      },
      {
        id: 'ft-2',
        text: 'מוריד כדורים גבוהים בקלות',
        options: [
          { text: 'הורדה מושלמת', score: 10 },
          { text: 'הורדה טובה', score: 7 },
          { text: 'הורדה בינונית', score: 4 },
          { text: 'מתקשה בהורדה', score: 1 }
        ]
      },
      {
        id: 'ft-3',
        text: 'מתמרן היטב במצבים צפופים',
        options: [
          { text: 'תמרון מעולה', score: 10 },
          { text: 'תמרון טוב', score: 7 },
          { text: 'תמרון בינוני', score: 4 },
          { text: 'תמרון חלש', score: 1 }
        ]
      },
      {
        id: 'ft-4',
        text: 'מבצע מסירות מדויקות מנגיעה ראשונה',
        options: [
          { text: 'מסירות מדויקות תמיד', score: 10 },
          { text: 'מסירות טובות', score: 7 },
          { text: 'מסירות לא תמיד מדויקות', score: 4 },
          { text: 'מסירות לא מדויקות', score: 1 }
        ]
      }
    ]
  },
  {
    id: 'game-intelligence',
    name: 'חוכמת משחק',
    type: 'professional',
    questions: [
      {
        id: 'gi-1',
        text: 'מבין מצבים טקטיים ומגיב בהתאם',
        options: [
          { text: 'הבנה טקטית מעולה', score: 10 },
          { text: 'הבנה טקטית טובה', score: 7 },
          { text: 'הבנה טקטית בינונית', score: 4 },
          { text: 'הבנה טקטית חלשה', score: 1 }
        ]
      },
      {
        id: 'gi-2',
        text: 'מזהה ומנצל חולשות של היריב',
        options: [
          { text: 'מזהה ומנצל תמיד', score: 10 },
          { text: 'מזהה ומנצל לרוב', score: 7 },
          { text: 'מזהה לפעמים', score: 4 },
          { text: 'נדיר שמזהה', score: 1 }
        ]
      },
      {
        id: 'gi-3',
        text: 'מקבל החלטות נכונות תחת לחץ',
        options: [
          { text: 'החלטות מצוינות', score: 10 },
          { text: 'החלטות טובות', score: 7 },
          { text: 'החלטות בינוניות', score: 4 },
          { text: 'החלטות חלשות', score: 1 }
        ]
      },
      {
        id: 'gi-4',
        text: 'קורא נכון את המשחק ומתמקם היטב',
        options: [
          { text: 'קריאת משחק מעולה', score: 10 },
          { text: 'קריאת משחק טובה', score: 7 },
          { text: 'קריאת משחק בינונית', score: 4 },
          { text: 'קריאת משחק חלשה', score: 1 }
        ]
      }
    ]
  },
  {
    id: 'teamwork',
    name: 'עבודת צוות',
    type: 'professional',
    questions: [
      {
        id: 'tw-1',
        text: 'משתף פעולה היטב עם חברי הקבוצה',
        options: [
          { text: 'שיתוף פעולה מעולה', score: 10 },
          { text: 'שיתוף פעולה טוב', score: 7 },
          { text: 'שיתוף פעולה בינוני', score: 4 },
          { text: 'שיתוף פעולה חלש', score: 1 }
        ]
      },
      {
        id: 'tw-2',
        text: 'מתקשר באופן ברור במהלך המשחק',
        options: [
          { text: 'תקשורת מצוינת', score: 10 },
          { text: 'תקשורת טובה', score: 7 },
          { text: 'תקשורת בינונית', score: 4 },
          { text: 'תקשורת חלשה', score: 1 }
        ]
      },
      {
        id: 'tw-3',
        text: 'תומך בחברי הקבוצה ומעודד אותם',
        options: [
          { text: 'תמיכה מלאה תמיד', score: 10 },
          { text: 'תמיכה טובה', score: 7 },
          { text: 'תמיכה לפעמים', score: 4 },
          { text: 'נדיר שתומך', score: 1 }
        ]
      },
      {
        id: 'tw-4',
        text: 'מבין את תפקידו במערך הקבוצתי',
        options: [
          { text: 'הבנה מלאה של התפקיד', score: 10 },
          { text: 'הבנה טובה', score: 7 },
          { text: 'הבנה חלקית', score: 4 },
          { text: 'הבנה מוגבלת', score: 1 }
        ]
      }
    ]
  }
];
