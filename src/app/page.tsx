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
import { useQuizState, usePassageGenerator } from "@/hooks";
import type { DifficultyLevel } from "@/types/api";

export default function Home() {
  // Passage state - starts with default bee passage, can be regenerated
  const [currentPassage, setCurrentPassage] = useState<Passage>(defaultPassageData);
  const paragraphs = getParagraphs(currentPassage);

  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Quiz state management hook
  const quizState = useQuizState();

  // Passage generation hook
  const { isGeneratingPassage, generateNewPassage } = usePassageGenerator();

  const scrollToParagraph = (index: number) => {
    setCurrentParagraph(index);
    
    // Use setTimeout to ensure state update completes before scrolling
    setTimeout(() => {
      const element = paragraphRefs.current[index];
      if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        // Offset for sticky header (approx 80px) + extra padding (40px) to show paragraph clearly
        const offsetPosition = elementPosition - 120;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 100);
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

  const handleRestart = () => {
    // Restart with the same passage
    setCurrentParagraph(0);
    quizState.resetQuizState();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTryNewPassage = async (difficulty: DifficultyLevel) => {
    const skillStats = quizState.calculateSkillStats();

    await generateNewPassage(difficulty, skillStats, (newPassage) => {
      setCurrentPassage(newPassage);
      setCurrentParagraph(0);
      quizState.resetQuizState();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  // Check if current section is answered
  const currentSectionAnswered = quizState.answeredSections.has(currentParagraph);

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
            {!quizState.showCompletion && (
              <div className="rounded-lg bg-blue-50 px-2.5 py-1.5 sm:px-4 sm:py-2.5">
                <p className="text-xs sm:text-sm font-semibold text-blue-600">
                  {quizState.correctAnswers} / {paragraphs.length}
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
        {quizState.showCompletion ? (
          <CompletionScreen
            correctAnswers={quizState.correctAnswers}
            totalQuestions={paragraphs.length}
            answeredQuestions={quizState.answeredQuestions}
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
                  isAnswered={quizState.answeredSections.has(index)}
                  isCorrect={quizState.sectionCorrectness.get(index)}
                />

                {/* Show QuestionBox only for current section */}
                {currentParagraph === index && (
                  <div className="mt-8">
                    <QuestionBox
                      paragraph={paragraph}
                      fullPassage={currentPassage.content}
                      passageTitle={currentPassage.title}
                      sectionNumber={index + 1}
                      cachedQuestion={quizState.cachedQuestions.get(index)?.question}
                      cachedSkill={quizState.cachedQuestions.get(index)?.skill}
                      cachedAnswerData={quizState.cachedAnswers.get(index)}
                      isLastSection={index === paragraphs.length - 1}
                      prioritizeSkills={quizState.getPrioritizedSkills()}
                      onQuestionGenerated={(question, skill) =>
                        quizState.handleQuestionGenerated(index, question, skill)
                      }
                      onAnswered={(isCorrect, answer, evaluation, skill) =>
                        quizState.handleQuestionAnswered(
                          index,
                          isCorrect,
                          answer,
                          evaluation,
                          skill,
                          paragraphs.length
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
              const isAnswered = quizState.answeredSections.has(index);
              const isCorrect = quizState.sectionCorrectness.get(index);
              // Only allow navigation to answered sections (green or red dots)
              const canNavigate = isAnswered;

              return (
                <button
                  key={index}
                  onClick={() => canNavigate && scrollToParagraph(index)}
                  disabled={!canNavigate}
                  className={`group relative flex items-center ${!canNavigate ? 'cursor-not-allowed' : ''}`}
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
