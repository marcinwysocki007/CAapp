/*
  # Add Anrede Field to Leads Table

  1. Changes
    - Add `anrede` field to `leads` table
      - Type: text
      - Optional field
      - Default: NULL
      - Used for personalized salutations in offers
    
  2. Notes
    - Anrede will be auto-generated based on vorname/nachname or can be manually set
    - Common values: "Herr", "Frau", "Familie"
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'anrede'
  ) THEN
    ALTER TABLE leads ADD COLUMN anrede text;
  END IF;
END $$;