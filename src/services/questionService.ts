/**
 * Question Service
 * Handles question generation API calls
 */

import { ComprehensionSkill, GenerateQuestionRequest, GenerateQuestionResponse } from "@/types/api";

export interface QuestionGenerationOptions {
  paragraph: string;
  fullPassage: string;
  passageTitle: string;
  sectionNumber: number;
  prioritizeSkills?: ComprehensionSkill[];
}

export class QuestionService {
  /**
   * Generate a comprehension question for a passage section
   */
  static async generateQuestion(
    options: QuestionGenerationOptions
  ): Promise<GenerateQuestionResponse> {
    const { paragraph, fullPassage, passageTitle, sectionNumber, prioritizeSkills } = options;

    const requestBody: GenerateQuestionRequest = {
      paragraph,
      fullPassage,
      passageTitle,
      prioritizeSkills,
    };

    const response = await fetch("/api/generate-question", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to generate question");
    }

    return response.json();
  }
}
