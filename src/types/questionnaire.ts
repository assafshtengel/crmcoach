
export type QuestionType = 'open' | 'closed';

export interface QuestionOption {
  id: string;
  text: string;
  value: number;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: QuestionOption[];
  required: boolean;
}

export interface QuestionnaireResponse {
  questionId: string;
  answer: string | number;
  answeredAt: string;
}

export interface PlayerQuestionnaireResponse {
  id: string;
  playerId: string;
  playerName: string;
  questionnaireId: string;
  responses: QuestionnaireResponse[];
  submittedAt: string;
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}
