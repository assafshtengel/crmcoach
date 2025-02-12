
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
        text: 'איך אתה מגיב כאשר אתה מפסי