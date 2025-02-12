
export interface QuestionOption {
  text: string;
  score: number;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
}

export interface Category {
  id: string;
  name: string;
  type: 'mental' | 'physical' | 'professional';
  questions: Question[];
}

export interface EvaluationFormData {
  playerName: string;
  age: string;
  team: string;
  date: string;
  scores: Record<string, number>;
}
