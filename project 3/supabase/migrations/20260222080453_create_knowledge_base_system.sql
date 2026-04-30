/*
  # Wissensdatenbank System für Chat-AI

  1. Neue Tabellen
    - `knowledge_categories`
      - `id` (uuid, primary key)
      - `name` (text) - Kategoriename z.B. "Kosten", "Ablauf", "Qualifikationen"
      - `slug` (text, unique) - URL-freundlicher Identifier
      - `description` (text) - Beschreibung der Kategorie
      - `sort_order` (integer) - Sortierreihenfolge
      - `is_active` (boolean) - Aktiv/Inaktiv Status
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `knowledge_entries`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key) - Verknüpfung zur Kategorie
      - `title` (text) - Titel des Eintrags
      - `content` (text) - Inhalt/Antwort (Markdown unterstützt)
      - `keywords` (text array) - Suchbegriffe für besseres Matching
      - `priority` (integer) - Priorität (höher = wichtiger für AI)
      - `is_active` (boolean) - Aktiv/Inaktiv Status
      - `usage_count` (integer) - Wie oft wurde dieser Eintrag verwendet
      - `last_used_at` (timestamptz) - Wann zuletzt verwendet
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Sicherheit
    - RLS aktiviert für beide Tabellen
    - Öffentliche SELECT-Berechtigung für aktive Einträge (für Chat-AI)
    - Vollzugriff für Service Role (für Admin-Bereich)

  3. Indizes
    - Index auf category_id für schnelle Abfragen
    - Index auf keywords für Textsuche
    - Index auf is_active für Filterung
*/

-- Kategorien-Tabelle erstellen
CREATE TABLE IF NOT EXISTS knowledge_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wissenseinträge-Tabelle erstellen
CREATE TABLE IF NOT EXISTS knowledge_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES knowledge_categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  keywords text[] DEFAULT '{}',
  priority integer DEFAULT 0,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indizes erstellen
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_category_id ON knowledge_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_keywords ON knowledge_entries USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_active ON knowledge_entries(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_knowledge_categories_active ON knowledge_categories(is_active) WHERE is_active = true;

-- RLS aktivieren
ALTER TABLE knowledge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_entries ENABLE ROW LEVEL SECURITY;

-- Policies für knowledge_categories
-- Öffentlicher Lesezugriff für aktive Kategorien
CREATE POLICY "Public can view active categories"
  ON knowledge_categories FOR SELECT
  USING (is_active = true);

-- Service Role hat vollen Zugriff
CREATE POLICY "Service role has full access to categories"
  ON knowledge_categories FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Policies für knowledge_entries
-- Öffentlicher Lesezugriff für aktive Einträge
CREATE POLICY "Public can view active entries"
  ON knowledge_entries FOR SELECT
  USING (is_active = true);

-- Service Role hat vollen Zugriff
CREATE POLICY "Service role has full access to entries"
  ON knowledge_entries FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Funktion zum automatischen Aktualisieren von updated_at
CREATE OR REPLACE FUNCTION update_knowledge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für updated_at
DROP TRIGGER IF EXISTS update_knowledge_categories_updated_at ON knowledge_categories;
CREATE TRIGGER update_knowledge_categories_updated_at
  BEFORE UPDATE ON knowledge_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_updated_at();

DROP TRIGGER IF EXISTS update_knowledge_entries_updated_at ON knowledge_entries;
CREATE TRIGGER update_knowledge_entries_updated_at
  BEFORE UPDATE ON knowledge_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_updated_at();

-- Seed-Daten: Standard-Kategorien
INSERT INTO knowledge_categories (name, slug, description, sort_order) VALUES
  ('Kosten & Preise', 'kosten-preise', 'Informationen zu Kosten, Preisen und Abrechnungsmodellen', 1),
  ('Ablauf & Prozess', 'ablauf-prozess', 'Wie läuft die Vermittlung und Betreuung ab', 2),
  ('Qualifikationen', 'qualifikationen', 'Informationen zu Qualifikationen der Betreuungskräfte', 3),
  ('Leistungen', 'leistungen', 'Welche Leistungen werden angeboten', 4),
  ('Zuschüsse & Förderung', 'zuschuesse-foerderung', 'Informationen zu Pflegegraden und Zuschüssen', 5),
  ('Über Primundus', 'ueber-primundus', 'Informationen über das Unternehmen', 6)
ON CONFLICT (slug) DO NOTHING;

-- Seed-Daten: Beispiel-Einträge
INSERT INTO knowledge_entries (category_id, title, content, keywords, priority) VALUES
  (
    (SELECT id FROM knowledge_categories WHERE slug = 'kosten-preise'),
    'Durchschnittliche Kosten für 24h-Betreuung',
    'Die Kosten für eine 24-Stunden-Betreuung durch Primundus variieren je nach Betreuungsbedarf, Deutschkenntnissen und Qualifikation der Betreuungskraft. Im Durchschnitt liegen die Gesamtkosten zwischen 2.400€ und 3.500€ pro Monat. Diese Kosten können durch Pflegegeld und andere Zuschüsse reduziert werden.',
    ARRAY['kosten', 'preis', 'monatlich', 'durchschnitt', 'was kostet'],
    10
  ),
  (
    (SELECT id FROM knowledge_categories WHERE slug = 'ablauf-prozess'),
    'Wie schnell kann eine Betreuungskraft vermittelt werden?',
    'Primundus kann in der Regel innerhalb von 7-14 Tagen eine passende Betreuungskraft vermitteln. In Notfällen ist oft auch eine schnellere Vermittlung möglich. Der genaue Zeitrahmen hängt von den individuellen Anforderungen und der Verfügbarkeit passender Betreuungskräfte ab.',
    ARRAY['dauer', 'schnell', 'wie lange', 'vermittlung', 'wartezeit'],
    9
  ),
  (
    (SELECT id FROM knowledge_categories WHERE slug = 'qualifikationen'),
    'Welche Qualifikationen haben die Betreuungskräfte?',
    'Alle Betreuungskräfte von Primundus verfügen über relevante Erfahrung in der Pflege und Betreuung. Viele haben pflegerische Ausbildungen oder langjährige Erfahrung in der Altenpflege. Primundus prüft alle Qualifikationen und Referenzen sorgfältig.',
    ARRAY['qualifikation', 'ausbildung', 'erfahrung', 'pflegekraft', 'kompetenz'],
    8
  ),
  (
    (SELECT id FROM knowledge_categories WHERE slug = 'ueber-primundus'),
    'Über Primundus',
    'Primundus ist ein erfahrener Anbieter für 24-Stunden-Betreuung mit Hauptsitz auf Mallorca. Das Unternehmen vermittelt qualifizierte Betreuungskräfte für die häusliche Pflege in Deutschland. Primundus legt großen Wert auf Qualität, Zuverlässigkeit und persönliche Beratung.',
    ARRAY['primundus', 'unternehmen', 'firma', 'wer seid ihr', 'über uns'],
    7
  )
ON CONFLICT DO NOTHING;