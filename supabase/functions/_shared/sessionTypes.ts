// Shared JWT session payload — used by onboard-to-mamamia (create) and
// mamamia-proxy (verify). Kept separate from per-function domain types.

export interface SessionPayload {
  customer_id: number;
  job_offer_id: number;
  lead_id: string;
  /** Customer email from Supabase lead. Kept in the signed JWT so the
   *  proxy never trusts client-supplied addresses. (Originally added for
   *  the K6 magic-link flow; the panel-style ImpersonateCustomer flow
   *  doesn't need it but the field is still useful for bookings + audit.) */
  email: string;
}
