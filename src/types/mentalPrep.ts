
export interface FormData {
  fullName: string;
  email: string;
  phone: string;
  matchDate: string;
  opposingTeam: string;
  gameType: string;
  selectedStates: string[];
  selectedGoals: Array<{ goal: string; metric: string; isCustom?: boolean }>;
  answers: Record<string, string>;
  currentPressure?: string;
  optimalPressure?: string;
  playerName?: string;
}
