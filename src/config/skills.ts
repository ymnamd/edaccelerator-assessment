/**
 * Comprehension Skills Configuration
 * Centralized definitions for comprehension skills and their mappings
 */

import { ComprehensionSkill } from "@/types/api";

export const COMPREHENSION_SKILLS: ComprehensionSkill[] = [
  "Understanding",
  "Reasoning",
  "Application",
];

/**
 * Skill descriptions for AI prompt generation
 */
export const SKILL_DESCRIPTIONS: Record<ComprehensionSkill, string> = {
  Understanding: "literal comprehension of facts and details directly stated in the text",
  Reasoning: "inferential thinking about implicit meanings, relationships, and conclusions",
  Application: "applying concepts from the text to new situations or real-world scenarios",
};

/**
 * Soft prompts/encouragement phrases for each skill
 */
export const SKILL_SOFT_PROMPTS: Record<ComprehensionSkill, string> = {
  Understanding: "Show what you remember from the passage.",
  Reasoning: "Think deeply about what the passage suggests.",
  Application: "How might you use this information?",
};

/**
 * Icons for each skill (using Lucide React icon names)
 */
export const SKILL_ICONS: Record<ComprehensionSkill, string> = {
  Understanding: "BookOpen",
  Reasoning: "Lightbulb",
  Application: "Puzzle",
};

/**
 * Color classes for each skill
 */
export const SKILL_COLORS: Record<ComprehensionSkill, { bg: string; text: string; border: string }> = {
  Understanding: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  Reasoning: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  Application: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
  },
};
