#!/usr/bin/env node

/**
 * Test script for /api/angebot-anfordern endpoint
 */

const API_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const testData = {
  vorname: 'Max',
  email: 'max.mustermann@example.com',
  telefon: '+49 123 456789',
  kalkulation: {
    gesamtkosten: 2450,
    zuschussAktiv: true,
    pflegekraft: {
      kosten: 1800,
      gehalt: 1500,
      reisekosten: 200,
      versicherung: 100
    },
    extras: [
      { name: 'Deutschkenntnisse', preis: 150 },
      { name: 'Führerschein', preis: 100 }
    ],
    zuschuss: {
      pflegegeld: 450,
      entlastungsbudget: 125,
      gesamt: 575
    },
    eigenanteil: 1875
  }
};

async function testAngebotsAPI() {
  console.log('Testing /api/angebot-anfordern endpoint...');
  console.log('API URL:', `${API_URL}/api/angebot-anfordern`);
  console.log('\nTest Data:', JSON.stringify(testData, null, 2));

  try {
    const response = await fetch(`${API_URL}/api/angebot-anfordern`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('\nResponse Status:', response.status);
    console.log('Response OK:', response.ok);

    const data = await response.json();
    console.log('\nResponse Data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ SUCCESS!');
      console.log('Lead ID:', data.leadId);
      console.log('Email Sent:', data.emailSent);
    } else {
      console.log('\n❌ FAILED!');
      console.log('Error:', data.error);
      console.log('Details:', data.details);
    }
  } catch (error) {
    console.error('\n❌ REQUEST FAILED:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAngebotsAPI();
