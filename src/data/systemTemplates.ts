
import { QuestionnaireTemplate } from '@/types/questionnaire';
import { v4 as uuidv4 } from 'uuid';

// Helper function to create a UUID for each question
const createQuestionId = () => uuidv4();

export const systemTemplates: QuestionnaireTemplate[] = [
  {
    id: uuidv4(),
    coach_id: null,
    title: "שאלון 1: פתיחת יום",
    type: "daily",
    is_system_template: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions: [
      {
        id: createQuestionId(),
        type: 'open',
        question_text: "מהם שלושת הדברים החשובים ביותר שאתה רוצה להשיג באימון היום?"
      },
      {
        id: createQuestionId(),
        type: 'open',
        question_text: "מה יכול לעזור לך להשיג את מטרותיך היום?"
      },
      {
        id: createQuestionId(),
        type: 'open',
        question_text: "מה יכול להפריע לך במהלך האימון וכיצד תתגבר על כך?"
      },
      {
        id: createQuestionId(),
        type: 'closed',
        question_text: "רמת אנרגיה פיזית"
      },
      {
        id: createQuestionId(),
        type: 'closed',
        question_text: "רמת מוכנות מנטלית"
      },
      {
        id: createQuestionId(),
        type: 'closed',
        question_text: "מידת המיקוד במטרות היום"
      }
    ]
  },
  {
    id: uuidv4(),
    coach_id: null,
    title: "שאלון 2: סיכום יום",
    type: "daily",
    is_system_template: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions: [
      {
        id: createQuestionId(),
        type: 'open',
        question_text: "מהם ההישגים העיקריים שלך היום?"
      },
      {
        id: createQuestionId(),
        type: 'open',
        question_text: "האם היה משהו ספציפי שגילית או למדת על עצמך היום?"
      },
      {
        id: createQuestionId(),
        type: 'open',
        question_text: "אילו דברים תרצה לשפר באימון מחר?"
      },
      {
        id: createQuestionId(),
        type: 'closed',
        question_text: "שביעות רצון מהמאמץ"
      },
      {
        id: createQuestionId(),
        type: 'closed',
        question_text: "שביעות רצון מהגישה"
      },
      {
        id: createQuestionId(),
        type: 'closed',
        question_text: "תחושת התקדמות לעבר המטרות"
      }
    ]
  },
  {
    id: uuidv4(),
    coach_id: null,
    title: "שאלון 3: אחרי משחק",
    type: "game",
    is_system_template: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions: [
      {
        id: createQuestionId(),
        type: 'open',
        question_text: "מהן הפעולות הטובות ביותר שביצעת במשחק?"
      },
      {
        id: createQuestionId(),
        type: 'open',
        question_text: "אילו פעולות תרצה לבצע טוב יותר בפעם הבאה?"
      },
      {
        id: createQuestionId(),
        type: 'open',
        question_text: "מה למדת מהמשחק שתיקח איתך הלאה?"
      },
      {
        id: createQuestionId(),
        type: 'closed',
        question_text: "שביעות רצון מהביצוע הכללי"
      },
      {
        id: createQuestionId(),
        type: 'closed',
        question_text: "מוכנות מנטלית לפני ובמהלך המשחק"
      },
      {
        id: createQuestionId(),
        type: 'closed',
        question_text: "רמת הביטחון במהלך המשחק"
      }
    ]
  },
  {
    id: uuidv4(),
    coach_id: null,
    title: "שאלון 4: מוכנות מנטלית לפני משחק",
    type: "game",
    is_system_template: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions: [
      {
        id: createQuestionId(),
        type: 'open',
        question_text: "מהן המחשבות העיקריות שלך לפני המשחק?"
      },
      {
        id: createQuestionId(),
        type: 'open',
        question_text: "אילו תרחישים חיוביים דמיינת כהכנה?"
      },
      {
        id: createQuestionId(),
        type: 'open',
        question_text: "מה אתה עושה כדי להרגיע את עצמך?"
      },
      {
        id: createQuestionId(),
        type: 'closed',
        question_text: "מוכנות פיזית"
      },
      {
        id: createQuestionId(),
        type: 'closed',
        question_text: "מוכנות מנטלית"
      },
      {
        id: createQuestionId(),
        type: 'closed',
        question_text: "רמת הלחץ"
      }
    ]
  }
];
