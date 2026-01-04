/**
 * Evaluation Service
 * Handles answer evaluation API calls
 */

import { EvaluateAnswerRequest, EvaluateAnswerResponse } from "@/types/api";

export interface AnswerEvaluationOptions {
  question: string;
  studentAnswer: string;
  passage: string;
}

export class EvaluationService {
  /**
   * Evaluate a student's answer to a comprehension question
   */
  static async evaluateAnswer(
    options: AnswerEvaluationOptions
  ): Promise<EvaluateAnswerResponse> {
    const { question, studentAnswer, passage } = options;

    const requestBody: EvaluateAnswerRequest = {
      question,
      answer: studentAnswer,
      paragraph: passage,
    };

    const response = await fetch("/api/evaluate-answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to evaluate answer");
    }

    return response.json();
  }
}
