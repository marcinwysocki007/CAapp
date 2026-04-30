/*
  # Create function to update lead contact information

  1. New Functions
    - `update_lead_contact`: Updates vorname, nachname, and anrede for a lead
    - Returns void, throws error if lead not found

  2. Security
    - Function runs with security definer privileges
    - No RLS needed as this is a controlled update function
*/

CREATE OR REPLACE FUNCTION update_lead_contact(
  lead_id uuid,
  p_vorname text,
  p_nachname text,
  p_anrede text
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
    updated_at = now()
  WHERE id = lead_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found: %', lead_id;
  END IF;
END;
$$;
