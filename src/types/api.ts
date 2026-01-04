// API Types

// Skill types for tracking comprehension skills
export type ComprehensionSkill = "Understanding" | "Reasoning" | "Application";

export interface GenerateQuestionRequest {
  paragraph: string;
  fullPassage?: string;
  passageTitle?: string;
}

export interface GenerateQuestionResponse {
  question: string;
  skill: ComprehensionSkill; // Added skill mapping
  softPrompt: string; // Added soft prompt
}

export interface EvaluateAnswerRequest {
  question: string;
  answer: string;
  paragraph: string;
  fullPassage?: string;
}

export interface EvaluateAnswerResponse {
  correct: boolean;
  explanation: string;
}

export interface APIError {
  error: string;
}

// Interface for tracking answered questions with their skills
export interface AnsweredQuestion {
  questionId: number; // section index
  answer: string;
  skill: ComprehensionSkill;
  correct: boolean;
}
