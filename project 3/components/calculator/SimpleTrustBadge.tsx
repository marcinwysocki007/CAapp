"use client";

import { CheckCircle2 } from "lucide-react";

export function SimpleTrustBadge() {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      <div className="flex items-center gap-1.5 text-sm text-[#3D3D3D]">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        <span className="font-medium">100% kostenfrei & unverbindlich</span>
      </div>
    </div>
  );
}
