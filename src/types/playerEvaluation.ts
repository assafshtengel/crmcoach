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
  scores: Record<string, number>; // questionId -> score
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
      { id: 'ag-1', text: 'נלחם על כל כדור בנחישות', options: [] },
      { id: 'ag-2', text: 'מפגין רוח לחימה חיובית', options: [] },
      { id: 'ag-3', text: 'לא מוותר גם במצבים קשים', options: [] },
      { id: 'ag-4', text: 'משתמש בכוח באופן מבוקר וחוקי', options: [] }
    ]
  },
  {
    id: 'fitness',
    name: 'כושר גופני',
    type: 'physical',
    questions: [
      { id: 'fi-1', text: 'מסוגל לשמור על קצב גבוה לאורך כל המשחק', options: [] },
      { id: 'fi-2', text: 'מתאושש במהירות לאחר מאמץ', options: [] },
      { id: 'fi-3', text: 'שומר על יציבות בריצה ובמגע', options: [] },
      { id: 'fi-4', text: 'מפגין סיבולת טובה באימונים ומשחקים', options: [] }
    ]
  },
  {
    id: 'speed',
    name: 'מהירות',
    type: 'physical',
    questions: [
      { id: 'sp-1', text: 'מפגין מהירות טובה בריצה עם ובלי כדור', options: [] },
      { id: 'sp-2', text: 'מבצע שינויי כיוון במהירות', options: [] },
      { id: 'sp-3', text: 'מגיב מהר למצבים משתנים', options: [] },
      { id: 'sp-4', text: 'שומר על מהירות גבוהה גם בסוף המשחק', options: [] }
    ]
  },
  {
    id: 'power',
    name: 'כוח מתפרץ',
    type: 'physical',
    questions: [
      { id: 'po-1', text: 'מפגין זינוק מהיר ופורץ בעוצמה', options: [] },
      { id: 'po-2', text: 'חזק בהתמודדות אחד על אחד', options: [] },
      { id: 'po-3', text: 'מנצח בדו-קרבות אוויריים', options: [] },
      { id: 'po-4', text: 'בועט בעוצמה ובדיוק', options: [] }
    ]
  },
  {
    id: 'first-touch',
    name: 'נגיעה ראשונה',
    type: 'professional',
    questions: [
      { id: 'ft-1', text: 'שולט היטב בכדור בקבלה ראשונה', options: [] },
      { id: 'ft-2', text: 'מוריד כדורים גבוהים בקלות', options: [] },
      { id: 'ft-3', text: 'מתמרן היטב במצבים צפופים', options: [] },
      { id: 'ft-4', text: 'מבצע מסירות מדויקות מנגיעה ראשונה', options: [] }
    ]
  },
  {
    id: 'game-intelligence',
    name: 'חוכמת משחק',
    type: 'professional',
    questions: [
      { id: 'gi-1', text: 'מבין מצבים טקטיים ומגיב בהתאם', options: [] },
      { id: 'gi-2', text: 'מזהה ומנצל חולשות של היריב', options: [] },
      { id: 'gi-3', text: 'מקבל החלטות נכונות תחת לחץ', options: [] },
      { id: 'gi-4', text: 'קורא נכון את המשחק ומתמקם היטב', options: [] }
    ]
  },
  {
    id: 'teamwork',
    name: 'עבודת צוות',
    type: 'professional',
    questions: [
      { id: 'tw-1', text: 'משתף פעולה היטב עם חברי הקבוצה', options: [] },
      { id: 'tw-2', text: 'מתקשר באופן ברור במהלך המשחק', options: [] },
      { id: 'tw-3', text: 'תומך בחברי הקבוצה ומעודד אותם', options: [] },
      { id: 'tw-4', text: 'מבין את תפקידו במערך הקבוצתי', options: [] }
    ]
  }
];
