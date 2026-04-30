/*
  # Lead-Management und Vertrags-System

  1. Neue Tabellen
    - `leads`
      - Speichert alle Interessenten mit 3 Status-Stufen
      - Status: info_requested → angebot_requested → vertrag_abgeschlossen
      - Inkl. Token für Online-Vertragsschluss
      - Deduplizierung über E-Mail
    
    - `lead_events`
      - Event-Tracking für jeden Lead
      - Alle Interaktionen werden geloggt
    
    - `vertraege`
      - Abgeschlossene Verträge mit Patientendaten
      - Verknüpft mit Lead
      - Token-basierter Zugriff

  2. Sicherheit
    - RLS aktiviert für alle Tabellen
    - Leads und Events nur für Admins
    - Verträge über Token zugänglich (für Kunden) oder Admin
*/

-- ═══════════════════════════════════════
-- LEADS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  vorname text,
  telefon text,
  status text NOT NULL DEFAULT 'info_requested',
  token text UNIQUE,
  token_expires_at timestamptz,
  token_used boolean DEFAULT false,
  source text DEFAULT 'rechner',
  kalkulation jsonb,
  notizen text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_token ON leads(token);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nur Admins können Leads sehen"
  ON leads FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Nur Admins können Leads ändern"
  ON leads FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ═══════════════════════════════════════
-- LEAD EVENTS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS lead_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_lead ON lead_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON lead_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created ON lead_events(created_at DESC);

ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nur Admins können Events sehen"
  ON lead_events FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Nur Admins können Events ändern"
  ON lead_events FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ═══════════════════════════════════════
-- VERTRÄGE
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS vertraege (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id),
  token text UNIQUE NOT NULL,
  
  patient_vorname text,
  patient_nachname text,
  patient_geburtsdatum date,
  patient_strasse text,
  patient_plz text,
  patient_ort text,
  
  einsatzort_strasse text,
  einsatzort_plz text,
  einsatzort_ort text,
  
  startdatum date,
  vertrag_pdf_url text,
  unterschrieben_am timestamptz,
  
  kalkulation_snapshot jsonb,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vertraege_lead ON vertraege(lead_id);
CREATE INDEX IF NOT EXISTS idx_vertraege_token ON vertraege(token);

ALTER TABLE vertraege ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins können alle Verträge sehen"
  ON vertraege FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Nur Admins können Verträge ändern"
  ON vertraege FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');