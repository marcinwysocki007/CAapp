/*
  # Fix: Leads RLS Policies bereinigen
  
  1. Änderungen
    - Entfernt widersprüchliche SELECT Policy "Jeder kann Leads sehen"
    - Behält die sichere "Nur Admins können Leads sehen" Policy
    - Alle API-Operationen (INSERT, UPDATE, DELETE) bleiben unverändert
  
  2. Sicherheit
    - Nur authentifizierte Admins können Leads sehen
    - API kann weiterhin Leads erstellen und aktualisieren (anon/authenticated)
*/

-- Entferne die widersprüchliche Policy
DROP POLICY IF EXISTS "Jeder kann Leads sehen" ON leads;

-- Verifiziere dass die Admin-Policy noch aktiv ist
-- (Policy "Nur Admins können Leads sehen" bleibt bestehen)
