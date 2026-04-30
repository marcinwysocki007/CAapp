/*
  # Add Order Confirmation Fields to Leads

  1. Changes
    - Add `order_confirmed_at` timestamp field to track when customer confirmed the order
    - Add `patient_street` field for patient address (street and number)
    - Add `patient_zip` field for patient postal code
    - Add `patient_city` field for patient city
    - Add `special_requirements` text field for customer notes

  2. Notes
    - These fields enable the digital order confirmation process
    - Allows customers to complete their order directly from the calculation page
    - Status field is text type, so 'Betreuung beauftragt' can be used directly
*/

-- Add new fields to leads table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'order_confirmed_at'
  ) THEN
    ALTER TABLE leads ADD COLUMN order_confirmed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'patient_street'
  ) THEN
    ALTER TABLE leads ADD COLUMN patient_street text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'patient_zip'
  ) THEN
    ALTER TABLE leads ADD COLUMN patient_zip text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'patient_city'
  ) THEN
    ALTER TABLE leads ADD COLUMN patient_city text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'special_requirements'
  ) THEN
    ALTER TABLE leads ADD COLUMN special_requirements text;
  END IF;
END $$;