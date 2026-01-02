import { forwardRef } from "react";

interface ReadingCardProps {
  paragraph: string;
  sectionNumber: number;
  isActive: boolean;
}

export const ReadingCard = forwardRef<HTMLDivElement, ReadingCardProps>(
  ({ paragraph, sectionNumber, isActive }, ref) => {
    return (
      <div
        ref={ref}
        className={`transition-all duration-500 ${
          isActive ? "opacity-100" : "opacity-40"
        }`}
      >
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200 sm:p-10">
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
