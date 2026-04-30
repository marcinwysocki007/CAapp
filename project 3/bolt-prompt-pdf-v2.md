# Bolt Prompt: PDF-Kalkulation überarbeiten (V2)

Die aktuelle PDF ist zu dünn und rechnet Zuschüsse falsch. Bitte komplett überarbeiten nach folgendem Aufbau. Die PDF soll 4-5 Seiten haben und ein vollständiges Informationsdokument sein, das der Kunde an seine Familie weiterleiten kann.

---

## SEITE 1: Ihre persönliche Kostenübersicht

### Header (auf jeder Seite gleich)
- Primundus Logo links
- "Ihre persönliche 24h-Pflege-Kalkulation" als Titel
- Erstellt am: [DATUM]
- Bestpreis-Garantie gültig bis: [DATUM + 14 Tage]

### Block: Ihre Angaben
Kompakte Zusammenfassung der Formulareingaben in einer 2-Spalten-Darstellung:

```
Betreuung für:        Einzelperson / Ehepaar
Pflegegrad:           [X]
Mobilität:            [Wert, z.B. "Eingeschränkt – Rollator"]
Nachteinsätze:        [Wert, z.B. "Gelegentlich"]
Deutschkenntnisse:    [Wert, z.B. "Kommunikativ"]
Erfahrung:            [Wert, z.B. "Erfahren"]
```

### Block: Kostenübersicht

```
Monatlicher Bruttopreis                          3.050,00 €

Direkt anrechenbare Zuschüsse:
  Pflegegeld (Pflegegrad 4)                      -  765,00 €
  Verhinderungspflege (anteilig mtl.)             -  134,33 €
  Steuervorteil (§35a EStG, anteilig mtl.)        -  333,33 €
                                                  ───────────
  IHR MONATLICHER EIGENANTEIL                      1.817,34 €
```

Der Eigenanteil-Betrag groß und prominent darstellen.

Hinweis klein darunter:
"Zzgl. Kost & Logis für die Pflegekraft (Verpflegung und eigenes Zimmer). An- und Abreisekosten der Pflegekraft sowie Feiertagszuschläge fallen nach Aufwand an."

### Block: Preiszusammensetzung (Transparenz)
Zeige wie sich der Bruttopreis zusammensetzt:

```
So setzt sich Ihr Preis zusammen:
  Grundpreis 24h-Betreuung                        2.800,00 €
  Mobilität (Rollator)                            +  150,00 €
  Deutschkenntnisse (Kommunikativ)                +  200,00 €
  Nachteinsätze (Gelegentlich)                    +  200,00 €
  [etc. – nur Positionen mit Aufschlag > 0 zeigen]
                                                  ───────────
  Bruttopreis                                      3.050,00 €
```

---

## SEITE 2: Zuschüsse & Fördermöglichkeiten im Detail

### Einleitung
"Die Finanzierung einer 24-Stunden-Betreuung wird durch verschiedene Leistungen der Pflegeversicherung und steuerliche Vorteile unterstützt. Nachfolgend erläutern wir alle Zuschüsse – unterteilt in Leistungen, die Ihren monatlichen Eigenanteil direkt reduzieren, und weitere Fördermöglichkeiten, die Sie zusätzlich beantragen können."

### Block A: Zuschüsse, die Ihren Eigenanteil direkt reduzieren

**1. Pflegegeld – [Betrag] € / Monat**
Das Pflegegeld wird von der Pflegekasse monatlich direkt an die pflegebedürftige Person ausgezahlt. Es steht ab Pflegegrad 2 zur Verfügung und kann frei verwendet werden – also auch zur Finanzierung der 24h-Betreuung.

Übersicht Pflegegeld nach Pflegegrad (Tabelle, aktuelle Stufe hervorheben):
| Pflegegrad | Pflegegeld / Monat |
|---|---|
| 1 | kein Anspruch |
| 2 | 332 € |
| 3 | 573 € |
| 4 | 765 € ← Ihr Pflegegrad |
| 5 | 947 € |

Hinweis: "Bei Kombination mit einem ambulanten Pflegedienst wird anteilig Kombinationsleistung gezahlt. Sprechen Sie dazu mit Ihrer Pflegekasse."

**2. Verhinderungspflege – [Betrag] € / Jahr (= [Betrag] € / Monat anteilig)**
Wenn eine Pflegeperson (z.B. ein Angehöriger) die häusliche Pflege regelmäßig übernimmt und zeitweise verhindert ist, zahlt die Pflegekasse bis zu 1.612 € pro Jahr für eine Ersatzpflege. Dieser Betrag kann für die 24h-Betreuung eingesetzt werden.

