
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

export interface AssignedQuestionnaire {
  id: string;
  coach_id: string;
  player_id: string;
  questionnaire_id: string;
  template_id: string;
  status: 'pending' | 'completed';
  assigned_at: string;
  coach?: {
    full_name: string;
  };
  questionnaires?: {
    title: string;
    type: string;
    questions: Question[];
  };
}

export interface PlayerData {
  id: string;
  full_name: string;
  email: string;
  sport_field?: string;
  club?: string;
  year_group?: string;
  profile_image?: string;
  coach_id?: string;
}
