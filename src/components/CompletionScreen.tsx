"use client";

import { Trophy, RotateCcw } from "lucide-react";

interface CompletionScreenProps {
  correctAnswers: number;
  totalQuestions: number;
  onRestart: () => void;
}

export function CompletionScreen({
  correctAnswers,
  totalQuestions,
  onRestart,
}: CompletionScreenProps) {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

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
