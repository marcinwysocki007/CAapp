/*
  # Lead-Status "nicht_interessiert" und Notizen-Spalte

  ## Änderungen

  1. Neue Spalte `admin_notes` in der `leads`-Tabelle
     - Freitextfeld für interne Notizen (z.B. "Kunde hat sich selbst gemeldet", "Anfrage erledigt")
     - Kein NOT NULL, keine Standardwert-Pflicht

  2. Status-Erweiterung
     - Der neue Status `nicht_interessiert` wird durch die Anwendungsschicht unterstützt
     - Keine Änderung an Constraints nötig (status ist TEXT)

  3. Sicherheit
     - RLS bleibt unverändert
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE leads ADD COLUMN admin_notes text DEFAULT NULL;
  END IF;
END $$;
