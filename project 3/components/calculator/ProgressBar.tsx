"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  step: 1 | 2 | 3;
  label?: string;
  completedLabel?: string;
}

export function ProgressBar({ step, label, completedLabel }: ProgressBarProps) {
  const progress = step === 1 ? 33.33 : step === 2 ? 66.66 : 100;
  const isComplete = step === 3;

  return (
    <div className="w-full px-5 py-4 border-b border-[#E5E3DF]">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold text-[#8B8B8B] tracking-wide uppercase">
          {label || `Schritt ${step} von 3`}
        </span>
        {isComplete && completedLabel && (
          <span className="text-xs font-bold text-[#8B7355] tracking-wide uppercase">
            {completedLabel}
          </span>
        )}
      </div>
      <div className="w-full h-2 bg-[#E5E3DF] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#5A7380] to-[#4A616D]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
