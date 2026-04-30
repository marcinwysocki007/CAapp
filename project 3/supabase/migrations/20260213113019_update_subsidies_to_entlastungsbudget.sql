/*
  # Aktualisierung Zuschüsse: Einführung Entlastungsbudget

  ## Änderungen
  Seit dem 1. Juli 2025 gibt es ein neues Entlastungsbudget, das die bisherigen
  separaten Budgets für Kurzzeitpflege und Verhinderungspflege zusammenfasst.
  
  1. Deaktivierung für Kalkulation
     - Verhinderungspflege: wird nicht mehr für Eigenanteil-Berechnung verwendet
     - Kurzzeitpflege: wird nicht mehr für Eigenanteil-Berechnung verwendet
     
  2. Neues Entlastungsbudget
     - name: entlastungsbudget_neu
     - label: Entlastungsbudget (3.539 Euro/Jahr ab Pflegegrad 2)
     - betrag: 3.539 € pro Jahr (ab Pflegegrad 2)
     - in_kalkulation: true (wird direkt vom Eigenanteil abgezogen)
  
  ## Beträge
  - Pflegegrad 0: 0 € (kein Anspruch)
  - Pflegegrad 1: 0 € (kein Anspruch)
  - Pflegegrad 2-5: 3.539 € pro Jahr
*/

-- Deaktiviere Verhinderungspflege und Kurzzeitpflege für Kalkulation
UPDATE subsidies_config 
SET in_kalkulation = false, 
    updated_at = now()
WHERE name IN ('verhinderungspflege', 'kurzzeitpflege');

-- Füge neues Entlastungsbudget hinzu
INSERT INTO subsidies_config (
  name,
  label,
  beschreibung,
  typ,
  aktiv,
  sortierung,
  in_kalkulation
) VALUES (
  'entlastungsbudget_neu',
  'Entlastungsbudget (3.539 Euro/Jahr ab Pflegegrad 2)',
  'Seit dem 1. Juli 2025 gilt das neue Entlastungsbudget: Ein gemeinsamer Jahresbetrag für Kurzzeitpflege und Verhinderungspflege ersetzt die bisher getrennten Budgets. Pflegebedürftigen ab Pflegegrad 2 stehen dafür jährlich bis zu 3.539 Euro zur Verfügung. Dieser Betrag kann flexibel für die 24h-Betreuung eingesetzt werden.',
  'jaehrlich',
  true,
  2,
  true
);

-- Füge Beträge für das neue Entlastungsbudget hinzu
INSERT INTO subsidies_values (
  subsidy_id,
  bedingung_key,
  bedingung_value,
  betrag,
  betrag_typ,
  hinweis,
  aktiv
)
SELECT 
  sc.id,
  'pflegegrad',
  pg.value,
  CASE 
    WHEN pg.value::int < 2 THEN 0
    ELSE 3539
  END,
  'fix',
  CASE 
    WHEN pg.value::int < 2 THEN 'Kein Anspruch'
    ELSE 'Bis zu 3.539 €/Jahr (seit 1.7.2025)'
  END,
  true
FROM subsidies_config sc
CROSS JOIN (VALUES ('0'), ('1'), ('2'), ('3'), ('4'), ('5')) AS pg(value)
WHERE sc.name = 'entlastungsbudget_neu';
