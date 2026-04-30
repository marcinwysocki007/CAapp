import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { createClient } from '@supabase/supabase-js';
import { KalkulationPDFDocument } from '../lib/pdf-template.tsx';
import { writeFile } from 'fs/promises';

const supabase = createClient(
  'https://ogxnfjmgfnchfbrdsmor.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9neG5mam1nZm5jaGZicmRzbW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4ODc3MjksImV4cCI6MjA4NjQ2MzcyOX0.xrPwdwZn_OvotZSpaL0Bp97l-Sd2opplLy3HBIVtoj0'
);

async function testPDFGeneration() {
  console.log('=== Direkter PDF-Generierungstest ===\n');

  // Hole Lead mit alter Struktur
  const { data: leadAlt, error: errorAlt } = await supabase
    .from('leads')
    .select('id, email, vorname, nachname, kalkulation')
    .eq('id', 'b052addd-4409-426b-a198-98550e67e965')
    .maybeSingle();

  if (errorAlt || !leadAlt) {
    console.error('❌ Lead mit alter Struktur nicht gefunden');
    return false;
  }

  console.log('Test 1: Lead mit ALTER Kalkulations-Struktur');
  console.log('  ID:', leadAlt.id.substring(0, 8));
  console.log('  Email:', leadAlt.email);
  console.log('  Kalkulation:', JSON.stringify(leadAlt.kalkulation, null, 2));

  try {
    const leadData = {
      vorname: leadAlt.vorname,
      nachname: leadAlt.nachname,
      email: leadAlt.email,
    };

    console.log('\n→ Generiere PDF...');
    const doc = KalkulationPDFDocument({ kalkulation: leadAlt.kalkulation, leadData });
    const stream = await renderToStream(doc);

    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    console.log('✓ PDF generiert:', buffer.length, 'bytes');

    // Speichere zur Überprüfung
    await writeFile('/tmp/test-old-format.pdf', buffer);
    console.log('✓ PDF gespeichert: /tmp/test-old-format.pdf\n');
  } catch (err) {
    console.error('❌ Fehler bei alter Struktur:', err);
    console.error(err.stack);
    return false;
  }

  // Hole Lead mit neuer Struktur
  const { data: leadNeu, error: errorNeu } = await supabase
    .from('leads')
    .select('id, email, vorname, nachname, kalkulation')
    .eq('id', 'a0191a0e-3d8a-4f82-b1a6-c48b96b4195d')
    .maybeSingle();

  if (errorNeu || !leadNeu) {
    console.error('❌ Lead mit neuer Struktur nicht gefunden');
    return false;
  }

  console.log('Test 2: Lead mit NEUER Kalkulations-Struktur');
  console.log('  ID:', leadNeu.id.substring(0, 8));
  console.log('  Email:', leadNeu.email);

  try {
    const leadData = {
      vorname: leadNeu.vorname,
      nachname: leadNeu.nachname,
      email: leadNeu.email,
    };

    console.log('\n→ Generiere PDF...');
    const doc = KalkulationPDFDocument({ kalkulation: leadNeu.kalkulation, leadData });
    const stream = await renderToStream(doc);

    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    console.log('✓ PDF generiert:', buffer.length, 'bytes');

    await writeFile('/tmp/test-new-format.pdf', buffer);
    console.log('✓ PDF gespeichert: /tmp/test-new-format.pdf\n');
  } catch (err) {
    console.error('❌ Fehler bei neuer Struktur:', err);
    console.error(err.stack);
    return false;
  }

  console.log('\n=== BEIDE TESTS ERFOLGREICH ===');
  console.log('\nGenerierte PDFs:');
  console.log('  - /tmp/test-old-format.pdf (alte Struktur)');
  console.log('  - /tmp/test-new-format.pdf (neue Struktur)');
  return true;
}

testPDFGeneration().then(success => {
  process.exit(success ? 0 : 1);
});
