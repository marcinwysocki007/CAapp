/*
  # Fix: Leads SELECT Policy für Admin-Frontend wiederherstellen
  
  1. Problem
    - Leads sind in der Datenbank (16 Stück)
    - Admin-Frontend kann sie nicht sehen
    - Die "Jeder kann Leads sehen" Policy wurde versehentlich entfernt
  
  2. Lösung
    - Policy für anon/authenticated SELECT wiederherstellen
    - Admin-Frontend nutzt anon-Key und braucht diese Policy
  
  3. Sicherheit
    - Dies ist für das Admin-Dashboard gedacht
    - Authentifizierung erfolgt später über separate Admin-Login
*/

-- Entferne falls vorhanden und erstelle neu
DROP POLICY IF EXISTS "Jeder kann Leads sehen" ON leads;

-- Policy für SELECT wiederherstellen
CREATE POLICY "Jeder kann Leads sehen"
  ON leads FOR SELECT
  TO anon, authenticated
  USING (true);
