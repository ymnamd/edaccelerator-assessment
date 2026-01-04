/**
 * useQuizState Hook
 * Manages quiz state including answers, scores, and question caching
 */

import { useState, useCallback, useMemo } from "react";
import { ComprehensionSkill, SkillStats, AnsweredQuestion } from "@/types/api";
import { LEARNING_THRESHOLDS } from "@/config/constants";

export interface QuizState {
  // Answered sections tracking
  answeredSections: Set<number>;
  correctAnswers: number;
  answeredQuestions: AnsweredQuestion[];

  // Question and answer caching
  cachedQuestions: Map<number, { question: string; skill: ComprehensionSkill }>;
  cachedAnswers: Map<
    number,
    {
      answer: string;
      evaluation: { correct: boolean; explanation: string };
      skill: ComprehensionSkill;
    }
  >;

  // Visual feedback
  sectionCorrectness: Map<number, boolean>;

  // Completion state
  showCompletion: boolean;
}

export interface QuizActions {
  handleQuestionGenerated: (
    sectionIndex: number,
    question: string,
    skill: ComprehensionSkill
  ) => void;

  handleQuestionAnswered: (
    sectionIndex: number,
    isCorrectFirstAttempt: boolean,
    answer: string,
    evaluation: { correct: boolean; explanation: string },
    skill: ComprehensionSkill,
    totalSections: number
  ) => void;

  resetQuizState: () => void;

  calculateSkillStats: () => SkillStats;

  getPrioritizedSkills: () => ComprehensionSkill[];
}

export function useQuizState(): QuizState & QuizActions {
  // Track which sections have been answered and score
  const [answeredSections, setAnsweredSections] = useState<Set<number>>(new Set());
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  // Track answered questions with their skills for rubric display
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);

  // Cache generated questions to avoid regenerating on navigation
  const [cachedQuestions, setCachedQuestions] = useState<
    Map<number, { question: string; skill: ComprehensionSkill }>
  >(new Map());

  // Cache answers and evaluations per section
  const [cachedAnswers, setCachedAnswers] = useState<
    Map<
      number,
      {
        answer: string;
        evaluation: { correct: boolean; explanation: string };
        skill: ComprehensionSkill;
      }
    >
  >(new Map());

  // Track correctness per section for visual feedback
  const [sectionCorrectness, setSectionCorrectness] = useState<Map<number, boolean>>(
    new Map()
  );

  const handleQuestionGenerated = useCallback(
    (sectionIndex: number, question: string, skill: ComprehensionSkill) => {
      setCachedQuestions((prev) => new Map(prev).set(sectionIndex, { question, skill }));
    },
    []
  );

  const handleQuestionAnswered = useCallback(
    (
      sectionIndex: number,
      isCorrectFirstAttempt: boolean,
      answer: string,
      evaluation: { correct: boolean; explanation: string },
      skill: ComprehensionSkill,
      totalSections: number
    ) => {
      // Track section as answered and update state on first answer (correct or incorrect)
      if (!answeredSections.has(sectionIndex)) {
        const newAnsweredSections = new Set(answeredSections).add(sectionIndex);
        setAnsweredSections(newAnsweredSections);

        // Update score ONLY if correct on first attempt
        if (isCorrectFirstAttempt) {
          setCorrectAnswers((prev) => prev + 1);
        }

        // Track this answered question with its skill
        setAnsweredQuestions((prev) => [
          ...prev,
          {
            questionId: sectionIndex,
            answer,
            skill,
            correct: isCorrectFirstAttempt,
          },
        ]);

        // Track correctness for visual feedback (based on first attempt)
        setSectionCorrectness((prev) =>
          new Map(prev).set(sectionIndex, isCorrectFirstAttempt)
        );
      }

      // Check if this was the last section and answered correctly
      if (evaluation.correct && sectionIndex === totalSections - 1) {
        // Show completion screen after a brief delay
        setTimeout(() => {
          setShowCompletion(true);
        }, 800);
      }

      // Always cache the answer and evaluation for display
      setCachedAnswers((prev) =>
        new Map(prev).set(sectionIndex, { answer, evaluation, skill })
      );
    },
    [answeredSections]
  );

  const resetQuizState = useCallback(() => {
    setAnsweredSections(new Set());
    setCorrectAnswers(0);
    setShowCompletion(false);
    setAnsweredQuestions([]);
    setCachedQuestions(new Map());
    setCachedAnswers(new Map());
    setSectionCorrectness(new Map());
  }, []);

  const calculateSkillStats = useCallback((): SkillStats => {
    // Initialize stats for all three skills
    const stats: SkillStats = {
      Understanding: { tested: 0, correct: 0 },
      Reasoning: { tested: 0, correct: 0 },
      Application: { tested: 0, correct: 0 },
    };

    // Aggregate answered questions by skill
    answeredQuestions.forEach((q) => {
      stats[q.skill].tested++;
      if (q.correct) {
        stats[q.skill].correct++;
      }
    });

    return stats;
  }, [answeredQuestions]);

  const getPrioritizedSkills = useCallback((): ComprehensionSkill[] => {
    if (answeredQuestions.length === 0) {
      return []; // No data yet, let AI choose naturally
    }

    const stats = calculateSkillStats();
    const priorities: ComprehensionSkill[] = [];

    // Add untested skills first (highest priority)
    (Object.keys(stats) as ComprehensionSkill[]).forEach((skill) => {
      if (stats[skill].tested === 0) {
        priorities.push(skill);
      }
    });

    // Add weak skills (< 70% correct)
    (Object.keys(stats) as ComprehensionSkill[]).forEach((skill) => {
      const skillStat = stats[skill];
      if (skillStat.tested > 0) {
        const percentage = (skillStat.correct / skillStat.tested) * 100;
        if (percentage < LEARNING_THRESHOLDS.skillWeaknessPercentage * 100) {
          priorities.push(skill);
        }
      }
    });

    return priorities;
  }, [answeredQuestions, calculateSkillStats]);

  return {
    // State
    answeredSections,
    correctAnswers,
    answeredQuestions,
    cachedQuestions,
    cachedAnswers,
    sectionCorrectness,
    showCompletion,

    // Actions
    handleQuestionGenerated,
    handleQuestionAnswered,
    resetQuizState,
    calculateSkillStats,
    getPrioritizedSkills,
  };
}
