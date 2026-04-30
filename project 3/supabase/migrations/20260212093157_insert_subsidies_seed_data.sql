/*
  # Zuschüsse und Fördermittel - Beispieldaten

  Befüllt subsidies_config und subsidies_values mit allen Zuschüssen:
  1. Pflegegeld (332-947 € nach Pflegegrad)
  2. Verhinderungspflege (bis 1.612 €/Jahr ab PG 2)
  3. Steuerliche Absetzbarkeit (20%, max. 4.000 €/Jahr)
  4. Kurzzeitpflege (bis 1.774 €/Jahr ab PG 2)
  5. Entlastungsbetrag (125 €/Monat ab PG 1)
  6. Wohnraumanpassung (einmalig bis 4.000 €)
  7. Pflegehilfsmittel (40 €/Monat ab PG 1)
  8. Hilfe zur Pflege (individuell vom Sozialamt)
*/

-- ═══════════════════════════════════════
-- 1. PFLEGEGELD
-- ═══════════════════════════════════════
INSERT INTO subsidies_config (name, label, beschreibung, typ, sortierung) VALUES
('pflegegeld', 'Pflegegeld', 
 'Das Pflegegeld wird von der Pflegekasse an Versicherte gezahlt, die ihre Pflege selbst organisieren (z.B. durch eine 24h-Betreuungskraft). Es wird monatlich direkt an den Pflegebedürftigen überwiesen und kann frei verwendet werden. Bei Kombination mit einem ambulanten Pflegedienst wird anteilig Kombinationsleistung gezahlt.',
 'monatlich', 1);

INSERT INTO subsidies_values (subsidy_id, bedingung_key, bedingung_value, betrag, hinweis) VALUES
((SELECT id FROM subsidies_config WHERE name = 'pflegegeld'), 'pflegegrad', '0', 0.00, 'Kein Anspruch ohne Pflegegrad'),
((SELECT id FROM subsidies_config WHERE name = 'pflegegeld'), 'pflegegrad', '1', 0.00, 'Bei Pflegegrad 1 besteht kein Anspruch auf Pflegegeld'),
((SELECT id FROM subsidies_config WHERE name = 'pflegegeld'), 'pflegegrad', '2', 332.00, NULL),
((SELECT id FROM subsidies_config WHERE name = 'pflegegeld'), 'pflegegrad', '3', 573.00, NULL),
((SELECT id FROM subsidies_config WHERE name = 'pflegegeld'), 'pflegegrad', '4', 765.00, NULL),
((SELECT id FROM subsidies_config WHERE name = 'pflegegeld'), 'pflegegrad', '5', 947.00, NULL);

-- ═══════════════════════════════════════
-- 2. VERHINDERUNGSPFLEGE
-- ═══════════════════════════════════════
INSERT INTO subsidies_config (name, label, beschreibung, typ, sortierung) VALUES
('verhinderungspflege', 'Verhinderungspflege',
 'Wenn die reguläre Pflegeperson (z.B. ein Angehöriger) verhindert ist, übernimmt die Pflegekasse die Kosten für eine Ersatzpflege. Der Anspruch besteht ab Pflegegrad 2 und beträgt bis zu 1.612 € pro Jahr. Zusätzlich können bis zu 806 € aus dem Kurzzeitpflege-Budget umgewidmet werden, sodass insgesamt bis zu 2.418 € pro Jahr verfügbar sind.',
 'jaehrlich', 2);

INSERT INTO subsidies_values (subsidy_id, bedingung_key, bedingung_value, betrag, hinweis) VALUES
((SELECT id FROM subsidies_config WHERE name = 'verhinderungspflege'), 'pflegegrad', '0', 0.00, 'Kein Anspruch'),
((SELECT id FROM subsidies_config WHERE name = 'verhinderungspflege'), 'pflegegrad', '1', 0.00, 'Kein Anspruch bei Pflegegrad 1'),
((SELECT id FROM subsidies_config WHERE name = 'verhinderungspflege'), 'pflegegrad', '2', 1612.00, 'Bis zu 1.612 €/Jahr, erweiterbar auf 2.418 € mit Kurzzeitpflege'),
((SELECT id FROM subsidies_config WHERE name = 'verhinderungspflege'), 'pflegegrad', '3', 1612.00, 'Bis zu 1.612 €/Jahr, erweiterbar auf 2.418 € mit Kurzzeitpflege'),
((SELECT id FROM subsidies_config WHERE name = 'verhinderungspflege'), 'pflegegrad', '4', 1612.00, 'Bis zu 1.612 €/Jahr, erweiterbar auf 2.418 € mit Kurzzeitpflege'),
((SELECT id FROM subsidies_config WHERE name = 'verhinderungspflege'), 'pflegegrad', '5', 1612.00, 'Bis zu 1.612 €/Jahr, erweiterbar auf 2.418 € mit Kurzzeitpflege');

