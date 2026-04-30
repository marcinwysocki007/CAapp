"use client";

import { useCalculator } from "@/lib/calculator-context";

const labels = {
  patientCount: {
    '1-person': '1 Person',
    'ehepaar': 'Ehepaar',
  },
  pflegegrad: {
    '0': 'Kein Pflegegrad',
    '1': 'Pflegegrad 1',
    '2': 'Pflegegrad 2',
    '3': 'Pflegegrad 3',
    '4': 'Pflegegrad 4',
    '5': 'Pflegegrad 5',
  },
  mobility: {
    'mobil': 'Mobil',
    'rollator': 'Rollator',
    'rollstuhl': 'Rollstuhl',
    'bettlaegerig': 'Bettlägerig',
  },
  experience: {
    'einsteiger': 'Einsteiger',
    'erfahren': 'Erfahren',
    'sehr-erfahren': 'Sehr erfahren',
  },
};

export function SituationSummary() {
  const { state } = useCalculator();

  const summaryItems: string[] = [];

  if (state.patientCount && labels.patientCount[state.patientCount]) {
    summaryItems.push(labels.patientCount[state.patientCount]);
  }

  if (state.pflegegrad && labels.pflegegrad[state.pflegegrad]) {
    summaryItems.push(labels.pflegegrad[state.pflegegrad]);
  }

  if (state.mobility && labels.mobility[state.mobility]) {
    summaryItems.push(labels.mobility[state.mobility]);
  }

  if (state.experience && labels.experience[state.experience]) {
    summaryItems.push(`${labels.experience[state.experience]} Pflegekraft`);
  }

  return (
    <p className="text-sm text-[#5D5D5D] leading-relaxed">
      {summaryItems.length > 0 ? summaryItems.join(' • ') : 'Berechnung basierend auf Ihren Angaben'}
    </p>
  );
}
