interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  return (
    <div className="rounded-full bg-white px-4 py-2 sm:px-5 sm:py-3 shadow-lg">
      <span className="text-xs sm:text-sm font-semibold text-gray-800">
        {current} / {total}
      </span>
    </div>
  );
}
