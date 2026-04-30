#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env manuell laden
const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Fehlende Umgebungsvariablen');
  console.error('supabaseUrl:', supabaseUrl);
  console.error('supabaseKey:', supabaseKey ? 'vorhanden' : 'fehlt');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function berechnePreis(formularDaten) {
  const { data: basisData } = await supabase
    .from('pricing_config')
    .select('aufschlag_euro')
    .eq('kategorie', 'basis')
    .eq('aktiv', true)
    .maybeSingle();

  let bruttopreis = basisData?.aufschlag_euro || 2300;

  const kategorien = [
    { kat: 'betreuung_fuer', antwort: formularDaten.betreuung_fuer },
    { kat: 'pflegegrad', antwort: formularDaten.pflegegrad?.toString() },
    { kat: 'weitere_personen', antwort: formularDaten.weitere_personen },
    { kat: 'mobilitaet', antwort: formularDaten.mobilitaet },
    { kat: 'nachteinsaetze', antwort: formularDaten.nachteinsaetze },
    { kat: 'deutschkenntnisse', antwort: formularDaten.deutschkenntnisse },
    { kat: 'erfahrung', antwort: formularDaten.erfahrung },
    ...(formularDaten.fuehrerschein ? [{ kat: 'fuehrerschein', antwort: formularDaten.fuehrerschein }] : []),
    ...(formularDaten.geschlecht ? [{ kat: 'geschlecht', antwort: formularDaten.geschlecht }] : []),
  ];

  const aufschluesselung = [];

  for (const { kat, antwort } of kategorien) {
    if (!antwort) continue;

    const { data: config } = await supabase
      .from('pricing_config')
      .select('*')
      .eq('kategorie', kat)
      .eq('antwort_key', antwort)
      .eq('aktiv', true)
      .maybeSingle();

    if (config) {
      bruttopreis += config.aufschlag_euro;
      aufschluesselung.push({
        kategorie: kat,
        antwort: antwort,
        label: config.antwort_label,
        aufschlag: config.aufschlag_euro,
      });
    }
  }

  const zuschüsse = await berechneZuschüsse(formularDaten, bruttopreis);
  const eigenanteil = Math.max(0, bruttopreis - zuschüsse.gesamt);

  return {
    bruttopreis,
    zuschüsse,
    eigenanteil,
    aufschluesselung,
    formularDaten,
    pflegegradUsed: formularDaten.pflegegrad?.toString(),
  };
}

async function berechneZuschüsse(formularDaten, bruttopreis) {
  const zuschüsse = [];

  const { data: alleSubsidies } = await supabase
    .from('subsidies_config')
    .select('*')
    .eq('aktiv', true)
    .order('sortierung');

  if (!alleSubsidies) return { items: [], gesamt: 0 };

  for (const subsidy of alleSubsidies) {
    if (subsidy.name === 'steuervorteil') {
      const { data: value } = await supabase
        .from('subsidies_values')
        .select('*')
        .eq('subsidy_id', subsidy.id)
        .eq('aktiv', true)
        .maybeSingle();

      if (value && value.betrag_typ === 'prozent_vom_brutto') {
        const jaehrlich = Math.min(bruttopreis * 12 * (value.betrag / 100), 4000);
        const monatlich = Math.round((jaehrlich / 12) * 100) / 100;

        zuschüsse.push({
          name: subsidy.name,
          label: subsidy.label,
          beschreibung: subsidy.beschreibung || '',
          betrag_monatlich: monatlich,
          betrag_jaehrlich: jaehrlich,
          typ: subsidy.typ,
          hinweis: value.hinweis,
        });
      }
    } else if (subsidy.name === 'pflegegeld') {
      const pflegegrad = formularDaten.pflegegrad;
      if (pflegegrad >= 2) {
        const { data: value } = await supabase
          .from('subsidies_values')
          .select('*')
          .eq('subsidy_id', subsidy.id)
          .eq('bedingung_key', 'pflegegrad')
          .eq('bedingung_value', pflegegrad.toString())
          .eq('aktiv', true)
          .maybeSingle();

        if (value && value.betrag > 0) {
          zuschüsse.push({
            name: subsidy.name,
            label: subsidy.label,
            beschreibung: subsidy.beschreibung || '',
            betrag_monatlich: value.betrag,
            betrag_jaehrlich: value.betrag * 12,
            typ: subsidy.typ,
            pflegegrad: pflegegrad,
            hinweis: value.hinweis,
          });
        }
      }
    } else if (subsidy.name === 'entlastungsbudget_neu') {
      const pflegegrad = formularDaten.pflegegrad;
      if (pflegegrad >= 2) {
        const { data: value } = await supabase
          .from('subsidies_values')
          .select('*')
          .eq('subsidy_id', subsidy.id)
          .eq('bedingung_key', 'pflegegrad')
          .eq('bedingung_value', pflegegrad.toString())
          .eq('aktiv', true)
          .maybeSingle();

        if (value && value.betrag > 0) {
          const monatlich = Math.round((value.betrag / 12) * 100) / 100;
          zuschüsse.push({
            name: subsidy.name,
            label: subsidy.label,
            beschreibung: subsidy.beschreibung || '',
            betrag_monatlich: monatlich,
            betrag_jaehrlich: value.betrag,
            typ: subsidy.typ,
            hinweis: value.hinweis,
          });
        }
      }
    }
  }

  const gesamt = zuschüsse.reduce((sum, z) => sum + z.betrag_monatlich, 0);
  return { items: zuschüsse, gesamt };
}

async function recalculateAllLeads() {
  console.log('🔄 Starte Neuberechnung aller Lead-Kalkulationen...\n');

  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, kalkulation')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Fehler beim Laden der Leads:', error);
    return;
  }

  console.log(`📊 Gefunden: ${leads.length} Leads\n`);

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const lead of leads) {
    try {
      const oldKalkulation = lead.kalkulation;

      if (!oldKalkulation || !oldKalkulation.formularDaten) {
        console.log(`⏭️  Lead ${lead.id}: Keine formularDaten vorhanden - übersprungen`);
        skippedCount++;
        continue;
      }

      const formularDaten = oldKalkulation.formularDaten;
      const newKalkulation = await berechnePreis(formularDaten);

      const { error: updateError } = await supabase
        .from('leads')
        .update({ kalkulation: newKalkulation })
        .eq('id', lead.id);

      if (updateError) {
        console.error(`❌ Lead ${lead.id}: Fehler beim Update:`, updateError.message);
        errorCount++;
      } else {
        console.log(`✅ Lead ${lead.id}: Aktualisiert (${oldKalkulation.bruttopreis}€ → ${newKalkulation.bruttopreis}€)`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Lead ${lead.id}: Fehler:`, err.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📈 Zusammenfassung:');
  console.log(`   ✅ Erfolgreich: ${successCount}`);
  console.log(`   ❌ Fehler: ${errorCount}`);
  console.log(`   ⏭️  Übersprungen: ${skippedCount}`);
  console.log(`   📊 Gesamt: ${leads.length}`);
  console.log('='.repeat(50));
}

recalculateAllLeads();
