
export interface GameSummary {
  id?: string;
  player_id: string;
  coach_id?: string;
  created_at?: string;
  match_date: string;
  opponent_name: string;
  performance_rating: number;
  concentration_level: number;
  goals_met: boolean;
  strongest_point: string;
  improvement_notes: string;
  fatigue_level: number;
}

export interface GameSummaryFormValues {
  match_date: string;
  opponent_name: string;
  performance_rating: number;
  concentration_level: number;
  goals_met: boolean;
  strongest_point: string;
  improvement_notes: string;
  fatigue_level: number;
}
