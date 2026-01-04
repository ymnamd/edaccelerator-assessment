/**
 * usePassageGenerator Hook
 * Manages passage generation and state
 */

import { useState, useCallback } from "react";
import { DifficultyLevel, SkillStats } from "@/types/api";
import { Passage } from "@/data/passage";
import { PassageService } from "@/services/passageService";
import { MESSAGES } from "@/config/constants";

export interface PassageGeneratorState {
  isGeneratingPassage: boolean;
}

export interface PassageGeneratorActions {
  generateNewPassage: (
    difficulty: DifficultyLevel,
    skillStats: SkillStats,
    onSuccess: (passage: Passage) => void
  ) => Promise<void>;
}

export function usePassageGenerator(): PassageGeneratorState & PassageGeneratorActions {
  const [isGeneratingPassage, setIsGeneratingPassage] = useState(false);

  const generateNewPassage = useCallback(
    async (
      difficulty: DifficultyLevel,
      skillStats: SkillStats,
      onSuccess: (passage: Passage) => void
    ) => {
      setIsGeneratingPassage(true);

      try {
        const data = await PassageService.generatePassage({
          difficulty,
          skillStats,
        });

        // Create new passage object
        const newPassage: Passage = {
          id: `passage-${Date.now()}`,
          title: data.title,
          content: data.content,
          difficulty: data.difficulty,
        };

        onSuccess(newPassage);
      } catch (error) {
        console.error("Error generating passage:", error);
        alert(MESSAGES.errors.passageGeneration);
      } finally {
        setIsGeneratingPassage(false);
      }
    },
    []
  );

  return {
    isGeneratingPassage,
    generateNewPassage,
  };
}
