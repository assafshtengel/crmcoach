
export interface Category {
  id: string;
  name: string;
  type: 'mental' | 'physical' | 'professional';
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
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
      { id: 'sc-1', text: 'מפגין ביטחון בכדור ולא חושש לקחת סיכונים' },
      { id: 'sc-2', text: 'מתמודד היטב עם כישלונות ולומד מטעויות' },
      { id: 'sc-3', text: 'מביע את עצמו בביטחון מול חברי הקבוצה' },
      { id: 'sc-4', text: 'מאמין ביכולות שלו גם מול יריבים חזקים' }
    ]
  },
  {
    id: 'concentration',
    name: 'ריכוז',
    type: 'mental',
    questions: [
      { id: 'co-1', text: 'שומר על ריכוז לאורך כל המשחק' },
      { id: 'co-2', text: 'מסוגל להתמקד במשימה גם תחת לחץ' },
      { id: 'co-3', text: 'מגיב במהירות למצבים משתנים במשחק' },
      { id: 'co-4', text: 'שומר על ערנות גם כשהכדור רחוק ממנו' }
    ]
  },
  {
    id: 'aggression',
    name: 'אגרסיביות',
    type: 'mental',
    questions: [
      { id: 'ag-1', text: 'נלחם על כל כדור בנחישות' },
      { id: 'ag-2', text: 'מפגין רוח לחימה חיובית' },
      { id: 'ag-3', text: 'לא מוותר גם במצבים קשים' },
      { id: 'ag-4', text: 'משתמש בכוח באופן מבוקר וחוקי' }
    ]
  },
  {
    id: 'fitness',
    name: 'כושר גופני',
    type: 'physical',
    questions: [
      { id: 'fi-1', text: 'מסוגל לשמור על קצב גבוה לאורך כל המשחק' },
      { id: 'fi-2', text: 'מתאושש במהירות לאחר מאמץ' },
      { id: 'fi-3', text: 'שומר על יציבות בריצה ובמגע' },
      { id: 'fi-4', text: 'מפגין סיבולת טובה באימונים ומשחקים' }
    ]
  },
  {
    id: 'speed',
    name: 'מהירות',
    type: 'physical',
    questions: [
      { id: 'sp-1', text: 'מפגין מהירות טובה בריצה עם ובלי כדור' },
      { id: 'sp-2', text: 'מבצע שינויי כיוון במהירות' },
      { id: 'sp-3', text: 'מגיב מהר למצבים משתנים' },
      { id: 'sp-4', text: 'שומר על מהירות גבוהה גם בסוף המשחק' }
    ]
  },
  {
    id: 'power',
    name: 'כוח מתפרץ',
    type: 'physical',
    questions: [
      { id: 'po-1', text: 'מפגין זינוק מהיר ופורץ בעוצמה' },
      { id: 'po-2', text: 'חזק בהתמודדות אחד על אחד' },
      { id: 'po-3', text: 'מנצח בדו-קרבות אוויריים' },
      { id: 'po-4', text: 'בועט בעוצמה ובדיוק' }
    ]
  },
  {
    id: 'first-touch',
    name: 'נגיעה ראשונה',
    type: 'professional',
    questions: [
      { id: 'ft-1', text: 'שולט היטב בכדור בקבלה ראשונה' },
      { id: 'ft-2', text: 'מוריד כדורים גבוהים בקלות' },
      { id: 'ft-3', text: 'מתמרן היטב במצבים צפופים' },
      { id: 'ft-4', text: 'מבצע מסירות מדויקות מנגיעה ראשונה' }
    ]
  },
  {
    id: 'game-intelligence',
    name: 'חוכמת משחק',
    type: 'professional',
    questions: [
      { id: 'gi-1', text: 'מבין מצבים טקטיים ומגיב בהתאם' },
      { id: 'gi-2', text: 'מזהה ומנצל חולשות של היריב' },
      { id: 'gi-3', text: 'מקבל החלטות נכונות תחת לחץ' },
      { id: 'gi-4', text: 'קורא נכון את המשחק ומתמקם היטב' }
    ]
  },
  {
    id: 'teamwork',
    name: 'עבודת צוות',
    type: 'professional',
    questions: [
      { id: 'tw-1', text: 'משתף פעולה היטב עם חברי הקבוצה' },
      { id: 'tw-2', text: 'מתקשר באופן ברור במהלך המשחק' },
      { id: 'tw-3', text: 'תומך בחברי הקבוצה ומעודד אותם' },
      { id: 'tw-4', text: 'מבין את תפקידו במערך הקבוצתי' }
    ]
  }
];
