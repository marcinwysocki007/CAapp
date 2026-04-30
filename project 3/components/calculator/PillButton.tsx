"use client";

import { cn } from "@/lib/utils";

interface PillButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export function PillButton({ label, selected, onClick, className }: PillButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative px-6 py-4 md:px-8 md:py-5 rounded-xl border-2 transition-all duration-200 font-medium text-base md:text-lg",
        "hover:border-[#708A95]/40",
        selected
          ? "border-[#708A95] bg-[#E8EEF1] text-[#3D3D3D]"
          : "border-[#E5E3DF] bg-white text-[#3D3D3D]",
        className
      )}
      type="button"
    >
      <span className="flex items-center justify-center gap-2">
        {label}
      </span>
    </button>
  );
}
