"use client";

import Image from "next/image";
import { Phone, Mail } from "lucide-react";

export function PersonalContact() {
  return (
    <div className="bg-gradient-to-br from-[#F8F7F5] to-white rounded-xl p-6 border border-[#E5E3DF] shadow-sm hover:shadow-md transition-shadow duration-200">
      <h3 className="text-center text-lg md:text-xl font-bold text-[#3D3D3D] mb-4">Kann ich helfen?</h3>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#A89279]">
          <Image
            src="/images/ilka-wysocki_pm-mallorca.webp"
            alt="Ilka Wysocki"
            width={96}
            height={96}
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0 text-center md:text-left">
          <p className="font-bold text-[#3D3D3D] text-lg md:text-xl mb-3">Ilka Wysocki</p>
          <div className="flex flex-col gap-2">
            <a
              href="tel:+4989200000830"
              className="inline-flex items-center justify-center md:justify-start gap-2 text-[#708A95] hover:text-[#62808A] transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-[#708A95] group-hover:bg-[#62808A] flex items-center justify-center transition-colors">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg md:text-xl">089 200 000 830</span>
            </a>
            <a
              href="mailto:info@primundus.de"
              className="inline-flex items-center justify-center md:justify-start gap-2 text-[#8B7355] hover:text-[#6D5A42] transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-[#8B7355] group-hover:bg-[#6D5A42] flex items-center justify-center transition-colors">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-base md:text-lg">info@primundus.de</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
