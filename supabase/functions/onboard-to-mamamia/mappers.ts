import type { FormularDaten, Lead, PatientInput } from "./types.ts";

// ─── Mobility ────────────────────────────────────────────────────────────────
// Mamamia mobility_id values (from SADASH docs + live beta):
// 1 = Mobile, 2 = Walking stick, 3 = Walker/Rollator, 4 = Wheelchair, 5 = Bedridden
// `mobility_id` MUST be set, or StoreJobOffer crashes in checkSuperJob3.
//
// formularDaten uses several variants for the "needs walking aid" tier —
// keep the dictionary inclusive so we don't silently default to 1 (Mobile)
// when the user actually selected a Rollator (CLAUDE.md §1).
const MOBILITY_MAP: Record<string, number> = {
  mobil: 1,
  gehstock: 2,
  gehfaehig: 3,
  gehhilfe: 3,
  rollator: 3,
  rollstuhl: 4,
  bettlaegerig: 5,
};

export function mapMobilityToId(fd: FormularDaten): number {
  const key = (fd?.mobilitaet ?? "").toString().toLowerCase();
  return MOBILITY_MAP[key] ?? 1; // default 1 = Mobile (safest — no crash)
}

// ─── Care level (Pflegegrad) ────────────────────────────────────────────────
// Valid 1-5. Mamamia required. Default 2 if missing/invalid.
export function mapCareLevel(fd: FormularDaten): number {
  const v = fd?.pflegegrad;
  if (typeof v === "number" && v >= 1 && v <= 5) return v;
  return 2;
}

// ─── Dementia ───────────────────────────────────────────────────────────────
export function mapDementia(fd: FormularDaten): "yes" | "no" {
  const v = (fd?.demenz ?? "").toString().toLowerCase();
  if (v === "ja" || v === "yes") return "yes";
  return "no";
}

// ─── Night operations ───────────────────────────────────────────────────────
// Mamamia enum (verified via prod DB read-only on 2026-04-27):
//   "no"           — 65% of records
//   "up_to_1_time" — 22% (≤1× per night)
//   "1_2_times"    —  5% (1–2× per night)
//   "more_than_2"  —  1% (>2× per night)
//   "occasionally" —  0.2% (legacy / rare)
//
// formularDaten only offers 4 levels (nein/gelegentlich/regelmaessig/taeglich),
// so we map onto the production-supported 4-bucket scale.
export type NightOperations =
  | "no"
  | "up_to_1_time"
  | "1_2_times"
  | "more_than_2"
  | "occasionally";

export function mapNightOperations(fd: FormularDaten): NightOperations {
  const v = (fd?.nachteinsaetze ?? "").toString().toLowerCase();
  if (v === "gelegentlich") return "occasionally";
  if (v === "regelmaessig") return "up_to_1_time";
  if (v === "taeglich") return "1_2_times";
  return "no";
}

// ─── Gender ─────────────────────────────────────────────────────────────────
// Mamamia enum (verified prod DB 2026-04-27):
//   "female" (61%), "male" (38%), "not_important" (rare), null
// formularDaten "egal" → "not_important" so the matcher knows it's intentional.
export function mapGender(
  fd: FormularDaten,
): "male" | "female" | "not_important" | null {
  const v = (fd?.geschlecht ?? "").toString().toLowerCase();
  if (v === "weiblich") return "female";
  if (v === "maennlich") return "male";
  if (v === "egal") return "not_important";
  return null;
}

// ─── Arrival date from care_start_timing ────────────────────────────────────
// Returns YYYY-MM-DD format expected by Mamamia StoreJobOffer.arrival_at.
// Values are taken from the live `leads` table — counted on 2026-04-27:
//   sofort       (34) → ~7 days  (ASAP)
//   unklar       (32) → ~30 days (uncertain → middle ground, customer adjusts)
//   2-4-wochen   (27) → ~21 days (≈3 weeks)
//   1-2-monate   (14) → ~45 days
// Anything unknown defaults to "sofort" (7 days). The customer always
// adjusts later via the patient form / UpdateJobOffer.
const OFFSET_DAYS: Record<string, number> = {
  sofort: 7,
  "1-2-wochen": 10,
  "2-4-wochen": 21,
  "1-monat": 30,
  unklar: 30,
  "1-2-monate": 45,
  spaeter: 60,
};

export function computeArrivalDate(
  timing: string | null | undefined,
  nowISO: string,
): string {
  const days = OFFSET_DAYS[timing ?? "sofort"] ?? OFFSET_DAYS.sofort;
  const d = new Date(nowISO);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// ─── JobOffer title generator ───────────────────────────────────────────────
// Mamamia requires non-empty title. Use "Primundus — {nachname}" when available,
// fall back to "Primundus — {first-8-chars-of-lead-id}" if nachname is null.
export function buildJobOfferTitle(lead: Lead): string {
  if (lead.nachname && lead.nachname.trim().length > 0) {
    return `Primundus — ${lead.nachname}`;
  }
  return `Primundus — ${lead.id.slice(0, 8)}`;
}

// ─── Build patients[] from formularDaten ────────────────────────────────────
// We map every formularDaten field for which Mamamia exposes a known-valid
// patient enum (verified vs prod DB read-only).
//
// dementia: prod uses "yes"/"no" cleanly (51%/48%) — re-included after
// the discovery sweep on 2026-04-27. Earlier suspicion that Laravel rejected
// "yes"/"no" turned out to come from another field's validator, not dementia.
//
// weitere_personen=ja → 2 patients; second carries minimum required fields
// (mobility_id + care_level) to prevent StoreJobOffer checkSuperJob3 crash;
// patient form fills the second's details later via UpdateCustomer.
export function buildPatients(fd: FormularDaten): PatientInput[] {
  const first: PatientInput = {
    gender: mapGender(fd),
    care_level: mapCareLevel(fd),
    mobility_id: mapMobilityToId(fd),
    night_operations: mapNightOperations(fd),
    dementia: mapDementia(fd),
  };

  const second: PatientInput | null = fd?.weitere_personen === "ja"
    ? { care_level: 2, mobility_id: 1 } // placeholder — user fills later via UpdateCustomer
    : null;

  return second ? [first, second] : [first];
}
