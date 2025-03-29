
export interface PlayerFormData {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  notes?: string;
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

export interface PlayerSession {
  id: string;
  session_date: string;
  session_time: string;
  location?: string;
  notes?: string;
  reminder_sent: boolean;
  has_started?: boolean;
  player_id?: string;
  coach_id?: string;
  meeting_type?: string;
}

export interface SessionSummary {
  id: string;
  achieved_goals: string[];
  additional_notes?: string;
  coach_id: string;
  created_at: string;
  future_goals: string[];
  next_session_focus?: string;
  player_id: string;
  progress_rating: number;
  summary_text?: string;
  tools_used: string[];
  session?: {
    id: string;
    session_date: string;
    session_time: string;
  };
}
