/*
  # Preiskonfiguration und Zuschüsse-System

  1. Neue Tabellen
    - `pricing_config`
      - Speichert alle Preiskomponenten (Basispreis + Aufschläge)
      - Kategorien: basis, betreuung_fuer, pflegegrad, mobilitaet, nachteinsaetze, deutschkenntnisse, erfahrung, weitere_personen
      - Jede Antwort hat einen konfigurierbaren Aufschlag
    
    - `subsidies_config`
      - Definiert verfügbare Zuschüsse und Fördermittel
      - Typen: monatlich, jaehrlich, einmalig, prozentual
    
    - `subsidies_values`
      - Konkrete Beträge pro Zuschuss
      - Bedingungsabhängig (z.B. nach Pflegegrad)

  2. Sicherheit
    - RLS aktiviert für alle Tabellen
    - Öffentlicher Lesezugriff für pricing_config und subsidies (für Kalkulator)
    - Nur authentifizierte Admins können ändern
*/

-- ═══════════════════════════════════════
-- PRICING CONFIG
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS pricing_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kategorie text NOT NULL,
  antwort_key text NOT NULL,
  antwort_label text NOT NULL,
  aufschlag_euro numeric(10,2) NOT NULL DEFAULT 0,
  sortierung int DEFAULT 0,
  aktiv boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pricing_kategorie ON pricing_config(kategorie);
CREATE INDEX IF NOT EXISTS idx_pricing_aktiv ON pricing_config(aktiv);

ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jeder kann Preise lesen"
  ON pricing_config FOR SELECT
  TO anon, authenticated
  USING (aktiv = true);

CREATE POLICY "Nur Admins können Preise ändern"
  ON pricing_config FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ═══════════════════════════════════════
-- SUBSIDIES CONFIG
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS subsidies_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  label text NOT NULL,
  beschreibung text,
  typ text NOT NULL DEFAULT 'monatlich',
  aktiv boolean DEFAULT true,
  sortierung int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subsidies_aktiv ON subsidies_config(aktiv);

ALTER TABLE subsidies_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jeder kann Zuschüsse lesen"
  ON subsidies_config FOR SELECT
  TO anon, authenticated
  USING (aktiv = true);

CREATE POLICY "Nur Admins können Zuschüsse ändern"
  ON subsidies_config FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ═══════════════════════════════════════
-- SUBSIDIES VALUES
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS subsidies_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subsidy_id uuid REFERENCES subsidies_config(id) ON DELETE CASCADE,
  bedingung_key text,
  bedingung_value text,
  betrag numeric(10,2) NOT NULL,
  betrag_typ text DEFAULT 'fix',
  hinweis text,
  aktiv boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subsidies_values_subsidy ON subsidies_values(subsidy_id);
CREATE INDEX IF NOT EXISTS idx_subsidies_values_aktiv ON subsidies_values(aktiv);

ALTER TABLE subsidies_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jeder kann Zuschuss-Werte lesen"
  ON subsidies_values FOR SELECT
  TO anon, authenticated
  USING (aktiv = true);

CREATE POLICY "Nur Admins können Zuschuss-Werte ändern"
  ON subsidies_values FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');