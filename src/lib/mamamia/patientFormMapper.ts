// Mapper PatientForm (CustomerPortalPage 4-step wizard) → UpdateCustomer input.
// Whitelist enforced again by mamamia-proxy `updateCustomer` action —
// anything not listed there is stripped server-side.

// NOTE: PatientForm type is intentionally duplicated (not imported) so this
// mapper has no circular dep on CustomerPortalPage. Shape must stay in sync.

export interface PatientFormShape {
  anzahl: '1' | '2' | '';
  geschlecht: string; geburtsjahr: string; pflegegrad: string; gewicht: string; groesse: string;
  mobilitaet: string; heben: string; demenz: string; inkontinenz: string; nacht: string;
  p2_geschlecht: string; p2_geburtsjahr: string; p2_pflegegrad: string; p2_gewicht: string; p2_groesse: string;
  p2_mobilitaet: string; p2_heben: string; p2_demenz: string; p2_inkontinenz: string; p2_nacht: string;
  diagnosen: string;
  plz: string; ort: string; haushalt: string; wohnungstyp: string; urbanisierung: string;
  familieNahe: string; pflegedienst: string; internet: string;
  // Pflegedienst follow-up — populated by AngebotCard step 2 when
  // pflegedienst='Ja'/'Geplant'. See buildDayCareFacilityDescription.
  pflegedienstHaeufigkeit: string;
  pflegedienstAufgaben: string;
  tiere: string; unterbringung: string; aufgaben: string;
  wunschGeschlecht: string; rauchen: string; sonstigeWuensche: string;
  // Getriebe — only populated when the customer answered fuehrerschein=Ja
  // in the calculator. Empty = field hidden / not applicable.
  wunschGetriebe: string;
}

// Mobility label → Mamamia mobility_id (SADASH docs + live-verified in K1).
const MOBILITY_BY_LABEL: Record<string, number> = {
  'Selbstständig mobil': 1,
  'Vollständig mobil': 1,
  'Am Gehstock': 2,
  'Gehfähig mit Hilfe': 3,
  'Rollatorfähig': 3,
  'Rollstuhlfähig': 4,
  'Bettlägerig': 5,
};

function parsePflegegrad(label: string): number | null {
  if (!label) return null;
  const m = label.match(/\d/);
  return m ? Number(m[0]) : null;
}

function parseYear(year: string): number | null {
  const n = Number(year);
  return Number.isFinite(n) && n > 1900 && n < 2100 ? n : null;
}

function genderToApi(g: string): 'male' | 'female' | null {
  if (g === 'Männlich') return 'male';
  if (g === 'Weiblich') return 'female';
  return null;
}

function yesNoToApi(v: string): 'yes' | 'no' | null {
  if (v === 'Ja') return 'yes';
  if (v === 'Nein') return 'no';
  return null;
}

function yesNoToBool(v: string): boolean | null {
  if (v === 'Ja') return true;
  if (v === 'Nein') return false;
  return null;
}

// Dementia levels: form has Nein/Leichtgradig/Mittelgradig/Schwer.
// Mamamia known: "yes" + "no" persist. Any non-"Nein" → "yes".
function dementiaToApi(v: string): 'yes' | 'no' | null {
  if (!v) return null;
  return v === 'Nein' ? 'no' : 'yes';
}

// Incontinence string → triplet of booleans.
function incontinenceToApi(v: string): {
  incontinence?: boolean;
  incontinence_feces?: boolean;
  incontinence_urine?: boolean;
} {
  if (!v) return {};
  if (v === 'Nein') return { incontinence: false, incontinence_feces: false, incontinence_urine: false };
  if (v === 'Harninkontinenz') return { incontinence: true, incontinence_urine: true, incontinence_feces: false };
  if (v === 'Stuhlinkontinenz') return { incontinence: true, incontinence_feces: true, incontinence_urine: false };
  if (v === 'Beides') return { incontinence: true, incontinence_feces: true, incontinence_urine: true };
  return {};
}

// Night operations enum — verified vs Mamamia prod DB (2026-04-27):
//   "no" | "up_to_1_time" | "1_2_times" | "more_than_2" | "occasionally"
// PatientForm dropdown options ['Nein','Bis zu 1 Mal','1–2 Mal','Mehr als 2']
// map 1:1; older 'Gelegentlich'/'Regelmäßig' values kept for legacy drafts.
function nachtToApi(v: string): string | null {
  if (!v) return null;
  if (v === 'Nein') return 'no';
  if (v === 'Bis zu 1 Mal') return 'up_to_1_time';
  if (v === '1–2 Mal' || v === '1-2 Mal') return '1_2_times';
  if (v === 'Mehr als 2') return 'more_than_2';
  // Legacy values from older drafts (still valid prod enum).
  if (v === 'Gelegentlich') return 'occasionally';
  if (v === 'Regelmäßig') return 'up_to_1_time';
  return null;
}

