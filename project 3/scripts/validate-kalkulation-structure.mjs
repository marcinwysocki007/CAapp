import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function isOldFormat(kal) {
  return 'totalGross' in kal || 'taxBenefit' in kal || 'pflegegeld' in kal;
}

function normalizeData(kal) {
  if (isOldFormat(kal)) {
    console.log('→ Alte Kalkulations-Struktur erkannt');
    const eigenanteil = kal.eigenanteil || 0;
    const totalGross = kal.totalGross || 0;
    const zuschuesseGesamt = Math.max(0, totalGross - eigenanteil);

    const items = [];
    if (kal.pflegegeld && kal.pflegegeld > 0) {
      items.push({
        label: `Pflegegeld Pflegegrad ${kal.pflegegradUsed || ''}`,
        beschreibung: 'Pflegegeld der Pflegekasse',
        betrag_monatlich: kal.pflegegeld,
        in_kalkulation: true,
      });
    }
    if (kal.taxBenefit && kal.taxBenefit > 0) {
      items.push({
        label: 'Steuervorteil',
        beschreibung: 'Steuerliche Absetzbarkeit',
        betrag_monatlich: kal.taxBenefit,
        in_kalkulation: true,
      });
    }

    return {
      bruttopreis: totalGross,
      eigenanteil,
      zuschüsse: {
        items,
        gesamt: zuschuesseGesamt,
      },
      aufschluesselung: [],
    };
  }

  console.log('→ Neue Kalkulations-Struktur erkannt');
  return {
    bruttopreis: kal.bruttopreis || 0,
    eigenanteil: kal.eigenanteil || 0,
    zuschüsse: kal.zuschüsse || { items: [], gesamt: 0 },
    aufschluesselung: kal.aufschluesselung || [],
  };
}

async function validate() {
  console.log('=== Validierung Kalkulations-Struktur ===\n');

  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, email, vorname, kalkulation')
    .not('kalkulation', 'is', null)
    .limit(5);

  if (error) {
    console.error('❌ Fehler beim Abrufen der Leads:', error);
    process.exit(1);
  }

  if (!leads || leads.length === 0) {
    console.log('❌ Keine Leads mit Kalkulation gefunden');
    process.exit(1);
  }

  console.log(`✓ ${leads.length} Lead(s) mit Kalkulation gefunden\n`);

  let allValid = true;

  for (const lead of leads) {
    console.log(`\n--- Lead ${lead.id.substring(0, 8)} ---`);
    console.log('Email:', lead.email);
    console.log('Vorname:', lead.vorname || '(nicht gesetzt)');

    try {
      const normalized = normalizeData(lead.kalkulation);

      console.log('✓ Normalisierung erfolgreich');
      console.log('  Bruttopreis:', normalized.bruttopreis, '€');
      console.log('  Eigenanteil:', normalized.eigenanteil, '€');
      console.log('  Zuschüsse gesamt:', normalized.zuschüsse.gesamt, '€');
      console.log('  Anzahl Zuschuss-Items:', normalized.zuschüsse.items.length);
      console.log('  Anzahl Aufschlüsselungen:', normalized.aufschluesselung.length);

      // Validierung
      if (typeof normalized.bruttopreis !== 'number') {
        console.error('  ❌ bruttopreis ist kein Number');
        allValid = false;
      }
      if (typeof normalized.eigenanteil !== 'number') {
        console.error('  ❌ eigenanteil ist kein Number');
        allValid = false;
      }
      if (!normalized.zuschüsse || !Array.isArray(normalized.zuschüsse.items)) {
        console.error('  ❌ zuschüsse.items ist kein Array');
        allValid = false;
      }
    } catch (err) {
      console.error('❌ Fehler bei Normalisierung:', err.message);
      allValid = false;
    }
  }

  if (allValid) {
    console.log('\n\n=== ALLE VALIDIERUNGEN ERFOLGREICH ===');
    process.exit(0);
  } else {
    console.log('\n\n=== FEHLER BEI VALIDIERUNG ===');
    process.exit(1);
  }
}

validate();
