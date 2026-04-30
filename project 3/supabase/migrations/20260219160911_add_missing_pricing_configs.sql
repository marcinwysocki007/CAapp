/*
  # Füge fehlende Pricing-Konfigurationen hinzu

  1. Fügt fehlende Einträge für Führerschein und Geschlecht hinzu
  2. Korrigiert bestehende Einträge für bessere Kompatibilität
  
  ## Neue Einträge:
  
  ### Führerschein (fuehrerschein)
  - egal: Egal (0 €)
  - ja: Ja (0 €)
  - nein: Nein (0 €)
  
  ### Geschlecht (geschlecht)
  - egal: Egal (0 €)
  - weiblich: Weiblich (0 €)
  - maennlich: Männlich (0 €)
  
  ## Korrigierte Keys:
  - betreuung_fuer: einzelperson → 1-person
  - deutschkenntnisse: sehr_gut → sehr-gut
  - erfahrung: spezialisiert → sehr-erfahren
  - nachteinsaetze: mehrmals_nachts → mehrmals
*/

-- Füge Führerschein-Optionen hinzu (nur wenn sie noch nicht existieren)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pricing_config WHERE kategorie = 'fuehrerschein' AND antwort_key = 'egal') THEN
    INSERT INTO pricing_config (kategorie, antwort_key, antwort_label, aufschlag_euro, sortierung, aktiv)
    VALUES ('fuehrerschein', 'egal', 'Egal', 0, 1, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pricing_config WHERE kategorie = 'fuehrerschein' AND antwort_key = 'ja') THEN
    INSERT INTO pricing_config (kategorie, antwort_key, antwort_label, aufschlag_euro, sortierung, aktiv)
    VALUES ('fuehrerschein', 'ja', 'Ja', 0, 2, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pricing_config WHERE kategorie = 'fuehrerschein' AND antwort_key = 'nein') THEN
    INSERT INTO pricing_config (kategorie, antwort_key, antwort_label, aufschlag_euro, sortierung, aktiv)
    VALUES ('fuehrerschein', 'nein', 'Nein', 0, 3, true);
  END IF;
END $$;

-- Füge Geschlecht-Optionen hinzu (nur wenn sie noch nicht existieren)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pricing_config WHERE kategorie = 'geschlecht' AND antwort_key = 'egal') THEN
    INSERT INTO pricing_config (kategorie, antwort_key, antwort_label, aufschlag_euro, sortierung, aktiv)
    VALUES ('geschlecht', 'egal', 'Egal', 0, 1, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pricing_config WHERE kategorie = 'geschlecht' AND antwort_key = 'weiblich') THEN
    INSERT INTO pricing_config (kategorie, antwort_key, antwort_label, aufschlag_euro, sortierung, aktiv)
    VALUES ('geschlecht', 'weiblich', 'Weiblich', 0, 2, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pricing_config WHERE kategorie = 'geschlecht' AND antwort_key = 'maennlich') THEN
    INSERT INTO pricing_config (kategorie, antwort_key, antwort_label, aufschlag_euro, sortierung, aktiv)
    VALUES ('geschlecht', 'maennlich', 'Männlich', 0, 3, true);
  END IF;
END $$;

-- Aktualisiere bestehende Einträge mit korrigierten Keys
UPDATE pricing_config SET antwort_key = '1-person' WHERE kategorie = 'betreuung_fuer' AND antwort_key = 'einzelperson';
UPDATE pricing_config SET antwort_key = 'sehr-gut' WHERE kategorie = 'deutschkenntnisse' AND antwort_key = 'sehr_gut';
UPDATE pricing_config SET antwort_key = 'sehr-erfahren', antwort_label = 'Sehr erfahren' WHERE kategorie = 'erfahrung' AND antwort_key = 'spezialisiert';
UPDATE pricing_config SET antwort_key = 'mehrmals' WHERE kategorie = 'nachteinsaetze' AND antwort_key = 'mehrmals_nachts';