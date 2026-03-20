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
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          {completedLessons}/{totalLessons} lessons completed
        </span>
        <span className="font-semibold text-white">{Math.round(percentage)}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
      </div>
    </div>
  );
}