// accommodation (wohnungstyp) enum — verified prod 2026-04-27.
function accommodationToApi(v: string): string | null {
  if (!v) return null;
  if (v === 'Einfamilienhaus') return 'single_family_house';
  if (v === 'Wohnung in Mehrfamilienhaus' || v === 'Wohnung') return 'apartment';
  if (v === 'Andere' || v === 'Sonstiges') return 'other';
  return null;
}

// urbanization_id (urbanisierung) — Mamamia lookup verified 2026-04-28:
//   1 = Village, 2 = City, 3 = Big city
function urbanizationIdToApi(v: string): number | null {
  if (v === 'Großstadt') return 3;
  if (v === 'Kleinstadt') return 2;
  if (v === 'Dorf/Land' || v === 'Dorf') return 1;
  return null;
}

// day_care_facility (pflegedienst) — boolean enum on Mamamia.
//   "Geplant" treated as "yes" because Mamamia has no third option.
function dayCareFacilityToApi(v: string): 'yes' | 'no' | null {
  if (v === 'Ja' || v === 'Geplant') return 'yes';
  if (v === 'Nein') return 'no';
  return null;
}

// Pflegedienst frequency — DE → en/pl translation table for the locales.
// AngebotCard ships these exact labels (Wie oft kommt der Pflegedienst?).
const PFLEGEDIENST_FREQ_TRANSLATIONS: Record<string, { en: string; pl: string }> = {
  '1× pro Woche': { en: 'Once a week', pl: '1× w tygodniu' },
  '2× pro Woche': { en: 'Twice a week', pl: '2× w tygodniu' },
  '3× pro Woche': { en: 'Three times a week', pl: '3× w tygodniu' },
  'Täglich': { en: 'Daily', pl: 'Codziennie' },
  'Mehrmals täglich': { en: 'Several times a day', pl: 'Kilka razy dziennie' },
};

// Pflegedienst tasks — DE → en/pl translation table. Match the exact
// checkbox labels rendered in AngebotCard so we can locate translations
// without parsing.
const PFLEGEDIENST_TASK_TRANSLATIONS: Record<string, { en: string; pl: string }> = {
  'Grundpflege (Körperpflege, Anziehen)': {
    en: 'Basic care (personal hygiene, dressing)',
    pl: 'Pielęgnacja podstawowa (higiena, ubieranie)',
  },
  'Medikamentengabe': { en: 'Medication administration', pl: 'Podawanie leków' },
  'Wundversorgung': { en: 'Wound care', pl: 'Opatrywanie ran' },
  'Injektionen / Blutzucker': { en: 'Injections / blood sugar', pl: 'Iniekcje / pomiar cukru' },
  'Behandlungspflege (z.B. Verbandwechsel)': {
    en: 'Treatment care (e.g. dressing changes)',
    pl: 'Pielęgnacja medyczna (np. zmiana opatrunków)',
  },
};

// Internal separator for the pflegedienstAufgaben form-state string. The
// task labels themselves contain commas inside parens (e.g.
// "Grundpflege (Körperpflege, Anziehen)"), so a plain `, ` separator can't
// be split back unambiguously. AngebotCard joins/splits with `; `; this
// mapper does the same.
const PFLEGEDIENST_TASKS_SEP = '; ';

// Build the day_care_facility_description string + 4 locales from the
// Pflegedienst follow-up answers. Mamamia panel form requires this when
// day_care_facility=yes — pre-2026-05-05 we shipped 'yes' without a
// description and Mamamia rejected the customer as incomplete.
// Returns null when the customer answered Nein (or the follow-ups are
// blank), so callers can skip the field entirely.
export function buildDayCareFacilityDescription(
  haeufigkeit: string,
  aufgaben: string,
): { de: string; en: string; pl: string } | null {
  const haeu = haeufigkeit.trim();
  const tasks = aufgaben
    .split(PFLEGEDIENST_TASKS_SEP)
    .map(s => s.trim())
    .filter(Boolean);
  if (!haeu && tasks.length === 0) return null;

  // Final description joins with `, ` for agency readability — no risk of
  // re-splitting because the consumer is free-text panel UI, not us.
  const tasksDe = tasks.join(', ');
  const tasksEn = tasks
    .map(t => PFLEGEDIENST_TASK_TRANSLATIONS[t]?.en ?? t)
    .join(', ');
  const tasksPl = tasks
    .map(t => PFLEGEDIENST_TASK_TRANSLATIONS[t]?.pl ?? t)
    .join(', ');

  const haeuEn = PFLEGEDIENST_FREQ_TRANSLATIONS[haeu]?.en ?? haeu;
  const haeuPl = PFLEGEDIENST_FREQ_TRANSLATIONS[haeu]?.pl ?? haeu;

  // Format: "{frequency}: {tasks}" — keeps the agency-readable string
  // compact and predictable. When only frequency is set (or only tasks),
  // drop the colon to avoid stray ": …" / "…: " strings.
  const join = (h: string, t: string) =>
    h && t ? `${h}: ${t}` : (h || t);

  return {
    de: join(haeu, tasksDe),
    en: join(haeuEn, tasksEn),
    pl: join(haeuPl, tasksPl),
  };
}

