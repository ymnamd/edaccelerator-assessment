// API Types

// Skill types for tracking comprehension skills
export type ComprehensionSkill = "Understanding" | "Reasoning" | "Application";

// Difficulty levels for passage generation
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface GenerateQuestionRequest {
  paragraph: string;
  fullPassage?: string;
  passageTitle?: string;
  prioritizeSkills?: ComprehensionSkill[]; // skills to focus on for adaptive learning
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

// Skill performance tracking for adaptive learning
export interface SkillStats {
  Understanding: { tested: number; correct: number };
  Reasoning: { tested: number; correct: number };
  Application: { tested: number; correct: number };
}

// Passage generation interfaces
export interface GeneratePassageRequest {
  difficulty: DifficultyLevel;
  referenceLength?: number; // approximate length to match
  skillStats?: SkillStats; // previous performance to guide question generation
}

export interface GeneratePassageResponse {
  title: string;
  content: string;
  difficulty: DifficultyLevel;
}
