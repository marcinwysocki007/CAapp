/*
  # Aktualisierung Pflegegeld-Werte auf 2026

  ## Änderungen
  Aktualisierung der Pflegegeld-Beträge auf die neuen 2026-Werte:
  - Pflegegrad 1: 0 € (unverändert)
  - Pflegegrad 2: 347 € (vorher 332 €)
  - Pflegegrad 3: 599 € (vorher 573 €)
  - Pflegegrad 4: 800 € (vorher 765 €)
  - Pflegegrad 5: 990 € (vorher 947 €)
*/

-- Aktualisiere Pflegegeld-Beträge für 2026
UPDATE subsidies_values
SET betrag = CASE bedingung_value
  WHEN '0' THEN 0
  WHEN '1' THEN 0
  WHEN '2' THEN 347
  WHEN '3' THEN 599
  WHEN '4' THEN 800
  WHEN '5' THEN 990
  ELSE betrag
END
WHERE subsidy_id = (
  SELECT id FROM subsidies_config WHERE name = 'pflegegeld'
)
AND bedingung_key = 'pflegegrad';
