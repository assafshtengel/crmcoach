
import { supabase } from '@/lib/supabase';
import { QuestionnaireTemplate, Questionnaire, Question } from '@/types/questionnaire';

export async function getSystemTemplates(): Promise<QuestionnaireTemplate[]> {
  const { data, error } = await supabase
    .from('questionnaire_templates')
    .select('*')
    .eq('is_system_template', true);

  if (error) {
    console.error('Error fetching system templates:', error);
    throw error;
  }

  return data || [];
}

export async function getCoachTemplates(): Promise<QuestionnaireTemplate[]> {
  const { data, error } = await supabase
    .from('questionnaire_templates')
    .select('*')
    .eq('is_system_template', false);

  if (error) {
    console.error('Error fetching coach templates:', error);
    throw error;
  }

  return data || [];
}

export async function getTemplate(id: string): Promise<QuestionnaireTemplate | null> {
  const { data, error } = await supabase
    .from('questionnaire_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching template:', error);
    return null;
  }

  return data;
}

export async function createTemplate(template: Omit<QuestionnaireTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<QuestionnaireTemplate | null> {
  const { data, error } = await supabase
    .from('questionnaire_templates')
    .insert([template])
    .select()
    .single();

  if (error) {
    console.error('Error creating template:', error);
    throw error;
  }

  return data;
}

export async function updateTemplate(id: string, updates: Partial<QuestionnaireTemplate>): Promise<QuestionnaireTemplate | null> {
  const { data, error } = await supabase
    .from('questionnaire_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating template:', error);
    throw error;
  }

  return data;
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('questionnaire_templates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
}

export async function getQuestionnaires(): Promise<Questionnaire[]> {
  const { data, error } = await supabase
    .from('questionnaires')
    .select('*, players(full_name)');

  if (error) {
    console.error('Error fetching questionnaires:', error);
    throw error;
  }

  return data.map(item => ({
    ...item,
    player_name: item.players?.full_name
  })) || [];
}

export async function createQuestionnaire(questionnaire: Omit<Questionnaire, 'id' | 'created_at'>): Promise<Questionnaire | null> {
  const { data, error } = await supabase
    .from('questionnaires')
    .insert([questionnaire])
    .select()
    .single();

  if (error) {
    console.error('Error creating questionnaire:', error);
    throw error;
  }

  return data;
}

export async function updateQuestionnaire(id: string, updates: Partial<Questionnaire>): Promise<Questionnaire | null> {
  const { data, error } = await supabase
    .from('questionnaires')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating questionnaire:', error);
    throw error;
  }

  return data;
}

export async function getSystemTemplateByType(type: string): Promise<QuestionnaireTemplate | null> {
  const { data, error } = await supabase
    .from('questionnaire_templates')
    .select('*')
    .eq('is_system_template', true)
    .eq('type', type)
    .single();

  if (error) {
    console.error('Error fetching system template by type:', error);
    return null;
  }

  return data;
}

