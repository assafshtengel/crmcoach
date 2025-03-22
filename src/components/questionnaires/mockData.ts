
import { Questionnaire, PlayerQuestionnaireResponse } from '@/types/questionnaire';

// Mock questionnaires data
export const mockQuestionnaires: Questionnaire[] = [
  {
    id: '1',
    title: 'הכנה מנטלית למשחק',
    description: 'שאלון לבדיקת מוכנות מנטלית של השחקן לפני משחק.',
    questions: [
      {
        id: 'q1',
        text: 'מה רמת הביטחון שלך לקראת המשחק הקרוב?',
        type: 'closed',
        required: true,
        options: [
          { id: 'o1', text: 'נמוכה מאוד', value: 1 },
          { id: 'o2', text: 'נמוכה', value: 2 },
          { id: 'o3', text: 'בינונית', value: 3 },
          { id: 'o4', text: 'גבוהה', value: 4 },
          { id: 'o5', text: 'גבוהה מאוד', value: 5 },
        ]
      },
      {
        id: 'q2',
        text: 'מה רמת החרדה שלך לקראת המשחק?',
        type: 'closed',
        required: true,
        options: [
          { id: 'o1', text: 'נמוכה מאוד', value: 1 },
          { id: 'o2', text: 'נמוכה', value: 2 },
          { id: 'o3', text: 'בינונית', value: 3 },
          { id: 'o4', text: 'גבוהה', value: 4 },
          { id: 'o5', text: 'גבוהה מאוד', value: 5 },
        ]
      },
      {
        id: 'q3',
        text: 'מה המטרות האישיות שלך למשחק הקרוב?',
        type: 'open',
        required: true,
      },
      {
        id: 'q4',
        text: 'איך אתה מתכונן מנטלית למשחק?',
        type: 'open',
        required: false,
      },
    ],
    createdAt: '2023-11-01T10:00:00Z',
    updatedAt: '2023-11-01T10:00:00Z',
    isActive: true,
  },
  {
    id: '2',
    title: 'משוב לאחר משחק',
    description: 'שאלון לניתוח הביצועים והתחושות של השחקן לאחר משחק.',
    questions: [
      {
        id: 'q1',
        text: 'איך אתה מעריך את הביצועים שלך במשחק?',
        type: 'closed',
        required: true,
        options: [
          { id: 'o1', text: 'גרוע', value: 1 },
          { id: 'o2', text: 'חלש', value: 2 },
          { id: 'o3', text: 'בינוני', value: 3 },
          { id: 'o4', text: 'טוב', value: 4 },
          { id: 'o5', text: 'מצוין', value: 5 },
        ]
      },
      {
        id: 'q2',
        text: 'מה היו הנקודות החזקות שלך במשחק?',
        type: 'open',
        required: true,
      },
      {
        id: 'q3',
        text: 'מה היו הנקודות לשיפור במשחק?',
        type: 'open',
        required: true,
      },
      {
        id: 'q4',
        text: 'איך הרגשת מנטלית במהלך המשחק?',
        type: 'open',
        required: true,
      },
    ],
    createdAt: '2023-11-05T10:00:00Z',
    updatedAt: '2023-11-05T10:00:00Z',
    isActive: true,
  },
  {
    id: '3',
    title: 'מטרות עונתיות',
    description: 'שאלון להגדרת מטרות אישיות וקבוצתיות לעונה.',
    questions: [
      {
        id: 'q1',
        text: 'מהן המטרות האישיות שלך לעונה הקרובה?',
        type: 'open',
        required: true,
      },
      {
        id: 'q2',
        text: 'מהן המטרות הקבוצתיות שלך לעונה הקרובה?',
        type: 'open',
        required: true,
      },
      {
        id: 'q3',
        text: 'אילו יכולות אתה רוצה לשפר העונה?',
        type: 'open',
        required: true,
      },
      {
        id: 'q4',
        text: 'מה רמת המחויבות שלך להשגת המטרות?',
        type: 'closed',
        required: true,
        options: [
          { id: 'o1', text: 'נמוכה', value: 1 },
          { id: 'o2', text: 'בינונית', value: 3 },
          { id: 'o3', text: 'גבוהה', value: 5 },
        ]
      },
    ],
    createdAt: '2023-11-10T10:00:00Z',
    updatedAt: '2023-11-10T10:00:00Z',
    isActive: false,
  },
];

