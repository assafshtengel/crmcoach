
export interface MentalState {
  id?: string;
  player_id: string;
  coach_id?: string;
  created_at?: string;
  feeling_score: number;
  motivation_level: number;
  mental_fatigue_level: number;
  improvement_focus: string;
  has_concerns: boolean;
  concerns_details: string;
}

export interface MentalStateFormValues {
  feeling_score: number;
  motivation_level: number;
  mental_fatigue_level: number;
  improvement_focus: string;
  has_concerns: boolean;
  concerns_details: string;
}

// Adding chart data types for visualization purposes
export interface MentalStateChartData {
  date: string;
  feeling: number;
  motivation: number;
  fatigue: number;
}
