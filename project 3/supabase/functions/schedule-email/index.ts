import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { lead_id, email_type, recipient_email, delay_minutes = 5 } = body;

    if (!lead_id || !email_type || !recipient_email) {
      return new Response(
        JSON.stringify({ error: "lead_id, email_type und recipient_email erforderlich" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase
      .from("scheduled_emails")
      .update({ status: "cancelled" })
      .eq("lead_id", lead_id)
      .eq("email_type", email_type)
      .eq("status", "pending");

    const scheduledFor = new Date(Date.now() + delay_minutes * 60 * 1000).toISOString();

    const { error: insertError } = await supabase
      .from("scheduled_emails")
      .insert({
        lead_id,
        email_type,
        recipient_email,
        scheduled_for: scheduledFor,
        status: "pending",
      });

    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, scheduled_for: scheduledFor }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
