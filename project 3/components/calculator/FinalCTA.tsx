'use client';

export function FinalCTA() {
  const scrollToCalculator = () => {
    // Scroll to top of page where the wizard/form is located
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <section className="py-16 px-5 bg-[#8B7355]">
      <div className="max-w-[640px] mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-[26px] leading-[1.25] font-bold text-white mb-2">
            Jetzt Kosten prüfen –<br />kostenlos & unverbindlich
          </h2>
          <p className="text-base text-white/90 leading-relaxed mb-7">
            In 2 Minuten wissen Sie, was 24-Stunden-Pflege für Ihre Situation kostet. Inkl. Finanzierungsmöglichkeiten.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <button
            onClick={scrollToCalculator}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#E76F63] hover:bg-[#D65E52] text-white rounded-full text-base md:text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Betreuung anfragen
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="flex items-center gap-2 text-white/90">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span className="text-[15px] font-medium">100% kostenfrei & unverbindlich</span>
          </div>

          <div className="w-full max-w-[480px] border-t border-white/20 my-2"></div>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-white/70 text-[14px] mb-1">Oder rufen Sie uns an:</p>
              <a
                href="tel:+4989200000830"
                className="text-white text-[22px] font-bold hover:text-white/90 transition-colors"
              >
                089 200 000 830
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
