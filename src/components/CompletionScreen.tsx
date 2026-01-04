"use client";

import { Trophy, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import type {
  AnsweredQuestion,
  ComprehensionSkill,
  DifficultyLevel,
} from "@/types/api";

interface CompletionScreenProps {
  correctAnswers: number;
  totalQuestions: number;
  answeredQuestions: AnsweredQuestion[];
  onRestart: () => void;
  onTryNewPassage: (difficulty: DifficultyLevel) => void;
  isGeneratingPassage: boolean;
}

export function CompletionScreen({
  correctAnswers,
  totalQuestions,
  answeredQuestions,
  onRestart,
  onTryNewPassage,
  isGeneratingPassage,
}: CompletionScreenProps) {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  // Determine recommended difficulty based on score
  const getRecommendedDifficulty = (): DifficultyLevel => {
    if (percentage >= 90) return "advanced";
    if (percentage >= 70) return "intermediate";
    return "beginner";
  };

  const recommendedDifficulty = getRecommendedDifficulty();

  // Calculate skill statistics
  const skillStats = answeredQuestions.reduce(
    (acc, q) => {
      if (!acc[q.skill]) {
        acc[q.skill] = { total: 0, correct: 0 };
      }
      acc[q.skill].total += 1;
      if (q.correct) {
        acc[q.skill].correct += 1;
      }
      return acc;
    },
    {} as Record<ComprehensionSkill, { total: number; correct: number }>
  );

  // Calculate percentage for each skill
  const skillPercentages = Object.entries(skillStats).reduce(
    (acc, [skill, stats]) => {
      acc[skill as ComprehensionSkill] = Math.round(
        (stats.correct / stats.total) * 100
      );
      return acc;
    },
    {} as Record<ComprehensionSkill, number>
  );

  // Determine encouraging message based on performance
  const getMessage = () => {
    if (percentage === 100) {
      return "Perfect score! You have excellent comprehension skills!";
    } else if (percentage >= 80) {
      return "Great work! You understood the passage very well!";
    } else if (percentage >= 60) {
      return "Good job! Keep practicing to improve further!";
    } else {
      return "Nice effort! Try reading more carefully next time!";
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-xl sm:rounded-2xl bg-white p-5 sm:p-8 lg:p-12 shadow-sm ring-1 ring-stone-200">
        {/* Trophy Icon */}
        <div className="mb-5 sm:mb-6 flex justify-center">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-blue-500">
            <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-4 text-center text-2xl font-bold text-gray-800 sm:text-3xl lg:text-4xl">
          Passage Complete!
        </h2>

        {/* Score Display */}
        <div className="mb-5 sm:mb-6 text-center">
          <div className="mb-2 inline-block rounded-xl bg-blue-50 px-6 py-3 sm:px-8 sm:py-4">
            <p className="text-4xl font-bold text-blue-600 sm:text-5xl lg:text-6xl">
              {correctAnswers} / {totalQuestions}
            </p>
          </div>
          <p className="text-base text-gray-600 sm:text-lg lg:text-xl">
            {percentage}% correct
          </p>
        </div>

        {/* Encouraging Message */}
        <div className="mb-6 sm:mb-8 rounded-lg bg-teal-50 p-4 sm:p-6 text-center">
          <p className="text-base font-medium text-teal-800 sm:text-lg lg:text-xl">
            {getMessage()}
          </p>
        </div>

        {/* Skills Rubric - Only show skills that were tested */}
        {answeredQuestions.length > 0 && (
          <div className="mb-6 sm:mb-8 space-y-2 sm:space-y-3">
            <h3 className="text-center text-base sm:text-lg font-semibold text-gray-800">
              Reading Skills You Practiced
            </h3>
            <div className="space-y-2">
              {/* Understanding - Only show if tested */}
              {skillStats.Understanding && (
                <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3 ring-1 ring-blue-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                      <svg
                        className="h-5 w-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <span className="font-medium text-blue-800">
                      Understanding
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-blue-600">
                      ({skillStats.Understanding.correct} /{" "}
                      {skillStats.Understanding.total})
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {skillPercentages.Understanding}%
                    </span>
                  </div>
                </div>
              )}

              {/* Reasoning - Only show if tested */}
              {skillStats.Reasoning && (
                <div className="flex items-center justify-between rounded-lg bg-teal-50 px-4 py-3 ring-1 ring-teal-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500">
                      <svg
                        className="h-5 w-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <span className="font-medium text-teal-800">Reasoning</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-teal-600">
                      ({skillStats.Reasoning.correct} /{" "}
                      {skillStats.Reasoning.total})
                    </span>
                    <span className="text-lg font-bold text-teal-600">
                      {skillPercentages.Reasoning}%
                    </span>
                  </div>
                </div>
              )}

              {/* Application - Only show if tested */}
              {skillStats.Application && (
                <div className="flex items-center justify-between rounded-lg bg-green-50 px-4 py-3 ring-1 ring-green-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                      <svg
                        className="h-5 w-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <span className="font-medium text-green-800">
                      Application
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-green-600">
                      ({skillStats.Application.correct} /{" "}
                      {skillStats.Application.total})
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {skillPercentages.Application}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="my-8 border-t border-stone-200" />

        {/* Try Another Passage Section */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-center text-base sm:text-lg font-semibold text-gray-800">
            Want to try another passage?
          </h3>
          <p className="text-center text-xs sm:text-sm text-gray-600">
            Choose a difficulty level:
          </p>

          {/* Difficulty Buttons */}
          <div className="grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-3">
            {/* Beginner Button */}
            <button
              onClick={() => onTryNewPassage("beginner")}
              disabled={isGeneratingPassage}
              className={`group relative flex flex-col items-center gap-1.5 sm:gap-2 rounded-lg border-2 p-3 sm:p-4 text-sm sm:text-base font-semibold transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                recommendedDifficulty === "beginner"
                  ? "border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  : "border-stone-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50"
              } ${isGeneratingPassage ? "cursor-not-allowed opacity-50" : "hover:scale-105"}`}
            >
              {recommendedDifficulty === "beginner" && (
                <span className="absolute -top-2 right-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                  Recommended
                </span>
              )}
              <TrendingDown className="h-6 w-6" />
              <span>Beginner</span>
            </button>

            {/* Intermediate Difficulty Button */}
            <button
              onClick={() => onTryNewPassage("intermediate")}
              disabled={isGeneratingPassage}
              className={`group relative flex flex-col items-center gap-1.5 sm:gap-2 rounded-lg border-2 p-3 sm:p-4 text-sm sm:text-base font-semibold transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                recommendedDifficulty === "intermediate"
                  ? "border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  : "border-stone-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50"
              } ${isGeneratingPassage ? "cursor-not-allowed opacity-50" : "hover:scale-105"}`}
            >
              {recommendedDifficulty === "intermediate" && (
                <span className="absolute -top-2 right-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                  Recommended
                </span>
              )}
              <Sparkles className="h-6 w-6" />
              <span>Intermediate</span>
            </button>

            {/* Advanced Button */}
            <button
              onClick={() => onTryNewPassage("advanced")}
              disabled={isGeneratingPassage}
              className={`group relative flex flex-col items-center gap-1.5 sm:gap-2 rounded-lg border-2 p-3 sm:p-4 text-sm sm:text-base font-semibold transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                recommendedDifficulty === "advanced"
                  ? "border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  : "border-stone-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50"
              } ${isGeneratingPassage ? "cursor-not-allowed opacity-50" : "hover:scale-105"}`}
            >
              {recommendedDifficulty === "advanced" && (
                <span className="absolute -top-2 right-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                  Recommended
                </span>
              )}
              <TrendingUp className="h-6 w-6" />
              <span>Advanced</span>
            </button>
          </div>

          {/* Loading State */}
          {isGeneratingPassage && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span>Generating new passage...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
