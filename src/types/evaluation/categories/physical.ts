
import type { Category } from '../interfaces';

export const physicalCategories: Category[] = [
  {
    id: 'aggressiveness',
    name: 'אגרסיביות',
    type: 'physical',
    questions: [
      {
        id: 'aggr-1',
        text: 'איך אתה מגיב כאשר יש כדור 50-50 בינך לבין היריב?',
        options: [
          { text: 'אני מהסס ונותן ליריב להגיע ראשון', score: 1 },
          { text: 'אני מנסה אבל לפעמים מוותר בדרך', score: 4 },
          { text: 'אני הולך לכדור עם ביטחון אבל לא תמיד מנצח', score: 7 },
          { text: 'אני נכנס לכדור בנחישות ולוקח אותו לרוב', score: 10 }
        ]
      },
      {
        id: 'aggr-2',
        text: 'איך אתה מתמודד עם מאבקים פיזיים מול יריבים חזקים?',
        options: [
          { text: 'אני נמנע ממאבקים פיזיים', score: 1 },
          { text: 'אני משתדל להחזיק מעמד אבל מתקשה', score: 4 },
          { text: 'אני יודע איך להשתמש בגוף שלי, אבל לא תמיד מצליח', score: 7 },
          { text: 'אני חזק פיזית ומשתמש בגוף שלי בצורה חכמה', score: 10 }
        ]
      },
      {
        id: 'aggr-3',
        text: 'כשהכדור אצלך ויריב נצמד אליך, איך אתה מגיב?',
        options: [
          { text: 'אני מאבד את הכדור בקלות', score: 1 },
          { text: 'אני מנסה להגן אבל מתקשה', score: 4 },
          { text: 'אני שומר על הכדור היטב אבל לפעמים מאבד', score: 7 },
          { text: 'אני שומר על הכדור ומסתובב על היריב', score: 10 }
        ]
      },
      {
        id: 'aggr-4',
        text: 'האם אתה מפעיל לחץ על היריב גם כשהוא עם הכדור?',
        options: [
          { text: 'אני מחכה שהקבוצה שלי תלחץ', score: 1 },
          { text: 'אני לוחץ לפעמים אבל לא תמיד באגרסיביות', score: 4 },
          { text: 'אני לוחץ היטב אבל יכול להיות יותר נמרץ', score: 7 },
          { text: 'אני לוחץ חזק וגורם ליריב לאבד את הכדור', score: 10 }
        ]
      }
    ]
  },
  {
    id: 'energy',
    name: 'אנרגיות',
    type: 'physical',
    questions: [
      {
        id: 'energy-1',
        text: 'איך אתה מרגיש פיזית אחרי 70 דקות של משחק אינטנסיבי?',
        options: [
          { text: 'אני מותש לחלוטין ולא יכול להמשיך', score: 1 },
          { text: 'אני מרגיש עייפות קשה ומשפיעה על הביצועים שלי', score: 4 },
          { text: 'אני עדיין מרגיש טוב אך מאבד מעט חדות', score: 7 },
          { text: 'אני מלא אנרגיה ומרגיש שאני יכול להמשיך באותו קצב', score: 10 }
        ]
      },
      {
        id: 'energy-2',
        text: 'איך אתה מגיב כשהקבוצה שלך נקלעת למומנטום שלילי?',
        options: [
          { text: 'אני מרגיש חסר אנרגיה ונותן לאחרים להוביל', score: 1 },
          { text: 'אני ממשיך לשחק אך בלי השפעה גדולה', score: 4 },
          { text: 'אני מנסה להרים את עצמי ואת הקבוצה', score: 7 },
          { text: 'אני דוחף קדימה ומוביל את האנרגיות של המשחק', score: 10 }
        ]
      },
      {
        id: 'energy-3',
        text: 'מה אתה עושה כדי לשמור על האנרגיה שלך לאורך כל המשחק?',
        options: [
          { text: 'אני לא עושה כלום ומתעייף מהר', score: 1 },
          { text: 'אני מנסה לשמור כוחות אבל לא תמיד מצליח', score: 4 },
          { text: 'אני מתכונן נכון פיזית ומחלק אנרגיה', score: 7 },
          { text: 'אני עובד חכם, שומר על כוחות ויודע מתי להגביר קצב', score: 10 }
        ]
      },
      {
        id: 'energy-4',
        text: 'איך אתה מרגיש בדקות האחרונות של משחק חשוב?',
        options: [
          { text: 'אני מרגיש גמור פיזית ומנטלית', score: 1 },
          { text: 'אני מתאמץ אך מרגיש שהאנרגיות אוזלות', score: 4 },
          { text: 'אני מתעייף אך עדיין נותן את כל מה שיש לי', score: 7 },
          { text: 'אני שומר על דרייב חזק עד השריקה האחרונה', score: 10 }
        ]
      }
    ]
  }
];
