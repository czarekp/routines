"use client";

import { Check } from "lucide-react";

export function ProgressRing({
  completed,
  total,
  ariaLabel,
  compact = false,
}: {
  completed: number;
  total: number;
  ariaLabel: string;
  compact?: boolean;
}) {
  const progressPercent =
    total === 0 ? 0 : Math.round((completed / total) * 100);
  const isComplete = total > 0 && completed >= total;

  return (
    <div
      className={`routine-progress-ring ${compact ? "routine-progress-ring-compact" : ""} ${isComplete ? "routine-progress-ring-complete" : ""}`}
      role="img"
      aria-label={ariaLabel}
    >
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle
          className="routine-progress-track"
          cx="18"
          cy="18"
          r="15.5"
          pathLength="100"
        />
        <circle
          className="routine-progress-value"
          cx="18"
          cy="18"
          r="15.5"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={100 - progressPercent}
        />
      </svg>
      <span className="routine-progress-count">
        {completed}/{total}
      </span>
      <Check className="routine-progress-check" aria-hidden="true" />
    </div>
  );
}
