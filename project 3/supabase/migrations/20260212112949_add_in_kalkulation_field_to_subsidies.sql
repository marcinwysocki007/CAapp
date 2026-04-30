/*
  # Fügt in_kalkulation Feld zu subsidies_config hinzu

  1. Änderungen
    - Fügt `in_kalkulation` boolean Feld zu `subsidies_config` hinzu
    - Setzt Standardwert auf `false`
    - Aktualisiert bestehende Zuschüsse mit korrekten Werten
  
  2. in_kalkulation = TRUE (fließen in Eigenanteil-Berechnung ein)
    - Pflegegeld: Direkt verwendbar für Betreuungskosten
    - Steuerliche Absetzbarkeit: Reduziert tatsächliche Kosten
    - Verhinderungspflege: Verwendbar für 24h-Betreuung
    - Kurzzeitpflege-Budget: Verwendbar für Betreuung
  
  3. in_kalkulation = FALSE (nur Information/Beratung)
    - Entlastungsbetrag: Zweckgebunden
    - Wohnraumanpassung: Sachleistung (nicht für Betreuung)
    - Pflegehilfsmittel: Sachleistung (nicht für Betreuung)
    - Hilfe zur Pflege: Individuell
*/

-- Feld hinzufügen mit Standardwert false
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subsidies_config' AND column_name = 'in_kalkulation'
  ) THEN
    ALTER TABLE subsidies_config ADD COLUMN in_kalkulation boolean DEFAULT false;
  END IF;
END $$;

-- Werte setzen: Diese Zuschüsse fließen in die Eigenanteil-Berechnung ein
UPDATE subsidies_config 
SET in_kalkulation = true 
WHERE name IN ('pflegegeld', 'steuervorteil', 'verhinderungspflege', 'kurzzeitpflege');

-- Alle anderen bleiben auf false (nur Information)
UPDATE subsidies_config 
SET in_kalkulation = false 
WHERE name IN ('entlastungsbetrag', 'wohnraumanpassung', 'pflegehilfsmittel', 'hilfe_zur_pflege');