import { forwardRef } from "react";

interface ReadingCardProps {
  paragraph: string;
  sectionNumber: number;
  isActive: boolean;
  isAnswered?: boolean;
  isCorrect?: boolean;
}

export const ReadingCard = forwardRef<HTMLDivElement, ReadingCardProps>(
  ({ paragraph, sectionNumber, isActive, isAnswered, isCorrect }, ref) => {
    // Determine background color based on answer state
    const getBackgroundColor = () => {
      if (!isAnswered || isActive) return "bg-white";
      return isCorrect ? "bg-green-50/50" : "bg-rose-50/50";
    };

    const getRingColor = () => {
      if (!isAnswered || isActive) return "ring-stone-200";
      return isCorrect ? "ring-green-200" : "ring-rose-200";
    };

    return (
      <div
        ref={ref}
        className={`transition-all duration-500 ${
          isActive ? "opacity-100" : "opacity-40"
        }`}
      >
        <div className={`mx-auto max-w-3xl rounded-2xl p-8 shadow-sm ring-1 sm:p-10 ${getBackgroundColor()} ${getRingColor()}`}>
          <div className="mb-4 inline-block rounded-md bg-blue-50 px-3 py-1">
            <span className="text-sm font-semibold text-blue-600">
              Section {sectionNumber}
            </span>
          </div>
          <p className="text-lg leading-relaxed text-gray-800 sm:text-xl">
            {paragraph}
          </p>
        </div>
      </div>
    );
  }
);

ReadingCard.displayName = "ReadingCard";
