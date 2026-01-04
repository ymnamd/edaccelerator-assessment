"use client";

import { useEffect } from "react";

interface PassageModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export function PassageModal({
  isOpen,
  onClose,
  title,
  content,
}: PassageModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const paragraphs = content.split("\n\n").filter((p) => p.trim().length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-stone-200 bg-white px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-teal-500">
                <svg
                  className="h-5 w-5 sm:h-6 sm:w-6 text-white"
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
              <h2 className="text-base font-bold text-gray-800 sm:text-xl lg:text-2xl">
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-colors hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
              aria-label="Close modal"
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600"
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
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 lg:p-8" style={{ maxHeight: "calc(85vh - 80px)" }}>
          <div className="space-y-5 sm:space-y-6">
            {paragraphs.map((paragraph, index) => (
              <div key={index} className="group">
                <div className="mb-2 inline-block rounded-md bg-blue-50 px-2.5 py-0.5 sm:px-3 sm:py-1">
                  <span className="text-xs sm:text-sm font-semibold text-blue-600">
                    Section {index + 1}
                  </span>
                </div>
                <p className="text-base leading-relaxed text-gray-800 sm:text-lg">
                  {paragraph}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
