
import type { Category } from '../interfaces';

export const professionalCategories: Category[] = [
  {
    id: 'one-on-one-defense',
    name: 'הגנת 1 על 1',
    type: 'professional',
    questions: [
      {
        id: 'defense-1',
        text: 'כשהשחקן היריב מתקדם עם הכדור לכיוון שלך לעשות מולך 1*1 , איך אתה מגיב מבחינה הגנתית?',
        options: [
          { text: 'אני מתבלבל ומאפשר לו לעבור אותי', score: 1 },
          { text: 'אני מנסה לעמוד נכון, אך לעיתים קרובות מפספס', score: 4 },
          { text: 'אני מצליח להאט אותו ולכוון אותו לאזור פחות מסוכן', score: 7 },
          { text: 'אני חוסם אותו בצורה חכמה ולוקח לו את הכדור', score: 10 }
        ]
      },
      {
        id: 'defense-2',
        text: 'כשהשחקן היריב עם הכדור בדרך לרחבה שלך, איך אתה פועל?',
        options: [
          { text: 'אני נסוג ולא מנסה לעצור אותו', score: 1 },
          { text: 'אני מחכה שהוא יתקרב אליי ואז מנסה להגיב', score: 4 },
          { text: 'אני ניגש אליו ומנסה לגרום לו לטעות', score: 7 },
          { text: 'אני לוחץ אותו מהר ומונע ממנו להתקדם', score: 10 }
        ]
      },
      {
        id: 'defense-3',
        text: 'איך אתה מגיב כאשר אתה מפסיד מאבק על הכדור?',
        options: [
          { text: 'אני מאבד תקווה ומפסיק לרוץ', score: 1 },
          { text: 'אני מנסה לרדוף אחריו אבל מתקשה לחזור למשחק', score: 4 },
          { text: 'אני לא מוותר, רץ חזרה ומנסה לתקן את הטעות', score: 7 },
          { text: 'אני מיד משנה כיוון ומפעיל לחץ כדי לזכות בכדור שוב', score: 10 }
        ]
      },
      {
        id: 'defense-4',
        text: 'מה אתה עושה כאשר היריב שלך מנסה לעקוף אותך במהירות?',
        options: [
          { text: 'אני מאבד את המיקום שלי ומאפשר לו לעבור', score: 1 },
          { text: 'אני מנסה להיצמד אליו אבל לא תמיד מצליח', score: 4 },
          { text: 'אני יודע למקם את הגוף נכון ולכוון אותו החוצה', score: 7 },
          { text: 'אני משתמש בגוף שלי כדי לנטרל אותו ולזכות בכדור', score: 10 }
        ]
      }
    ]
  },
  {
    id: 'scoring',
    name: 'איום לשער',
    type: 'professional',
    questions: [
      {
        id: 'scoring-1',
        text: 'כשאתה מקבל הזדמנות לבעוט לשער מחוץ לרחבה, מה אתה עושה?',
        options: [
          { text: 'אני מהסס ומאבד את הכדור', score: 1 },
          { text: 'אני מחפש שחקן פנוי ומוסר במקום לבעוט', score: 4 },
          { text: 'אני בועט אך לא תמיד בטיימינג הנכון', score: 7 },
          { text: 'אני בועט בביטחון ומכוון למסגרת', score: 10 }
        ]
      },
      {
        id: 'scoring-2',
        text: 'איך אתה מגיב כשאתה לבד מול השוער?',
        options: [
          { text: 'אני נלחץ ומחטיא', score: 1 },
          { text: 'אני מתלבט ולפעמים מתמהמה', score: 4 },
          { text: 'אני בועט מהר אבל לא תמיד בוחר נכון', score: 7 },
          { text: 'אני בועט בקור רוח ומסיים כמו שצריך', score: 10 }
        ]
      },
      {
        id: 'scoring-3',
        text: 'כשאתה בתוך הרחבה ויש לך מצב הבקעה, איך אתה פועל?',
        options: [
          { text: 'אני לא מרגיש נוח במצבים כאלו ומוסר אחורה', score: 1 },
          { text: 'אני בועט חזק אבל בלי דיוק', score: 4 },
          { text: 'אני מנסה לבעוט אך לא תמיד מוצא את השער', score: 7 },
          { text: 'אני חד, בועט בנגיעה ושם לב לזווית השער', score: 10 }
        ]
      },
      {
        id: 'scoring-4',
        text: 'כמה פעמים במהלך משחק אתה מחפש באופן יזום לבעוט לשער?',
        options: [
          { text: 'אני כמעט ולא מחפש בעיטות', score: 1 },
          { text: 'אני בועט רק כשאין לי ברירה', score: 4 },
          { text: 'אני מחפש הזדמנויות אך לא תמיד מוצא', score: 7 },
          { text: 'אני כל הזמן בתנועה ומחפש מצבים לבעיטה', score: 10 }
        ]
      }
    ]
  },
  {
    id: 'decision-making',
    name: 'קבלת החלטות',
    type: 'professional',
    questions: [
      {
        id: 'decision-1',
        text: 'כשאתה עם הכדור ויש לך כמה אפשרויות, איך אתה מחליט?',
        options: [
          { text: 'אני מתלבט הרבה ואז מאבד את הכדור', score: 1 },
          { text: 'אני מנסה לקבל החלטה אבל לא תמיד בזמן', score: 4 },
          { text: 'אני מגיב מהר אבל לפעמים בוחר לא נכון', score: 7 },
          { text: 'אני חושב מהר ובוחר את הפעולה הנכונה', score: 10 }
        ]
      },
      {
        id: 'decision-2',
        text: 'איך אתה מתמודד עם מצבי לחץ במשחק?',
        options: [
          { text: 'אני נלחץ ועושה טעויות', score: 1 },
          { text: 'אני מנסה לחשוב בהיגיון אבל מתקשה', score: 4 },
          { text: 'אני מצליח להתמודד אבל לפעמים טועה', score: 7 },
          { text: 'אני נשאר רגוע ופועל בחוכמה', score: 10 }
        ]
      },
      {
        id: 'decision-3',
        text: 'איך אתה מחליט אם למסור, לבעוט או לכדרר?',
        options: [
          { text: 'אני לרוב מחכה יותר מדי ומאבד את הכדור', score: 1 },
          { text: 'אני מנסה משהו אבל לעיתים מתחרט', score: 4 },
          { text: 'אני בוחר מהר אבל לא תמיד את הפעולה הכי טובה', score: 7 },
          { text: 'אני רואה את האפשרויות ובוחר את הפעולה הנכונה', score: 10 }
        ]
      },
      {
        id: 'decision-4',
        text: 'האם אתה קורא נכון את המשחק ומבין מה קורה מסביבך?',
        options: [
          { text: 'אני מתקשה להבין מה קורה במשחק', score: 1 },
          { text: 'אני שם לב למה שקורה אבל לא תמיד מגיב בזמן', score: 4 },
          { text: 'אני מבין את המצב אבל לפעמים מחליט לא נכון', score: 7 },
          { text: 'אני קורא את המשחק היטב ופועל בהתאם', score: 10 }
        ]
      }
    ]
  }
];