-- ═══════════════════════════════════════
-- 3. STEUERLICHE ABSETZBARKEIT
-- ═══════════════════════════════════════
INSERT INTO subsidies_config (name, label, beschreibung, typ, sortierung) VALUES
('steuervorteil', 'Steuerliche Absetzbarkeit',
 'Die Kosten einer 24h-Betreuung sind als haushaltsnahe Dienstleistung steuerlich absetzbar. 20% der Aufwendungen können direkt von der Steuerschuld abgezogen werden, maximal 4.000 € pro Jahr (= 333 € pro Monat). Bei außergewöhnlichen Belastungen können unter Umständen weitere Beträge geltend gemacht werden. Bitte konsultieren Sie Ihren Steuerberater.',
 'jaehrlich', 3);

INSERT INTO subsidies_values (subsidy_id, bedingung_key, bedingung_value, betrag, betrag_typ, hinweis) VALUES
((SELECT id FROM subsidies_config WHERE name = 'steuervorteil'), NULL, NULL, 20.00, 'prozent_vom_brutto', 'Max. 4.000 € pro Jahr (= ca. 333 €/Monat). 20% der Kosten, direkt von der Steuerschuld abziehbar.');

-- ═══════════════════════════════════════
-- 4. KURZZEITPFLEGE
-- ═══════════════════════════════════════
INSERT INTO subsidies_config (name, label, beschreibung, typ, sortierung) VALUES
('kurzzeitpflege', 'Kurzzeitpflege-Budget',
 'Das Kurzzeitpflege-Budget beträgt bis zu 1.774 € pro Jahr (ab Pflegegrad 2). Es kann für vorübergehende Pflege in einer Einrichtung genutzt werden, z.B. nach einem Krankenhausaufenthalt. Alternativ können bis zu 806 € auf die Verhinderungspflege umgewidmet werden. Nicht in Anspruch genommene Mittel verfallen am Jahresende.',
 'jaehrlich', 4);

INSERT INTO subsidies_values (subsidy_id, bedingung_key, bedingung_value, betrag, hinweis) VALUES
((SELECT id FROM subsidies_config WHERE name = 'kurzzeitpflege'), 'pflegegrad', '0', 0.00, 'Kein Anspruch'),
((SELECT id FROM subsidies_config WHERE name = 'kurzzeitpflege'), 'pflegegrad', '1', 0.00, 'Kein Anspruch bei Pflegegrad 1'),
((SELECT id FROM subsidies_config WHERE name = 'kurzzeitpflege'), 'pflegegrad', '2', 1774.00, 'Bis zu 1.774 €/Jahr'),
((SELECT id FROM subsidies_config WHERE name = 'kurzzeitpflege'), 'pflegegrad', '3', 1774.00, 'Bis zu 1.774 €/Jahr'),
((SELECT id FROM subsidies_config WHERE name = 'kurzzeitpflege'), 'pflegegrad', '4', 1774.00, 'Bis zu 1.774 €/Jahr'),
((SELECT id FROM subsidies_config WHERE name = 'kurzzeitpflege'), 'pflegegrad', '5', 1774.00, 'Bis zu 1.774 €/Jahr');

-- ═══════════════════════════════════════
-- 5. ENTLASTUNGSBETRAG
-- ═══════════════════════════════════════
INSERT INTO subsidies_config (name, label, beschreibung, typ, sortierung) VALUES
('entlastungsbetrag', 'Entlastungsbetrag',
 'Der Entlastungsbetrag beträgt 125 € pro Monat und steht allen Pflegebedürftigen ab Pflegegrad 1 zu. Er ist zweckgebunden für qualitätsgesicherte Entlastungsangebote. Nicht genutzte Beträge können ins Folgequartal übertragen werden. Er kann für anerkannte Betreuungsangebote eingesetzt werden.',
 'monatlich', 5);

INSERT INTO subsidies_values (subsidy_id, bedingung_key, bedingung_value, betrag, hinweis) VALUES
((SELECT id FROM subsidies_config WHERE name = 'entlastungsbetrag'), 'pflegegrad', '0', 0.00, 'Kein Anspruch'),
((SELECT id FROM subsidies_config WHERE name = 'entlastungsbetrag'), 'pflegegrad', '1', 125.00, NULL),
((SELECT id FROM subsidies_config WHERE name = 'entlastungsbetrag'), 'pflegegrad', '2', 125.00, NULL),
((SELECT id FROM subsidies_config WHERE name = 'entlastungsbetrag'), 'pflegegrad', '3', 125.00, NULL),
((SELECT id FROM subsidies_config WHERE name = 'entlastungsbetrag'), 'pflegegrad', '4', 125.00, NULL),
((SELECT id FROM subsidies_config WHERE name = 'entlastungsbetrag'), 'pflegegrad', '5', 125.00, NULL);

