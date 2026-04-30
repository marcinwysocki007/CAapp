#!/bin/bash

# Test-Script für PDF-Generierung
echo "=== PDF-Route Test ==="
echo ""

# Hole den ersten Lead mit Kalkulation
LEAD_ID=$(NEXT_PUBLIC_SUPABASE_URL=https://ogxnfjmgfnchfbrdsmor.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9neG5mam1nZm5jaGZicmRzbW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4ODc3MjksImV4cCI6MjA4NjQ2MzcyOX0.xrPwdwZn_OvotZSpaL0Bp97l-Sd2opplLy3HBIVtoj0 \
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
supabase.from('leads').select('id').not('kalkulation', 'is', null).limit(1).maybeSingle().then(({ data }) => {
  if (data) console.log(data.id);
});
")

if [ -z "$LEAD_ID" ]; then
  echo "❌ Kein Lead mit Kalkulation gefunden"
  exit 1
fi

echo "✓ Lead-ID: $LEAD_ID"
echo ""
echo "Die PDF kann jetzt getestet werden unter:"
echo "http://localhost:3000/api/pdf/kalkulation/$LEAD_ID"
echo ""
echo "Oder im Admin-Bereich:"
echo "http://localhost:3000/admin/leads/$LEAD_ID"
