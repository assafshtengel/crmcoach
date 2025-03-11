
export interface GameSummary {
  id?: string;
  player_id: string;
  coach_id?: string;
  created_at?: string;
  opponent_name: string;
  performance_rating: number;
  match_date: string;
  highlights: string;
  improvement_areas: string;
  notes: string;
}

export interface GameSummaryFormValues {
  opponent_name: string;
  match_date: string;
  performance_rating: number;
  highlights: string;
  improvement_areas: string;
  notes: string;
}
