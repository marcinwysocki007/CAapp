// Mappers Mamamia GraphQL → existing UI types.
// Adapted from Salead's caregiver-filtering-pipeline.md §5.

import type { Nurse, Assignment } from '../../types';
import type {
  MamamiaCaregiverRef,
  MamamiaCaregiverFull,
  MamamiaJobOffer,
  MamamiaCustomer,
} from './types';

// Deterministic 20-color palette for avatar fallback (Salead pattern).
const COLORS = [
  '#9B1FA1', '#5B4FCF', '#1FA185', '#D4548A', '#C4692A',
  '#3D8B37', '#7B2D8B', '#2D6A8B', '#8B3D2D', '#4A6FA5',
  '#6B2D8B', '#8B6D1F', '#D43D1F', '#4AA1A5', '#B44A8B',
  '#1F5FAB', '#8B7D5B', '#AB1F4A', '#4FA5A1', '#D48B1F',
];

const GERMANY_SKILL_LEVELS: Record<string, { level: string; bars: number }> = {
  level_0: { level: 'A1', bars: 1 },
  level_1: { level: 'A1-A2', bars: 2 },
  level_2: { level: 'A2-B1', bars: 3 },
  level_3: { level: 'B1-B2', bars: 4 },
  level_4: { level: 'B2-C1', bars: 5 },
};

function computeAge(birthDate: string | null, yearOfBirth: number | null, nowYear: number): number {
  if (birthDate) {
    const d = new Date(birthDate);
    const now = new Date(`${nowYear}-01-01`);
    const age = now.getFullYear() - d.getFullYear();
    return age > 0 ? age : 0;
  }
  if (typeof yearOfBirth === 'number' && yearOfBirth > 1900) {
    return nowYear - yearOfBirth;
  }
  return 0;
}

function formatDisplayName(first: string | null, last: string | null): string {
  const f = (first ?? '').trim();
  const l = (last ?? '').trim();
  if (f && l) return `${f} ${l[0]}.`;
  return f || l || 'Anonym';
}

