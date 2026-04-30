/*
  # Setup Cron Job for Scheduled Emails
  
  This migration:
  1. Enables pg_cron and pg_net extensions
  2. Creates a cron job that runs every 5 minutes
  3. The job calls the send-scheduled-emails Edge Function
  
  The Edge Function will:
  - Check for pending emails that are due
  - Send them via SMTP
  - Update their status in the database
*/

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

SELECT cron.schedule(
  'send-scheduled-emails',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := (SELECT COALESCE(
      (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url' LIMIT 1),
      current_setting('app.settings.supabase_url', true)
    ) || '/functions/v1/send-scheduled-emails'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(
        (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_service_role_key' LIMIT 1),
        current_setting('app.settings.service_role_key', true)
      )
    ),
    body := '{}'::jsonb
  );
  $$
);
