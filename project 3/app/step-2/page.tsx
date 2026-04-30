"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Topbar } from "@/components/calculator/Topbar";
import { ProgressBar } from "@/components/calculator/ProgressBar";
import { PillButton } from "@/components/calculator/PillButton";
import { PrimaryCTA } from "@/components/calculator/PrimaryCTA";
import { PersonalContact } from "@/components/calculator/PersonalContact";
import { useCalculator } from "@/lib/calculator-context";
import { Shield, CheckCircle2, Clock, Star } from "lucide-react";

export default function Step2Page() {
  const router = useRouter();
  const { state, updateState } = useCalculator();

  const experienceRef = useRef<HTMLDivElement>(null);
  const drivingRef = useRef<HTMLDivElement>(null);
  const genderRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const scrollToElement = (element: HTMLElement | null) => {
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  };

  const isStep2Complete = Boolean(
    state.germanLevel &&
    state.experience &&
    state.driving
  );

  const handleContinue = () => {
    if (isStep2Complete) {
      router.push('/result');
    }
  };

  const handleGermanLevelChange = (value: string) => {
    updateState({ germanLevel: value as any });
    scrollToElement(experienceRef.current);
  };

  const handleExperienceChange = (value: string) => {
    updateState({ experience: value as any });
    scrollToElement(drivingRef.current);
  };

  const handleDrivingChange = (value: string) => {
    updateState({ driving: value as any });
    scrollToElement(genderRef.current);
  };

  const handleGenderChange = (value: string) => {
    updateState({ gender: value as any });
    scrollToElement(ctaRef.current);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F5] pb-32">
      <Topbar onBack={() => router.push('/24h-pflege-kostenrechner')} />
      <ProgressBar step={3} />

      <main className="w-full max-w-[520px] md:max-w-[720px] mx-auto px-5 py-8">
        <div className="bg-white rounded-3xl shadow-md border border-[#E5E3DF] overflow-hidden mb-6">
          <div className="px-6 md:px-10 py-6 md:py-8 border-b border-[#E5E3DF] text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[#3D3D3D]">Wünsche an die Pflegekraft</h2>
            <p className="text-sm md:text-base text-[#8B8B8B] mt-2">Schritt 3 von 3</p>
          </div>

          <div className="px-6 md:px-10 py-8 md:py-12">
            <div className="space-y-12 max-w-md mx-auto">
            <div>
              <label className="block text-xl md:text-2xl font-bold text-[#3D3D3D] mb-6 text-center">
                Deutschkenntnisse
              </label>
              <div className="space-y-3">
                <PillButton
                  label="Grundlegend"
                  selected={state.germanLevel === 'grundlegend'}
                  onClick={() => handleGermanLevelChange('grundlegend')}
                  className="w-full"
                />
                <PillButton
                  label="Kommunikativ"
                  selected={state.germanLevel === 'kommunikativ'}
                  onClick={() => handleGermanLevelChange('kommunikativ')}
                  className="w-full"
                />
                <PillButton
                  label="Sehr gut"
                  selected={state.germanLevel === 'sehr-gut'}
                  onClick={() => handleGermanLevelChange('sehr-gut')}
                  className="w-full"
                />
              </div>
            </div>

            <div ref={experienceRef}>
              <label className="block text-xl md:text-2xl font-bold text-[#3D3D3D] mb-6 text-center">
                Erfahrung
              </label>
              <div className="space-y-3">
                <PillButton
                  label="Einsteiger (bis 2 Jahre)"
                  selected={state.experience === 'einsteiger'}
                  onClick={() => handleExperienceChange('einsteiger')}
                  className="w-full"
                />
                <PillButton
                  label="Erfahren (2-5 Jahre)"
                  selected={state.experience === 'erfahren'}
                  onClick={() => handleExperienceChange('erfahren')}
                  className="w-full"
                />
                <PillButton
                  label="Sehr erfahren (ab 5 Jahren)"
                  selected={state.experience === 'sehr-erfahren'}
                  onClick={() => handleExperienceChange('sehr-erfahren')}
                  className="w-full"
                />
              </div>
            </div>

            <div ref={drivingRef}>
              <label className="block text-xl md:text-2xl font-bold text-[#3D3D3D] mb-6 text-center">
                Führerschein
              </label>
              <div className="space-y-3">
                <PillButton
                  label="Egal"
                  selected={state.driving === 'egal'}
                  onClick={() => handleDrivingChange('egal')}
                  className="w-full"
                />
                <PillButton
                  label="Ja"
                  selected={state.driving === 'ja'}
                  onClick={() => handleDrivingChange('ja')}
                  className="w-full"
                />
                <PillButton
                  label="Nein"
                  selected={state.driving === 'nein'}
                  onClick={() => handleDrivingChange('nein')}
                  className="w-full"
                />
              </div>
            </div>

            <div ref={genderRef}>
              <label className="block text-xl md:text-2xl font-bold text-[#3D3D3D] mb-6 text-center">
                Geschlecht
              </label>
              <div className="space-y-3">
                <PillButton
                  label="Egal"
                  selected={state.gender === 'egal'}
                  onClick={() => handleGenderChange('egal')}
                  className="w-full"
                />
                <PillButton
                  label="Weiblich"
                  selected={state.gender === 'weiblich'}
                  onClick={() => handleGenderChange('weiblich')}
                  className="w-full"
                />
                <PillButton
                  label="Männlich"
                  selected={state.gender === 'maennlich'}
                  onClick={() => handleGenderChange('maennlich')}
                  className="w-full"
                />
              </div>
            </div>
            </div>
          </div>
        </div>

        <div className="mb-6 max-w-md mx-auto">
          <PersonalContact />
        </div>
      </main>

      <div ref={ctaRef} className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E3DF] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-10">
        <div className="w-full max-w-[520px] md:max-w-[720px] mx-auto px-5 py-4">
          <PrimaryCTA onClick={handleContinue} disabled={!isStep2Complete} variant="green">
            Betreuung prüfen
          </PrimaryCTA>
          <div className="flex items-center justify-center gap-2 mt-3">
            <svg className="w-4 h-4 text-green-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-[#3D3D3D]">100% kostenfrei & unverbindlich</span>
          </div>
        </div>
      </div>
    </div>
  );
}
