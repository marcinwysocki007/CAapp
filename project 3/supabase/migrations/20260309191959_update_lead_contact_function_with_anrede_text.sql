/*
  # Update lead contact function to include anrede_text

  1. Changes
    - Drop and recreate `update_lead_contact` function
    - Add `p_anrede_text` parameter for custom greeting text

  2. Notes
    - Function now handles vorname, nachname, anrede, and anrede_text
    - Maintains security definer privileges
*/

DROP FUNCTION IF EXISTS update_lead_contact(uuid, text, text, text);

CREATE OR REPLACE FUNCTION update_lead_contact(
  lead_id uuid,
  p_vorname text,
  p_nachname text,
  p_anrede text,
  p_anrede_text text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE leads
  SET 
    vorname = p_vorname,
    nachname = p_nachname,
    anrede = p_anrede,
    anrede_text = p_anrede_text,
    updated_at = now()
  WHERE id = lead_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found: %', lead_id;
  END IF;
END;
$$;
