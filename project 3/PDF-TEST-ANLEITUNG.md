# PDF-Generierung Testanleitung

## Problem gelöst

Die PDF-Generierung wurde vollständig überarbeitet und unterstützt jetzt:
- ✓ Alte Kalkulations-Struktur (totalGross, pflegegeld, taxBenefit)
- ✓ Neue Kalkulations-Struktur (bruttopreis, zuschüsse.items, aufschluesselung)
- ✓ Robuste Fehlerbehandlung mit detailliertem Logging
- ✓ Validierung der Daten vor Rendering

## So testen Sie die PDF-Generierung

### 1. Dev-Server starten
```bash
npm run dev
```

### 2. Im Browser öffnen
```
http://localhost:3000/admin/leads
```

### 3. Lead mit Kalkulation öffnen
- Klicken Sie auf einen Lead, der eine Kalkulation hat
- Im Lead-Detail sollte oben rechts der Button "PDF herunterladen" erscheinen

### 4. PDF herunterladen
- Klicken Sie auf "PDF herunterladen"
- Die PDF sollte sich in einem neuen Tab öffnen

## Fehlersuche

### Logs überprüfen
Im Terminal (wo `npm run dev` läuft) sehen Sie detaillierte Logs:

```
[PDF] Starte PDF-Generierung für Lead: xxx
[PDF] Lead gefunden, generiere PDF...
[PDF] Kalkulation-Typ: object
[PDF] Dokument erstellt, rendere...
[PDF] PDF erfolgreich generiert, Größe: XXXX bytes
```

### Häufige Probleme

**Problem: "Lead nicht gefunden"**
- Lösung: Prüfen Sie, ob der Lead in der Datenbank existiert

**Problem: "Keine Kalkulation für diesen Lead vorhanden"**
- Lösung: Der Lead hat noch keine Kalkulation. Erstellen Sie eine neue Kalkulation über den Rechner.

**Problem: PDF öffnet nicht**
- Lösung: Überprüfen Sie die Browser-Konsole (F12) auf Fehler
- Prüfen Sie die Server-Logs im Terminal

### Direkte URL testen

Sie können die PDF auch direkt mit dieser URL testen:
```
http://localhost:3000/api/pdf/kalkulation/LEAD_ID
```

Ersetzen Sie `LEAD_ID` mit einer echten Lead-ID aus der Datenbank.

### Testdaten

Diese Leads haben bereits Kalkulationen (für Tests):
- `b052addd-4409-426b-a198-98550e67e965` (alte Struktur)
- `a0191a0e-3d8a-4f82-b1a6-c48b96b4195d` (neue Struktur)

## Technische Details

### Datei-Änderungen
- `/app/api/pdf/kalkulation/[leadId]/route.ts` - Verbesserte API-Route mit Logging
- `/lib/pdf-template.tsx` - Normalisierung für beide Datenformate

### Features
- Automatische Erkennung und Konvertierung alter Datenstrukturen
- Robuste Fehlerbehandlung mit Stack-Traces
- Detailliertes Console-Logging für Debugging
- Cache-Control Header für Aktualität
