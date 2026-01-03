"use client";

import { useState, useEffect } from "react";
import type {
  GenerateQuestionResponse,
  EvaluateAnswerResponse,
} from "@/types/api";

interface QuestionBoxProps {
  paragraph: string;
  fullPassage: string;
  passageTitle: string;
  sectionNumber: number;
  cachedQuestion?: string;
  cachedAnswerData?: {
    answer: string;
    evaluation: { correct: boolean; explanation: string };
  };
  isLastSection: boolean;
  onQuestionGenerated: (question: string) => void;
  onAnswered: (
    isCorrect: boolean,
    answer: string,
    evaluation: { correct: boolean; explanation: string }
  ) => void;
  onNext: () => void;
}

type LoadingState = "loading" | "ready" | "submitting" | "evaluated";

export function QuestionBox({
  paragraph,
  fullPassage,
  passageTitle,
  sectionNumber,
  cachedQuestion,
  cachedAnswerData,
  isLastSection,
  onQuestionGenerated,
  onAnswered,
  onNext,
}: QuestionBoxProps) {
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState("");
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [evaluation, setEvaluation] = useState<EvaluateAnswerResponse | null>(
    null
  );
  const [error, setError] = useState<string>("");

  // Generate question when component mounts or section changes
  useEffect(() => {
    let cancelled = false;

    async function loadQuestion() {
      // Use cached question if available
      if (cachedQuestion) {
        setQuestion(cachedQuestion);
        setError("");

        // Restore cached answer and evaluation if available
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
        const response = await fetch("/api/generate-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paragraph,
            fullPassage,
            passageTitle,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate question");
        }

        const data: GenerateQuestionResponse = await response.json();

        if (!cancelled) {
          setQuestion(data.question);
          setLoadingState("ready");
          // Notify parent to cache this question
          onQuestionGenerated(data.question);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load question. Please try again.");
          setLoadingState("ready");
        }
      }
    }

    loadQuestion();

    return () => {
      cancelled = true;
    };
  }, [paragraph, fullPassage, passageTitle, sectionNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || !question) return;

    setLoadingState("submitting");
    setError("");

    try {
      const response = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          answer: answer.trim(),
          paragraph,
          fullPassage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate answer");
      }

      const data: EvaluateAnswerResponse = await response.json();
      setEvaluation(data);
      setLoadingState("evaluated");

      // Notify parent that question was answered
      onAnswered(data.correct, answer.trim(), data);
    } catch (err) {
      setError("Failed to evaluate answer. Please try again.");
      setLoadingState("ready");
    }
  };

  const handleTryAgain = () => {
    setAnswer("");
    setEvaluation(null);
    setLoadingState("ready");
  };

  // Loading state
  if (loadingState === "loading") {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200 sm:p-10">
        <div className="flex items-center justify-center space-x-3 py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-600">Generating question...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !question) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200 sm:p-10">
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
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200 sm:p-10">
      {/* Question Header */}
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-100">
          <svg
            className="h-5 w-5 text-teal-600"
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
          <h3 className="text-lg font-semibold text-gray-800 sm:text-xl">
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
              className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-3 text-gray-800 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingState === "submitting" ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Evaluating...
                </>
              ) : (
                <>
                  Submit Answer
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
          <div className="rounded-lg bg-stone-50 p-4">
            <p className="mb-1 text-sm font-semibold text-gray-600">
              Your Answer:
            </p>
            <p className="text-gray-800">{answer}</p>
          </div>

          {/* Feedback */}
          {evaluation && (
            <div
              className={`rounded-lg p-4 ${
                evaluation.correct
                  ? "bg-green-50 ring-1 ring-green-200"
                  : "bg-rose-50 ring-1 ring-rose-200"
              }`}
            >
              <div className="mb-3 flex items-center gap-2">
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
          <div className="flex justify-end gap-3">
            <button
              onClick={handleTryAgain}
              className="flex items-center gap-2 rounded-lg border-2 border-stone-300 bg-white px-6 py-3 font-semibold text-gray-800 transition-colors hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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

            {!isLastSection && (
              <button
                onClick={onNext}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Next Section
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