// pets (tiere) — pets enum + 3 boolean flags. Form distinguishes pet
// type while Mamamia tracks them separately.
function petsToApi(v: string): {
  pets?: string;
  is_pet_dog?: boolean;
  is_pet_cat?: boolean;
  is_pet_other?: boolean;
} {
  if (!v || v === 'Keine') return { pets: 'no', is_pet_dog: false, is_pet_cat: false, is_pet_other: false };
  if (v === 'Hund') return { pets: 'yes', is_pet_dog: true, is_pet_cat: false, is_pet_other: false };
  if (v === 'Katze') return { pets: 'yes', is_pet_dog: false, is_pet_cat: true, is_pet_other: false };
  if (v === 'Andere') return { pets: 'yes', is_pet_dog: false, is_pet_cat: false, is_pet_other: true };
  return {};
}

// caregiver_accommodated (unterbringung) — verified prod 2026-04-28.
function caregiverAccommodatedToApi(v: string): string | null {
  if (v === 'Zimmer in den Räumlichkeiten') return 'room_premises';
  if (v === 'Gesamter Bereich') return 'area_premises';
  if (v === 'Zimmer extern') return 'room_other_premises';
  if (v === 'Bereich extern') return 'area_other_premises';
  return null;
}

// Lift / heben: Mamamia lifts lookup: 1=Yes, 2=No, 3=legacy.
// "Heben erforderlich?" Ja → patient needs hoist → lift_id=1.
// Nein → no hoist needed → lift_id=2.
function liftIdToApi(v: string): number | null {
  if (v === 'Ja') return 1;
  if (v === 'Nein') return 2;
  return null;
}

// Dementia gradation (Leichtgradig/Mittelgradig/Schwer) is lost on
// Mamamia.dementia (yes/no enum). Capture it in dementia_description
// instead, so the agency sees the severity. 4-locale set.
function dementiaDescriptionFromForm(v: string): {
  de: string;
  en: string;
  pl: string;
} | null {
  if (!v) return null;
  if (v === 'Nein') {
    return {
      de: 'Keine Demenzdiagnose.',
      en: 'No dementia diagnosis.',
      pl: 'Brak rozpoznania demencji.',
    };
  }
  const grad: Record<string, { de: string; en: string; pl: string }> = {
    Leichtgradig: { de: 'leichtgradig', en: 'mild', pl: 'łagodna' },
    Mittelgradig: { de: 'mittelgradig', en: 'moderate', pl: 'umiarkowana' },
    Schwer: { de: 'schwer', en: 'severe', pl: 'ciężka' },
  };
  const g = grad[v];
  if (!g) return null;
  return {
    de: `Demenzdiagnose: ${g.de}.`,
    en: `Dementia diagnosis: ${g.en}.`,
    pl: `Rozpoznana demencja: ${g.pl}.`,
  };
}

// customer_caregiver_wish.gender (wunschGeschlecht) — preferred caregiver
// gender. NOT the patient gender (that comes from anrede).
function wishGenderToApi(v: string): 'female' | 'male' | 'not_important' | null {
  if (v === 'Weiblich') return 'female';
  if (v === 'Männlich') return 'male';
  if (v === 'Egal') return 'not_important';
  return null;
}

// customer_caregiver_wish.smoking — caregiver smoking preference (yes
// means "smoking caregiver is OK"). Form question is "Darf die
// Betreuungsperson rauchen?". Default to "yes_outside" for Ja since
// that's the prod-most-common positive answer (5169 vs 142 plain "yes").
function wishSmokingToApi(v: string): 'yes_outside' | 'no' | null {
  if (v === 'Ja') return 'yes_outside';
  if (v === 'Nein') return 'no';
  return null;
}

