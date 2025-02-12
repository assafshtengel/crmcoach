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
    id: 'pressure',
    name: 'לחץ',
    type: 'mental',
    questions: [
      {
        id: 'pressure-1',
        text: 'כשאתה נמצא במצב של אחד על אחד מול השוער, איך אתה פועל?',
        options: [
          { text: 'אני חושב יותר מדי ומסתבך', score: 1 },
          { text: 'אני מתלבט ומנסה לבחור את הפעולה הנכונה', score: 4 },
          { text: 'אני פועל במהירות אבל לא תמיד בוחר נכון', score: 7 },
          { text: 'אני מבצע את הפעולה באופן אוטומטי ובביטחון', score: 10 }
        ]
      },
      {
        id: 'pressure-2',
        text: 'כשהכדור אצלך ויש עליך לחץ של שני שחקנים יריבים...',
        options: [
          { text: 'אני נלחץ ומאבד את הכדור', score: 1 },
          { text: 'אני מוסר אחורה כדי לא להסתכן', score: 4 },
          { text: 'אני מנסה לצאת קדימה, לפעמים מצליח ולפעמים לא', score: 7 },
          { text: 'אני רגוע ויודע איך להשתחרר מהלחץ', score: 10 }
        ]
      },
      {
        id: 'pressure-3',
        text: 'כשאנחנו בפיגור במחצית, איך אתה מגיב?',
        options: [
          { text: 'אני מאבד תקווה ומרגיש שהמשחק אבוד', score: 1 },
          { text: 'אני מרגיש לחץ גדול וקשה לי להתרכז', score: 4 },
          { text: 'אני שומר על קור רוח ומנסה לעזור לקבוצה', score: 7 },
          { text: 'אני ממוקד ומנסה להרים את כולם', score: 10 }
        ]
      },
      {
        id: 'pressure-4',
        text: 'איך אתה מתפקד כשאתה ניגש לבעוט פנדל חשוב?',
        options: [
          { text: 'אני נלחץ מאוד ומעדיף שאחרים יבעטו', score: 1 },
          { text: 'אני מרגיש לחץ גדול, אבל מנסה להתמודד', score: 4 },
          { text: 'אני מתרגש אבל יודע לתפקד', score: 7 },
          { text: 'אני בטוח בעצמי וניגש לבעוט בלי פחד', score: 10 }
        ]
      }
    ]
  },
  {
    id: 'motivation',
    name: 'מוטיבציה אחרי הפסד',
    type: 'mental',
    questions: [
      {
        id: 'motivation-1',
        text: 'לאחר משחק (ללא קשר לתוצאה), מה הדבר הראשון שאתה חושב עליו?',
        options: [
          { text: 'על התוצאה בלבד', score: 1 },
          { text: 'על השיפוט והטעויות שהיו', score: 4 },
          { text: 'על דברים מסוימים שהצלחתי בהם במשחק', score: 7 },
          { text: 'על הדברים שאני צריך לשפר למשחק הבא', score: 10 }
        ]
      },
      {
        id: 'motivation-2',
        text: 'איך אתה מגיב להפסד של הקבוצה שלך?',
        options: [
          { text: 'אני מאבד מוטיבציה ולא רוצה לחשוב על כדורגל', score: 1 },
          { text: 'אני מרגיש מבואס כמה ימים אחרי', score: 4 },
          { text: 'אני מנתח מה אפשר לשפר במשחק הבא', score: 7 },
          { text: 'אני מתמקד מיד באיך להשתפר ולא מתעכב על ההפסד', score: 10 }
        ]
      },
      {
        id: 'motivation-3',
        text: 'כשאתה מסתכל אחורה על משחק קשה, על מה אתה חושב?',
        options: [
          { text: 'בעיקר על הכישלונות שלי', score: 1 },
          { text: 'אני זוכר את התוצאה יותר מהביצוע', score: 4 },
          { text: 'אני מנתח מה עבד ומה לא', score: 7 },
          { text: 'אני מתמקד במה עליי לשפר להמשך', score: 10 }
        ]
      },
      {
        id: 'motivation-4',
        text: 'כשהמאמן נותן ביקורת קשה אחרי הפסד, איך אתה מגיב?',
        options: [
          { text: 'אני נפגע מזה מאוד ומרגיש חסר ביטחון', score: 1 },
          { text: 'אני מתקשה לקבל את זה, אבל מנסה להבין', score: 4 },
          { text: 'אני מקבל את הביקורת ומנסה להשתפר', score: 7 },
          { text: 'אני משתמש בזה כדי להשתפר ולהתקדם', score: 10 }
        ]
      }
    ]
  },
  {
    id: 'one-on-one-defense',
    name: 'הגנת 1 על 1',
    type: 'professional',
    questions: [
      {
        id: 'defense-1',
        text: 'איך אתה מגיב כאשר שחקן יריב מתקרב אליך באחד על אחד?',
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
    id: 'initiative',
    name: 'יוזמה',
    type: 'mental',
    questions: [
      {
        id: 'initiative-1',
        text: 'איך אתה מגיב כשהקבוצה שלך תקועה ולא מצליחה להתקדם?',
        options: [
          { text: 'אני מחכה שהמאמן ייתן הוראות', score: 1 },
          { text: 'אני מחפש מסירה בטוחה כדי להימנע מטעות', score: 4 },
          { text: 'אני מנסה ליצור מצבים ולדחוף קדימה', score: 7 },
          { text: 'אני לוקח אחריות ומוביל את המשחק', score: 10 }
        ]
      },
      {
        id: 'initiative-2',
        text: 'כשהכדור רחוק ממך, איך אתה פועל?',
        options: [
          { text: 'אני מחכה שהכדור יגיע אליי', score: 1 },
          { text: 'אני זז מעט, אבל לא תמיד בעמדות טובות', score: 4 },
          { text: 'אני מחפש שטחים פנויים ומציע את עצמי', score: 7 },
          { text: 'אני כל הזמן בתנועה ומנסה להפעיל לחץ או לקבל כדור', score: 10 }
        ]
      },
      {
        id: 'initiative-3',
        text: 'איך אתה מגיב כשהקבוצה שלך מאבדת את הכדור?',
        options: [
          { text: 'אני עוצר ומחכה שההגנה תטפל בזה', score: 1 },
          { text: 'אני מנסה להתארגן מחדש אבל לא תמיד מהר', score: 4 },
          { text: 'אני מיד נכנס ללחץ ומנסה להחזיר את הכדור', score: 7 },
          { text: 'אני מוביל את הלחץ ההגנתי ומשפיע על הקבוצה', score: 10 }
        ]
      },
      {
        id: 'initiative-4',
        text: 'כאשר נדרשת פעולה מהירה, איך אתה מגיב?',
        options: [
          { text: 'אני מהסס ולא בטוח איך לפעול', score: 1 },
          { text: 'אני מגיב, אבל לפעמים מאוחר מדי', score: 4 },
          { text: 'אני פועל מהר ומנסה לקבל את ההחלטה הנכונה', score: 7 },
          { text: 'אני חד ומקבל החלטות במהירות ובביטחון', score: 10 }
        ]
      }
    ]
  },
  {
    id: 'self-control',
    name: 'שליטה עצמית',
    type: 'mental',
    questions: [
      {
        id: 'control-1',
        text: 'כאשר השופט שורק נגדך בטעות, איך אתה מגיב?',
        options: [
          { text: 'אני מתעצבן ומגיב בזעם', score: 1 },
          { text: 'אני מראה תסכול אבל מנסה להירגע', score: 4 },
          { text: 'אני שולט ברגשות שלי וממשיך במשחק', score: 7 },
          { text: 'אני נשאר רגוע ומתמקד במה שצריך לעשות', score: 10 }
        ]
      },
      {
        id: 'control-2',
        text: 'איך אתה מגיב כששחקן יריב מקניט אותך?',
        options: [
          { text: 'אני מתפרץ עליו או מגיב באגרסיביות', score: 1 },
          { text: 'אני נלחץ אבל מנסה להתעלם', score: 4 },
          { text: 'אני מתעלם ממנו וממשיך לשחק', score: 7 },
          { text: 'אני שומר על קור רוח ולא נותן לזה להשפיע עליי', score: 10 }
        ]
      },
      {
        id: 'control-3',
        text: 'כאשר המשחק לא הולך לך כמו שצריך, איך אתה מגיב?',
        options: [
          { text: 'אני מתוסכל ומאבד ריכוז', score: 1 },
          { text: 'אני מרגיש לחץ אבל מנסה להמשיך', score: 4 },
          { text: 'אני מנסה להישאר חיובי ולעבוד קשה יותר', score: 7 },
          { text: 'אני מתמודד עם זה וממשיך לתת את המקסימום', score: 10 }
        ]
      },
      {
        id: 'control-4',
        text: 'כשאתה מבצע טעות קריטית, איך אתה מגיב?',
        options: [
          { text: 'אני לא מצליח להשתחרר מהטעות ומאבד ביטחון', score: 1 },
          { text: 'אני ממשיך לשחק, אבל חושב על זה יותר מדי', score: 4 },
          { text: 'אני מתרכז בחזרה למשחק ומנסה לתקן', score: 7 },
          { text: 'אני מיד שוכח מהטעות ומתמקד בהמשך המשחק', score: 10 }
        ]
      }
    ]
  },
  {
    id: 'clear-goals',
    name: 'מטרות בהירות',
    type: 'mental',
    questions: [
      {
        id: 'goals-1',
        text: 'האם יש לך מטרות אישיות ברורות לשיפור במשחק?',
        options: [
          { text: 'אין לי מטרות ואני פשוט משחק', score: 1 },
          { text: 'לפעמים אני חושב על מטרות אבל לא עוקב אחריהן', score: 4 },
          { text: 'יש לי מטרות כלליות, ואני משתדל לעבוד עליהן', score: 7 },
          { text: 'יש לי מטרות ברורות ומתוכננות עם דרך להשגתן', score: 10 }
        ]
      },
      {
        id: 'goals-2',
        text: 'איך אתה ניגש למשחק מבחינת מטרות אישיות?',
        options: [
          { text: 'אני פשוט עולה לשחק בלי לחשוב על מטרות', score: 1 },
          { text: 'אני רוצה לשחק טוב אבל לא מגדיר לעצמי מטרות', score: 4 },
          { text: 'אני מגדיר לעצמי דברים כלליים לשפר במשחק', score: 7 },
          { text: 'אני קובע לעצמי מטרות ברורות לכל משחק', score: 10 }
        ]
      },
      {
        id: 'goals-3',
        text: 'כשאתה מתאמן, איך אתה מתייחס למטרות שלך?',
        options: [
          { text: 'אני לא ממש חושב על המטרות בזמן אימון', score: 1 },
          { text: 'אני מנסה להשתפר אבל בלי תוכנית ברורה', score: 4 },
          { text: 'אני עובד על מטרות מסוימות ומודע להן', score: 7 },
          { text: 'אני מתאמן עם מטרה ספציפית בכל תרגול', score: 10 }
        ]
      },
      {
        id: 'goals-4',
        text: 'איך אתה מגיב כאשר לא הצלחת לעמוד במטרה שהצבת לעצמך?',
        options: [
          { text: 'אני מאבד מוטיבציה ומפסיק לנסות', score: 1 },
          { text: 'אני מרגיש מתוסכל אבל ממשיך לנסות', score: 4 },
          { text: 'אני מנתח למה זה קרה ומחפש דרכים לשיפור', score: 7 },
          { text: 'אני משפר את הדרך שלי ומגדיר מטרה מחודשת', score: 10 }
        ]
      }
    ]
  },
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
  },
  {
    id: 'self-confidence',
    name: 'ביטחון עצמי',
    type: 'mental',
    questions: [
      {
        id: 'confidence-1',
        text: 'איך אתה מגיב אחרי שאתה עושה טעות במשחק?',
        options: [
          { text: 'אני מאבד ביטחון ומתקשה להמשיך', score: 1 },
          { text: 'אני מרגיש חוסר ביטחון אבל מנסה להמשיך', score: 4 },
          { text: 'אני מנער את זה מעליי אבל זה עדיין משפיע עליי', score: 7 },
          { text: 'אני מתעלם מהטעות וממשיך קדימה בביטחון', score: 10 }
        ]
      },
      {
        id: 'confidence-2',
        text: 'האם אתה לוקח אחריות במשחקים חשובים?',
        options: [
          { text: 'אני מעדיף לתת לאחרים לקחת את ההובלה', score: 1 },
          { text: 'אני לוקח אחריות לפעמים, אבל לא תמיד', score: 4 },
          { text: 'אני משתדל להיות מוביל, אבל לפעמים מהסס', score: 7 },
          { text: 'אני לוקח אחריות ומנהיג את הקבוצה', score: 10 }
        ]
      },
      {
        id: 'confidence-3',
        text: 'איך אתה מרגיש כשאתה מקבל את הכדור ברגע קריטי?',
        options: [
          { text: 'אני נלחץ ולא בטוח איך לפעול', score: 1 },
          { text: 'אני מרגיש לחץ אבל מנסה להתמודד', score: 4 },
          { text: 'אני מתרגש אבל מתפקד היטב', score: 7 },
          { text: 'אני בטוח בעצמי ומבצע את הפעולה הנכונה', score: 10 }
        ]
      },
      {
        id: 'confidence-4',
        text: 'האם אתה מאמין ביכולות שלך כשאתה משחק מול קבוצה חזקה?',
        options: [
          { text: 'אני חושש מאוד מהיריבים', score: 1 },
          { text: 'אני מרגיש חוסר ביטחון אבל מנסה להתמודד', score: 4 },
          { text: 'אני מאמין בעצמי אבל יש לי ספקות', score: 7 },
          { text: 'אני בטוח בעצמי ומשחק ללא פחד', score: 10 }
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
