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
      className={[
        "relative grid place-items-center",
        compact ? "h-10 w-10 flex-[0_0_40px]" : "h-13 w-13",
      ].join(" ")}
      role="img"
      aria-label={ariaLabel}
    >
      {/* Visible disc — sits behind the SVG arc; fills the arc's inner circle
          so complete/incomplete share the same circle without a dark rim. */}
      <div
        aria-hidden="true"
        className={[
          "bg-background absolute inset-[3.472%] rounded-full [transition:background-color_220ms_ease-out]",
          compact ? "" : "shadow-[0_8px_22px_oklch(0_0_0/28%)]",
        ].join(" ")}
      />

      {/* Arc track + progress value */}
      <svg
        viewBox="0 0 36 36"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full -rotate-90"
      >
        <circle
          className="stroke-muted fill-none stroke-[2.5]"
          cx="18"
          cy="18"
          r="15.5"
          pathLength="100"
        />
        <circle
          className={[
            "stroke-primary fill-none stroke-[2.5] [stroke-linecap:round]",
            compact
              ? "transition-none"
              : "[transition:stroke-dashoffset_280ms_ease-out] motion-reduce:transition-none",
          ].join(" ")}
          cx="18"
          cy="18"
          r="15.5"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={100 - progressPercent}
        />
      </svg>

      {/* Step counter — fades out when complete */}
      <span
        className={[
          "text-foreground relative z-1 leading-tight font-bold",
          compact
            ? "text-[10px] transition-none"
            : "ease text-xs transition-[opacity,transform] duration-150 motion-reduce:transition-none",
          isComplete ? "scale-50 opacity-0" : "",
        ].join(" ")}
      >
        {completed}/{total}
      </span>

      {/* Checkmark — pops in when complete (suppressed in compact list rows) */}
      <Check
        aria-hidden="true"
        className={[
          "absolute inset-0 m-auto",
          compact
            ? "h-4.5 w-4.5 transition-none"
            : "ease h-6 w-6 transition-[opacity,transform] duration-150 motion-reduce:transition-none",
          isComplete
            ? [
                "text-foreground scale-100 opacity-100",
                !compact
                  ? "animate-progress-check-pop motion-reduce:animate-none"
                  : "",
              ].join(" ")
            : "text-primary-foreground scale-50 opacity-0",
        ].join(" ")}
      />
    </div>
  );
}
