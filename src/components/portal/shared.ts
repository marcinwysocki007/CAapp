// Shared types + pure helpers for portal components.
// Extracted from pages/CustomerPortalPage.tsx monolith.

import type { Nurse } from '../../types';
import { NURSES } from '../../data/nurses';

// ─── Types ────────────────────────────────────────────────────────────────

export type AppStatus = 'new' | 'accepted' | 'declined';
export type NurseStatus = 'pending' | 'invited' | 'declined';

export interface OfferDetails {
  monatlicheKosten: number;
  anreisedatum: string;
  abreisedatum: string;
  anreisekosten: number;
  abreisekosten: number;
  reisetage: string;
  feiertagszuschlag: number;
  kuendigungsfrist: string;
  submittedAt: string;
}

export interface Application {
  id: string;
  nurse: Nurse;
  agencyName: string;
  appliedAt: string;
  status: AppStatus;
  message: string;
  offer: OfferDetails;
  isInvited?: boolean;
}

export interface NurseStatuses {
  [index: number]: NurseStatus;
}

// ─── Mock data (used when demo-mode, no token) ────────────────────────────

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: '1',
    nurse: NURSES[0],
    agencyName: 'CarePartner GmbH',
    appliedAt: 'vor 23 Min.',
    status: 'new',
    isInvited: true,
    message:
      'Anna hat 6 Jahre Erfahrung in der 24h-Betreuung und ist sofort einsatzbereit. Ihre Sprachkenntnisse auf B2-Niveau ermöglichen eine reibungslose Kommunikation.',
    offer: {
      monatlicheKosten: 2250,
      anreisedatum: '01.05.2026',
      abreisedatum: '12.07.2026',
      anreisekosten: 120,
      abreisekosten: 120,
      reisetage: 'Halb',
      feiertagszuschlag: 0,
      kuendigungsfrist: 'Täglich kündbar',
      submittedAt: '16.04.2026, 09:14',
    },
  },
  {
    id: '2',
    nurse: NURSES[1],
    agencyName: 'CareConnect Vermittlung',
    appliedAt: 'vor 1 Std.',
    status: 'new',
    message:
      'Marta bringt 8 Jahre Berufserfahrung mit und hat bereits ähnliche Patienten erfolgreich betreut. Sie kann flexibel und kurzfristig beginnen.',
    offer: {
      monatlicheKosten: 2150,
      anreisedatum: '01.05.2026',
      abreisedatum: '30.06.2026',
      anreisekosten: 140,
      abreisekosten: 140,
      reisetage: 'Halb',
      feiertagszuschlag: 75,
      kuendigungsfrist: 'Täglich kündbar',
      submittedAt: '16.04.2026, 08:31',
    },
  },
  {
    id: '3',
    nurse: NURSES[4],
    agencyName: 'Herz & Hand Pflegedienst',
    appliedAt: 'vor 2 Std.',
    status: 'new',
    message:
      'Katarzyna ist eine sehr erfahrene Pflegekraft mit 12 Jahren im Bereich 24h-Betreuung. Sie ist bei Patienten sehr beliebt.',
    offer: {
      monatlicheKosten: 2350,
      anreisedatum: '01.05.2026',
      abreisedatum: '30.06.2026',
      anreisekosten: 130,
      abreisekosten: 130,
      reisetage: 'Halb',
      feiertagszuschlag: 0,
      kuendigungsfrist: 'Täglich kündbar',
      submittedAt: '16.04.2026, 07:55',
    },
  },
];

export const MATCHED_NURSES: Nurse[] = NURSES.slice(2, 14).filter(
  (n) => !MOCK_APPLICATIONS.some((a) => a.nurse.name === n.name),
);

// ─── Helpers ──────────────────────────────────────────────────────────────

