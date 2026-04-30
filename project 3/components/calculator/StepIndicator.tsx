"use client";

import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          className={cn(
            "h-1.5 rounded-full transition-all duration-500",
            step === currentStep
              ? "w-12 bg-[#8B7355]"
              : step < currentStep
              ? "w-8 bg-[#8B7355] opacity-50"
              : "w-8 bg-[#E5E3DF]"
          )}
        />
      ))}
    </div>
  );
}
