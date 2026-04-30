/*
  # Add anrede_text field to leads table

  1. Changes
    - Add `anrede_text` column to `leads` table (text type, nullable)
    - This field stores the customizable greeting text for each lead
    - Examples: "Sehr geehrte Frau Schmidt", "Liebe Familie Müller"

  2. Notes
    - Using IF NOT EXISTS pattern to safely add the column
    - Column is nullable to support existing records
    - This allows individual customization per lead in the CRM
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'anrede_text'
  ) THEN
    ALTER TABLE leads ADD COLUMN anrede_text text;
  END IF;
END $$;
