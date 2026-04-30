"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Topbar } from "@/components/calculator/Topbar";
import { ProgressBar } from "@/components/calculator/ProgressBar";
import { ChoiceCard } from "@/components/calculator/ChoiceCard";
import { PillButton } from "@/components/calculator/PillButton";
import { PrimaryCTA } from "@/components/calculator/PrimaryCTA";
import { PersonalContact } from "@/components/calculator/PersonalContact";
import { useCalculator } from "@/lib/calculator-context";
import { Shield, CircleCheck as CheckCircle2, Clock, Star, ArrowLeft, ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { state, updateState } = useCalculator();
  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 5;

  const isStep1Complete = Boolean(state.patientCount);
  const isStep2Complete = Boolean(state.householdOthers);
  const isStep3Complete = Boolean(state.pflegegrad !== null);
  const isStep4Complete = Boolean(state.mobility);
  const isStep5Complete = Boolean(state.nightCare);
  const isAllComplete = isStep1Complete && isStep2Complete && isStep3Complete && isStep4Complete && isStep5Complete;

  const handlePatientCountChange = (value: string) => {
    updateState({ patientCount: value as any });
  };

  const handleHouseholdOthersChange = (value: string) => {
    updateState({ householdOthers: value as any });
  };

  const handlePflegegradChange = (value: string) => {
    updateState({ pflegegrad: value as any });
  };

  const handleMobilityChange = (value: string, lifting: string) => {
    updateState({ mobility: value as any, lifting: lifting as any });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (isAllComplete) {
      router.push('/step-2');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push('/');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return isStep1Complete;
      case 2: return isStep2Complete;
      case 3: return isStep3Complete;
      case 4: return isStep4Complete;
      case 5: return isStep5Complete;
      default: return false;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Wie viele Personen sind zu betreuen?";
      case 2: return "Befindet sich eine weitere Person mit im Haushalt?";
      case 3: return "Vorhandener Pflegegrad?";
      case 4: return "Mobilität";
      case 5: return "Nachteinsätze";
      default: return "";
    }
  };

  const getStepSubtext = () => {
    switch (currentStep) {
      case 2: return "Person, die mit im Haushalt lebt aber nicht betreut werden muss (z.B. Ehepartner).";
      case 3: return "Falls unbekannt, bitte schätzen.";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F5] pb-8">
      <Topbar onBack={() => router.push('/')} />
      <ProgressBar step={2} />

      <main className="w-full max-w-[600px] mx-auto px-4 py-6">
        <div className="bg-gradient-to-br from-[#E8B4A8]/20 via-white to-white rounded-2xl shadow-xl border-2 border-[#E5E3DF] overflow-hidden">
          <div className="px-5 md:px-8 py-5 border-b-2 border-[#E5E3DF] text-center bg-gradient-to-br from-[#E8B4A8]/30 to-transparent">
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#8B8B8B] mb-2">
              Betreuung unverbindlich anfragen!
            </p>
            <h2 className="text-lg md:text-xl font-bold text-[#3D3D3D] mb-3">
              Ihr kostenfreies Angebot in nur <span className="text-[#E76F63]">2 Minuten</span>
            </h2>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-1.5 bg-[#708A95] rounded-full" style={{ width: `${(currentStep / totalSteps) * 100}%`, minWidth: '10%' }}></div>
              <div className="h-1.5 bg-[#E5E3DF] rounded-full flex-1"></div>
            </div>
            <p className="text-xs text-[#8B8B8B]">Schritt {currentStep} / {totalSteps}</p>
          </div>

          <div className="px-5 md:px-8 py-6 md:py-8 min-h-[320px] flex flex-col justify-center">
            <div className="w-full">
              <h3 className="text-xl md:text-2xl font-bold text-[#3D3D3D] mb-1 text-center leading-tight">
                {getStepTitle()} <span className="text-[#E76F63]">*</span>
              </h3>
              {getStepSubtext() && (
                <p className="text-xs md:text-sm text-[#8B8B8B] mb-5 text-center italic">
                  {getStepSubtext()}
                </p>
              )}

              <div className="mt-5">
                {currentStep === 1 && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handlePatientCountChange('1-person')}
                      className={`relative rounded-xl p-4 border-2 transition-all duration-200 ${
                        state.patientCount === '1-person'
                          ? 'border-[#8B7355] bg-[#8B7355]/5 shadow-lg ring-2 ring-[#8B7355]/30'
                          : 'border-[#E5E3DF] bg-white hover:border-[#8B7355]/50 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          state.patientCount === '1-person' ? 'bg-[#8B7355]' : 'bg-[#F8F7F5]'
                        }`}>
                          <svg className={`w-6 h-6 ${state.patientCount === '1-person' ? 'text-white' : 'text-[#3D3D3D]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="text-base font-bold text-[#3D3D3D]">1 Person</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handlePatientCountChange('ehepaar')}
                      className={`relative rounded-xl p-4 border-2 transition-all duration-200 ${
                        state.patientCount === 'ehepaar'
                          ? 'border-[#8B7355] bg-[#8B7355]/5 shadow-lg ring-2 ring-[#8B7355]/30'
                          : 'border-[#E5E3DF] bg-white hover:border-[#8B7355]/50 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          state.patientCount === 'ehepaar' ? 'bg-[#8B7355]' : 'bg-[#F8F7F5]'
                        }`}>
                          <svg className={`w-6 h-6 ${state.patientCount === 'ehepaar' ? 'text-white' : 'text-[#3D3D3D]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <span className="text-base font-bold text-[#3D3D3D]">2 Personen</span>
                      </div>
                    </button>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleHouseholdOthersChange('ja')}
                      className={`relative rounded-xl p-4 border-2 transition-all duration-200 ${
                        state.householdOthers === 'ja'
                          ? 'border-[#8B7355] bg-[#8B7355]/5 shadow-lg ring-2 ring-[#8B7355]/30'
                          : 'border-[#E5E3DF] bg-white hover:border-[#8B7355]/50 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          state.householdOthers === 'ja' ? 'bg-[#8B7355]' : 'bg-[#F8F7F5]'
                        }`}>
                          <CheckCircle2 className={`w-6 h-6 ${state.householdOthers === 'ja' ? 'text-white' : 'text-[#3D3D3D]'}`} />
                        </div>
                        <span className="text-base font-bold text-[#3D3D3D]">Ja</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleHouseholdOthersChange('nein')}
                      className={`relative rounded-xl p-4 border-2 transition-all duration-200 ${
                        state.householdOthers === 'nein'
                          ? 'border-[#8B7355] bg-[#8B7355]/5 shadow-lg ring-2 ring-[#8B7355]/30'
                          : 'border-[#E5E3DF] bg-white hover:border-[#8B7355]/50 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          state.householdOthers === 'nein' ? 'bg-[#8B7355]' : 'bg-[#F8F7F5]'
                        }`}>
                          <svg className={`w-6 h-6 ${state.householdOthers === 'nein' ? 'text-white' : 'text-[#3D3D3D]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <span className="text-base font-bold text-[#3D3D3D]">Nein</span>
                      </div>
                    </button>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="grid grid-cols-3 gap-2.5">
                    {['0', '1', '2', '3', '4', '5'].map((grad) => (
                      <button
                        key={grad}
                        onClick={() => handlePflegegradChange(grad)}
                        className={`relative rounded-lg p-3.5 border-2 transition-all duration-200 ${
                          state.pflegegrad === grad
                            ? 'border-[#8B7355] bg-[#8B7355]/5 shadow-lg ring-2 ring-[#8B7355]/30'
                            : 'border-[#E5E3DF] bg-white hover:border-[#8B7355]/50 hover:shadow-md'
                        }`}
                      >
                        <span className={`text-xl font-bold ${state.pflegegrad === grad ? 'text-[#8B7355]' : 'text-[#3D3D3D]'}`}>
                          {grad}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      onClick={() => handleMobilityChange('mobil', 'nein')}
                      className={`relative rounded-lg p-3.5 border-2 transition-all duration-200 text-center ${
                        state.mobility === 'mobil'
                          ? 'border-[#8B7355] bg-[#8B7355]/5 shadow-lg ring-2 ring-[#8B7355]/30'
                          : 'border-[#E5E3DF] bg-white hover:border-[#8B7355]/50 hover:shadow-md'
                      }`}
                    >
                      <span className="text-sm md:text-base font-semibold text-[#3D3D3D]">Mobil – geht selbstständig</span>
                    </button>
                    <button
                      onClick={() => handleMobilityChange('rollator', 'nein')}
                      className={`relative rounded-lg p-3.5 border-2 transition-all duration-200 text-center ${
                        state.mobility === 'rollator'
                          ? 'border-[#8B7355] bg-[#8B7355]/5 shadow-lg ring-2 ring-[#8B7355]/30'
                          : 'border-[#E5E3DF] bg-white hover:border-[#8B7355]/50 hover:shadow-md'
                      }`}
                    >
                      <span className="text-sm md:text-base font-semibold text-[#3D3D3D]">Eingeschränkt – nur mit Rollator</span>
                    </button>
                    <button
                      onClick={() => handleMobilityChange('rollstuhl', 'nein')}
                      className={`relative rounded-lg p-3.5 border-2 transition-all duration-200 text-center ${
                        state.mobility === 'rollstuhl'
                          ? 'border-[#8B7355] bg-[#8B7355]/5 shadow-lg ring-2 ring-[#8B7355]/30'
                          : 'border-[#E5E3DF] bg-white hover:border-[#8B7355]/50 hover:shadow-md'
                      }`}
                    >
                      <span className="text-sm md:text-base font-semibold text-[#3D3D3D]">Auf Rollstuhl angewiesen</span>
                    </button>
                    <button
                      onClick={() => handleMobilityChange('bettlaegerig', 'nein')}
                      className={`relative rounded-lg p-3.5 border-2 transition-all duration-200 text-center ${
                        state.mobility === 'bettlaegerig'
                          ? 'border-[#8B7355] bg-[#8B7355]/5 shadow-lg ring-2 ring-[#8B7355]/30'
                          : 'border-[#E5E3DF] bg-white hover:border-[#8B7355]/50 hover:shadow-md'
                      }`}
                    >
                      <span className="text-sm md:text-base font-semibold text-[#3D3D3D]">Bettlägerig</span>
                    </button>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      onClick={() => updateState({ nightCare: 'nein' })}
                      className={`relative rounded-lg p-3.5 border-2 transition-all duration-200 text-center ${
                        state.nightCare === 'nein'
                          ? 'border-[#8B7355] bg-[#8B7355]/5 shadow-lg ring-2 ring-[#8B7355]/30'
                          : 'border-[#E5E3DF] bg-white hover:border-[#8B7355]/50 hover:shadow-md'
                      }`}
                    >
                      <span className="text-sm md:text-base font-semibold text-[#3D3D3D]">Nein</span>
                    </button>
                    <button
                      onClick={() => updateState({ nightCare: 'gelegentlich' })}
                      className={`relative rounded-lg p-3.5 border-2 transition-all duration-200 text-center ${
                        state.nightCare === 'gelegentlich'
                          ? 'border-[#8B7355] bg-[#8B7355]/5 shadow-lg ring-2 ring-[#8B7355]/30'
                          : 'border-[#E5E3DF] bg-white hover:border-[#8B7355]/50 hover:shadow-md'
                      }`}
                    >
                      <span className="text-sm md:text-base font-semibold text-[#3D3D3D]">Gelegentlich</span>
                    </button>
                    <button
                      onClick={() => updateState({ nightCare: 'taeglich' })}
                      className={`relative rounded-lg p-3.5 border-2 transition-all duration-200 text-center ${
                        state.nightCare === 'taeglich'
                          ? 'border-[#8B7355] bg-[#8B7355]/5 shadow-lg ring-2 ring-[#8B7355]/30'
                          : 'border-[#E5E3DF] bg-white hover:border-[#8B7355]/50 hover:shadow-md'
                      }`}
                    >
                      <span className="text-sm md:text-base font-semibold text-[#3D3D3D]">Täglich (1×)</span>
                    </button>
                    <button
                      onClick={() => updateState({ nightCare: 'mehrmals' })}
                      className={`relative rounded-lg p-3.5 border-2 transition-all duration-200 text-center ${
                        state.nightCare === 'mehrmals'
                          ? 'border-[#8B7355] bg-[#8B7355]/5 shadow-lg ring-2 ring-[#8B7355]/30'
                          : 'border-[#E5E3DF] bg-white hover:border-[#8B7355]/50 hover:shadow-md'
                      }`}
                    >
                      <span className="text-sm md:text-base font-semibold text-[#3D3D3D]">Mehrmals nachts</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-5 md:px-8 py-4 border-t-2 border-[#E5E3DF] bg-[#F8F7F5]/50">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2.5 font-semibold text-sm rounded-lg transition-all duration-200 border-2 border-[#708A95] text-[#708A95] hover:bg-[#708A95] hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline">Zurück</span>
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex items-center gap-1.5 px-6 py-2.5 font-semibold text-sm rounded-lg transition-all duration-200 ${
                  canProceed()
                    ? 'bg-[#E76F63] hover:bg-[#D65E52] text-white shadow-md hover:shadow-lg cursor-pointer'
                    : 'bg-[#E5E3DF] text-[#8B8B8B] cursor-not-allowed opacity-60'
                }`}
              >
                <span>{currentStep === totalSteps ? 'Weiter zum letzten Schritt' : 'Weiter'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 mt-3 text-xs">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#8B7355] flex-shrink-0" />
                <span className="font-medium text-[#3D3D3D]">SSL-Verschlüsselung</span>
              </div>
              <span className="text-[#E5E3DF]">•</span>
              <span className="font-medium text-[#3D3D3D]">DSGVO-Konform</span>
              <span className="text-[#E5E3DF]">•</span>
              <span className="font-medium text-[#3D3D3D]">Kostenfrei & unverbindlich</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
