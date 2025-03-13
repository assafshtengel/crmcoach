
export interface GameSummary {
  id?: string;
  player_id: string;
  coach_id?: string;
  created_at?: string;
  performance_rating: number;
  concentration_level: number;
  goals_met: boolean;
  strongest_point: string;
  improvement_notes: string;
  fatigue_level: number;
  game_date?: string;
  opponent_team?: string;
}

export interface GameSummaryFormValues {
  performance_rating: number;
  concentration_level: number;
  goals_met: boolean;
  strongest_point: string;
  improvement_notes: string;
  fatigue_level: number;
  game_date?: Date;  // Date type for the form
  opponent_team?: string;
}