// Function to insert default system templates if they don't exist
export async function insertDefaultSystemTemplates(userId: string): Promise<void> {
  const defaultTemplates = [
    {
      title: 'שאלון 1: פתיחת יום',
      type: 'day_opening',
      questions: [
        { id: '1-1', type: 'open', question_text: 'מהם שלושת הדברים החשובים ביותר שאתה רוצה להשיג באימון היום?' },
        { id: '1-2', type: 'open', question_text: 'מה יכול לעזור לך להשיג את מטרותיך היום?' },
        { id: '1-3', type: 'open', question_text: 'מה יכול להפריע לך במהלך האימון וכיצד תתגבר על כך?' },
        { id: '1-4', type: 'closed', question_text: 'רמת אנרגיה פיזית (1-10)' },
        { id: '1-5', type: 'closed', question_text: 'רמת מוכנות מנטלית (1-10)' },
        { id: '1-6', type: 'closed', question_text: 'מידת המיקוד במטרות היום (1-10)' }
      ],
      is_system_template: true,
      coach_id: userId
    },
    {
      title: 'שאלון 2: סיכום יום',
      type: 'day_summary',
      questions: [
        { id: '2-1', type: 'open', question_text: 'מהם ההישגים העיקריים שלך היום?' },
        { id: '2-2', type: 'open', question_text: 'האם היה משהו ספציפי שגילית או למדת על עצמך היום?' },
        { id: '2-3', type: 'open', question_text: 'אילו דברים תרצה לשפר באימון מחר?' },
        { id: '2-4', type: 'closed', question_text: 'שביעות רצון מהמאמץ (1-10)' },
        { id: '2-5', type: 'closed', question_text: 'שביעות רצון מהגישה (1-10)' },
        { id: '2-6', type: 'closed', question_text: 'תחושת התקדמות לעבר המטרות (1-10)' }
      ],
      is_system_template: true,
      coach_id: userId
    },
    {
      title: 'שאלון 3: אחרי משחק',
      type: 'post_game',
      questions: [
        { id: '3-1', type: 'open', question_text: 'מהן הפעולות הטובות ביותר שביצעת במשחק?' },
        { id: '3-2', type: 'open', question_text: 'אילו פעולות תרצה לבצע טוב יותר בפעם הבאה?' },
        { id: '3-3', type: 'open', question_text: 'מה למדת מהמשחק שתיקח איתך הלאה?' },
        { id: '3-4', type: 'closed', question_text: 'שביעות רצון מהביצוע הכללי (1-10)' },
        { id: '3-5', type: 'closed', question_text: 'מוכנות מנטלית לפני ובמהלך המשחק (1-10)' },
        { id: '3-6', type: 'closed', question_text: 'רמת הביטחון במהלך המשחק (1-10)' }
      ],
      is_system_template: true,
      coach_id: userId
    },
    {
      title: 'שאלון 4: מוכנות מנטלית לפני משחק',
      type: 'mental_prep',
      questions: [
        { id: '4-1', type: 'open', question_text: 'מהן המחשבות העיקריות שלך לפני המשחק?' },
        { id: '4-2', type: 'open', question_text: 'אילו תרחישים חיוביים דמיינת כהכנה?' },
        { id: '4-3', type: 'open', question_text: 'מה אתה עושה כדי להרגיע את עצמך?' },
        { id: '4-4', type: 'closed', question_text: 'מוכנות פיזית (1-10)' },
        { id: '4-5', type: 'closed', question_text: 'מוכנות מנטלית (1-10)' },
        { id: '4-6', type: 'closed', question_text: 'רמת הלחץ (1-10)' }
      ],
      is_system_template: true,
      coach_id: userId
    },
    {
      title: 'שאלון 5: ניטור מטרות אישיות (שבועי)',
      type: 'personal_goals',
      questions: [
        { id: '5-1', type: 'open', question_text: 'אילו מטרות אישיות השגת השבוע?' },
        { id: '5-2', type: 'open', question_text: 'אילו אתגרים חווית?' },
        { id: '5-3', type: 'open', question_text: 'אילו מטרות תרצה להציב לשבוע הבא?' },
        { id: '5-4', type: 'closed', question_text: 'שביעות רצון מההתקדמות (1-10)' },
        { id: '5-5', type: 'closed', question_text: 'רמת מוטיבציה (1-10)' },
        { id: '5-6', type: 'closed', question_text: 'נאמנות לתוכנית האישית (1-10)' }
      ],
      is_system_template: true,
      coach_id: userId
    },
    {
      title: 'שאלון 6: מוטיבציה ולחץ',
      type: 'motivation',
      questions: [
        { id: '6-1', type: 'open', question_text: 'מה נותן לך הכי הרבה מוטיבציה?' },
        { id: '6-2', type: 'open', question_text: 'כיצד אתה מתמודד עם לחץ ותסכול?' },
        { id: '6-3', type: 'open', question_text: 'מה יכול לשפר את ההתמודדות שלך עם לחץ?' },
        { id: '6-4', type: 'closed', question_text: 'רמת מוטיבציה נוכחית (1-10)' },
        { id: '6-5', type: 'closed', question_text: 'התמודדות עם לחץ (1-10)' },
        { id: '6-6', type: 'closed', question_text: 'תדירות שבה לחץ פוגע בביצועים (1-10)' }
      ],
      is_system_template: true,
      coach_id: userId
    },
    {
      title: 'שאלון 7: סיום עונה',
      type: 'season_end',
      questions: [
        { id: '7-1', type: 'open', question_text: 'מהם רגעי השיא שלך בעונה?' },
        { id: '7-2', type: 'open', question_text: 'אילו מטרות לא הושגו ולמה?' },
        { id: '7-3', type: 'open', question_text: 'מה תעשה אחרת בעונה הבאה?' },
        { id: '7-4', type: 'closed', question_text: 'שביעות רצון מהאימונים (1-10)' },
        { id: '7-5', type: 'closed', question_text: 'שביעות רצון מההתפתחות האישית (1-10)' },
        { id: '7-6', type: 'closed', question_text: 'מוטיבציה לקראת העונה הבאה (1-10)' }
      ],
      is_system_template: true,
      coach_id: userId
    },
    {
      title: 'שאלון 8: תקשורת קבוצתית ואינטראקציה',
      type: 'team_communication',
      questions: [
        { id: '8-1', type: 'open', question_text: 'כיצד היית מתאר את התקשורת עם חברי הקבוצה?' },
        { id: '8-2', type: 'open', question_text: 'מה עובד טוב ומה פחות עם צוות האימון?' },
        { id: '8-3', type: 'open', question_text: 'איך אפשר לשפר את התקשורת הכללית?' },
        { id: '8-4', type: 'closed', question_text: 'תקשורת פתוחה עם חברי הקבוצה (1-10)' },
        { id: '8-5', type: 'closed', question_text: 'הבנה של הדרישות מהצוות (1-10)' },
        { id: '8-6', type: 'closed', question_text: 'נוחות לפנות לצוות או לשחקנים (1-10)' }
      ],
      is_system_template: true,
      coach_id: userId
    }
  ];

  const { data: existingTemplates } = await supabase
    .from('questionnaire_templates')
    .select('type')
    .eq('is_system_template', true);

  const existingTypes = new Set(existingTemplates?.map(t => t.type) || []);
  
  const templatesToInsert = defaultTemplates.filter(t => !existingTypes.has(t.type));
  
  if (templatesToInsert.length > 0) {
    const { error } = await supabase
      .from('questionnaire_templates')
      .insert(templatesToInsert);

    if (error) {
      console.error('Error inserting system templates:', error);
      throw error;
    }
  }
}

export async function deleteQuestionnaire(id: string): Promise<void> {
  const { error } = await supabase
    .from('questionnaires')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting questionnaire:', error);
    throw error;
  }
}
