// API Types

export interface GenerateQuestionRequest {
  paragraph: string;
  fullPassage?: string;
  passageTitle?: string;
}

export interface GenerateQuestionResponse {
  question: string;
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