export function nurseLevel(assignments: number): {
  label: string;
  emoji: string;
  cls: string;
} {
  if (assignments >= 36) return { label: 'Platin',  emoji: '🏆', cls: 'bg-violet-50 text-violet-600 border-violet-200' };
  if (assignments >= 25) return { label: 'Gold',    emoji: '🥇', cls: 'bg-yellow-50 text-yellow-600 border-yellow-300' };
  if (assignments >= 15) return { label: 'Silber',  emoji: '🥈', cls: 'bg-slate-100 text-slate-500 border-slate-300' };
  if (assignments >= 8)  return { label: 'Bronze',  emoji: '🥉', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
  return                        { label: 'Starter', emoji: '⭐', cls: 'bg-gray-100 text-gray-500 border-gray-200' };
}

export function displayName(fullName: string): string {
  const parts = fullName.split(' ');
  return parts.map((p, i) => (i === parts.length - 1 ? `${p[0]}.` : p)).join(' ');
}

export function initials(fullName: string): string {
  return fullName
    .split(' ')
    .map((n) => n[0])
    .join('');
}

// ─── Nurse mock profile (for CustomerNurseModal when real data not fetched) ───

function seed(name: string): number {
  return name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
}

export function mockProfile(nurse: Nurse) {
  const s = seed(nurse.name);
  const hobbysPool = ['Kochen', 'Spazierengehen', 'Musik', 'Lesen', 'Gartenarbeit', 'Yoga', 'Handarbeiten', 'Backen'];
  const persPool = ['fürsorglich', 'geduldig', 'empathisch', 'zuverlässig', 'herzlich', 'ruhig', 'humorvoll', 'strukturiert'];
  const sprachenPool = [['Englisch'], ['Englisch', 'Russisch'], ['Ukrainisch'], ['Englisch', 'Ukrainisch'], ['Russisch']];
  const schwerpunktePool = [
    ['24h-Betreuung', 'Körperpflege', 'Demenzpflege', 'Medikamentengabe'],
    ['24h-Betreuung', 'Mobilisierung', 'Wundversorgung', 'Sturzprophylaxe'],
    ['24h-Betreuung', 'Palliativpflege', 'Ernährungsberatung', 'Körperpflege'],
    ['24h-Betreuung', 'Demenzpflege', 'Gedächtnisübungen', 'Beschäftigungstherapie'],
  ];
  const mobPool = [
    ['Mobil', 'Rollstuhl', 'Gehhilfe', 'Bettlägerig'],
    ['Mobil', 'Rollstuhl', 'Bettlägerig'],
    ['Mobil', 'Gehhilfe'],
    ['Alle'],
  ];
  const demenzPool = ['Keine', 'Leichtgradig', 'Mittelgradig', 'Leichtgradig'];
  const nachtPool = ['Ja', 'Gelegentlich', 'Nein', 'Unwichtig'];
  const unterbringungPool = ['Eigenes Zimmer', 'Eigenes Zimmer', 'Eigenes Bad', 'Eigenes Zimmer'];
  const urbanPool = ['Großstadt', 'Kleinstadt', 'Unwichtig', 'Großstadt'];
  const gewichtPool = ['51–60 kg', '61–70 kg', '61–70 kg', '71–80 kg', '51–60 kg'];
  const groessePool = ['151–160 cm', '161–170 cm', '161–170 cm', '161–170 cm', '151–160 cm'];

  return {
    schwerpunkte: schwerpunktePool[s % schwerpunktePool.length],
    nationalitaet: 'Polnisch',
    geburtsjahr: String(2026 - nurse.age),
    gewicht: gewichtPool[s % gewichtPool.length],
    groesse: groessePool[s % groessePool.length],
    hobbys: [hobbysPool[s % hobbysPool.length], hobbysPool[(s + 2) % hobbysPool.length], hobbysPool[(s + 4) % hobbysPool.length]],
    persoenlichkeit: [persPool[s % persPool.length], persPool[(s + 1) % persPool.length], persPool[(s + 3) % persPool.length], persPool[(s + 5) % persPool.length]],
    fuehrerschein: s % 3 !== 0,
    raucher: s % 4 === 0 ? 'Ja, draußen' : 'Nein',
    pflegeberuf: s % 2 === 0,
    krankenpflegeJahre: `${(s % 5) + 1} Jahre`,
    andereSpachen: sprachenPool[s % sprachenPool.length],
    mobilitaet: mobPool[s % mobPool.length],
    demenz: demenzPool[s % demenzPool.length],
    nacht: nachtPool[s % nachtPool.length],
    tiere: s % 3 === 0 ? 'Nein' : 'Unwichtig',
    unterbringung: unterbringungPool[s % unterbringungPool.length],
    urbanisierung: urbanPool[s % urbanPool.length],
    patienten: s % 3 === 0 ? '1 Patient' : 'Unwichtig',
    heben: s % 2 === 0,
  };
}

// ─── PatientForm (used by AngebotCard wizard) ─────────────────────────────

export interface PatientForm {
  anzahl: '1' | '2' | '';
  // Patient 1
  geschlecht: string; geburtsjahr: string; pflegegrad: string; gewicht: string; groesse: string;
  mobilitaet: string; heben: string; demenz: string; inkontinenz: string; nacht: string;
  // Patient 2
  p2_geschlecht: string; p2_geburtsjahr: string; p2_pflegegrad: string; p2_gewicht: string; p2_groesse: string;
  p2_mobilitaet: string; p2_heben: string; p2_demenz: string; p2_inkontinenz: string; p2_nacht: string;
  // Shared
  diagnosen: string;
  plz: string; ort: string; haushalt: string; wohnungstyp: string; urbanisierung: string;
  familieNahe: string; pflegedienst: string; internet: string;
  tiere: string; unterbringung: string; aufgaben: string;
  // PK-Wünsche
  wunschGeschlecht: string; rauchen: string; sonstigeWuensche: string;
}

export const STEP_LABELS = ['Zur Person', 'Pflegebedarf', 'Wohnsituation', 'Wünsche zur PK'];
