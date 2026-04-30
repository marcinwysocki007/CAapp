import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { createClient } from '@supabase/supabase-js';
import { KalkulationPDFDocument } from '../lib/pdf-template.tsx';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testPDF() {
  console.log('=== PDF-Generierungstest ===\n');

  const { data: lead, error } = await supabase
    .from('leads')
    .select('id, email, vorname, nachname, kalkulation')
    .not('kalkulation', 'is', null)
    .limit(1)
    .maybeSingle();

  if (error || !lead) {
    console.error('❌ Kein Lead gefunden:', error);
    return;
  }

  console.log('✓ Lead gefunden:', lead.id);
  console.log('✓ Email:', lead.email);
  console.log('✓ Vorname:', lead.vorname || '(nicht gesetzt)');
  console.log('\n--- Kalkulation-Daten ---');
  console.log(JSON.stringify(lead.kalkulation, null, 2));

  const leadData = {
    vorname: lead.vorname,
    nachname: lead.nachname,
    email: lead.email,
  };

  try {
    console.log('\n--- Teste PDF-Generierung ---');
    const doc = KalkulationPDFDocument({ kalkulation: lead.kalkulation, leadData });
    const stream = await renderToStream(doc);

    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    console.log('✓ PDF erfolgreich generiert!');
    console.log('✓ Größe:', buffer.length, 'bytes');

    if (buffer.length > 0) {
      console.log('✓ PDF-Inhalt vorhanden');
      console.log('\n=== TEST ERFOLGREICH ===');
      process.exit(0);
    } else {
      console.error('❌ PDF ist leer');
      process.exit(1);
    }
  } catch (err) {
    console.error('\n❌ Fehler bei PDF-Generierung:');
    console.error(err);
    process.exit(1);
  }
}

testPDF();
