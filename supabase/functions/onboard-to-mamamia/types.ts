// Supabase `leads` row shape (matches CAapp src/lib/supabase.ts)

export interface FormularDaten {
  pflegegrad?: number;
  mobilitaet?: string;
  nachteinsaetze?: string;
  weitere_personen?: string;
  geschlecht?: string;
  demenz?: string;
  betreuung_fuer?: string;
  [key: string]: unknown;
}

export interface LeadKalkulation {
  bruttopreis: number;
  eigenanteil: number;
  formularDaten?: FormularDaten;
  [key: string]: unknown;
}

export interface Lead {
  id: string;
  email: string;
  vorname: string | null;
  nachname: string | null;
  anrede: string | null;
  anrede_text: string | null;
  telefon: string | null;
  status: string;
  token: string | null;
  token_expires_at: string | null;
  token_used: boolean;
  care_start_timing: string | null;
  kalkulation: LeadKalkulation | null;
  created_at: string;
  updated_at: string;
  // Rev2 Mamamia cache columns (migration 20260423)
  mamamia_customer_id: number | null;
  mamamia_job_offer_id: number | null;
  mamamia_user_token: string | null;
  mamamia_onboarded_at: string | null;
}

// Mamamia PatientInputType (verified vs prod DB read-only on 2026-04-27).
// All enum values below are taken from the live distribution of patient rows.
export interface PatientInput {
  gender?: "male" | "female" | "not_important" | null;
  year_of_birth?: number;
  care_level: number;       // required by Mamamia (1-5)
  mobility_id: number;      // required by Mamamia to prevent checkSuperJob3 crash
  dementia?: "yes" | "no";
  night_operations?:
    | "no"
    | "up_to_1_time"
    | "1_2_times"
    | "more_than_2"
    | "occasionally";
  incontinence?: boolean;
  smoking?: boolean;
}

export interface OnboardResult {
  customer_id: number;
  job_offer_id: number;
}

// Re-export SessionPayload from _shared to keep onboard consumers stable
export type { SessionPayload } from "../_shared/sessionTypes.ts";
