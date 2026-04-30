#!/usr/bin/env node

/**
 * Direct test of angebot-anfordern API endpoint
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ycdwtrklpoqprabtwahi.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljZHd0cmtscG9xcHJhYnR3YWhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQyNDAxOSwiZXhwIjoyMDg3MDAwMDE5fQ.6pT1jCJDUQYhTKb5lJjYzYXn1fL4EUzO7tYKKZVKLCY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('=== Testing Supabase Connection ===\n');

// Test 1: Check if we can connect to Supabase
try {
  const { data, error } = await supabase.from('leads').select('count').limit(1);
  if (error) {
    console.error('❌ Supabase connection failed:', error.message);
    process.exit(1);
  }
  console.log('✅ Supabase connection successful\n');
} catch (err) {
  console.error('❌ Supabase connection error:', err.message);
  process.exit(1);
}

// Test 2: Try to create a test lead
console.log('=== Creating Test Lead ===\n');

const testEmail = `test-${Date.now()}@example.com`;
const testData = {
  email: testEmail,
  vorname: 'Test User',
  telefon: '+49 123 456789',
  status: 'angebot_requested',
  source: 'rechner',
  kalkulation: {
    eigenanteil: 2450,
    gesamtkosten: 3500,
    pflegekraft: {
      kosten: 1800,
      gehalt: 1500
    },
    zuschuss: {
      pflegegeld: 450,
      gesamt: 450
    }
  }
};

console.log('Test data:', JSON.stringify(testData, null, 2));

try {
  const { data: newLead, error } = await supabase
    .from('leads')
    .insert(testData)
    .select()
    .maybeSingle();

  if (error) {
    console.error('\n❌ Lead creation failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }

  if (!newLead) {
    console.error('\n❌ Lead was not created (null returned)');
    process.exit(1);
  }

  console.log('\n✅ Lead created successfully!');
  console.log('Lead ID:', newLead.id);
  console.log('Email:', newLead.email);
  console.log('Status:', newLead.status);

  // Clean up
  console.log('\n=== Cleaning up test lead ===');
  await supabase.from('leads').delete().eq('id', newLead.id);
  console.log('✅ Test lead deleted\n');

} catch (err) {
  console.error('\n❌ Unexpected error:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
}

console.log('=== All tests passed! ===');
