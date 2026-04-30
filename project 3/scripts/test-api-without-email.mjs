const testPayload = {
  email: 'test-' + Date.now() + '@example.com',
  kalkulation: {
    totalGross: 2500,
    eigenanteil: 1700,
    zuschüsse: {
      gesamt: 800,
      pflegegeld: 545,
      entlastungsbudget: 125,
    },
  },
  formularDaten: {
    pflegegrad: '3',
    patientCount: '1-person',
    mobility: 'mobil',
    nightCare: 'nein',
    germanLevel: 'grundlegend',
    experience: 'einsteiger',
    householdOthers: 'nein',
  },
};

console.log('🧪 Teste API ohne E-Mail-Versand...\n');
console.log('Test-E-Mail:', testPayload.email);

const startTime = Date.now();

try {
  const response = await fetch('http://localhost:3000/api/kalkulation-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testPayload),
  });

  const duration = Date.now() - startTime;
  console.log(`\n⏱️  Antwort nach ${duration}ms`);
  console.log('Status:', response.status, response.statusText);

  const data = await response.json();
  console.log('\n📦 Response:');
  console.log(JSON.stringify(data, null, 2));

  if (response.ok) {
    console.log('\n✅ Test erfolgreich!');
    console.log('Lead ID:', data.leadId);
    console.log('Neu:', data.isNew);
    console.log('E-Mail gesendet:', data.emailSent);
  } else {
    console.error('\n❌ Test fehlgeschlagen!');
  }
} catch (error) {
  console.error('\n❌ Fehler:', error.message);
}