-- ═══════════════════════════════════════
-- 6. WOHNRAUMANPASSUNG
-- ═══════════════════════════════════════
INSERT INTO subsidies_config (name, label, beschreibung, typ, sortierung) VALUES
('wohnraumanpassung', 'Wohnraumanpassung (Pflegekasse)',
 'Für Maßnahmen zur Verbesserung des Wohnumfelds (z.B. Treppenlift, barrierefreies Bad, Türverbreiterungen) zahlt die Pflegekasse bis zu 4.000 € pro Maßnahme. Bei mehreren Pflegebedürftigen im Haushalt maximal 16.000 €. Der Antrag muss VOR Beginn der Maßnahme gestellt werden.',
 'einmalig', 6);

INSERT INTO subsidies_values (subsidy_id, bedingung_key, bedingung_value, betrag, hinweis) VALUES
((SELECT id FROM subsidies_config WHERE name = 'wohnraumanpassung'), 'pflegegrad', '0', 0.00, 'Kein Anspruch'),
((SELECT id FROM subsidies_config WHERE name = 'wohnraumanpassung'), 'pflegegrad', '1', 4000.00, 'Einmalig bis zu 4.000 € pro Maßnahme'),
((SELECT id FROM subsidies_config WHERE name = 'wohnraumanpassung'), 'pflegegrad', '2', 4000.00, 'Einmalig bis zu 4.000 € pro Maßnahme'),
((SELECT id FROM subsidies_config WHERE name = 'wohnraumanpassung'), 'pflegegrad', '3', 4000.00, 'Einmalig bis zu 4.000 € pro Maßnahme'),
((SELECT id FROM subsidies_config WHERE name = 'wohnraumanpassung'), 'pflegegrad', '4', 4000.00, 'Einmalig bis zu 4.000 € pro Maßnahme'),
((SELECT id FROM subsidies_config WHERE name = 'wohnraumanpassung'), 'pflegegrad', '5', 4000.00, 'Einmalig bis zu 4.000 € pro Maßnahme');

-- ═══════════════════════════════════════
-- 7. PFLEGEHILFSMITTEL
-- ═══════════════════════════════════════
INSERT INTO subsidies_config (name, label, beschreibung, typ, sortierung) VALUES
('pflegehilfsmittel', 'Pflegehilfsmittel zum Verbrauch',
 'Pflegebedürftige haben ab Pflegegrad 1 Anspruch auf bis zu 40 € monatlich für Pflegehilfsmittel zum Verbrauch (z.B. Einmalhandschuhe, Bettschutzeinlagen, Desinfektionsmittel). Die Lieferung kann über einen Pflegehilfsmittel-Anbieter direkt mit der Pflegekasse abgerechnet werden.',
 'monatlich', 7);

INSERT INTO subsidies_values (subsidy_id, bedingung_key, bedingung_value, betrag, hinweis) VALUES
((SELECT id FROM subsidies_config WHERE name = 'pflegehilfsmittel'), 'pflegegrad', '0', 0.00, 'Kein Anspruch'),
((SELECT id FROM subsidies_config WHERE name = 'pflegehilfsmittel'), 'pflegegrad', '1', 40.00, NULL),
((SELECT id FROM subsidies_config WHERE name = 'pflegehilfsmittel'), 'pflegegrad', '2', 40.00, NULL),
((SELECT id FROM subsidies_config WHERE name = 'pflegehilfsmittel'), 'pflegegrad', '3', 40.00, NULL),
((SELECT id FROM subsidies_config WHERE name = 'pflegehilfsmittel'), 'pflegegrad', '4', 40.00, NULL),
((SELECT id FROM subsidies_config WHERE name = 'pflegehilfsmittel'), 'pflegegrad', '5', 40.00, NULL);

-- ═══════════════════════════════════════
-- 8. HILFE ZUR PFLEGE (SOZIALAMT)
-- ═══════════════════════════════════════
INSERT INTO subsidies_config (name, label, beschreibung, typ, sortierung) VALUES
('hilfe_zur_pflege', 'Hilfe zur Pflege (Sozialamt)',
 'Wenn das eigene Einkommen und Vermögen nicht ausreichen, kann das Sozialamt die Pflegekosten ganz oder teilweise übernehmen („Hilfe zur Pflege" nach SGB XII). Es gelten Einkommens- und Vermögensgrenzen. Der Antrag wird beim zuständigen Sozialamt gestellt. Seit 2020 werden Kinder erst ab einem Jahreseinkommen von 100.000 € zum Unterhalt herangezogen.',
 'monatlich', 8);

INSERT INTO subsidies_values (subsidy_id, bedingung_key, bedingung_value, betrag, betrag_typ, hinweis) VALUES
((SELECT id FROM subsidies_config WHERE name = 'hilfe_zur_pflege'), NULL, NULL, 0.00, 'fix', 'Individuell – abhängig von Einkommen und Vermögen. Beratung empfohlen.');