// driving_license itself is set by the calculator (formularDaten →
// onboard). The patient form lets the customer specify the gearbox
// preference (Automatik / Schaltung / Egal), which Mamamia stores as
// customer_caregiver_wish.driving_license_gearbox. "Egal" maps to
// 'automatic' — same permissive default the onboard pass writes.
function wishDrivingGearboxToApi(v: string): 'automatic' | 'manual' | null {
  if (v === 'Schaltung') return 'manual';
  if (v === 'Automatik') return 'automatic';
  // 'Egal' → 'automatic' (permissive — any licensed cg can drive auto)
  if (v === 'Egal') return 'automatic';
  return null;
}

// Build a single patient object for UpdateCustomer.patients[].
// Threading existing `patientId` is critical — Mamamia SILENTLY DROPS fields
// like night_operations and incontinence when patient is new (no id) inside
// UpdateCustomer. With id, the same fields persist correctly.
function buildPatient(
  gender: string,
  year: string,
  pflegegrad: string,
  mobility: string,
  nacht: string,
  heben: string,
  demenz: string,
  inkontinenz: string,
  gewicht: string,
  groesse: string,
  patientId?: number,
): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  if (typeof patientId === 'number') p.id = patientId;

  const g = genderToApi(gender);
  if (g) p.gender = g;

  const y = parseYear(year);
  if (y) p.year_of_birth = y;

  const pg = parsePflegegrad(pflegegrad);
  if (pg) p.care_level = pg;

  const mob = MOBILITY_BY_LABEL[mobility];
  if (mob !== undefined) p.mobility_id = mob;

  const na = nachtToApi(nacht);
  if (na) p.night_operations = na;

  const dem = dementiaToApi(demenz);
  if (dem) p.dementia = dem;

  const inc = incontinenceToApi(inkontinenz);
  Object.assign(p, inc);

  if (gewicht) p.weight = gewicht;
  if (groesse) p.height = groesse;

  const lift = liftIdToApi(heben);
  if (lift !== null) p.lift_id = lift;

  // Dementia gradation lives in dementia_description (4 locales).
  // Mamamia.dementia is just yes/no — without this, "Mittelgradig" vs
  // "Schwer" looks identical to the agency.
  const demDesc = dementiaDescriptionFromForm(demenz);
  if (demDesc) {
    p.dementia_description = demDesc.de;
    p.dementia_description_de = demDesc.de;
    p.dementia_description_en = demDesc.en;
    p.dementia_description_pl = demDesc.pl;
  }

  return p;
}

export interface CaregiverWishPatch {
  gender?: 'female' | 'male' | 'not_important';
  smoking?: 'yes_outside' | 'no';
  driving_license_gearbox?: 'automatic' | 'manual';
  tasks?: string;
  tasks_de?: string;
  other_wishes?: string;
  other_wishes_de?: string;
}

export interface MappedCustomerPatch {
  // Fields that land on Customer root.
  job_description?: string;
  other_people_in_house?: string;
  has_family_near_by?: 'yes' | 'no';
  internet?: 'yes' | 'no';
  accommodation?: string;
  location_id?: number;
  location_custom_text?: string;
  // ── Newly mapped (post-2026-04-28 audit) ──
  urbanization_id?: number;
  day_care_facility?: 'yes' | 'no';
  // Note: Mamamia GraphQL UpdateCustomer mutation does NOT accept
  // day_care_facility_description{,_de,_en,_pl} as input arguments
  // (verified 2026-05-05 via beta — adding them to the mutation triggered
  // GraphQL parse failure, breaking ALL updateCustomer calls). The DB
  // columns exist but the mutation input type doesn't expose them.
  // Workaround: append the pflegedienst description to job_description
  // — that field IS settable and carries free-text agency-readable info.
  pets?: string;
  is_pet_dog?: boolean;
  is_pet_cat?: boolean;
  is_pet_other?: boolean;
  caregiver_accommodated?: string;
  customer_caregiver_wish?: CaregiverWishPatch;
  // Patient array.
  patients?: Array<Record<string, unknown>>;
}

