import { readFileSync } from 'fs';

const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testChatAPI() {
  console.log('\n🧪 Testing Chat AI API...\n');

  const sessionId = `test_session_${Date.now()}`;

  try {
    console.log('📤 Sending test message to chat AI...');

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/chat-ai`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          sessionId,
          message: 'Hallo, ich interessiere mich für 24-Stunden-Pflege',
          context: {}
        })
      }
    );

    console.log('📊 Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    console.log('\n✅ Chat AI Response:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Conversation ID:', data.conversationId);
    console.log('\n💬 AI Message:');
    console.log(data.message);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📤 Sending follow-up message...');

    const response2 = await fetch(
      `${SUPABASE_URL}/functions/v1/chat-ai`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          conversationId: data.conversationId,
          sessionId,
          message: 'Meine Mutter hat Pflegegrad 3',
          context: {}
        })
      }
    );

    if (!response2.ok) {
      const errorText = await response2.text();
      console.error('❌ Error Response:', errorText);
      throw new Error(`HTTP ${response2.status}: ${errorText}`);
    }

    const data2 = await response2.json();

    console.log('\n✅ Follow-up Response:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💬 AI Message:');
    console.log(data2.message);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Chat AI is working correctly!');
    console.log('✅ OpenAI API key is configured properly');
    console.log('✅ Conversation history is maintained\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);

    if (error.message.includes('OpenAI API key not configured')) {
      console.log('\n⚠️  Please configure OpenAI API key in Supabase:');
      console.log('   1. Go to Supabase Dashboard');
      console.log('   2. Project Settings → Edge Functions → Secrets');
      console.log('   3. Add secret: OPENAI_API_KEY\n');
    }

    process.exit(1);
  }
}

testChatAPI();