// Mock responses data
export const mockResponses: PlayerQuestionnaireResponse[] = [
  {
    id: 'resp1',
    playerId: 'player1',
    playerName: 'יוסי כהן',
    questionnaireId: '1',
    responses: [
      {
        questionId: 'q1',
        answer: 4,
        answeredAt: '2023-11-12T09:30:00Z',
      },
      {
        questionId: 'q2',
        answer: 2,
        answeredAt: '2023-11-12T09:31:00Z',
      },
      {
        questionId: 'q3',
        answer: 'להבקיע שער ולתת אסיסט. לשמור על ריכוז לאורך כל המשחק.',
        answeredAt: '2023-11-12T09:32:00Z',
      },
      {
        questionId: 'q4',
        answer: 'אני עושה מדיטציה לפני המשחק וחוזר על שגרת החימום המנטלי שלי.',
        answeredAt: '2023-11-12T09:33:00Z',
      },
    ],
    submittedAt: '2023-11-12T09:33:00Z',
  },
  {
    id: 'resp2',
    playerId: 'player2',
    playerName: 'משה לוי',
    questionnaireId: '2',
    responses: [
      {
        questionId: 'q1',
        answer: 3,
        answeredAt: '2023-11-15T18:20:00Z',
      },
      {
        questionId: 'q2',
        answer: 'הייתי טוב בכדורים גבוהים והשתתפתי טוב במשחק ההתקפי.',
        answeredAt: '2023-11-15T18:21:00Z',
      },
      {
        questionId: 'q3',
        answer: 'אני צריך לשפר את הדיוק במסירות ארוכות ואת התנועה בלי כדור.',
        answeredAt: '2023-11-15T18:22:00Z',
      },
      {
        questionId: 'q4',
        answer: 'הרגשתי לחוץ בתחילת המשחק אבל התאוששתי אחרי 15 דקות.',
        answeredAt: '2023-11-15T18:23:00Z',
      },
    ],
    submittedAt: '2023-11-15T18:23:00Z',
  },
  {
    id: 'resp3',
    playerId: 'player3',
    playerName: 'דוד אברהם',
    questionnaireId: '1',
    responses: [
      {
        questionId: 'q1',
        answer: 5,
        answeredAt: '2023-11-18T08:15:00Z',
      },
      {
        questionId: 'q2',
        answer: 3,
        answeredAt: '2023-11-18T08:16:00Z',
      },
      {
        questionId: 'q3',
        answer: 'לשחק הגנה טובה ולתרום להתקפה באגף.',
        answeredAt: '2023-11-18T08:17:00Z',
      },
      {
        questionId: 'q4',
        answer: 'אני צופה בסרטוני וידאו של משחקים קודמים ומדמיין תרחישים חיוביים.',
        answeredAt: '2023-11-18T08:18:00Z',
      },
    ],
    submittedAt: '2023-11-18T08:18:00Z',
  },
  {
    id: 'resp4',
    playerId: 'player4',
    playerName: 'יעקב ישראלי',
    questionnaireId: '3',
    responses: [
      {
        questionId: 'q1',
        answer: 'להיות שחקן הרכב קבוע ולשפר את הסטטיסטיקות שלי ב-20% לפחות.',
        answeredAt: '2023-11-20T16:40:00Z',
      },
      {
        questionId: 'q2',
        answer: 'לזכות באליפות ולהגיע לפחות לחצי גמר בגביע.',
        answeredAt: '2023-11-20T16:41:00Z',
      },
      {
        questionId: 'q3',
        answer: 'יכולת בעיטה, כושר גופני וקריאת משחק.',
        answeredAt: '2023-11-20T16:42:00Z',
      },
      {
        questionId: 'q4',
        answer: 5,
        answeredAt: '2023-11-20T16:43:00Z',
      },
    ],
    submittedAt: '2023-11-20T16:43:00Z',
  },
  {
    id: 'resp5',
    playerId: 'player1',
    playerName: 'יוסי כהן',
    questionnaireId: '2',
    responses: [
      {
        questionId: 'q1',
        answer: 4,
        answeredAt: '2023-11-25T19:10:00Z',
      },
      {
        questionId: 'q2',
        answer: 'המהירות והדריבלים היו טובים. הצלחתי ליצור מספר הזדמנויות.',
        answeredAt: '2023-11-25T19:11:00Z',
      },
      {
        questionId: 'q3',
        answer: 'אני צריך לשפר את הסבלנות בשליש האחרון של המגרש.',
        answeredAt: '2023-11-25T19:12:00Z',
      },
      {
        questionId: 'q4',
        answer: 'הרגשתי בטוח ועם מוטיבציה גבוהה. שמרתי על מיקוד לאורך רוב המשחק.',
        answeredAt: '2023-11-25T19:13:00Z',
      },
    ],
    submittedAt: '2023-11-25T19:13:00Z',
  },
];
