"use client";

import type { ComprehensionSkill } from "@/types/api";
import { useQuestionFlow } from "@/hooks";

interface QuestionBoxProps {
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
  isLastSection: boolean;
  prioritizeSkills?: ComprehensionSkill[];
  onQuestionGenerated: (question: string, skill: ComprehensionSkill) => void;
  onAnswered: (
    isCorrect: boolean,
    answer: string,
    evaluation: { correct: boolean; explanation: string },
    skill: ComprehensionSkill
  ) => void;
  onNext: () => void;
}

export function QuestionBox({
  paragraph,
  fullPassage,
  passageTitle,
  sectionNumber,
  cachedQuestion,
  cachedSkill,
  cachedAnswerData,
  isLastSection,
  prioritizeSkills,
  onQuestionGenerated,
  onAnswered,
  onNext,
}: QuestionBoxProps) {
  const {
    question,
    answer,
    setAnswer,
    loadingState,
    evaluation,
    error,
    skill,
    softPrompt,
    handleSubmit,
    handleTryAgain,
  } = useQuestionFlow({
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
  });

  // Loading state
  if (loadingState === "loading") {
    return (
      <div className="mx-auto max-w-3xl rounded-xl sm:rounded-2xl bg-white p-5 sm:p-8 lg:p-10 shadow-sm ring-1 ring-stone-200">
        <div className="flex items-center justify-center space-x-3 py-8 sm:py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-600">Generating question...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !question) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl sm:rounded-2xl bg-white p-5 sm:p-8 lg:p-10 shadow-sm ring-1 ring-stone-200">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
            <svg
              className="h-6 w-6 text-rose-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl rounded-xl sm:rounded-2xl bg-white p-5 sm:p-8 lg:p-10 shadow-sm ring-1 ring-stone-200">
      {/* Soft Prompt - Subtle encouragement above question */}
      {softPrompt && (
        <div className="mb-3 sm:mb-4 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-4 w-4 text-blue-600"
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
          <p className="text-sm font-medium text-blue-600">{softPrompt}</p>
        </div>
      )}

      {/* Question Header */}
      <div className="mb-4 sm:mb-6 flex items-start gap-2.5 sm:gap-3">
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-100">
          <svg
            className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-800 sm:text-lg lg:text-xl">
            {question}
          </h3>
        </div>
      </div>

      {/* Answer Form or Evaluation */}
      {loadingState !== "evaluated" ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="answer" className="sr-only">
              Your answer
            </label>
            <textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={4}
              disabled={loadingState === "submitting"}
              className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-800 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!answer.trim() || loadingState === "submitting"}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold text-white transition-colors active:scale-95 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingState === "submitting" ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span className="hidden sm:inline">Evaluating...</span>
                  <span className="sm:hidden">Checking...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Submit Answer</span>
                  <span className="sm:hidden">Submit</span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Evaluation Results */
        <div className="space-y-4">
          {/* User's Answer Display */}
          <div className="rounded-lg bg-stone-50 p-3 sm:p-4">
            <p className="mb-1 text-xs sm:text-sm font-semibold text-gray-600">
              Your Answer:
            </p>
            <p className="text-sm sm:text-base text-gray-800">{answer}</p>
          </div>

          {/* Feedback */}
          {evaluation && (
            <div
              className={`rounded-lg p-3 sm:p-4 ${
                evaluation.correct
                  ? "bg-green-50 ring-1 ring-green-200"
                  : "bg-rose-50 ring-1 ring-rose-200"
              }`}
            >
              <div className="mb-2 sm:mb-3 flex items-center gap-2">
                {evaluation.correct ? (
                  <>
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="font-semibold text-green-800">
                      Great job!
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500">
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    <p className="font-semibold text-rose-800">
                      Not quite right
                    </p>
                  </>
                )}
              </div>
              <p
                className={
                  evaluation.correct ? "text-green-800" : "text-rose-800"
                }
              >
                {evaluation.explanation}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 sm:gap-3">
            {!evaluation?.correct ? (
              <button
                onClick={handleTryAgain}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold text-white transition-colors active:scale-95 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Try Again
              </button>
            ) : (
              <button
                onClick={onNext}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold text-white transition-colors active:scale-95 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className="hidden sm:inline">{isLastSection ? "View Results" : "Next Section"}</span>
                <span className="sm:hidden">{isLastSection ? "Results" : "Next"}</span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
