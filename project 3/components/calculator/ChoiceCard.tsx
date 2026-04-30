"use client";

import { cn } from "@/lib/utils";
import { User, Users } from "lucide-react";

interface ChoiceCardProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
  icon?: string;
}

export function ChoiceCard({ label, selected, onClick, className, icon }: ChoiceCardProps) {
  const IconComponent = icon === 'couple' ? Users : User;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full px-6 py-8 md:px-8 md:py-10 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center font-semibold shadow-sm hover:shadow-md",
        "hover:border-[#708A95]/30",
        selected
          ? "border-[#708A95] bg-[#708A95]/5 text-[#3D3D3D] shadow-md ring-1 ring-[#708A95]/20"
          : "border-[#E5E3DF] bg-white text-[#3D3D3D]",
        className
      )}
      type="button"
    >
      <div className={cn(
        "w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 md:mb-5 transition-all duration-200",
        selected
          ? "bg-[#E5E3DF]"
          : "bg-[#F8F7F5]"
      )}>
        <IconComponent className={cn(
          "w-8 h-8 md:w-10 md:h-10 transition-colors duration-200",
          selected ? "text-[#3D3D3D]" : "text-[#8B8B8B]"
        )} />
      </div>
      <span className="text-base md:text-lg">{label}</span>
    </button>
  );
}
