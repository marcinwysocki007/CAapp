import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ogxnfjmgfnchfbrdsmor.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9neG5mam1nZm5jaGZicmRzbW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4ODc3MjksImV4cCI6MjA4NjQ2MzcyOX0.xrPwdwZn_OvotZSpaL0Bp97l-Sd2opplLy3HBIVtoj0'
);

async function testLivePDF() {
  console.log('=== Live PDF Test ===\n');

  const { data: lead, error } = await supabase
    .from('leads')
    .select('id, email, vorname')
    .not('kalkulation', 'is', null)
    .limit(1)
    .maybeSingle();

  if (error || !lead) {
    console.error('❌ Kein Lead gefunden');
    process.exit(1);
  }

  console.log('✓ Lead gefunden:', lead.id);
  console.log('  Email:', lead.email);

  const url = `http://localhost:3000/api/pdf/kalkulation/${lead.id}`;
  console.log('\n✓ PDF-URL:', url);
  console.log('\nTeste PDF-Abruf...\n');

  try {
    const response = await fetch(url);

    console.log('Status:', response.status, response.statusText);
    console.log('Content-Type:', response.headers.get('content-type'));
    console.log('Content-Length:', response.headers.get('content-length'));

    if (!response.ok) {
      const text = await response.text();
      console.error('\n❌ Fehler-Response:');
      console.error(text);
      process.exit(1);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/pdf')) {
      const buffer = await response.arrayBuffer();
      console.log('\n✓ PDF erfolgreich empfangen!');
      console.log('✓ Größe:', buffer.byteLength, 'bytes');
      console.log('\n=== TEST ERFOLGREICH ===');
    } else {
      console.error('\n❌ Falscher Content-Type');
      const text = await response.text();
      console.log('Response:', text.substring(0, 500));
      process.exit(1);
    }
  } catch (err) {
    console.error('\n❌ Fetch-Fehler:', err.message);
    process.exit(1);
  }
}

testLivePDF();