Zusätzlich können bis zu 806 € aus dem nicht genutzten Kurzzeitpflege-Budget umgewidmet werden – damit stehen bis zu 2.418 € pro Jahr zur Verfügung.

Voraussetzung: Pflegegrad 2 oder höher. Die Pflegeperson muss die Pflege seit mindestens 6 Monaten übernehmen.

Hinweis: "Der Betrag wird nicht automatisch ausgezahlt. Er muss bei der Pflegekasse beantragt werden, in der Regel gegen Vorlage der Rechnungen."

**3. Steuerliche Absetzbarkeit – bis zu 333 € / Monat**
Die Kosten der 24h-Betreuung sind als haushaltsnahe Dienstleistung nach §35a EStG steuerlich absetzbar. 20% der Aufwendungen können direkt von der Steuerschuld abgezogen werden, maximal 4.000 € pro Jahr (= 333,33 € pro Monat).

Bei Ihrem Bruttopreis von [BETRAG] € ergibt sich ein jährlicher Steuervorteil von [MIN(Brutto*12*0.2, 4000)] €.

Hinweis: "Der tatsächliche Steuervorteil hängt von Ihrer persönlichen Steuersituation ab. Bitte konsultieren Sie Ihren Steuerberater für eine genaue Berechnung."

### Block B: Weitere Fördermöglichkeiten

Einleitung: "Die folgenden Leistungen reduzieren nicht direkt Ihren monatlichen Eigenanteil, stehen Ihnen aber zusätzlich zur Verfügung und können die Gesamtbelastung weiter senken."

**4. Entlastungsbetrag – 125 € / Monat**
Allen Pflegebedürftigen ab Pflegegrad 1 stehen 125 € monatlich für anerkannte Entlastungsangebote zu (z.B. Tagesbetreuung, Haushaltshilfe, Betreuungsgruppen). Der Betrag ist zweckgebunden und kann nur für nach Landesrecht anerkannte Angebote eingesetzt werden. Nicht genutzte Beträge können innerhalb des laufenden Jahres angespart und im ersten Halbjahr des Folgejahres verbraucht werden.

Hinweis: "Ob der Entlastungsbetrag für die 24h-Betreuung anrechenbar ist, hängt vom Anbieter und der Anerkennung nach Landesrecht ab. Sprechen Sie uns dazu gerne an."

**5. Kurzzeitpflege-Budget – bis zu 1.774 € / Jahr**
Das Kurzzeitpflege-Budget kann für eine vorübergehende vollstationäre Pflege genutzt werden, z.B. nach einem Krankenhausaufenthalt oder wenn die häusliche Pflege vorübergehend nicht möglich ist. Bis zu 806 € davon können alternativ für die Verhinderungspflege umgewidmet werden (siehe oben).

Ab Pflegegrad 2. Der Anspruch verfällt am Jahresende.

**6. Wohnraumanpassung – bis zu 4.000 € einmalig**
Für Maßnahmen zur Verbesserung des Wohnumfelds zahlt die Pflegekasse bis zu 4.000 € pro Maßnahme (ab Pflegegrad 1). Typische Maßnahmen:
- Barrierefreies Bad (bodengleiche Dusche statt Badewanne)
- Treppenlift oder Rampe
- Türverbreiterungen für Rollstuhl
- Haltegriffe und Handläufe

Wichtig: Der Antrag muss VOR Beginn der Maßnahme bei der Pflegekasse gestellt werden. Bei mehreren Pflegebedürftigen im Haushalt sind bis zu 16.000 € möglich.

**7. Pflegehilfsmittel zum Verbrauch – 40 € / Monat**
Für Pflegehilfsmittel wie Einmalhandschuhe, Bettschutzeinlagen, Desinfektionsmittel und Mundschutz stehen 40 € monatlich zur Verfügung (ab Pflegegrad 1). Die Abrechnung erfolgt in der Regel direkt zwischen dem Lieferanten und der Pflegekasse – Sie müssen nichts vorstrecken.

**8. Hilfe zur Pflege (Sozialamt)**
Wenn das Einkommen und Vermögen der pflegebedürftigen Person nicht ausreichen, kann das Sozialamt die Pflegekosten ganz oder teilweise übernehmen. Es gelten Einkommens- und Vermögensgrenzen. Seit 2020 werden Kinder erst ab einem Jahreseinkommen von 100.000 € brutto zum Unterhalt herangezogen.

Hinweis: "Der Antrag wird beim zuständigen Sozialamt gestellt. Wir empfehlen eine individuelle Beratung."

---

