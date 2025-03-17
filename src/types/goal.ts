
export interface Goal {
  id?: string;
  title: string;
  description?: string;
  target_date?: string;
  success_criteria?: string;
  coach_id?: string;
  is_completed?: boolean;
  created_at?: string;
  progress?: number; // Adding progress property needed by components
}

export interface Milestone {
  id?: string;
  goal_id: string;
  title: string;
  description?: string;
  due_date?: string;
  is_completed?: boolean;
  created_at?: string;
}

export interface PlayerGoal {
  id: string;
  player_id: string;
  short_term_goals: Goal[];
  long_term_goals: Goal[];
  created_at?: string;
  updated_at?: string;
  coach_id?: string; // Adding coach_id property needed by components
}
