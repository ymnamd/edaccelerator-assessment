/**
 * API Configuration
 * Centralized configuration for OpenAI API and other API settings
 */

export const API_CONFIG = {
  openai: {
    model: "gpt-4o-mini",
    temperature: {
      creative: 0.7,  // For question generation
      precise: 0.3,   // For answer evaluation
    },
    maxTokens: {
      question: 200,
      evaluation: 200,
      passage: 1500,
    },
  },
  limits: {
    passageMaxLength: {
      beginner: 5000,
      intermediate: 10000,
      advanced: 200,  // Character limit per section for advanced
    },
    questionMaxLength: 2000,
  },
} as const;

export type APIConfig = typeof API_CONFIG;
