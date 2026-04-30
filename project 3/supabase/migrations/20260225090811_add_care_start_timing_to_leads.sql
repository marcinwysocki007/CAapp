/*
  # Betreuungsbeginn-Zeitpunkt zu Leads hinzufügen

  1. Änderungen
    - Fügt `care_start_timing` Feld zur `leads` Tabelle hinzu
    - Erlaubte Werte: 'sofort', '2-4-wochen', '1-2-monate', 'unklar'
    - Wird bei Funnel-Analyse verwendet

  2. Hinweise
    - Dieses Feld hilft bei der Priorisierung von Leads
    - Leads mit "sofort" haben höchste Priorität
    - Wird auch in der Kalkulation gespeichert
*/

-- Füge care_start_timing Spalte hinzu, falls nicht vorhanden
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'care_start_timing'
  ) THEN
    ALTER TABLE leads ADD COLUMN care_start_timing text;
  END IF;
END $$;
