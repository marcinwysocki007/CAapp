"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Phone, Calculator, Check } from "lucide-react";
import Image from "next/image";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const features = [
    "Sofort konkreter Preis – keine versteckten Kosten",
    "Alle Zuschüsse & Förderungen aufgeschlüsselt",
    "Persönliche Beratung – kostenlos & unverbindlich"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="max-w-[580px] mx-auto bg-white rounded-3xl border-none shadow-2xl p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-8 pt-10 pb-6">
          <DialogTitle className="text-3xl font-bold text-[#1a1a1a] text-left leading-tight">
            Wie können wir helfen?
          </DialogTitle>
          <p className="text-[#666666] text-lg mt-3 leading-relaxed">
            Berechnen Sie in 2 Minuten Ihren individuellen Preis – transparent & unverbindlich.
          </p>
        </DialogHeader>

        <div className="px-8 pb-6 space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#E8E3DB] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-[#8B7355]" strokeWidth={3} />
              </div>
              <p className="text-[#1a1a1a] text-base leading-relaxed">
                {feature}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src="/images/ilka-wysocki_pm-mallorca.webp"
                alt="Ilka Wysocki"
                width={56}
                height={56}
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="font-bold text-[#1a1a1a] text-lg">Ilka Wysocki</p>
              <p className="text-[#666666] text-sm mb-2">Ihre persönliche Beraterin</p>
              <a
                href="tel:+4989200000830"
                className="flex items-center gap-2 text-[#8B7355] hover:text-[#7D6E5D] transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="font-semibold">089 200 000 830</span>
              </a>
            </div>
          </div>

          <a
            href="#calculator-form"
            onClick={() => onOpenChange(false)}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-[#8B7355] hover:bg-[#7D6E5D] text-white font-semibold text-base md:text-lg rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Calculator className="w-5 h-5" />
            <span>Betreuung anfragen</span>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
