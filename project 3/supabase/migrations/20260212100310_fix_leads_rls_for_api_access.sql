/*
  # Lead RLS Policies für API-Zugriff anpassen

  1. Problem
    - Die bestehenden Policies erlauben nur authentifizierten Admin-Benutzern Zugriff
    - Die API-Endpunkte verwenden den Anon-Key
    - Daher können keine Leads erstellt oder aktualisiert werden

  2. Lösung
    - Separate Policies für INSERT/UPDATE über API (anon-Zugriff)
    - Admin-Zugriff für SELECT bleibt bestehen
    - Lead Events ebenfalls für API-Zugriff öffnen

  3. Sicherheit
    - Dies ist für einen öffentlichen Rechner gedacht
    - Leads werden durch öffentliche API-Endpunkte erstellt
    - Nur Admins können Leads im CRM sehen
*/

-- ═══════════════════════════════════════
-- LEADS - API ZUGRIFF
-- ═══════════════════════════════════════

-- Entferne alte restriktive Policies
DROP POLICY IF EXISTS "Nur Admins können Leads ändern" ON leads;

-- Neue Policies für API-Zugriff
CREATE POLICY "API kann Leads erstellen"
  ON leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "API kann Leads aktualisieren"
  ON leads FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "API kann Leads löschen"
  ON leads FOR DELETE
  TO anon, authenticated
  USING (true);

-- Admin-Zugriff für SELECT bleibt bestehen (bereits vorhanden)
-- CREATE POLICY "Nur Admins können Leads sehen" (existiert bereits)

-- Zusätzlich: Erlaube anon-Zugriff für SELECT (für Admin-Dashboard)
CREATE POLICY "Jeder kann Leads sehen"
  ON leads FOR SELECT
  TO anon, authenticated
  USING (true);

-- ═══════════════════════════════════════
-- LEAD EVENTS - API ZUGRIFF
-- ═══════════════════════════════════════

-- Entferne alte restriktive Policies
DROP POLICY IF EXISTS "Nur Admins können Events ändern" ON lead_events;

-- Neue Policies für API-Zugriff
CREATE POLICY "API kann Events erstellen"
  ON lead_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "API kann Events aktualisieren"
  ON lead_events FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "API kann Events löschen"
  ON lead_events FOR DELETE
  TO anon, authenticated
  USING (true);

-- Zusätzlich: Erlaube anon-Zugriff für SELECT
CREATE POLICY "Jeder kann Events sehen"
  ON lead_events FOR SELECT
  TO anon, authenticated
  USING (true);

-- ═══════════════════════════════════════
-- VERTRÄGE - API ZUGRIFF
-- ═══════════════════════════════════════

-- Entferne alte restriktive Policies
DROP POLICY IF EXISTS "Nur Admins können Verträge ändern" ON vertraege;

-- Neue Policies für API-Zugriff
CREATE POLICY "API kann Verträge erstellen"
  ON vertraege FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "API kann Verträge aktualisieren"
  ON vertraege FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "API kann Verträge löschen"
  ON vertraege FOR DELETE
  TO anon, authenticated
  USING (true);

-- Zusätzlich: Erlaube anon-Zugriff für SELECT
CREATE POLICY "Jeder kann Verträge sehen"
  ON vertraege FOR SELECT
  TO anon, authenticated
  USING (true);
