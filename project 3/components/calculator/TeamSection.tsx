export function TeamSection() {
  return (
    <section id="team" className="scroll-mt-20 py-14 px-5 bg-[#F8F7F5]">
      <div className="max-w-[560px] md:max-w-[700px] lg:max-w-[900px] mx-auto">
        <p className="text-xs font-bold uppercase tracking-wider text-[#A89279] mb-2">
          Persönlich für Sie da
        </p>
        <h2 className="text-[26px] md:text-[32px] lg:text-[38px] leading-[1.25] font-bold text-[#3D3D3D] mb-3">
          Das Team hinter Primundus
        </h2>
        <p className="text-base text-[#5A5A5A] leading-relaxed mb-8">
          Seit über 20 Jahren vermitteln wir Betreuungskräfte für Familien in ganz Deutschland. Hinter jedem Angebot stehen echte Menschen, die Ihre Situation verstehen.
        </p>

        <div className="rounded-2xl overflow-hidden">
          <img
            src="/images/Teamblid-Primundus-Mallorca.webp"
            alt="Das Primundus Team auf Mallorca"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </section>
  );
}
