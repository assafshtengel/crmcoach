
export interface Player {
  id: string;
  full_name: string;
  email: string;
  sport_field?: string;
  club?: string;
  year_group?: string;
  profile_image?: string;
  coach_id?: string;
  phone?: string;
  city?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  birthdate?: string;
  notes?: string;
  injuries?: string;
  contact_status?: string;
  created_at?: string;
}

// PlayerData type alias to ensure compatibility with existing code
export type PlayerData = Player;

// Session type for player sessions
export interface PlayerSession {
  id: string;
  player_id: string;
  session_date: string;
  session_time: string;
  location?: string;
  notes?: string;
  created_at?: string;
  status?: string;
}

// Session summary type
export interface SessionSummary {
  id: string;
  player_id: string;
  session_id?: string;
  coach_id?: string;
  summary_text?: string;
  progress_rating: number;
  achieved_goals?: string[];
  future_goals?: string[];
  tools_used?: string[];
  next_session_focus?: string;
  created_at: string;
  session?: {
    id: string;
    session_date: string;
    session_time: string;
  };
}
