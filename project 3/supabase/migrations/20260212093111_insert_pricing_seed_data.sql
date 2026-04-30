/*
  # Preiskonfigurations-Beispieldaten

  Befüllt pricing_config mit allen Preiskomponenten:
  - Basispreis: 2.800 €
  - Betreuung für: Einzelperson (0 €) | Ehepaar (+450 €)
  - Pflegegrad: 0-5 (0 € bis +700 €)
  - Weitere Personen: Nein/Ja
  - Mobilität: Mobil bis Bettlägerig (+0 € bis +500 €)
  - Nachteinsätze: Nein bis Mehrmals (+0 € bis +650 €)
  - Deutschkenntnisse: Grundlegend bis Sehr gut (+0 € bis +450 €)
  - Erfahrung: Einsteiger bis Spezialisiert (+0 € bis +550 €)
*/

-- BASISPREIS
INSERT INTO pricing_config (kategorie, antwort_key, antwort_label, aufschlag_euro, sortierung) VALUES
('basis', 'grundpreis', 'Monatlicher Grundpreis 24h-Betreuung', 2800.00, 0);

-- BETREUUNG FÜR
INSERT INTO pricing_config (kategorie, antwort_key, antwort_label, aufschlag_euro, sortierung) VALUES
('betreuung_fuer', 'einzelperson', '1 Person', 0.00, 1),
('betreuung_fuer', 'ehepaar', 'Ehepaar', 450.00, 2);

-- PFLEGEGRAD
INSERT INTO pricing_config (kategorie, antwort_key, antwort_label, aufschlag_euro, sortierung) VALUES
('pflegegrad', '0', 'Kein Pflegegrad', 0.00, 1),
('pflegegrad', '1', 'Pflegegrad 1', 100.00, 2),
('pflegegrad', '2', 'Pflegegrad 2', 200.00, 3),
('pflegegrad', '3', 'Pflegegrad 3', 350.00, 4),
('pflegegrad', '4', 'Pflegegrad 4', 500.00, 5),
('pflegegrad', '5', 'Pflegegrad 5', 700.00, 6);

-- WEITERE PERSONEN IM HAUSHALT
INSERT INTO pricing_config (kategorie, antwort_key, antwort_label, aufschlag_euro, sortierung) VALUES
('weitere_personen', 'nein', 'Nein', 0.00, 1),
('weitere_personen', 'ja', 'Ja', 0.00, 2);

-- MOBILITÄT
INSERT INTO pricing_config (kategorie, antwort_key, antwort_label, aufschlag_euro, sortierung) VALUES
('mobilitaet', 'mobil', 'Mobil – geht selbstständig', 0.00, 1),
('mobilitaet', 'rollator', 'Eingeschränkt – nur mit Rollator', 150.00, 2),
('mobilitaet', 'rollstuhl', 'Auf Rollstuhl angewiesen', 300.00, 3),
('mobilitaet', 'bettlaegerig', 'Bettlägerig', 500.00, 4);

-- NACHTEINSÄTZE
INSERT INTO pricing_config (kategorie, antwort_key, antwort_label, aufschlag_euro, sortierung) VALUES
('nachteinsaetze', 'nein', 'Nein', 0.00, 1),
('nachteinsaetze', 'gelegentlich', 'Gelegentlich', 200.00, 2),
('nachteinsaetze', 'taeglich', 'Täglich (1×)', 400.00, 3),
('nachteinsaetze', 'mehrmals_nachts', 'Mehrmals nachts', 650.00, 4);

-- DEUTSCHKENNTNISSE
INSERT INTO pricing_config (kategorie, antwort_key, antwort_label, aufschlag_euro, sortierung) VALUES
('deutschkenntnisse', 'grundlegend', 'Grundlegend', 0.00, 1),
('deutschkenntnisse', 'kommunikativ', 'Kommunikativ', 200.00, 2),
('deutschkenntnisse', 'sehr_gut', 'Sehr gut', 450.00, 3);

-- ERFAHRUNG
INSERT INTO pricing_config (kategorie, antwort_key, antwort_label, aufschlag_euro, sortierung) VALUES
('erfahrung', 'einsteiger', 'Einsteiger', 0.00, 1),
('erfahrung', 'erfahren', 'Erfahren', 300.00, 2),
('erfahrung', 'spezialisiert', 'Spezialisiert (z.B. Demenz)', 550.00, 3);