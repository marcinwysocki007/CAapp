const { createClient } = require('@supabase/supabase-js');
const fetch = require('node:fetch');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testPDF() {
  console.log('Suche Lead mit Kalkulation...');

  const { data: lead, error } = await supabase
    .from('leads')
    .select('id, email, vorname, kalkulation')
    .not('kalkulation', 'is', null)
    .limit(1)
    .maybeSingle();

  if (error || !lead) {
    console.error('Kein Lead gefunden:', error);
    return;
  }

  console.log('Lead gefunden:', lead.id);
  console.log('Kalkulation:', JSON.stringify(lead.kalkulation, null, 2));

  console.log('\nTeste PDF-Generierung...');
  const url = `http://localhost:3000/api/pdf/kalkulation/${lead.id}`;

  try {
    const response = await fetch(url);
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/pdf')) {
        console.log('✓ PDF wurde erfolgreich generiert!');
      } else {
        const text = await response.text();
        console.log('Antwort:', text.substring(0, 500));
      }
    } else {
      const text = await response.text();
      console.error('Fehler:', text);
    }
  } catch (err) {
    console.error('Fetch-Fehler:', err.message);
  }
}

testPDF();
