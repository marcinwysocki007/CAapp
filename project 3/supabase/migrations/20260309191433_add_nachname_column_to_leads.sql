/*
  # Add nachname column to leads table

  1. Changes
    - Add `nachname` column to `leads` table (text type, nullable)
    - This field stores the last name of the lead contact person

  2. Notes
    - Using IF NOT EXISTS pattern to safely add the column
    - Column is nullable to support existing records
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'nachname'
  ) THEN
    ALTER TABLE leads ADD COLUMN nachname text;
  END IF;
END $$;
