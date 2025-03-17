
export interface PhysicalState {
  id?: string;
  player_id: string;
  coach_id?: string;
  created_at?: string;
  energy_level: number;
  pain_level: number;
  recovery_quality: number;
  injury_status: string;
  sleep_quality: number;
  sleep_duration: number;
  notes: string;
}

export interface PhysicalStateFormValues {
  energy_level: number;
  pain_level: number;
  recovery_quality: number;
  injury_status: string;
  sleep_quality: number;
  sleep_duration: number;
  notes: string;
}

export interface PhysicalStateChartData {
  date: string;
  energy: number;
  recovery: number;
  sleep: number;
  pain: number;
}
