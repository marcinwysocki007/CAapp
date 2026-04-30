import { createClient } from '@supabase/supabase-js';
import { writeFile } from 'fs/promises';

const supabase = createClient(
  'https://ogxnfjmgfnchfbrdsmor.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9neG5mam1nZm5jaGZicmRzbW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4ODc3MjksImV4cCI6MjA4NjQ2MzcyOX0.xrPwdwZn_OvotZSpaL0Bp97l-Sd2opplLy3HBIVtoj0'
);

async function test() {
  console.log('Hole ersten Lead mit Kalkulation...');

  const { data: lead } = await supabase
    .from('leads')
    .select('id')
    .not('kalkulation', 'is', null)
    .limit(1)
    .maybeSingle();

  if (!lead) {
    console.error('Kein Lead gefunden');
    process.exit(1);
  }

  console.log('Lead ID:', lead.id);
  console.log('\nVersuche PDF abzurufen von: http://localhost:3000/api/pdf/kalkulation/' + lead.id);
  console.log('\n--- Request ---');

  try {
    const response = await fetch(`http://localhost:3000/api/pdf/kalkulation/${lead.id}`);

    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/pdf')) {
      const buffer = await response.arrayBuffer();
      const pdfBuffer = Buffer.from(buffer);
      await writeFile('/tmp/test.pdf', pdfBuffer);
      console.log('\n✓ PDF erfolgreich! Gespeichert in /tmp/test.pdf');
      console.log('Größe:', pdfBuffer.length, 'bytes');
      process.exit(0);
    } else if (contentType && contentType.includes('application/json')) {
      const json = await response.json();
      console.log('\n❌ JSON Response (Fehler):');
      console.log(JSON.stringify(json, null, 2));
      process.exit(1);
    } else {
      const text = await response.text();
      console.log('\n❌ Text Response:');
      console.log(text.substring(0, 1000));
      process.exit(1);
    }
  } catch (err) {
    console.error('\n❌ Fetch Error:', err.message);
    console.log('\nIst der Dev-Server aktiv? Starte: npm run dev');
    process.exit(1);
  }
}

test();
