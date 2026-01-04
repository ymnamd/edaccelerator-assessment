/**
 * useQuestionFlow Hook
 * Manages question generation, answer submission, and evaluation flow
 */

import { useState, useEffect, useCallback } from "react";
import { ComprehensionSkill } from "@/types/api";
import { QuestionService } from "@/services/questionService";
import { EvaluationService } from "@/services/evaluationService";
import { SKILL_SOFT_PROMPTS } from "@/config/skills";
import { MESSAGES } from "@/config/constants";

type LoadingState = "loading" | "ready" | "submitting" | "evaluated";

export interface QuestionFlowOptions {
  paragraph: string;
  fullPassage: string;
  passageTitle: string;
  sectionNumber: number;
  cachedQuestion?: string;
  cachedSkill?: ComprehensionSkill;
  cachedAnswerData?: {
    answer: string;
    evaluation: { correct: boolean; explanation: string };
    skill: ComprehensionSkill;
  };
  prioritizeSkills?: ComprehensionSkill[];
  onQuestionGenerated: (question: string, skill: ComprehensionSkill) => void;
  onAnswered: (
    isCorrect: boolean,
    answer: string,
    evaluation: { correct: boolean; explanation: string },
    skill: ComprehensionSkill
  ) => void;
}

export function useQuestionFlow(options: QuestionFlowOptions) {
  const {
    paragraph,
    fullPassage,
    passageTitle,
    sectionNumber,
    cachedQuestion,
    cachedSkill,
    cachedAnswerData,
    prioritizeSkills,
    onQuestionGenerated,
    onAnswered,
  } = options;

  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState("");
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [evaluation, setEvaluation] = useState<{
    correct: boolean;
    explanation: string;
  } | null>(null);
  const [error, setError] = useState<string>("");
  const [skill, setSkill] = useState<ComprehensionSkill>("Understanding");
  const [softPrompt, setSoftPrompt] = useState<string>("");
  const [isFirstAttempt, setIsFirstAttempt] = useState(true);

  // Generate question when component mounts or section changes
  useEffect(() => {
    let cancelled = false;

    async function loadQuestion() {
      // Use cached question if available
      if (cachedQuestion && cachedSkill) {
        setQuestion(cachedQuestion);
        setSkill(cachedSkill);
        setError("");
        setSoftPrompt(SKILL_SOFT_PROMPTS[cachedSkill]);

        // Restore cached answer, evaluation if available
        if (cachedAnswerData) {
          setAnswer(cachedAnswerData.answer);
          setEvaluation(cachedAnswerData.evaluation);
          setLoadingState("evaluated");
        } else {
          setAnswer("");
          setEvaluation(null);
          setLoadingState("ready");
        }
        return;
      }

      // Otherwise, generate new question
      setLoadingState("loading");
      setQuestion("");
      setError("");
      setAnswer("");
      setEvaluation(null);

      try {
        const data = await QuestionService.generateQuestion({
          paragraph,
          fullPassage,
          passageTitle,
          sectionNumber,
          prioritizeSkills,
        });

        if (!cancelled) {
          setQuestion(data.question);
          setSkill(data.skill);
          setSoftPrompt(data.softPrompt);
          setLoadingState("ready");
          onQuestionGenerated(data.question, data.skill);
        }
      } catch (err) {
        if (!cancelled) {
          setError(MESSAGES.errors.questionGeneration);
          setLoadingState("ready");
        }
      }
    }

    loadQuestion();

    return () => {
      cancelled = true;
    };
  }, [
    paragraph,
    fullPassage,
    passageTitle,
    sectionNumber,
    cachedQuestion,
    cachedSkill,
    cachedAnswerData,
    prioritizeSkills,
    onQuestionGenerated,
  ]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!answer.trim() || !question) return;

      setLoadingState("submitting");
      setError("");

      try {
        const data = await EvaluationService.evaluateAnswer({
          question,
          studentAnswer: answer.trim(),
          passage: fullPassage,
        });

        setEvaluation(data);
        setLoadingState("evaluated");

        // Notify parent that question was answered
        onAnswered(data.correct && isFirstAttempt, answer.trim(), data, skill);

        // Mark that first attempt is complete
        if (isFirstAttempt) {
          setIsFirstAttempt(false);
        }
      } catch (err) {
        setError(MESSAGES.errors.answerEvaluation);
        setLoadingState("ready");
      }
    },
    [answer, question, fullPassage, isFirstAttempt, skill, onAnswered]
  );

  const handleTryAgain = useCallback(() => {
    setAnswer("");
    setEvaluation(null);
    setLoadingState("ready");
  }, []);

  return {
    // State
    question,
    answer,
    setAnswer,
    loadingState,
    evaluation,
    error,
    skill,
    softPrompt,

    // Actions
    handleSubmit,
    handleTryAgain,
  };
}
