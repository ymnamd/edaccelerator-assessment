"use client";

import { useState, useRef } from "react";
import { passageData, getParagraphs } from "@/data/passage";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import {
  ReadingCard,
  ProgressIndicator,
  QuestionBox,
  PassageModal,
} from "@/components";

export default function Home() {
  const paragraphs = getParagraphs(passageData);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToParagraph = (index: number) => {
    setCurrentParagraph(index);
    paragraphRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
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

  return (
    <div className="relative min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500">
                <BookOpen className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
              <h1 className="text-xl font-bold text-gray-800 sm:text-2xl md:text-3xl">
                {passageData.title}
              </h1>
            </div>

            {/* View Full Passage Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border-2 border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-4 sm:py-2.5"
              aria-label="View full passage"
            >
              <svg
                className="h-5 w-5"
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
              <span className="hidden sm:inline">View Full Passage</span>
            </button>
          </div>
        </div>
      </header>

      {/* Passage Modal */}
      <PassageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={passageData.title}
        content={passageData.content}
      />

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-12 lg:px-12">
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
              />

              {/* Show QuestionBox only for current section */}
              {currentParagraph === index && (
                <div className="mt-8">
                  <QuestionBox
                    paragraph={paragraph}
                    fullPassage={passageData.content}
                    passageTitle={passageData.title}
                    sectionNumber={index + 1}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
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
            {paragraphs.map((_, index) => (
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
                      : index < currentParagraph
                      ? "bg-green-500"
                      : "bg-stone-300"
                  }`}
                />
                {/* Label on hover */}
                <div className="pointer-events-none absolute right-5 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  Section {index + 1}
                  <div className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1/2 rotate-45 bg-gray-800" />
                </div>
              </button>
            ))}
          </div>

          {/* Down Button */}
          <button
            onClick={handleNext}
            disabled={currentParagraph === paragraphs.length - 1}
            className={`group flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
              currentParagraph === paragraphs.length - 1
                ? "cursor-not-allowed bg-stone-200"
                : "bg-white hover:scale-110 hover:bg-blue-600 hover:shadow-xl"
            }`}
            aria-label="Next section"
          >
            <ChevronDown
              className={`h-6 w-6 transition-colors ${
                currentParagraph === paragraphs.length - 1
                  ? "text-stone-400"
                  : "text-gray-800 group-hover:text-white"
              }`}
              strokeWidth={2.5}
            />
          </button>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 lg:hidden">
        <button
          onClick={handleBack}
          disabled={currentParagraph === 0}
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
            currentParagraph === 0
              ? "cursor-not-allowed bg-stone-200"
              : "bg-white hover:scale-110 hover:bg-blue-600"
          }`}
          aria-label="Previous section"
        >
          <ChevronUp
            className={`h-7 w-7 ${
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
          disabled={currentParagraph === paragraphs.length - 1}
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
            currentParagraph === paragraphs.length - 1
              ? "cursor-not-allowed bg-stone-200"
              : "bg-white hover:scale-110 hover:bg-blue-600"
          }`}
          aria-label="Next section"
        >
          <ChevronDown
            className={`h-7 w-7 ${
              currentParagraph === paragraphs.length - 1
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