export function mapPatientFormToUpdateCustomerInput(
  form: PatientFormShape,
  opts: { locationId?: number | null; existingPatientIds?: number[] } = {},
): MappedCustomerPatch {
  const patch: MappedCustomerPatch = {};
  const ids = opts.existingPatientIds ?? [];

  // Patient 1 always present.
  const patients: Array<Record<string, unknown>> = [
    buildPatient(
      form.geschlecht,
      form.geburtsjahr,
      form.pflegegrad,
      form.mobilitaet,
      form.nacht,
      form.heben,
      form.demenz,
      form.inkontinenz,
      form.gewicht,
      form.groesse,
      ids[0],
    ),
  ];

  // Patient 2 when "anzahl=2".
  if (form.anzahl === '2') {
    patients.push(buildPatient(
      form.p2_geschlecht,
      form.p2_geburtsjahr,
      form.p2_pflegegrad,
      form.p2_mobilitaet,
      form.p2_nacht,
      form.p2_heben,
      form.p2_demenz,
      form.p2_inkontinenz,
      form.p2_gewicht,
      form.p2_groesse,
      ids[1],
    ));
  }

  patch.patients = patients;

  // Location — prefer explicit id from autocomplete; else custom text "PLZ Ort".
  if (opts.locationId) {
    patch.location_id = opts.locationId;
  } else if (form.plz || form.ort) {
    patch.location_custom_text = `${form.plz} ${form.ort}`.trim();
  }

  // ── Customer-level fields ────────────────────────────────────────────
  const acc = accommodationToApi(form.wohnungstyp);
  if (acc) patch.accommodation = acc;

  const urb = urbanizationIdToApi(form.urbanisierung);
  if (urb !== null) patch.urbanization_id = urb;

  const dcf = dayCareFacilityToApi(form.pflegedienst);
  if (dcf) patch.day_care_facility = dcf;
  // pflegedienst description: serialize frequency + tasks and stash on
  // `job_description` (the only writable free-text field on UpdateCustomer
  // — the dedicated day_care_facility_description column is read-only via
  // GraphQL). See `MappedCustomerPatch` comment for context.

  const petsObj = petsToApi(form.tiere);
  if (petsObj.pets) {
    patch.pets = petsObj.pets;
    patch.is_pet_dog = petsObj.is_pet_dog;
    patch.is_pet_cat = petsObj.is_pet_cat;
    patch.is_pet_other = petsObj.is_pet_other;
  }

  const cga = caregiverAccommodatedToApi(form.unterbringung);
  if (cga) patch.caregiver_accommodated = cga;

  // other_people_in_house — derive from anzahl: 2 patients = yes, 1 = no.
  // (Form's `haushalt` field is read-only prefill from formularDaten.)
  if (form.anzahl === '2') patch.other_people_in_house = 'yes';
  else if (form.anzahl === '1') patch.other_people_in_house = 'no';

  const fam = yesNoToApi(form.familieNahe);
  if (fam) patch.has_family_near_by = fam;

  const net = yesNoToApi(form.internet);
  if (net) patch.internet = net;

  // ── customer_caregiver_wish nested ───────────────────────────────────
  // wunschGeschlecht / rauchen / aufgaben / sonstigeWuensche all live
  // here — they are caregiver preferences, NOT customer attributes.
  // Pre-2026-04-28 audit they leaked into smoking_household + job_description.
  const wish: CaregiverWishPatch = {};
  const wg = wishGenderToApi(form.wunschGeschlecht);
  if (wg) wish.gender = wg;
  const ws = wishSmokingToApi(form.rauchen);
  if (ws) wish.smoking = ws;
  const wgear = wishDrivingGearboxToApi(form.wunschGetriebe);
  if (wgear) wish.driving_license_gearbox = wgear;
  if (form.aufgaben) {
    wish.tasks = form.aufgaben;
    wish.tasks_de = form.aufgaben;
  }
  if (form.sonstigeWuensche) {
    wish.other_wishes = form.sonstigeWuensche;
    wish.other_wishes_de = form.sonstigeWuensche;
  }
  if (Object.keys(wish).length > 0) {
    patch.customer_caregiver_wish = wish;
  }

  // ── job_description: medical diagnoses + pflegedienst description ───
  // aufgaben/sonstigeWuensche moved out (they belong on the wish row).
  // Pflegedienst frequency+tasks land here too because the dedicated
  // day_care_facility_description column isn't writable via GraphQL
  // UpdateCustomer (Mamamia mutation input doesn't expose it).
  const jobParts: string[] = [];
  if (form.diagnosen) {
    jobParts.push(`Diagnosen: ${form.diagnosen}`);
  }
  if (dcf === 'yes') {
    const desc = buildDayCareFacilityDescription(
      form.pflegedienstHaeufigkeit ?? '',
      form.pflegedienstAufgaben ?? '',
    );
    if (desc) {
      jobParts.push(`Pflegedienst: ${desc.de}`);
    }
  }
  if (jobParts.length > 0) {
    patch.job_description = jobParts.join(' | ');
  }

  return patch;
}
