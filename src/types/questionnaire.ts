
export interface Question {
  id: string;
  type: 'open' | 'closed';
  question_text: string;
  answer?: string;
  rating?: number;
}

export interface QuestionnaireTemplate {
  id: string;
  coach_id: string | null;
  title: string;
  type: string;
  questions: Question[];
  is_system_template: boolean;
  parent_template_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Questionnaire {
  id: string;
  coach_id: string;
  player_id?: string;
  template_id?: string;
  title: string;
  type: string;
  questions: Question[];
  responses?: {
    [key: string]: {
      answer: string;
      rating?: number;
    }
  };
  is_completed: boolean;
  created_at: string;
  completed_at?: string;
  player_name?: string;
}