## SEITE 3: So funktioniert die 24-Stunden-Pflege

### Was ist 24-Stunden-Pflege?
"Bei der häuslichen 24-Stunden-Betreuung zieht eine qualifizierte Betreuungskraft bei Ihnen ein und unterstützt die pflegebedürftige Person im täglichen Leben. Die Pflegekraft lebt und arbeitet für einen vereinbarten Zeitraum (in der Regel 6-8 Wochen) mit Ihnen unter einem Dach und wird dann von einer eingearbeiteten Kollegin abgelöst.

Der Begriff '24-Stunden-Pflege' bedeutet nicht, dass die Betreuungskraft rund um die Uhr arbeitet. Die tägliche Arbeitszeit umfasst die vereinbarten Stunden plus Bereitschaftszeiten. Ruhezeiten und Freizeit müssen eingehalten werden – das ist wichtig für eine langfristig erfolgreiche Betreuung."

### Was leisten unsere Pflegekräfte?

**Grundpflege**
- Körperpflege und Hygiene (Waschen, Duschen, Baden)
- An- und Auskleiden
- Unterstützung bei der Mobilität (Aufstehen, Hinsetzen, Gehen)
- Hilfe bei der Nahrungsaufnahme
- Inkontinenzversorgung
- Lagerung und Unterstützung bei Bettlägerigkeit

**Haushaltsführung**
- Kochen und Zubereitung der Mahlzeiten
- Einkaufen und Besorgungen
- Wäsche waschen und bügeln
- Reinigung der Wohnung
- Müllentsorgung und Ordnung

**Alltagsbetreuung & Aktivierung**
- Gesellschaft leisten und Gespräche führen
- Gemeinsame Spaziergänge und Ausflüge
- Begleitung zu Arztterminen und Behördengängen
- Unterstützung bei sozialen Kontakten
- Vorlesen, Spiele, gemeinsame Aktivitäten
- Strukturierung des Tagesablaufs

**Nicht enthalten: Medizinische Behandlungspflege**
Medizinische Leistungen wie Medikamentengabe, Injektionen, Infusionen, Verbandswechsel oder Wundversorgung werden bei Bedarf ergänzend von einem ambulanten Pflegedienst erbracht. Die Kosten dafür werden in der Regel von der Pflegekasse über Pflegesachleistungen abgedeckt.

### Voraussetzungen für die 24h-Betreuung
"Damit die Betreuung von Beginn an gut funktioniert, sollten folgende Voraussetzungen gegeben sein:

**Eigenes Zimmer für die Pflegekraft**
Die Betreuungskraft benötigt ein eigenes Zimmer als Rückzugsort – für Pausen, Freizeit und erholsamen Schlaf. Das ist Grundvoraussetzung für eine motivierte und leistungsfähige Pflegekraft.

**Freie Kost und Logis**
Die Pflegekraft wird von Ihnen verköstigt und wohnt kostenfrei in Ihrem Haushalt. Die Kosten für Lebensmittel tragen Sie selbst – rechnen Sie mit ca. 150-250 € monatlich zusätzlich.

**Offenheit und gegenseitiger Respekt**
Die Pflegekraft wird Teil Ihres Alltags. Je wertschätzender das Miteinander, desto besser die Betreuung. Ein guter Start beginnt mit einer herzlichen Aufnahme.

**Klare Absprachen**
Tagesablauf, Aufgaben, Ruhezeiten und Erwartungen sollten offen besprochen werden. Ihr persönlicher Primundus-Berater unterstützt Sie dabei."

### Wie läuft der Wechsel der Pflegekräfte?
"Unsere Pflegekräfte arbeiten in einem Wechselrhythmus von 6-8 Wochen. Danach reist eine eingearbeitete Kollegin an, sodass immer eine erholte und motivierte Betreuungskraft bei Ihnen ist. Der Wechsel wird von Primundus organisiert – Sie müssen sich um nichts kümmern. In den meisten Fällen werden Ihnen 2-3 feste Pflegekräfte zugeordnet, die sich im Wechsel um die Betreuung kümmern. So entsteht Vertrauen und Kontinuität."

---

## SEITE 4: Ihre Vorteile mit Primundus

### Warum Primundus?

**✓ Bestpreis-Garantie**
Wir garantieren Ihnen den besten Preis für die vereinbarte Leistung. Finden Sie ein vergleichbares Angebot günstiger, passen wir unseren Preis an. Diese Kalkulation ist 14 Tage für Sie reserviert.

