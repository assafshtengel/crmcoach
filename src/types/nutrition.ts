
export interface NutritionData {
  id?: string;
  player_id: string;
  coach_id?: string;
  created_at?: string;
  meal_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: string[];
  hydration_level: number;
  carbs_ratio: number;
  protein_ratio: number;
  fat_ratio: number;
  notes: string;
}

export interface NutritionFormValues {
  meal_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: string[];
  hydration_level: number;
  carbs_ratio: number;
  protein_ratio: number;
  fat_ratio: number;
  notes: string;
}

export interface NutritionChartData {
  date: string;
  hydration: number;
  carbs: number;
  protein: number;
  fat: number;
}
