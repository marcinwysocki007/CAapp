/*
  # Add patient name fields to leads table

  ## Changes
  - Adds `patient_anrede` (text) – salutation of the care recipient at the Einsatzort
  - Adds `patient_vorname` (text) – first name of the care recipient
  - Adds `patient_nachname` (text) – last name of the care recipient

  These fields are captured in the Betreuung-Beauftragen form (Einsatzort section)
  and stored alongside the existing patient_street/zip/city fields.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'patient_anrede'
  ) THEN
    ALTER TABLE leads ADD COLUMN patient_anrede text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'patient_vorname'
  ) THEN
    ALTER TABLE leads ADD COLUMN patient_vorname text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'patient_nachname'
  ) THEN
    ALTER TABLE leads ADD COLUMN patient_nachname text;
  END IF;
END $$;
