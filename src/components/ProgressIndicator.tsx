interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  return (
    <div className="rounded-full bg-white px-5 py-3 shadow-lg">
      <span className="text-sm font-semibold text-gray-800">
        {current} / {total}
      </span>
    </div>
  );
}
