"use client";

interface BootcampProgressBarProps {
  percentage: number;
  completedLessons: number;
  totalLessons: number;
  className?: string;
}

export function BootcampProgressBar({
  percentage,
  completedLessons,
  totalLessons,
  className = "",
}: BootcampProgressBarProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-gray-400">
          {completedLessons}/{totalLessons} steps
        </span>
        <span className="font-mono text-[11px] font-semibold text-blue-400">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
          style={{ width: `${Math.max(percentage, 0)}%` }}
        />
      </div>
    </div>
  );
}
