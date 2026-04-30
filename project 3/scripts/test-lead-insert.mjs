import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ogxnfjmgfnchfbrdsmor.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9neG5mam1nZm5jaGZicmRzbW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4ODc3MjksImV4cCI6MjA4NjQ2MzcyOX0.xrPwdwZn_OvotZSpaL0Bp97l-Sd2opplLy3HBIVtoj0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🧪 Teste Lead-Insert mit ANON Key...\n');

const testData = {
  email: 'test-' + Date.now() + '@example.com',
  status: 'info_requested',
  source: 'rechner',
  kalkulation: {
    eigenanteil: 1700,
    totalGross: 2500,
  },
};

console.log('Test-Daten:', JSON.stringify(testData, null, 2));
console.log('\n📤 Versuche Insert...\n');

try {
  const { data, error } = await supabase
    .from('leads')
    .insert(testData)
    .select()
    .maybeSingle();

  if (error) {
    console.error('❌ Fehler beim Insert:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Details:', error.details);
    console.error('Hint:', error.hint);
  } else if (!data) {
    console.error('❌ Kein Fehler, aber auch keine Daten zurückgegeben (null)');
  } else {
    console.log('✅ Lead erfolgreich erstellt!');
    console.log('ID:', data.id);
    console.log('E-Mail:', data.email);
    console.log('Status:', data.status);
  }
} catch (error) {
  console.error('❌ Exception:', error);
}