**✓ Sie zahlen erst, wenn die Pflegekraft arbeitet**
Kein finanzielles Risiko. Keine Vorauszahlung, keine Anzahlung, keine Kaution. Erst wenn die Betreuungskraft bei Ihnen eingezogen ist und die Arbeit aufnimmt, beginnt die Abrechnung.

**✓ Täglich kündbar – keine Mindestlaufzeit**
Sie sind an keinen langfristigen Vertrag gebunden. Wenn Sie nicht zufrieden sind oder sich Ihre Situation ändert, können Sie täglich kündigen. Die Abrechnung erfolgt taggenau – Sie zahlen nur für tatsächlich geleistete Tage.

**✓ Direktanbieter – keine Vermittlung**
Primundus ist kein Vermittler. Unsere Pflegekräfte sind direkt bei uns angestellt. Wir bilden sie selbst aus und weiter, führen einen 6-Punkte-Qualitätscheck durch und achten auf einwandfreie Referenzen und gute Deutschkenntnisse.

**✓ Testsieger & Service-Champion**
Ausgezeichnet als Testsieger durch DIE WELT (2021) und als Service-Champion für höchste Kundenzufriedenheit. 4,98 von 5 Sternen auf ProvenExpert.

**✓ 20+ Jahre Erfahrung – 10.000+ Einsätze**
Seit über 20 Jahren betreuen wir Pflegebedürftige in ganz Deutschland. Aus dieser Erfahrung haben wir unsere Abläufe, Qualitätsstandards und den persönlichen Service entwickelt, der Primundus auszeichnet.

### So einfach geht's – Ihr Weg zur Betreuung

```
Schritt 1: Angebot anfordern
   Sie haben diesen Schritt bereits gemacht. Ihre Kalkulation
   liegt vor Ihnen.

Schritt 2: Persönliche Beratung
   Ein Primundus-Berater bespricht mit Ihnen alle Details
   und beantwortet Ihre Fragen.

Schritt 3: Pflegekraft auswählen
   Sie erhalten 2-3 passende Personalvorschläge und wählen
   die Betreuungskraft, die am besten zu Ihnen passt.

Schritt 4: Betreuung beginnt
   Die Pflegekraft reist an (in der Regel innerhalb von
   5 Werktagen) und die Betreuung beginnt.
```

### Jetzt beauftragen

Prominenter CTA-Block:

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Bereit für den nächsten Schritt?                        ║
║                                                           ║
║   Beauftragen Sie Ihre 24h-Pflege jetzt online –          ║
║   einfach und in wenigen Minuten:                         ║
║                                                           ║
║   → [VERTRAGS-LINK MIT TOKEN]                             ║
║                                                           ║
║   Oder rufen Sie uns an:                                  ║
║   ☎ [TELEFONNUMMER] (Mo-Fr 8-18 Uhr)                     ║
║                                                           ║
║   ✓ Sie zahlen erst, wenn die Pflegekraft arbeitet        ║
║   ✓ Täglich kündbar – taggenaue Abrechnung                ║
║   ✓ Bestpreis-Garantie – 14 Tage reserviert               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## FOOTER (auf jeder Seite)

```
Primundus GmbH | [Adresse] | [Telefon] | [E-Mail] | www.primundus.de
Diese Kalkulation ist 14 Tage gültig (Bestpreis-Garantie bis [DATUM]).
Alle Angaben sind Richtwerte. Das endgültige Angebot kann je nach individueller Situation abweichen.
Bitte beachten Sie: Leistungen der Pflegekasse müssen bei der zuständigen Kasse beantragt und genehmigt werden.
```

---

## WICHTIG: Korrekte Eigenanteil-Berechnung

NUR diese drei Zuschüsse vom Bruttopreis abziehen:
1. **Pflegegeld** (monatlich)
2. **Verhinderungspflege** (Jahresbetrag ÷ 12)
3. **Steuervorteil** (MIN(Bruttopreis × 12 × 0.20, 4000) ÷ 12)

NICHT abziehen (nur informativ zeigen):
- Entlastungsbetrag (zweckgebunden)
- Kurzzeitpflege (Jahresbudget, nicht monatlich anrechenbar)
- Wohnraumanpassung (einmalig)
- Pflegehilfsmittel (zweckgebunden, separate Abrechnung)
- Hilfe zur Pflege (individuell, Sozialamt)

## TECHNISCH
- Verwende jspdf (NICHT pdfkit) – keine externen Font-Dateien
- PDF-Name: Primundus_Kalkulation_[DATUM].pdf
- Saubere Sans-Serif Schrift
- Primundus-Farben als Akzente
- Viel Weißraum, professionelles Layout
- Eigenanteil-Betrag visuell hervorgehoben
