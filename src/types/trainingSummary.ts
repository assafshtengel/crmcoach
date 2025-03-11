
export interface TrainingSummary {
  id?: string;
  player_id: string;
  coach_id?: string;
  created_at?: string;
  performance_rating: number;
  effort_level: number;
  techniques_practiced: string;
  achievements: string;
  improvement_areas: string;
  fatigue_level: number;
  notes: string;
}

export interface TrainingSummaryFormValues {
  training_date: string;
  performance_rating: number;
  effort_level: number;
  techniques_practiced: string;
  achievements: string;
  improvement_areas: string;
  fatigue_level: number;
  notes: string;
}
