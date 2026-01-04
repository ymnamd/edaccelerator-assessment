/**
 * Application Constants
 * Centralized constants for thresholds, timings, and other magic values
 */

import { DifficultyLevel } from "@/types/api";

/**
 * Learning and scoring thresholds
 */
export const LEARNING_THRESHOLDS = {
  skillWeaknessPercentage: 0.7,  // 70% incorrect triggers weakness identification
  excellentScorePercentage: 0.8, // 80%+ is excellent
  goodScorePercentage: 0.6,      // 60%+ is good
} as const;

/**
 * UI timing constants (in milliseconds)
 */
export const UI_TIMING = {
  scrollDelay: 800,              // Delay before scrolling to next section
  modalFadeIn: 200,              // Modal animation duration
} as const;

/**
 * Difficulty level metadata
 */
export const DIFFICULTY_METADATA: Record<DifficultyLevel, {
  label: string;
  description: string;
  readingLevel: string;
}> = {
  beginner: {
    label: "Beginner",
    description: "Simple vocabulary and straightforward concepts",
    readingLevel: "Grades 3-5",
  },
  intermediate: {
    label: "Intermediate",
    description: "Moderate complexity with some abstract ideas",
    readingLevel: "Grades 6-8",
  },
  advanced: {
    label: "Advanced",
    description: "Complex vocabulary and sophisticated concepts",
    readingLevel: "Grades 9+",
  },
};

/**
 * Message templates
 */
export const MESSAGES = {
  errors: {
    questionGeneration: "Unable to generate question. Please try again.",
    answerEvaluation: "Unable to evaluate answer. Please try again.",
    passageGeneration: "Unable to generate passage. Please try again.",
    generic: "Something went wrong. Please try again.",
  },
  success: {
    passageGenerated: "New passage generated successfully!",
    quizCompleted: "Quiz completed!",
  },
} as const;

/**
 * Adaptive learning configuration
 */
export const ADAPTIVE_LEARNING = {
  prioritySkillCount: 2,         // Number of weak skills to prioritize
  minQuestionsForAnalysis: 3,    // Minimum questions before skill analysis
} as const;
