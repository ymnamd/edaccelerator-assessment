/**
 * Passage Service
 * Handles passage generation API calls
 */

import { DifficultyLevel, GeneratePassageRequest, GeneratePassageResponse, SkillStats } from "@/types/api";

export interface PassageGenerationOptions {
  difficulty: DifficultyLevel;
  skillStats?: SkillStats;
}

export class PassageService {
  /**
   * Generate a new reading passage
   */
  static async generatePassage(
    options: PassageGenerationOptions
  ): Promise<GeneratePassageResponse> {
    const { difficulty, skillStats } = options;

    const requestBody: GeneratePassageRequest = {
      difficulty,
      skillStats,
    };

    const response = await fetch("/api/generate-passage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to generate passage");
    }

    return response.json();
  }
}