function formatAvailability(availableFromIso: string | null, nowIso: string): string {
  if (!availableFromIso) return 'Sofort';
  const from = new Date(availableFromIso);
  const now = new Date(nowIso);
  const diffDays = Math.floor((from.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return 'Sofort';
  if (diffDays <= 14) {
    const months = ['Jan', 'Feb', 'März', 'April', 'Mai', 'Juni', 'Juli', 'Aug', 'Sept', 'Okt', 'Nov', 'Dez'];
    return `ab ${from.getDate()}. ${months[from.getMonth()]}`;
  }
  const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  return `ab ${from.getDate()}. ${months[from.getMonth()]}`;
}

function isLiveNow(isActiveUser: boolean | null, lastLoginIso: string | null, nowIso: string): boolean {
  if (!isActiveUser || !lastLoginIso) return false;
  const last = new Date(lastLoginIso);
  const now = new Date(nowIso);
  const diffMin = (now.getTime() - last.getTime()) / (60 * 1000);
  return diffMin <= 30;
}

function formatAddedTime(lastContactIso: string | null, nowIso: string): string {
  if (!lastContactIso) return 'kürzlich';
  const last = new Date(lastContactIso);
  const now = new Date(nowIso);
  const diffMs = now.getTime() - last.getTime();
  const mins = diffMs / (60 * 1000);
  const hrs = mins / 60;
  const days = hrs / 24;
  const weeks = days / 7;
  if (mins < 5) return 'gerade eben';
  if (hrs < 1) return `vor ${Math.floor(mins)} Min.`;
  if (hrs < 24) return `vor ${Math.floor(hrs)} Std.`;
  if (days < 2) return 'gestern';
  if (days < 7) return `vor ${Math.floor(days)} Tagen`;
  return `vor ${Math.floor(weeks)} Wo.`;
}

export function mapCaregiverToNurse(
  cg: MamamiaCaregiverRef | MamamiaCaregiverFull,
  opts: { nowIso: string; nowYear: number },
): Nurse {
  const skill = GERMANY_SKILL_LEVELS[cg.germany_skill ?? ''] ?? { level: '—', bars: 0 };
  const age = computeAge(cg.birth_date, cg.year_of_birth, opts.nowYear);
  const experienceYears = typeof cg.care_experience === 'string' && cg.care_experience.length > 0
    ? cg.care_experience
    : cg.hp_total_days
      ? String(Math.max(1, Math.floor(cg.hp_total_days / 365)))
      : '';
  const experience = experienceYears ? `${experienceYears} J. Erfahrung` : '—';

  const avgWeeks = cg.hp_avg_mission_days
    ? Number((Math.abs(cg.hp_avg_mission_days) / 7).toFixed(1))
    : 0;
  // UI currently stores avgDurationMonths — convert weeks→months (~4.3 weeks/month).
  const avgMonths = avgWeeks ? Number((avgWeeks / 4.3).toFixed(1)) : 0;

  const detailedAssignments: Assignment[] = [];
  if ('hp_recent_assignments' in cg && cg.hp_recent_assignments) {
    const todayIso = opts.nowIso.slice(0, 10);
    for (const a of cg.hp_recent_assignments) {
      if (!a.arrival_date || !a.departure_date) continue;
      if (a.status !== 'finish') continue;
      if (a.departure_date.slice(0, 10) >= todayIso) continue;
      detailedAssignments.push({
        startDate: a.arrival_date,
        endDate: a.departure_date,
        postalCode: a.postal_code ?? '—',
        city: a.city ?? '—',
        patientCount: 1,
        mobility: '—',
      });
      if (detailedAssignments.length >= 3) break;
    }
  }

  // Real Caregiver profile fields — only present when GET_CAREGIVER ran
  // (i.e. cg has the full type, not the matching ref). Anything missing
  // stays undefined; the modal renders "—" for absent fields rather than
  // making something up (CLAUDE.md §1).
  let profile: Nurse['profile'];
  if ('hobbies' in cg || 'personalities' in cg || 'nationality' in cg) {
    const full = cg as MamamiaCaregiverFull;
    profile = {
      nationality: full.nationality?.nationality ?? undefined,
      yearOfBirth: full.year_of_birth ?? undefined,
      weight: full.weight ?? undefined,
      height: full.height ?? undefined,
      maritalStatus: full.marital_status ?? undefined,
      drivingLicense: full.driving_license != null
        ? full.driving_license !== 'no'
        : undefined,
      isNurse: full.is_nurse ?? undefined,
      smoking: full.smoking ?? undefined,
      education: full.education ?? undefined,
      qualifications: full.qualifications ?? undefined,
      motivation: full.motivation ?? undefined,
      aboutDe: full.about_de ?? undefined,
      furtherHobbies: full.further_hobbies ?? undefined,
      hobbies: (full.hobbies ?? [])
        .map(h => h.hobby).filter((x): x is string => Boolean(x)),
      personalities: (full.personalities ?? [])
        .map(p => p.personality).filter((x): x is string => Boolean(x)),
      acceptedMobilities: (full.mobilities ?? [])
        .map(m => m.mobility).filter((x): x is string => Boolean(x)),
      otherLanguages: (full.languagables ?? [])
        .filter(l => l.language?.name && l.language.name.toLowerCase() !== 'german')
        .map(l => ({ name: l.language!.name!, level: l.level ?? '—' })),
    };
  }

  return {
    caregiverId: cg.id,
    name: formatDisplayName(cg.first_name, cg.last_name),
    age,
    experience,
    availability: formatAvailability(cg.available_from, opts.nowIso),
    availableSoon: (() => {
      if (!cg.available_from) return true;
      const diff = (new Date(cg.available_from).getTime() - new Date(opts.nowIso).getTime()) / (24 * 60 * 60 * 1000);
      return diff <= 14;
    })(),
    language: skill,
    color: COLORS[cg.id % COLORS.length],
    addedTime: formatAddedTime(cg.last_contact_at, opts.nowIso),
    isLive: isLiveNow(cg.is_active_user, cg.last_login_at, opts.nowIso),
    gender: cg.gender ?? 'female',
    image: cg.avatar_retouched?.aws_url ?? undefined,
    history: cg.hp_total_jobs
      ? {
        assignments: cg.hp_total_jobs,
        avgDurationMonths: avgMonths,
      }
      : undefined,
    detailedAssignments: detailedAssignments.length > 0 ? detailedAssignments : undefined,
    profile,
  };
}

// ─── MamamiaApplication / MamamiaMatching → UI Application/Nurse ─────────

import type { MamamiaApplication, MamamiaMatching } from './types';

// UI's Application type (duplicated here for decoupling from CustomerPortalPage).
// NOTE: must match shape expected by AppCard / AngebotPruefenModal.
export interface UIApplication {
  id: string;
  nurse: Nurse;
  agencyName: string;
  appliedAt: string;
  status: 'new' | 'accepted' | 'declined';
  message: string;
  offer: {
    monatlicheKosten: number;
    anreisedatum: string;
    abreisedatum: string;
    anreisekosten: number;
    abreisekosten: number;
    reisetage: string;
    feiertagszuschlag: number;
    kuendigungsfrist: string;
    submittedAt: string;
  };
  isInvited?: boolean;
}

function fmtRelativeTime(iso: string | null, nowIso: string): string {
  if (!iso) return 'kürzlich';
  const diff = new Date(nowIso).getTime() - new Date(iso).getTime();
  const mins = diff / 60000;
  const hrs = mins / 60;
  if (mins < 60) return `vor ${Math.max(1, Math.floor(mins))} Min.`;
  if (hrs < 24) return `vor ${Math.floor(hrs)} Std.`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'gestern';
  return `vor ${days} Tagen`;
}

export function mapApplicationToUI(
  app: MamamiaApplication,
  nurseOverride: Nurse | null,
  opts: { nowIso: string; nowYear: number },
): UIApplication {
  const nurse = nurseOverride ?? mapCaregiverToNurse(app.caregiver, opts);
  return {
    id: String(app.id),
    nurse,
    // AnonymousApplication strips agency identity — show generic label.
    agencyName: 'Pflegeagentur',
    appliedAt: fmtRelativeTime(app.active_until_at, opts.nowIso),
    status: 'new',
    message: app.message ?? '',
    offer: {
      monatlicheKosten: app.salary ?? 0,
      anreisedatum: formatMamamiaDate(app.arrival_at) ?? '—',
      abreisedatum: formatMamamiaDate(app.departure_at) ?? '—',
      anreisekosten: app.arrival_fee ?? 0,
      abreisekosten: app.departure_fee ?? 0,
      reisetage: app.holiday_surcharge ? 'Halb' : 'Halb',
      feiertagszuschlag: app.holiday_surcharge ?? 0,
      kuendigungsfrist: 'Täglich kündbar',
      submittedAt: formatMamamiaDate(app.active_until_at) ?? '—',
    },
  };
}

export function mapMatchingToNurse(
  m: MamamiaMatching,
  opts: { nowIso: string; nowYear: number },
): Nurse {
  return mapCaregiverToNurse(m.caregiver, opts);
}

// ─── Presentational helpers for JobOffer/Customer display ────────────────

export function formatMamamiaDate(iso: string | null): string | null {
  if (!iso) return null;
  // Mamamia returns "2026-05-01 00:00:00" or ISO — take the date part.
  const datePart = iso.slice(0, 10);
  const [y, m, d] = datePart.split('-');
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

export function jobOfferArrivalDisplay(jo: MamamiaJobOffer | null): string | null {
  return formatMamamiaDate(jo?.arrival_at ?? null);
}

export function customerDisplayName(cust: MamamiaCustomer | null): string | null {
  if (!cust) return null;
  const f = (cust.first_name ?? '').trim();
  const l = (cust.last_name ?? '').trim();
  const full = [f, l].filter(Boolean).join(' ');
  return full || cust.email || null;
}

// ─── Reverse mapper: Mamamia Customer → PatientForm ────────────────────────
//
// The wizard needs to seed itself from the *real* Mamamia state so it
// stays in sync with what the agency / panel admin / earlier saves
// actually persisted. Without this, the only prefill source is the
// stage-A formularDaten — which can lag by hours, days, or be wrong
// outright if anyone edited the customer outside the portal.
//
// Returns Partial<PatientForm> — the AngebotCard merges this with
// localStorage drafts and stage-A prefill in order of priority:
//   draft (user mid-edit)  >  Mamamia state  >  formularDaten prefill
//
// Each helper returns '' when the upstream value is missing/unmapable
// so the form's CustomSelect renders the "Bitte wählen" placeholder
// instead of a misleading default.

const MAMAMIA_GENDER_TO_FORM: Record<string, string> = {
  male: 'Männlich',
  female: 'Weiblich',
};

const MAMAMIA_MOBILITY_TO_FORM: Record<number, string> = {
  1: 'Selbstständig mobil',
  2: 'Am Gehstock',
  3: 'Rollatorfähig',
  4: 'Rollstuhlfähig',
  5: 'Bettlägerig',
};

const MAMAMIA_NIGHT_OPS_TO_FORM: Record<string, string> = {
  no: 'Nein',
  up_to_1_time: 'Bis zu 1 Mal',
  '1_2_times': '1–2 Mal',
  more_than_2: 'Mehr als 2',
  occasionally: 'Bis zu 1 Mal', // legacy bucket — closest match
};

const MAMAMIA_ACCOMMODATION_TO_FORM: Record<string, string> = {
  single_family_house: 'Einfamilienhaus',
  apartment: 'Wohnung in Mehrfamilienhaus',
  other: 'Andere',
};

const MAMAMIA_CAREGIVER_ACCOMMODATED_TO_FORM: Record<string, string> = {
  room_premises: 'Zimmer in den Räumlichkeiten',
  area_premises: 'Gesamter Bereich',
  room_other_premises: 'Zimmer extern',
  area_other_premises: 'Bereich extern',
};

const MAMAMIA_URBANIZATION_TO_FORM: Record<number, string> = {
  1: 'Dorf/Land',
  2: 'Kleinstadt',
  3: 'Großstadt',
};

function mamamiaIncontinenceToForm(
  inc: boolean | null | undefined,
  feces: boolean | null | undefined,
  urine: boolean | null | undefined,
): string {
  if (inc === false || (inc == null && feces == null && urine == null)) {
    return inc === false ? 'Nein' : '';
  }
  if (feces && urine) return 'Beides';
  if (feces) return 'Stuhlinkontinenz';
  if (urine) return 'Harninkontinenz';
  if (inc === true) return 'Beides'; // unspecified flavour — best-fit
  return '';
}

function mamamiaDementiaToForm(
  dementia: 'yes' | 'no' | null | undefined,
  description: string | null | undefined,
): string {
  if (dementia === 'no') return 'Nein';
  if (dementia !== 'yes') return '';
  // dementia=yes — try to recover gradation from description text.
  // Our backend onboard writes "Demenzdiagnose: leichtgradig|mittelgradig|schwer."
  const desc = (description ?? '').toLowerCase();
  if (desc.includes('leichtgradig')) return 'Leichtgradig';
  if (desc.includes('mittelgradig')) return 'Mittelgradig';
  if (desc.includes('schwer')) return 'Schwer';
  // dementia=yes but no recognisable gradation → default to middle bucket.
  return 'Mittelgradig';
}

function mamamiaPetsToForm(
  pets: string | null | undefined,
  isDog: boolean | null | undefined,
  isCat: boolean | null | undefined,
  isOther: boolean | null | undefined,
): string {
  if (pets === 'no') return 'Keine';
  if (pets === 'yes') {
    if (isDog) return 'Hund';
    if (isCat) return 'Katze';
    if (isOther) return 'Andere';
    return 'Andere'; // fallback when pets=yes but no flag set
  }
  // 'no_information' / null / unknown → empty so user picks consciously.
  return '';
}

// weight/height in Mamamia store as bare buckets ("61-70" / "161-170").
// Form expects suffix ("61-70 kg" / "161-170 cm").
function mamamiaWeightToForm(w: string | null | undefined): string {
  if (!w) return '';
  return w.endsWith('kg') ? w : `${w} kg`;
}
function mamamiaHeightToForm(h: string | null | undefined): string {
  if (!h) return '';
  return h.endsWith('cm') ? h : `${h} cm`;
}

function mamamiaWishGenderToForm(g: string | null | undefined): string {
  if (g === 'male') return 'Männlich';
  if (g === 'female') return 'Weiblich';
  if (g === 'not_important') return 'Egal';
  return '';
}

// rauchen form is binary Ja/Nein. Mamamia wish.smoking has 4 values —
// collapse 'yes' / 'yes_outside' / 'not_important' to 'Ja' (caregiver
// allowed to smoke), 'no' to 'Nein'.
function mamamiaWishSmokingToForm(s: string | null | undefined): string {
  if (s === 'no') return 'Nein';
  if (s === 'yes' || s === 'yes_outside' || s === 'not_important') return 'Ja';
  return '';
}

export interface PatientFormPrefill {
  anzahl?: '1' | '2';
  geschlecht?: string; geburtsjahr?: string; pflegegrad?: string;
  gewicht?: string; groesse?: string;
  mobilitaet?: string; heben?: string; demenz?: string;
  inkontinenz?: string; nacht?: string;
  p2_geschlecht?: string; p2_geburtsjahr?: string; p2_pflegegrad?: string;
  p2_gewicht?: string; p2_groesse?: string;
  p2_mobilitaet?: string; p2_heben?: string; p2_demenz?: string;
  p2_inkontinenz?: string; p2_nacht?: string;
  plz?: string; ort?: string;
  wohnungstyp?: string; urbanisierung?: string; unterbringung?: string;
  familieNahe?: string; pflegedienst?: string; internet?: string;
  tiere?: string;
  wunschGeschlecht?: string; rauchen?: string;
  aufgaben?: string; sonstigeWuensche?: string;
}

function mamamiaPatientToForm(
  p: NonNullable<MamamiaCustomer['patients']>[number],
): {
  geschlecht?: string; geburtsjahr?: string; pflegegrad?: string;
  gewicht?: string; groesse?: string;
  mobilitaet?: string; heben?: string; demenz?: string;
  inkontinenz?: string; nacht?: string;
} {
  return {
    geschlecht: p.gender ? (MAMAMIA_GENDER_TO_FORM[p.gender] ?? '') : '',
    geburtsjahr: p.year_of_birth ? String(p.year_of_birth) : '',
    pflegegrad: p.care_level ? `Pflegegrad ${p.care_level}` : '',
    gewicht: mamamiaWeightToForm(p.weight),
    groesse: mamamiaHeightToForm(p.height),
    mobilitaet: p.mobility_id ? (MAMAMIA_MOBILITY_TO_FORM[p.mobility_id] ?? '') : '',
    heben: p.lift_id === 1 ? 'Ja' : p.lift_id === 2 ? 'Nein' : '',
    demenz: mamamiaDementiaToForm(p.dementia, p.dementia_description),
    inkontinenz: mamamiaIncontinenceToForm(
      p.incontinence, p.incontinence_feces, p.incontinence_urine,
    ),
    nacht: p.night_operations
      ? (MAMAMIA_NIGHT_OPS_TO_FORM[p.night_operations] ?? '')
      : '',
  };
}

export function mapMamamiaCustomerToPatientForm(
  cust: MamamiaCustomer | null,
): PatientFormPrefill {
  if (!cust) return {};
  const out: PatientFormPrefill = {};

  // anzahl from patients.length (1 or 2). 0/missing → leave undefined so
  // the formularDaten prefill or default '1' wins.
  const patients = cust.patients ?? [];
  if (patients.length >= 1) out.anzahl = patients.length >= 2 ? '2' : '1';

  // Patient 1
  if (patients[0]) {
    Object.assign(out, mamamiaPatientToForm(patients[0]));
  }
  // Patient 2 — same fields, p2_* keys.
  if (patients[1]) {
    const p2 = mamamiaPatientToForm(patients[1]);
    out.p2_geschlecht = p2.geschlecht;
    out.p2_geburtsjahr = p2.geburtsjahr;
    out.p2_pflegegrad = p2.pflegegrad;
    out.p2_gewicht = p2.gewicht;
    out.p2_groesse = p2.groesse;
    out.p2_mobilitaet = p2.mobilitaet;
    out.p2_heben = p2.heben;
    out.p2_demenz = p2.demenz;
    out.p2_inkontinenz = p2.inkontinenz;
    out.p2_nacht = p2.nacht;
  }

  // Customer-level enums
  if (cust.accommodation) {
    out.wohnungstyp = MAMAMIA_ACCOMMODATION_TO_FORM[cust.accommodation] ?? '';
  }
  if (cust.urbanization_id != null) {
    out.urbanisierung = MAMAMIA_URBANIZATION_TO_FORM[cust.urbanization_id] ?? '';
  }
  if (cust.caregiver_accommodated) {
    out.unterbringung =
      MAMAMIA_CAREGIVER_ACCOMMODATED_TO_FORM[cust.caregiver_accommodated] ?? '';
  }
  if (cust.has_family_near_by === 'yes') out.familieNahe = 'Ja';
  else if (cust.has_family_near_by === 'no') out.familieNahe = 'Nein';
  // 'not_important' has no form equivalent → leave empty.

  if (cust.internet === 'yes') out.internet = 'Ja';
  else if (cust.internet === 'no') out.internet = 'Nein';

  if (cust.day_care_facility === 'yes') out.pflegedienst = 'Ja';
  else if (cust.day_care_facility === 'no') out.pflegedienst = 'Nein';

  out.tiere = mamamiaPetsToForm(
    cust.pets, cust.is_pet_dog, cust.is_pet_cat, cust.is_pet_other,
  );

  // Address from the patient_contact contract row (street_number /
  // zip_code / city are filled by Primundus stage-B form).
  const patientContract = cust.customer_contracts?.find(
    c => c.contact_type === 'patient_contact',
  );
  if (patientContract?.zip_code) out.plz = patientContract.zip_code;
  if (patientContract?.city) out.ort = patientContract.city;

  // Caregiver-wish (preferences).
  const wish = cust.customer_caregiver_wish;
  if (wish) {
    out.wunschGeschlecht = mamamiaWishGenderToForm(wish.gender);
    out.rauchen = mamamiaWishSmokingToForm(wish.smoking);
    out.aufgaben = wish.tasks ?? '';
    out.sonstigeWuensche = wish.other_wishes ?? '';
  }

  return out;
}
