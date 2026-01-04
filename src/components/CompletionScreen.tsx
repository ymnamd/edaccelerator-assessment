"use client";

import { Trophy, RotateCcw } from "lucide-react";
import type { AnsweredQuestion, ComprehensionSkill } from "@/types/api";

interface CompletionScreenProps {
  correctAnswers: number;
  totalQuestions: number;
  answeredQuestions: AnsweredQuestion[];
  onRestart: () => void;
}

export function CompletionScreen({
  correctAnswers,
  totalQuestions,
  answeredQuestions,
  onRestart,
}: CompletionScreenProps) {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  // Count skills engaged
  const skillCounts = answeredQuestions.reduce(
    (acc, q) => {
      acc[q.skill] = (acc[q.skill] || 0) + 1;
      return acc;
    },
    {} as Record<ComprehensionSkill, number>
  );

  // Determine which skills were engaged
  const skillsEngaged = {
    Understanding: skillCounts.Understanding > 0,
    Reasoning: skillCounts.Reasoning > 0,
    Application: skillCounts.Application > 0,
  };

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
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200 sm:p-12">
        {/* Trophy Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-blue-500">
            <Trophy className="h-10 w-10 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-4 text-center text-3xl font-bold text-gray-800 sm:text-4xl">
          Passage Complete!
        </h2>

        {/* Score Display */}
        <div className="mb-6 text-center">
          <div className="mb-2 inline-block rounded-xl bg-blue-50 px-8 py-4">
            <p className="text-5xl font-bold text-blue-600 sm:text-6xl">
              {correctAnswers} / {totalQuestions}
            </p>
          </div>
          <p className="text-lg text-gray-600 sm:text-xl">
            {percentage}% correct
          </p>
        </div>

        {/* Encouraging Message */}
        <div className="mb-8 rounded-lg bg-teal-50 p-6 text-center">
          <p className="text-lg font-medium text-teal-800 sm:text-xl">
            {getMessage()}
          </p>
        </div>

        {/* Skills Rubric - Only show skills that were tested */}
        {answeredQuestions.length > 0 && (
          <div className="mb-8 space-y-3">
            <h3 className="text-center text-lg font-semibold text-gray-800">
              Reading Skills You Practiced
            </h3>
            <div className="space-y-2">
              {/* Understanding - Only show if tested */}
              {skillsEngaged.Understanding && (
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
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}

              {/* Reasoning - Only show if tested */}
              {skillsEngaged.Reasoning && (
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
                  <svg
                    className="h-6 w-6 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}

              {/* Application - Only show if tested */}
              {skillsEngaged.Application && (
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
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Restart Button */}
        <div className="flex justify-center">
          <button
            onClick={onRestart}
            className="flex items-center gap-3 rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white transition-all hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RotateCcw className="h-5 w-5" />
            Try Another Passage
          </button>
        </div>
      </div>
    </div>
  );
}
