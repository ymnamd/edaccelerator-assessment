"use client";

import { useState, useRef } from "react";
import {
  defaultPassageData,
  getParagraphs,
  type Passage,
} from "@/data/passage";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import {
  ReadingCard,
  ProgressIndicator,
  QuestionBox,
  PassageModal,
  CompletionScreen,
} from "@/components";
import type {
  AnsweredQuestion,
  ComprehensionSkill,
  DifficultyLevel,
  GeneratePassageResponse,
  SkillStats,
} from "@/types/api";

export default function Home() {
  // Passage state - starts with default bee passage, can be regenerated
  const [currentPassage, setCurrentPassage] = useState<Passage>(defaultPassageData);
  const [isGeneratingPassage, setIsGeneratingPassage] = useState(false);
  const paragraphs = getParagraphs(currentPassage);

  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track which sections have been answered and score
  const [answeredSections, setAnsweredSections] = useState<Set<number>>(
    new Set()
  );
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  // Track answered questions with their skills for rubric display
  const [answeredQuestions, setAnsweredQuestions] = useState<
    AnsweredQuestion[]
  >([]);

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
  const [sectionCorrectness, setSectionCorrectness] = useState<
    Map<number, boolean>
  >(new Map());

  // Calculate prioritized skills based on current performance
  const getPrioritizedSkills = (): ComprehensionSkill[] => {
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
        if (percentage < 70) {
          priorities.push(skill);
        }
      }
    });

    return priorities;
  };

  const scrollToParagraph = (index: number) => {
    setCurrentParagraph(index);
    paragraphRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const handleQuestionGenerated = (
    sectionIndex: number,
    question: string,
    skill: ComprehensionSkill
  ) => {
    // Cache the generated question with skill for this section
    setCachedQuestions((prev) => new Map(prev).set(sectionIndex, { question, skill }));
  };

  const handleQuestionAnswered = (
    sectionIndex: number,
    isCorrectFirstAttempt: boolean,
    answer: string,
    evaluation: { correct: boolean; explanation: string },
    skill: ComprehensionSkill
  ) => {
    // Mark section as answered when user gets it correct (even on retry)
    if (evaluation.correct) {
      const newAnsweredSections = new Set(answeredSections).add(sectionIndex);
      setAnsweredSections(newAnsweredSections);

      // Update score ONLY if correct on first attempt and not already answered
      if (!answeredSections.has(sectionIndex)) {
        if (isCorrectFirstAttempt) {
          setCorrectAnswers((prev) => prev + 1);
        }
        // Track this answered question with its skill
        // Mark as correct only if it was correct on first attempt
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
        setSectionCorrectness((prev) => new Map(prev).set(sectionIndex, isCorrectFirstAttempt));
      }

      // Check if this was the last section
      if (sectionIndex === paragraphs.length - 1) {
        // Show completion screen after a brief delay
        setTimeout(() => {
          setShowCompletion(true);
        }, 800);
      }
    }

    // Always cache the answer and evaluation for display
    setCachedAnswers((prev) =>
      new Map(prev).set(sectionIndex, { answer, evaluation, skill })
    );
  };

  const handleNext = () => {
    if (currentParagraph < paragraphs.length - 1) {
      scrollToParagraph(currentParagraph + 1);
    }
  };

  const handleBack = () => {
    if (currentParagraph > 0) {
      scrollToParagraph(currentParagraph - 1);
    }
  };

  const resetQuizState = () => {
    // Reset all quiz-related state
    setCurrentParagraph(0);
    setAnsweredSections(new Set());
    setCorrectAnswers(0);
    setShowCompletion(false);
    setAnsweredQuestions([]);
    setCachedQuestions(new Map());
    setCachedAnswers(new Map());
    setSectionCorrectness(new Map());
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRestart = () => {
    // Restart with the same passage
    resetQuizState();
  };

  const calculateSkillStats = (): SkillStats => {
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
  };

  const handleTryNewPassage = async (difficulty: DifficultyLevel) => {
    setIsGeneratingPassage(true);

    try {
      // Calculate skill stats for adaptive learning
      const skillStats = calculateSkillStats();

      const response = await fetch("/api/generate-passage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          difficulty,
          referenceLength: currentPassage.content.length,
          skillStats,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate passage");
      }

      const data: GeneratePassageResponse = await response.json();

      // Create new passage object
      const newPassage: Passage = {
        id: `passage-${Date.now()}`,
        title: data.title,
        content: data.content,
        difficulty: data.difficulty,
      };

      // Update passage and reset all state
      setCurrentPassage(newPassage);
      resetQuizState();
    } catch (error) {
      console.error("Error generating passage:", error);
      alert("Failed to generate a new passage. Please try again.");
    } finally {
      setIsGeneratingPassage(false);
    }
  };

  // Check if current section is answered
  const currentSectionAnswered = answeredSections.has(currentParagraph);

  return (
    <div className="relative min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-teal-500">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800 sm:text-2xl md:text-3xl">
                  {currentPassage.title}
                </h1>
                {/* View Full Passage Button */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2 rounded-lg border-2 border-blue-200 bg-blue-50 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="View full passage"
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span>View Full Passage</span>
                </button>
              </div>
            </div>

            {/* Score Display */}
            {!showCompletion && (
              <div className="rounded-lg bg-blue-50 px-2.5 py-1.5 sm:px-4 sm:py-2.5">
                <p className="text-xs sm:text-sm font-semibold text-blue-600">
                  {correctAnswers} / {paragraphs.length}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Passage Modal */}
      <PassageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentPassage.title}
        content={currentPassage.content}
      />

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-12 pb-24 lg:pb-12">
        {showCompletion ? (
          <CompletionScreen
            correctAnswers={correctAnswers}
            totalQuestions={paragraphs.length}
            answeredQuestions={answeredQuestions}
            onRestart={handleRestart}
            onTryNewPassage={handleTryNewPassage}
            isGeneratingPassage={isGeneratingPassage}
          />
        ) : (
          <div className="space-y-16">
            {paragraphs.map((paragraph, index) => (
              <div key={index}>
                <ReadingCard
                  ref={(el) => {
                    paragraphRefs.current[index] = el;
                  }}
                  paragraph={paragraph}
                  sectionNumber={index + 1}
                  isActive={currentParagraph === index}
                  isAnswered={answeredSections.has(index)}
                  isCorrect={sectionCorrectness.get(index)}
                />

                {/* Show QuestionBox only for current section */}
                {currentParagraph === index && (
                  <div className="mt-8">
                    <QuestionBox
                      paragraph={paragraph}
                      fullPassage={currentPassage.content}
                      passageTitle={currentPassage.title}
                      sectionNumber={index + 1}
                      cachedQuestion={cachedQuestions.get(index)?.question}
                      cachedSkill={cachedQuestions.get(index)?.skill}
                      cachedAnswerData={cachedAnswers.get(index)}
                      isLastSection={index === paragraphs.length - 1}
                      prioritizeSkills={getPrioritizedSkills()}
                      onQuestionGenerated={(question, skill) =>
                        handleQuestionGenerated(index, question, skill)
                      }
                      onAnswered={(isCorrect, answer, evaluation, skill) =>
                        handleQuestionAnswered(
                          index,
                          isCorrect,
                          answer,
                          evaluation,
                          skill
                        )
                      }
                      onNext={handleNext}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Fixed Right Sidebar Navigation - Desktop Only */}
      <aside className="fixed right-6 top-1/2 z-20 -translate-y-1/2 hidden lg:block">
        <div className="flex flex-col items-center space-y-4">
          {/* Up Button */}
          <button
            onClick={handleBack}
            disabled={currentParagraph === 0}
            className={`group flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
              currentParagraph === 0
                ? "cursor-not-allowed bg-stone-200"
                : "bg-white hover:scale-110 hover:bg-blue-600 hover:shadow-xl"
            }`}
            aria-label="Previous section"
          >
            <ChevronUp
              className={`h-6 w-6 transition-colors ${
                currentParagraph === 0
                  ? "text-stone-400"
                  : "text-gray-800 group-hover:text-white"
              }`}
              strokeWidth={2.5}
            />
          </button>

          {/* Progress Indicators */}
          <div className="flex flex-col items-center space-y-3 py-2">
            {paragraphs.map((_, index) => {
              const isAnswered = answeredSections.has(index);
              const isCorrect = sectionCorrectness.get(index);

              return (
                <button
                  key={index}
                  onClick={() => scrollToParagraph(index)}
                  className="group relative flex items-center"
                  aria-label={`Go to section ${index + 1}`}
                >
                  {/* Dot */}
                  <div
                    className={`h-3 w-3 rounded-full transition-all duration-300 ${
                      index === currentParagraph
                        ? "scale-150 bg-blue-600"
                        : isAnswered
                        ? isCorrect
                          ? "bg-green-500"
                          : "bg-rose-500"
                        : "bg-stone-300"
                    }`}
                  />
                  {/* Label on hover */}
                  <div className="pointer-events-none absolute right-5 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    Section {index + 1}
                    <div className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1/2 rotate-45 bg-gray-800" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Down Button */}
          <button
            onClick={handleNext}
            disabled={
              currentParagraph === paragraphs.length - 1 ||
              !currentSectionAnswered
            }
            className={`group flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
              currentParagraph === paragraphs.length - 1 ||
              !currentSectionAnswered
                ? "cursor-not-allowed bg-stone-200"
                : "bg-white hover:scale-110 hover:bg-blue-600 hover:shadow-xl"
            }`}
            aria-label="Next section"
          >
            <ChevronDown
              className={`h-6 w-6 transition-colors ${
                currentParagraph === paragraphs.length - 1 ||
                !currentSectionAnswered
                  ? "text-stone-400"
                  : "text-gray-800 group-hover:text-white"
              }`}
              strokeWidth={2.5}
            />
          </button>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <div className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 lg:hidden">
        <button
          onClick={handleBack}
          disabled={currentParagraph === 0}
          className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
            currentParagraph === 0
              ? "cursor-not-allowed bg-stone-200"
              : "bg-white active:scale-95 hover:bg-blue-600"
          }`}
          aria-label="Previous section"
        >
          <ChevronUp
            className={`h-6 w-6 sm:h-7 sm:w-7 ${
              currentParagraph === 0
                ? "text-stone-400"
                : "text-gray-800"
            }`}
            strokeWidth={2.5}
          />
        </button>

        <ProgressIndicator
          current={currentParagraph + 1}
          total={paragraphs.length}
        />

        <button
          onClick={handleNext}
          disabled={
            currentParagraph === paragraphs.length - 1 ||
            !currentSectionAnswered
          }
          className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
            currentParagraph === paragraphs.length - 1 ||
            !currentSectionAnswered
              ? "cursor-not-allowed bg-stone-200"
              : "bg-white active:scale-95 hover:bg-blue-600"
          }`}
          aria-label="Next section"
        >
          <ChevronDown
            className={`h-6 w-6 sm:h-7 sm:w-7 ${
              currentParagraph === paragraphs.length - 1 ||
              !currentSectionAnswered
                ? "text-stone-400"
                : "text-gray-800"
            }`}
            strokeWidth={2.5}
          />
        </button>
      </div>
    </div>
  );
}
