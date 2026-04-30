/*
  # Admin RLS Policies aktualisieren

  1. Änderungen
    - Erweitert die RLS-Policies für pricing_config, subsidies_config und subsidies_values
    - Ermöglicht anonymen Benutzern (anon) Lese- UND Schreibzugriff
    - Behält die bestehenden Lese-Policies bei
    - Fügt neue Update-Policies für anonyme Benutzer hinzu

  2. Sicherheitshinweis
    - Dies ist für einen internen Admin-Bereich gedacht
    - In einer Production-Umgebung sollte eine echte Authentifizierung implementiert werden
*/

-- ═══════════════════════════════════════
-- PRICING CONFIG - UPDATE POLICIES
-- ═══════════════════════════════════════

-- Entferne die alte restriktive Policy
DROP POLICY IF EXISTS "Nur Admins können Preise ändern" ON pricing_config;

-- Neue Policies für alle Benutzer (inkl. anon)
CREATE POLICY "Jeder kann Preise einfügen"
  ON pricing_config FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Jeder kann Preise aktualisieren"
  ON pricing_config FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Jeder kann Preise löschen"
  ON pricing_config FOR DELETE
  TO anon, authenticated
  USING (true);

-- ═══════════════════════════════════════
-- SUBSIDIES CONFIG - UPDATE POLICIES
-- ═══════════════════════════════════════

-- Entferne die alte restriktive Policy
DROP POLICY IF EXISTS "Nur Admins können Zuschüsse ändern" ON subsidies_config;

-- Neue Policies für alle Benutzer (inkl. anon)
CREATE POLICY "Jeder kann Zuschüsse einfügen"
  ON subsidies_config FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Jeder kann Zuschüsse aktualisieren"
  ON subsidies_config FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Jeder kann Zuschüsse löschen"
  ON subsidies_config FOR DELETE
  TO anon, authenticated
  USING (true);

-- ═══════════════════════════════════════
-- SUBSIDIES VALUES - UPDATE POLICIES
-- ═══════════════════════════════════════

-- Entferne die alte restriktive Policy
DROP POLICY IF EXISTS "Nur Admins können Zuschuss-Werte ändern" ON subsidies_values;

-- Neue Policies für alle Benutzer (inkl. anon)
CREATE POLICY "Jeder kann Zuschuss-Werte einfügen"
  ON subsidies_values FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Jeder kann Zuschuss-Werte aktualisieren"
  ON subsidies_values FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Jeder kann Zuschuss-Werte löschen"
  ON subsidies_values FOR DELETE
  TO anon, authenticated
  USING (true);
